---
title: "ErrorBase 패턴: 도메인 에러의 기반 클래스 설계"
description: "모든 커스텀 에러의 기반이 되는 ErrorBase 클래스를 설계하고, 서브클래스·타입 가드·에러 체인까지 일관된 에러 체계를 구축하는 패턴을 정리합니다."
type: pattern
tags: [TypeScript, BestPractice]
order: 1
---

# ErrorBase 패턴: 도메인 에러의 기반 클래스 설계

> **목적**: 도메인별 커스텀 에러에 일관된 구조(이름, 원인 체인, 확장 속성)를 부여하여 catch 블록에서 타입 안전하게 분기하고, 모니터링 도구에 충분한 맥락을 전달하는 기반 클래스를 제공한다.

---

## 목차

1. [해결하려는 문제](#1-해결하려는-문제)
2. [ErrorBase 구현](#2-errorbase-구현)
3. [타입 가드](#3-타입-가드)
4. [서브클래스 작성법](#4-서브클래스-작성법)
5. [에러 체인 (cause)](#5-에러-체인-cause)
6. [확장 속성 활용](#6-확장-속성-활용)
7. [실전 체크리스트](#7-실전-체크리스트)

---

## 1. 해결하려는 문제

### 일반 Error만 사용할 때의 한계

```typescript
// ❌ 문자열 메시지만으로는 에러 종류를 구분할 수 없다
throw new Error('핸들러를 찾을 수 없습니다');

try {
  await callBridge(name);
} catch (error) {
  // error.message로 분기? — 메시지가 바뀌면 분기가 깨진다
  if (error.message.includes('핸들러')) { /* ... */ }
}
```

**문제점:**
- `error.name`이 항상 `'Error'` → 에러 종류를 구분할 수 없다
- 원본 에러를 감싸면 원인이 사라진다
- catch 블록에서 타입 안전한 분기가 불가능하다
- 모니터링 도구(Sentry 등)에 전달할 구조적 맥락이 없다

### ErrorBase로 해결

```typescript
// ✅ 도메인 에러로 명확한 분류와 타입 안전한 분기
class BridgeNotFoundError extends ErrorBase {
  constructor(handlerName: string) {
    super(`${handlerName} 핸들러를 찾을 수 없습니다.`);
    this.name = 'BridgeNotFoundError';
  }
}

try {
  await callBridge(name);
} catch (error) {
  if (error instanceof BridgeNotFoundError) {
    // 타입이 좁혀짐 — error.name, error.cause 등 접근 가능
  }
}
```

---

## 2. ErrorBase 구현

> 참조 구현: [`@fe-lab/error`](../../../packages/primitive/error/src/error-base.ts)

```typescript
export type CustomErrorOptions = {
  /** 원본 에러를 전달하여 에러 체인(cause)을 형성 */
  originalError?: unknown;
  /** 모니터링 도구의 에러 그룹화를 위한 식별자 배열 */
  fingerPrint?: string[];
};

export class ErrorBase extends Error {
  override cause?: unknown;
  fingerPrint?: string[];

  constructor(message: string, options?: CustomErrorOptions) {
    super(message);
    this.name = 'ErrorBase';
    this.fingerPrint = options?.fingerPrint;
    this.cause = options?.originalError;
  }
}
```

### 설계 의도

| 속성 | 역할 |
|------|------|
| `name` | 에러 종류 식별 — 서브클래스에서 반드시 오버라이드 |
| `message` | 사람이 읽을 수 있는 에러 설명 |
| `cause` | 원본 에러 보존 — 에러 체인 형성 |
| `fingerPrint` | 모니터링 도구용 그룹화 키 (선택) |

---

## 3. 타입 가드

> 참조 구현: [`@fe-lab/error`](../../../packages/primitive/error/src/guards.ts)

```typescript
/** ErrorBase 인스턴스인지 확인 (type guard) */
export const isCustomDefinedError = (error: unknown): error is ErrorBase => {
  return error instanceof ErrorBase;
};

/** Error 인스턴스인지 확인 (type guard) */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};
```

### 사용 예시

```typescript
function handleError(error: unknown) {
  if (isCustomDefinedError(error)) {
    // ErrorBase 하위 — error.name, error.fingerPrint, error.cause 접근 가능
    console.error(`[${error.name}]`, error.message);
    return;
  }

  if (isError(error)) {
    // 일반 Error — error.name, error.message만 접근 가능
    console.error(error.message);
    return;
  }

  // unknown 타입 — 문자열, 숫자 등
  console.error('Unexpected error:', error);
}
```

---

## 4. 서브클래스 작성법

### 기본 패턴

```typescript
class BridgeNotFoundError extends ErrorBase {
  handlerName: string;

  constructor(handlerName: string) {
    super(`${handlerName} 핸들러를 찾을 수 없습니다.`);
    this.name = 'BridgeNotFoundError'; // ← 반드시 서브클래스명으로 설정
    this.handlerName = handlerName;
  }
}
```

### this.name을 반드시 설정해야 하는 이유

```
❌ this.name 미설정
class MyError extends ErrorBase {
  constructor(message: string) { super(message); }
}
new MyError('fail').name  // → 'ErrorBase'  — 구분 불가

✅ this.name 설정
class MyError extends ErrorBase {
  constructor(message: string) {
    super(message);
    this.name = 'MyError';
  }
}
new MyError('fail').name  // → 'MyError'  — 명확한 분류
```

JavaScript의 `Error` 서브클래스는 `this.name`을 자동으로 바꿔주지 않는다. 명시적으로 설정하지 않으면 부모 클래스의 `name`(`'ErrorBase'`)이 그대로 남는다.

### fingerPrint를 활용하는 서브클래스

모니터링 도구에서 같은 원인의 에러를 그룹화해야 할 때 `fingerPrint`를 사용한다.

```typescript
class FormRequiredDataError extends ErrorBase {
  constructor(step: string, fieldName: string) {
    super(`${step}에서 필수 데이터 ${fieldName}이(가) 누락되었습니다.`, {
      fingerPrint: [step, fieldName], // → 모니터링에서 [에러명, step, fieldName]으로 그룹화
    });
    this.name = 'FormRequiredDataError';
  }
}
```

> fingerPrint를 Sentry에서 활용하는 구체적인 방법은 [Sentry Fingerprint 패턴](./sentry-fingerprint-pattern.md)을 참고한다.

---

## 5. 에러 체인 (cause)

외부 라이브러리 에러나 하위 시스템 에러를 도메인 에러로 감싸면서 원본을 보존한다.

```typescript
try {
  await externalSdk.init();
} catch (error) {
  throw new SdkInitError('SDK 초기화 실패', {
    originalError: error, // → this.cause에 원본 에러 보존
  });
}
```

### 에러 체인 활용

```typescript
try {
  await initService();
} catch (error) {
  if (isCustomDefinedError(error)) {
    console.error(`[${error.name}]`, error.message);

    if (error.cause) {
      console.error('  Caused by:', error.cause);
      // 원본 에러의 스택 트레이스, 메시지 등을 확인 가능
    }
  }
}
```

---

## 6. 확장 속성 활용

서브클래스에 도메인 맥락을 추가하면 catch 블록에서 풍부한 정보를 활용할 수 있다.

```typescript
class ApiError extends ErrorBase {
  statusCode: number;
  endpoint: string;

  constructor(statusCode: number, endpoint: string) {
    super(`API 호출 실패: ${endpoint} (${statusCode})`);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

// 사용 측
try {
  await fetchUser(userId);
} catch (error) {
  if (error instanceof ApiError && error.statusCode === 404) {
    showNotFoundPage();
  }
}
```

---

## 7. 실전 체크리스트

### 서브클래스 작성 시

- [ ] `ErrorBase`를 상속했는가?
- [ ] `this.name`을 **서브클래스명**으로 설정했는가?
- [ ] 원본 에러가 있다면 `originalError`로 전달하여 에러 체인을 형성했는가?
- [ ] 도메인 맥락에 필요한 속성을 추가했는가? (예: `handlerName`, `statusCode`)

### 에러 분기 시

- [ ] `instanceof` 또는 `isCustomDefinedError` 타입 가드로 분기하는가? (문자열 비교 ❌)
- [ ] unknown 타입 에러까지 처리하는 방어 코드가 있는가?

### 모니터링 연동 시

- [ ] 모니터링 도구에서 그룹화가 필요하다면 `fingerPrint`를 지정했는가?
- [ ] `fingerPrint` 요소는 안정적인 식별자인가? (타임스탬프, 랜덤 값 제외)

---

## 관련 문서

- [Sentry Fingerprint 패턴](./sentry-fingerprint-pattern.md) — ErrorBase의 fingerPrint를 Sentry에서 활용하는 방법
- [순차 비동기 에러 핸들링](./sequential-async-error-handling.md) — catch 블록 구조화 패턴

## 참고 자료

- [Error.cause (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [JavaScript Error 서브클래싱 (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types)
