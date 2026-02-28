---
title: "SpacingHeight vs flex gap vs space-y/space-x 사용 케이스 가이드"
description: "SpacingHeight, flex gap, space-y/x의 선택 기준과 사용 시나리오를 비교해 레이아웃 간격 결정을 돕습니다."
type: guide
tags: [Tailwind, BestPractice]
order: 1
---

# SpacingHeight vs flex gap vs space-y/space-x 사용 케이스 가이드

## 들어가기 전에

이 문서는 **레이아웃에서 요소 간 간격을 관리하는 다양한 방법들의 사용 케이스**를 다룹니다.

### 📋 다루는 간격 관리 방법들

1. **`SpacingHeight`**: 명시적인 높이 간격을 위한 전용 컴포넌트 (margin collapsing, padding 등 CSS 특성을 몰라도 안전하게 사용 가능)
2. **`flex gap`**: flex box 컨테이너 내 아이템 간 간격
3. **`space-y`, `space-x`**: 형제 요소들 간의 일관된 간격 (margin 기반)
4. **개별 margin/padding**: 특수한 경우의 직접 간격 제어

### 🎯 이 문서의 목적

**상황별로 가장 적합한 간격 관리 방법을 선택하여 예측 가능하고 유지보수하기 쉬운 레이아웃을 구성하는 것**

### 💡 핵심 선택 기준

- **명시적 높이 간격**: `SpacingHeight` 컴포넌트 사용
- **Flexbox 레이아웃**: `flex gap` 우선 사용
- **수직/수평 나열**: `space-y`/`space-x` 사용
- **복잡한 조건부 간격**: 개별 margin/padding 사용

## 1. SpacingHeight 컴포넌트 사용 케이스

### SpacingHeight란?

`SpacingHeight`는 **하나의 큰 spacing을 표현하기 위한 전용 컴포넌트**입니다. 여러 요소 사이의 반복적인 간격이 아닌, **단일한 명시적 간격**을 구현할 때 사용합니다.

#### 탄생 배경
SpacingHeight는 **CSS의 복잡한 특성들(margin collapsing, padding 동작 등)을 몰라도 안전하게 간격을 구현**할 수 있도록 과거에 탄생되었습니다.

```tsx
// ❌ CSS 지식이 필요한 복잡한 상황들
<div>
  <div className="mb-[20px]">첫 번째 요소</div>  {/* margin collapsing 고려 필요 */}
  <div className="mt-[30px]">두 번째 요소</div>   {/* 실제 간격: max(20px, 30px) = 30px */}
</div>

<div className="pt-[20px]">                      {/* padding vs margin 선택 고민 */}
  <div>내용</div>
</div>

// ✅ CSS 지식 없이도 예측 가능한 SpacingHeight
<div>
  <div>첫 번째 요소</div>
  <SpacingHeight height={25} />  {/* 정확히 25px, 항상 예측 가능 */}
  <div>두 번째 요소</div>
</div>
```

**SpacingHeight의 장점:**
- **예측 가능성**: 지정한 높이가 정확히 적용됨
- **CSS 지식 불필요**: margin collapsing, box model 등을 고려하지 않아도 됨
- **안전성**: 다른 CSS 속성과의 상호작용 걱정 없음

### 1.1 언제 SpacingHeight를 사용하는가?

#### ✅ 사용해야 하는 경우

**1. 피그마에서 명시적으로 spacing이 지정된 경우**
```tsx
// ✅ 피그마 명세: "헤더와 콘텐츠 사이 32px 간격"
<div>
  <Header />
  <SpacingHeight height={32} />  {/* 피그마 명세의 정확한 구현 */}
  <MainContent />
</div>
```

**2. 하나의 큰 구조적 간격이 필요한 경우**
```tsx
// ✅ 푸터 영역의 명확한 간격 구분
<footer className="bg-background-gray">
  <SpacingHeight height={32} />
  <LoanAlimiResultFooterNotice />
  <SpacingHeight height={32} />
  <LoanAlimiResultFooterDeleteButton />
  <SpacingHeight height={164} />  {/* 하단 여백 */}
</footer>
```

**3. 페이지/섹션 레벨의 큰 여백이 필요한 경우**
```tsx
// ✅ 페이지 하단의 큰 여백 (safe area, 플로팅 버튼 고려)
<footer className="bg-background-gray">
  <NoticeSection />
  <SpacingHeight height={164} />  {/* 하단 큰 여백 */}
</footer>

// ✅ 섹션 간 큰 구분 간격
<main>
  <HeroSection />
  <SpacingHeight height={80} />   {/* 섹션 간 큰 간격 */}
  <ContentSection />
</main>
```

#### ❌ 사용하지 말아야 하는 경우

**1. 여러 요소 사이의 반복적인 간격**
```tsx
// ❌ 반복적인 간격에 SpacingHeight 사용
<div>
  <Item1 />
  <SpacingHeight height={12} />
  <Item2 />
  <SpacingHeight height={12} />
  <Item3 />
  <SpacingHeight height={12} />
  <Item4 />
</div>

// ✅ space-y 사용
<div className="space-y-[12px]">
  <Item1 />
  <Item2 />
  <Item3 />
  <Item4 />
</div>
```

**2. 작은 요소 간 간격**
```tsx
// ❌ 작은 간격에 SpacingHeight 과용
<div>
  <Icon />
  <SpacingHeight height={4} />
  <Text />
</div>

// ✅ flex gap 사용
<div className="flex items-center gap-[4px]">
  <Icon />
  <Text />
</div>
```

### 1.2 핵심 원칙

#### ✅ SpacingHeight 사용 원칙
1. **피그마 명세 우선**: 디자인에서 명시적으로 지정된 간격
2. **단일 간격**: 하나의 큰 spacing을 표현할 때
3. **구조적 의미**: 섹션/페이지 레벨의 의미 있는 여백

#### 🎯 선택 기준 요약
- **피그마에서 명시적 spacing 지정** → `SpacingHeight`
- **여러 요소의 반복적 간격** → `space-y` 또는 `flex gap`
- **작은 인라인 요소 간격** → `flex gap`
- **복잡한 조건부 간격** → 개별 margin/padding

## 2. flex gap 사용 케이스

### flex gap이란?

`flex gap`은 **flexbox 컨테이너 내 아이템 간 간격을 관리**하는 CSS 속성입니다. 정렬, 크기 조정과 함께 간격을 통합적으로 관리할 수 있습니다.

#### 핵심 장점
**정렬, 분배, 크기 조정과 간격을 하나의 시스템에서 통합 관리**할 수 있어, 복잡한 레이아웃에서 강력한 제어력을 제공합니다.

```tsx
// ❌ space-y로는 해결하기 어려운 복잡한 레이아웃
<div className="space-y-[12px] h-screen">
  <Header />
  <main className="flex-1">메인 콘텐츠</main>  {/* flex-1이 동작하지 않음 */}
  <Footer />
</div>

// ✅ flex gap으로 통합 관리
<div className="flex flex-col gap-[12px] h-screen">
  <Header />
  <main className="flex-1">메인 콘텐츠</main>  {/* 남은 공간 차지 */}
  <Footer />
</div>
```

### 2.1 언제 flex gap을 사용하는가?

#### ✅ 사용해야 하는 경우

**1. 정렬이나 분배가 필요한 경우**
```tsx
// ✅ 중앙 정렬과 간격을 함께 처리
<div className="flex flex-col items-center justify-center gap-[12px] min-h-screen">
  <Logo />
  <LoginForm />
  <Footer />
</div>

// ✅ 양끝 정렬과 간격
<div className="flex items-center justify-between gap-[16px]">
  <Logo />
  <Navigation />
  <UserMenu />
</div>
```

**2. 동적 크기 조정이 필요한 경우**
```tsx
// ✅ flex-grow, flex-shrink와 함께 사용
<div className="flex gap-[16px]">
  <aside className="w-[200px]">사이드바</aside>
  <main className="flex-1">메인 콘텐츠</main>  {/* 남은 공간 차지 */}
  <aside className="w-[200px]">우측 사이드바</aside>
</div>
```

**3. 인라인 요소나 작은 컴포넌트 간격**
```tsx
// ✅ 아이콘과 텍스트, 버튼 그룹 등
<div className="flex items-center gap-[8px]">
  <Icon />
  <Text />
</div>

<div className="flex gap-[12px]">
  <Button>확인</Button>
  <Button>취소</Button>
</div>
```

#### ❌ 사용하지 말아야 하는 경우

**1. 단순한 문서형 콘텐츠**
```tsx
// ❌ 불필요한 flex 사용
<article className="flex flex-col gap-[16px]">
  <h1>제목</h1>  {/* flex item이 되어 불필요한 속성 적용 */}
  <p>단락</p>
  <p>단락</p>
</article>

// ✅ space-y 사용
<article className="space-y-[16px]">
  <h1>제목</h1>  {/* 자연스러운 block 흐름 */}
  <p>단락</p>
  <p>단락</p>
</article>
```

**2. 하나의 큰 구조적 간격**
```tsx
// ❌ 단일 간격에 flex gap 과용
<div className="flex flex-col gap-[80px]">
  <HeroSection />
  <ContentSection />
</div>

// ✅ SpacingHeight 사용
<div>
  <HeroSection />
  <SpacingHeight height={80} />
  <ContentSection />
</div>
```

## 3. space-y/space-x 사용 케이스

### space-y/space-x란?

`space-y`와 `space-x`는 **형제 요소들 간의 일관된 간격을 margin 기반으로 관리**하는 Tailwind CSS 유틸리티입니다.

#### 핵심 장점
**flex, flex-col을 할당하지 않고도 block 요소 간 간격을 관리**할 수 있어, 자연스러운 문서 흐름을 유지하면서 간격을 제어할 수 있습니다.

```tsx
// ❌ gap을 위해 불필요한 flex 사용
<article className="flex flex-col gap-[16px]">
  <h1>기사 제목</h1>  {/* flex item이 되어 display 동작 변경 */}
  <p>첫 번째 단락</p>
  <p>두 번째 단락</p>
</article>

// ✅ 자연스러운 block 흐름 유지
<article className="space-y-[16px]">
  <h1>기사 제목</h1>  {/* 일반적인 block 요소 흐름 */}
  <p>첫 번째 단락</p>
  <p>두 번째 단락</p>
</article>
```

### 3.1 언제 space-y/space-x를 사용하는가?

#### ✅ 사용해야 하는 경우

**1. 자연스러운 문서 흐름이 필요한 경우**
```tsx
// ✅ 블로그 포스트, 기사 등 문서형 콘텐츠
<article className="space-y-[24px]">
  <header className="space-y-[8px]">
    <h1>제목</h1>
    <p>부제목</p>
  </header>
  <main className="space-y-[16px]">
    <p>첫 번째 단락</p>
    <p>두 번째 단락</p>
  </main>
</article>
```

**2. flex 속성이 불필요한 단순 나열**
```tsx
// ✅ 카드 리스트, 메뉴 항목 등
<nav className="space-y-[12px]">
  <MenuItem>홈</MenuItem>
  <MenuItem>소개</MenuItem>
  <MenuItem>연락처</MenuItem>
</nav>
```

#### ❌ 사용하지 말아야 하는 경우

**1. 정렬이나 분배가 필요한 경우**
```tsx
// ❌ 정렬이 필요한데 space-y 사용
<div className="space-y-[12px]">
  <Logo />
  <LoginForm />
</div>

// ✅ flex gap 사용
<div className="flex flex-col items-center gap-[12px]">
  <Logo />
  <LoginForm />
</div>
```

**2. 인라인 요소나 작은 컴포넌트 간격**
```tsx
// ❌ 인라인 요소에 space-x 사용
<div className="space-x-[8px]">
  <Icon />
  <Text />
</div>

// ✅ flex gap 사용
<div className="flex items-center gap-[8px]">
  <Icon />
  <Text />
</div>
```

## 4. 종합 비교 및 선택 가이드

### 4.1 상황별 최적 선택

| 상황 | SpacingHeight | space-y/space-x | flex gap | 개별 margin/padding |
|------|---------------|------------------|----------|---------------------|
| 피그마 명세의 단일 간격 | ✅ 최적 | ❌ 부적합 | ❌ 부적합 | ⚠️ 가능하지만 복잡 |
| 자연스러운 문서 흐름 | ❌ 부적합 | ✅ 최적 | ❌ 과용 | ⚠️ 보통 |
| 정렬이 필요한 레이아웃 | ❌ 부적합 | ❌ 제한적 | ✅ 최적 | ❌ 복잡함 |
| 인라인 요소 간격 | ❌ 부적합 | ⚠️ 제한적 | ✅ 최적 | ⚠️ 보통 |
| 큰 구조적 여백 | ✅ 최적 | ❌ 부적합 | ❌ 과용 | ⚠️ 가능하지만 복잡 |
| 동적 크기 조정 | ❌ 부적합 | ❌ 불가능 | ✅ 최적 | ❌ 복잡함 |

### 4.2 선택 플로우차트

```
간격이 필요한 상황
├── 피그마에서 명시적 spacing 지정?
│   └── YES → SpacingHeight
└── NO
    ├── 정렬/분배/크기조정 필요?
    │   └── YES → flex gap
    └── NO
        ├── 자연스러운 문서 흐름?
        │   └── YES → space-y/space-x
        └── NO → 개별 margin/padding
```

### 4.3 핵심 원칙 요약

#### SpacingHeight
- **언제**: 피그마 명세의 단일 간격, 큰 구조적 여백
- **장점**: CSS 지식 불필요, 예측 가능, 안전함
- **주의**: 반복 패턴에 남용 금지

#### flex gap
- **언제**: 정렬/분배/크기조정과 간격을 함께 관리
- **장점**: 통합적 레이아웃 제어, 강력한 기능
- **주의**: 단순한 문서형 콘텐츠에는 과용

#### space-y/space-x  
- **언제**: 자연스러운 문서 흐름, flex 불필요한 단순 나열
- **장점**: flex 할당 없이 block 요소 간격 관리
- **주의**: 정렬이 필요하면 flex gap 사용

## 5. 더 알아보기

###  margin collapsing 이해
space-y는 margin-top을 사용하므로 CSS margin collapse 규칙이 적용됩니다:

```css
/* margin collapse 예시 */
.element-with-margin-bottom { margin-bottom: 20px; }
.space-y-12 > :not([hidden]) ~ :not([hidden]) { margin-top: 12px; }
/* 실제 간격: max(20px, 12px) = 20px */
```
