---
title: "FE Lab Documentation"
description: "fe-lab 프로젝트의 아키텍처, API 패턴, 테스트 등 개발 가이드라인과 베스트 프랙티스를 정리한 문서 인덱스입니다."
type: index
tags: [Documentation]
---

# FE Lab Documentation

fe-lab 프로젝트의 개발 가이드라인과 베스트 프랙티스를 정리한 문서입니다.

## 📚 문서 구조

```
docs/
├── 00-meta/                # 문서화 시스템 메타 정보 (Frontmatter 스키마, AI 문서화 방법론)
├── 01-project-ops/         # 프로젝트 운영 (PR 작성법 등)
├── 02-architecture/        # 아키텍처 & 컨벤션
└── 03-best-practice/       # 코딩 패턴 가이드 (API, 에러처리, 테스트, TS, 스타일, 비주얼에셋, AI)
```

---

### [00-meta](./00-meta/) - 문서화 시스템 메타 정보
AI 에이전트를 위한 문서화 규칙, Frontmatter 스키마

- **[00-frontmatter/](./00-meta/00-frontmatter/)** - Frontmatter 시스템 (요구사항, ADR, 리서치)

---

### [01-project-ops](./01-project-ops/) - 프로젝트 운영
프로젝트 운영 방법, PR 작성법 등

- [01-pr-writing.md](./01-project-ops/01-pr-writing.md) - PR 작성법

---

### [02-architecture](./02-architecture/) - 아키텍처 & 컨벤션
코드 컨벤션, 폴더 구조 등 아키텍처 관련 가이드

- **[00-code-convention](./02-architecture/00-code-convention/)** - 코드 컨벤션
- **[01-monorepo-structure](./02-architecture/01-monorepo-structure/)** - 모노레포 구조
- **[02-page-structure](./02-architecture/02-page-structure/)** - 페이지/컴포넌트 구조
- [why-overlay-kit-needed.md](./02-architecture/why-overlay-kit-needed.md) - Overlay-Kit 도입 필요성 분석

---

### [03-best-practice](./03-best-practice/) - 코딩 패턴 가이드
API 패턴, 에러 처리, 테스트, TypeScript, 스타일/레이아웃, AI 활용 패턴

- **[00-api](./03-best-practice/00-api/)** - API 호출 패턴
  - [patterns/](./03-best-practice/00-api/patterns/) - Suspense Query, Mutation, Prefetch 등
- **[01-error-handling](./03-best-practice/01-error-handling/)** - 에러 처리 패턴
- **[02-test](./03-best-practice/02-test/)** - 테스트 가이드라인
- **[03-typescript](./03-best-practice/03-typescript/)** - TypeScript 팁 & 패턴
- **[04-style-layout](./03-best-practice/04-style-layout/)** - 반응형 이미지, 간격, Section 패턴
- **[05-visual-asset-guide](./03-best-practice/05-visual-asset-guide/)** - Picture, Icon, Image, Lottie 사용 가이드
- **[06-ai](./03-best-practice/06-ai/)** - AI 활용 베스트 프랙티스 (DeepSearch 메타 프롬프트 방법론)

---

