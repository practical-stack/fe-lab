---
title: "순차 비동기 작업의 에러 핸들링 패턴"
description: "순차 비동기 작업에서 중첩 try-catch를 피하고 Result 패턴으로 명시적 에러 처리를 구현하는 방법을 정리합니다."
type: pattern
tags: [TypeScript, BestPractice]
order: 0
---

# 순차 비동기 작업의 에러 핸들링 패턴

## 1. 해결하려는 문제

```typescript
const consentAndRegisterAlimi = async (termsTypeEnums: string[]) => {
  // 1단계: 약관 동의
  try {
    await consentMutation.mutateAsync({
      termsTypeEnums,
      payloads: [],
    });
  } catch (termsError) {
    // ❌ 중첩된 try-catch로 인한 복잡성
    overlay.open(({ isOpen, close }) => (
      <FpTermsViewErrorDialog open={isOpen} onOpenChange={close} />
    ));
    sentryCaptureException(termsError);
    return; // ❌ 조기 return으로 인한 제어 흐름 복잡성
  }

  // 2단계: 알리미 등록
  try {
    await registerAlimiMutation.mutateAsync({});
  } catch (alimiError) {
    // ❌ 동일한 패턴의 반복, 코드 중복
    overlay.open(({ isOpen, close }) => (
      <AlimiRegisterErrorDialog isOpen={isOpen} onClose={close} />
    ));
    sentryCaptureException(alimiError);
    return;
  }

  // 3단계: 사용자 데이터 업데이트
  try {
    await updateUserData();
  } catch (updateError) {
    // ❌ 계속되는 중첩과 반복
    overlay.open(({ isOpen, close }) => (
      <UserUpdateErrorDialog isOpen={isOpen} onClose={close} />
    ));
    sentryCaptureException(updateError);
    return;
  }

  // ❌ 성공 로직이 맨 끝에 묻혀있음
  onBottomSheetClose();
  router.push(LoanUrl.알리미_등록완료);
};
```

**문제점:**
- **중첩된 try-catch**: 각 단계별로 다른 에러 처리가 필요할 때 복잡한 중첩 구조
- **Promise.allSettled 사용 불가**: 순차 호출이 필요한 경우 네이티브 방법으로 해결 불가
- **에러 발생 지점 불명확**: 여러 단계 중 어느 지점에서 실패했는지 구분하기 어려움
- **코드 중복**: 동일한 try-catch 패턴의 반복
- **제어 흐름 복잡성**: 조기 return으로 인한 예측하기 어려운 코드 흐름

## 2. 해결 방법

```typescript
// Result 타입 정의
type AsyncResult<T, E = Error> = Promise<
  | { ok: true; data: T }
  | { ok: false; error: E }
>;

const tryCatchAsync = async <T>(
  fn: () => Promise<T>
): AsyncResult<T> => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
};

// ✅ 개선된 코드 - 깔끔하고 선형적
const consentAndRegisterAlimi = async (termsTypeEnums: string[]) => {
  // 1단계: 약관 동의
  const consentResult = await tryCatchAsync(() => 
    consentMutation.mutateAsync({ termsTypeEnums, payloads: [] })
  );
  
  if (!consentResult.ok) {
    overlay.open(({ isOpen, close }) => (
      <FpTermsViewErrorDialog open={isOpen} onOpenChange={close} />
    ));
    sentryCaptureException(consentResult.error);
    return;
  }

  // 2단계: 알리미 등록
  const alimiResult = await tryCatchAsync(() => 
    registerAlimiMutation.mutateAsync({})
  );
  
  if (!alimiResult.ok) {
    overlay.open(({ isOpen, close }) => (
      <AlimiRegisterErrorDialog isOpen={isOpen} onClose={close} />
    ));
    sentryCaptureException(alimiResult.error);
    return;
  }

  // 3단계: 사용자 데이터 업데이트
  const updateResult = await tryCatchAsync(() => updateUserData());
  
  if (!updateResult.ok) {
    overlay.open(({ isOpen, close }) => (
      <UserUpdateErrorDialog isOpen={isOpen} onClose={close} />
    ));
    sentryCaptureException(updateResult.error);
    return;
  }

  // ✅ 성공 로직이 명확하게 보임
  onBottomSheetClose();
  router.push(LoanUrl.알리미_등록완료);
};
```

**효과:**
- **중첩 제거**: try-catch 중첩 없이 선형적인 코드 흐름
- **일관성**: 모든 비동기 호출이 동일한 패턴으로 처리
- **가독성**: 각 단계의 성공/실패가 명확하게 구분됨 (`result.ok`)
- **유지보수**: 새로운 단계 추가 시 동일한 패턴 적용
- **타입 안전성**: Result 타입으로 에러 처리 강제

## 3. 주의사항 (Caveat)

```typescript
// ❌ 단순한 단일 호출에는 과도함
const fetchUserName = async (userId: string) => {
  const result = await tryCatchAsync(() => fetchUser(userId));
  if (!result.ok) {
    throw new Error('Failed to fetch user');
  }
  return result.data.name;
};

// ❌ 에러를 다시 throw하는 경우
const processData = async () => {
  const result = await tryCatchAsync(() => heavyComputation());
  if (!result.ok) {
    throw result.error; // 결국 throw한다면 의미 없음
  }
  return result.data;
};

// ❌ 순차성이 없는 독립적인 호출들
const loadPageData = async () => {
  const userResult = await tryCatchAsync(() => fetchUser());
  const settingsResult = await tryCatchAsync(() => fetchSettings());
  const notificationsResult = await tryCatchAsync(() => fetchNotifications());
  
  // 각각 독립적으로 처리하므로 순차 패턴 불필요
};
```

**남용하면 안 되는 경우:**
- **단순한 단일 호출**: 기존 try-catch가 더 간단하고 직관적
- **에러를 다시 throw**: Result 패턴의 장점을 활용하지 않음
- **독립적인 호출들**: Promise.allSettled 사용이 더 적절

**권장 사용 시나리오:**
- 순차적 의존성이 있는 다단계 비동기 작업
- 각 단계별로 다른 에러 처리가 필요한 경우
- 중첩된 try-catch를 피하고 싶은 복잡한 플로우

## 4. 사용된 레퍼런스

### 4.1 실제 적용 사례 - 알리미 등록 플로우

```typescript
// src/products/register/register-page.views/terms-agreement-view/terms-agreement-bottom-sheet.tsx
const AlimiRegistrationBottomSheet = () => {
  const consentMutation = useMutation(consentUserTermsListMutation.external());
  const registerAlimiMutation = useMutation(registerAlimiMutationOptions.external());

  const consentAndRegisterAlimi = async (termsTypeEnums: string[]) => {
    // 1단계: 약관 동의
    const consentResult = await tryCatchAsync(() => 
      consentMutation.mutateAsync({ termsTypeEnums, payloads: [] })
    );
    
    if (!consentResult.ok) {
      overlay.open(({ isOpen, close }) => (
        <FpTermsViewErrorDialog open={isOpen} onOpenChange={close} />
      ));
      sentryCaptureException(consentResult.error);
      return;
    }

    // 2단계: 알리미 등록
    const alimiResult = await tryCatchAsync(() => 
      registerAlimiMutation.mutateAsync({})
    );
    
    if (!alimiResult.ok) {
      overlay.open(({ isOpen, close }) => (
        <AlimiRegisterErrorDialog isOpen={isOpen} onClose={close} />
      ));
      sentryCaptureException(alimiResult.error);
      return;
    }

    // 성공 시 페이지 이동
    onBottomSheetClose();
    router.push(LoanUrl.알리미_등록완료);
  };

  return (
    <BottomSheet.RootWithOverlayKit onClose={onBottomSheetClose}>
      <Button 
        loading={consentMutation.isLoading || registerAlimiMutation.isLoading}
        onClick={() => consentAndRegisterAlimi(selectedTerms)}
      >
        동의하고 알리미 등록하기
      </Button>
    </BottomSheet.RootWithOverlayKit>
  );
};
```

### 4.2 순차 데이터 페칭 예시

```typescript
const fetchUserProfile = async (userId: string) => {
  // 1단계: 사용자 기본 정보
  const userResult = await tryCatchAsync(() => fetchUser(userId));
  if (!userResult.ok) {
    return { error: 'USER_FETCH_FAILED', data: null };
  }

  // 2단계: 프로필 정보 (사용자 ID 필요)
  const profileResult = await tryCatchAsync(() => 
    fetchProfile(userResult.data.profileId)
  );
  if (!profileResult.ok) {
    return { error: 'PROFILE_FETCH_FAILED', data: null };
  }

  // 3단계: 설정 정보 (사용자 ID 필요)
  const settingsResult = await tryCatchAsync(() => 
    fetchSettings(userResult.data.id)
  );
  if (!settingsResult.ok) {
    return { error: 'SETTINGS_FETCH_FAILED', data: null };
  }

  return {
    error: null,
    data: {
      user: userResult.data,
      profile: profileResult.data,
      settings: settingsResult.data,
    }
  };
};
```

### 4.3 헬퍼 함수 구현체

```typescript
// libs/utils/async-result/src/index.ts
export type AsyncResult<T, E = Error> = Promise<
  | { ok: true; data: T }
  | { ok: false; error: E }
>;

export const tryCatchAsync = async <T>(
  fn: () => Promise<T>
): AsyncResult<T> => {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
};
```

## 5. 더 알아보기

### 5.1 Rust와 Go에서 차용된 검증된 패턴

이 패턴은 **Rust**의 `Result<T, E>`와 **Go**의 `(value, error)` 반환 방식에서 영감을 받았습니다.

#### Rust 예시
```rust
// Rust의 Result 타입
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Cannot divide by zero".to_string())
    } else {
        Ok(a / b)
    }
}

// 사용법
match divide(10.0, 2.0) {
    Ok(result) => println!("Result: {}", result),
    Err(error) => println!("Error: {}", error),
}
```

#### Go 예시
```go
// Go의 (value, error) 패턴
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}

// 사용법
result, err := divide(10, 2)
if err != nil {
    fmt.Printf("Error: %v\n", err)
    return
}
fmt.Printf("Result: %f\n", result)
```

#### TypeScript 적용
```typescript
// 우리의 AsyncResult 패턴
type AsyncResult<T, E = Error> = Promise<
  | { ok: true; data: T }
  | { ok: false; error: E }
>;

// 사용법 - Rust/Go와 유사한 명시적 에러 처리
const result = await tryCatchAsync(() => divide(10, 2));
if (!result.ok) {
  console.log('Error:', result.error);
  return;
}
console.log('Result:', result.data);
```

**핵심 철학:**
- **에러는 값이다**: 예외가 아닌 일반적인 반환 값으로 처리
- **명시적 처리**: 함수 시그니처에서 에러 가능성을 명확히 표현
- **타입 안전성**: 컴파일 타임에 에러 처리 누락을 방지

### 5.2 왜 직접 구현하는가?

기존 라이브러리들(`neverthrow`, `fp-ts`, `oxide.ts` 등)이 존재하지만, 다음과 같은 이유로 직접 구현을 선택합니다:

**라이브러리의 한계:**
- **불필요한 복잡성**: 함수형 체이닝(`map`, `andThen`, `mapErr` 등) 메서드들이 과도함
- **번들 사이즈 오버헤드**: 추가 의존성으로 인한 번들 크기 증가
- **러닝 커브**: 팀 전체가 함수형 패러다임에 익숙해져야 하는 부담
- **과도한 추상화**: 단순한 에러 처리에 복잡한 API 제공

**직접 구현의 장점:**
- **최소한의 코드**: 핵심 기능만 포함한 20줄 미만의 구현
- **제로 의존성**: 외부 라이브러리 없이 순수 TypeScript
- **직관적 사용**: 단순한 `if (!result.ok)` 체크만으로 충분
- **프로젝트 맞춤**: 필요에 따라 쉽게 확장 가능
