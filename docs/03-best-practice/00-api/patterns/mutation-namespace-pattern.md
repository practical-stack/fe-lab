---
title: "Mutation Namespace 패턴"
description: "여러 mutation 사용 시 namespace를 유지해 변수 충돌과 소속 불명확 문제를 줄이는 패턴입니다."
type: pattern
tags: [API, React, BestPractice]
order: 0
---

# Mutation Namespace 패턴

## 1. 해결하려는 문제

```typescript
// ❌ 여러 Mutation 사용 시 destructuring으로 인한 변수명 충돌
const consentMutation = useMutation(consentUserTermsListMutation.external());
const registerMutation = useMutation(registerAlimiMutationOptions.external());

// destructuring 시 변수명 충돌 위험과 alias 필요
const { isLoading: consentLoading, mutateAsync: consentMutate } = consentMutation;
const { isLoading: registerLoading, mutateAsync: registerMutate } = registerMutation;

// 사용 시 어떤 Mutation인지 불분명하고 변수명 관리 복잡
<Button 
  loading={consentLoading || registerLoading}  // 어떤 Mutation인지 불분명
  onClick={async () => {
    await consentMutate({ termsTypeEnums, payloads: [] });  // alias로 인한 혼동
    await registerMutate({});
  }}
>
  등록하기
</Button>
```

**문제 요약:** 여러 Mutation 사용 시 destructuring으로 인한 변수명 alias 필요, 어떤 Mutation의 상태인지 불분명

## 2. 해결 방법

```typescript
// ✅ Mutation namespace 유지로 명확한 소속 표시
const consentMutation = useMutation(consentUserTermsListMutation.external());
const registerMutation = useMutation(registerAlimiMutationOptions.external());

// destructuring 없이 직접 사용으로 명확한 Mutation 소속 표시
<Button 
  loading={consentMutation.isLoading || registerMutation.isLoading}  // 어떤 Mutation인지 명확
  onClick={async () => {
    await consentMutation.mutateAsync({ termsTypeEnums, payloads: [] });  // 명확한 Mutation 소속
    await registerMutation.mutateAsync({});  // alias 없이 직관적
  }}
>
  동의하고 등록하기
</Button>
```

**해결 요약:** Mutation namespace 유지로 명확한 소속 표시, 변수명 충돌 방지, alias 불필요

## 3. 주의사항 (Caveat)

```typescript
// ❌ 단순한 경우에 namespace 강요
const SingleMutationComponent = () => {
  const mutation = useMutation(simpleMutation);
  
  // 단순한 경우에는 destructuring이 더 깔끔할 수 있음
  return <Button onClick={mutation.mutateAsync}>Click</Button>;
};

// ✅ 단순한 경우는 destructuring도 괜찮음
const SingleMutationComponent = () => {
  const { mutateAsync, isLoading } = useMutation(simpleMutation);
  
  return <Button loading={isLoading} onClick={mutateAsync}>Submit</Button>;
};
```

**주의사항 요약:** 하나의 간단한 mutation만 사용하는 경우는 destructuring이 더 간단할 수 있음

## 4. 사용된 레퍼런스

### 실제 적용 사례 - 알리미 등록 플로우

```typescript
// src/products/register/register-page.views/terms-agreement-view/terms-agreement-bottom-sheet.tsx
const TermsAgreementBottomSheet = () => {
  // ✅ namespace 유지로 명확한 구분
  const consentMutation = useMutation(consentUserTermsListMutation.external());
  const registerAlimiMutation = useMutation(registerAlimiMutationOptions.external());

  return (
    <BottomSheet.RootWithOverlayKit>
      <Button 
        loading={consentMutation.isLoading || registerAlimiMutation.isLoading}
        onClick={async () => {
          await consentMutation.mutateAsync({ termsTypeEnums, payloads: [] });
          await registerAlimiMutation.mutateAsync({});
        }}
      >
        동의하고 알리미 등록하기
      </Button>
    </BottomSheet.RootWithOverlayKit>
  );
};
```

## 5. 더 알아보기

### 권장 사용 시나리오
- 여러 mutation을 동시에 사용하는 경우
- 변수명 충돌 위험이 있는 경우
- 코드 가독성을 높이고 싶은 경우

### 사용하지 않아도 되는 경우
- 단일 mutation만 사용하는 간단한 컴포넌트
- 짧은 생명주기를 가진 임시 컴포넌트
- destructuring이 더 직관적인 경우
