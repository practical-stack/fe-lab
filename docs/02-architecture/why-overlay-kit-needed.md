---
title: "Overlay-Kit 도입 필요성 분석"
description: "레거시 디자인 시스템에서 새로운 디자인 시스템으로 전환하며 useOverlay 한계와 Overlay-Kit 도입 필요성을 사례 중심으로 설명합니다."
type: guide
tags: [Migration, React, Architecture]
---

# Overlay-Kit 도입 필요성 분석

## ⚡ 빠르게 도입을 고려하게된 배경: 레거시 → 신규 디자인 시스템 마이그레이션

**현재 상황**: 레거시 디자인 시스템에서 신규 디자인 시스템으로 마이그레이션을 진행하면서 기존 레거시 오버레이를 저희 userOverlay를 사용해서 마이그레이션 하기가 어려워서 더 빠르게 도입 결정

### 레거시 디자인 시스템 → useOverlay 마이그레이션의 구체적인 어려움

**실제 마이그레이션 케이스**: API 호출 후 에러 성격에 따라 다른 오버레이를 보여주는 상황

```tsx
// 레거시 방식 (기존) - 간단하고 직관적
import { ButtonNormal } from '@legacy/button-v1';
import { useModal, useDialog } from '@legacy/design-system';

const PaymentComponent = () => {
  const { open: openModal } = useModal();
  const { open: openDialog } = useDialog();
  
  const handlePayment = async () => {
    try {
      await paymentAPI.process();
    } catch (error) {
      // ✅ 레거시 시스템에서는 에러 타입별로 바로 오버레이 호출 가능
      if (error.type === 'network') {
        openDialog({ element: <NetworkErrorDialog error={error} /> });
      } else if (error.type === 'insufficient_balance') {
        openModal({ element: <InsufficientBalanceModal balance={error.balance} /> });
      } else if (error.type === 'card_expired') {
        openDialog({ element: <CardExpiredDialog cardInfo={error.cardInfo} /> });
      } else {
        openDialog({ element: <GenericErrorDialog error={error} /> });
      }
    }
  };
  
  return <ButtonNormal onClick={handlePayment}>결제하기</ButtonNormal>;
};
```

```tsx
// useOverlay로 마이그레이션 시도 - 복잡하고 관리하기 어려움
import { Button } from '@design-system/button-v1';
import { useOverlay } from '@react/overlay-v0';

const PaymentComponent = () => {
  // 😱 문제점 1: 모든 가능한 에러별 상태를 미리 선언해야 함
  const [isNetworkErrorOpen, setIsNetworkErrorOpen] = useOverlay();
  const [isInsufficientBalanceOpen, setIsInsufficientBalanceOpen] = useOverlay();
  const [isCardExpiredOpen, setIsCardExpiredOpen] = useOverlay();
  const [isGenericErrorOpen, setIsGenericErrorOpen] = useOverlay();
  
  // 😱 문제점 2: 에러 데이터를 별도 상태로 관리해야 함
  const [errorData, setErrorData] = useState(null);
  
  const handlePayment = async () => {
    try {
      await paymentAPI.process();
    } catch (error) {
      // 😱 문제점 3: 에러 타입별로 각각 상태 설정해야 함
      setErrorData(error);
      if (error.type === 'network') {
        setIsNetworkErrorOpen(true);
      } else if (error.type === 'insufficient_balance') {
        setIsInsufficientBalanceOpen(true);
      } else if (error.type === 'card_expired') {
        setIsCardExpiredOpen(true);
      } else {
        setIsGenericErrorOpen(true);
      }
    }
  };
  
  return (
    <>
      <Button onClick={handlePayment}>결제하기</Button>
      
      {/* 😱 문제점 4: 모든 가능한 오버레이를 미리 JSX에 렌더링해야 함 */}
      <NetworkErrorDialog 
        open={isNetworkErrorOpen} 
        onOpenChange={setIsNetworkErrorOpen}
        error={errorData}
      />
      <InsufficientBalanceModal 
        open={isInsufficientBalanceOpen} 
        onOpenChange={setIsInsufficientBalanceOpen}
        balance={errorData?.balance}
      />
      <CardExpiredDialog 
        open={isCardExpiredOpen} 
        onOpenChange={setIsCardExpiredOpen}
        cardInfo={errorData?.cardInfo}
      />
      <GenericErrorDialog 
        open={isGenericErrorOpen} 
        onOpenChange={setIsGenericErrorOpen}
        error={errorData}
      />
    </>
  );
};
```

```tsx
// ✅ Overlay-Kit으로 해결 - 레거시만큼 간단하게!
import { Button } from '@design-system/button-v1';

const PaymentComponent = () => {
  const handlePayment = async () => {
    try {
      await paymentAPI.process();
    } catch (error) {
      // ✅ 레거시처럼 에러 타입별로 바로 오버레이 호출 가능
      // ✅ 상태 관리나 JSX 렌더링 필요 없음
      if (error.type === 'network') {
        overlay.open(({ isOpen, close }) => (
          <NetworkErrorDialog open={isOpen} onClose={close} error={error} />
        ));
      } else if (error.type === 'insufficient_balance') {
        overlay.open(({ isOpen, close }) => (
          <InsufficientBalanceModal open={isOpen} onClose={close} balance={error.balance} />
        ));
      } else if (error.type === 'card_expired') {
        overlay.open(({ isOpen, close }) => (
          <CardExpiredDialog open={isOpen} onClose={close} cardInfo={error.cardInfo} />
        ));
      } else {
        overlay.open(({ isOpen, close }) => (
          <GenericErrorDialog open={isOpen} onClose={close} error={error} />
        ));
      }
    }
  };
  
  return <Button onClick={handlePayment}>결제하기</Button>;
  // ✅ 깔끔! 오버레이 컴포넌트들을 미리 렌더링할 필요 없음
};
```

**핵심 문제**: 
- 레거시 디자인 시스템의 `useModal`, `useDialog`는 `open({ element })` 방식으로 **어디서든 쉽게 모달을 열 수 있었음**
- useOverlay로 마이그레이션하면 **4가지 구조적 문제**로 인해 코드가 복잡해짐
- 기존 레거시 코드들을 useOverlay로 마이그레이션할 때마다 **대규모 리팩토링 필요**
- **Overlay-Kit은 레거시 시스템의 단순함을 유지하면서 신규 디자인 시스템과 호환 가능**

**서두르게 된 이유**:
- 레거시 → 신규 디자인 시스템 마이그레이션이 진행 중
- 마이그레이션할 때마다 overlay 관련 코드가 복잡해짐
- 개발자 경험(DX)이 크게 악화되어 **빠른 해결책 필요**

---

## 🔥 구체적인 문제 상황들

### 1. List Item에서 모달을 열 때의 딜레마

**문제 상황**: 리스트 아이템에서 모달을 열 때, 같은 모달이라도 상태 관리가 복잡해지는 문제

```tsx
// ❌ 현재 방식의 문제점
const TodoList = () => {
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useOverlay();
  
  return (
    <>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          // 😱 문제점: 리스트 아이템이 외부 상태 변경 함수를 props로 받아야 함
          onOpenModal={(selectedTodo) => {
            setSelectedTodo(selectedTodo);
            setIsDetailModalOpen(true);
          }}
        />
      ))}
      
      {/* 😱 문제점: 
          1. 모달 상태가 리스트 외부에 존재해야 함 (비직관적)
          2. 리스트 아이템에서 외부 상태를 변경하는 함수를 props로 받아야 함
          3. 선택된 아이템 상태를 별도로 관리해야 함
          4. "여기서 모달을 열어야 하는데 어디에 모달 컴포넌트를 둬야 할까?" 고민하게 됨 */}
      <TodoDetailModal 
        open={isDetailModalOpen} 
        onOpenChange={setIsDetailModalOpen}
        todo={selectedTodo}
      />
    </>
  );
};

// TodoItem 컴포넌트도 복잡해짐
const TodoItem = ({ todo, onOpenModal }) => {
  return (
    <div onClick={() => onOpenModal(todo)}>
      {/* 😱 직관적이지 않음: "여기서 모달을 열고 싶은데 외부 함수를 호출해야 함" */}
      {todo.title}
    </div>
  );
};
```

```tsx
// ✅ Overlay-Kit으로 해결
const TodoList = () => {
  return (
    <>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  );
};

// TodoItem이 직관적이고 독립적으로 작동
const TodoItem = ({ todo }) => {
  return (
    <div onClick={() => {
      // ✅ 바로 여기서 직관적으로 모달을 열 수 있음
      // ✅ 외부 상태나 props 전달 없이 독립적으로 작동
      // ✅ "모달 컴포넌트를 어디에 둘까?" 고민할 필요 없음
      overlay.open(({ isOpen, close }) => (
        <TodoDetailModal 
          open={isOpen} 
          onClose={close}
          todo={todo} // 현재 컨텍스트의 데이터를 직접 사용
        />
      ));
    }}>
      {todo.title}
    </div>
  );
};
```

### 2. React Query onError에서 공용 에러 다이얼로그

**문제 상황**: 네트워크 에러 시 전역적으로 에러 다이얼로그를 표시해야 할 때

```tsx
// ❌ 현재 방식: 불가능
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        if (isNetworkError(error)) {
          // 😱 문제점: 여기서 어떻게 다이얼로그를 열어야 할까?
          // useOverlay는 컴포넌트 내부에서만 사용 가능
          // 전역 상태나 복잡한 컨텍스트 구조가 필요함
        }
      }
    }
  }
});
```

```tsx
// ✅ Overlay-Kit으로 해결  
const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error) => {
        if (isNetworkError(error)) {
          // 어디서든 간단하게 오버레이 호출 가능
          overlay.open(({ isOpen, close }) => (
            <NetworkErrorDialog 
              open={isOpen} 
              onClose={close}
              error={error}
            />
          ));
        }
      }
    }
  }
});
```

### 3. Error Boundary에서 에러 모달 표시

**문제 상황**: 에러 바운더리나 에러 callback에서 React Hook 없이 모달을 표시해야 할 때

```tsx
// ❌ 현재 방식: 거의 불가능
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // 😱 문제점: 여기서 어떻게 모달을 열어야 할까?
    // 1. Hook을 사용할 수 없음 (클래스 컴포넌트 내부)
    // 2. 전역 상태 관리자나 복잡한 컨텍스트 구조 필요
    // 3. 에러 발생 시점과 모달 렌더링 위치가 분리됨
    
    // 복잡한 우회 방법들...
    // - 전역 상태에 에러 정보 저장
    // - 상위 컴포넌트에서 에러 상태를 감지해서 모달 렌더링
    // - 별도의 에러 처리 시스템 구축
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
      // 😱 여기서도 모달을 직접 렌더링하기 어려움
    }
    
    return this.props.children;
  }
}

// 함수형 컴포넌트에서도 마찬가지
const MyComponent = () => {
  const mutation = useMutation({
    mutationFn: apiCall,
    onError: (error) => {
      // 😱 문제점: callback 내부에서 Hook 사용 불가
      // const [isOpen, setIsOpen] = useOverlay(); // ❌ 불가능!
      
      // 복잡한 우회 방법 필요...
    }
  });
};
```

```tsx
// ✅ Overlay-Kit으로 해결
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // ✅ Hook에 의존하지 않고 바로 모달 호출 가능
    overlay.open(({ isOpen, close }) => (
      <ErrorModal 
        open={isOpen} 
        onClose={close}
        error={error}
        errorInfo={errorInfo}
      />
    ));
  }
  
  render() {
    return this.props.children;
  }
}

// 함수형 컴포넌트에서도 자유롭게 사용
const MyComponent = () => {
  const mutation = useMutation({
    mutationFn: apiCall,
    onError: (error) => {
      // ✅ callback 내부에서도 자유롭게 모달 호출
      // ✅ React Hook의 의존성 없이 컴포넌트 렌더링 가능
      overlay.open(({ isOpen, close }) => (
        <ApiErrorModal 
          open={isOpen} 
          onClose={close}
          error={error}
        />
      ));
    }
  });
};
```

### 4. 한 페이지에서 여러 오버레이 분기 처리

**문제 상황**: 상황에 따라 다른 모달/다이얼로그를 표시해야 할 때

```tsx
// ❌ 현재 방식: 복잡하고 관리하기 어려움
const ComplexPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useOverlay();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useOverlay();
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useOverlay();
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useOverlay();
  
  const handleAction = async (actionType) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    
    try {
      if (actionType === 'payment') {
        setIsPaymentModalOpen(true);
      }
      // ... 복잡한 분기 로직
    } catch (error) {
      setIsErrorDialogOpen(true);
    }
  };
  
  return (
    <>
      <ActionButton onClick={() => handleAction('payment')} />
      
      {/* 😱 문제점: 모든 가능한 오버레이를 미리 렌더링해야 함 */}
      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      <PaymentModal open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen} />
      <ErrorDialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen} />
      <SuccessDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen} />
    </>
  );
};
```

```tsx
// ✅ Overlay-Kit으로 해결
const ComplexPage = () => {
  const handleAction = async (actionType) => {
    if (!user) {
      overlay.open(({ isOpen, close }) => (
        <LoginModal open={isOpen} onClose={close} />
      ));
      return;
    }
    
    try {
      if (actionType === 'payment') {
        overlay.open(({ isOpen, close }) => (
          <PaymentModal open={isOpen} onClose={close} />
        ));
      }
    } catch (error) {
      overlay.open(({ isOpen, close }) => (
        <ErrorDialog open={isOpen} onClose={close} error={error} />
      ));
    }
  };
  
  return <ActionButton onClick={() => handleAction('payment')} />;
  // 깔끔! 오버레이 컴포넌트들을 미리 렌더링할 필요 없음
};
```

### 5. 오버레이 간 순서 의존성 (가장 복잡한 케이스)

**문제 상황**: 마이데이터 동의 프로세스처럼 오버레이들이 순차적으로 열리고, 이전 결과에 따라 다음 동작이 결정되는 경우

```tsx
// ❌ 현재 방식: 거의 불가능에 가까움
const MyDataConsentFlow = () => {
  const [step1Open, setStep1Open] = useOverlay();
  const [step2Open, setStep2Open] = useOverlay(); 
  const [step3Open, setStep3Open] = useOverlay();
  const [errorOpen, setErrorOpen] = useOverlay();
  const [currentStep, setCurrentStep] = useState(1);
  
  // 😱 문제점들:
  // 1. 복잡한 상태 관리 (어느 단계인지, 에러 상태는 무엇인지)
  // 2. 각 단계별 결과를 상위 컴포넌트에서 관리해야 함
  // 3. 오버레이 간 데이터 전달이 복잡함
  // 4. 에러 처리가 각 단계마다 중복됨
  
  const handleStep1Success = (result) => {
    setStep1Open(false);
    if (result.needsStep2) {
      setStep2Open(true);
    } else {
      // 성공 처리
    }
  };
  
  const handleStep1Error = () => {
    setStep1Open(false);
    setErrorOpen(true);
  };
  
  // ... 각 단계별로 유사한 핸들러들이 반복됨
  
  return (
    <>
      <button onClick={() => setStep1Open(true)}>동의 프로세스 시작</button>
      
      <ConsentStep1 
        open={step1Open} 
        onSuccess={handleStep1Success}
        onError={handleStep1Error}
      />
      <ConsentStep2 
        open={step2Open} 
        onSuccess={handleStep2Success}
        onError={handleStep2Error}
      />
      {/* ... */}
    </>
  );
};
```

```tsx
// ✅ Overlay-Kit으로 해결
const MyDataConsentFlow = () => {
  const startConsentFlow = async () => {
    try {
      // 1단계 동의
      const step1Result = await overlay.openAsync(({ isOpen, close, resolve }) => (
        <ConsentStep1 
          open={isOpen} 
          onClose={close}
          onSuccess={resolve}
          onError={(error) => close(Promise.reject(error))}
        />
      ));
      
      // 이전 결과에 따라 분기
      if (!step1Result.needsStep2) {
        return showSuccessMessage();
      }
      
      // 2단계 동의 (1단계 결과를 직접 사용 가능)
      const step2Result = await overlay.openAsync(({ isOpen, close, resolve }) => (
        <ConsentStep2 
          open={isOpen} 
          onClose={close}
          onSuccess={resolve}
          onError={(error) => close(Promise.reject(error))}
          previousData={step1Result} // 이전 단계 데이터 직접 전달
        />
      ));
      
      // 최종 처리
      await processConsent(step1Result, step2Result);
      
    } catch (error) {
      // 어느 단계에서든 에러 발생 시 통합 처리
      overlay.open(({ isOpen, close }) => (
        <ConsentErrorDialog 
          open={isOpen} 
          onClose={close}
          error={error}
        />
      ));
    }
  };
  
  return <button onClick={startConsentFlow}>동의 프로세스 시작</button>;
};
```

---

## 🎯 Overlay-Kit의 핵심 가치

### 1. **선언적 오버레이 관리**
- 상태 관리 없이 필요할 때 바로 오버레이 호출
- 컴포넌트 구조에 종속되지 않는 독립적 오버레이

### 2. **데이터 흐름의 단순화**  
- 오버레이 간 데이터 전달이 직관적
- Promise 기반의 결과 처리

### 3. **복잡한 플로우 지원**
- 순차적 오버레이 처리
- 조건부 분기 로직의 간소화

### 4. **전역 오버레이 지원**
- React Query, Error Boundary 등에서 직접 사용 가능
- 컴포넌트 생명주기와 무관한 오버레이

---

## 💡 결론

현재의 `useOverlay()` 방식은 간단한 사용 사례에는 적합하지만, 실제 프로덕트의 복잡한 요구사항들을 해결하기에는 구조적 한계가 명확합니다.

**Health팀이 자체 구현을 통해 사용하고 있는 것**처럼, 많은 팀들이 이미 이런 필요성을 느끼고 있으며, **Overlay-Kit은 이런 문제들을 근본적으로 해결할 수 있는 솔루션**입니다.

특히 다음과 같은 상황에서 Overlay-Kit의 도입이 **필수적**입니다:
- 복잡한 사용자 플로우 (동의, 결제, 인증 등)
- 전역 에러 처리
- 동적 오버레이 생성
- 오버레이 간 데이터 의존성이 있는 경우
