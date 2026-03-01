# Claude Code-Specific Skill Features

## $ARGUMENTS — Argument Substitution

`$ARGUMENTS` is replaced with all arguments passed when invoking a skill via `/skill-name arg1 arg2`.

| Variable | Description | Example |
|---|---|---|
| `$ARGUMENTS` | All arguments as a single string | `/greet hello world` -> `"hello world"` |
| `$ARGUMENTS[N]` | 0-based positional access | `$ARGUMENTS[0]` -> `"hello"` |
| `$N` | Shorthand for `$ARGUMENTS[N]` | `$0` -> `"hello"`, `$1` -> `"world"` |

**Fallback:** If `$ARGUMENTS` is NOT present anywhere in skill content but user passes arguments, Claude Code appends `ARGUMENTS: <value>` to the end automatically.

```markdown
Migrate the $0 component from $1 to $2.
# /migrate-component SearchBar React Vue
# -> "Migrate the SearchBar component from React to Vue."
```

## !`command` — Dynamic Context Injection

The `!`command`` syntax executes shell commands **before** skill content is sent to Claude. This is preprocessing — Claude only sees the output, not the command.

```markdown
## Current branch context
- Git status: !`git status --short`
- Recent commits: !`git log --oneline -5`
- Changed files: !`git diff --name-only`
```

**Execution order:**
1. Each `!`command`` runs immediately at skill load time
2. The command's stdout replaces the placeholder
3. Claude receives the fully-rendered prompt

## context: fork — Isolated Subagent Execution

Setting `context: fork` runs the skill in an isolated subagent. The subagent has NO access to the parent conversation history.

```yaml
context: fork
agent: Explore  # Options: Explore, Plan, general-purpose, or custom agent
```

**When to use:** Read-only analysis, codebase exploration, tasks that shouldn't see prior conversation.

**Important:** `context: fork` only makes sense for skills with explicit task instructions. If your skill only contains guidelines (e.g., "follow these API conventions"), the subagent receives guidelines but no actionable prompt.

## disable-model-invocation — User-Only Invocation

```yaml
disable-model-invocation: true
```

When `true`: only the user can invoke via `/skill-name`. Claude cannot auto-load. The skill's description is completely removed from context, so Claude doesn't even know the skill exists.

**Use for:** Side-effect workflows like `/commit`, `/deploy`, `/send-notification` — actions that should only happen when explicitly requested.

## allowed-tools — Tool Scoping

```yaml
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
```

Limits which tools Claude can use when a skill is active, pre-approved without per-use confirmation.

**Scoped tool syntax** for finer control:
```yaml
allowed-tools: Bash(gh *), Bash(npm *), Read, Glob
# Only allows Bash commands starting with "gh" or "npm"
```

## ${CLAUDE_SESSION_ID} — Session ID Substitution

```markdown
Log output to logs/${CLAUDE_SESSION_ID}.log
```

Replaced with the current session ID. Useful for session-specific file creation or logging.

## argument-hint — Autocomplete Hint

```yaml
argument-hint: "[create | refactor <path>]"
```

Displayed during `/` autocomplete to hint at expected arguments. Purely cosmetic — does not enforce argument structure.
