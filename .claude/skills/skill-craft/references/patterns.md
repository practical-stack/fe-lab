# Skill Architecture Patterns

## Pattern Selection Matrix

| Pattern | Use When | Key Characteristic |
|---|---|---|
| Sequential Workflow | Multi-step process in specific order | Step dependencies, validation gates |
| Multi-MCP Coordination | Workflow spans multiple services | Phase separation, cross-MCP data passing |
| Iterative Refinement | Output quality improves with iteration | Quality criteria, refinement loops |
| Context-Aware Selection | Same outcome, different tools by context | Decision trees, fallback options |
| Domain-Specific Intelligence | Skill adds specialized knowledge | Embedded expertise, compliance rules |

## Choosing Your Approach

- **Problem-first:** "I need to set up a project workspace" — Skill orchestrates the right tools in the right sequence. Users describe outcomes; the skill handles tools.
- **Tool-first:** "I have Notion MCP connected" — Skill teaches Claude optimal workflows and best practices. Users have access; the skill provides expertise.

---

## Pattern 1: Sequential Workflow Orchestration

**Use when:** Users need multi-step processes in a specific order.

```markdown
### Step 1: Create Account
Call MCP tool: `create_customer`
Parameters: name, email, company

### Step 2: Setup Payment
Call MCP tool: `setup_payment_method`
Wait for: payment method verification

### Step 3: Create Subscription
Call MCP tool: `create_subscription`
Parameters: plan_id, customer_id (from Step 1)
```

**Key techniques:** Explicit step ordering, dependencies between steps, validation at each stage, rollback instructions for failures.

---

## Pattern 2: Multi-MCP Coordination

**Use when:** Workflows span multiple services.

```markdown
### Phase 1: Design Export (Figma MCP)
1. Export design assets from Figma
2. Generate design specifications

### Phase 2: Task Creation (Linear MCP)
1. Create development tasks
2. Attach asset links to tasks

### Phase 3: Notification (Slack MCP)
1. Post handoff summary to #engineering
```

**Key techniques:** Clear phase separation, data passing between MCPs, validation before next phase, centralized error handling.

---

## Pattern 3: Iterative Refinement

**Use when:** Output quality improves with iteration.

```markdown
### Initial Draft
1. Fetch data via MCP
2. Generate first draft

### Quality Check
1. Run validation script
2. Identify issues (missing sections, format errors)

### Refinement Loop
1. Address each issue
2. Re-validate
3. Repeat until quality threshold met
```

**Key techniques:** Explicit quality criteria, iterative improvement, validation scripts, know when to stop.

---

## Pattern 4: Context-Aware Tool Selection

**Use when:** Same outcome, different tools depending on context.

```markdown
### Decision Tree
1. Check file type and size
2. Determine best approach:
   - Large files (>10MB): cloud storage MCP
   - Collaborative docs: Notion/Docs MCP
   - Code files: GitHub MCP
   - Temporary files: local storage
```

**Key techniques:** Clear decision criteria, fallback options, transparency about choices.

---

## Pattern 5: Domain-Specific Intelligence

**Use when:** Skill adds specialized knowledge beyond tool access.

```markdown
### Before Processing (Compliance Check)
1. Fetch details via MCP
2. Apply domain rules
3. Document decision

### Processing
IF check passed: proceed with action
ELSE: flag for review, create case

### Audit Trail
- Log all checks and decisions
```

**Key techniques:** Domain expertise embedded in logic, compliance/validation before action, comprehensive documentation, clear governance.
