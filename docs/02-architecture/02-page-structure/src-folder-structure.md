---
title: "Source Folder Structure"
description: "서비스별 응집도를 높이기 위한 소스 폴더 구조 원칙과 적용 방법을 상세히 정리합니다."
type: guide
tags: [Architecture, React, BestPractice]
order: 2
---

# 소스 폴더 구조 - 서비스별 응집도 중심 설계

> 📖 **ADR (Architecture Decision Record)**: 이 문서의 설계 결정 과정과 기각된 대안들에 대한 상세한 기록은 [src-folder-structure.adr.md](./src-folder-structure.adr.md)를 참고하세요.

## 📋 설계 요구사항 요약

> 📖 **상세 문서**: 각 요구사항의 학술적/논리적 근거는 [src-folder-structure.requirement.md](./src-folder-structure.requirement.md)를 참고하세요.

이 폴더 구조는 다음 7가지 요구사항을 충족하도록 설계되었습니다:

| # | 요구사항 | 핵심 내용 |
|---|----------|----------|
| 1 | **직관적 의사결정** | 화면 구성을 보고 폴더 구조를 직관적으로 판단 가능 |
| 2 | **구조 → 화면 예측** | 폴더 구조만 보고도 화면이 어떻게 그려질지 예측 가능 |
| 3 | **코드 위치 예측** | 화면의 특정 부분 수정 시 코드 위치를 쉽게 예측 가능 |
| 4 | **수정 범위 격리** | 수정 영향 범위가 해당 부분에 한정되고 응집도 있게 관리 |
| 5 | **자기완결적 구조** | 최소한의 파일만 읽고도 전체 맥락 이해 가능 (LLM 최적화) |
| 6 | **유연한 확장성** | 단순 페이지부터 복잡한 멀티뷰까지 유연하게 수용 |
| 7 | **명확한 컨벤션** | 폴더/파일 컨벤션이 모호하지 않고 단일한 의미로 정의 |

---

## 🚀 Quick Reference

| 상황 | 구조 | 비고 |
|------|------|------|
| 500줄 이하 단일 페이지 | `page.tsx` | 분리 불필요 |
| 500줄 초과 | `page.tsx` + `page.sub/` | sub로 분리 |
| 탭/스텝 멀티뷰 | `page.tsx` + `page.views/` | 드문 케이스 |
| helper 1개 | `*.helper.ts` | 파일 |
| helper 2개+ | `*.helper/` | 폴더 |
| ui 1개 | `*.ui.tsx` | 파일 |
| ui 2개+ | `*.ui/` | 폴더 |
| 2곳 이상 공유 | `@shared/`로 즉시 승격 | 중복 발생 시 |

```
📁 결정 순서
1. 500줄 이하? → 단일 파일 유지
2. 500줄 초과? → *.sub/ 분리
3. sub 내부도 500줄 초과? → *.helper.ts, *.ui.tsx 분리
4. 2곳 이상 사용? → @shared/로 이동
```

---

## 🎯 목적

각 서비스별로 페이지와 관련 리소스(component, api, util)가 높은 응집도를 가지도록 하여, 폴더 구조만 보고도 해당 페이지의 전체 구조를 파악하고 문제 발생 시 빠르게 원인을 찾을 수 있게 합니다.

### 💡 핵심 철학: 구조가 곧 정보
**폴더 구조 자체가 페이지의 비즈니스 로직과 컴포넌트 관계를 표현해야 합니다.**

## 1. 해결하려는 문제

### 문제: 페이지 관련 파일들이 흩어져 있어 유지보수가 어려움

```typescript
// ❌ 관련 파일들이 여러 곳에 분산되어 있는 구조
src/
├── components/
│   ├── products/
│   │   ├── ProductSummary.tsx       // 🔴 상품 관련 컴포넌트
│   │   └── ProductForm.tsx
│   └── common/
│       └── Button.tsx
├── hooks/
│   ├── useProductData.ts            // 🔴 상품 관련 훅
│   └── useAuth.ts
├── utils/
│   ├── priceCalculator.ts           // 🔴 상품 관련 유틸
│   └── formatter.ts
├── pages/
│   └── products/
│       ├── index.tsx                // 🔴 실제 페이지
│       └── checkout/
│           └── intro.tsx
└── styles/
    └── products.module.css          // 🔴 상품 관련 스타일
```

**문제점:**
- **🔍 파일 추적 어려움**: 하나의 페이지를 수정하려면 여러 폴더를 오가며 관련 파일들을 찾아야 함
- **🔍 의존성 파악 불가**: 어떤 컴포넌트가 어떤 페이지에서 사용되는지 명확하지 않음
- **🔍 사이드 이펙트 위험**: 공용 파일 수정 시 영향 범위 예측 어려움
- **🔍 개발 효율성 저하**: 새로운 개발자가 코드 구조 파악에 오랜 시간 소요

## 2. 해결 방법

```typescript
// ✅ 페이지 중심의 응집도 높은 구조
src/
└── products/                        // 🟢 서비스별 최상위 폴더
    ├── @shared/                     // 🟢 products 서비스 전체 공용
    │   ├── ui/
    │   │   └── product-common-header.tsx
    │   └── helper/
    │       ├── useProductCalculator.ts
    │       └── productFormatter.ts
    └── checkout/                    // 🟢 기능별 폴더
        ├── @shared/                 // 🟢 checkout 기능 내 공용
        │   ├── ui/
        │   └── helper/
        │       └── useCheckoutFlow.ts
        │
        │   // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        │   // 📌 Case 1: 단일 뷰 페이지 (대부분의 케이스)
        │   //    - 페이지가 하나의 뷰로 구성된 일반적인 경우
        │   //    - 페이지를 여러 하위 컴포넌트(sub)로 분리
        │   // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        │
        ├── intro/                   // 🟢 페이지별 폴더 (단일 뷰)
        │   ├── intro-page.tsx       // 🟢 페이지 컴포넌트
        │   ├── intro-page.event.ts  // 🟢 이벤트 명세
        │   └── intro-page.sub/      // 🟢 하위 컴포넌트들
        │       ├── header/
        │       │   ├── header.tsx
        │       │   ├── header.helper/       // 로직 (선택사항)
        │       │   │   ├── calculateProgress.ts
        │       │   │   └── calculateProgress.test.ts
        │       │   └── header.ui/           // UI 컴포넌트 (선택사항)
        │       │       ├── title.tsx
        │       │       └── subtitle.tsx
        │       ├── content/
        │       │   ├── content.tsx
        │       │   └── content.ui/
        │       │       └── content-card.tsx
        │       └── submit-button/           // 🟢 특정 컴포넌트도 동일한 패턴
        │           └── submit-button.tsx
        │
        │   // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        │   // 📌 Case 2: 멀티 뷰 페이지 (views > sub 계층 구조)
        │   //    - 하나의 페이지에 여러 독립적인 뷰가 존재하는 경우
        │   //    - 예: 탭/스텝 기반 페이지, 조건부 렌더링으로 완전히 다른 화면 표시
        │   // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        │
        └── result/
            └── [id]/
                ├── result-detail-page.tsx
                ├── result-detail-page.event.ts
                └── result-detail-page.views/    // 🟢 여러 뷰가 존재하는 경우
                    ├── summary-view/
                    │   ├── summary-view.tsx
                    │   └── summary-view.sub/    // 🟢 뷰의 하위 컴포넌트들
                    │       ├── overview/
                    │       │   ├── overview.tsx
                    │       │   └── overview.ui.tsx        // 1개면 파일
                    │       └── metrics/
                    │           ├── metrics.tsx
                    │           ├── metrics.helper.ts      // 1개면 파일
                    │           └── metrics.ui.tsx         // 1개면 파일
                    └── detail-view/
                        ├── detail-view.tsx
                        └── detail-view.sub/
                            ├── product-info/
                            │   ├── product-info.tsx
                            │   └── product-info.ui.tsx       // 1개면 파일
                            └── price-breakdown/
                                ├── price-breakdown.tsx
                                └── price-breakdown.ui.tsx // 1개면 파일
```

> **💡 폴더 구조 용어 정리**
> 
> | 폴더 | 의미 | 사용 시점 |
> |------|------|----------|
> | `*.views/` | 완전히 다른 화면 | 탭/스텝/조건부 렌더링 (드문 케이스) |
> | `*.sub/` | 모든 하위 컴포넌트 | 500줄 초과 시 분리 |
> | `*.helper/` | 비즈니스 로직 | sub 내부 500줄 초과 시 |
> | `*.ui/` | Presentational 컴포넌트 | sub 내부 500줄 초과 시 |
>
> **⚠️ 불필요한 sub 분리 금지**
>
> sub 분리는 **분리할 코드가 500줄 이상일 때만** 합니다. 불필요한 depth가 추가되면 응집도가 오히려 떨어집니다:
>
> ```typescript
> // ❌ 나쁜 예: 500줄 미만인데 불필요하게 분리
> intro-page.sub/
> └── header/
>     ├── header.tsx                 // 200줄인데 굳이 sub 분리
>     └── header.sub/
>         ├── title/                 // 50줄을 또 분리
>         └── subtitle/              // 30줄을 또 분리 → 깊이만 깊어짐
>
> // ✅ 좋은 예: 500줄 이상일 때만 분리
> intro-page.sub/
> └── header.tsx                     // 200줄이면 파일 하나로 충분
> ```
>
> **📁 파일 vs 폴더 선택 기준**
> 
> `helper`, `sub`, `ui` 모두 **단일 파일 또는 폴더** 중 선택 가능합니다:
> 
> ```typescript
> // ✅ 단일 파일로 충분한 경우
> header/
> ├── header.tsx
> ├── header.helper.ts      // helper가 1개 파일이면 *.helper.ts
> └── header.ui.tsx         // ui가 1개 파일이면 *.ui.tsx
> 
> // ✅ 여러 파일이 필요한 경우
> header/
> ├── header.tsx
> ├── header.helper/        // helper가 2개+ 파일이면 폴더
> │   ├── calculateProgress.ts
> │   └── formatData.ts
> └── header.ui/            // ui가 2개+ 파일이면 폴더
>     ├── title.tsx
>     └── progress-bar.tsx
> 
> // ✅ sub도 동일한 규칙 적용
> intro-page.sub.tsx        // sub 컴포넌트가 1개면 단일 파일
> intro-page.sub/           // sub 컴포넌트가 2개+ 면 폴더
> ├── header/
> └── content/
> ```
>
> **🚫 Barrel Export (index.ts) 사용 금지**
> 
> ```typescript
> // ❌ index.ts를 통한 re-export 금지
> import { calculateProgress } from './header.helper';
> 
> // ✅ 상대경로로 직접 import
> import { calculateProgress } from './header.helper/calculateProgress';
> ```
> 
> **이유:**
> - 번들 사이즈 증가 (tree-shaking 방해)
> - 순환 참조 위험
> - 실제 파일 위치 추적 어려움

### 달성되는 효과

- **🔍 빠른 파일 탐색**: 페이지 관련 모든 파일이 한 곳에 모여 있어 즉시 접근 가능
- **🚀 개발 효율성**: 새로운 기능 추가 시 어디에 위치시킬지 명확함
- **🔧 안전한 수정**: 특정 페이지 수정이 다른 페이지에 영향을 주지 않음
- **📋 구조적 이해**: 폴더 구조만 보고도 서비스의 전체 기능 파악 가능

## 3. 핵심 원칙

### 🎯 폴더 구조 결정 플로우

```
┌─────────────────────────────────────────────────────────────┐
│  📁 폴더 구조 결정 플로우                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 파일이 500줄 이하인가?                                   │
│     → Yes: 단일 파일 유지 ✅                                 │
│     → No: 2번으로                                            │
│                                                              │
│  2. 무엇을 분리할 것인가?                                    │
│     ┌─────────────────┬────────────────────────────────────┐│
│     │ 분리 대상        │ 사용 패턴                          ││
│     ├─────────────────┼────────────────────────────────────┤│
│     │ 하위 컴포넌트 1개│ *.sub.tsx (파일)                   ││
│     │ 하위 컴포넌트 2개+│ *.sub/ (폴더)                     ││
│     │ 완전히 다른 화면 │ *.views/summary-view/              ││
│     └─────────────────┴────────────────────────────────────┘│
│                                                              │
│  3. Sub 내부가 500줄 초과인가?                               │
│     → Yes: .helper, .ui 분리 (1개면 파일, 2개+면 폴더)       │
│     → No: 단일 파일 유지                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 📏 파일 분리 기준: 500줄 (LLM 최적화)

> **🤖 LLM 토큰 관점의 파일 크기 가이드**
> 
> | 코드 라인 수 | 대략적인 토큰 | LLM 작업 효율 |
> |-------------|--------------|---------------|
> | ~500줄 | ~10K tokens | ⭐ 최적 - 응집도 + 맥락 유지 |
> | 500-700줄 | 10K-14K tokens | ⚠️ 경계 - 분리 고려 |
> | 700줄+ | 14K+ tokens | ❌ 분리 권장 |
> 
> **핵심 원칙:** 과도한 파일 분리는 오히려 응집도를 해칩니다. **500줄 이하면 한 파일에 유지**하는 것이 LLM이 전체 맥락을 파악하고 일관된 코드를 생성하는 데 유리합니다.

#### 🟢 500줄 이하: 단일 파일 유지 (권장)
```typescript
// ✅ 500줄 이하면 helper, ui 분리 없이 한 파일에 모든 것을 포함
// 적용 범위: Page, View, Sub 등 모든 레이어에 동일 적용

intro-page/
├── intro-page.tsx          // 400줄 - 로직, UI, 스타일 모두 포함 ✅
└── intro-page.event.ts     // 이벤트만 별도 관리

// intro-page.tsx 내용 예시 (400줄 단일 파일)
const IntroPage = () => {
  // 비즈니스 로직 (100줄 정도)
  const { data, isLoading } = useProductData();
  const progress = calculateProgress(data);

  const handleNext = () => { /* ... */ };
  const handleBack = () => { /* ... */ };

  return (
    <div className="p-5 bg-white">
      <ProgressBar value={progress} />
      <h1 className="text-2xl font-bold">상품 소개</h1>
      <p className="text-gray-600">진행 상황을 확인하세요</p>
      <SubmitButton onClick={handleNext} />
    </div>
  );
};

// 🎨 UI 컴포넌트들 - 같은 파일 하단에 위치
const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-gray-200 rounded">
    <div className="h-full bg-primary rounded" style={{ width: `${value}%` }} />
  </div>
);

const SubmitButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="btn-primary">다음</button>
);

// 🔧 Helper 함수들 - 같은 파일 하단에 위치
const calculateProgress = (data: ProductData) => {
  // 계산 로직...
  return percentage;
};
```

#### 🟡 500줄 초과: `*.sub/` 폴더로 분리
```typescript
// ✅ 500줄 초과 시 하위 컴포넌트를 sub 폴더로 분리
intro-page/
├── intro-page.tsx              // 메인 페이지 컴포넌트
├── intro-page.event.ts         // 이벤트 명세
└── intro-page.sub/             // 🟢 하위 컴포넌트들
    ├── header/                 // 헤더 영역
    │   └── header.tsx
    ├── content/                // 콘텐츠 영역
    │   └── content.tsx
    └── submit-button/          // 제출 버튼 (복잡한 로직 포함)
        └── submit-button.tsx
```

#### 🔴 Sub 내부도 500줄 초과: `.helper`, `.ui` 분리
```typescript
// ✅ Sub 컴포넌트 내부가 500줄 초과 시 추가 분리
intro-page.sub/
└── header/
    ├── header.tsx              // 메인 컴포넌트 (Smart)
    │
    │   // 단일 파일로 충분하면 *.helper.ts
    ├── header.helper.ts        // helper가 1개면 파일
    │
    │   // 여러 파일이 필요하면 폴더
    ├── header.helper/          // helper가 2개+ 면 폴더
    │   ├── calculateProgress.ts
    │   └── formatData.ts
    │
    │   // ui도 동일한 규칙
    ├── header.ui.tsx           // ui가 1개면 파일
    └── header.ui/              // ui가 2개+ 면 폴더
        ├── progress-bar.tsx
        └── title.tsx
```

> **💡 분리 기준 가이드라인**  
> 
> **단일 파일 유지 (500줄 이하):**
> - `.helper/`, `.ui/`, `.sub/` 폴더 분리 불필요
> - 로직, UI 컴포넌트, 스타일 모두 한 파일에 포함
> - **모든 레이어(Page, View, Sub)에 동일 적용**
> - LLM이 전체 맥락을 파악하여 일관된 코드 생성 가능
> 
> **파일 내부 배치 순서:**
> 1. 메인 컴포넌트 (상단)
> 2. 서브 UI 컴포넌트들
> 3. Helper 함수들
> 4. 스타일 관련 코드 (최하단)
> 
> **분리 고려 시점 (500줄 초과):**
> - 파일이 500줄을 초과하여 스크롤이 과도해짐
> - 특정 로직이 독립적으로 테스트가 필요함
> - 여러 개발자가 동시에 같은 영역 작업 시 충돌 방지 필요

### 🎯 View vs Sub 선택 기준

| 구분 | `*.sub/` (기본) | `*.views/` (드문 케이스) |
|------|----------------|------------------------|
| **용도** | 모든 하위 컴포넌트 | 완전히 다른 화면/UI |
| **예시** | 헤더, 콘텐츠, 버튼, 모달 | 탭1 화면, 탭2 화면, 로그인/비로그인 뷰 |
| **특징** | 동시에 화면에 표시될 수 있음 | 조건에 따라 하나만 표시됨 |
| **사용 빈도** | 대부분의 페이지 | 복잡한 멀티스텝/탭 페이지만 |

```typescript
// 📌 단일 뷰 페이지 (대부분) - sub만 사용
intro-page/
├── intro-page.tsx
└── intro-page.sub/
    ├── header/
    ├── content/
    └── footer/

// 📌 멀티 뷰 페이지 (드문 케이스) - views > sub 계층
result-page/
├── result-page.tsx
└── result-page.views/           // 완전히 다른 화면들
    ├── summary-view/
    │   ├── summary-view.tsx
    │   └── summary-view.sub/    // 해당 뷰의 하위 컴포넌트
    │       ├── overview/
    │       └── metrics/
    └── detail-view/
        ├── detail-view.tsx
        └── detail-view.sub/
            ├── product-info/
            └── schedule/
```

### 📝 파일명 간소화 원칙

#### 0️⃣ 페이지 파일명 규칙: `{context}-page.tsx`

> **🎯 핵심 원칙: 파일은 단독으로 참조될 수 있어야 한다**

```typescript
// ✅ 권장: 파일명에 맥락 포함
products/checkout/intro/
├── intro-page.tsx              // 파일명만으로 "intro 페이지"임을 알 수 있음
├── intro-page.event.ts
└── intro-page.sub/

// ❌ 지양: 파일명에 맥락 없음
products/checkout/intro/
├── page.tsx                    // 파일명만으로는 어떤 페이지인지 알 수 없음
├── page.event.ts
└── page.sub/
```

| 상황 | `page.tsx` | `intro-page.tsx` |
|------|-----------|------------------|
| **파일 검색** | `page.tsx` 결과 수십 개 → 어느 페이지? | `intro-page` 검색 → 즉시 특정 |
| **IDE 탭** | 탭 5개 모두 `page.tsx` → 구분 불가 | 각 페이지명으로 즉시 구분 |
| **에러 스택트레이스** | `at page.tsx:42` → 어느 페이지? | `at intro-page.tsx:42` → 명확 |
| **PR 코멘트/코드 리뷰** | "page.tsx 23번 줄" → 맥락 필요 | "intro-page.tsx 23번 줄" → 즉시 이해 |
| **LLM 파일 읽기** | 경로 전체를 파싱해야 맥락 파악 | 파일명만으로 맥락 획득 |
| **Git blame/history** | `page.tsx` 변경 이력 → 혼란 | 파일명으로 히스토리 추적 용이 |

> **💡 왜 prefix를 붙이는가?**
> 
> 폴더 구조가 맥락을 제공하지만, **파일이 단독으로 참조되는 상황**이 빈번합니다:
> - IDE 탭, 에러 스택, PR 코멘트, 검색 결과 등
> - 이때 파일명만으로 맥락을 파악할 수 없으면 추가 탐색 비용 발생
> - 폴더명과 파일명의 "중복"이 아닌 **의도적 명시**로 봐야 함
>
> **상세 결정 근거**: [ADR - 페이지 파일명 규칙](./src-folder-structure.adr.md#16-페이지-파일명에-맥락-포함-여부) 참고

> **⚠️ 파일명 중복 시 처리**
> 
> 동일한 파일명이 이미 존재하는 경우, **부모 폴더 등 맥락을 추가**하여 고유성을 확보합니다.
> 
> ```typescript
> // 기본: 폴더명 + page
> dashboard/analytics/
> ├── analytics-page.tsx             // 고유한 이름 → 폴더명만
>
> // 중복 발생 시: 부모 폴더 추가 (개발자 판단)
> products/checkout/intro/
> ├── checkout-intro-page.tsx        // "intro"가 다른 곳에도 있음 → 부모 추가
>
> blog/posts/intro/
> ├── posts-intro-page.tsx           // 다른 도메인의 "intro"와 구분
> ```
> 
> **참고**: 중복 감지가 필요한 경우 PR 검증 스크립트 도입 검토 (현재 미구현)

#### 1️⃣ 긴 파일명 문제
```typescript
// ❌ 기존: 파일명에 모든 맥락 포함 (과도하게 긴 이름)
product-checkout-intro-page-header-component.tsx
product-checkout-intro-page-content-component.tsx
product-checkout-intro-page-footer-component.tsx

// ✅ 개선: 폴더 구조로 맥락 제공, 파일명은 간소화
intro-page.sub/
├── header/
│   ├── header.tsx
│   ├── header.helper.ts        // 1개면 파일
│   └── header.ui.tsx           // 1개면 파일
├── content/
│   ├── content.tsx
│   └── content.ui.tsx          // 1개면 파일
└── footer/
    ├── footer.tsx
    └── footer.ui.tsx           // 1개면 파일
```

#### 2️⃣ 컴포넌트 네이밍 원칙
```typescript
// 🔧 파일명은 간소하지만, 컴포넌트 네이밍에는 맥락 포함 필수
// 파일: intro-page.sub/header/header.tsx
export const CheckoutIntroHeader = () => { /* ... */ };

// 파일: intro-page.sub/content/content.tsx
export const CheckoutIntroContent = () => { /* ... */ };

// 파일: intro-page.sub/submit-button/submit-button.tsx
export const CheckoutSubmitButton = () => { /* ... */ };
```

> **🚨 파일명 정책**  
> 
> **1. 한글 파일명 지양:**
> - **터미널 호환성**: 일부 터미널 환경에서 한글 파일명 인식 불가
> - **LLM 도구 제약**: AI 개발 도구에서 한글 파일명 처리 시 오류 발생
> - **자동화 도구 이슈**: Nx 버전업, 빌드 스크립트 등에서 regex 패턴 매칭 실패
> 
> **2. Kebab-case 사용:**
> - **Git 대소문자 구분 이슈 방지**: 파일명 변경 시 발생할 수 있는 Git 추적 오류 해결
> - **일관성 유지**: 이미 프로젝트에서 kebab-case 정책 사용 중

#### 3️⃣ 플랫폼 변형(Platform Variants) 분리
```typescript
// ✅ 플랫폼별 명시적 분리가 필요한 경우 (예: desktop/mobile)
intro-page/
├── intro-page.desktop.tsx      // Desktop 전용 페이지
├── intro-page.mobile.tsx       // Mobile 전용 페이지
├── intro-page.event.ts         // 공통 이벤트 명세
└── intro-page.sub/
    ├── header/
    │   ├── header.desktop.tsx  // Desktop 전용 헤더
    │   ├── header.mobile.tsx   // Mobile 전용 헤더
    │   ├── header.desktop.helper/ // Desktop 전용 helper
    │   └── header.mobile.helper/  // Mobile 전용 helper
    └── content/                // 공통 콘텐츠 영역
        └── content.tsx
```

> **🔧 플랫폼 분리 규칙**
>
> **기본 원칙:**
> - **명시적 분리**: 플랫폼별로 다른 동작을 해야 하는 경우에만 분리
> - **공통 우선**: 가능한 한 공통 컴포넌트 사용하고, 차이점만 분리
>
> **파일 네이밍:**
> - **단일 확장자**: `page.desktop.tsx`, `page.mobile.tsx`
> - **폴더 + prefix**: `page.desktop.helper/`, `page.mobile.ui/`
> - **중첩 확장자 금지**: `page.desktop.helper.ts` ❌ → `page.desktop.helper/` ✅

### 🏗️ Sub 컴포넌트 구조화
```typescript
// ✅ Sub를 중심으로 helper와 UI 컴포넌트 조직화

// 📌 간단한 경우: 단일 파일
header/
├── header.tsx                  // 메인 컴포넌트
├── header.helper.ts            // helper 1개 → 파일
└── header.ui.tsx               // ui 1개 → 파일

// 📌 복잡한 경우: 폴더 구조 (상대경로로 직접 import)
header/
├── header.tsx                  // 메인 컴포넌트 (Smart Component)
├── header.helper/              // helper 2개+ → 폴더
│   ├── calculateProgress.ts
│   └── calculateProgress.test.ts
└── header.ui/                  // ui 2개+ → 폴더
    ├── progress-bar.tsx
    └── title.tsx

// 📌 helper 폴더 내부에서 특정 기능이 복잡해질 때
// helper 내부에서도 동일한 파일/폴더 확장 규칙 적용

// Case 1: 단순한 helper들만 있는 경우
payment-form/
├── payment-form.tsx
└── payment-form.helper/
    ├── format.ts                   // 단순 helper 파일
    ├── validate.ts                 // 단순 helper 파일
    └── calculate.ts                // 단순 helper 파일

// Case 2: calculate가 복잡해져서 내부 구현 분리가 필요한 경우
payment-form/
├── payment-form.tsx
└── payment-form.helper/
    ├── format.ts                   // 단순 helper 파일
    ├── validate.ts                 // 단순 helper 파일
    ├── calculate.ts                // 🟢 외부 공개 (내부 구현을 조합)
    └── calculate.helper.ts         // 내부 구현 (calculate.ts가 사용)

// Case 3: calculate 내부 구현이 더 많아져서 폴더로 확장
payment-form/
├── payment-form.tsx
└── payment-form.helper/
    ├── format.ts                   // 단순 helper 파일
    ├── validate.ts                 // 단순 helper 파일
    ├── calculate.ts                // 🟢 외부 공개 (내부 구현을 조합)
    └── calculate.helper/           // 내부 구현 폴더 (calculate.ts가 사용)
        ├── interest.ts
        └── fee.ts
```

### 📁 파일 유형별 위치 가이드

```typescript
// ✅ 파일 유형별 권장 위치
header/
├── header.tsx                  // 메인 컴포넌트 (Smart)
├── header.helper.ts            // 로직, hooks, 상수 포함
├── header.ui.tsx               // Presentational 컴포넌트
├── header.types.ts             // 타입 정의 (선택)
└── header.test.ts              // 테스트 (co-located)
```

> **📋 파일 유형별 상세 가이드**
> 
> | 파일 유형 | 위치 | 포함 내용 |
> |----------|------|----------|
> | **메인 컴포넌트** | `*.tsx` | 상태 관리, 이벤트 핸들링, 렌더링 로직 |
> | **Helper** | `*.helper.ts` | 비즈니스 로직, hooks(useXxx), 상수, 계산 함수 |
> | **UI** | `*.ui.tsx` | Presentational 컴포넌트, 스타일 컴포넌트 |
> | **Types** | `*.types.ts` | 페이지/뷰 내 공유 타입 (선택사항) |
> | **Test** | `*.test.ts` | 단위 테스트 (co-located) |
> 
> **💡 Helper에 포함되는 것들:**
> - 커스텀 hooks (`useHeaderData`, `useFormValidation`)
> - 비즈니스 로직 함수 (`calculateProgress`, `formatProductData`)
> - 상수 값 (`MAX_RETRY_COUNT`, `ANIMATION_DURATION_MS`)
> - 유효성 검사 (`validateInput`, `isValidAmount`)
>
> **🌐 API 레이어 위치**
> - **API 함수 정의**: 공유 API 레이어에서 중앙 관리 (예: `shared/api/`, `libs/api/` 등)
> - **API 호출 방식**: 사용처에 따라 선택
>   - React Query hooks (`useQuery`, `useMutation`)
>   - Suspensive (`SuspenseQuery`, `SuspenseMutation`)
>   - 직접 호출 (이벤트 핸들러 내부)
> - **페이지 전용 가공 로직**: `*.helper.ts`에 포함
>
> **📝 Types 파일 사용 기준**
> - 페이지나 뷰 레벨에서 **여러 sub 컴포넌트가 공유**하는 타입이 있을 때 `*.types.ts` 추가
> - 단일 컴포넌트 내부에서만 사용하는 타입은 해당 파일 상단에 정의
> - API 응답 타입은 공유 API 레이어 또는 스키마 자동 생성 도구 사용

> **🚨 상수 네이밍 규칙**
> 
> 상수는 `constants`라는 추상적인 이름 대신, **목적과 의미가 명확히 드러나는 이름**을 사용합니다:
> 
> ```typescript
> // ❌ 추상적인 네이밍
> header.constants.ts           // 무슨 상수인지 불명확
> export const VALUE_1 = 100;   // 의미 없음
> export const CONFIG = {...};  // 너무 일반적
> 
> // ✅ 목적이 명확한 네이밍
> header.helper.ts              // helper에 상수 포함
> export const MAX_TITLE_LENGTH = 50;           // 제목 최대 길이
> export const PROGRESS_ANIMATION_MS = 300;     // 진행바 애니메이션 시간
> export const ORDER_STATUS_LABELS = {           // 주문 상태 라벨
>   pending: '처리중',
>   confirmed: '확인됨',
>   cancelled: '취소됨',
> } as const;
> ```
> 
> **원칙:** 상수명만 보고도 "이 값이 무엇을 위한 것인지" 알 수 있어야 합니다.

> **💡 UI 폴더 구조 (`*.ui/`)**  
> 
> `*.ui/` 폴더에는 **Presentational(Dumb) 컴포넌트**가 위치합니다.
> 
> | 구분 | 메인 컴포넌트 (Smart) | UI 컴포넌트 (Dumb) |
> |------|----------------------|-------------------|
> | **위치** | `header.tsx` | `header.ui/*.tsx` |
> | **역할** | 로직, 상태 관리, 데이터 페칭 | 순수 렌더링 |
> | **특징** | 비즈니스 로직 포함 | props만 받아서 렌더링 |
> | **예시** | API 호출, 이벤트 핸들링 | 카드, 버튼, 타이틀 등 |
> 
> **작성 방식:** Tailwind CSS 등 스타일링 도구 또는 일반 React 컴포넌트

### 📊 Page Event 관리 원칙
```typescript
// ✅ 페이지별 이벤트 명세 통합 관리
// intro-page.event.ts
/**
 * 결제 소개 페이지 이벤트 명세
 * - 응집도보다는 문서화와 이벤트 추적을 우선시
 * - 페이지 내 모든 이벤트를 한 곳에서 관리
 */

// 페이지 진입 이벤트
export const CHECKOUT_INTRO_PAGE_VIEW = 'checkout_intro_page_view';

// 헤더 영역 이벤트 (header.tsx에서 발생)
export const CHECKOUT_INTRO_HEADER_BACK_CLICK = 'checkout_intro_header_back_click';
export const CHECKOUT_INTRO_HEADER_HELP_CLICK = 'checkout_intro_header_help_click';

// 콘텐츠 영역 이벤트 (content.tsx에서 발생)
export const CHECKOUT_INTRO_CONTENT_STEP_CLICK = 'checkout_intro_content_step_click';
export const CHECKOUT_INTRO_CONTENT_BENEFIT_VIEW = 'checkout_intro_content_benefit_view';

// 푸터 영역 이벤트 (footer.tsx에서 발생)
export const CHECKOUT_INTRO_NEXT_BUTTON_CLICK = 'checkout_intro_next_button_click';
export const CHECKOUT_INTRO_TERMS_AGREE_CLICK = 'checkout_intro_terms_agree_click';
```

> **🎯 이벤트 관리 철학**  
> 
> **응집도 포기의 이유:**
> - **문서화 우선**: 페이지의 모든 이벤트를 한눈에 파악 가능
> - **이벤트 추적 용이**: 분석팀이나 기획팀에서 이벤트 명세 확인 시 단일 파일 참조
> - **중복 방지**: 동일한 이벤트명 사용 방지 및 네이밍 일관성 보장
> 
> **트레이드오프 수용:** 각 sub 컴포넌트가 상위 폴더의 event 파일을 import해야 하는 응집도 저하를 감수

### 📂 @shared 폴더 활용
```typescript
// ✅ 공용 리소스의 명확한 스코프 정의
src/
└── products/
    ├── @shared/                     // products 서비스 전체에서 공용
    │   ├── ui/                      // 🟢 공용 UI 컴포넌트
    │   │   ├── form/
    │   │   │   ├── product-input.tsx
    │   │   │   └── product-select.tsx
    │   │   └── layout/
    │   │       ├── product-header.tsx
    │   │       └── product-footer.tsx
    │   └── helper/                  // 🟢 로직, hooks, 유틸, 상수 모두 포함
    │       ├── calculation/
    │       │   ├── price-calculator.ts
    │       │   └── discount-calculator.ts
    │       ├── validation/
    │       │   └── product-validator.ts
    │       └── formatting/
    │           ├── currency-formatter.ts
    │           └── date-formatter.ts
    └── checkout/
        ├── @shared/                 // checkout 기능 내에서만 공용
        │   ├── ui/
        │   └── helper/
        ├── intro/                   // intro 페이지 전용
        └── result/                  // result 페이지 전용
```

#### @shared에서 Sub/View 공유하기

여러 페이지에서 **복잡한 Sub 컴포넌트나 View**를 공유해야 하는 경우, `@shared/sub/` 또는 `@shared/views/`를 사용할 수 있습니다.

```typescript
// ✅ 복잡한 Sub 컴포넌트 공유
checkout/
├── @shared/
│   ├── ui/                          // 단순 UI 컴포넌트
│   │   └── order-badge.tsx
│   │
│   ├── sub/                         // 🟢 복잡한 Sub 컴포넌트 공유
    │   │   └── order-summary/           // intro, result 모두에서 사용
    │   │       ├── order-summary.tsx
    │   │       ├── order-summary.helper.ts
    │   │       └── order-summary.ui/    // 2개+ 면 폴더
    │   │           ├── summary-card.tsx
    │   │           └── summary-chart.tsx
│   │
│   └── views/                       // 🟢 공용 View 공유 (드문 케이스)
│       └── error-view/              // 여러 페이지에서 재사용하는 에러 화면
│           ├── error-view.tsx
│           └── error-view.ui.tsx
│
├── intro/
│   ├── intro-page.tsx
│   └── intro-page.sub/
│       ├── header/
│       └── content/
│           └── content.tsx          // @shared/sub/order-summary 사용
│
└── result/
    ├── result-page.tsx
    └── result-page.sub/
        └── overview/
            └── overview.tsx         // @shared/sub/order-summary 사용
```

> **💡 @shared 승격 기준**
> 
> | 상황 | 액션 |
> |------|------|
> | 1곳에서만 사용 | 해당 페이지/컴포넌트 내부에 위치 |
> | **2곳 이상에서 사용** | **즉시 `@shared/`로 승격** |
> 
> - 중복이 발생하는 순간 바로 `@shared/`로 이동
> - git blame 보존을 위해 `git mv` 사용 권장

> **💡 @shared/sub vs @shared/ui 선택 기준**
> 
> | 구분 | `@shared/ui/` | `@shared/sub/` |
> |------|---------------|----------------|
> | **복잡도** | 단순 (props만 받아서 렌더링) | 복잡 (로직, 상태, helper 포함) |
> | **구조** | 단일 파일 | 폴더 구조 (helper, ui 포함 가능) |
> | **예시** | `OrderBadge`, `ProductCard` | `OrderSummary`, `PriceCalculator` |
> | **사용 시점** | Presentational 컴포넌트 공유 | 비즈니스 로직 포함 컴포넌트 공유 |

> **💡 하위 폴더 구조화 권장사항**  
> 
> **ui/, helper/ 하위 구조:**
> - **소규모**: flat 구조 유지 (파일 수가 적을 때)
> - **중대규모**: 목적별/기능별 그룹화 권장
>   - `form/`, `layout/`, `modal/` (UI 컴포넌트)
>   - `calculation/`, `validation/`, `formatting/` (헬퍼)
> 
> **적용 기준:** 팀 상황과 프로젝트 복잡도에 따라 자율적 판단

> **💡 helper 폴더에 포함되는 것들**
> 
> `helper`는 모든 로직 관련 코드를 포함합니다 (utils 구분 없음):
> - 비즈니스 로직 (`calculateTotalPrice`, `formatOrderStatus`)
> - 범용 유틸리티 (`formatCurrency`, `formatDate`)
> - 커스텀 hooks (`usePriceCalculator`, `useFormValidation`)
> - 상수 값 (`MAX_RETRY_COUNT`, `ANIMATION_DURATION_MS`)
> - 유효성 검사 (`validateInput`, `isValidAmount`)

## 4. 주의사항 (Caveat)

### ❌ 과도한 폴더 중첩으로 인한 복잡성 증가

```typescript
// ❌ 의미 없는 깊은 중첩 구조
intro/
├── intro-page.tsx
└── intro-page.sub/
    └── header/
        └── header.ui/
            └── title-part/
                └── title-part.ui/
                    └── title-text/
                        └── title-text.ui/
                            └── text-span.tsx  // 🔴 8단계 중첩
```

**문제점:**
- **🔴 과도한 depth**: 파일 접근을 위해 너무 많은 폴더를 탐색해야 함
- **🔴 의미 없는 분할**: 실질적인 구조적 의미가 없는 중첩
- **🔴 개발 경험 저하**: IDE에서 파일 탐색이 불편해짐

**✅ 해결책: 의미 있는 분할만 유지**

```typescript
// ✅ 실제 필요에 따른 적절한 구조
intro/
├── intro-page.tsx
├── intro-page.event.ts
└── intro-page.sub/
    ├── header/
    │   ├── header.tsx
    │   ├── header.helper.ts    // 1개면 파일
    │   └── header.ui/          // 2개+ 면 폴더
    │       ├── title.tsx
    │       └── subtitle.tsx
    └── content/
        ├── content.tsx
        └── content.ui.tsx      // 1개면 파일
```

### ❌ 모든 파일을 무조건 분리하려는 시도

```typescript
// ❌ 불필요한 파일 분리
simple-button/
├── index.ts
├── simple-button.tsx          // 10줄
├── simple-button.helper.ts    // 5줄
├── simple-button.styles.ts    // 8줄
└── simple-button.types.ts     // 3줄
```

**문제점:**
- **🔴 파일 관리 오버헤드**: 간단한 컴포넌트에 너무 많은 파일
- **🔴 개발 속도 저하**: 작은 수정에도 여러 파일을 열어야 함
- **🔴 인지 부하 증가**: 전체적인 코드 흐름 파악이 어려워짐

**✅ 해결책: 500줄 이하면 분리하지 않음**

```typescript
// ✅ 500줄 이하면 하나의 파일로 유지 (응집도 우선)
simple-button.tsx              // 50줄 정도의 간단한 컴포넌트 - 분리 불필요
```

### ❌ @shared 폴더의 무분별한 사용

```typescript
// ❌ 실제로는 한 곳에서만 사용되는데 @shared에 위치
products/
├── @shared/
│   ├── ui/
│   │   ├── intro-specific-header.tsx    // 🔴 intro에서만 사용
│   │   ├── result-only-card.tsx         // 🔴 result에서만 사용
│   │   └── checkout-button.tsx          // 🔴 checkout에서만 사용
```

**문제점:**
- **🔴 잘못된 추상화**: 실제로는 공용이 아닌 컴포넌트들이 @shared에 위치
- **🔴 의존성 혼란**: 어떤 페이지에서 사용되는지 명확하지 않음
- **🔴 불필요한 결합**: 실제로는 독립적인 컴포넌트들이 같은 폴더에 위치

**✅ 해결책: 실제 사용 범위에 따른 배치**

```typescript
// ✅ 실제 사용 범위에 맞는 위치
products/
├── @shared/                           // 정말 여러 곳에서 사용
│   └── ui/
│       └── product-common-header.tsx  // intro, result, checkout 모두 사용
├── checkout/
│   ├── @shared/                       // checkout 내에서만 공용
│   │   └── ui/
│   │       └── checkout-button.tsx
│   ├── intro/
│   │   └── intro-page.sub/
│   │       └── intro-specific-header/  // intro에서만 사용
│   └── result/
│       └── result-page.sub/
│           └── result-only-card/       // result에서만 사용
```

**주의사항 요약:** 의미 있는 분할만 수행, 크기 기준 준수, 실제 사용 범위에 맞는 @shared 활용

## 5. 사용된 레퍼런스

### 적용 가능한 프로젝트 유형
- **이커머스**: 상품, 결제, 주문 관리 등 도메인별 페이지 구조화
- **대시보드**: 분석, 설정, 리포트 등 기능별 폴더 구조 설계
- **콘텐츠 플랫폼**: 블로그, 포스트, 카테고리 등 서비스별 구조화

### 폴더 구조 시각화 도구
- [Tree Structure Visualizer](https://tree.nathanfriend.io/) - 폴더 구조 설계 및 공유

### 관련 아티클
- [Atomic Design Pattern의 Best Practice 여정기](https://yozm.wishket.com/magazine/detail/1531/)
- [React Folder Structure Best Practice](https://www.robinwieruch.de/react-folder-structure/)
- [Evolution of a React folder structure and why to group by features right away](https://profy.dev/article/react-folder-structure)
- [Colocating React component files: the tools you need](https://medium.com/trabe/colocating-react-component-files-the-tools-you-need-c377a61382d3)
- [Delightful React File/Directory Structure](https://www.joshwcomeau.com/react/file-structure/)

## 6. 더 알아보기

### 폴더 구조 설계의 장점

**개발 효율성:**
- **빠른 컨텍스트 스위칭**: 관련 파일들이 한 곳에 모여 있어 빠른 작업 전환
- **명확한 파일 위치**: 새로운 파일을 어디에 만들어야 할지 고민할 필요 없음
- **안전한 리팩토링**: 특정 기능 수정이 다른 기능에 미치는 영향 최소화

**팀 협업 효율성:**
- **코드 리뷰 효율**: 변경사항의 영향 범위를 쉽게 파악
- **온보딩 시간 단축**: 새로운 팀원이 프로젝트 구조를 빠르게 이해
- **일관된 개발 패턴**: 팀 전체가 동일한 구조 패턴으로 개발

### 적용 가이드라인

**도입 단계:**
1. **기존 구조 분석**: 현재 프로젝트의 파일 분산도 파악
2. **점진적 마이그레이션**: 새로운 기능부터 새로운 구조 적용
3. **팀 컨벤션 수립**: 폴더 구조와 파일 네이밍 규칙 정의

**성공 지표:**
- 특정 기능 수정 시 접근해야 하는 폴더 수 감소
- 새로운 기능 개발 시 파일 위치 결정 시간 단축
- 코드 리뷰 시 변경사항 이해 시간 단축

### 관련 문서
- [Page Component Structure](./page-component-structure.md): 페이지 컴포넌트 내부 구조 설계
- [Sub Compound Pattern](../../03-best-practice/04-style-layout/section-compound-pattern.md): 페이지 레이아웃 표현 패턴
- [API Call Pattern](../../03-best-practice/00-api/README.md): 데이터 페칭과 상태 관리 패턴
