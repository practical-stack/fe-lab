---
name: skill-craft
description: >-
  Interactive guide for creating new Claude skills or refactoring existing ones
  following Anthropic best practices. Use when the user says "create a skill",
  "new skill", "scaffold a skill", "refactor skill", "improve skill",
  "review my skill", or "skill-craft". Supports CREATE mode (scaffold from
  scratch) and REFACTOR mode (analyze and improve existing SKILL.md).
  Do NOT use for general Markdown editing or documentation tasks.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Agent
argument-hint: "[create | refactor path-to-skill]"
---

# Skill Craft

Interactive guide for building and improving Claude skills following Anthropic best practices.

## Mode Detection

Determine the mode from `$ARGUMENTS` or user intent:

- **CREATE mode:** `$ARGUMENTS` starts with `create`, OR user says "create a skill", "new skill", "scaffold a skill"
- **REFACTOR mode:** `$ARGUMENTS` starts with `refactor`, OR user says "refactor skill", "improve skill", "review my skill"
- **Ambiguous:** Ask the user which mode they want

---

## CREATE Mode

Follow these 7 steps sequentially. Do NOT skip steps.

### Step 1: Gather Requirements

Ask the user (use AskUserQuestion or conversational prompting):

1. **Use case:** What should the skill do? Get 2-3 concrete use cases.
2. **Trigger phrases:** What would a user say to invoke this skill? List exact phrases and paraphrased variations.
3. **Tools needed:** Which tools does the skill require? (built-in: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, WebSearch; or MCP tools)
4. **Scope boundaries:** What should the skill NOT do? (negative triggers to prevent over-triggering)
5. **Platform:** Claude Code only, or cross-platform? (determines which frontmatter fields to use)

If the user provides a description rather than answering each question, extract answers from their description and confirm understanding before proceeding.

### Step 2: Select Pattern

Read `references/patterns.md` from this skill's directory.

Present the pattern selection matrix to the user:

| Pattern | Best For |
|---|---|
| Sequential Workflow | Multi-step process in specific order |
| Multi-MCP Coordination | Workflow spanning multiple services |
| Iterative Refinement | Output quality improves with iteration |
| Context-Aware Selection | Same outcome, different tools by context |
| Domain-Specific Intelligence | Embedding specialized knowledge |

Recommend the best-fit pattern based on Step 1 answers. Confirm with the user.

### Step 3: Design Frontmatter

Read `references/frontmatter-spec.md` and `references/description-guide.md` from this skill's directory.

Draft the YAML frontmatter:

1. **name:** kebab-case, max 64 chars, matching the folder name
2. **description:** Follow the [What] + [When] + [Key] formula from description-guide.md
   - Include 3-5 trigger phrases
   - Add negative triggers if scope is ambiguous
   - Keep under 1024 characters
3. **allowed-tools:** Only the tools the skill actually needs
4. **argument-hint:** If the skill accepts arguments
5. **Claude Code fields** (if applicable): `context`, `agent`, `disable-model-invocation`, `model`

Present the drafted frontmatter to the user for approval. Explain each field choice.

### Step 4: Write Body

Structure the SKILL.md body following the chosen pattern:

```markdown
# Skill Name

[Brief overview - 1-2 sentences]

## Instructions

### Step 1: [First Action]
[Clear, specific, actionable instructions]
[Expected output or success criteria]

### Step 2: [Next Action]
...

## Examples

### Example 1: [Common scenario]
User says: "[trigger phrase]"
Actions: [what the skill does]
Result: [expected outcome]

## Error Handling

**Error:** [Common error]
**Cause:** [Why it happens]
**Solution:** [How to fix]
```

Key rules:
- Put critical instructions at the top
- Use numbered steps for sequential workflows
- Be specific ("Run `npm test`" not "validate the code")
- Include error handling for common failures
- Reference files with relative paths: `references/filename.md`
- Use `!`command`` for dynamic context injection if needed
- Use `$ARGUMENTS` for argument handling if needed

Read `references/claude-code-features.md` for Claude Code-specific syntax when relevant.

### Step 5: Create Reference Files

If the skill needs reference documentation:

1. Identify content that is too detailed for SKILL.md body (> 50 lines of reference material)
2. Create files in `references/` subdirectory
3. Keep each reference file focused on a single topic
4. Link from SKILL.md body: "Read `references/api-guide.md` for..."

Reference files are optional. Simple skills may not need any.

### Step 6: Scaffold Files

Create the directory structure and write all files:

```bash
mkdir -p .claude/skills/<skill-name>/references/  # if references needed
mkdir -p .claude/skills/<skill-name>/scripts/      # if scripts needed
```

Write files in this order:
1. Reference files first (if any)
2. SKILL.md last (since it references other files)

### Step 7: Validate

Read `references/checklist.md` from this skill's directory.

Run through the Phase 2 (During Development) checklist against the created skill. Report results as:

- **PASS:** Requirement met
- **FAIL:** Requirement not met (must fix)
- **N/A:** Not applicable to this skill

Fix any FAIL items before declaring the skill complete.

Present a summary:
```
Validation Results:
  PASS: 15  |  FAIL: 0  |  N/A: 3

Skill created at: .claude/skills/<skill-name>/
Test with: /skill-name [args]
```

---

## REFACTOR Mode

Analyze and improve an existing skill. Follow these 8 steps.

### Step 1: Locate & Read

If `$ARGUMENTS` provides a path after "refactor", use that path.
Otherwise, search for the skill:

```
Glob: .claude/skills/**/SKILL.md
```

Read the entire SKILL.md and any referenced files (references/, scripts/).

### Step 2: Checklist Analysis

Read `references/checklist.md` from this skill's directory.

Evaluate the existing skill against the Phase 2 (During Development) checklist. For each item, report:

- **PASS:** Meets the requirement
- **FAIL:** Does not meet the requirement — explain what's wrong
- **WARN:** Partially meets or could be improved — explain the concern

### Step 3: Description Quality Check

Read `references/description-guide.md` from this skill's directory.

Evaluate the `description` field:

1. Does it follow [What] + [When] + [Key] formula?
2. Are trigger phrases specific enough?
3. Are there enough trigger variations (3-5)?
4. Are negative triggers present if scope is ambiguous?
5. Is it under 1024 characters?
6. Would it trigger correctly on paraphrased requests?
7. Would it avoid triggering on unrelated tasks?

### Step 4: Instruction Quality Check

Evaluate the body instructions:

1. Are instructions specific and actionable (not vague)?
2. Are critical instructions placed at the top?
3. Is progressive disclosure used (detail in references, not all in SKILL.md)?
4. Is error handling included?
5. Are examples provided?
6. For sequential workflows: are step dependencies clear?
7. Is the SKILL.md under 5,000 words?

### Step 5: Frontmatter Field Analysis

Read `references/frontmatter-spec.md` from this skill's directory.

Check all frontmatter fields:

1. Is `name` valid kebab-case and matches folder name?
2. Is `allowed-tools` appropriately scoped (not too broad, not missing needed tools)?
3. Is `argument-hint` present if the skill accepts arguments?
4. Are Claude Code-specific fields (`context`, `disable-model-invocation`, etc.) used correctly?
5. Are there missing fields that would improve the skill?

### Step 6: Present Improvement Plan

Categorize all findings by severity:

| Severity | Meaning | Action |
|---|---|---|
| CRITICAL | Skill may not work correctly | Must fix |
| IMPORTANT | Significantly impacts quality | Should fix |
| SUGGESTION | Nice-to-have improvement | Optional |

Present the improvement plan as a numbered list, grouped by severity. For each item:
- What's wrong
- Why it matters
- Proposed fix (specific, not vague)

Ask the user which items to apply.

### Step 7: Apply Approved Changes

Apply only the changes the user approved. For each change:
1. Use the Edit tool (not Write) for existing files
2. Show what changed (before/after for key sections)
3. Create new files only if needed (e.g., missing reference files)

### Step 8: Final Validation

Re-run the Phase 2 checklist against the updated skill. Confirm all CRITICAL and IMPORTANT items are now PASS.

Present final summary:
```
Refactoring Complete:
  Before: PASS: 8  |  FAIL: 5  |  WARN: 3
  After:  PASS: 15 |  FAIL: 0  |  WARN: 1

Changes applied: [list of changes]
```

---

## Quick Validation Checklist

Use this for rapid skill review (subset of full checklist):

- [ ] Folder: kebab-case, no spaces/underscores/capitals
- [ ] File: exactly `SKILL.md` (case-sensitive)
- [ ] Frontmatter: `---` delimiters present (opening + closing)
- [ ] Name: kebab-case, matches folder, max 64 chars, no "claude"/"anthropic"
- [ ] Description: includes WHAT + WHEN (trigger phrases) + scope boundaries
- [ ] Description: under 1024 chars, no XML tags
- [ ] Instructions: specific and actionable (no vague language)
- [ ] Instructions: critical info at the top
- [ ] allowed-tools: only necessary tools listed
- [ ] Error handling: common failures addressed
- [ ] Progressive disclosure: details in references/, not all inlined
