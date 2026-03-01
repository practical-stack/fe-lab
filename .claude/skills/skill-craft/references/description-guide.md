# Description Writing Guide

The `description` field is the most critical part of your skill's frontmatter. It determines when Claude auto-loads the skill. Get this right.

## Formula: [What] + [When] + [Key Capabilities]

```
[What it does] + [When to use / trigger phrases] + [Optional: negative triggers or scope]
```

## Good Examples

```yaml
# Specific + actionable + trigger phrases
description: >-
  Analyzes Figma design files and generates developer handoff documentation.
  Use when user uploads .fig files, asks for "design specs", "component
  documentation", or "design-to-code handoff".

# Clear value prop + triggers + scope
description: >-
  End-to-end customer onboarding workflow for PayFlow. Handles account creation,
  payment setup, and subscription management. Use when user says "onboard new
  customer", "set up subscription", or "create PayFlow account".

# Includes negative triggers to prevent over-triggering
description: >-
  Advanced data analysis for CSV files. Use for statistical modeling, regression,
  clustering. Do NOT use for simple data exploration (use data-viz skill instead).
```

## Bad Examples

```yaml
# Too vague — no trigger phrases
description: Helps with projects.

# Missing when-to-use — Claude can't decide when to load
description: Creates sophisticated multi-page documentation systems.

# Too technical, no user-facing triggers
description: Implements the Project entity model with hierarchical relationships.

# Describes implementation, not user outcomes
description: A folder containing YAML frontmatter and Markdown instructions that calls MCP tools.
```

## Trigger Phrase Guidelines

1. **Include exact phrases** users would say: "create a PR", "review my code", "deploy to staging"
2. **Include paraphrased variations**: "set up", "initialize", "configure" for setup tasks
3. **Mention file types** if relevant: ".csv files", "PDF documents", "Jupyter notebooks"
4. **Add negative triggers** if scope is ambiguous: "Do NOT use for..." prevents over-triggering
5. **Keep under 1024 characters** — be concise but thorough

## Debugging Trigger Issues

### Under-triggering (skill doesn't load when it should)
- Add more trigger phrases and keywords
- Include technical terms users might use
- Add paraphrased alternatives

### Over-triggering (skill loads for unrelated queries)
- Add negative triggers: "Do NOT use for..."
- Be more specific about the domain/scope
- Narrow file types or context

### Testing technique
Ask Claude: "When would you use the [skill-name] skill?"
Claude will quote the description back — adjust based on what's missing or misleading.
