---
title: "AGENTS.md - Documentation Structure Guide"
description: "AI 에이전트가 docs 폴더의 번호 체계, 카테고리 배치 기준, 명명 규칙, 문서 품질 기준 등을 이해하기 위한 메타 문서입니다."
type: reference
tags: [Documentation, Architecture]
---

# AGENTS.md - Documentation Structure Guide

이 문서는 AI 에이전트가 docs 폴더의 구조와 원칙을 이해하는 데 도움을 주기 위한 메타 문서입니다.

---

## Source of Truth

문서 작성 시 아래 문서를 참조합니다:

| 항목 | 문서 | 설명 |
|------|------|------|
| Frontmatter 요구사항 | [00-meta/00-frontmatter/00-requirement.md](./00-meta/00-frontmatter/00-requirement.md) | 시스템 요구사항 |
| Frontmatter ADR | [00-meta/00-frontmatter/01-adr.md](./00-meta/00-frontmatter/01-adr.md) | 설계 결정 기록 |

---

## 문서 구조 원칙

### 번호 체계 (지식 우선순위 기반)

문서는 **기본 지식 및 업무에 가장 먼저 필요하게 되는 순서**로 번호가 매겨져 있습니다. 낮은 번호일수록 더 기초적이고 필수적인 지식을 담고 있습니다.

| 번호 | 폴더 | 목적 | 의존성 |
|:----:|------|------|--------|
| 00 | meta | 문서화 시스템 메타 정보, Frontmatter 스키마 | - |
| 01 | project-ops | 프로젝트 운영, PR 작성법 | 00 |
| 02 | architecture | 코드 컨벤션, 구조 | 00, 01 |
| 03 | best-practice | API, 에러처리, 테스트, TS, 스타일, 비주얼에셋 패턴 | 00, 01, 02 |

### 카테고리별 문서 배치 기준

#### 00-meta
- **문서화 시스템의 메타 정보**
- Frontmatter 스키마, Tags, Type 정의
- docs 폴더 전체에 적용되는 규칙

#### 01-project-ops
- **프로젝트 운영** 관련 문서
- PR 작성법, 프로젝트 운영 방법
- "이 프로젝트를 어떻게 운영하는가"에 대한 답

#### 02-architecture
- **구조적 결정**에 대한 문서
- 코드 컨벤션, 폴더 구조, 아키텍처 패턴
- "왜 이렇게 구성했는가"에 대한 답

#### 03-best-practice
- **실용적인 코딩 패턴과 팁**
- API 호출 패턴, 에러 처리, 테스트 작성법, TypeScript 팁, 스타일/레이아웃, 비주얼 에셋 사용 가이드
- "어떻게 하면 잘 할 수 있는가"에 대한 답

---

## 명명 규칙

### 폴더명
- 영어 소문자, 하이픈 구분
- `{번호}-{명확한-이름}` 형식
- **금지**: advanced, misc, etc, other, extra, general 등 모호한 이름

### 파일명
- 영어 소문자, 하이픈 구분
- `.md` 확장자
- 폴더 내에서도 번호로 순서 표시 권장 (예: `00-overview.md`, `01-getting-started.md`)

### 이미지 파일

문서에 이미지가 포함되는 경우:

- **폴더**: `{문서명}.images/` 형식
- **파일명**: `{번호}-{설명적인-이름}.{확장자}` 형식

```
01-project-ops/
├── 02-deployment.md
└── 02-deployment.images/
    ├── 01-github-actions-workflow.png
    ├── 02-argocd-sync-status.png
    └── 03-kubernetes-pod-logs.png
```

---

## 새 문서 추가 가이드

### 1. Frontmatter 작성

모든 문서에 frontmatter를 포함합니다:

```yaml
---
title: "문서 제목"
description: "50-160자 핵심 요약"
type: guide                    # 00-meta/00-frontmatter/ 참조
tags: [React, API]             # 00-meta/00-frontmatter/ 참조
order: 0                       # 파일명 prefix와 일치
---
```

**참조**: [00-meta/00-frontmatter/](./00-meta/00-frontmatter/)

### 2. 카테고리 선택

문서의 **주요 목적**에 따라 카테고리를 선택합니다:

| 목적 | 카테고리 |
|------|----------|
| 문서화 시스템/메타 정보 | `00-meta` |
| 프로젝트 운영/워크플로우 | `01-project-ops` |
| 구조/컨벤션 | `02-architecture` |
| 코딩 패턴/팁/가이드 | `03-best-practice` |

### 3. 중복 확인

기존 문서와 중복되지 않는지 확인합니다. 비슷한 내용이 있다면 기존 문서를 확장하는 것을 고려하세요.

### 4. README 업데이트

새 문서를 추가하면 해당 폴더의 `README.md`와 `docs/README.md`를 함께 업데이트합니다.

---

## 문서 품질 기준

### 필수 요소
- **Frontmatter**: [00-meta/00-frontmatter/](./00-meta/00-frontmatter/) 준수
- **목적**: 이 문서가 해결하는 문제가 명확해야 함
- **예제**: 코드 예제 또는 실제 사용 사례 포함

### 권장 요소
- **관련 문서**: 함께 읽으면 좋은 다른 문서 링크 (frontmatter `related` 필드)
- **주의사항(Caveat)**: 잘못 사용할 수 있는 케이스

---

## AI 에이전트를 위한 팁

### 문서 검색 시
1. 먼저 `docs/README.md`에서 전체 구조 파악
2. 카테고리별 `README.md`에서 세부 문서 목록 확인
3. 번호 순서가 낮은 문서부터 참조 (의존성 고려)

### 문서 작성/수정 시
1. **Frontmatter**: [00-meta/00-frontmatter/](./00-meta/00-frontmatter/) 스키마 준수
2. 기존 문서의 Tags, Type 참고하여 선택
4. 기존 문서의 스타일과 포맷 따르기
5. 관련 `README.md` 파일 함께 업데이트

### 문서 이동/이름 변경 시

문서를 이동하거나 이름을 변경할 때는 **반드시** 아래 위치의 깨진 참조를 확인하고 업데이트해야 합니다:

1. **docs 내부 참조**
   - `docs/README.md` - 전체 문서 구조
   - `docs/AGENTS.md` - 이 파일
   - 각 폴더의 `README.md`
   - 다른 문서의 frontmatter `depends_on`, `related` 필드

2. **프로젝트 외부 참조**
   - `.ai-agents/commands/*.md` - AI 에이전트 명령어 파일들
   - `.cursor/rules/*.mdc` - Cursor 룰 파일들

3. **검색 방법**
   ```bash
   # docs 내부 깨진 참조 검색
   grep -r "이전경로" docs/
   
   # .ai-agents 내부 깨진 참조 검색
   grep -r "docs/" .ai-agents/
   ```
