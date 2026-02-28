---
title: "Compound Pattern - 페이지 구조 표현 (Layout & Semantic Structure)"
description: "xxx-page.tsx 컴포넌트만 보고도 전체 화면 구조를 파악할 수 있게 하는 Compound Pattern과 스타일 분리 원칙을 설명합니다."
type: pattern
tags: [React, BestPractice]
order: 0
---

# Compound Pattern - 페이지 구조 표현 (Layout & Semantic Structure)

## 들어가기 전에

이 문서는 **PA(Product Application)에서 제품을 표현할 때 사용되는 Compound Pattern**에 대해 다룹니다.

### 📋 문서 범위
- **이 문서에서 다루는 것**: 페이지 레이아웃과 의미론적 구조 표현을 위한 Compound Pattern
- **별도 문서에서 다루는 것**:
  - **디자인시스템의 Compound Pattern**: 컴포넌트 내부 상태 제어와 관련된 맥락
  - **API 호출 & 상태관리**: 페이지 예측 가능성을 위한 데이터 레이어 패턴

### 🎯 이 문서의 목적
**`xxx-page.tsx` 컴포넌트만 보고도 전체 화면의 구조와 얼개 정보를 한눈에 알 수 있게 하는 것**

- **현재 다루는 범위**: 스타일 레이아웃과 의미론적 구조 표현
- **향후 확장 범위**: API 호출, 상태관리 등 페이지의 핵심 내용 예측 가능성 (별도 문서 예정)

## 목적

컴포넌트를 사용하는 곳에서 **필요한 부분(스타일링, 내부 구조)은 드러나게 하고**, **불필요한 부분(스타일링 재사용, 관심사 밖의 구현 세부사항)은 감춘다**.

- **🔍 드러내야 할 것**: 레이아웃 구조, 페이지별 스타일링, 사용처에서 제어해야 하는 부분
- **🎨 감춰야 할 것**: 재사용되는 스타일링, 내부 구현 세부사항, 관심사 밖의 복잡성

## 1. 해결하려는 문제

### 문제 1: 완전 추상화된 컴포넌트
```typescript
// ❌ 내부 구조가 불분명한 단일 컴포넌트
export const LoanAlimiMainContentView = () => {
  return (
    <div className="min-h-screen flex w-full flex-col items-center gap-[40px]">
      <LoanAlimiHeaderView />
      <div className="flex w-full flex-col items-center justify-start gap-[40px]">
        <LoanAlimiIllustrationView />
        <LoanAlimiInfoItemsView />
      </div>
    </div>
  );
};

// 사용할 때 내부 구조와 레이아웃을 전혀 알 수 없음
const LoanPage = () => (
  <div>
    <LoanAlimiMainContentView /> {/* 어떤 부분들로 구성? 어떤 레이아웃? 전혀 알 수 없음 */}
  </div>
);
```

**문제점:**
- **🔍 구조 파악 불가**: 어떤 하위 컴포넌트들로 구성되어 있는지 알 수 없음
- **🔍 레이아웃 예측 불가**: 전체 페이지 레이아웃과 배치 방식을 예측할 수 없음
- **🔍 커스터마이징 불가**: 부분적 수정이나 스타일 조정이 불가능
- **🔍 재사용성 부족**: 일부 컴포넌트만 선택적으로 사용할 수 없음

### 문제 2: 컴파운드이지만 필요한 스타일이 숨겨짐
```typescript
// ❌ 컴파운드 패턴이지만 레이아웃 스타일이 컴포넌트에 숨겨져 있음
const Container = twc.main`min-h-screen flex w-full flex-col items-center gap-[40px]`;
const Body = twc.section`flex w-full flex-col items-center justify-start gap-[40px]`;
const IllustrationContainer = twc.div`relative h-[200px] w-[327px]`;

export const LoanAlimiMainContentView = {
  Container,
  Body,
  IllustrationContainer,
};

// 사용할 때 레이아웃을 예측할 수 없어서 정의부를 찾아가야 함
const LoanPage = () => (
  <LoanAlimiMainContentView.Container> {/* 어떤 레이아웃인지 알려면 정의부로 이동해야 함 */}
    <LoanAlimiMainContentView.Body>    {/* 스타일 수정도 정의부에서 해야 함 */}
      <LoanAlimiMainContentView.IllustrationContainer> {/* 크기가 얼마인지 모름 */}
        <Picture ... />
      </LoanAlimiMainContentView.IllustrationContainer>
    </LoanAlimiMainContentView.Body>
  </LoanAlimiMainContentView.Container>
);
```

**문제점:**
- **🔍 정의부 이동 필요**: 레이아웃을 확인하려면 컴포넌트 정의부로 이동해야 함
- **🔍 스타일 수정의 어려움**: 사용처에서 직접 스타일을 조정할 수 없어 정의부에서 수정해야 함
- **🔍 예측 불가능성**: 사용처에서 컴포넌트 크기나 배치를 예측할 수 없음
- **🔍 개발 효율성 저하**: 코드 읽기와 수정 시 여러 파일을 오가야 함

### 문제 3: Native HTML로만 구성된 비의미적 구조
```typescript
// ❌ div만으로 구성되어 의미론적 구조를 파악하기 어려움
const LoanPage = () => (
  <div className="min-h-screen flex w-full flex-col items-center gap-[40px]">
    <div className="bg-background-white border-b-[1px] border-line-normal px-[24px] py-[16px]">
      {/* 헤더인지 알기 어려움 */}
    </div>
    <div className="flex w-full flex-col items-center justify-start gap-[40px]">
      <div className="relative h-[200px] w-[327px]">
        <Picture ... />
      </div>
      <ul className="px-[24px] space-y-[16px] list-none">
        <li className="flex items-start gap-[12px] text-b14 text-text-normal">항목 1</li>
        <li className="flex items-start gap-[12px] text-b14 text-text-normal">항목 2</li>
        <li className="flex items-start gap-[12px] text-b14 text-text-normal">항목 3</li>
      </ul>
    </div>
  </div>
);
```

**문제점:**
- **🔍 의미론적 구조 부족**: `div`만으로는 헤더, 메인 콘텐츠 등의 역할을 파악하기 어려움
- **🎨 스타일 중복**: 동일한 스타일(`flex items-start gap-[12px] text-b14 text-text-normal`)을 매번 반복
- **🔍 가독성 저하**: 긴 className으로 인해 구조 파악이 어려움
- **🎨 유지보수성 부족**: 스타일 변경 시 여러 곳을 수정해야 함



## 2. 해결 방법

```typescript
// ✅ 구조가 명확한 Compound Pattern (페이지별 구조)
import { Picture } from '@/components/picture';

const Container = twc.main``;  // 스타일 없는 semantic wrapper
const Header = twc.header`bg-background-white border-b-[1px] border-line-normal px-[24px] py-[16px]`;
const Body = twc.section``;  // 스타일 없는 semantic wrapper  
const IllustrationContainer = twc.div``;  // 스타일 없는 컨테이너 (사용처에서 className)
const InfoItemsList = twc.ul``;  // 스타일 없는 컨테이너 (사용처에서 className)
const InfoItem = twc.li`flex items-start gap-[12px] text-b14 text-text-normal`;

export const LoanAlimiMainContentView = {
  Container,  // ✅ semantic wrapper (스타일 없음)
  Header,  // ✅ 스타일이 정의된 헤더
  Body,  // ✅ semantic wrapper (스타일 없음)
  IllustrationContainer,  // 🔍 일러스트 컨테이너 → 사용처에서 className (구조 파악 용이)
  InfoItemsList,  // 🔍 리스트 컨테이너 → 사용처에서 className (구조 파악 용이)
  InfoItem,       // 🎨 리스트 아이템 → 컴포넌트에서 정의 (일관된 스타일)
};

// 사용할 때 구조와 스타일이 명확하게 드러남
const LoanPage = () => (
  <LoanAlimiMainContentView.Container className="min-h-screen flex w-full flex-col items-center gap-[40px]">
    <LoanAlimiMainContentView.Header />
    <LoanAlimiMainContentView.Body className="flex w-full flex-col items-center justify-start gap-[40px]">
      {/* 🔍 일러스트 컨테이너: 크기, 위치 → 사용처에서 명시 */}
      <LoanAlimiMainContentView.IllustrationContainer className="relative h-[200px] w-[327px]">
        <Picture
          src="graphic/color/illustration/curation/interest-rate-notification-kakao.png"
          alt="대출 금리 알림톡 일러스트레이션"
          fill
          className="!relative !h-full !w-full"
        />
      </LoanAlimiMainContentView.IllustrationContainer>
      {/* 🔍 리스트 레이아웃: 패딩, 간격, 스타일 → 사용처에서 명시 */}
      <LoanAlimiMainContentView.InfoItemsList className="px-[24px] space-y-[16px] list-none">
        <LoanAlimiMainContentView.InfoItem>
          {/* 🎨 아이템 스타일: flex, gap, 텍스트 → 일관된 디자인 */}
          알리미 정보 항목 1
        </LoanAlimiMainContentView.InfoItem>
        <LoanAlimiMainContentView.InfoItem>
          알리미 정보 항목 2
        </LoanAlimiMainContentView.InfoItem>
        <LoanAlimiMainContentView.InfoItem>
          알리미 정보 항목 3
        </LoanAlimiMainContentView.InfoItem>
      </LoanAlimiMainContentView.InfoItemsList>
    </LoanAlimiMainContentView.Body>
  </LoanAlimiMainContentView.Container>
);

// 📁 파일 구조 컨벤션
/*
alimi-register-page.view/
├── main-content-view.tsx                    # 메인 컴파운드 컴포넌트
├── main-content-view.styled/               # 하위 컴포넌트들
│   ├── header.tsx                         # LoanAlimiHeaderView
│   ├── illustration.tsx                   # LoanAlimiIllustrationView  
│   └── info-items.tsx                     # LoanAlimiInfoItemsView
├── floating-button.tsx
└── terms-agreement-bottom-sheet.tsx
*/
```

**효과:**
- **명확한 구조**: 컴포넌트의 내부 구조가 사용하는 곳에서 명확히 드러남
- **부분적 재사용**: 각 부분을 독립적으로 재사용 가능
- **유연한 조합**: 필요에 따라 일부 컴포넌트만 선택적으로 사용
- **계층 관계 명확**: 컴포넌트 간의 계층 관계가 명확함

### 2.1 스타일링 접근 방식

컴파운드 패턴에서 스타일링은 **사용처에서의 필요성**에 따라 접근 방식을 달리합니다:

- **🔍 사용처에서 드러내야 할 스타일**: 레이아웃 구조, 페이지별 커스터마이징
- **🎨 컴포넌트에서 감춰야 할 스타일**: 재사용되는 디자인, 내부 구현 세부사항

#### 🔍 사용처에서 드러내야 할 스타일 (레이아웃 구조)
```typescript
// ✅ 레이아웃은 사용처에서 명확하게, 디자인은 컴포넌트에서 일관되게
import { Picture } from '@/components/picture';

const Container = twc.main``;  // 🔍 레이아웃 구조를 사용처에서 명시 (예측 가능)
const Header = twc.header`bg-background-white border-b-[1px] border-line-normal px-[24px] py-[16px]`;
const Body = twc.section``;  // 🔍 섹션 배치를 사용처에서 명시 (예측 가능)
const IllustrationContainer = twc.div``;  // 스타일 없는 컨테이너 (사용처에서 className)
const InfoItemsList = twc.ul``;  // 스타일 없는 컨테이너 (사용처에서 className)
const InfoItem = twc.li`flex items-start gap-[12px] text-b14 text-text-normal`;

export const LoanAlimiMainContentView = {
  Container,  // 🔍 메인 레이아웃 → 사용처에서 className (구조 파악 용이)
  Header,     // 🎨 고정 디자인 → 컴포넌트에서 정의 (일관성)
  Body,  // 🔍 섹션 배치 → 사용처에서 className (구조 파악 용이)
  IllustrationContainer,  // 🔍 일러스트 컨테이너 → 사용처에서 className (구조 파악 용이)
  InfoItemsList,  // 🔍 리스트 컨테이너 → 사용처에서 className (구조 파악 용이)
  InfoItem,       // 🎨 리스트 아이템 → 컴포넌트에서 정의 (일관된 스타일)
};

// 🔍 레이아웃 구조가 한눈에 보여서 예측 가능
const AlimiRegisterPageView = () => (
  <LoanAlimiMainContentView.Container className="min-h-screen flex w-full flex-col items-center gap-[40px]">
    {/* 🔍 전체 레이아웃: 세로 방향, 중앙 정렬, 40px 간격 → 즉시 파악 가능 */}
    <LoanAlimiMainContentView.Header />  {/* 🎨 헤더 디자인은 숨김 */}
    <LoanAlimiMainContentView.Body className="flex w-full flex-col items-center justify-start gap-[40px]">
      {/* 🔍 섹션 레이아웃: 세로 방향, 중앙 정렬, 상단 시작, 40px 간격 → 즉시 파악 가능 */}
      {/* 🔍 일러스트 컨테이너: 크기, 위치 → 사용처에서 명시 (예측 가능) */}
      <LoanAlimiMainContentView.IllustrationContainer className="relative h-[200px] w-[327px]">
        <Picture
          src="graphic/color/illustration/curation/interest-rate-notification-kakao.png"
          alt="대출 금리 알림톡 일러스트레이션"
          fill
          className="!relative !h-full !w-full"
        />
      </LoanAlimiMainContentView.IllustrationContainer>
      {/* 🔍 리스트 레이아웃: 패딩, 간격, 스타일 → 사용처에서 명시 (예측 가능) */}
      <LoanAlimiMainContentView.InfoItemsList className="px-[24px] space-y-[16px] list-none">
        <LoanAlimiMainContentView.InfoItem>
          {/* 🎨 아이템 스타일: flex, gap, 텍스트 → 일관된 디자인 */}
          알리미 정보 항목 1
        </LoanAlimiMainContentView.InfoItem>
        <LoanAlimiMainContentView.InfoItem>
          알리미 정보 항목 2
        </LoanAlimiMainContentView.InfoItem>
        <LoanAlimiMainContentView.InfoItem>
          알리미 정보 항목 3
        </LoanAlimiMainContentView.InfoItem>
      </LoanAlimiMainContentView.InfoItemsList>
    </LoanAlimiMainContentView.Body>
  </LoanAlimiMainContentView.Container>
);
```

#### 🎨 컴포넌트에서 감춰야 할 스타일 (재사용되는 디자인)
```typescript
// ✅ PA 내에서 자주 활용되는 패턴 - 스타일을 컴포넌트에서 감춤 (재사용성)
const CardContainer = twc.article`bg-background-white border-line-normal border-[1px] rounded-medium p-[20px]`;
const CardHeader = twc.header`flex items-center justify-between mb-[16px]`;
const CardContent = twc.section`text-b14 text-text-normal`;

export const ProductCard = {
  Container: CardContainer,  // 스타일이 미리 정의됨
  Header: CardHeader,        // 스타일이 미리 정의됨
  Content: CardContent,      // 스타일이 미리 정의됨
};

// 사용처에서는 스타일 중복 없이 깔끔하게 사용
const ProductList = () => (
  <div className="space-y-[16px] p-[24px]">
    <ProductCard.Container>  {/* 고정 스타일: bg, border, rounded, padding, shadow */}
      <ProductCard.Header>   {/* 고정 스타일: flex, justify-between, margin */}
        상품 정보
      </ProductCard.Header>
      <ProductCard.Content>  {/* 고정 스타일: text size, color, line-height */}
        상품 설명...
      </ProductCard.Content>
    </ProductCard.Container>
  </div>
);
```

**핵심 원칙:**
- **🔍 사용처에서 드러내야 할 것**: 레이아웃 구조, 페이지별 커스터마이징 → className으로 명시
- **🎨 컴포넌트에서 감춰야 할 것**: 재사용되는 디자인, 내부 구현 세부사항 → 컴포넌트에 내장

**사용처에서의 가시성이 중요한 이유:**

### 🔍 드러내야 할 스타일 - 구조 예측 가능성
```typescript
// ✅ 레이아웃 구조가 즉시 보임
<MainContent.Container className="min-h-screen flex w-full flex-col items-center gap-[40px]">
  {/* 👆 한 줄로 전체 페이지 레이아웃 파악: 전체 화면, 세로 배치, 중앙 정렬, 40px 간격 */}
  <MainContent.Section className="flex w-full flex-col items-center justify-start gap-[40px]">
    {/* 👆 섹션 배치도 즉시 파악: 가로 전체, 세로 배치, 중앙 정렬, 상단 시작 */}
  </MainContent.Section>
</MainContent.Container>

// ❌ 레이아웃이 숨겨져서 예측 불가능
<MainContent.Container>  {/* 어떤 레이아웃인지 알 수 없음 */}
  <MainContent.Section>  {/* 어떻게 배치되는지 알 수 없음 */}
  </MainContent.Section>
</MainContent.Container>
```

### 🎯 예측 가능성의 이점
- **빠른 이해**: 코드를 읽는 순간 페이지 레이아웃 구조를 즉시 파악
- **디버깅 효율**: 레이아웃 문제 발생 시 원인을 빠르게 찾을 수 있음
- **유지보수성**: 새로운 개발자도 코드 의도를 쉽게 이해
- **협업 향상**: 리뷰 시 레이아웃 의도를 명확히 전달

**파일 구조 컨벤션:**
```
{component-name}.view/
├── {main-component}.tsx              # 메인 컴파운드 컴포넌트
├── {main-component}.styled/          # 하위 컴포넌트들 (view prefix 제거)
│   ├── {sub-component-1}.tsx
│   ├── {sub-component-2}.tsx
│   └── {sub-component-3}.tsx
└── {other-components}.tsx
```

## 3. 주의사항 (Caveat)

**안티패턴: 드러내야 할 것을 감추거나, 감춰야 할 것을 드러내는 경우**

### ❌ 안티패턴 1: 드러내야 할 레이아웃을 감춤
```typescript
// ❌ 사용처에서 레이아웃 구조를 알 수 없음
const Container = twc.main`min-h-screen flex w-full flex-col items-center gap-[40px]`;  // 구조가 숨겨짐
const Body = twc.section`flex w-full flex-col items-center justify-start gap-[40px]`;  // 배치가 숨겨짐

// 사용할 때 전체 레이아웃을 예측할 수 없음
<LoanAlimiMainContentView.Container>  {/* 어떤 레이아웃인지 알 수 없음 */}
  <LoanAlimiMainContentView.Body>     {/* 어떻게 배치되는지 알 수 없음 */}
    {/* 개발자는 전체 구조를 파악하기 위해 컴포넌트 정의를 찾아가야 함 */}
  </LoanAlimiMainContentView.Body>
</LoanAlimiMainContentView.Container>
```

### ❌ 안티패턴 2: 감춰야 할 스타일을 매번 반복
```typescript
// ❌ 재사용 패턴인데 매번 className으로 중복
<ul>
  <li className="flex items-start gap-[12px] text-b14 text-text-normal">항목 1</li>  {/* 중복 */}
  <li className="flex items-start gap-[12px] text-b14 text-text-normal">항목 2</li>  {/* 중복 */}
  <li className="flex items-start gap-[12px] text-b14 text-text-normal">항목 3</li>  {/* 중복 */}
</ul>

// ✅ 재사용 스타일은 컴포넌트에서 감춤
const InfoItem = twc.li`flex items-start gap-[12px] text-b14 text-text-normal`;  // 재사용 스타일 (컴포넌트에서 정의)
```

### ❌ 안티패턴 3: 단순한 구조에 오버엔지니어링
```typescript
// ❌ 단순한 컴포넌트에는 불필요
export const SimpleButton = {
  Container: ({ children }) => <div>{children}</div>,
  Button: ({ onClick }) => <Button onClick={onClick}>확인</Button>,
};

// ✅ 단순한 경우 직접 사용
export const SimpleButton = ({ onClick }) => <Button onClick={onClick}>확인</Button>;
```

**남용하면 안 되는 경우:**
- **🔍 레이아웃 숨김**: 사용처에서 구조를 파악해야 하는데 컴포넌트에 숨긴 경우
- **🎨 스타일 중복**: 재사용되는 스타일을 매번 className으로 반복하는 경우
- **단순한 구조**: 3개 미만의 하위 컴포넌트나 단순한 구조에 적용
- **재사용성 없음**: 하위 컴포넌트들이 독립적으로 사용될 가능성이 없는 경우

### 3.1 스타일링 관련 주의사항

```typescript
// ❌ 페이지별 구조인데 스타일을 숨김
const Container = twc.div`min-h-screen flex w-full flex-col items-center gap-[40px]`;
const Section = twc.div`flex w-full flex-col items-center justify-start gap-[40px]`;

export const SpecificPageLayout = {
  Container,  // 스타일이 숨겨져서 사용처에서 레이아웃을 파악하기 어려움
  Section,    // 스타일이 숨겨져서 사용처에서 레이아웃을 파악하기 어려움
};

// ❌ 재사용 패턴인데 매번 className으로 중복
const CardContainer = twc.article``;
const CardHeader = twc.header``;
const CardContent = twc.section``;
const CardList = twc.ul``;  // 스타일 없는 컨테이너 (사용처에서 className)
const CardListItem = twc.li`flex items-start gap-[8px]`;  // 재사용 스타일 (컴포넌트에서 정의)

export const ReusableCard = {
  Container: CardContainer,
  Header: CardHeader, 
  Content: CardContent,
  List: {
    Container: CardList,  // 🔍 리스트 레이아웃 → 사용처에서 className
    Item: CardListItem,   // 🎨 아이템 스타일 → 컴포넌트에서 정의
  },
};

// 여러 곳에서 동일한 스타일을 반복 (중복 발생)
const Usage1 = () => (
  <ReusableCard.Container className="bg-background-white border-line-normal border-[1px] rounded-medium p-[20px]">
    {/* 반복: bg-background-white border-line-normal border-[1px] rounded-medium p-[20px] */}
    <ReusableCard.Header className="flex items-center justify-between mb-[16px]">
      {/* 반복: flex items-center justify-between mb-[16px] */}
      카드 제목
    </ReusableCard.Header>
    <ReusableCard.List.Container className="space-y-[8px] list-none">
      {/* 반복: space-y-[8px] list-none */}
      <ReusableCard.List.Item>
        {/* 🎨 아이템 스타일: flex items-start gap-[8px] → 컴포넌트에서 정의됨 (중복 없음) */}
        리스트 항목 1
      </ReusableCard.List.Item>
      <ReusableCard.List.Item>
        리스트 항목 2
      </ReusableCard.List.Item>
    </ReusableCard.List.Container>
  </ReusableCard.Container>
);

const Usage2 = () => (
  <ReusableCard.Container className="bg-background-white border-line-normal border-[1px] rounded-medium p-[20px]">
    {/* 중복: 동일한 스타일을 또 작성 */}
    <ReusableCard.Header className="flex items-center justify-between mb-[16px]">
      {/* 중복: 동일한 스타일을 또 작성 */}
      다른 카드 제목
    </ReusableCard.Header>
    <ReusableCard.List.Container className="space-y-[8px] list-none">
      {/* 중복: 동일한 스타일을 또 작성 */}
      <ReusableCard.List.Item>
        {/* 🎨 아이템 스타일: flex items-start gap-[8px] → 컴포넌트에서 정의됨 (중복 없음) */}
        다른 리스트 항목 1
      </ReusableCard.List.Item>
      <ReusableCard.List.Item>
        다른 리스트 항목 2
      </ReusableCard.List.Item>
    </ReusableCard.List.Container>
  </ReusableCard.Container>
);
```

**권장 사용 시나리오:**
- 3개 이상의 의미있는 하위 컴포넌트가 있는 경우
- 하위 컴포넌트들이 독립적으로 재사용될 가능성이 있는 경우
- 컴포넌트 구조가 복잡하여 사용자가 내부 구조를 이해해야 하는 경우

## 4. 사용된 레퍼런스

### 4.1 실제 적용 사례 - 페이지별 구조 표현

```typescript
// src/products/register/register-page.views/main-content-view/main-content-view.tsx
// ✅ 페이지별 구조 - 혼합 접근법
import { Picture } from '@/components/picture';

const Container = twc.main``;  // 레이아웃은 사용처에서 className
const Header = twc.header`bg-background-white border-b-[1px] border-line-normal px-[24px] py-[16px]`;
const Body = twc.section``;  // 레이아웃은 사용처에서 className
const IllustrationContainer = twc.div``;  // 스타일 없는 컨테이너 (사용처에서 className)
const InfoItemsList = twc.ul``;  // 스타일 없는 컨테이너 (사용처에서 className)
const InfoItem = twc.li`flex items-start gap-[12px] text-b14 text-text-normal`;

export const LoanAlimiMainContentView = {
  Container,
  Header,
  Body,
  IllustrationContainer,  // 🔍 일러스트 컨테이너 → 사용처에서 className
  InfoItemsList,  // 🔍 리스트 레이아웃 → 사용처에서 className
  InfoItem,       // 🎨 아이템 스타일 → 컴포넌트에서 정의
};

// 📁 파일 구조
/*
alimi-register-page.view/
├── main-content-view.tsx                    # 메인 컴파운드 컴포넌트
├── main-content-view.styled/               # 하위 컴포넌트들
│   ├── header.tsx                         # Header 컴포넌트 정의
│   ├── illustration.tsx                   # Illustration 컴포넌트 정의
│   └── info-items.tsx                     # InfoItems 컴포넌트 정의
├── floating-button.tsx
└── terms-agreement-bottom-sheet.tsx
*/

// Import 방식 (하위 컴포넌트들)
import { LoanAlimiHeaderView } from './main-content-view.styled/header';
import { LoanAlimiIllustrationView } from './main-content-view.styled/illustration';
import { LoanAlimiInfoItemsView } from './main-content-view.styled/info-items';

// 🔍 레이아웃 구조를 보고 페이지 의도를 즉시 파악 가능
const AlimiRegisterPageView = () => (
  <LoanAlimiMainContentView.Container className="min-h-screen flex w-full flex-col items-center gap-[40px]">
    {/* 🔍 페이지 전체 구조: 풀스크린, 세로 배치, 중앙 정렬, 40px 간격 → 등록 페이지 레이아웃 */}
    <LoanAlimiMainContentView.Header />  {/* 🎨 헤더 스타일은 숨김 (일관된 디자인) */}
    <LoanAlimiMainContentView.Body className="flex w-full flex-col items-center justify-start gap-[40px]">
      {/* 🔍 콘텐츠 섹션: 세로 배치, 중앙 정렬, 상단 시작 → 일러스트와 정보가 세로로 배치됨을 예측 */}
      {/* 🔍 일러스트 컨테이너: 크기, 위치 → 사용처에서 명시 (예측 가능) */}
      <LoanAlimiMainContentView.IllustrationContainer className="relative h-[200px] w-[327px]">
        <Picture
          src="graphic/color/illustration/curation/interest-rate-notification-kakao.png"
          alt="대출 금리 알림톡 일러스트레이션"
          fill
          className="!relative !h-full !w-full"
        />
      </LoanAlimiMainContentView.IllustrationContainer>
      {/* 🔍 리스트 레이아웃: 패딩, 간격, 스타일 → 사용처에서 명시 (예측 가능) */}
      <LoanAlimiMainContentView.InfoItemsList className="px-[24px] space-y-[16px] list-none">
        <LoanAlimiMainContentView.InfoItem>
          {/* 🎨 아이템 스타일: flex, gap, 텍스트 → 일관된 디자인 */}
          대출 알리미 혜택 1
        </LoanAlimiMainContentView.InfoItem>
        <LoanAlimiMainContentView.InfoItem>
          대출 알리미 혜택 2
        </LoanAlimiMainContentView.InfoItem>
        <LoanAlimiMainContentView.InfoItem>
          대출 알리미 혜택 3
        </LoanAlimiMainContentView.InfoItem>
      </LoanAlimiMainContentView.InfoItemsList>
    </LoanAlimiMainContentView.Body>
  </LoanAlimiMainContentView.Container>
);
```

### 4.2 실제 적용 사례 - 재사용 가능한 패턴

```typescript
// libs/shared-features/product-card/src/lib/product-card.tsx
// ✅ 재사용 패턴 - 스타일이 미리 정의됨
const CardContainer = twc.article`bg-background-white border-line-normal border-[1px] rounded-medium p-[20px] shadow-sm`;
const CardHeader = twc.header`flex items-center justify-between mb-[16px]`;
const CardTitle = twc.h3`text-h18 text-text-strong`;
const CardContent = twc.section`text-b14 text-text-normal leading-[1.5]`;
const CardFooter = twc.footer`flex items-center justify-end gap-[8px] mt-[16px]`;

export const ProductCard = {
  Container: CardContainer,
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
};

// 여러 곳에서 일관된 스타일로 재사용 (스타일 중복 없음)
const ProductListPage = () => (
  <div className="space-y-[16px] p-[24px]">
    {products.map(product => (
      <ProductCard.Container key={product.id}>
        {/* 고정 스타일: bg-background-white border-line-normal border-[1px] rounded-medium p-[20px] shadow-sm */}
        <ProductCard.Header>
          {/* 고정 스타일: flex items-center justify-between mb-[16px] */}
          <ProductCard.Title>{product.name}</ProductCard.Title>
          {/* 고정 스타일: text-h18 text-text-strong */}
        </ProductCard.Header>
        <ProductCard.Content>{product.description}</ProductCard.Content>
        {/* 고정 스타일: text-b14 text-text-normal leading-[1.5] */}
        <ProductCard.Footer>
          {/* 고정 스타일: flex items-center justify-end gap-[8px] mt-[16px] */}
          <Button>신청하기</Button>
        </ProductCard.Footer>
      </ProductCard.Container>
    ))}
  </div>
);
```

### 4.3 Direct Assignment 선호 사례

```typescript
// ✅ 권장: 직접 할당
export const ProductCard = {
  Container: ProductCardContainer,
  Header: ProductCardHeader,
  Content: ProductCardContent,
  Footer: ProductCardFooter,
};

// ❌ 비권장: 불필요한 wrapper 함수
export const ProductCard = {
  Container: ProductCardContainer,
  Header: () => <ProductCardHeader />,
  Content: () => <ProductCardContent />,
  Footer: () => <ProductCardFooter />,
};
```

### 4.4 적절한 사용 기준

```typescript
// ✅ 적절한 사용: 복잡한 구조
const FormContainer = twc.form`bg-background-white rounded-large p-[24px] space-y-[32px]`;
const FormHeader = twc.header`border-b-[1px] border-line-normal pb-[16px]`;
const PersonalInfoSection = twc.section`space-y-[16px]`;
const OrderInfoSection = twc.section`space-y-[16px]`;
const DocumentSection = twc.section`space-y-[16px]`;
const FormFooter = twc.footer`flex justify-end gap-[12px] pt-[24px]`;

export const LoanApplicationForm = {
  Container: FormContainer,     // 고정 스타일: bg, rounded, padding, spacing
  Header: FormHeader,           // 고정 스타일: border, padding
  PersonalInfo: PersonalInfoSection,  // 고정 스타일: spacing
  OrderInfo: OrderInfoSection,    // 고정 스타일: spacing
  Documents: DocumentSection,   // 고정 스타일: spacing
  Footer: FormFooter,          // 고정 스타일: flex, justify, gap, padding
};

// ❌ 부적절한 사용: 단순한 구조
export const SimpleButton = ({ onClick, children }) => (
  <Button onClick={onClick}>{children}</Button>
);
```

## 5. 더 알아보기

### 5.1 Direct Assignment의 성능상 이점

**Direct Assignment 선호 이유:**
- **코드 간결성**: 불필요한 함수 래핑 제거
- **런타임 성능**: 함수 호출 오버헤드 제거
- **타입 추론**: TypeScript에서 더 정확한 타입 추론
- **메모리 효율성**: 불필요한 함수 객체 생성 방지

### 5.2 React의 Compound Pattern 철학

Compound Pattern은 React 생태계에서 널리 사용되는 패턴입니다:

- **React Router**: `<Router><Route /></Router>`
- **Reach UI**: `<Menu><MenuButton /><MenuList /></Menu>`
- **Chakra UI**: `<Modal><ModalOverlay /><ModalContent /></Modal>`

이 패턴의 핵심은 **관련된 컴포넌트들을 논리적으로 그룹화**하면서도 **개별적으로 사용할 수 있는 유연성**을 제공하는 것입니다.
