---
title: "TanStack Router Folder Structure Convention"
description: "src-folder-structure 컨벤션을 TanStack Router 파일 기반 라우팅에 매핑하는 전용 가이드입니다."
type: guide
tags: [Architecture, React, TanStackRouter]
order: 3
---

# TanStack Router 폴더 구조 컨벤션

> 이 문서는 [Source Folder Structure](./src-folder-structure.md)의 컨벤션을 TanStack Router/Start의 파일 기반 라우팅 환경에 맞게 매핑합니다. 기본 원칙(300줄 기준, 파일/폴더 선택 규칙, @shared 승격, barrel export 금지, kebab-case)은 모두 동일하게 적용됩니다.

---

## 1. TanStack Router 파일 기반 라우팅 기본 규칙

TanStack Router는 파일 시스템 기반 라우팅을 사용합니다. 다음 규칙은 프레임워크가 강제하며 변경할 수 없습니다:

| 파일/폴더 | 역할 |
|-----------|------|
| `index.tsx` | 라우트 파일 (해당 경로의 페이지 컴포넌트) |
| `__root.tsx` | 루트 레이아웃 |
| `-` prefix | 라우팅에서 제외 (비라우트 파일/폴더) |
| `[param]` | 동적 라우트 파라미터 |
| `_layout` | 레이아웃 라우트 (pathless) |

```
src/routes/
├── __root.tsx              ← 루트 레이아웃 (프레임워크 강제)
├── index.tsx               ← "/" 경로
├── action-props/
│   ├── index.tsx           ← "/action-props" 경로
│   └── -server/            ← "-" prefix → 라우팅 제외
│       └── actions.ts
└── users/
    └── [id]/
        └── index.tsx       ← "/users/:id" 경로
```

---

## 2. 컨벤션 매핑: src-folder-structure → TanStack Router

### 매핑 테이블

| src-folder-structure | TanStack Router | 비고 |
|---|---|---|
| `{context}-page.tsx` | `index.tsx` | 프레임워크 강제, 변경 불가 |
| `{context}-page.sub/` | `-sub/` | `-` prefix 필수 |
| `*.helper.ts` / `*.helper/` | `-helper.ts` / `-helper/` | `-` prefix 필수 |
| `*.ui.tsx` / `*.ui/` | `-ui.tsx` / `-ui/` | `-` prefix 필수 |
| `*.event.ts` | `-event.ts` | `-` prefix 필수 |
| `*.views/` | `-views/` | `-` prefix 필수 |
| `@shared/` | `@shared/` | 라우트 폴더 밖이므로 그대로 |
| (서버 액션) | `-server/` | TanStack Start 전용 |

### 핵심 차이점

**`-` prefix가 필수인 이유:** TanStack Router는 `routes/` 폴더 내 모든 파일/폴더를 라우트로 해석합니다. 비라우트 파일(sub, helper, ui 등)에 `-` prefix를 붙이지 않으면 불필요한 라우트가 생성됩니다.

```typescript
// ❌ "-" prefix 없이 → TanStack Router가 라우트로 인식
action-props/
├── index.tsx
├── sub/                    // 🔴 "/action-props/sub" 라우트로 인식됨
│   └── header.tsx
└── helper.ts               // 🔴 라우트 파일로 처리 시도

// ✅ "-" prefix 사용 → 라우팅에서 제외
action-props/
├── index.tsx
├── -sub/                   // 🟢 라우팅에서 완전 제외
│   └── header.tsx
└── -helper.ts              // 🟢 라우팅에서 완전 제외
```

---

## 3. 페이지명 식별 문제와 해결

### 문제: index.tsx 강제로 인한 페이지 구분 불가

src-folder-structure에서는 `{context}-page.tsx` (예: `intro-page.tsx`)로 파일명에 페이지 맥락을 포함합니다. 하지만 TanStack Router는 모든 라우트 파일이 `index.tsx`여야 하므로, 파일명만으로 페이지를 구분할 수 없습니다.

```typescript
// IDE 탭에 "index.tsx"가 여러 개 열림 → 구분 불가
// Tab 1: index.tsx (어떤 페이지?)
// Tab 2: index.tsx (어떤 페이지?)
// Tab 3: index.tsx (어떤 페이지?)
```

### 해결: 폴더명 + 컴포넌트명으로 맥락 제공

**1) 폴더명이 컨텍스트 역할:**

```
src/routes/
├── action-props/index.tsx       ← 폴더명 "action-props"가 페이지 맥락
├── checkout/index.tsx           ← 폴더명 "checkout"이 페이지 맥락
└── users/[id]/index.tsx         ← 폴더 경로가 페이지 맥락
```

**2) 컴포넌트명에 컨텍스트 포함 (필수):**

```typescript
// src/routes/action-props/index.tsx

export const Route = createFileRoute('/action-props/')({
  component: ActionPropsPage,        // ✅ 컴포넌트명에 맥락 포함
})

function ActionPropsPage() {          // ✅ "ActionProps" + "Page" 접미사
  return (/* ... */)
}
```

```typescript
// ❌ 맥락 없는 컴포넌트명
function Page() { /* ... */ }         // 어떤 페이지인지 알 수 없음
function Component() { /* ... */ }    // 의미 불명확

// ✅ 맥락이 포함된 컴포넌트명
function ActionPropsPage() { /* ... */ }    // 명확
function CheckoutIntroPage() { /* ... */ }  // 명확
```

---

## 4. 실제 구조 예시

### 300줄 이하 (분리 불필요)

대부분의 페이지는 이 구조입니다. `index.tsx` 하나에 모든 로직과 UI를 포함합니다.

```
action-props/
├── index.tsx              ← 라우트 파일 (페이지 전체)
└── -server/
    └── actions.ts         ← TanStack Start 서버 액션
```

```typescript
// action-props/index.tsx
export const Route = createFileRoute('/action-props/')({
  component: ActionPropsPage,
})

function ActionPropsPage() {
  // 비즈니스 로직, UI 모두 포함 (300줄 이하)
  return (/* ... */)
}

// 서브 컴포넌트도 같은 파일 하단에 위치
function TabListDemo() { /* ... */ }
function EditableTextDemo() { /* ... */ }
```

### 300줄 초과 (sub 분리)

```
action-props/
├── index.tsx              ← 라우트 파일 (조합만 담당)
├── -sub/                  ← 하위 컴포넌트
│   ├── tab-list/
│   │   ├── tab-list.tsx
│   │   └── tab-list.ui.tsx
│   └── editable-text/
│       ├── editable-text.tsx
│       └── editable-text.helper.ts
├── -server/               ← 서버 액션
│   └── actions.ts
└── -event.ts              ← 이벤트 명세 (선택)
```

```typescript
// action-props/index.tsx (조합만 담당)
import { TabList } from './-sub/tab-list/tab-list'
import { EditableText } from './-sub/editable-text/editable-text'

export const Route = createFileRoute('/action-props/')({
  component: ActionPropsPage,
})

function ActionPropsPage() {
  return (
    <div>
      <TabList />
      <EditableText />
    </div>
  )
}
```

### 멀티 뷰 (views)

탭/스텝 기반 페이지처럼 조건에 따라 완전히 다른 화면을 보여주는 경우:

```
checkout/
├── index.tsx              ← 라우트 파일 (뷰 전환 로직)
├── -views/
│   ├── intro-view/
│   │   ├── intro-view.tsx
│   │   └── intro-view.sub/
│   │       └── form-section/
│   │           └── form-section.tsx
│   └── result-view/
│       ├── result-view.tsx
│       └── result-view.sub/
│           └── summary/
│               └── summary.tsx
├── -server/
│   └── actions.ts
└── -event.ts
```

### 복잡한 sub 내부 분리 (sub 내부도 300줄 초과)

```
checkout/
├── index.tsx
└── -sub/
    └── payment-form/
        ├── payment-form.tsx           ← 메인 컴포넌트
        ├── payment-form.helper/       ← helper 2개+ → 폴더
        │   ├── validate.ts
        │   └── calculate.ts
        └── payment-form.ui/           ← ui 2개+ → 폴더
            ├── card-input.tsx
            └── amount-display.tsx
```

> **참고:** `-sub/` 내부의 파일/폴더에는 `-` prefix가 불필요합니다. `-sub/` 폴더 자체가 이미 라우팅에서 제외되었기 때문에, 그 하위 파일들은 src-folder-structure의 원래 컨벤션(`.helper.ts`, `.ui.tsx` 등)을 그대로 사용합니다.

---

## 5. 실제 적용 예시: optimistic-actions

`apps/lab`의 `optimistic-actions` 라우트에 컨벤션을 적용한 구조:

```
optimistic-actions/
├── index.tsx                      ← 라우트 파일
├── -sub/                          ← 하위 컴포넌트
│   ├── code-block.tsx             ← 공용 UI (1개 파일)
│   ├── spinner.tsx                ← 공용 UI (1개 파일)
│   ├── tab-list/
│   │   ├── tab-list-problem.tsx
│   │   ├── tab-list-problem-demo.tsx
│   │   ├── tab-list-solution.tsx
│   │   └── tab-list-solution-demo.tsx
│   └── editable-text/
│       ├── editable-text-problem.tsx
│       ├── editable-text-problem-demo.tsx
│       ├── editable-text-solution.tsx
│       └── editable-text-solution-demo.tsx
└── -server/
    └── actions.ts
```

> **포인트:** `-sub/` 내부에서는 `-` prefix 없이 원래 컨벤션(`.helper.ts`, `.ui.tsx`)을 그대로 사용합니다. problem/solution 데모 파일은 관련 컴포넌트와 같은 폴더에 응집시킵니다.

---

## 6. `-` prefix 적용 범위 정리

`-` prefix는 **routes/ 폴더 직속 레벨에서만** 필요합니다:

```
src/routes/                             ← TanStack Router 관할
├── checkout/                           ← 라우트 폴더
│   ├── index.tsx                       ← 라우트 파일
│   ├── -sub/                           ← ✅ "-" 필수 (routes 관할 내)
│   │   └── header/
│   │       ├── header.tsx              ← "-" 불필요 (이미 -sub 안)
│   │       ├── header.helper.ts        ← "-" 불필요
│   │       └── header.ui.tsx           ← "-" 불필요
│   ├── -helper.ts                      ← ✅ "-" 필수 (routes 관할 내)
│   ├── -event.ts                       ← ✅ "-" 필수 (routes 관할 내)
│   └── -server/                        ← ✅ "-" 필수 (routes 관할 내)
│       └── actions.ts
│
├── @shared/                            ← 라우트 폴더 밖 → "-" 불필요
│   ├── ui/
│   └── helper/
│
└── __root.tsx
```

**규칙 요약:**
- `routes/` 폴더 내 비라우트 파일/폴더 → `-` prefix 필수
- `-` prefix가 붙은 폴더 내부 → 원래 컨벤션(`.helper.ts`, `.ui.tsx`) 그대로 사용
- `routes/` 밖의 `@shared/` → `-` prefix 불필요

---

## 7. src-folder-structure 원칙 유지 사항

다음 원칙은 TanStack Router 환경에서도 **동일하게 적용**됩니다:

| 원칙 | 내용 |
|------|------|
| 300줄 기준 | 300줄 이하면 단일 파일 유지, 초과 시 분리 |
| 파일/폴더 선택 | 1개면 파일 (`*.helper.ts`), 2개+면 폴더 (`*.helper/`) |
| @shared 승격 | 2곳 이상에서 사용 시 즉시 `@shared/`로 이동 |
| barrel export 금지 | `index.ts`를 통한 re-export 금지 (라우트 `index.tsx`와 혼동 주의) |
| kebab-case 파일명 | 모든 파일/폴더명에 kebab-case 적용 |
| 컴포넌트 네이밍 | 파일명은 간소하게, 컴포넌트명에 맥락 포함 |
| 이벤트 관리 | 페이지별 `-event.ts`에 통합 관리 |

> **barrel export 주의:** TanStack Router에서 `index.tsx`는 라우트 파일입니다. barrel export용 `index.ts`와 혼동하지 않도록 주의하세요. 이것이 barrel export 금지 원칙을 더욱 강화하는 이유이기도 합니다.

---

## 8. 관련 문서

- [Source Folder Structure](./src-folder-structure.md): 기본 폴더 구조 컨벤션
- [Page Component Structure](./page-component-structure.md): 페이지 컴포넌트 내부 구조 설계
- [TanStack Router File-Based Routing](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing): 공식 문서
