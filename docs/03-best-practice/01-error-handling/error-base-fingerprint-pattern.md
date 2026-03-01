# ErrorBase + Fingerprint 패턴: 커스텀 에러로 Sentry 그룹화를 제어하는 법

> **목적**: 도메인별 커스텀 에러에 fingerprint를 부여하여, Sentry에서 동일 원인의 에러를 하나의 이슈로 자동 그룹화하는 패턴

---

## 목차

1. [패턴 개요](#1-패턴-개요)
2. [의존성](#2-의존성)
3. [핵심 구성요소](#3-핵심-구성요소)
4. [구현 단계](#4-구현-단계)
5. [응집도 설계 원칙](#5-응집도-설계-원칙)
6. [실전 체크리스트](#6-실전-체크리스트)

---

## 1. 패턴 개요

### 문제

Sentry에 에러를 보낼 때, 기본 그룹화(스택 트레이스 기반)만으로는 같은 원인의 에러가 여러 이슈로 흩어지거나, 다른 원인의 에러가 하나의 이슈로 합쳐진다.

```
❌ 기본 그룹화의 문제
Sentry Issue #1: "핸들러를 찾을 수 없습니다" (handleBack + navigateToScreen 혼재)
Sentry Issue #2: "핸들러를 찾을 수 없습니다" (같은 에러인데 스택 트레이스가 달라서 분리)
```

### 해결

```
ErrorBase 정의 (fingerPrint 속성 포함)
    │
    ├── 도메인별 서브클래스에서 fingerPrint 지정
    │   예: new BridgeNotFoundError({ fingerPrint: ['handleBack'] })
    │
    ├── sentryCaptureException(error)
    │   └── extractFingerprint(error)
    │       ├── ErrorBase 하위 → [error.name, ...error.fingerPrint]
    │       ├── Axios 에러 → [method, statusCode, normalizedUrl]
    │       └── 일반 에러 → [error.name, error.message]
    │
    └── Sentry에 fingerprint와 함께 전송
        → 동일 fingerprint = 동일 이슈로 그룹화
```

### 효과

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

### 전체 데이터 흐름도

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

---

## 2. 의존성

### 핵심 패키지

```jsonc
{
  // Sentry SDK (captureException, beforeSend, ScopeContext)
  "@sentry/nextjs": "^7.x",
  "@sentry/types": "^7.x",

  // HTTP 에러 판별
  "axios": "^1.x",

  // 유틸리티
  "remeda": "^1.x"   // isArray, isNullish, last
}
```

### 프로젝트 내부 패키지 (예시)

```jsonc
{
  "@your-org/error": "workspace:*",   // ErrorBase, isCustomDefinedError, isError, isAllowedError
  "@your-org/sentry": "workspace:*",  // sentryCaptureException, extractFingerprint, beforeSendForUnhandledError
  "@your-org/axios": "workspace:*"    // getResponseErrorCode, isAxios401Error
}
```

### 역할 관계도

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

## 3. 핵심 구성요소

### 3-1. ErrorBase 클래스 (기본 에러)

모든 도메인별 커스텀 에러의 기반 클래스. `fingerPrint` 속성으로 Sentry 그룹화를 제어한다.

```typescript
// error-base.ts
export type CustomErrorOptions = {
  /**
   * 기존 에러를 wrapping할 때 원본 에러를 전달.
   * this.cause에 할당되어 에러 체인을 형성.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
   */
  originalError?: unknown;
  /**
   * Sentry의 에러 그룹화를 위한 fingerprint.
   * 동일 fingerprint를 가진 에러는 하나의 이슈로 합쳐짐.
   * @see https://docs.sentry.io/platforms/javascript/enriching-events/grouping-fingerprints/
   */
  fingerPrint?: string[];
};

export class ErrorBase extends Error {
  cause?: unknown;
  fingerPrint?: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);
    this.name = 'ErrorBase';
    this.fingerPrint = options?.fingerPrint;
    this.cause = options?.originalError;
  }
}

/** 프로젝트에서 직접 정의한 에러인지 확인 (type guard) */
export const isCustomDefinedError = (error: unknown): error is ErrorBase => {
  return error instanceof ErrorBase;
};
```

**핵심**:
- `fingerPrint`는 `string[]` — Sentry가 배열의 각 요소를 조합하여 그룹 키를 생성
- `cause`로 에러 체인 지원 — 원본 에러를 보존하면서 새 에러로 래핑
- `isCustomDefinedError`로 추출 로직에서 ErrorBase 하위 에러를 타입 안전하게 판별

### 3-2. extractFingerprint() (자동 추출 로직)

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

**핵심**:
- 분기 우선순위: Axios 에러 > ErrorBase > 일반 Error > undefined
- ErrorBase에 `fingerPrint`가 있으면 `[에러명, ...지정값]`, 없으면 `[에러명]`만
- Axios 에러는 URL을 정규화(`/v1/users/abc123` → `/v1/users/{param}`)하여 동적 경로가 같은 이슈로 묶이도록

### 3-3. sentryCaptureException() (직접 호출 경로)

에러를 Sentry에 전송하는 메인 함수. fingerprint를 자동 추출하되 호출 시 오버라이드 가능.

```typescript
// sentry-capture-exception.ts
import { captureException } from '@sentry/nextjs';
import type { ScopeContext } from '@sentry/types';
import { isAxiosError } from 'axios';
import { isAllowedError } from '@your-org/error';
import { extractFingerprint } from './extract-sentry-fingerprint';
import { getSentryAxiosErrorContext } from './get-sentry-axios-error-context';
import { getUniversalSentryTags } from './get-universal-sentry-tags';
import { SentryAxiosError } from './sentry-axios-error';

export const sentryCaptureException = (
  error: unknown,
  scopeContext?: Partial<ScopeContext>,
  options?: OptionsType
) => {
  // AllowedError는 로깅하지 않음
  if (isAllowedError(error as Error)) {
    return;
  }

  const fingerprint = extractFingerprint(error);
  const sentryTags = getUniversalSentryTags(error, options);
  const sentryAxiosErrorContext = getSentryAxiosErrorContext(error);
  const errorToSend = isAxiosError(error) ? new SentryAxiosError(error) : error;
  const isAxiosErrorTag = isAxiosError(error) ? { isAxiosError: true } : {};

  const eventId = captureException(errorToSend, {
    level: scopeContext?.level ?? 'error',
    fingerprint: scopeContext?.fingerprint ?? fingerprint, // ← 명시한 것 우선, 없으면 자동 추출
    tags: {
      ...scopeContext?.tags,
      ...sentryTags,
      ...isAxiosErrorTag,
    },
    contexts: {
      ...scopeContext?.contexts,
      ...sentryAxiosErrorContext,
    },
  });
  return eventId;
};
```

**핵심**:
- `scopeContext?.fingerprint ?? fingerprint` — 호출 시 명시하면 우선, 아니면 자동 추출
- `isAllowedError` 체크로 의도된 에러(예: 리다이렉트용 에러)는 Sentry에 보내지 않음
- Axios 에러는 `SentryAxiosError`로 변환 + contexts에 요청/응답 정보 추가

### 3-4. beforeSendForUnhandledError() (자동 감지 경로)

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

  // 기본 태그 추가
  const tags = getUniversalSentryTags(hint.originalException);
  if (tags) {
    event.tags = { ...event.tags, ...tags };
  }

  // Axios 에러면 추가 컨텍스트
  if (isAxiosError(hint.originalException)) {
    event.tags = { ...event.tags, isAxiosError: true };
    event.contexts = { ...event.contexts, ...getSentryAxiosErrorContext(hint.originalException) };
  }

  return event;
};
```

**핵심**:
- `isPreProcessed` 태그로 이중 처리 방지 — `sentryCaptureException`이 이미 처리한 건 스킵
- `hint.originalException`에서 원본 에러를 꺼내 `extractFingerprint` 적용
- 두 경로(직접 호출 / 자동 감지) 모두 동일한 `extractFingerprint`를 사용하여 일관성 보장

### 3-5. normalizeApiUrlForSentry() (URL 정규화)

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

**핵심**: URL 경로의 숫자/영숫자 혼합/한글 인코딩 부분을 `{param}`으로 치환 → 동적 ID가 달라도 같은 엔드포인트는 하나의 이슈로

---

## 4. 구현 단계

### Step 1: ErrorBase를 상속한 도메인 에러 클래스 정의

fingerPrint에 **이 에러를 구분하는 의미있는 식별자**를 지정한다.

```typescript
// 예: errors/bridge-not-found-error.ts
import { ErrorBase } from '@your-org/error';

export class BridgeNotFoundError extends ErrorBase {
  handlerName: string;

  constructor({ handlerName, callSignature }: BridgeNotFoundErrorOptions) {
    super(
      `${callSignature} 핸들러를 찾을 수 없습니다.`,
      {
        fingerPrint: [handlerName], // ← Sentry에서 핸들러명별로 그룹화
      }
    );
    this.name = 'BridgeNotFoundError'; // ← extractFingerprint에서 [error.name, ...fingerPrint]로 사용
    this.handlerName = handlerName;
  }
}
```

**포인트**:
- `this.name`을 반드시 서브클래스명으로 설정 — `extractFingerprint`가 `error.name`을 fingerprint 첫 요소로 사용
- `fingerPrint` 배열 요소는 **안정적인 식별자**여야 함 (타임스탬프, 랜덤 ID 등은 부적합)
- Sentry에서 최종 fingerprint: `['BridgeNotFoundError', 'handleBack']`

### Step 2: catch 블록에서 sentryCaptureException 호출

```typescript
// 사용 측 코드
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
// 예: 런타임 상태를 포함한 명시적 fingerprint
try {
  await setupExternalSdk();
} catch (err) {
  sentryCaptureException(err, {
    fingerprint: ['ExternalSdk', 'SDK 설정 에러', sdkStatus],
  });
}
```

**포인트**:
- ErrorBase 서브클래스라면 `sentryCaptureException(error)` 한 줄이면 충분 — fingerprint 자동 추출
- 추가 맥락(런타임 상태 등)이 필요하면 `scopeContext.fingerprint`로 오버라이드
- 오버라이드 시 자동 추출된 fingerprint는 무시됨 (`scopeContext?.fingerprint ?? fingerprint`)

### Step 3: Sentry 초기화에서 beforeSend 등록

unhandled 에러에도 fingerprint가 적용되도록 `beforeSend` 훅을 등록한다.

```typescript
// sentry.[env].config.ts
import { getDefaultSentryOptions } from '@your-org/sentry';

Sentry.init({
  ...getDefaultSentryOptions({ dsn, environment, release }),
  // getDefaultSentryOptions 내부에서 beforeSend: beforeSendForUnhandledError 등록
});
```

**포인트**:
- `getDefaultSentryOptions`이 `beforeSend`, `integrations`, `ignoreErrors`를 포함
- 직접 catch하지 않은 에러도 `beforeSendForUnhandledError`에서 fingerprint 할당
- 이중 처리 방지: `isPreProcessed` 태그로 이미 처리된 에러는 스킵

---

## 5. 응집도 설계 원칙

### 원칙 1: fingerPrint는 에러 클래스 생성자에서 결정

```
❌ 잘못된 구현: catch 블록마다 fingerprint를 수동 지정
try { ... } catch (err) {
  sentryCaptureException(err, { fingerprint: ['BridgeNotFoundError', handlerName] });
  //                                         ↑ 호출할 때마다 일관성 유지해야 함
}

✅ 올바른 구현: 에러 클래스 생성 시 fingerprint를 내장
class BridgeNotFoundError extends ErrorBase {
  constructor({ handlerName }) {
    super(message, { fingerPrint: [handlerName] });
    //                              ↑ 한 곳에서 결정 → 어디서 catch해도 동일한 그룹화
  }
}

try { ... } catch (err) {
  sentryCaptureException(err);  // ← fingerprint 자동 추출
}
```

### 원칙 2: this.name을 서브클래스명으로 반드시 설정

```
❌ 잘못된 구현: this.name 미설정
class MyCustomError extends ErrorBase {
  constructor(message: string) {
    super(message, { fingerPrint: ['detail'] });
    // this.name이 'ErrorBase'로 남음
  }
}
// Sentry fingerprint: ['ErrorBase', 'detail']  ← 모든 ErrorBase 하위 에러가 혼재

✅ 올바른 구현: this.name을 명시적으로 설정
class MyCustomError extends ErrorBase {
  constructor(message: string) {
    super(message, { fingerPrint: ['detail'] });
    this.name = 'MyCustomError';  // ← 에러 클래스명으로 1차 분류
  }
}
// Sentry fingerprint: ['MyCustomError', 'detail']  ← MyCustomError만 분리
```

### 원칙 3: fingerPrint 요소는 안정적인 식별자

```
❌ 잘못된 fingerPrint: 동적 값 포함
new ErrorBase(message, {
  fingerPrint: [Date.now().toString()]       // ← 매번 다른 값 → 이슈 무한 생성
  fingerPrint: [error.stack]                 // ← 스택 트레이스 → 배포마다 달라짐
  fingerPrint: [Math.random().toString()]    // ← 랜덤 → 의미 없는 그룹화
});

✅ 올바른 fingerPrint: 도메인 맥락에서 의미있는 안정적 식별자
new ErrorBase(message, {
  fingerPrint: [handlerName]                  // 'handleBack' — 기능명
  fingerPrint: [funnelStep, requiredData]    // 'step1', 'accountId' — 비즈니스 단계 + 필드명
  fingerPrint: [serviceId, key]              // 'user-service', 'featureFlags' — 서비스 + 키
});
```

### 원칙 4: extractFingerprint는 단일 책임 — 두 경로가 공유

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

### 원칙 5: scopeContext로 오버라이드 가능 — 자동 추출이 기본, 수동이 예외

```
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

## 6. 실전 체크리스트

### 새 커스텀 에러 클래스 작성 시

- [ ] `ErrorBase`를 상속했는가?
- [ ] `this.name`을 **서브클래스명**으로 설정했는가? (`this.name = 'MyCustomError'`)
- [ ] `fingerPrint`에 **안정적인 식별자**를 지정했는가? (타임스탬프, 랜덤 값 제외)
- [ ] fingerPrint 요소 조합이 "같은 원인 = 같은 fingerprint"를 만족하는가?
- [ ] 원본 에러가 있다면 `originalError`로 전달했는가? (`this.cause` 에러 체인)

### sentryCaptureException 호출 시

- [ ] ErrorBase 서브클래스라면 fingerprint 자동 추출에 의존하고 있는가? (수동 지정 불필요)
- [ ] 동적 맥락이 필요한 경우에만 `scopeContext.fingerprint`를 오버라이드하는가?
- [ ] `isAllowedError`에 해당하는 에러가 아닌지 확인했는가?

### 주의사항

- [ ] `this.name` 미설정 시 모든 ErrorBase 하위 에러가 `'ErrorBase'`로 합쳐지는 문제
- [ ] fingerPrint에 동적 메시지를 넣으면 이슈가 무한 생성되는 문제
- [ ] Axios 에러와 ErrorBase 에러의 `extractFingerprint` 분기 우선순위 — Axios가 먼저 체크됨
- [ ] `beforeSendForUnhandledError`가 Sentry 초기화 시 등록되어 있는지 확인

---

## fingerPrint 설계 가이드

| 에러 유형 | fingerPrint 전략 | 예시 | Sentry 최종 fingerprint |
|-----------|-----------------|------|------------------------|
| **핸들러 미발견** | `[핸들러명]` | `['handleBack']` | `['BridgeNotFoundError', 'handleBack']` |
| **런타임 에러** | `[핸들러명, 에러메시지]` | `['navigateToScreen', 'bridge error']` | `['BridgeRuntimeError', 'navigateToScreen', 'bridge error']` |
| **폼 필수데이터 누락** | `[펀넬스텝, 데이터명]` | `['step1', 'accountId']` | `['FormRequiredDataError', 'step1', 'accountId']` |
| **파싱 에러** | `[에러타입, 서비스ID, 키]` | `['SearchKeyValueParseError', 'user', 'flags']` | `['SearchKeyValueParseError', 'user', 'flags']` |
| **단언 실패** | `[에러타입, 메시지]` | `['AssertError', '유저 ID가 없습니다']` | `['AssertError', 'AssertError', '유저 ID가 없습니다']` |
| **Axios 5xx** | (자동) `[method, code, url]` | — | `['post', '500', '/v1/loans/{param}']` |
| **Axios 401** | (자동) `['401']` | — | `['401']` |

---

## 파일 맵 (예시 구조)

| 파일 | 역할 |
|------|------|
| `packages/error/src/error-base.ts` | `ErrorBase` 기본 클래스 + `CustomErrorOptions` 타입 + `isCustomDefinedError` |
| `packages/error/src/index.ts` | 커스텀 에러 클래스 barrel export |
| `packages/sentry/src/extract-sentry-fingerprint.ts` | `extractFingerprint()` — 에러 타입별 fingerprint 자동 추출 |
| `packages/sentry/src/sentry-capture-exception.ts` | `sentryCaptureException()` — 직접 호출 경로 (fingerprint 추출 + Sentry 전송) |
| `packages/sentry/src/before-send-for-unhandled-error.ts` | `beforeSendForUnhandledError()` — 자동 감지 경로 (unhandled 에러 사후 처리) |
| `packages/sentry/src/normalize-api-url-for-sentry.ts` | `normalizeApiUrlForSentry()` — URL 동적 파라미터 치환 |
| `packages/sentry/src/default-sentry-options.ts` | `getDefaultSentryOptions()` — Sentry 초기화 설정 (beforeSend 등록) |

## 참고 자료

- [Sentry Fingerprinting 공식 문서](https://docs.sentry.io/platforms/javascript/enriching-events/grouping-fingerprints/)
- [Error.cause MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
