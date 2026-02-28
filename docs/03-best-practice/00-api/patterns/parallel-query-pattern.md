---
title: "SuspenseQueries 병렬 호출 패턴"
description: "병렬 쿼리로 waterfall과 로더 깜빡임을 줄이고 단일 Suspense로 로딩을 통합하는 패턴입니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# SuspenseQueries 병렬 호출 패턴

## 1. 해결하려는 문제

### 1.1 Suspense 중첩으로 인한 Waterfall 문제

```typescript
// ❌ Suspense 중첩으로 인한 waterfall 발생
const UserDashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    {/* 첫 번째 Suspense */}
    <Suspense fallback={<UserProfileSkeleton />}>
      <UserProfileSection userId={userId} />
      
      {/* 두 번째 Suspense - UserProfileSection 완료 후에야 시작 */}
      <Suspense fallback={<AccountSkeleton />}>
        <AccountSection userId={userId} />
        
        {/* 세 번째 Suspense - AccountSection 완료 후에야 시작 */}
        <Suspense fallback={<TransactionSkeleton />}>
          <TransactionSection userId={userId} />
        </Suspense>
      </Suspense>
    </Suspense>
  </ErrorBoundary>
);

// 각 컴포넌트에서 개별적으로 API 호출
const UserProfileSection = ({ userId }) => {
  const { data: profile } = useSuspenseQuery(userProfileOptions(userId));
  return <UserProfile profile={profile} />;
};

const AccountSection = ({ userId }) => {
  const { data: accounts } = useSuspenseQuery(accountsOptions(userId));
  return <AccountList accounts={accounts} />;
};

const TransactionSection = ({ userId }) => {
  const { data: transactions } = useSuspenseQuery(transactionsOptions(userId));
  return <TransactionHistory transactions={transactions} />;
};
```

**문제점:**
- **Waterfall 발생**: 각 API 호출이 순차적으로 실행됨 (profile → accounts → transactions)
- **깜빡이는 로더**: 첫 번째 로더 → 두 번째 로더 → 세 번째 로더 순차적 표시
- **UX 저하**: 사용자가 여러 번의 로딩 상태를 경험

### 1.2 PrefetchQuery로도 해결되지 않는 깜빡임 문제

```typescript
// ❌ PrefetchQuery 사용해도 깜빡임 문제는 여전히 존재
const UserDashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    {/* 미리 prefetch하지만 API 호출 완료 보장 안됨 */}
    <PrefetchQuery queryOptions={userProfileOptions(userId)} />
    <PrefetchQuery queryOptions={accountsOptions(userId)} />
    <PrefetchQuery queryOptions={transactionsOptions(userId)} />
    
    {/* 여전히 중첩된 Suspense 구조 */}
    <Suspense fallback={<UserProfileSkeleton />}>
      <UserProfileSection userId={userId} />
      
      <Suspense fallback={<AccountSkeleton />}>
        <AccountSection userId={userId} />
        
        <Suspense fallback={<TransactionSkeleton />}>
          <TransactionSection userId={userId} />
        </Suspense>
      </Suspense>
    </Suspense>
  </ErrorBoundary>
);
```

**여전히 남는 문제점:**
- **API 호출 완료 미보장**: PrefetchQuery는 백그라운드에서 실행되므로 완료 시점을 보장하지 않음
- **깜빡임 지속**: 각 Suspense가 개별적으로 fallback을 렌더링하므로 깜빡임 현상 지속
- **예측 불가능한 로딩**: prefetch가 완료되지 않은 경우 여전히 waterfall 발생 가능

**문제 요약:** Suspense 중첩 시 waterfall과 깜빡이는 로더 문제가 발생하며, PrefetchQuery만으로는 깜빡임 문제 해결 불가

## 2. 해결 방법

```typescript
// ✅ SuspenseQueries로 병렬 호출 및 통합 로딩 상태 관리
import { SuspenseQueries } from '@suspensive/react-query';
import { Suspense, ErrorBoundary } from '@suspensive/react';

const UserDashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback error={error} />}>
    {/* 단일 Suspense로 모든 로딩 상태 통합 */}
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      {/* 모든 쿼리가 병렬로 실행되고 모두 완료될 때까지 대기 */}
      <SuspenseQueries 
        queries={[
          userProfileOptions(userId),
          accountsOptions(userId), 
          transactionsOptions(userId),
          notificationsOptions(userId),
          settingsOptions(userId)
        ]}
      >
        {([
          { data: profile }, 
          { data: accounts }, 
          { data: transactions },
          { data: notifications },
          { data: settings }
        ]) => (
          <DashboardLayout>
            {/* 모든 데이터가 준비된 후 한 번에 렌더링 */}
            <UserProfile profile={profile} />
            <AccountList accounts={accounts} />
            <TransactionHistory transactions={transactions} />
            <NotificationPanel notifications={notifications} />
            <UserSettings settings={settings} />
          </DashboardLayout>
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

### 2.1 병렬 호출과 데이터 변환 결합

```typescript
// ✅ select 함수와 병렬 호출 결합으로 최적화
const selectDashboardProfile = (profile: UserProfileResponse) => ({
  name: profile.fullName,
  avatar: profile.avatarUrl,
  membershipLevel: profile.membership?.level || 'BASIC',
  lastLoginAt: profile.lastLoginAt,
});

const selectActiveAccounts = (accounts: AccountResponse[]) =>
  accounts
    .filter(account => account.status === 'ACTIVE')
    .sort((a, b) => b.balance - a.balance);

const selectRecentTransactions = (transactions: TransactionResponse[]) =>
  transactions
    .filter(tx => tx.createdAt > Date.now() - 30 * 24 * 60 * 60 * 1000) // 최근 30일
    .slice(0, 10)
    .map(tx => ({
      ...tx,
      displayAmount: formatCurrency(tx.amount),
      categoryIcon: getCategoryIcon(tx.category),
    }));

const UserDashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback error={error} />}>
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <SuspenseQueries 
        queries={[
          { ...userProfileOptions(userId), select: selectDashboardProfile },
          { ...accountsOptions(userId), select: selectActiveAccounts },
          { ...transactionsOptions(userId), select: selectRecentTransactions },
          notificationsOptions(userId),
          settingsOptions(userId)
        ]}
      >
        {([
          { data: profile }, 
          { data: accounts }, 
          { data: transactions },
          { data: notifications },
          { data: settings }
        ]) => (
          <DashboardLayout>
            <UserProfile profile={profile} />
            <AccountList accounts={accounts} />
            <TransactionHistory transactions={transactions} />
            <NotificationPanel notifications={notifications} />
            <UserSettings settings={settings} />
          </DashboardLayout>
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

**해결 요약:** SuspenseQueries로 모든 쿼리를 병렬 실행하고 단일 Suspense로 통합 로딩 상태 관리하여 waterfall과 깜빡임 문제 해결

## 3. 주의사항 (Caveat)

### 3.1 과도한 병렬 호출로 인한 성능 문제

```typescript
// ❌ 너무 많은 API를 병렬로 호출하면 서버 부하 증가
const OverloadedDashboardPage = ({ userId }) => (
  <SuspenseQueries 
    queries={[
      userProfileOptions(userId),
      accountsOptions(userId),
      transactionsOptions(userId),
      investmentsOptions(userId),
      loansOptions(userId),
      insuranceOptions(userId),
      creditCardOptions(userId),
      savingsOptions(userId),
      budgetOptions(userId),
      goalsOptions(userId),
      notificationsOptions(userId),
      settingsOptions(userId),
      promotionsOptions(userId),
      rewardsOptions(userId),
      analyticsOptions(userId), // 15개 API 동시 호출!
    ]}
  >
    {/* ... */}
  </SuspenseQueries>
);

// ✅ 핵심 데이터와 부가 데이터 분리
const OptimizedDashboardPage = ({ userId }) => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<DashboardSkeleton />}>
      {/* 핵심 데이터만 병렬 호출 */}
      <SuspenseQueries 
        queries={[
          userProfileOptions(userId),
          accountsOptions(userId),
          transactionsOptions(userId),
          notificationsOptions(userId)
        ]}
      >
        {([{ data: profile }, { data: accounts }, { data: transactions }, { data: notifications }]) => (
          <DashboardLayout>
            <UserProfile profile={profile} />
            <AccountList accounts={accounts} />
            <TransactionHistory transactions={transactions} />
            <NotificationPanel notifications={notifications} />
            
            {/* 부가 데이터는 개별 Suspense로 지연 로딩 */}
            <Suspense fallback={<PromotionsSkeleton />}>
              <PromotionsSection userId={userId} />
            </Suspense>
            
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsSection userId={userId} />
            </Suspense>
          </DashboardLayout>
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

### 3.2 의존성이 있는 쿼리의 잘못된 병렬 처리

```typescript
// ❌ 의존성이 있는 쿼리를 병렬로 처리하면 에러 발생
const WrongParallelQueries = ({ userId }) => (
  <SuspenseQueries 
    queries={[
      userProfileOptions(userId),
      // accountId가 필요한데 userProfile 완료 전에 호출하면 에러
      accountDetailsOptions(userProfile?.defaultAccountId), // userProfile이 아직 없음!
      transactionsOptions(userProfile?.defaultAccountId)   // userProfile이 아직 없음!
    ]}
  >
    {/* ... */}
  </SuspenseQueries>
);

// ✅ 의존성이 있는 쿼리는 단계별로 분리
const CorrectDependentQueries = ({ userId }) => (
  <ErrorBoundary fallback={<ErrorFallback />}>
    <Suspense fallback={<UserProfileSkeleton />}>
      <SuspenseQueries queries={[userProfileOptions(userId)]}>
        {([{ data: userProfile }]) => (
          <Suspense fallback={<AccountDetailsSkeleton />}>
            {/* userProfile 완료 후 의존성 있는 쿼리들 병렬 실행 */}
            <SuspenseQueries 
              queries={[
                accountDetailsOptions(userProfile.defaultAccountId),
                transactionsOptions(userProfile.defaultAccountId),
                budgetOptions(userProfile.defaultAccountId)
              ]}
            >
              {([{ data: account }, { data: transactions }, { data: budget }]) => (
                <DashboardLayout>
                  <UserProfile profile={userProfile} />
                  <AccountDetails account={account} />
                  <TransactionHistory transactions={transactions} />
                  <BudgetOverview budget={budget} />
                </DashboardLayout>
              )}
            </SuspenseQueries>
          </Suspense>
        )}
      </SuspenseQueries>
    </Suspense>
  </ErrorBoundary>
);
```

**주의사항 요약:** 과도한 병렬 호출로 인한 서버 부하 주의, 의존성 있는 쿼리는 단계별 분리 필요

## 4. 사용된 레퍼런스

### 실제 적용 사례 - 금융 대시보드

```typescript
// src/dashboard/dashboard-page.tsx
const FinancialDashboardPage = ({ userId }) => {
  const selectAssetSummary = (assets: AssetResponse[]) => ({
    totalBalance: assets.reduce((sum, asset) => sum + asset.balance, 0),
    accountCount: assets.length,
    topAccount: assets.sort((a, b) => b.balance - a.balance)[0],
  });

  const selectRecentActivity = (transactions: TransactionResponse[]) =>
    transactions
      .filter(tx => tx.createdAt > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .slice(0, 5);

  return (
    <ErrorBoundary fallback={({ error }) => <DashboardErrorFallback error={error} />}>
      <Suspense fallback={<FinancialDashboardSkeleton />}>
        <SuspenseQueries 
          queries={[
            { ...userProfileOptions(userId) },
            { ...assetsOptions(userId), select: selectAssetSummary },
            { ...transactionsOptions(userId), select: selectRecentActivity },
            { ...alertsOptions(userId) }
          ]}
        >
          {([{ data: profile }, { data: assets }, { data: activity }, { data: alerts }]) => (
            <DashboardGrid>
              <WelcomeCard profile={profile} />
              <AssetSummaryCard assets={assets} />
              <RecentActivityCard activity={activity} />
              <AlertsCard alerts={alerts} />
              
              {/* 부가 정보는 별도 로딩 */}
              <Suspense fallback={<RecommendationsSkeleton />}>
                <RecommendationsSection userId={userId} />
              </Suspense>
            </DashboardGrid>
          )}
        </SuspenseQueries>
      </Suspense>
    </ErrorBoundary>
  );
};
```

### 실제 적용 사례 - 투자 포트폴리오 페이지

```typescript
const InvestmentPortfolioPage = ({ userId }) => {
  const selectPortfolioSummary = (portfolio: PortfolioResponse) => ({
    totalValue: portfolio.totalMarketValue,
    totalReturn: portfolio.totalReturn,
    returnRate: (portfolio.totalReturn / portfolio.totalInvested) * 100,
    riskLevel: calculateRiskLevel(portfolio.holdings),
  });

  const selectTopHoldings = (holdings: HoldingResponse[]) =>
    holdings
      .sort((a, b) => b.marketValue - a.marketValue)
      .slice(0, 10);

  return (
    <ErrorBoundary fallback={({ error }) => <PortfolioErrorFallback error={error} />}>
      <Suspense fallback={<PortfolioLoadingSkeleton />}>
        <SuspenseQueries 
          queries={[
            { ...portfolioSummaryOptions(userId), select: selectPortfolioSummary },
            { ...holdingsOptions(userId), select: selectTopHoldings },
            { ...marketDataOptions() },
            { ...performanceOptions(userId) }
          ]}
        >
          {([{ data: summary }, { data: holdings }, { data: market }, { data: performance }]) => (
            <PortfolioLayout>
              <PortfolioHeader summary={summary} marketData={market} />
              <HoldingsTable holdings={holdings} />
              <PerformanceChart performance={performance} />
              
              {/* 상세 분석은 지연 로딩 */}
              <Suspense fallback={<AnalysisSkeleton />}>
                <DetailedAnalysisSection userId={userId} />
              </Suspense>
            </PortfolioLayout>
          )}
        </SuspenseQueries>
      </Suspense>
    </ErrorBoundary>
  );
};
```

## 5. 더 알아보기

### 병렬 호출의 성능 이점

**네트워크 최적화:**
- **동시 실행**: 모든 API 호출이 동시에 시작되어 전체 로딩 시간 단축
- **연결 재사용**: HTTP/2 환경에서 동일 도메인에 대한 연결 재사용
- **브라우저 최적화**: 브라우저의 병렬 요청 처리 최적화 활용

**UX 개선:**
- **단일 로딩 상태**: 사용자가 하나의 로딩 화면만 경험
- **깜빡임 제거**: 여러 번의 로더 표시 → 한 번의 로더 표시
- **예측 가능한 로딩**: 모든 데이터가 준비된 후 완전한 페이지 표시

### 권장 사용 시나리오

**적합한 경우:**
- 서로 독립적인 여러 API 호출이 필요한 페이지
- 모든 데이터가 페이지 렌더링에 필수적인 경우
- 사용자가 완전한 정보를 한 번에 보는 것이 중요한 경우

**부적합한 경우:**
- API 간 의존성이 있는 경우
- 일부 데이터는 나중에 로드되어도 되는 경우 (Progressive Loading 선호)
- 서버 부하를 고려해야 하는 대용량 데이터

### 성능 모니터링 지표

```typescript
// 성능 측정을 위한 로깅 예시
const MonitoredDashboardPage = ({ userId }) => {
  const startTime = performance.now();
  
  return (
    <Suspense 
      fallback={<DashboardSkeleton />}
      onResolve={() => {
        const loadTime = performance.now() - startTime;
        analytics.track('dashboard_load_time', { 
          loadTime, 
          userId,
          queryCount: 4 
        });
      }}
    >
      <SuspenseQueries queries={[...]}>
        {/* ... */}
      </SuspenseQueries>
    </Suspense>
  );
};
```

**측정해야 할 지표:**
- **전체 로딩 시간**: 모든 쿼리 완료까지의 시간
- **개별 쿼리 시간**: 각 API 호출의 응답 시간
- **서버 부하**: 동시 요청으로 인한 서버 리소스 사용량
- **사용자 경험**: 로딩 상태 지속 시간과 사용자 이탈률

### 달성되는 효과

- **🚀 성능 향상**: Waterfall 제거로 전체 로딩 시간 단축 (순차 → 병렬)
- **✨ UX 개선**: 깜빡이는 로더 제거로 매끄러운 사용자 경험
- **🎯 예측 가능성**: 모든 데이터 준비 후 완전한 페이지 표시
- **🔧 유지보수성**: 모든 쿼리가 한 곳에 정의되어 관리 용이
- **📊 성능 측정**: 단일 로딩 지점으로 성능 모니터링 단순화
