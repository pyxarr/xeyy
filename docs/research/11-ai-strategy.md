# 11 — AI Strategy

**Project:** Xeyy  
**Document:** AI Strategy and Agent Architecture  
**Status:** Research-backed strategy  
**Scope:** AI-assisted development, machine-readable metadata, agent workflows, benchmarks, safety, documentation, CLI integration, registry integration, and future tooling.

---

# 1. Executive Summary

Xeyy should treat AI compatibility as a **research hypothesis and infrastructure opportunity**, not an unsupported marketing claim.

The thesis is:

> A source-first, explicit, structured StyleX ecosystem may provide useful conditions for coding agents because components, APIs, dependencies, tokens, conventions, and installation procedures can be represented explicitly.

That hypothesis must be tested.

Xeyy should not claim:

> “StyleX is better for AI.”

unless a defined benchmark demonstrates it.

The Master Blueprint correctly requires any such claim to specify:

- task
- benchmark
- methodology
- comparison
- sample size
- limitations

This document therefore separates:

1. AI infrastructure we can build objectively.
2. AI performance claims that require experiments.

---

# 2. Research Context

The current shadcn ecosystem has already moved significantly toward agent-oriented tooling.

Its current CLI provides project/component context through `info`, documentation/context through `docs`, machine-readable registries, presets, and registry distribution of project conventions and agent instructions.

The current shadcn registry can distribute not only components but also:

- hooks
- utilities
- design tokens
- configuration
- docs
- templates
- workflows
- rules
- agent instructions

Sources:
- https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- https://ui.shadcn.com/docs/registry/github
- https://ui.shadcn.com/docs/registry/api-reference

Therefore “AI-friendly docs” alone are no longer differentiated.

Xeyy's AI strategy must integrate deeply with StyleX-specific structure.

---

# 3. AI Goals

## Goal 1 — Make Xeyy easy for agents to understand

An agent should be able to inspect:

- project conventions
- component metadata
- APIs
- dependencies
- tokens
- themes
- accessibility requirements
- installation commands

## Goal 2 — Make Xeyy safe for agents to modify

Agents should receive explicit boundaries.

## Goal 3 — Make Xeyy installable through automation

CLI JSON output and registry APIs should not require terminal scraping.

## Goal 4 — Measure the hypothesis

Run controlled benchmarks against alternatives.

---

# 4. AI Architecture

```text
             Agent
               │
               ▼
         Project context
               │
        ┌──────┼──────┐
        ▼      ▼      ▼
     AGENTS  CLI   Registry
       │      │      │
       └──────┼──────┘
              ▼
        Structured metadata
              │
              ▼
          Xeyy source
              │
              ▼
          StyleX/React
```

The AI layer should not become a separate database that duplicates the registry.

---

# 5. Canonical Information Model

The canonical source should be:

```text
Component source
+
Registry metadata
+
Documentation
+
Project conventions
```

AI-specific representations should be generated from these wherever possible.

Avoid maintaining:

```text
source version A
docs version B
AI docs version C
```

because they will drift.

---

# 6. AGENTS.md

A project-level `AGENTS.md` should explain:

- Xeyy architecture
- StyleX rules
- token rules
- component conventions
- accessibility requirements
- testing commands
- registry usage
- prohibited patterns

Example:

```text
# Xeyy Development Rules

Use Xeyy components when an appropriate component exists.

Use StyleX for styling.

Prefer semantic tokens over raw color values.

Do not bypass component accessibility behavior.

Run typecheck and tests before completing a change.
```

The final file should be framework-neutral where possible.

---

# 7. Component Metadata for Agents

Each registry item should expose:

```text
name
purpose
API
variants
states
dependencies
registry dependencies
StyleX requirements
tokens
themes
accessibility
examples
installation
customization
```

This reduces the need for an agent to infer architecture from source alone.

---

# 8. CLI as an Agent Interface

The CLI should expose machine-readable commands.

Examples:

```bash
xeyy list --json
xeyy info button --json
xeyy search dialog --json
xeyy doctor --json
xeyy add dialog --dry-run --json
```

The JSON schema should be stable.

Agents should not have to scrape colored terminal output.

---

# 9. Agent Workflow

Example:

```text
User:
Build a settings dialog.

Agent:
1. Read project instructions.
2. Inspect Xeyy registry.
3. Search for dialog.
4. Read dialog metadata.
5. Inspect dependencies.
6. Install dialog.
7. Search for input/button.
8. Compose the interface.
9. Use semantic tokens.
10. Run typecheck.
11. Run tests.
12. Run accessibility checks.
13. Present changes.
```

This is an architectural target, not a claim that agents already perform it reliably.

---

# 10. StyleX-Specific Agent Rules

Agents should be instructed to:

- use StyleX for styling
- prefer existing Xeyy tokens
- avoid arbitrary colors when semantic tokens exist
- respect StyleX static-analysis constraints
- use supported StyleX APIs only
- avoid undocumented selector behavior
- preserve style composition semantics
- respect theme architecture
- avoid introducing alternate CSS-in-JS systems

---

# 11. Source Ownership and AI

Source ownership has a useful AI property:

```text
Agent
 ↓
reads actual component
 ↓
modifies actual component
 ↓
tests actual component
```

There is no opaque component package hiding implementation details.

However, source ownership alone does not prove better AI performance.

That remains an empirical question.

---

# 12. AI Safety

Agents should not:

- blindly overwrite components
- silently upgrade dependencies
- install unknown external registry items
- bypass accessibility logic
- remove tests
- remove tokens
- replace StyleX with arbitrary CSS without justification
- disable compiler validation
- modify registry metadata to hide changes
- execute untrusted registry code
- commit secrets

---

# 13. Change Safety

AI-generated modifications should be reviewed through:

```text
git diff
typecheck
lint
tests
accessibility
build
```

The system should make these checks easy to run.

---

# 14. AI Benchmark Hypothesis

Primary hypothesis:

> Structured source-first StyleX metadata and conventions can reduce coding-agent errors when agents build or modify UI.

Secondary hypotheses:

1. Explicit component metadata reduces invalid API usage.
2. Registry dependency metadata reduces installation mistakes.
3. Semantic token metadata reduces hard-coded design values.
4. Source ownership improves agent customization.
5. StyleX-specific rules reduce styling drift.
6. Machine-readable CLI output reduces tool-use errors.

---

# 15. Benchmark Design

## Task categories

### Component installation

```text
Add a dialog.
```

### Component composition

```text
Build a settings form using existing components.
```

### Customization

```text
Change the dialog to use the danger semantic token.
```

### Theming

```text
Add a dark theme variation.
```

### Modification

```text
Add a loading state to Button.
```

### Debugging

```text
Find why this component violates the design token convention.
```

---

# 16. Experimental Groups

Potential groups:

```text
A — Tailwind/shadcn
B — StyleX with minimal docs
C — Xeyy with structured metadata
D — CSS Modules
```

The experiment should compare information/tooling conditions rather than merely asking whether one CSS technology is “better.”

---

# 17. Metrics

Measure:

- task completion
- retries
- invalid API usage
- compile failures
- type errors
- test failures
- accessibility failures
- token violations
- StyleX violations
- unnecessary dependencies
- human corrections
- time to completion
- final code quality

---

# 18. Sample Size

The benchmark should use enough tasks to reduce the risk of conclusions being driven by one easy example.

A reasonable initial experimental design might use:

```text
10–30 tasks
multiple repetitions
multiple agents/models
```

The final sample size should be justified by the experiment rather than selected to produce a desired result.

---

# 19. Evaluation Rubric

Example:

| Category | Score |
|---|---:|
| Correctness | 0–5 |
| Type safety | 0–5 |
| Accessibility | 0–5 |
| StyleX compliance | 0–5 |
| Token usage | 0–5 |
| API correctness | 0–5 |
| Tests | 0–5 |
| Maintainability | 0–5 |

Total:

```text
40 points
```

The rubric should be published with benchmark results.

---

# 20. Benchmark Limitations

Results can be influenced by:

- model familiarity
- prompt quality
- tool access
- benchmark leakage
- task selection
- model version
- evaluator subjectivity
- repository maturity

Therefore benchmark results must never be presented as universal proof.

---

# 21. Documentation for AI

Component documentation should have a human-readable layer and a structured layer.

Human:

```text
# Dialog

Dialogs interrupt the current task...
```

Machine-readable:

```json
{
  "component": "dialog",
  "parts": [],
  "dependencies": [],
  "keyboard": {},
  "tokens": []
}
```

The structured representation should be generated from canonical metadata where possible.

---

# 22. AI-Friendly Examples

Examples should be:

- short
- canonical
- copyable
- typed
- valid
- representative

Avoid dozens of near-identical examples.

One strong canonical example is often more useful than many ambiguous ones.

---

# 23. Error Context

AI tooling should expose errors with structured context.

Instead of:

```text
Build failed.
```

provide:

```json
{
  "code": "STYLE_X_CONFIG_MISSING",
  "message": "...",
  "cause": "...",
  "suggestions": []
}
```

This can help agents recover without guessing.

---

# 24. MCP

MCP should be considered a future integration.

Potential tools:

```text
search_components
get_component
get_component_docs
get_component_examples
list_tokens
inspect_theme
validate_project
install_component
```

However, the core Xeyy architecture should not depend on MCP.

The CLI and registry remain the underlying interfaces.

---

# 25. IDE Integration

Potential future integrations:

- VS Code
- Cursor
- GitHub Copilot
- Claude Code
- other agent environments

The core should remain provider-neutral.

---

# 26. Agent Skills

A future Xeyy skill could provide:

```text
When building UI:
1. inspect Xeyy
2. reuse components
3. use semantic tokens
4. preserve accessibility
5. validate StyleX
```

Skills should complement the registry, not replace it.

---

# 27. AI Installation

An agent should be able to do:

```bash
xeyy search dialog --json
xeyy info dialog --json
xeyy add dialog --yes --json
```

The JSON responses should contain enough information to continue the workflow.

---

# 28. AI Update Safety

An agent should not automatically update customized source.

Instead:

```text
xeyy update dialog --dry-run --json
```

returns:

```json
{
  "status": "conflict",
  "modifiedFiles": ["dialog.tsx"],
  "targetVersion": "0.2.0",
  "requiresReview": true
}
```

This gives the agent a safe decision point.

---

# 29. AI Documentation Quality

Documentation should answer:

1. What is this?
2. When should I use it?
3. How do I install it?
4. How do I compose it?
5. What are the variants?
6. What accessibility behavior exists?
7. What tokens does it use?
8. How do I customize it?
9. What are the constraints?
10. What should I not do?

---

# 30. AI Anti-Patterns

Avoid:

```text
"Just ask the AI."
```

The system should provide reliable deterministic infrastructure first.

Avoid:

```text
AI-generated API documentation
```

when source metadata can be authoritative.

Avoid:

```text
AI-only registry search
```

because deterministic search must remain available.

---

# 31. AI Security

Agents can amplify supply-chain risk.

Controls:

- registry trust levels
- source review
- dependency validation
- safe CLI writes
- explicit external registry warnings
- no automatic arbitrary code execution
- least-privilege workflows
- secret protection

---

# 32. AI Governance

AI-related claims should be reviewed before appearing in marketing.

Required evidence for claims such as:

> Xeyy makes agents more accurate.

should include:

- benchmark
- baseline
- methodology
- tasks
- sample
- evaluation criteria
- limitations
- reproducibility information

---

# 33. AI Roadmap

### Phase 1

- AGENTS.md
- structured registry metadata
- JSON CLI output

### Phase 2

- documentation context
- better diagnostics
- benchmark suite

### Phase 3

- agent workflows
- MCP evaluation
- IDE integrations

### Phase 4

- validated AI-specific advantages
- public benchmark reports

---

# 34. AI Success Metrics

Measure:

- agent installation success
- API correctness
- StyleX compliance
- token compliance
- accessibility compliance
- test pass rate
- human correction rate
- task completion time

Do not measure “AI friendliness” only through subjective impressions.

---

# 35. Final AI Position

Xeyy's AI strategy should be:

```text
Structured source
      ↓
Structured metadata
      ↓
Reliable CLI
      ↓
Deterministic validation
      ↓
Agent workflow
      ↓
Measured outcomes
```

The goal is not to make Xeyy an AI product.

The goal is to make Xeyy **good infrastructure for both humans and coding agents**, then test whether that architecture produces measurable advantages.
