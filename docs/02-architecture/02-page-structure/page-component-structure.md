---
title: "Page Component Structure"
description: "페이지 컴포넌트 자체가 테크스펙 역할을 하도록 전체 구조와 데이터 흐름을 명확히 드러내는 설계 원칙과 예시를 설명합니다."
type: guide
tags: [Architecture, React, BestPractice]
order: 1
---

# Page Component Structure - 예측 가능한 페이지 구조 설계

## 🎯 목적

페이지 컴포넌트만 보고도 해당 페이지의 **전체 구조와 동작을 한눈에 파악**할 수 있어야 합니다.

### 💡 핵심 철학: 코드가 곧 테크스펙
**페이지 컴포넌트 자체가 테크스펙 역할을 해야 합니다.**

```typescript
// ❌ 별도 문서로 설명해야 하는 구조
/* 
 * 기술 명세서 (별도 .md 파일)
 * - 사용 API: GET /api/user/profile, POST /api/orders
 * - 레이아웃: 헤더 + 메인 콘텐츠 + 푸터 구조
 * - 상태: currentStep, formData, validationErrors
 */
const OrderFormPage = () => {
  // 실제 구현은 문서와 별개로 복잡하게 구성...
};
```

```typescript
// ✅ 코드 자체가 테크스펙인 구조
const OrderFormPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <OrderErrorFallback message={error.message} />}>
    <Suspense fallback={<OrderLoadingSkeleton />}>
      {/* 🔄 사용하는 API가 한눈에 보임 */}
      <SuspenseQuery queryOptions={userProfileOptions(userId)}>
        {({ data: userProfile }) => (
          // 🏗️ 레이아웃 구조가 명확함
          <Layout.Container className="min-h-screen flex flex-col">
            <Layout.Header className="sticky top-0">
              <UserInfo user={userProfile} />  {/* 🔄 사용자 데이터 사용처 명확 */}
            </Layout.Header>
            <Layout.MainContent className="flex-1 p-6">
              <OrderForm />
            </Layout.MainContent>
            <Layout.Footer className="p-4">
              {/* 🚀 Mutation과 다이얼로그 에러 처리가 명확히 표현 */}
              <Mutation {...submitOrderMutationOptions.external()}>
                {(submitOrderMutation) => (
                  <SubmitButton
                    loading={submitOrderMutation.isLoading}
                    onClick={async () => {
                      try {
                        await submitOrderMutation.mutateAsync();
                      } catch (error) {
                        // 🚨 에러 발생 시 다이얼로그 열기
                        openDialog(({ isOpen, close }) => (
                          <ErrorDialog
                            isOpen={isOpen}
                            title="주문 실패"
                            message={error.message}
                            onClose={close}
                            onRetry={() => {
                              close();
                              submitOrderMutation.mutateAsync();
                            }}
                          />
                        ));
                      }
                    }}
                  />
                )}
              </Mutation>
            </Layout.Footer>
          </Layout.Container>
        )}
      </SuspenseQuery>
    </Suspense>
  </ErrorBoundary>
);
// 👆 이 코드만 보고도 페이지의 구조, API, 상태를 모두 파악 가능
```

## 1. 해결하려는 문제

### 문제: 페이지 구조와 데이터 흐름을 예측할 수 없음
```typescript
// ❌ 페이지의 전체 구조와 데이터 연관성을 파악하기 어려움
const OrderFormPage = () => {
  // 🔴 상단에 모든 로직이 선언됨 (사용처와 멀어짐)
  const { data: userData } = useQuery(userDataQuery);
  const { data: orderData } = useQuery(orderDataQuery);
  const { data: productData } = useQuery(productDataQuery);

  const { currentStep, handleNext } = useOrderFlow();
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const validateStep = useCallback((step) => {
    // 복잡한 검증 로직...
    return step < 3;
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearValidationError(field);
  }, []);

  const clearValidationError = (field) => {
    setValidationErrors(prev => ({ ...prev, [field]: null }));
  };

  const submitMutation = useMutation({
    mutationFn: submitOrder,
    onSuccess: () => router.push('/complete'),
    onError: (error) => setError(error.message)
  });
  
  // ... 50-100줄의 다른 로직들 ...
  
  // 🔴 실제 사용은 훨씬 아래쪽에서 (선언부와 멀어짐)
  return (
    <div>
      <Header />                    {/* 🔴 어떤 데이터를 사용하는지 추적 어려움 */}
      <Content 
        data={formData}             {/* 🔴 formData 선언부를 찾으려면 위로 스크롤 */}
        onChange={handleFormChange} {/* 🔴 handleFormChange 정의를 찾기 위해 위로 이동 */}
        errors={validationErrors}   {/* 🔴 validationErrors 관리 로직 추적 어려움 */}
      />
      <Footer 
        currentStep={currentStep}   {/* 🔴 currentStep이 어디서 오는지 불분명 */}
        onNext={handleNext}         {/* 🔴 handleNext 로직을 확인하려면 정의부로 이동 */}
        onSubmit={submitMutation.mutateAsync} {/* 🔴 mutation 설정 확인 어려움 */}
      />
    </div>
  );
};
```

**문제점:**
- **🔍 선언부와 사용처 분리**: 상단에 모든 로직이 선언되어 실제 사용처와 멀어져 코드 흐름 파악 어려움
- **🔍 데이터 흐름 불분명**: 어떤 API를 사용하고 어떤 데이터가 어떤 컴포넌트에서 사용되는지 파악 불가
- **🔍 레이아웃 구조 예측 불가**: 페이지의 전체 레이아웃과 배치를 예측할 수 없음
- **🔍 상태 관리 투명성 부족**: 페이지의 핵심 상태와 비즈니스 로직이 숨겨져 있음
- **🔍 컴포넌트 간 연관성 불분명**: 데이터와 컴포넌트가 어떻게 연결되어 있는지 추적 어려움

## 2. 해결 방법

```typescript
// ✅ 페이지 구조와 데이터 흐름이 명확하게 드러나는 코드
const OrderFormPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <OrderErrorFallback error={error} />}>
    <Suspense fallback={<OrderLoadingSkeleton />}>
      {/* 🔄 사용하는 API가 한눈에 보임 */}
      <SuspenseQueries
        queries={[
          userProfileOptions(userId),      // 🔄 사용자 프로필 API
          productsOptions(),               // 🔄 상품 목록 API
          orderDraftOptions(userId)        // 🔄 주문서 임시저장 API
        ]}
      >
        {([{ data: userProfile }, { data: products }, { data: draft }]) => {
          // 🎭 페이지의 핵심 상태가 명시됨
          const { currentStep, formData, goToStep } = useOrderFlow(draft);

          return (
            // 🏗️ 레이아웃 구조가 한눈에 보임
            <Layout.Container className="min-h-screen flex flex-col">
              <Layout.Header className="sticky top-0 bg-white border-b">
                {/* 🔄 데이터 연결이 명확히 보임 */}
                <UserInfo user={userProfile} />
                <ProgressIndicator currentStep={currentStep} totalSteps={3} />
              </Layout.Header>

              <Layout.MainContent className="flex-1 p-6">
                {/* 🔄 모든 데이터가 어떻게 연결되는지 명확 */}
                <StepContent
                  step={currentStep}
                  data={formData}
                  userProfile={userProfile}
                  products={products}
                  onChange={handleFormChange}
                />
              </Layout.MainContent>

              <Layout.Footer className="p-4 bg-white border-t">
                {/* 🚀 Mutation과 다이얼로그 에러 처리가 명확히 표현 */}
                <Mutation {...submitOrderMutationOptions.external()}>
                  {(submitMutation) => (
                    <StepNavigation
                      currentStep={currentStep}
                      onNext={goToStep}
                      onSubmit={async (data) => {
                        try {
                          await submitMutation.mutateAsync(data);
                          router.push('/orders/complete');
                        } catch (error) {
                          // 🚨 에러 발생 시 다이얼로그 표시
                          openDialog(({ isOpen, close }) => (
                            <ErrorDialog
                              isOpen={isOpen}
                              title="주문 실패"
                              message={error.message}
                              onClose={close}
                              onRetry={() => {
                                close();
                                submitMutation.mutateAsync(data);
                              }}
                            />
                          ));
                        }
                      }}
                      isLoading={submitMutation.isLoading}
                    />
                  )}
                </Mutation>
              </Layout.Footer>
            </Layout.Container>
          );
        }}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

### 달성되는 효과

- **🔍 빠른 이해**: 페이지 컴포넌트만 보고도 전체 동작을 파악 가능
- **🚀 개발 효율성**: 새로운 개발자도 빠르게 코드 이해 및 수정 가능
- **🔧 유지보수성**: 문제 발생 시 원인을 빠르게 찾고 해결 가능
- **📋 문서화 불필요**: 코드 자체가 충분한 설명 역할 수행

### 핵심 원칙

#### 🔄 데이터 흐름 명시
```typescript
// ✅ 사용하는 API와 데이터 변환이 명확함
<SuspenseQueries
  queries={[
    { ...userProfileOptions(userId), select: selectUserForOrder },
    { ...productsOptions(), select: selectAvailableProducts },
    orderDraftOptions(userId)
  ]}
>
  {([{ data: user }, { data: products }, { data: draft }]) => (
    // 데이터 사용처가 바로 보임
    <OrderForm
      user={user}
      products={products}
      initialData={draft}
    />
  )}
</SuspenseQueries>
```

#### 🏗️ 레이아웃 구조 표현
```typescript
// ✅ 페이지의 전체 레이아웃이 명확함
<Layout.Container className="min-h-screen flex flex-col">
  <Layout.Header className="sticky top-0">
    {/* 헤더 영역 */}
  </Layout.Header>
  
  <Layout.MainContent className="flex-1 p-6">
    {/* 메인 콘텐츠 영역 */}
  </Layout.MainContent>
  
  <Layout.Footer className="p-4">
    {/* 푸터 영역 */}
  </Layout.Footer>
</Layout.Container>
```

#### 🎭 상태 관리 표현
```typescript
// ✅ 페이지의 핵심 상태와 로직이 드러남
const { 
  currentStep,      // 현재 단계
  formData,         // 폼 데이터
  goToStep,         // (stepNumber: number) => void - 특정 단계로 이동
} = useOrderFlow(initialData);
```

#### 🚀 Mutation과 에러 처리 표현
```typescript
// ✅ Mutation 상태와 에러 처리가 명확히 드러남
<Mutation {...submitOrderMutationOptions.external()}>
  {(submitMutation) => (
    <SubmitButton
      loading={submitMutation.isLoading}
      onClick={async (data) => {
        try {
          await submitMutation.mutateAsync(data);
          onSuccess();
        } catch (error) {
          // 🚨 다이얼로그를 통한 에러 표시
          openDialog(({ isOpen, close }) => (
            <ErrorDialog
              isOpen={isOpen}
              title="처리 실패"
              message={error.message}
              onClose={close}
              onRetry={() => {
                close();
                submitMutation.mutateAsync(data);
              }}
            />
          ));
        }
      }}
    />
  )}
</Mutation>
```

## 3. 주의사항 (Caveat)

### ❌ 남용하면 안 되는 경우: 복잡한 페이지에서 억지로 단일 구조로 만들려는 시도

```typescript
// ❌ 너무 복잡한 페이지를 억지로 하나의 SuspenseQuery로 처리하려는 시도
const OverComplexDashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback error={error} />}>
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      {/* 🔴 너무 많은 데이터를 한 번에 로드하려고 시도 */}
      <SuspenseQueries
        queries={[
          userProfileOptions(userId),
          postsOptions(userId),
          ordersOptions(userId),
          productsOptions(),
          reviewsOptions(userId),
          favoritesOptions(userId),
          settingsOptions(userId),
          notificationsOptions(userId)
        ]}
      >
        {([userProfile, posts, orders, products, reviews, favorites, settings, notifications]) => (
          <Layout.Container>
            {/* 🔴 JSX가 너무 길어지고 복잡해짐 (200-300줄) */}
            <Layout.Header>
              <UserInfo user={userProfile} notifications={notifications} />
            </Layout.Header>
            <Layout.MainContent>
              <PostsSection posts={posts} />
              <OrdersSection orders={orders} />
              <ProductsSection products={products} />
              <ReviewsSection reviews={reviews} />
              <FavoritesSection favorites={favorites} />
              {/* ... 더 많은 섹션들 ... */}
            </Layout.MainContent>
          </Layout.Container>
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

**문제점:**
- **🔴 과도한 API 호출**: 8개의 API를 동시에 호출하여 서버 부하 증가
- **🔴 긴 로딩 시간**: 가장 느린 API 완료까지 전체 페이지가 로딩 상태
- **🔴 JSX 복잡도 증가**: 200-300줄의 JSX로 인해 가독성 저하
- **🔴 에러 처리 복잡성**: 하나의 API 실패 시 전체 페이지 에러

**✅ 해결책: 섹션별 분할 구조**

```typescript
// ✅ 페이지를 논리적 섹션으로 분할하여 각각 독립적으로 처리
const DashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback error={error} />}>
    <Layout.Container>
      <Layout.Header>
        {/* 🟢 헤더는 필수 정보만 먼저 로드 */}
        <Suspense fallback={<HeaderSkeleton />}>
          <SuspenseQuery queryOptions={userProfileOptions(userId)}>
            {({ data: userProfile }) => (
              <UserInfo user={userProfile} />
            )}
          </SuspenseQuery>
        </Suspense>
      </Layout.Header>
      
      <Layout.MainContent>
        {/* 🟢 각 섹션이 독립적으로 로드되어 점진적 렌더링 */}
        <DashboardSection title="최근 주문">
          <OrdersSection userId={userId} />
        </DashboardSection>

        <DashboardSection title="내 게시글">
          <PostsSection userId={userId} />
        </DashboardSection>

        <DashboardSection title="찜한 상품">
          <FavoritesSection userId={userId} />
        </DashboardSection>
      </Layout.MainContent>
    </Layout.Container>
  </ErrorBoundary>
);

// 🟢 각 섹션은 내부에서 필요한 데이터만 관리
const OrdersSection = ({ userId }) => (
  <ErrorBoundary fallback={<SectionErrorFallback />}>
    <Suspense fallback={<OrdersSkeleton />}>
      <SuspenseQueries
        queries={[
          ordersOptions(userId),
          recentOrderItemsOptions(userId, { limit: 5 })
        ]}
      >
        {([orders, orderItems]) => (
          <OrdersSectionView orders={orders} orderItems={orderItems} />
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

### ❌ Layout 컴포넌트를 과도하게 세분화하는 경우

```typescript
// ❌ Layout을 너무 세분화해서 오히려 구조 파악이 어려워짐
const OverSegmentedPage = () => (
  <Layout.Root>
    <Layout.Wrapper>
      <Layout.Container>
        <Layout.InnerContainer>
          <Layout.ContentWrapper>
            <Layout.HeaderSection>
              <Layout.HeaderContainer>
                <Layout.HeaderContent>
                  <Layout.TitleWrapper>
                    <h1>제목</h1>
                  </Layout.TitleWrapper>
                </Layout.HeaderContent>
              </Layout.HeaderContainer>
            </Layout.HeaderSection>
            <Layout.MainSection>
              <Layout.MainContainer>
                <Layout.MainContent>
                  {/* 🔴 실제 콘텐츠까지 8단계 중첩 */}
                  <div>실제 콘텐츠</div>
                </Layout.MainContent>
              </Layout.MainContainer>
            </Layout.MainSection>
          </Layout.ContentWrapper>
        </Layout.InnerContainer>
      </Layout.Container>
    </Layout.Wrapper>
  </Layout.Root>
);
```

**문제점:**
- **🔴 과도한 중첩**: 8단계 중첩으로 인한 가독성 저하
- **🔴 의미 없는 분할**: 실질적인 구조적 의미가 없는 래퍼들
- **🔴 유지보수 복잡성**: 스타일 변경 시 여러 레이어 수정 필요

**✅ 해결책: 의미 있는 구조로만 분할**

```typescript
// ✅ 실제 의미가 있는 레이아웃 구조만 유지
const WellStructuredPage = () => (
  <Layout.Container className="min-h-screen flex flex-col">
    <Layout.Header className="sticky top-0 bg-white shadow-sm">
      <h1 className="text-h24 text-text-strong p-6">페이지 제목</h1>
    </Layout.Header>
    
    <Layout.MainContent className="flex-1 p-6">
      {/* 🟢 명확한 3단계 구조: Container > Header/Main */}
      <div>실제 콘텐츠</div>
    </Layout.MainContent>
  </Layout.Container>
);
```

### ❌ 모든 상태를 페이지 레벨에서 관리하려는 경우

```typescript
// ❌ 모든 하위 컴포넌트의 상태를 페이지에서 관리하려는 시도
const OverManagedPage = () => {
  // 🔴 페이지에서 모든 하위 상태를 관리하려고 시도
  const [userFormData, setUserFormData] = useState({});
  const [orderFormData, setOrderFormData] = useState({});
  const [productFilters, setProductFilters] = useState({});
  const [profileSettings, setProfileSettings] = useState({});
  const [notificationPrefs, setNotificationPrefs] = useState({});

  // 🔴 모든 하위 컴포넌트의 핸들러를 페이지에서 정의
  const updateUserForm = (field, value) => { /* ... */ };
  const updateOrderForm = (field, value) => { /* ... */ };
  const updateProductFilters = (filters) => { /* ... */ };
  const updateProfileSettings = (settings) => { /* ... */ };

  return (
    <Layout.Container>
      <UserSection
        formData={userFormData}
        onUpdate={updateUserForm}
      />
      <OrderSection
        formData={orderFormData}
        onUpdate={updateOrderForm}
        filters={productFilters}
        onFilterChange={updateProductFilters}
      />
      <ProfileSection
        settings={profileSettings}
        onSettingsChange={updateProfileSettings}
      />
    </Layout.Container>
  );
};
```

**문제점:**
- **🔴 상태 관리 복잡성**: 페이지에 모든 상태가 집중되어 관리 어려움
- **🔴 Props Drilling**: 깊은 컴포넌트까지 props 전달 필요
- **🔴 재사용성 저하**: 컴포넌트가 페이지에 강하게 결합됨

**✅ 해결책: 섹션별 독립적 상태 관리**

```typescript
// ✅ 각 섹션이 자체적으로 상태를 관리하고, 페이지는 구조만 정의
const WellManagedPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <PageErrorFallback error={error} />}>
    <Layout.Container>
      {/* 🟢 페이지는 구조와 필수 데이터만 관리 */}
      <Suspense fallback={<PageLoadingSkeleton />}>
        <SuspenseQuery queryOptions={userProfileOptions(userId)}>
          {({ data: userProfile }) => (
            <>
              <Layout.Header>
                <UserInfo user={userProfile} />
              </Layout.Header>
              
              <Layout.MainContent>
                {/* 🟢 각 섹션이 독립적으로 상태 관리 */}
                <UserSection userId={userId} />
                <OrderSection userId={userId} />
                <ProfileSection userId={userId} />
              </Layout.MainContent>
            </>
          )}
        </SuspenseQuery>
      </Suspense>
    </Layout.Container>
  </ErrorBoundary>
);

// 🟢 각 섹션은 내부 상태를 독립적으로 관리
const UserSection = ({ userId }) => {
  // 이 섹션에서만 필요한 상태 관리
  const [formData, setFormData] = useState({});
  
  return (
    <section>
      <UserForm data={formData} onChange={setFormData} />
    </section>
  );
};
```

**주의사항 요약:** 복잡한 페이지는 섹션별 분할, Layout 과도한 중첩 지양, 섹션별 독립적 상태 관리로 해결

### 남용 방지 핵심 원칙:
- **🎯 적절한 분할**: 페이지가 너무 복잡하면 의미 있는 섹션으로 분할
- **🏗️ 의미 있는 구조**: 과도한 Layout 중첩보다는 실제 의미가 있는 구조만 유지  
- **🔄 독립적 관리**: 각 섹션이 자체 상태와 데이터를 독립적으로 관리
- **📊 점진적 로딩**: 전체를 한 번에 로드하지 말고 섹션별로 점진적 렌더링

## 4. 사용된 레퍼런스

> 🚧 **Work In Progress**  
> 실제 프로젝트 적용 사례와 구체적인 레퍼런스는 추후 추가될 예정입니다.

## 5. 더 알아보기

### 페이지 구조 예측 가능성의 장점

**개발 효율성:**
- **빠른 코드 파악**: 새로운 개발자도 페이지 구조와 데이터 흐름을 즉시 이해
- **디버깅 용이**: 문제 발생 시 관련 코드를 한눈에 파악하여 빠른 해결
- **코드 리뷰 효율**: 리뷰어가 페이지 의도와 구현을 쉽게 검증 가능

**유지보수성:**
- **변경 영향 예측**: 코드 수정 시 영향 범위를 명확히 파악
- **안전한 리팩토링**: 구조가 명확하여 리팩토링 시 사이드 이펙트 최소화
- **일관된 패턴**: 팀 전체가 동일한 구조 패턴으로 개발하여 혼란 방지

### 권장 사용 시나리오

**적합한 경우:**
- 복잡한 데이터 처리가 필요한 대시보드 페이지
- 여러 API 호출과 상태 관리가 필요한 폼 페이지
- 팀에서 코드 가독성과 유지보수성을 중시하는 경우

**부적합한 경우:**
- 매우 단순한 정적 페이지 (과도한 구조화 불필요)
- 프로토타입이나 일회성 페이지
- 성능이 구조보다 절대적으로 중요한 경우

### 팀 적용 가이드라인

**도입 단계:**
1. **팀 컨벤션 정의**: Layout 컴포넌트 네이밍과 구조 표준화
2. **점진적 적용**: 새로운 페이지부터 패턴 적용 시작
3. **코드 리뷰 체크리스트**: 구조 예측 가능성을 리뷰 항목에 포함

**성공 지표:**
- 새로운 팀원의 코드 이해 시간 단축
- 버그 수정 시간 감소
- 코드 리뷰 시간 단축

### 관련 문서
- [Section Compound Pattern](../../03-best-practice/04-style-layout/section-compound-pattern.md): 레이아웃 구조 표현 방법
- [API Call Pattern](../../03-best-practice/00-api/README.md): 데이터 페칭과 상태 관리 패턴
