---
title: "Picture 컴포넌트를 이용한 반응형 이미지 구현"
description: "Picture 컴포넌트의 fill과 aspect-ratio를 활용해 CLS를 줄이는 반응형 이미지 구현 방법을 설명합니다."
type: pattern
tags: [React, Tailwind, BestPractice]
order: 2
---

# Picture 컴포넌트를 이용한 반응형 이미지 구현

## 🎯 이 문서의 목적
- Picture 컴포넌트를 통해 반응형 이미지를 구현하고자 할 때 어떻게 사용해야 할지 알 수 있다.

## Picture 컴포넌트란?

Picture 컴포넌트는 light/dark mode에 따라 최적화된 이미지를 표시하는 컴포넌트. Next.js Image 컴포넌트를 기반으로 하며, Cloudflare 이미지 최적화와 다크모드 지원을 제공한다


## 요구사항

<img width="304" height="650" alt="image" src="https://github.com/user-attachments/assets/332a903e-8087-49e2-88ca-a162d626b1d2" />

위 화면의 가운데 이미지를 기기 너비가 늘어남에 따라 함께 반응형으로 늘어나게 해야한다.

## 기존 Picture 컴포넌트 사용 사례

Picture 컴포넌트(내부에서 Next.js Image 사용)에서 `width`와 `height` prop을 사용하여 고정 크기로 렌더링:


```tsx
// 기존 코드: 고정 크기로 사용
<div className="flex justify-center">
  <Picture
    src="graphic/color/illustration/curation/interest-rate-notification-kakao.png"
    loading="eager"
    alt="대출 금리 알림톡 일러스트레이션"
    width={327}
    height={200}
  />
</div>
```

위 케이스의 경우 화면이 늘어남에 따라 이미지는 너비는 늘어나지 않는다. 대다수의 경우 문제 없지만 이미지 요소와 다른 요소들이 함께 배치되었을 때 이미지 크키만 고정되면 어색해지는 경우가 있다. 이때는 이미지를 반응형으로 구현할 필요가 있다.

## 구현

### 1. 기본적인 반응형 이미지 (대부분의 경우)

```tsx
<div className="flex justify-center">
  <div className="relative aspect-[327/200]">
    <Picture
      src="graphic/color/illustration/curation/interest-rate-notification-kakao.png"
      loading="eager"
      alt="대출 금리 알림톡 일러스트레이션"
      fill
    />
  </div>
</div>
```

### 2. 정밀한 반응형 이미지 (상위 컨테이너 크기를 정확히 알 때)

```tsx
<div className="flex justify-center">
  <div className="relative aspect-[327/200]">
    <Picture
      src="graphic/color/illustration/curation/interest-rate-notification-kakao.png"
      loading="eager"
      alt="대출 금리 알림톡 일러스트레이션"
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
</div>
```

### 핵심 구현 요소

**`fill` 사용**:
- 상위 컨테이너에 대해 상대적 크기로 이미지가 렌더링
- 브라우저의 srcset 최적화에 의존하여 적절한 크기의 이미지 요청
- 기본 sizes는 100vw로 설정됨


**`aspect-[327/200]`**:
- 원본 이미지 비율에 맞는 aspect-ratio 명시
- 이미지 로드 전에 공간을 미리 예약하여 레이아웃 안정성이 확보되어 **CLS 방지** 

**`sizes` 사용 (선택적)**:
- 상위 컨테이너 크기를 정확히 알 때 사용
- 대부분의 경우 전체 화면 너비 + 약간의 패딩이므로 기본 100vw로도 충분
- 정밀한 최적화가 필요한 경우에만 명시적으로 설정




## 레퍼런스
- [Web.dev 이미지 최적화 - CLS 방지](https://web.dev/optimize-cls/#images-without-dimensions)
- [CSS Working Group aspect-ratio 명세](https://www.w3.org/TR/css-sizing-4/#aspect-ratio)
- [MDN aspect-ratio 문서](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
- [Web.dev CLS 가이드](https://web.dev/cls/)
