---
title: "SuspenseQuery 조건부 패턴"
description: "조건부 데이터 페칭에서 Hooks 제약을 피하고 SuspenseQuery 컴포넌트로 응집도를 높이는 방법을 다룹니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# SuspenseQuery 조건부 패턴

## 1. 해결하려는 문제

```typescript
// ❌ 조건부로 query를 사용하려고 하면 Rules of Hooks 위반
const UserProfile = ({ userId, isPremiumUser }) => {
  const userQuery = useSuspenseQuery(userOptions(userId));
  
  // 🚨 ERROR: Hooks는 조건부로 사용할 수 없음
  if (isPremiumUser) {
    const premiumDataQuery = useSuspenseQuery(premiumDataOptions(userId)); // Rules of Hooks 위반!
    return (
      <div>
        <h1>{userQuery.data.name}</h1>
        <div>{premiumDataQuery.data.premiumFeatures}</div>
      </div>
    );
  }
  
  return <div><h1>{userQuery.data.name}</h1></div>;
};

// ❌ 어쩔 수 없이 컴포넌트를 분리해야 함
const UserProfile = ({ userId, isPremiumUser }) => {
  const userQuery = useSuspenseQuery(userOptions(userId));
  
  return (
    <div>
      <h1>{userQuery.data.name}</h1>
      {isPremiumUser ? (
        <PremiumUserSection userId={userId} /> // 별도 컴포넌트 필요
      ) : (
        <BasicUserSection />
      )}
    </div>
  );
};

// 의미없는 wrapper 컴포넌트
const PremiumUserSection = ({ userId }) => {
  const premiumDataQuery = useSuspenseQuery(premiumDataOptions(userId));
  return <div>{premiumDataQuery.data.premiumFeatures}</div>;
};
```

**문제 요약:** React hooks 제약으로 조건부 데이터 페칭을 위해 불필요한 wrapper 컴포넌트 생성 필요

## 2. 해결 방법

```typescript
// ✅ SuspenseQuery 컴포넌트로 조건부 사용 가능
import { SuspenseQuery } from '@suspensive/react-query';

const UserProfile = ({ userId, isPremiumUser }) => (
  <SuspenseQuery queryOptions={userOptions(userId)}>
    {({ data: user }) => (
      <div>
        <h1>{user.name}</h1>
        {/* 🎯 조건부로 SuspenseQuery 컴포넌트 사용 가능 (Rules of Hooks 위반 없음) */}
        {isPremiumUser && (
          <SuspenseQuery queryOptions={premiumDataOptions(userId)}>
            {({ data: premiumData }) => (
              <div>{premiumData.premiumFeatures}</div>
            )}
          </SuspenseQuery>
        )}
      </div>
    )}
  </SuspenseQuery>
);

// ✅ 불필요한 wrapper 컴포넌트들 제거됨
// PremiumUserSection, BasicUserSection 컴포넌트가 더 이상 필요 없음
```

**해결 요약:** SuspenseQuery 컴포넌트는 조건부/반복문에서 자유롭게 사용 가능하여 불필요한 wrapper 컴포넌트 생성을 방지

## 3. 주의사항 (Caveat)

```typescript
// ❌ 과도한 SuspenseQuery 중첩
const UserDashboard = ({ userId }) => (
  <SuspenseQuery queryOptions={userOptions(userId)}>
    {({ data: user }) => (
      <SuspenseQuery queryOptions={postsOptions(userId)}>
        {({ data: posts }) => (
          <SuspenseQuery queryOptions={commentsOptions(userId)}>
            {({ data: comments }) => (
              <SuspenseQuery queryOptions={likesOptions(userId)}>
                {({ data: likes }) => (
                  // 너무 깊은 중첩
                  <Dashboard user={user} posts={posts} comments={comments} likes={likes} />
                )}
              </SuspenseQuery>
            )}
          </SuspenseQuery>
        )}
      </SuspenseQuery>
    )}
  </SuspenseQuery>
);

// ✅ SuspenseQueries로 병렬 처리
import { SuspenseQueries } from '@suspensive/react-query';

const UserDashboard = ({ userId }) => (
  <SuspenseQueries
    queries={[
      userOptions(userId),
      postsOptions(userId), 
      commentsOptions(userId),
      likesOptions(userId)
    ]}
  >
    {([{ data: user }, { data: posts }, { data: comments }, { data: likes }]) => (
      <Dashboard user={user} posts={posts} comments={comments} likes={likes} />
    )}
  </SuspenseQueries>
);
```

**주의사항 요약:** 여러 독립적인 query는 SuspenseQueries로 병렬 처리하여 중첩 방지

## 4. 사용된 레퍼런스

### 실제 적용 사례 - 사용자 프로필 페이지

```typescript
// src/user/profile/user-profile-page.tsx
const UserProfilePage = ({ userId, userRole }) => (
  <SuspenseQuery queryOptions={userBasicInfoOptions(userId)}>
    {({ data: basicInfo }) => (
      <div>
        <UserBasicInfo user={basicInfo} />
        
        {/* 관리자만 추가 정보 표시 */}
        {userRole === 'admin' && (
          <SuspenseQuery queryOptions={adminDataOptions(userId)}>
            {({ data: adminData }) => (
              <AdminPanel data={adminData} />
            )}
          </SuspenseQuery>
        )}
        
        {/* 프리미엄 사용자만 통계 표시 */}
        {basicInfo.isPremium && (
          <SuspenseQuery queryOptions={userStatsOptions(userId)}>
            {({ data: stats }) => (
              <UserStats stats={stats} />
            )}
          </SuspenseQuery>
        )}
      </div>
    )}
  </SuspenseQuery>
);
```

## 5. 더 알아보기

### 권장 사용 시나리오
- 조건부 렌더링이 필요한 query
- 사용자 권한에 따른 데이터 페칭
- 동적 조건에 따른 API 호출

### 성능 고려사항
- 조건부 렌더링 시 불필요한 API 호출 방지
- 병렬 처리가 가능한 경우 SuspenseQueries 활용
- 중첩 깊이를 적절히 제한하여 가독성 유지

### Suspensive 라이브러리의 장점
- **선언적 프로그래밍**: 명령형 hook 대신 선언적 컴포넌트 사용
- **조건부 렌더링**: React의 제약 없이 자유로운 조건부 사용
- **높은 응집도**: 관련 로직을 한 곳에 모아 가독성 향상
