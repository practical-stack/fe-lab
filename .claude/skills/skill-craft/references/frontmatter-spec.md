# YAML Frontmatter Specification

## Standard Fields (All Platforms)

| Field | Required | Description |
|---|---|---|
| `name` | Recommended | kebab-case, matches folder name, max 64 chars. Falls back to directory name if omitted. |
| `description` | Recommended | What it does + when to use it. Max 1024 chars. Falls back to first paragraph if omitted. |
| `license` | No | License identifier (e.g., `MIT`, `Apache-2.0`) |
| `compatibility` | No | Environment requirements (1-500 chars) |
| `metadata` | No | Custom key-value pairs (author, version, mcp-server, category, tags) |

## Claude Code-Specific Fields

| Field | Required | Default | Description |
|---|---|---|---|
| `allowed-tools` | No | All tools | Tools pre-approved without per-use confirmation. Comma-separated or space-separated. Supports scoped syntax: `Bash(gh *)` |
| `argument-hint` | No | None | Hint shown during `/` autocomplete. E.g., `"[issue-number]"`, `"[filename] [format]"` |
| `disable-model-invocation` | No | `false` | When `true`, only the user can invoke via `/skill-name`. Claude cannot auto-load. Description removed from context. |
| `user-invocable` | No | `true` | When `false`, hidden from `/` menu. Only Claude can invoke. |
| `context` | No | None | Set to `fork` to run in an isolated subagent (no parent conversation access). |
| `agent` | No | None | Subagent type for `context: fork`. Options: `Explore`, `Plan`, `general-purpose`, or custom agent name from `.claude/agents/` |
| `model` | No | Inherited | Force a specific model (e.g., `claude-sonnet-4-6`) |

## Invocation Matrix

| Configuration | User can invoke | Claude can invoke | Description in context |
|---|---|---|---|
| (default) | Yes | Yes | Always in context |
| `disable-model-invocation: true` | Yes | No | NOT in context |
| `user-invocable: false` | No | Yes | Always in context |

## Security Rules

**Allowed:**
- Any standard YAML types (strings, numbers, booleans, lists, objects)
- Custom metadata fields
- Long descriptions (up to 1024 characters)

**Forbidden:**
- XML angle brackets (`<` `>`) — security restriction (frontmatter appears in system prompt)
- Code execution in YAML (safe YAML parsing is enforced)
- Skills named with "claude" or "anthropic" prefix (reserved)

## Examples

### Minimal skill
```yaml
---
name: my-skill
description: What it does. Use when user says "trigger phrase".
---
```

### Full-featured Claude Code skill
```yaml
---
name: deploy-preview
description: >-
  Deploy a preview environment for the current branch. Use when user says
  "deploy preview", "preview env", or "staging deploy". Do NOT use for
  production deployments.
allowed-tools: Bash(gh *), Bash(npm *), Read, Glob
argument-hint: "[branch-name]"
disable-model-invocation: false
metadata:
  author: Team Name
  version: 1.0.0
---
```

### Side-effect skill (user-only invocation)
```yaml
---
name: send-notification
description: Send a Slack notification about deployment status.
allowed-tools: Bash(curl *)
disable-model-invocation: true
argument-hint: "[channel] [message]"
---
```

### Forked subagent skill
```yaml
---
name: codebase-audit
description: Run a comprehensive codebase audit.
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---
```
