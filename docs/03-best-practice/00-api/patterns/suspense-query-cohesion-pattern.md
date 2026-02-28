---
title: "SuspenseQuery 응집도 패턴"
description: "SuspenseQueries로 데이터 fetching과 변환을 한곳에 모아 흐름을 명확히 하는 응집도 개선 패턴입니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# SuspenseQuery 응집도 패턴

## 1. 해결하려는 문제

```typescript
// ❌ SuspenseQuery 선언부 (상단)
const LoanApplicationPage = ({ userId }) => {
  const userQuery = useSuspenseQuery(userProfileOptions(userId));
  const loanProductsQuery = useSuspenseQuery(loanProductsOptions());
  const applicationDraftQuery = useSuspenseQuery(applicationDraftOptions(userId));
  
  // 데이터 변환이 여기서 일어나지만 어떤 변환인지 불명확
  const user = userQuery.data;
  const loanProducts = loanProductsQuery.data.filter(p => p.isActive);
  const formData = applicationDraftQuery.data ? transformDraft(applicationDraftQuery.data) : {};
  
  // ... 많은 다른 로직들 (50-100줄) ...
  
  const handleSubmit = async (data) => {
    // 복잡한 비즈니스 로직
    try {
      await submitApplication(data);
      onSuccess();
    } catch (error) {
      handleError(error);
    }
  };
  
  // ... 더 많은 로직들 ...
  
  // 실제 사용처 (하단) - 선언부와 멀리 떨어짐
  return (
    <ApplicationForm 
      user={user}  // 어떤 데이터 변환이 일어났는지 추적 어려움
      loanProducts={loanProducts}  // 필터링 로직이 상단에 숨어있음
      initialData={formData}  // 변환 로직을 찾기 위해 상단으로 이동 필요
      onSubmit={handleSubmit}  // 핸들러도 별도 분리
    />
  );
};
```

**문제 요약:** SuspenseQuery 선언부와 사용처가 멀리 떨어져 있고, 데이터 변환 로직이 숨어있어 코드 흐름 파악 어려움

## 2. 해결 방법

```typescript
// ✅ SuspenseQueries 컴포넌트로 응집도 향상
import { SuspenseQueries } from '@suspensive/react-query';
import { Suspense, ErrorBoundary } from '@suspensive/react';

// 🔍 select 함수들이 명시적으로 드러나서 데이터 변환 의도를 파악 가능
const selectUserForApplication = (userData: UserApiResponse): UserForApplication => ({
  id: userData.id,
  name: userData.fullName,
  creditScore: userData.creditInfo?.score,
  isEligible: userData.creditInfo?.score >= 600,
});

const selectAvailableLoanProducts = (products: LoanProduct[]): AvailableLoanProduct[] =>
  products
    .filter(product => product.isActive && product.isAvailable)
    .map(product => ({
      ...product,
      displayName: `${product.name} (${product.interestRate}%)`,
    }));

const selectDraftForFormData = (draft: ApplicationDraft | null): FormData =>
  draft ? transformDraftToFormData(draft) : getInitialFormData();

const LoanApplicationPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <ApplicationErrorFallback message={error.message} />}>
    <Suspense fallback={<ApplicationLoadingSkeleton />}>
      {/* 🚀 SuspenseQuery 선언과 사용이 가까운 곳에 위치 */}
      <SuspenseQueries 
        queries={[
          { ...userProfileOptions(userId), select: selectUserForApplication },
          { ...loanProductsOptions(), select: selectAvailableLoanProducts },
          { ...applicationDraftOptions(userId), select: selectDraftForFormData }
        ]}
      >
        {([{ data: user }, { data: loanProducts }, { data: formData }]) => (
          <ApplicationForm 
            user={user}  // selectUserForApplication 변환 결과임을 명확히 알 수 있음
            loanProducts={loanProducts}  // selectAvailableLoanProducts 필터링 결과
            initialData={formData}  // selectDraftForFormData 변환 결과
            onSubmit={async (data) => {
              // SuspenseQuery와 비즈니스 로직이 가까워 코드 흐름 파악 용이
              try {
                await submitApplication(data);
                onSuccess();
              } catch (error) {
                handleError(error);
              }
            }}
          />
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

**해결 요약:** SuspenseQueries 컴포넌트로 데이터 fetching, 변환, 사용처 응집도 향상, select 함수로 데이터 변환 의도 명확화

## 3. 주의사항 (Caveat)

### 3.1 과도한 SuspenseQueries 중첩

```typescript
// ❌ 과도한 SuspenseQueries 중첩
const ComplexPage = () => (
  <SuspenseQueries queries={[userQuery, settingsQuery]}>
    {([{ data: user }, { data: settings }]) => (
      <SuspenseQueries queries={[profileQuery, preferencesQuery]}>
        {([{ data: profile }, { data: preferences }]) => (
          <SuspenseQueries queries={[notificationQuery, activityQuery]}>
            {([{ data: notifications }, { data: activity }]) => (
              // 중첩이 너무 깊어짐
              <Dashboard />
            )}
          </SuspenseQueries>
        )}
      </SuspenseQueries>
    )}
  </SuspenseQueries>
);

// ✅ 단일 SuspenseQueries로 모든 쿼리 통합
const ComplexPage = () => (
  <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback message={error.message} />}>
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <SuspenseQueries 
        queries={[
          userQuery,
          settingsQuery, 
          profileQuery, 
          preferencesQuery,
          notificationQuery,
          activityQuery
        ]}
      >
        {([
          { data: user }, 
          { data: settings }, 
          { data: profile }, 
          { data: preferences },
          { data: notifications }, 
          { data: activity }
        ]) => (
          <Dashboard 
            user={user}
            settings={settings}
            profile={profile}
            preferences={preferences}
            notifications={notifications}
            activity={activity}
          />
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

> 💡 **병렬 호출과 Waterfall 문제에 대한 자세한 내용은 [SuspenseQueries 병렬 호출 패턴](./parallel-query-pattern.md)을 참고하세요.**

### 3.2 Wrap 패턴 제거로 인한 이점

이러한 구조를 사용하면 **페이지를 다시 Suspense나 ErrorBoundary로 감싸는 wrap 컴포넌트가 불필요**해집니다.

```typescript
// ❌ 기존 wrap 패턴 (Suspensive v3에서 deprecated)
const Page = wrap
  .ErrorBoundaryGroup({ blockOutside: true })
  .ErrorBoundary({
    fallback: ({ error }) => <PageErrorFallback message={error.message} />,
  })
  .Suspense({ fallback: <PageSkeleton /> })
  .on(() => {
    const { data: userProfile } = useSuspenseQuery(userProfileOptions(userId));
    const { data: loanProducts } = useSuspenseQuery(loanProductsOptions());
    
    return <>{/* 페이지 내용 */}</>;
  });

// ✅ 새로운 구조 (Suspensive v3 권장)
const LoanApplicationPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <ApplicationErrorFallback message={error.message} />}>
    <Suspense fallback={<ApplicationLoadingSkeleton />}>
      <SuspenseQueries queries={[userProfileOptions(userId), loanProductsOptions()]}>
        {([{ data: userProfile }, { data: loanProducts }]) => (
          <>{/* 페이지 내용 */}</>
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

**Suspensive v3 마이그레이션 참고사항:**

[Suspensive v3 마이그레이션 가이드](https://v3.suspensive.org/en/docs/react/migration/migrate-to-v3#handling-breaking-changes)에 따르면 `wrap` 패턴이 제거되고 `with` 메소드로 대체되었습니다:

```typescript
// + 새로운 방식 (v3)
const Example = ErrorBoundaryGroup.with(
  { blockOutside: false },
  ErrorBoundary.with(
    { fallback: ({ error }) => <>{error.message}</>, onError: logger.log },
    Suspense.with({ fallback: <>loading...</>, clientOnly: true }, () => {
      const query = useSuspenseQuery({
        queryKey: ['key'],
        queryFn: () => api.text(),
      });
      return <>{query.data.text}</>;
    })
  )
);

// - 기존 방식 (deprecated)
const Example = wrap
  .ErrorBoundaryGroup({ blockOutside: false })
  .ErrorBoundary({
    fallback: ({ error }) => <>{error.message}</>,
    onError: logger.log,
  })
  .Suspense({ fallback: <>loading...</>, clientOnly: true })
  .on(() => {
    const query = useSuspenseQuery({
      queryKey: ['key'],
      queryFn: () => api.text(),
    });
    return <>{query.data.text}</>;
  });
```

**하지만 SuspenseQueries 패턴을 사용하면 이러한 복잡한 wrap이나 with 패턴 없이도 깔끔하게 구조화**할 수 있습니다.

**주의사항 요약:** 과도한 중첩 대신 단일 SuspenseQueries 사용, wrap 패턴 제거로 구조 단순화

## 4. 사용된 레퍼런스

### 실제 적용 사례 - 대출 신청 페이지

```typescript
// src/products/application/application-page.tsx
const LoanApplicationPage = ({ userId }) => {
  const selectUserCreditInfo = (user: UserResponse) => ({
    name: user.fullName,
    creditScore: user.creditInfo?.score || 0,
    isEligible: (user.creditInfo?.score || 0) >= 600,
    income: user.financialInfo?.monthlyIncome || 0,
  });

  const selectEligibleProducts = (products: LoanProduct[]) =>
    products
      .filter(product => product.isActive && product.minCreditScore <= (user?.creditScore || 0))
      .sort((a, b) => a.interestRate - b.interestRate);

  return (
    <ErrorBoundary fallback={({ error }) => <LoanApplicationErrorFallback error={error} />}>
      <Suspense fallback={<LoanApplicationSkeleton />}>
        <SuspenseQueries 
          queries={[
            { ...userCreditInfoOptions(userId), select: selectUserCreditInfo },
            { ...loanProductsOptions(), select: selectEligibleProducts },
            applicationDraftOptions(userId)
          ]}
        >
          {([{ data: userCredit }, { data: products }, { data: draft }]) => (
            <LoanApplicationForm 
              userCredit={userCredit}
              availableProducts={products}
              initialDraft={draft}
            />
          )}
        </SuspenseQueries>
      </Suspense>
    </ErrorBoundary>
  );
};
```

### 실제 적용 사례 - 사용자 대시보드

```typescript
// src/dashboard/user-dashboard-page.tsx
const UserDashboardPage = ({ userId }) => {
  const selectDashboardData = (data: DashboardResponse) => ({
    totalAssets: data.assets.reduce((sum, asset) => sum + asset.value, 0),
    recentTransactions: data.transactions.slice(0, 5),
    alerts: data.notifications.filter(n => n.priority === 'high'),
  });

  return (
    <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback error={error} />}>
      <Suspense fallback={<DashboardSkeleton />}>
        <SuspenseQueries 
          queries={[
            { ...userProfileOptions(userId) },
            { ...dashboardDataOptions(userId), select: selectDashboardData },
            { ...accountSummaryOptions(userId) }
          ]}
        >
          {([{ data: profile }, { data: dashboard }, { data: accounts }]) => (
            <DashboardLayout>
              <UserProfile profile={profile} />
              <AssetsSummary totalAssets={dashboard.totalAssets} />
              <RecentTransactions transactions={dashboard.recentTransactions} />
              <AccountsList accounts={accounts} />
              <AlertsPanel alerts={dashboard.alerts} />
            </DashboardLayout>
          )}
        </SuspenseQueries>
      </Suspense>
    </ErrorBoundary>
  );
};
```

## 5. 더 알아보기

### Co-location의 장점
- **🔍 데이터 흐름 명확**: 필요한 API와 데이터 변환 로직을 한눈에 파악
- **🔍 select 함수 추상화**: 데이터 변환 의도가 함수명으로 명확히 드러남
- **🔍 wrap 패턴 불필요**: 페이지 자체에서 ErrorBoundary와 Suspense 처리 완료
- **🔍 구조 예측 가능**: SuspenseQueries로 모든 비동기 데이터 상태가 명확히 연결됨

### Select 함수 패턴의 이점
- **명시적 데이터 변환**: 함수명으로 변환 의도를 명확히 표현
- **재사용 가능**: 동일한 변환 로직을 다른 곳에서도 활용 가능
- **테스트 용이**: 순수 함수로 분리되어 단위 테스트 작성 쉬움
- **성능 최적화**: React Query의 select 최적화 혜택

### 권장 사용 시나리오
- 여러 API 호출이 필요한 페이지
- 데이터 변환 로직이 복잡한 경우
- API 응답과 UI에서 필요한 데이터 형태가 다른 경우
- 페이지 로딩과 에러 상태를 통합 관리하고 싶은 경우

### 달성되는 효과
- **🔍 데이터 흐름 명확**: 필요한 API와 데이터 변환 로직을 한눈에 파악
- **🔍 select 함수 추상화**: 데이터 변환 의도가 함수명으로 명확히 드러남
- **🔍 wrap 패턴 불필요**: 페이지 자체에서 ErrorBoundary와 Suspense 처리 완료
- **🔍 구조 예측 가능**: SuspenseQueries로 모든 비동기 상태가 명확히 연결됨
- **🚀 로딩 상태 통합**: 여러 쿼리의 로딩 상태를 하나의 Suspense로 관리
- **🚨 에러 처리 통합**: 여러 쿼리의 에러를 하나의 ErrorBoundary로 처리
