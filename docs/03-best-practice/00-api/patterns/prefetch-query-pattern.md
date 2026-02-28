---
title: "PrefetchQuery 패턴"
description: "전략적 prefetch로 첫 화면 속도를 높이고 인터랙션 대기를 줄이는 패턴을 정리합니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# PrefetchQuery 패턴

## 1. 해결하려는 문제

```typescript
// ❌ 모든 데이터를 기다리는 방식
const LoanPage = () => {
  // 모든 데이터가 준비될 때까지 페이지 전체가 로딩
  const { data: loanInfo } = useSuspenseQuery(loanInfoQuery);
  const { data: bottomSheetData } = useSuspenseQuery(bottomSheetDataQuery);
  const { data: nextPageData } = useSuspenseQuery(nextPageDataQuery);
  
  return (
    <div>
      <LoanMainContent data={loanInfo} />
      <Button onClick={openBottomSheet}>자세히 보기</Button>
    </div>
  );
};

// 페이지 진입 시 모든 데이터 로딩까지 대기 → 느린 첫 화면

// ❌ prefetch 로직이 분산되어 있는 경우
const ProductPage = () => {
  const { data: product } = useSuspenseQuery(productQuery);
  
  // prefetch 로직이 상단에 위치 - 어떤 버튼과 관련있는지 불분명
  usePrefetchQuery(productDetailQuery);
  usePrefetchQuery(reviewListQuery);
  usePrefetchQuery(recommendationQuery);
  
  // ... 많은 다른 로직들 ...
  
  return (
    <div>
      <ProductInfo data={product} />
      
      {/* 실제 사용처 - prefetch와 멀리 떨어져 있음 */}
      <Button onClick={openDetailModal}>상세 정보</Button>
      <Button onClick={openReviewModal}>리뷰 보기</Button>
      <Button onClick={openRecommendation}>추천 상품</Button>
    </div>
  );
};
```

**문제점:**
- **페이지 전체 로딩**: SuspenseQuery 사용 시 모든 데이터 로딩까지 페이지 전체가 로딩 상태
- **사용자 경험 저하**: 필요한 모든 데이터를 기다리느라 첫 화면 렌더링이 지연됨
- **순차적 데이터 로딩**: 사용자 인터랙션 후에야 필요한 데이터를 요청하여 대기 시간 발생
- **코드 분산**: prefetch 로직이 컴포넌트 상단에 위치하여 의도 파악 어려움
- **유지보수성 저하**: 관련 로직이 떨어져 있어 수정 시 놓치기 쉬움

## 2. 해결 방법

### 2.1 전략적 Prefetch로 로딩 상태 최소화

```typescript
// ✅ 전략적 Prefetch 적용
const LoanPage = () => {
  // 첫 화면 렌더링에 필요한 데이터만 즉시 로딩
  const { data: loanInfo } = useSuspenseQuery(loanInfoQuery);
  
  return (
    <div>
      <LoanMainContent data={loanInfo} />
      
      {/* 바텀시트 데이터 미리 로딩 (백그라운드) */}
      <PrefetchQuery {...bottomSheetDataQuery}>
        <Button onClick={openBottomSheet}>자세히 보기</Button>
      </PrefetchQuery>
      
      {/* 다음 페이지 데이터 미리 로딩 */}
      <PrefetchQuery {...nextPageDataQuery}>
        <Button onClick={goToNextPage}>다음 단계</Button>
      </PrefetchQuery>
    </div>
  );
};

// 첫 화면은 빠르게 렌더링, 필요한 데이터는 백그라운드에서 준비
```

### 2.2 PrefetchQuery 컴포넌트의 응집도 향상

```typescript
// ✅ PrefetchQuery 컴포넌트로 응집도 향상
const ProductPage = () => {
  const { data: product } = useSuspenseQuery(productQuery);
  
  return (
    <div>
      <ProductInfo data={product} />
      
      {/* prefetch와 사용처가 바로 붙어있어 의도가 명확 */}
      <PrefetchQuery {...productDetailQuery}>
        <Button onClick={openDetailModal}>상세 정보</Button>
      </PrefetchQuery>
      
      <PrefetchQuery {...reviewListQuery}>
        <Button onClick={openReviewModal}>리뷰 보기</Button>
      </PrefetchQuery>
      
      <PrefetchQuery {...recommendationQuery}>
        <Button onClick={openRecommendation}>추천 상품</Button>
      </PrefetchQuery>
    </div>
  );
};
```

**효과:**
- **빠른 첫 화면**: 핵심 데이터만으로 페이지를 먼저 렌더링
- **매끄러운 인터랙션**: 사용자가 버튼을 클릭할 때 이미 데이터가 준비되어 즉시 반응
- **백그라운드 로딩**: 사용자가 인지하지 못하는 사이에 필요한 데이터 준비 완료
- **높은 응집도**: prefetch 로직과 관련 UI가 같은 위치에 배치되어 코드 흐름 파악 용이
- **명확한 의도**: 어떤 데이터가 어떤 인터랙션을 위해 미리 로딩되는지 즉시 이해 가능

## 3. 주의사항 (Caveat)

```typescript
// ❌ 과도한 Prefetch로 인한 성능 저하
const OverPrefetchPage = () => {
  const { data: basicData } = useSuspenseQuery(basicDataQuery);
  
  return (
    <div>
      {/* 모든 가능한 데이터를 미리 로딩 - 불필요한 네트워크 요청 */}
      <PrefetchQuery {...heavyDataQuery1}>
        <PrefetchQuery {...heavyDataQuery2}>
          <PrefetchQuery {...heavyDataQuery3}>
            <PrefetchQuery {...heavyDataQuery4}>
              <Button onClick={someAction}>액션</Button>
            </PrefetchQuery>
          </PrefetchQuery>
        </PrefetchQuery>
      </PrefetchQuery>
    </div>
  );
};

// ❌ 사용자가 절대 클릭하지 않을 버튼에 Prefetch
const UnusedPrefetch = () => (
  <div>
    <PrefetchQuery {...expensiveQuery}>
      <Button style={{ display: 'none' }}>숨겨진 버튼</Button>
    </PrefetchQuery>
    
    <PrefetchQuery {...anotherExpensiveQuery}>
      <Button disabled>비활성화된 버튼</Button>
    </PrefetchQuery>
  </div>
);

// ❌ 단순한 정적 데이터에 Prefetch 남용
const StaticDataPrefetch = () => (
  <PrefetchQuery {...staticConfigQuery}>
    <Button onClick={showStaticInfo}>정적 정보 보기</Button>
  </PrefetchQuery>
);
```

**남용하면 안 되는 경우:**
- **과도한 Prefetch**: 사용자가 실제로 사용하지 않을 가능성이 높은 데이터까지 미리 로딩
- **중첩 과다**: 너무 많은 PrefetchQuery 중첩으로 인한 성능 저하
- **불필요한 네트워크 요청**: 정적이거나 캐시된 데이터에 대한 불필요한 prefetch
- **사용자 경험 고려 부족**: 모바일 환경에서 데이터 사용량 증가 무시

**권장 사용 시나리오:**
- 사용자가 높은 확률로 접근할 것으로 예상되는 데이터
- 로딩 시간이 사용자 경험에 중요한 영향을 미치는 경우
- 순차적 플로우에서 다음 단계 데이터 미리 준비

## 4. 사용된 레퍼런스

### 4.1 실제 적용 사례 - 대출 신청 플로우

```typescript
// src/products/application/application-page.tsx
const LoanApplicationPage = () => {
  // 페이지 진입 시 필수 데이터만 로딩
  const { data: userInfo } = useSuspenseQuery(userInfoQuery);
  
  return (
    <LoanApplicationView.Container>
      <LoanApplicationView.Header />
      <LoanApplicationView.UserInfo data={userInfo} />
      
      {/* 약관 동의 바텀시트 데이터 미리 준비 */}
      <PrefetchQuery {...termsDataQuery}>
        <Button onClick={openTermsBottomSheet}>
          약관 동의하기
        </Button>
      </PrefetchQuery>
      
      {/* 다음 단계 페이지 데이터 미리 준비 */}
      <PrefetchQuery {...loanProductListQuery}>
        <PrefetchQuery {...userCreditInfoQuery}>
          <Button onClick={goToProductSelection}>
            대출 상품 선택하기
          </Button>
        </PrefetchQuery>
      </PrefetchQuery>
      
      {/* 중간 이탈 시 저장 데이터 미리 준비 */}
      <PrefetchQuery {...draftSaveQuery}>
        <Button variant="secondary" onClick={saveDraft}>
          나중에 계속하기
        </Button>
      </PrefetchQuery>
    </LoanApplicationView.Container>
  );
};
```

### 4.2 상품 상세 페이지 최적화

```typescript
// 상품 상세 페이지에서 관련 데이터 미리 로딩
const ProductDetailPage = ({ productId }) => {
  const { data: product } = useSuspenseQuery(productQuery(productId));
  
  return (
    <div>
      <ProductInfo product={product} />
      
      {/* 리뷰 탭 클릭 시 즉시 표시 */}
      <PrefetchQuery {...reviewsQuery(productId)}>
        <Tab onClick={showReviews}>리뷰</Tab>
      </PrefetchQuery>
      
      {/* 구매 플로우 데이터 미리 준비 */}
      <PrefetchQuery {...purchaseOptionsQuery(productId)}>
        <PrefetchQuery {...shippingInfoQuery}>
          <Button onClick={startPurchase}>구매하기</Button>
        </PrefetchQuery>
      </PrefetchQuery>
      
      {/* 관련 상품 추천 데이터 */}
      <PrefetchQuery {...relatedProductsQuery(productId)}>
        <Button onClick={showRelatedProducts}>관련 상품 보기</Button>
      </PrefetchQuery>
    </div>
  );
};
```

### 4.3 성능 측정 결과

```typescript
// 성능 개선 전후 비교 (예시)
const PerformanceComparison = {
  before: {
    firstContentfulPaint: '2.3s',
    timeToInteractive: '4.1s',
    userExperience: 'Loading spinner 다수 표시'
  },
  after: {
    firstContentfulPaint: '0.8s',  // 65% 개선
    timeToInteractive: '1.2s',     // 71% 개선
    userExperience: '즉시 반응하는 인터랙션'
  }
};
```

## 5. 더 알아보기

### 5.1 React Query의 Prefetch 전략

React Query는 다양한 prefetch 전략을 제공합니다:

- **Prefetch on Mount**: 컴포넌트 마운트 시 즉시 prefetch
- **Prefetch on Hover**: 사용자가 요소에 hover할 때 prefetch
- **Prefetch on Focus**: 요소가 focus될 때 prefetch
- **Prefetch on Viewport**: 요소가 뷰포트에 들어올 때 prefetch

### 5.2 성능 최적화 원칙

**핵심 원칙:**
- **Critical Path 우선**: 첫 화면 렌더링에 필요한 데이터를 최우선으로 로딩
- **사용자 의도 예측**: 사용자가 다음에 할 행동을 예측하여 미리 준비
- **점진적 로딩**: 필요한 시점에 맞춰 단계적으로 데이터 로딩
- **캐시 활용**: 이미 로딩된 데이터는 재사용하여 불필요한 요청 방지

### 5.3 UX 관점에서의 고려사항

**사용자 경험 개선:**
- **Perceived Performance**: 실제 성능보다 사용자가 느끼는 성능이 중요
- **Progressive Enhancement**: 기본 기능부터 제공하고 점진적으로 향상
- **Graceful Degradation**: 네트워크 상황이 좋지 않아도 기본 기능은 동작
- **Feedback Provision**: 로딩 상태를 적절히 표시하여 사용자에게 피드백 제공
