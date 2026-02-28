---
title: "미리 정의된 타입과 유연성을 동시에 제공하는 패턴"
description: "미리 정의된 값과 임의 값 허용을 함께 제공해 IDE 제안과 유연성을 모두 확보하는 타입 패턴을 소개합니다."
type: pattern
tags: [TypeScript, BestPractice]
order: 1
---

# 미리 정의된 타입과 유연성을 동시에 제공하는 패턴

## 해결하려는 문제

디자인 시스템에서 권장하는 값들을 IDE에서 우선 제안하면서도, 필요시 임의의 값을 사용할 수 있는 유연성을 제공해야 하는 경우가 있습니다.

```tsx
// ❌ 문제 상황 1: 너무 제한적
interface StrictProps {
  height: 0 | 4 | 8 | 16 | 20 | 24 | 32; // 정의된 값만 사용 가능
}

// ❌ 문제 상황 2: 너무 자유로움  
interface FlexibleProps {
  height: number; // 어떤 값이 권장되는지 알 수 없음
}

// 실제 사용 시 문제점들:
<SpacingHeight height={32} />  // ✅ 권장값
<SpacingHeight height={164} /> // ❌ 커스텀값 사용 불가 (문제1) 또는 권장값 모름 (문제2)
```

## 해결 방법

`PredefinedType | Omit<BaseType, PredefinedType>` 패턴을 사용하여 IDE 제안과 유연성을 동시에 제공합니다.

```tsx
// ✅ 해결: 미리 정의된 값 + 유연성
type PredefinedHeight = 0 | 4 | 8 | 10 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 104;

interface SpacingHeightProps {
  /**
   * IDE에서 미리 정의된 값들을 우선 제안하면서도
   * 필요시 임의의 숫자 값 사용 가능
   */
  height?: PredefinedHeight | Omit<number, PredefinedHeight>;
}

// 사용 예시
<SpacingHeight height={32} />   // ✅ IDE에서 우선 제안되는 권장값
<SpacingHeight height={164} />  // ✅ 커스텀값도 사용 가능
```

### 구현 세부사항

```tsx
// 1. 미리 정의된 타입 선언
type PredefinedHeight = 0 | 4 | 8 | 10 | 12 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 104;

// 2. 최적화를 위한 매핑 테이블
const PREDEFINED_HEIGHTS: Record<PredefinedHeight, string> = {
  0: 'h-0',
  4: 'h-[4px]',
  8: 'h-[8px]',
  // ... 나머지 값들
};

// 3. 유니온 타입으로 유연성 제공
interface Props {
  height?: PredefinedHeight | Omit<number, PredefinedHeight>;
}

// 4. 런타임에서 구분 처리
export const SpacingHeight = ({ height = 0, ...props }: Props) => {
  const isPredefined = (height as number) in PREDEFINED_HEIGHTS;
  
  return (
    <div
      className={cn(
        'bg-transparent',
        isPredefined && PREDEFINED_HEIGHTS[height as PredefinedHeight]
      )}
      style={isPredefined ? undefined : { height: `${height}px` }}
      {...props}
    />
  );
};
```

### 효과

1. **IDE 지원**: 미리 정의된 값들이 자동완성에서 우선 제안됨
2. **성능 최적화**: 권장값들은 Tailwind 클래스로 처리
3. **유연성**: 필요시 임의의 값도 사용 가능
4. **타입 안전성**: TypeScript로 완전한 타입 체크

## 주의사항 (Caveat)

### ❌ 남용하면 안 되는 경우

```tsx
// ❌ 잘못된 사용: 너무 많은 미리 정의된 값
type PredefinedSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;
// → IDE 자동완성이 너무 길어져서 오히려 방해가 됨

// ❌ 잘못된 사용: 의미 없는 구분
type PredefinedColor = 'red' | 'blue';
interface Props {
  color?: PredefinedColor | Omit<string, PredefinedColor>; // 모든 색상이 동등하게 유효한 경우
}

// ❌ 잘못된 사용: 런타임 최적화가 없는 경우
const Component = ({ size }: { size?: PredefinedSize | Omit<number, PredefinedSize> }) => {
  // 미리 정의된 값과 그렇지 않은 값을 동일하게 처리
  return <div style={{ width: `${size}px` }} />;
  // → 미리 정의된 값의 의미가 없음
};
```

### ✅ 올바른 사용 조건

1. **의미 있는 구분**: 미리 정의된 값들이 특별한 의미나 최적화를 가져야 함
2. **적당한 개수**: 미리 정의된 값이 너무 많지 않아야 함 (보통 10-15개 이하)
3. **런타임 차이**: 미리 정의된 값과 그렇지 않은 값이 다르게 처리되어야 함

## 사용된 레퍼런스

- 디자인 시스템의 Spacing Height 컴포넌트
- 디자인 시스템에서 권장 spacing 값들을 제공하면서도 커스텀 값 허용

## 더 알아보기

### 관련 TypeScript 패턴

```tsx
// 1. 문자열 리터럴 + 임의 문자열
type Theme = 'light' | 'dark' | (string & {});

// 2. 숫자 리터럴 + 임의 숫자  
type Size = 'sm' | 'md' | 'lg' | (number & {});

// 3. 객체 키 + 임의 문자열
type EventName = keyof WindowEventMap | (string & {});
```

### 성능 고려사항

```tsx
// ✅ 좋은 예: 상수로 매핑 테이블 정의
const PREDEFINED_VALUES = { ... }; // 컴포넌트 외부

// ❌ 나쁜 예: 매번 객체 생성
const Component = () => {
  const mapping = { ... }; // 렌더링마다 재생성
};
```
