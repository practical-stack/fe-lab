---
title: "Sentry Fingerprint 패턴: 커스텀 에러로 이슈 그룹화를 제어하는 법"
description: "ErrorBase의 fingerPrint 속성과 extractFingerprint 로직을 활용하여 Sentry에서 동일 원인의 에러를 하나의 이슈로 자동 그룹화하는 패턴을 정리합니다."
type: pattern
tags: [TypeScript, Sentry, BestPractice]
order: 2
---

# Sentry Fingerprint 패턴: 커스텀 에러로 이슈 그룹화를 제어하는 법

> **목적**: [ErrorBase](./error-base-pattern.md)의 `fingerPrint` 속성을 Sentry와 연동하여, 동일 원인의 에러를 하나의 이슈로 자동 그룹화하는 전체 파이프라인을 구축한다.

---

## 목차

1. [해결하려는 문제](#1-해결하려는-문제)
2. [전체 데이터 흐름](#2-전체-데이터-흐름)
3. [extractFingerprint — 자동 추출 로직](#3-extractfingerprint--자동-추출-로직)
4. [sentryCaptureException — 직접 호출 경로](#4-sentrycaptureexception--직접-호출-경로)
5. [beforeSendForUnhandledError — 자동 감지 경로](#5-beforesendforunhandlederror--자동-감지-경로)
6. [URL 정규화](#6-url-정규화)
7. [구현 단계](#7-구현-단계)
8. [fingerPrint 설계 가이드](#8-fingerprint-설계-가이드)
9. [설계 원칙](#9-설계-원칙)
10. [실전 체크리스트](#10-실전-체크리스트)

---

## 1. 해결하려는 문제

Sentry의 기본 그룹화(스택 트레이스 기반)만으로는 같은 원인의 에러가 여러 이슈로 흩어지거나, 다른 원인의 에러가 하나의 이슈로 합쳐진다.

```
❌ 기본 그룹화의 문제
Sentry Issue #1: "핸들러를 찾을 수 없습니다" (handleBack + navigateToScreen 혼재)
Sentry Issue #2: "핸들러를 찾을 수 없습니다" (같은 에러인데 스택 트레이스가 달라서 분리)
```

```
✅ fingerprint 기반 그룹화
Sentry Issue #1: BridgeNotFoundError > handleBack (120 events)
Sentry Issue #2: BridgeNotFoundError > navigateToScreen (45 events)
Sentry Issue #3: FormRequiredDataError > step1 > accountId (19 events)
Sentry Issue #4: POST /v1/payment/confirm 500 (67 events)
```

| Before (기본 그룹화) | After (fingerprint 그룹화) |
|---------------------|--------------------------|
| 스택 트레이스 기반 → 같은 원인이 여러 이슈로 분산 | fingerprint 기반 → 같은 원인은 하나의 이슈로 수렴 |
| 에러 메시지가 동적이면 이슈 폭발 | 의미있는 식별자(인터페이스명, 스텝명)로 안정적 그룹화 |
| 모니터링 알림이 노이즈 | 이슈 하나 = 하나의 원인 → 알림이 의미 있음 |

---

## 2. 전체 데이터 흐름

```
에러 발생 지점
│
├── [경로 A] 직접 catch → sentryCaptureException(error)
│   │
│   ├── extractFingerprint(error)
│   │   ├── Axios 에러?  → [method, errorCode, normalizedUrl]
│   │   ├── ErrorBase?   → [error.name, ...error.fingerPrint]
│   │   └── 일반 Error?  → [error.name, error.message]
│   │
│   ├── getUniversalSentryTags(error)     → { appVersion, namespace, ... }
│   ├── getSentryAxiosErrorContext(error)  → { url, status, response, ... }
│   │
│   └── captureException(error, {
│         fingerprint,       ← 자동 추출 또는 호출 시 명시적 오버라이드
│         tags,
│         contexts,
│       })
│
├── [경로 B] unhandled 에러 (HttpClient integration, GlobalHandlers)
│   │
│   └── beforeSend(event, hint)
│       ├── event.tags.isPreProcessed? → 이미 처리됨, 스킵
│       └── 미처리 → extractFingerprint(hint.originalException)
│           └── event.fingerprint = fingerprint    ← 사후 할당
│
└── Sentry Server
    └── fingerprint 기반 이슈 그룹화
```

### 의존성

```jsonc
{
  // Sentry SDK
  "@sentry/nextjs": "^7.x",
  "@sentry/types": "^7.x",

  // HTTP 에러 판별
  "axios": "^1.x",

  // 유틸리티
  "remeda": "^1.x"   // isArray, isNullish, last
}
```

### 패키지 역할 관계

```
@your-org/error
  ├── ErrorBase                  : 모든 커스텀 에러의 기본 클래스 (fingerPrint 속성 보유)
  ├── isCustomDefinedError()     : ErrorBase 인스턴스 판별 (type guard)
  ├── isError()                  : Error 인스턴스 판별
  └── isAllowedError()           : Sentry 로깅 대상에서 제외할 에러 판별

@your-org/sentry
  ├── sentryCaptureException()   : [경로 A] 직접 호출 — fingerprint 자동 추출 + Sentry 전송
  ├── extractFingerprint()       : 에러 타입별 fingerprint 추출 (Axios/ErrorBase/Error)
  ├── beforeSendForUnhandledError() : [경로 B] unhandled 에러 — beforeSend 훅에서 fingerprint 사후 할당
  └── normalizeApiUrlForSentry() : API URL에서 동적 파라미터를 {param}으로 치환

@sentry/nextjs
  └── captureException()         : 최종 Sentry 서버 전송
```

---

## 3. extractFingerprint — 자동 추출 로직

에러 타입에 따라 적절한 fingerprint를 자동 생성한다. 3가지 분기:

```typescript
// extract-sentry-fingerprint.ts
import axios from 'axios';
import { isArray } from 'remeda';
import { getResponseErrorCode, isAxios401Error } from '@your-org/axios';
import { isCustomDefinedError, isError } from '@your-org/error';
import { normalizeApiUrlForSentry } from './normalize-api-url-for-sentry';

export const extractFingerprint = (error: unknown): string[] | undefined => {
  // 1. Axios 에러 → [method, statusCode, normalizedUrl]
  if (axios.isAxiosError(error)) {
    const { config } = error;

    if (isAxios401Error(error)) {
      return ['401']; // 401은 모두 하나의 이슈로 그룹화
    }
    const errorCode = getResponseErrorCode(error);
    const normalizedUrl = config?.url ? normalizeApiUrlForSentry(config?.url) : undefined;

    return [
      ...(config?.method ? [config.method] : []),
      ...(errorCode ? [errorCode] : []),
      ...(normalizedUrl ? [normalizedUrl] : []),
    ];
    // 예: ['post', '500', '/v1/loans/{param}']
  }

  // 2. ErrorBase 하위 에러 → [error.name, ...error.fingerPrint]
  if (isCustomDefinedError(error)) {
    if (isArray(error.fingerPrint)) {
      return [error.name, ...error.fingerPrint];
    }
    return [error.name]; // fingerPrint 미지정 시 에러명만
  }

  // 3. 일반 Error → [error.name, error.message]
  if (isError(error)) {
    return [error.name, error.message];
  }

  return undefined;
};
```

**핵심:**
- 분기 우선순위: Axios 에러 > ErrorBase > 일반 Error > undefined
- ErrorBase에 `fingerPrint`가 있으면 `[에러명, ...지정값]`, 없으면 `[에러명]`만
- Axios 에러는 URL을 정규화하여 동적 경로가 같은 이슈로 묶이도록

---

## 4. sentryCaptureException — 직접 호출 경로

에러를 Sentry에 전송하는 메인 함수. fingerprint를 자동 추출하되 호출 시 오버라이드 가능.

```typescript
// sentry-capture-exception.ts
import { captureException } from '@sentry/nextjs';
import type { ScopeContext } from '@sentry/types';

export const sentryCaptureException = (
  error: unknown,
  scopeContext?: Partial<ScopeContext>,
  options?: OptionsType
) => {
  if (isAllowedError(error as Error)) {
    return;
  }

  const fingerprint = extractFingerprint(error);
  const sentryTags = getUniversalSentryTags(error, options);
  const sentryAxiosErrorContext = getSentryAxiosErrorContext(error);
  const errorToSend = isAxiosError(error) ? new SentryAxiosError(error) : error;

  const eventId = captureException(errorToSend, {
    level: scopeContext?.level ?? 'error',
    fingerprint: scopeContext?.fingerprint ?? fingerprint, // ← 명시한 것 우선, 없으면 자동 추출
    tags: {
      ...scopeContext?.tags,
      ...sentryTags,
    },
    contexts: {
      ...scopeContext?.contexts,
      ...sentryAxiosErrorContext,
    },
  });
  return eventId;
};
```

**핵심:**
- `scopeContext?.fingerprint ?? fingerprint` — 호출 시 명시하면 우선, 아니면 자동 추출
- `isAllowedError` 체크로 의도된 에러(예: 리다이렉트용 에러)는 Sentry에 보내지 않음

---

## 5. beforeSendForUnhandledError — 자동 감지 경로

`sentryCaptureException`을 거치지 않고 Sentry가 자동으로 감지한 에러에 fingerprint를 사후 할당.

```typescript
// before-send-for-unhandled-error.ts
export const beforeSendForUnhandledError = (event: ErrorEvent, hint: EventHint): ErrorEvent => {
  // 이미 sentryCaptureException으로 처리된 에러는 스킵
  if (event.tags?.isPreProcessed) {
    return event;
  }

  if (isNullish(hint?.originalException)) {
    return event;
  }

  // 미처리 에러에 fingerprint 사후 할당
  const fingerprint = extractFingerprint(hint.originalException);
  if (fingerprint) {
    event.fingerprint = fingerprint;
  }

  const tags = getUniversalSentryTags(hint.originalException);
  if (tags) {
    event.tags = { ...event.tags, ...tags };
  }

  if (isAxiosError(hint.originalException)) {
    event.tags = { ...event.tags, isAxiosError: true };
    event.contexts = { ...event.contexts, ...getSentryAxiosErrorContext(hint.originalException) };
  }

  return event;
};
```

**핵심:**
- `isPreProcessed` 태그로 이중 처리 방지
- 두 경로(직접 호출 / 자동 감지) 모두 동일한 `extractFingerprint`를 사용하여 일관성 보장

---

## 6. URL 정규화

Axios 에러의 URL에서 동적 파라미터를 `{param}`으로 치환하여 같은 엔드포인트가 하나로 그룹화되도록 한다.

```typescript
// normalize-api-url-for-sentry.ts
// '/v1/loans/abc123/payments' → '/v1/loans/{param}/payments'
// '/v1/users/12345' → '/v1/users/{param}'
export const normalizeApiUrlForSentry = (url = '') => {
  return url.replace(
    new RegExp(
      `\/${versionPattern.source}(${numericPattern.source}|${alphanumericPattern.source}|${percentEncodingPattern.source})[^\/]*`,
      'g'
    ),
    '/{param}'
  );
};
```

---

## 7. 구현 단계

### Step 1: ErrorBase를 상속한 도메인 에러 클래스 정의

fingerPrint에 **이 에러를 구분하는 의미있는 식별자**를 지정한다.

```typescript
import { ErrorBase } from '@your-org/error';

export class BridgeNotFoundError extends ErrorBase {
  handlerName: string;

  constructor({ handlerName, callSignature }: BridgeNotFoundErrorOptions) {
    super(`${callSignature} 핸들러를 찾을 수 없습니다.`, {
      fingerPrint: [handlerName], // ← Sentry에서 핸들러명별로 그룹화
    });
    this.name = 'BridgeNotFoundError';
    this.handlerName = handlerName;
  }
}
```

### Step 2: catch 블록에서 sentryCaptureException 호출

```typescript
import { sentryCaptureException } from '@your-org/sentry';

try {
  await callBridgeHandler('handleBack');
} catch (error) {
  // 자동 fingerprint — ErrorBase 서브클래스면 error.fingerPrint 자동 추출
  sentryCaptureException(error);
}
```

또는 호출 시점에 **동적으로 fingerprint를 오버라이드**:

```typescript
try {
  await setupExternalSdk();
} catch (err) {
  sentryCaptureException(err, {
    fingerprint: ['ExternalSdk', 'SDK 설정 에러', sdkStatus],
  });
}
```

### Step 3: Sentry 초기화에서 beforeSend 등록

```typescript
// sentry.[env].config.ts
import { getDefaultSentryOptions } from '@your-org/sentry';

Sentry.init({
  ...getDefaultSentryOptions({ dsn, environment, release }),
  // getDefaultSentryOptions 내부에서 beforeSend: beforeSendForUnhandledError 등록
});
```

---

## 8. fingerPrint 설계 가이드

| 에러 유형 | fingerPrint 전략 | 예시 | Sentry 최종 fingerprint |
|-----------|-----------------|------|------------------------|
| **핸들러 미발견** | `[핸들러명]` | `['handleBack']` | `['BridgeNotFoundError', 'handleBack']` |
| **런타임 에러** | `[핸들러명, 에러메시지]` | `['navigateToScreen', 'bridge error']` | `['BridgeRuntimeError', 'navigateToScreen', 'bridge error']` |
| **폼 필수데이터 누락** | `[펀넬스텝, 데이터명]` | `['step1', 'accountId']` | `['FormRequiredDataError', 'step1', 'accountId']` |
| **Axios 5xx** | (자동) `[method, code, url]` | — | `['post', '500', '/v1/loans/{param}']` |
| **Axios 401** | (자동) `['401']` | — | `['401']` |

---

## 9. 설계 원칙

### 원칙 1: fingerPrint는 에러 클래스 생성자에서 결정

```
❌ catch 블록마다 fingerprint를 수동 지정
try { ... } catch (err) {
  sentryCaptureException(err, { fingerprint: ['BridgeNotFoundError', handlerName] });
}

✅ 에러 클래스 생성 시 fingerprint를 내장
class BridgeNotFoundError extends ErrorBase {
  constructor({ handlerName }) {
    super(message, { fingerPrint: [handlerName] });
  }
}
try { ... } catch (err) {
  sentryCaptureException(err);  // ← fingerprint 자동 추출
}
```

### 원칙 2: fingerPrint 요소는 안정적인 식별자

```
❌ 동적 값 포함
new ErrorBase(message, {
  fingerPrint: [Date.now().toString()]     // ← 매번 다른 값 → 이슈 무한 생성
  fingerPrint: [error.stack]               // ← 배포마다 달라짐
});

✅ 도메인 맥락에서 의미있는 안정적 식별자
new ErrorBase(message, {
  fingerPrint: [handlerName]               // 'handleBack' — 기능명
  fingerPrint: [funnelStep, requiredData]  // 'step1', 'accountId' — 비즈니스 단계 + 필드명
});
```

### 원칙 3: extractFingerprint는 단일 책임 — 두 경로가 공유

```
sentryCaptureException (직접 호출)
        │                                 beforeSendForUnhandledError (자동 감지)
        │                                         │
        └──────────┬──────────────────────────────┘
                   │
           extractFingerprint(error)   ← 동일한 함수를 공유
                   │
           Sentry fingerprint 설정

→ 어떤 경로로 에러가 Sentry에 도달하든 동일한 그룹화 결과
```

### 원칙 4: 자동 추출이 기본, 수동 오버라이드는 예외

```typescript
// 기본: 자동 추출 (대부분의 케이스)
sentryCaptureException(error);

// 예외: 런타임 상태를 포함한 세분화가 필요할 때만 오버라이드
sentryCaptureException(error, {
  fingerprint: ['ExternalSdk', 'SDK 설정 에러', sdkStatus],
});

// 내부 구현:
fingerprint: scopeContext?.fingerprint ?? extractedFingerprint
//           ↑ 오버라이드 있으면 우선    ↑ 없으면 자동 추출
```

---

## 10. 실전 체크리스트

### 새 커스텀 에러 클래스 작성 시

- [ ] `fingerPrint`에 **안정적인 식별자**를 지정했는가? (타임스탬프, 랜덤 값 제외)
- [ ] fingerPrint 요소 조합이 "같은 원인 = 같은 fingerprint"를 만족하는가?

### sentryCaptureException 호출 시

- [ ] ErrorBase 서브클래스라면 fingerprint 자동 추출에 의존하고 있는가? (수동 지정 불필요)
- [ ] 동적 맥락이 필요한 경우에만 `scopeContext.fingerprint`를 오버라이드하는가?
- [ ] `isAllowedError`에 해당하는 에러가 아닌지 확인했는가?

### Sentry 초기화 시

- [ ] `beforeSendForUnhandledError`가 `beforeSend`에 등록되어 있는가?
- [ ] `isPreProcessed` 태그로 이중 처리 방지가 동작하는가?

### 주의사항

- [ ] Axios 에러와 ErrorBase 에러의 `extractFingerprint` 분기 우선순위 — Axios가 먼저 체크됨
- [ ] fingerPrint에 동적 메시지를 넣으면 이슈가 무한 생성되는 문제

---

## 파일 맵 (예시 구조)

| 파일 | 역할 |
|------|------|
| `packages/error/src/error-base.ts` | `ErrorBase` 기본 클래스 + `CustomErrorOptions` 타입 |
| `packages/error/src/guards.ts` | `isCustomDefinedError`, `isError` 타입 가드 |
| `packages/sentry/src/extract-sentry-fingerprint.ts` | `extractFingerprint()` — 에러 타입별 fingerprint 자동 추출 |
| `packages/sentry/src/sentry-capture-exception.ts` | `sentryCaptureException()` — 직접 호출 경로 |
| `packages/sentry/src/before-send-for-unhandled-error.ts` | `beforeSendForUnhandledError()` — 자동 감지 경로 |
| `packages/sentry/src/normalize-api-url-for-sentry.ts` | `normalizeApiUrlForSentry()` — URL 동적 파라미터 치환 |

## 관련 문서

- [ErrorBase 패턴](./error-base-pattern.md) — ErrorBase 클래스 설계와 서브클래스 작성법

## 참고 자료

- [Sentry Fingerprinting 공식 문서](https://docs.sentry.io/platforms/javascript/enriching-events/grouping-fingerprints/)
- [Error.cause (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
