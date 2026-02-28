---
title: "함수 인터페이스 패턴"
description: "함수 시그니처를 (primary, options?) 형태로 설계하여 편의성과 확장성을 동시에 달성하는 패턴과 default 값 원칙을 설명합니다."
type: pattern
tags: [Architecture, TypeScript, BestPractice]
order: 4
related: [./01-naming-convention.md]
---

# 함수 인터페이스 패턴

---

## 해결하려는 문제

### 문제 1: positional args의 순서 기억 부담

```typescript
// ❌ 인자가 많아지면 순서를 기억해야 함
function createUser(
  name: string,
  age: number,
  email: string,
  isAdmin: boolean,
  locale: string,
) {}

createUser('Kim', 30, 'kim@example.com', false, 'ko')
//                                        ^ false가 뭘 의미하지?
```

### 문제 2: 코드리뷰에서 인자의 의미 파악 불가

```typescript
// ❌ 값만 보이고, 어떤 옵션을 의도한 값인지 표현이 안 됨
fetchUsers(true, false, 10)
// → true가 뭐? false가 뭐? 10이 뭐?
```

에디터의 inlay hint가 이 문제를 완화하긴 하지만:
- hover 등 별도 동작이 필요하므로 오버헤드가 있음
- **코드리뷰 상황에서는 inlay hint가 노출되지 않음** — GitHub PR 등에서 이 정보가 누락됨
- 따라서 inlay hint는 options 객체를 대체할 근거가 되지 않음

### 문제 3: 선택적 인자 추가 시 breaking change

```typescript
// ❌ 새 옵션 추가가 기존 호출부에 영향
function createUser(name: string, age: number, email: string, isAdmin: boolean) {}

// locale을 추가하고 싶다면?
function createUser(name: string, age: number, email: string, isAdmin: boolean, locale?: string) {}
// → isAdmin이 optional인 상태로 locale만 쓰고 싶으면?
createUser('Kim', 30, 'kim@example.com', false, 'ko')  // isAdmin에 false를 강제 할당해야 함
```

---

## 해결 방법

### `(primary, options?) => ReturnType` 패턴

```typescript
// ✅ primary + options 객체
interface CreateUserOptions {
  age?: number
  email?: string
  isAdmin?: boolean
  locale?: string
}

function createUser(name: string, options?: CreateUserOptions): User {
  const { age, email, isAdmin = false, locale = 'ko' } = options ?? {}
  // ...
}
```

```
패턴 구조:
(primary, options?: { ... }) => ReturnType
 ^^^^^^^  ^^^^^^^^^^^^^^^^     ^^^^^^^^^^
 필수값     선택적 설정           명확한 반환
```

### 사용 예시

```typescript
// 편의성: 별도 맥락 고려 없이 간단하게 호출
createUser('Kim')

// 커스텀: 필요한 옵션만 명시적으로 지정
createUser('Kim', { age: 30, email: 'kim@example.com' })

// 확장: 새 옵션 추가 시 기존 호출부 변경 없음
createUser('Kim', { age: 30, locale: 'en' })
```

### 설계 근거

| 관점 | positional args | (primary, options?) |
|------|----------------|---------------------|
| **편의성** | 인자 적을 때 빠름 | 기본값 활용으로 간편 호출 |
| **가독성** | 인자 3개+ 시 하락 | 필드명이 의도를 설명 |
| **확장성** | breaking change 위험 | options에 필드 추가로 해결 |
| **코드리뷰** | 값만 보임 | 필드명이 코드리뷰에서도 노출 |

### 구현 세부사항

- **primary 인자**: 함수의 핵심 대상. 1개, 최대 2개
- **options 객체**: 동작을 커스터마이징하는 설정들
- **모든 options 필드는 optional** (`?`) — 생략하면 default 적용
- **default 값은 구조분해 할당에서 지정**
- **option이 하나뿐이더라도 객체로 정의** — 확장에 용이. 단, 확장이 명시적으로 고려되지 않는 경우 이 원칙을 따르지 않아도 됨

---

## default 값 원칙

### 해결하려는 문제

```typescript
// ❌ default가 일반적 상황과 불일치
function fetchUsers(options?: { includeInactive?: boolean }) {
  const { includeInactive = true } = options ?? {}  // ← 기본이 true?
  // 대부분의 호출에서는 active 유저만 필요한데...
}

// 호출자 대부분이 이렇게 사용하게 됨:
fetchUsers({ includeInactive: false })  // ← 매번 명시해야 함
```

**위험**: default 값은 암묵적이다. 일반적인 상황과 이 default 값이 다르면, 암묵성으로 인해 사용자가 기대하지 않은 동작이 일어나고 장애로 이어질 가능성이 높다.

### 해결 방법

```typescript
// ✅ default = 가장 일반적인 사용 상황
function fetchUsers(options?: { includeInactive?: boolean }) {
  const { includeInactive = false } = options ?? {}  // ← 일반적 상황 = inactive 제외
  // ...
}

// 대부분의 호출: 추가 설정 불필요
fetchUsers()  // ✅ default가 일반적 상황과 일치

// 특별한 경우만 명시적으로 override
fetchUsers({ includeInactive: true })
```

### 검증 질문

default 값을 설정할 때 스스로 물어볼 것:

1. **"이 함수를 호출하는 곳의 80%가 이 default 값을 그대로 사용하는가?"**
2. **"default를 생략했을 때 놀라운 동작이 발생하지 않는가?"**

둘 중 하나라도 "아니오"라면 default 값을 재검토해야 한다.

---

## 주의사항 (Caveat)

### options 남용

```typescript
// ❌ primary가 없고 모든 것이 options인 경우
function doSomething(options: { target: string; action: string; value: number }) {}
// → target이 primary가 되어야 함

// ✅ primary를 분리
function doSomething(target: string, options?: { action?: string; value?: number }) {}
```

### 올바른 사용 조건

(primary, options?) 패턴은 다음 조건 중 하나 이상을 충족할 때 사용한다:

1. **선택적 설정이 2개 이상**일 때
2. **향후 설정 추가가 예상**될 때
3. **호출부에서 인자의 의미가 불분명**할 때 (boolean 값 등)

인자가 2개이고 둘 다 필수이며 확장 가능성이 낮다면, positional args로 충분하다:

```typescript
// ✅ 이 경우 options 패턴이 과도
function add(a: number, b: number): number {}
```

---

## 함수명 원칙

함수명은 **어떤 액션을 통해 어떤 결과가 나오는지**를 표현해야 한다:

```typescript
// ❌ 액션/결과가 불분명
function process(data: unknown) {}
function handle(event: Event) {}

// ✅ 액션→결과가 명확
function formatAddress(rawAddress: RawAddress): string {}
function validateLoanApplication(application: LoanApplication): ValidationResult {}
function calculateMonthlyInterest(principal: number, options?: InterestOptions): number {}
```

함수가 필요로 하는 인자에 대한 표현은 기본적으로 **타입으로 표현되기를 기대**한다. 단, 특수한 맥락이 있는 경우 인자명 자체에 그 맥락을 담는다:

```typescript
// ✅ 타입만으로 충분한 경우
function getUser(id: UserId): User {}

// ✅ 특수 맥락이 있어서 인자명에 표현이 필요한 경우
function getUser(externalPartnerId: string): User {}
// → "이건 우리 시스템의 ID가 아니라 외부 파트너의 ID다"라는 맥락
```

---

## 레퍼런스

- [변수명 컨벤션 가이드](./01-naming-convention.md) — 네이밍 원칙
- [변수명 요구사항 체크리스트](./03-naming-requirements-checklist.md) — 코드리뷰용 체크리스트

