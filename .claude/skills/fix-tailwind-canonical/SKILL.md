---
name: fix-tailwind-canonical
description: Fix deprecated Tailwind CSS class names to their v4 canonical equivalents using LSP diagnostics
trigger: "fix tailwind canonical", "tailwind canonical", "tw canonical", "suggestCanonicalClasses"
---

# Fix Tailwind CSS Canonical Classes

Tailwind CSS v4에서 deprecated된 클래스 이름을 canonical(정식) 이름으로 자동 변환합니다.

## How it works

이 skill은 두 계층으로 동작합니다:

### Layer 1: Hook (정적 치환)
- PostToolUse hook (`.claude/hooks/fix-tailwind-canonical.sh`)이 Edit|Write 후 자동 실행
- 알려진 정적 매핑만 sed로 즉시 치환 (bg-gradient→bg-linear, flex-grow→grow 등)

### Layer 2: Skill (LSP 진단 기반 — 이 문서)
- Hook이 잡지 못하는 동적 변환을 처리 (예: `h-[600px]` → `h-150`)
- LSP diagnostics에서 `suggestCanonicalClasses` 경고를 읽어 정확한 canonical 이름을 추출

## Instructions

이 skill이 호출되면 다음 순서로 실행합니다:

### Step 1: IDE 진단 조회

대상 파일에 대해 VSCode IDE diagnostics를 조회합니다:

```
mcp__ide__getDiagnostics(uri="file://<absolute_path>")
```

### Step 2: suggestCanonicalClasses 필터링

진단 결과에서 `suggestCanonicalClasses`를 포함하는 메시지를 필터링합니다.
각 진단 메시지는 다음 형식입니다:

```
The class `<old>` can be written as `<canonical>` (suggestCanonicalClasses)
```

메시지에서 old class와 canonical class를 추출합니다.

### Step 3: 자동 수정

각 경고에 대해:
1. 파일에서 해당 line/column의 old class를 찾습니다
2. canonical class로 Edit 도구를 사용해 교체합니다
3. variant prefix (hover:, focus: 등)와 `!` modifier는 보존합니다

### Step 4: 검증

수정 후 다시 `mcp__ide__getDiagnostics`를 호출하여 `suggestCanonicalClasses` 경고가 0개인지 확인합니다.

## Known static mappings (hook이 자동 처리)

| Old | Canonical |
|-----|-----------|
| `bg-gradient-to-{dir}` | `bg-linear-to-{dir}` |
| `flex-grow` / `flex-grow-0` | `grow` / `grow-0` |
| `flex-shrink` / `flex-shrink-0` | `shrink` / `shrink-0` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-clone` / `decoration-slice` | `box-decoration-clone` / `box-decoration-slice` |
| `bg-left-top` 등 | `bg-top-left` 등 (position order) |
| `object-left-top` 등 | `object-top-left` 등 |

## Dynamic canonicalizations (LSP로만 감지 가능)

- Arbitrary value → bare value: `h-[600px]` → `h-150` (spacing scale 의존)
- Theme to var: `text-[theme(colors.red.500)]` → `text-(--tw-color-red-500)`
- Calc to spacing: `mt-[calc(var(--spacing)*4)]` → `mt-4`
- Unnecessary data types: `text-[length:1rem]` → `text-[1rem]`

## Source of Truth

- Tailwind CSS v4 core: `canonicalize-candidates.ts` (`UTILITY_CANONICALIZATIONS` pipeline)
- Tailwind CSS IntelliSense: `suggestCanonicalClasses` diagnostic
- Upgrade tool: `migrate-simple-legacy-classes.ts` (`LEGACY_CLASS_MAP`)
