---
title: "Page Folder Structure"
description: "페이지 컴포넌트 구조와 소스 폴더 설계 문서를 한눈에 찾도록 정리한 인덱스입니다."
type: index
tags: [Architecture, React]
order: 2
---

# Page Folder Structure

페이지 관련 폴더 구조와 컴포넌트 설계 패턴을 다루는 가이드입니다.

## 📋 문서 목록

### [Page Component Structure](./page-component-structure.md)
페이지 컴포넌트만 보고도 해당 페이지의 **전체 구조와 동작을 한눈에 파악**할 수 있도록 설계하는 방법

**주요 내용:**
- 코드가 곧 테크스펙이 되는 페이지 구조 설계
- 데이터 흐름, 레이아웃 구조, 상태 관리의 명확한 표현
- 복잡한 페이지의 적절한 분할 전략
- Layout 컴포넌트 활용법과 주의사항

**핵심 철학:** 페이지 컴포넌트 자체가 테크스펙 역할을 해야 합니다.

### [Source Folder Structure](./src-folder-structure.md)
서비스별 응집도 중심 폴더 구조 설계

**주요 내용:**
- 페이지와 관련 리소스의 높은 응집도 달성
- View 기반 구조화와 @shared 폴더 활용
- 파일 분리 기준과 폴더 중첩 최적화
- 실제 프로젝트 적용 사례와 마이그레이션 가이드

**핵심 개념:** 구조가 곧 정보

## 🎯 향후 추가 예정

> 🚧 **Work In Progress**  
> 다음 문서들이 곧 추가될 예정입니다:

- **View Component Pattern**: 뷰 컴포넌트 분리와 조직화
- **File Naming Convention**: 일관된 파일 네이밍 규칙
