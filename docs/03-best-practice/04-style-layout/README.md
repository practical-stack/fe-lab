---
title: "Style Layout"
description: "Compound Pattern, 간격 관리, 반응형 이미지 등 레이아웃과 스타일링 관련 패턴을 정리한 문서 모음 인덱스입니다."
type: index
tags: []
order: 0
---

# Style Layout

스타일링과 레이아웃 관련 패턴과 가이드를 다루는 문서들입니다.

## 📋 문서 목록

### [Section Compound Pattern](./section-compound-pattern.md)
페이지 구조 표현을 위한 Compound Pattern 활용법

**주요 내용:**
- PA에서 `xxx-page.tsx` 컴포넌트만 보고도 전체 화면 구조를 파악할 수 있게 하는 패턴
- 페이지 레이아웃과 의미론적 구조 표현에 특화
- 드러내야 할 것과 감춰야 할 것의 명확한 구분
- Layout 컴포넌트를 활용한 구조적 표현

**핵심 개념:** Compound Pattern을 통한 명확한 페이지 구조 표현

### [간격 관리 방법 선택 가이드](./spacing-methods-guide.md)
SpacingHeight, flex gap, space-y/space-x 사용 케이스 가이드

**주요 내용:**
- SpacingHeight: 피그마 명세의 단일 간격, CSS 지식 불필요한 안전한 간격 관리
- flex gap: 정렬/분배/크기조정과 간격의 통합 관리
- space-y/space-x: 자연스러운 문서 흐름에서의 간격 관리
- 상황별 최적 선택 기준과 플로우차트

**핵심 개념:** 상황에 맞는 간격 관리 방법 선택을 통한 예측 가능하고 유지보수하기 쉬운 레이아웃

### [Picture 컴포넌트를 이용한 반응형 이미지 구현](./responsive-image.md)
Cloudflare 이미지 최적화와 CLS 방지를 고려한 반응형 이미지 구현 가이드

**주요 내용:**
- Cloudflare 이미지 최적화 제약사항과 해결 방법
- aspect-ratio를 통한 CLS(Cumulative Layout Shift) 방지
- !important 유틸리티를 활용한 인라인 스타일 재정의
- Picture 컴포넌트의 width/height prop과 반응형 디자인 양립

**핵심 개념:** `aspect-[원본비율] !w-full` 패턴을 통한 최적화와 사용자 경험의 동시 확보

## 🎯 향후 추가 예정

> 🚧 **Work In Progress**
> 다음 문서들이 곧 추가될 예정입니다:

- **Tailwind Design Token Guide**: 디자인 토큰 사용 가이드
- **Responsive Layout Pattern**: 반응형 레이아웃 설계 패턴
- **CSS Architecture**: CSS 구조화 및 관리 방법
- **Animation & Transition**: 애니메이션과 전환 효과 가이드
