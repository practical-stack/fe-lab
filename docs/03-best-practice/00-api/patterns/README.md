---
title: "API 호출 패턴"
description: "SuspenseQuery, Mutation, Prefetch 등 API 호출 문제를 해결하는 패턴과 사용 시나리오를 모은 인덱스입니다."
type: index
tags: [API, React, BestPractice]
order: 0
---

# API 호출 패턴

API 호출 시 발생하는 다양한 문제들과 해결 방법을 정리한 패턴 모음입니다.

## 📋 패턴 목록

### [Mutation Namespace 패턴](./mutation-namespace-pattern.md)
- 여러 Mutation 사용 시 변수명 충돌과 소속 불분명 문제 해결
- useMutation Namespace 유지로 변수명 충돌 방지
- destructuring vs namespace 사용 가이드라인

### [Mutation 응집도 패턴](./mutation-cohesion-pattern.md)
- Mutation 선언부와 사용처 분리로 인한 코드 흐름 파악 어려움 해결
- Mutation 컴포넌트로 Mutation 응집도 향상
- 선언부와 사용처 co-location 패턴

### [SuspenseQuery 응집도 패턴](./suspense-query-cohesion-pattern.md)
- SuspenseQuery 선언부와 사용처 분리로 인한 데이터 흐름 파악 어려움 해결
- SuspenseQueries 컴포넌트로 데이터 fetching, 변환, 사용처 응집도 향상
- select 함수를 통한 명시적 데이터 변환 및 wrap 패턴 제거

### [SuspenseQueries 병렬 호출 패턴](./parallel-query-pattern.md)
- Suspense 중첩으로 인한 Waterfall 및 깜빡이는 로더 문제 해결
- PrefetchQuery로도 해결되지 않는 깜빡임 문제 해결
- 모든 쿼리 병렬 실행 및 통합 로딩 상태 관리

### [Mutation 조건부 패턴](./mutation-conditional-pattern.md)
- React Hooks 제약으로 인한 불필요한 컴포넌트 생성 문제 해결
- Mutation 컴포넌트로 조건부 mutation 사용 구현
- wrapper 컴포넌트 없이 높은 응집도 달성

### [SuspenseQuery 조건부 패턴](./suspense-query-conditional-pattern.md)
- React Hooks 제약으로 인한 조건부 데이터 페칭 문제 해결
- SuspenseQuery 컴포넌트로 조건부 query 사용 구현
- 사용자 권한/상태에 따른 동적 API 호출

### [PrefetchQuery 패턴](./prefetch-query-pattern.md)
- 성능 최적화 및 UX 향상을 위한 전략적 Prefetch
- PrefetchQuery 컴포넌트의 응집도 향상
- 백그라운드 로딩으로 매끄러운 인터랙션 구현

## 🎯 사용법

각 패턴은 다음과 같은 구조로 작성되어 있습니다:

1. **해결하려는 문제**: 해당 패턴이 해결하는 구체적인 문제점
2. **해결 방법**: Before/After 코드 예시와 함께 해결 방법 제시
3. **주의사항**: 패턴 남용 시 발생할 수 있는 문제점과 올바른 사용법
4. **사용된 레퍼런스**: 실제 프로젝트에서 적용된 사례

## 💡 MSA 환경 고려사항

MSA 환경에서 BFF(Backend for Frontend) 레이어가 없을 때:
- 프론트엔드에서 통합 fetch 함수를 만들어 BFF 역할 수행
- 복잡한 중첩 Mutation 대신 단일 비즈니스 플로우로 단순화
- 여러 마이크로서비스 API 호출을 하나의 응집된 작업으로 통합

## 🔗 관련 문서

- [000. Page Structure - 예측 가능한 페이지 구조 설계](../000-page-structure.md)
- [001. Compound Pattern - 페이지 구조 표현](../001-compound-pattern-page-structure.md)
