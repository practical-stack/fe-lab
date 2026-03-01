---
name: test-convention
description: Write or review unit tests following the project test convention. Use when writing tests, reviewing test code, or when the user asks to add/fix/refactor tests. Trigger on "write test for", "test this function", "add unit tests", "테스트 작성", "테스트 추가", "테스트 리뷰". Do NOT use for integration tests, E2E tests, or component rendering tests.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
argument-hint: "[file-or-function-to-test]"
---

# Unit Test Convention Skill

When writing or reviewing tests, **strictly follow** the convention rules injected below.
If `$ARGUMENTS` is provided, write tests for that target file or function.

This project uses **Vitest** — use `vi.` helpers (e.g., `vi.useFakeTimers()`, `vi.fn()`), not `jest.`.

## Workflow

1. Read the target source code (from `$ARGUMENTS` or user context)
2. **Check testability** — inspect the function for these hard dependencies:
   - **Time**: `new Date()`, `Date.now()` inside the function body
   - **API/Network**: `fetch`, axios, or other HTTP calls
   - **DOM/Runtime**: `window`, `document`, `localStorage`, browser APIs
   - **Global state**: module-level mutable variables, singletons
   If any are found, suggest separating pure logic into a testable function first (see ref 0).
3. Write or refactor tests applying **every rule** from the convention references below
4. Run `test` via the project's package manager (e.g., `pnpm nx test <project>`) to verify
5. Self-check against the checklist at the bottom

## Examples

### Example 1: Writing tests for a utility function
User says: `/test-convention src/utils/format-date.ts`
Actions:
1. Read `src/utils/format-date.ts`
2. Check for time/API/DOM dependencies
3. Write `src/utils/format-date.test.ts` following all conventions
4. Run tests and verify they pass
5. Self-check against the checklist

### Example 2: Reviewing existing tests
User says: "review my test code" (with a file open or path provided)
Actions:
1. Read the existing test file
2. Compare against every rule in the convention references
3. List violations with specific fixes
4. Apply fixes using Edit tool
5. Run tests to verify

## Error Handling

**Error:** Source file not found
**Cause:** `$ARGUMENTS` points to a non-existent path
**Solution:** Ask the user to provide the correct file path. Use `Glob` to search for similar filenames.

**Error:** Test runner fails to start
**Cause:** Missing test configuration or dependencies
**Solution:** Check if `vitest` is configured in the project. Look for `vitest.config.ts` or `vite.config.ts` with test config.

**Error:** Tests fail after writing
**Cause:** Logic error in test or incorrect expected values
**Solution:** Re-read the source code, verify expected values match the actual implementation. Run a single failing test with verbose output for diagnosis.

**Error:** Function is untestable (too many side effects)
**Cause:** Business logic mixed with I/O, time, or DOM operations
**Solution:** Suggest refactoring to extract pure logic first (see reference 0). Write tests for the extracted pure function. Do NOT add excessive mocks to force-test impure code.

---

## Convention References

All reference docs live under `references/` within this skill directory (symlinked to canonical sources).

### 0. Unit Test Standard

!`cat .claude/skills/test-convention/references/0-unit-test-standard.md`

### 1. Unit Test Convention

!`cat .claude/skills/test-convention/references/1-unit-test-convention.md`

### 2. Time Test

!`cat .claude/skills/test-convention/references/2-time-test.md`

### 3. Parameterized Test

!`cat .claude/skills/test-convention/references/3-parameterized-test.md`

---

## Quick-Reference Checklist

After writing tests, verify ALL of the following:

- [ ] File extension is `.test.ts` (never `.spec`)
- [ ] Uses `test()` (never `it()`)
- [ ] `describe` uses `functionName.name` or class name string
- [ ] Every test block has `// given`, `// when`, `// then` comments
- [ ] Test names describe a specific use case (no vague names)
- [ ] Result variable is named `actual`
- [ ] Tests focus on boundary values (no redundant mid-range repetitions)
- [ ] Lists tested with 0, 1, 2 items only (no 3+ repetitions)
- [ ] Repeated input-output mappings use `test.each`
- [ ] Table format for simple/English data, array format for complex/Korean data
- [ ] Time-dependent code uses `vi.useFakeTimers()` + `vi.setSystemTime()` with `vi.useRealTimers()` in `afterEach`
- [ ] Complex objects use Factory pattern, overriding only the test-relevant fields
- [ ] Inline snapshots (`toMatchInlineSnapshot()`) preferred for structure assertions
- [ ] No DOM dependencies — pure logic only in unit tests
- [ ] Only core fields asserted (no fragile assertions on incidental fields)
