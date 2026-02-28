---
title: "문서화 시스템 메타 정보"
description: "docs 폴더 문서 작성을 위한 frontmatter 요구사항, 설계 결정, 리서치 자료를 제공합니다."
type: index
tags: [Documentation, Frontmatter]
---

# 문서화 시스템 메타 정보

docs 폴더 문서 작성을 위한 스키마, 태그, 가이드입니다.

---

## 폴더 구조

```
00-meta/
└── 00-frontmatter/              # Frontmatter 시스템
    ├── 00-requirement.md        # 요구사항
    ├── 01-adr.md                # 설계 결정 기록
    └── research/                # 리서치 자료
```

---

## 문서 목록

| 문서 | 설명 | 용도 |
|------|------|------|
| [00-requirement.md](./00-frontmatter/00-requirement.md) | 시스템 요구사항 정의 | 배경 이해 |
| [01-adr.md](./00-frontmatter/01-adr.md) | 설계 결정 기록 (ADR) | 설계 근거 |

---

## 빠른 참조

### 필수 필드

```yaml
---
title: "문서 제목"
description: "50-160자 핵심 요약"
type: guide  # tutorial | guide | reference | explanation | adr | troubleshooting | pattern | index
---
```

### 권장 필드

```yaml
tags: [React, API]  # 최대 5개
order: 0            # 파일명 prefix와 일치
```

---

## 리서치 자료

[research/](./00-frontmatter/research/) - 스키마 도출 과정의 DeepSearch 리서치 자료

---

## 관련 문서

- [docs/AGENTS.md](../AGENTS.md) - AI 에이전트용 문서 구조 가이드
- [docs/README.md](../README.md) - 전체 문서 인덱스
