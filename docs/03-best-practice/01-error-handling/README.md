---
title: "Error Handling"
description: "순차 비동기 에러 처리, React Error Boundary 등 에러 핸들링 관련 패턴과 최적화 기법을 소개하는 인덱스 문서입니다."
type: index
tags: []
order: 0
---

# Error Handling

에러 핸들링 관련 패턴과 최적화 기법을 다루는 가이드입니다.

## 📋 문서 목록

### [Sequential Async Error Handling](./sequential-async-error-handling.md)
순차 비동기 작업의 에러 핸들링 패턴

**주요 내용:**
- 중첩된 try-catch의 복잡성 해결
- Rust 스타일 Result 패턴으로 명시적 에러 처리
- Promise.allSettled 사용 불가한 순차 호출 상황 해결
- AsyncResult 타입을 활용한 함수형 에러 핸들링

**핵심 개념:** 명시적이고 예측 가능한 에러 처리 패턴

### [ErrorBase 패턴](./error-base-pattern.md)
도메인 에러의 기반 클래스 설계

**주요 내용:**
- 커스텀 에러 기반 클래스 설계 (ErrorBase)
- 타입 가드를 통한 타입 안전한 에러 분기
- 에러 체인(cause)으로 원본 에러 보존
- 서브클래스 작성법과 확장 속성 활용

**핵심 개념:** 일관된 에러 체계 구축을 위한 기반 클래스

### [Sentry Fingerprint 패턴](./sentry-fingerprint-pattern.md)
커스텀 에러로 Sentry 이슈 그룹화를 제어하는 법

**주요 내용:**
- ErrorBase의 fingerPrint와 Sentry 연동
- extractFingerprint 자동 추출 로직 (Axios/ErrorBase/Error 분기)
- 직접 호출(sentryCaptureException) / 자동 감지(beforeSend) 두 경로
- fingerPrint 설계 가이드와 URL 정규화

**핵심 개념:** 동일 원인의 에러를 하나의 Sentry 이슈로 자동 그룹화

## 🎯 향후 추가 예정

> 🚧 **Work In Progress**
> 다음 문서들이 곧 추가될 예정입니다:

- **React Error Boundary Pattern**: React 에러 경계 활용법
- **API Error Handling**: API 호출 시 에러 처리 전략
- **User-Friendly Error Messages**: 사용자 친화적 에러 메시지 설계
