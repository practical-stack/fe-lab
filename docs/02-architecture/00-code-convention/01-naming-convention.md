---
title: "변수명 요구사항"
description: "변수명의 요구사항을 정의하여, 가독성 논의를 취향이 아닌 근거 기반 평가로 전환하는 가이드입니다. 의미 전달, 스코프 오염 방지, 유니크함, 일관성, 비용 정당화의 5가지 요구사항과 검증 규칙을 제공합니다."
type: guide
tags: [Architecture, TypeScript, BestPractice]
order: 1
related: [./04-function-interface-pattern.md, ./03-naming-requirements-checklist.md, ./02-variable-naming-framework.md]
---

# 변수명 요구사항

## 이 문서의 목적

가독성과 변수명에 대한 논의는 매우 치열하게 이루어지지만, 결과적으로 **취향과 선호**로 취급되어 더 욕망이 있는 사람의 의견으로 귀결되기 쉽다.

이 문서는 가독성과 변수명 요구사항을 명확히 정의하여, 컨벤션에 대한 논의가 더 이상 취향·선호의 영역이 아닌 **근거를 통해 요구사항 달성 여부를 평가하는 방식**으로 이루어지길 기대하며 작성되었다.

---

## 원칙

**변수는 해당 값에 할당한 자원에 대해 추상화된 이름으로, 해당 변수를 읽는 독자에게 그 변수에 담긴 자원에 대해 명확한 의미 / 역할 / 사용 / 목적 등의 의미를 담아내야 한다.**

### 변수명 테스트

변수명 작성자가 독자에게 전달하고자 하는 정보를 정의하고, 실제 독자가 해당 변수를 읽었을 때 작성자가 의도한 부분을 동일하게 떠올릴 수 있어야 한다.

```
작성자 의도: "인증된 사용자의 세션 만료 시간(밀리초)"
변수명: sessionTimeoutMs
독자 해석: "세션 만료 시간(밀리초)" → ✅ 의도와 해석이 일치

작성자 의도: "인증된 사용자의 세션 만료 시간(밀리초)"
변수명: timeout
독자 해석: "무언가의 타임아웃" → ❌ 의도와 해석이 불일치
```

이 원칙을 달성하기 위한 검증 가능한 요구사항을 아래에 정의한다.

---

## 요구사항 정의

### 변수명이 달성해야 하는 요구사항

위 원칙을 달성하기 위해, 변수명이 충족해야 하는 요구사항을 아래와 같이 정의한다.
코드 리뷰에서 변수명에 대해 피드백할 때, "가독성이 떨어진다"는 추상적 표현 대신 **아래 요구사항 중 어떤 항목이 미충족인지** 특정한다.

| 요구사항         | 설명                                                                        | 우선순위 |
| ---------------- | --------------------------------------------------------------------------- | -------- |
| 의미 전달        | 네이밍을 보고 역할/동작을 인지할 수 있는가                                  | P0       |
| 스코프 오염 방지 | specific하게 쓰이는데 보편적 이름을 가져서 향후 변수명에 영향을 주지 않는가 | P0       |
| 유니크함         | 런타임 스코프 내에서 고유한가                                               | P0       |
| 일관성           | 유사 카테고리의 기존 변수명과 일관되는가                                    | P1       |
| 비용 정당화      | 이름의 길이가 얻는 명확성에 비해 정당한가                                   | P1       |

---

## P0: 의미 전달

변수명은 프로그래머의 시선이 가장 먼저 고정되는 **beacon**(코드의 의도를 즉시 파악하게 해주는 단서)이다. 정보이론 관점에서 변수명은 통신 채널이므로, `data`, `temp`, `result` 같은 정보량 ≈ 0인 이름은 독자에게 할당문/사용처 추적이라는 추가 비용을 발생시킨다.

### 규칙

**R-M1: 변수명만으로 담긴 자원의 성격을 유추할 수 있어야 한다.**

```typescript
// ❌ 위반: "data"는 모든 것이 될 수 있다
const data = await fetchUserProfile(userId);

// ✅ 충족: 자원의 성격이 이름에 담겨 있다
const userProfile = await fetchUserProfile(userId);
```

**R-M2: 함수명은 동작을 나타내는 동사로 시작한다.**

동사 prefix는 함수의 가장 강력한 beacon이다. 첫 토큰만으로 행위의 성격을 즉시 파악할 수 있게 한다.

| prefix                          | 의미                 | 예시                           |
| ------------------------------- | -------------------- | ------------------------------ |
| `get` / `fetch`                 | 조회 (동기 / 비동기) | `getFullName`, `fetchUserList` |
| `set` / `update`                | 값 변경              | `setTheme`, `updateProfile`    |
| `is` / `has` / `can` / `should` | boolean 반환         | `isValid`, `hasPermission`     |
| `create` / `build`              | 새 인스턴스 생성     | `createOrder`, `buildQuery`    |
| `parse` / `format`              | 변환                 | `parseDate`, `formatCurrency`  |
| `handle` / `on`                 | 이벤트 응답          | `handleClick`, `onSubmit`      |
| `validate` / `check`            | 검증                 | `validateEmail`, `checkStock`  |

이 표는 강제 목록이 아니라 참고 가이드다. 핵심은 **동사가 행위의 성격을 예측 가능하게** 전달하는 것이다.

**R-M3: boolean 변수는 `is` / `has` / `should` / `can` prefix를 사용한다.**

Principle of Least Astonishment — `active`보다 `isActive`가 반환 타입에 대한 예측을 강제한다.

```typescript
// ❌ 위반: boolean인지 객체인지 예측 불가
const visible = checkElementVisibility(el);

// ✅ 충족: prefix가 반환 타입을 예고
const isVisible = checkElementVisibility(el);
```

**R-M4: 축약어를 사용하지 않는다. 단, 커뮤니티에서 보편적으로 사용되는 축약은 예외로 한다.**

축약은 해독에 외부 맥락을 요구하여 채널 용량을 줄인다.

```typescript
// ❌ 위반
const usr = getUser();
const btn = document.querySelector(".submit");
const cfg = loadConfig();

// ✅ 충족
const user = getUser();
const submitButton = document.querySelector(".submit");
const config = loadConfig();

// ✅ 예외: 커뮤니티 보편 축약
const id = user.id; // identifier
const url = buildUrl(); // Uniform Resource Locator
const api = createClient(); // Application Programming Interface
```

예외의 판단 기준: **해당 언어/프레임워크의 공식 문서에서 축약형이 정식 용어로 사용되는가?**

---

## P0: 스코프 오염 방지

지역적으로 사용되는 변수가 보편적인 이름을 가지면, 나중에 보편적인 역할의 변수명과 충돌하여 **미래의 네이밍 비용을 선불로 발생**시킨다. export 되는 변수는 import 시 파일 경로라는 맥락이 사라지므로 더 명확해야 한다.

### 규칙

**R-S1: 특정 맥락에서만 유효한 변수는 그 맥락을 이름에 반영해야 한다.**

```typescript
// ❌ 위반: "items"가 무엇의 items인지 특정 불가
// → 나중에 cartItems, wishlistItems 등이 추가되면 기존 "items"를 rename해야 함
const items = cart.getProducts();

// ✅ 충족: 맥락이 이름에 포함됨
const cartItems = cart.getProducts();
```

**R-S2: export 되는 변수는 소속 스코프에 대한 지식이 이름에 명시적으로 포함되어야 한다.**

모듈 외부에서 import될 때, 파일 경로라는 맥락이 사라지거나 희미해진다.
export 변수는 **홀로 서도 출처를 유추할 수 있어야** 한다.

```typescript
// ❌ 위반: auth/constants.ts 에서 export
export const MAX_COUNT = 5;
// → import { MAX_COUNT } from '@/auth/constants';
// MAX_COUNT가 무엇의 count인지 import 지점에서 알 수 없다

// ✅ 충족: 스코프가 이름에 포함됨
export const MAX_LOGIN_RETRY_COUNT = 5;
// → import { MAX_LOGIN_RETRY_COUNT } from '@/auth/constants';
// import 지점에서도 의미가 자명하다
```

**R-S3: 변수명의 길이는 해당 변수가 살아있는 스코프의 크기에 비례해야 한다.**

스코프가 좁으면 추적 비용이 낮아 짧은 이름이 허용되고, 스코프가 넓으면 이름이 맥락을 담아야 한다.

```typescript
// ✅ 3줄 스코프의 루프 변수: 짧은 이름이 적절
const ids = users.map((u) => u.id);

// ✅ 모듈 레벨 변수: 긴 이름이 필요
const authenticatedUserSessionTimeout = 30 * 60 * 1000;
```

---

## P0: 유니크함

변수는 런타임 스코프 내에서 고유해야 한다. alias로 중복을 처리할 수 있지만, 리팩토링 시 자동 코드 변경의 안전성을 떨어뜨리는 숨은 비용이 된다.

### 규칙

**R-U1: 동일 런타임 스코프 내에서 변수명은 고유해야 한다.**

이것은 언어 수준의 제약(같은 스코프에서 같은 이름의 `const`/`let` 선언 불가)과 더불어,
**인지적 고유성**도 포함한다.

```typescript
// ❌ 위반: 언어적으로는 가능하지만 인지적으로 혼동
const user = getUser();
// ... 50줄 후 ...
const user2 = getAnotherUser(); // user와 user2의 관계가 불명확

// ✅ 충족: 역할이 구분됨
const requestingUser = getUser();
const targetUser = getAnotherUser();
```

**R-U2: 숫자 접미사(`1`, `2`, ...)로 유니크함을 확보하지 않는다.**

숫자 접미사는 유니크함만 충족하고 의미 전달을 충족하지 못한다.
두 변수의 **관계 또는 역할 차이**가 이름에 드러나야 한다.

---

## P1: 일관성

스타일 가이드의 가치는 개별 규칙의 최적성이 아니라 **일관성 자체**에 있다. 파일마다 스타일이 다르면 매번 "이 파일의 규칙은 뭐지?"라는 인지적 전환 비용이 발생한다. 일관성은 이 비용을 0으로 만든다.

### 규칙

**R-C1: 유사한 카테고리의 기존 변수명이 존재하면, 새 변수명은 기존 패턴을 따른다.**

```typescript
// 기존 코드에 아래 패턴이 있다면:
const fetchUserList = () => { ... };
const fetchOrderList = () => { ... };

// ✅ 새 함수도 같은 패턴을 따른다
const fetchProductList = () => { ... };

// ❌ 패턴을 깨뜨린다
const getProducts = () => { ... };
const loadAllProducts = () => { ... };
```

**R-C2: 일관성의 범위는 가장 가까운 스코프부터 적용한다.**

우선순위: 같은 파일 > 같은 모듈 > 같은 프로젝트 > 생태계 관습

프로젝트 내부에서 `fetch` prefix를 쓰고 있다면, 생태계에서 `get`이 더 보편적이더라도
프로젝트 내부 일관성이 우선이다.

### 예외: 의도적 불일치

일관성의 예외로서, **의도적으로 다른 패턴을 사용하여 독자의 주의를 환기해야 하는 상황**이 존재한다.

```typescript
// 기존 패턴: fetchXxxList
const fetchUserList = () => { ... };
const fetchOrderList = () => { ... };

// 의도적 불일치: 이 함수는 단순 조회가 아니라 부수효과가 있음을 강조
const syncAndReplaceProductList = () => { ... };
```

의도적 불일치를 적용하려면 아래 두 조건을 모두 충족해야 한다:

1. 기존 패턴을 따르면 독자가 실제 동작을 **오인할 위험**이 있다
2. 불일치의 이유가 코드 리뷰에서 **설명 가능**하다

---

## P1: 비용 정당화

긴 변수명은 라인을 길게 만들고 한 화면의 코드를 줄인다. Working Memory는 7±2개의 청크로 제한되므로, 보이는 정보량이 줄어들면 전체 맥락 파악이 어려워진다.

### 규칙

**R-B1: 이름의 길이에서 얻는 명확성이, 길이로 인해 발생하는 비용을 정당화해야 한다.**

```typescript
// ❌ 비용 > 효과: 과도하게 긴 이름이 코드의 밀도를 훼손
const currentlyAuthenticatedUserSessionExpirationTimeoutInMilliseconds =
  30 * 60 * 1000;

// ✅ 비용 ≈ 효과: 충분한 정보를 합리적 길이로 전달
const sessionTimeoutMs = 30 * 60 * 1000;
```

판단 기준: **이 이름에서 단어를 하나 빼면 의미가 모호해지는가?**
모호해지지 않는 단어는 제거해도 된다.

**R-B2: 매직 넘버를 상수로 추출할 때, 상수명이 전달하는 정보가 숫자 자체보다 커야 한다.**

```typescript
// ❌ 상수 추출이 오히려 정보를 줄이는 경우
const TWO = 2;
const result = value * TWO;

// ✅ 상수명이 숫자에 의미를 부여하는 경우
const MILLISECONDS_PER_SECOND = 1000;
const sessionTimeout = 30 * 60 * MILLISECONDS_PER_SECOND;
```

---

## 체크리스트

코드 리뷰에서 변수명에 대해 피드백할 때, "가독성이 떨어진다" 대신 아래 체크리스트의 **어떤 항목이 미충족인지** 특정한다.

### P0 체크

- [ ] **의미 전달**: 이 변수명만 보고 담긴 자원의 성격을 유추할 수 있는가?
- [ ] **동사 prefix**: 함수인 경우, 첫 단어가 행위의 성격을 예고하는가?
- [ ] **boolean prefix**: boolean인 경우, `is`/`has`/`should`/`can`이 반환 타입을 명시하는가?
- [ ] **축약어 금지**: 커뮤니티 보편 축약이 아닌 자의적 축약을 사용하고 있지 않은가?
- [ ] **스코프 오염**: 좁은 맥락에서만 쓰이는데 보편적 이름을 가져서, 향후 네이밍을 제약하지 않는가?
- [ ] **export 스코프**: 모듈 외부에서 import될 때, 파일 경로 없이도 출처/의미를 유추할 수 있는가?
- [ ] **유니크함**: 같은 스코프 내에서 인지적으로 혼동 없이 구별되는가?
- [ ] **숫자 접미사 금지**: `user1`/`user2` 대신 역할 차이가 이름에 드러나는가?

### P1 체크

- [ ] **일관성**: 같은 파일/모듈에 유사 패턴이 존재하면, 그 패턴을 따르는가?
- [ ] **의도적 불일치**: 패턴을 깨뜨렸다면, 오인 위험 방지 목적이고 리뷰에서 설명 가능한가?
- [ ] **길이 정당화**: 이름에서 단어를 하나 빼면 의미가 모호해지는가? (아니라면 빼도 된다)
- [ ] **스코프-길이 비례**: 스코프가 넓은 변수에 짧은 이름, 또는 스코프가 좁은 변수에 과도하게 긴 이름을 쓰고 있지 않은가?

