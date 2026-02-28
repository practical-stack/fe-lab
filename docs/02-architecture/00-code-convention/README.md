---
title: "Code Convention"
description: "변수명 네이밍, 함수 인터페이스 설계, 코드리뷰 체크리스트 등 프로젝트 코드 컨벤션 문서의 개요와 목록을 안내합니다."
type: index
tags: [Architecture, TypeScript, BestPractice]
order: 0
---

# Code Convention

코드 컨벤션 관련 가이드라인과 패턴을 다룹니다. 네이밍, 함수 설계, 코드리뷰 기준 등 팀 내 일관된 코드 작성을 위한 원칙을 정리합니다.

## 문서

### [01. 변수명 요구사항](./01-naming-convention.md)

변수명의 루트 요구사항, 스코프와 명확성의 상관관계, 일관성 원칙, 의도적 인지부하, 가독성의 올바른 위치를 정의하는 가이드

### [02. 변수 역할 프레임워크](./02-variable-naming-framework.md)

Sajaniemi의 변수 역할 프레임워크를 TypeScript/프론트엔드 관점으로 확장. 12가지 변수 역할 분류, 플래그 접두어(is/has/should/can) 가이드, 인지과학적 근거.

### [03. 함수 역할 프레임워크](./03-function-naming-framework.md)

프론트엔드 함수의 10가지 역할 분류. 조회자/변경자/생성자/변환자/검증자/이벤트 핸들러 등 역할별 네이밍 패턴과 prefix 구분 가이드.

### [04. 함수 인터페이스 패턴](./04-function-interface-pattern.md)

`(primary, options?) => ReturnType` 패턴과 default 값 원칙

## 예정된 내용

- 코드 스타일 가이드
- 파일 구조 컨벤션
- TypeScript 컨벤션
