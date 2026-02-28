---
title: "API Composition Layer 패턴"
description: "BFF 없이 여러 API를 조합해 단일 인터페이스로 제공하는 클라이언트 composition 레이어 패턴입니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# API Composition Layer 패턴

MSA 환경에서 BFF 레이어 없이 클라이언트에서 여러 API를 효율적으로 조합하여 사용하는 패턴입니다.

## 독자 요구사항

- api-composition layer가 왜 필요한지 이해할 수 있다.
- api-composition layer가 필요한 경우 어떻게 구현해야 할지 알 수 있다.

## Background

MSA(Microservice Architecture) 기반 서버 아키텍처에서 명시적인 BFF(Backend For Frontend) 레이어가 없는 경우, 일부는 BFF처럼 일부는 MS의 서버를 호출해야 합니다. 이런 환경으로 인해 클라이언트에서 여러 api를 조합하여 화면을 표시해야 합니다.

## 예시 요구사항

대출 알리미 결과 페이지에서는 사용자에게 다음 두 가지 정보를 함께 보여줘야 합니다:

1. **최근 사전심사 신청 결과 목록**: 사용자가 최근에 신청한 대출 사전심사 결과들
2. **예상 신용금리 인하 정보**: 현재 조건에서 예상되는 금리 인하 혜택

이 두 정보는 서로 다른 마이크로서비스에서 제공되지만, 사용자에게는 하나의 통합된 화면으로 보여져야 합니다.

## Problem

클라이언트에서 여러 API를 조합해야 하는 경우 인터페이스가 복잡해집니다.

### 1. useSuspenseQueries로 여러 RPC를 조합하는 경우

```typescript
// ❌ 복잡한 인터페이스로 여러 API 호출
const [
  { data: userData },
  { data: recentApplicationsData },
  { data: predictedRateData }
] = useSuspenseQueries({
  queries: [
    { ...getUserQueryOptions.webview(), select: selectUserFullName },
    { ...listAlimiRecentPrequalificationApplicationResultsQueryOptions.webview() },
    { ...getAlimiPredictedCreditInterestRateDecreaseQueryOptions.webview() }
  ]
});
```

### 2. useQuery의 select 인터페이스를 활용하지 못하는 경우

```typescript
// ❌ 각각의 API response를 받아서 다시 조합해야 함
const processedData = useMemo(() => {
  if (!recentApplicationsData || !predictedRateData) return null;
  
  // 복잡한 데이터 조합 로직
  return {
    type: determineResultType(predictedRateData),
    recentRateItems: transformRecentApplications(recentApplicationsData.items),
    predictedDecrease: predictedRateData.decrease,
    // ... 추가 변환 로직
  };
}, [recentApplicationsData, predictedRateData]);
```

이런 방식은 다음과 같은 문제점이 있습니다:

- 데이터 변환 로직이 컴포넌트 내부에 노출됨
- 여러 API 호출의 로딩/에러 상태를 개별적으로 관리해야 함
- select 함수의 이점을 활용할 수 없음
- 코드의 재사용성이 떨어짐

## Solution

API Composition Layer를 통해 여러 API를 단일 인터페이스로 통합합니다.

### 1. API Composition Query 구현

```typescript
// src/products/checkout/result/result-page.helper/result-api-composition/result.query.ts

export type LoanAlimiResultResponse = {
  recentApplications: ListAlimiRecentPrequalificationApplicationResultsResponse;
  predictedRateDecrease: GetAlimiPredictedCreditInterestRateDecreaseResponse;
};

/**
 * 대출 알리미 결과 페이지 데이터 조합 Query Function
 * 
 * 다음 두 API를 병렬로 호출하여 페이지에 필요한 모든 데이터를 한 번에 가져옵니다:
 * 1. 최근 사전심사 신청 결과 목록 (listAlimiRecentPrequalificationApplicationResults)
 * 2. 예상 신용금리 인하 정보 (getAlimiPredictedCreditInterestRateDecrease)
 */
export const loanAlimiResultQueryFn = {
  external: async (): Promise<LoanAlimiResultResponse> => {
    const [recentApplications, predictedRateDecrease] = await Promise.all([
      listAlimiRecentPrequalificationApplicationResultsQueryFn.external(),
      getAlimiPredictedCreditInterestRateDecreaseQueryFn.external(),
    ]);

    return {
      recentApplications,
      predictedRateDecrease,
    };
  },
  // web, webview 메서드도 동일한 패턴으로 구현
} as const;

export const loanAlimiResultQueryOptions = {
  external: () => {
    return queryOptions({
      queryFn: async () => loanAlimiResultQueryFn.external(),
      queryKey: [
        ...Loancompare_getListAlimiRecentPrequalificationApplicationResultsQueryKey.rpcName,
        ...Loancompare_getGetAlimiPredictedCreditInterestRateDecreaseQueryKey.rpcName,
      ],
    });
  },
  // web, webview 옵션도 동일한 패턴으로 구현
} as const;
```

### 2. select 함수를 통한 데이터 변환

```typescript
// select-loan-alimi-result-page-data.ts
export const selectLoanAlimiResultPageData = (
  data: LoanAlimiResultResponse
): LoanAlimiResultPageData => {
  const { recentApplications, predictedRateDecrease } = data;
  
  // 복잡한 데이터 변환 로직을 별도 함수로 분리
  return {
    type: determineResultType(predictedRateDecrease),
    recentRateItems: transformRecentApplications(recentApplications.items),
    predictedDecrease: predictedRateDecrease.decrease,
    // ... 추가 변환 로직
  };
};
```

### 3. 단순화된 사용법

```typescript
// ✅ API Composition Layer 사용
const [{ data: userName }, { data: apiData }] = useSuspenseQueries({
  queries: [
    { ...getUserQueryOptions.webview(), select: selectUserFullName },
    {
      ...loanAlimiResultQueryOptions.webview(),
      select: selectLoanAlimiResultPageData, // select 함수 활용 가능
    },
  ],
});
```

### Problem 해결 효과

1. **단일 인터페이스**: 여러 API를 하나의 쿼리로 추상화
2. **select 활용**: 데이터 변환 로직을 select 함수로 분리하여 캐싱 최적화
3. **코드 응집도**: 관련된 API 호출과 데이터 변환을 한 곳에서 관리
4. **재사용성**: 동일한 데이터 조합이 필요한 다른 곳에서 재사용 가능
5. **타입 안정성**: TypeScript를 통한 완전한 타입 추론
6. **BFF 마이그레이션 준비**: API Composition Layer의 request/response 인터페이스는 추후 BFF가 생길 시 동일한 인터페이스로 이동하여 활용 가능
7. **테스트 코드 재활용**: select 함수의 테스트 코드들도 BFF로 옮겨갈 때 그대로 재활용 가능

## Caveat

각 쿼리가 원자적으로 캐시되어서 사용되어야 하는 경우 다음 방법들을 고려해야 합니다:

### 1. queryClient.setQuery를 통한 개별 캐싱

```typescript
export const loanAlimiResultQueryFn = {
  web: async (queryClient: QueryClient): Promise<LoanAlimiResultResponse> => {
    const [recentApplications, predictedRateDecrease] = await Promise.all([
      listAlimiRecentPrequalificationApplicationResultsQueryFn.web(),
      getAlimiPredictedCreditInterestRateDecreaseQueryFn.web(),
    ]);

    // 개별 API 응답을 원자적으로 캐싱
    queryClient.setQueryData(
      Loancompare_getListAlimiRecentPrequalificationApplicationResultsQueryKey.web(),
      recentApplications
    );
    queryClient.setQueryData(
      Loancompare_getGetAlimiPredictedCreditInterestRateDecreaseQueryKey.web(),
      predictedRateDecrease
    );

    return { recentApplications, predictedRateDecrease };
  },
};
```

### 2. 개별 캐싱이 중요한 경우 useSuspenseQueries 사용

```typescript
// 개별 캐싱이 더 중요한 경우에는 composition을 하지 않음
const [{ data: recentData }, { data: predictedData }] = useSuspenseQueries({
  queries: [
    listAlimiRecentPrequalificationApplicationResultsQueryOptions.web(),
    getAlimiPredictedCreditInterestRateDecreaseQueryOptions.web(),
  ],
});

const composedData = useMemo(
  () => ({ recentApplications: recentData, predictedRateDecrease: predictedData }),
  [recentData, predictedData]
);
```

## 더 알아보기

### Mutation에서도 동일한 패턴 적용 가능

```typescript
export const loanApplicationMutationFn = {
  web: async (params: LoanApplicationParams) => {
    // 1. 사전심사 신청
    const prequalResult = await submitPrequalificationMutationFn.web(params);
    
    // 2. 알림 설정
    await setNotificationMutationFn.web({
      userId: params.userId,
      loanId: prequalResult.loanId,
    });
    
    // 3. 이벤트 로깅
    await logLoanApplicationMutationFn.web({
      event: 'loan_application_completed',
      loanId: prequalResult.loanId,
    });

    return prequalResult;
  },
};

export const loanApplicationMutationOptions = {
  web: () => {
    return mutationOptions({
      mutationFn: loanApplicationMutationFn.web,
      onSuccess: (data) => {
        // 관련 쿼리들 invalidation
        queryClient.invalidateQueries(['loan', 'applications']);
        queryClient.invalidateQueries(['notifications']);
      },
    });
  },
};
```

## 추가 논의사항

### API Composition Layer의 위치와 구조

현재는 페이지별 사용처에 `api-composition` 폴더를 만들어 조합해서 사용하는 패턴을 권장하고 있습니다:

```
src/products/checkout/result/
└── result-page.helper/
    └── loan-alimi-result-api-composition/
        └── loan-alimi-result.query.ts
```

하지만 더 넓은 범위로 공유되어야 하는 API composition의 경우, 다음과 같은 구조가 필요한지에 대한 추가 논의가 필요합니다:

- `shared/api` 를 확장한 공유 API 레이어 도입 검토
- 도메인별 API composition 관리 방안
- 재사용 가능한 composition과 페이지별 composition의 분리 기준

**현재 방향성**: 아직 다수의 패턴 사례가 충분히 나오지 않아 정확한 판단을 내리기 어려운 상황입니다. 일단은 사용처에 localize해서 사용하는 현재 패턴을 유지하다가, 뚜렷한 사례들이 더 축적되면 최적의 구조를 결정할 예정입니다.

**해결 요약:** API Composition Layer로 여러 API 호출을 단일 인터페이스로 통합하여 코드 복잡도 감소와 select 함수 활용 가능
