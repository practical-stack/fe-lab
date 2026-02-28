---
title: "Mutation 응집도 패턴"
description: "Mutation 선언과 사용을 가까이 배치해 흐름을 명확히 하고 중첩 문제를 줄이는 패턴입니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# Mutation 응집도 패턴

## 1. 해결하려는 문제

```typescript
// ❌ Mutation 선언부 (상단)
const TermsAgreementBottomSheet = () => {
  const consentMutation = useMutation(consentUserTermsListMutation.external());
  const registerMutation = useMutation(registerAlimiMutationOptions.external());
  
  const { isLoading: consentLoading, mutateAsync: consentMutate } = consentMutation;
  const { isLoading: registerLoading, mutateAsync: registerMutate } = registerMutation;
  
  // ... 많은 다른 로직들 (50-100줄) ...
  
  const handleClick = async () => {
    // 복잡한 비즈니스 로직
    try {
      await validateTerms();
      await consentMutate({ termsTypeEnums, payloads: [] });  // 선언부와 멀어짐
      await registerMutate({});  // 어떤 Mutation인지 추적 어려움
      onSuccess();
    } catch (error) {
      handleError(error);
    }
  };
  
  // ... 더 많은 로직들 ...
  
  // 실제 사용처 (하단) - 선언부와 멀리 떨어짐
  return (
    <BottomSheet.RootWithOverlayKit>
      <Button 
        loading={consentLoading || registerLoading}  // Mutation 상태 추적 어려움
        onClick={handleClick}  // 클릭 핸들러도 별도 분리
      >
        동의하고 등록하기
      </Button>
    </BottomSheet.RootWithOverlayKit>
  );
};
```

**문제 요약:** Mutation 선언부와 사용처가 멀리 떨어져 코드 흐름 파악 어려움

## 2. 해결 방법

```typescript
// ✅ Mutation 컴포넌트로 Mutation 응집도 향상
import { Mutation } from '@suspensive/react-query';

const TermsAgreementBottomSheet = () => (
  <BottomSheet.RootWithOverlayKit>
    {/* 🚀 Mutation 선언과 사용이 가까운 곳에 위치 */}
    <Mutation {...consentUserTermsListMutation.external()}>
      {(consentMutation) => (
        <Mutation {...registerAlimiMutationOptions.external()}>
          {(registerMutation) => (
            <Button 
              loading={consentMutation.isLoading || registerMutation.isLoading}
              onClick={async () => {
                // Mutation 선언부와 사용처가 가까워 코드 흐름 파악 용이
                try {
                  await consentMutation.mutateAsync({ termsTypeEnums, payloads: [] });
                  await registerMutation.mutateAsync({});
                  onSuccess();
                } catch (error) {
                  handleError(error);
                }
              }}
            >
              동의하고 등록하기
            </Button>
          )}
        </Mutation>
      )}
    </Mutation>
  </BottomSheet.RootWithOverlayKit>
);
```

**해결 요약:** Mutation 컴포넌트로 Mutation 선언부와 사용처 응집도 향상, 코드 흐름 파악 용이

## 3. 주의사항 (Caveat)

```typescript
// ❌ 과도한 Suspensive Mutation 사용
const SimpleForm = () => (
  <Mutation {...submitMutationOptions.external()}>
    {mutation => (
      <Mutation {...anotherMutationOptions.external()}>
        {anotherMutation => (
          <Mutation {...yetAnotherMutationOptions.external()}>
            {yetAnotherMutation => (
              // 중첩이 너무 깊어짐
              <form>...</form>
            )}
          </Mutation>
        )}
      </Mutation>
    )}
  </Mutation>
);

// ✅ MSA 환경에서는 통합 fetch 함수로 해결
const registerWithConsentAndValidation = async (data: FormData) => {
  // 프론트엔드에서 BFF 레이어 역할 수행
  // 여러 마이크로서비스를 순차적으로 호출하여 하나의 비즈니스 플로우 구성
  const validationResponse = await api.validateForm(data);
  if (!validationResponse.isValid) {
    throw new Error('폼 검증 실패');
  }
  
  const submitResponse = await api.submitForm(data);
  const trackResponse = await api.trackSubmission({ id: submitResponse.id });
  
  return { validationResponse, submitResponse, trackResponse };
};

// 단일 Mutation으로 단순화
const SimpleForm = () => (
  <Mutation mutationFn={registerWithConsentAndValidation}>
    {(mutation) => (
      <form onSubmit={() => mutation.mutateAsync(formData)}>
        <Button loading={mutation.isLoading}>제출</Button>
      </form>
    )}
  </Mutation>
);
```

**주의사항 요약:** 3개 이상 중첩 시 MSA 환경에서는 통합 fetch 함수로 BFF 역할 수행하여 해결

### MSA 환경에서의 핵심 원칙:
- **문제 상황**: MSA 환경에서 BFF(Backend for Frontend) 레이어가 없어 프론트엔드에서 여러 마이크로서비스를 직접 관리
- **해결 방법**: 프론트엔드에서 통합 fetch 함수를 만들어 BFF 역할 수행
- **효과**: 복잡한 중첩 Mutation 대신 단일 비즈니스 플로우로 단순화

## 4. 사용된 레퍼런스

### 실제 적용 사례 - 대출 신청 플로우

```typescript
// src/products/application/application-page.tsx
const LoanApplicationPage = () => (
  <Layout.Container>
    <Layout.Header />
    <Layout.MainContent>
      <Mutation {...submitApplicationMutationOptions.external()}>
        {(submitMutation) => (
          <ApplicationForm 
            onSubmit={submitMutation.mutateAsync}
            isLoading={submitMutation.isLoading}
          />
        )}
      </Mutation>
    </Layout.MainContent>
  </Layout.Container>
);
```

## 5. 더 알아보기

### Co-location의 장점
- **코드 가독성**: 관련 로직이 한 곳에 모여 있어 이해하기 쉬움
- **유지보수성**: 수정 시 관련 코드를 한 번에 찾을 수 있음
- **디버깅 용이**: 문제 발생 시 원인을 빠르게 파악 가능

### 권장 사용 시나리오
- 복잡한 컴포넌트에서 응집도를 높이고 싶은 경우
- API 호출과 UI 상태가 밀접하게 연관된 경우
- 코드 리뷰 시 로직 흐름을 명확히 보여주고 싶은 경우
