# Skill Development Checklist

Use this checklist to validate skills at each development phase.

## Phase 1: Before You Start

- [ ] Identified 2-3 concrete use cases with trigger phrases
- [ ] Tools identified (built-in tools, MCP servers, or scripts)
- [ ] Planned folder structure (SKILL.md + references/ + scripts/ if needed)
- [ ] Decided on skill pattern (Sequential, Multi-MCP, Iterative, Context-Aware, Domain)

## Phase 2: During Development

### Folder & File Structure
- [ ] Folder named in kebab-case (no spaces, underscores, or capitals)
- [ ] File is exactly `SKILL.md` (case-sensitive)
- [ ] No `README.md` inside skill folder (documentation goes in SKILL.md or references/)

### Frontmatter
- [ ] YAML frontmatter has `---` delimiters (opening and closing)
- [ ] `name` field: kebab-case, matches folder name, max 64 chars
- [ ] `name` does NOT contain "claude" or "anthropic" (reserved)
- [ ] `description` includes WHAT the skill does
- [ ] `description` includes WHEN to use it (trigger phrases)
- [ ] `description` includes negative triggers if scope is ambiguous
- [ ] `description` is under 1024 characters
- [ ] No XML tags (`<` `>`) anywhere in frontmatter
- [ ] `allowed-tools` restricts to only necessary tools

### Instructions (Body)
- [ ] Instructions are clear, specific, and actionable
- [ ] Uses numbered steps for sequential workflows
- [ ] Critical instructions placed at the top
- [ ] Error handling included for common failure modes
- [ ] References clearly linked (not inlined if large)
- [ ] Progressive disclosure: SKILL.md focuses on core flow, details in references/

### Quality
- [ ] Examples provided for common scenarios
- [ ] Edge cases documented
- [ ] No ambiguous language ("validate things properly" -> specific validation rules)

## Phase 3: Before Release

### Triggering Tests
- [ ] Triggers on obvious task descriptions
- [ ] Triggers on paraphrased/alternative requests
- [ ] Does NOT trigger on unrelated topics
- [ ] Does NOT trigger on adjacent-but-different tasks

### Functional Tests
- [ ] Workflow completes end-to-end without errors
- [ ] Tool/MCP integrations work correctly
- [ ] Error handling produces helpful messages
- [ ] Edge cases handled gracefully

### Performance
- [ ] SKILL.md under 5,000 words (move detail to references/)
- [ ] No redundant content between SKILL.md and references
- [ ] Only loads reference files when needed (progressive disclosure)

## Phase 4: After Release

- [ ] Test in real conversations across different phrasings
- [ ] Monitor for under-triggering (skill doesn't load when it should)
- [ ] Monitor for over-triggering (skill loads for unrelated queries)
- [ ] Collect user feedback and iterate
- [ ] Update description and instructions based on observed patterns
