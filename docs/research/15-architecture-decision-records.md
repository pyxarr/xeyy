# 15 — Architecture Decision Records

**Project:** Xeyy  
**Status:** Decision-lock document  
**Date:** 2026-09-10

---

# ADR-001 — Product Direction

**Status:** Accepted

## Decision

Xeyy will be a StyleX-native, source-first React UI ecosystem.

## Context

The research shows that StyleX already has production credibility and that several component projects exist. Therefore, "StyleX component library" alone is insufficient differentiation.

## Consequences

Xeyy must integrate components, tokens, themes, registry, CLI, documentation and AI context as one system.

---

# ADR-002 — Source Ownership

**Status:** Accepted

## Decision

Installed components are copied into the consuming application as source.

## Rationale

Source ownership is central to the product philosophy and allows users to inspect and customize implementation.

## Consequences

Updates must be conflict-aware. Xeyy cannot assume it owns installed component files after installation.

---

# ADR-003 — Framework

**Status:** Accepted

## Decision

React is the only UI framework target for V1.

## Consequences

Component APIs, testing, documentation and templates optimize for React.

---

# ADR-004 — Framework Targets

**Status:** Accepted

## Decision

V1 explicitly supports:

- Next.js
- Vite

Other frameworks are deferred.

---

# ADR-005 — Language

**Status:** Accepted

## Decision

TypeScript-first.

JavaScript consumption may be possible, but the source and documentation are designed around TypeScript.

---

# ADR-006 — Package Manager

**Status:** Accepted

## Decision

pnpm.

## Responsibility

pnpm manages:

- workspaces;
- dependencies;
- lockfile;
- package installation.

---

# ADR-007 — Monorepo Orchestration

**Status:** Accepted

## Decision

Turborepo.

## Responsibility

Turborepo manages:

- task pipelines;
- caching;
- dependency-aware execution;
- build/test/lint orchestration.

---

# ADR-008 — Styling System

**Status:** Accepted

## Decision

StyleX is the native styling system.

## Rationale

The product exists specifically to make StyleX application development easier.

## Constraint

Xeyy must not introduce a competing styling abstraction that hides StyleX.

---

# ADR-009 — Primitive Foundation

**Status:** Accepted for V1 prototype

## Decision

Use Base UI as the primary headless primitive foundation.

## Rationale

Base UI provides complex accessible React behavior while allowing Xeyy to own visual styling.

## Validation

The prototype must validate:

- API fit;
- SSR/Next.js behavior;
- Vite behavior;
- TypeScript quality;
- StyleX integration;
- customization;
- bundle/build behavior;
- accessibility.

If the prototype fails critical criteria, this ADR may be reopened.

---

# ADR-010 — Token Architecture

**Status:** Accepted

## Decision

Three layers:

```text
Primitive tokens
      ↓
Semantic tokens
      ↓
Component tokens
```

Components should consume semantic/component tokens rather than primitive values wherever appropriate.

---

# ADR-011 — Theme Architecture

**Status:** Accepted

## Decision

Use StyleX-native variable/theme mechanisms.

## Requirements

- light;
- dark;
- custom extension;
- typed variables;
- semantic mapping;
- predictable inheritance.

---

# ADR-012 — Component API

**Status:** Accepted

## Decision

Component APIs should prioritize:

- semantic props;
- explicit variants;
- explicit state;
- composability;
- accessibility;
- predictable style composition.

Avoid Tailwind-specific merge conventions.

---

# ADR-013 — Registry

**Status:** Accepted

## Decision

Xeyy will use a machine-readable source registry.

Registry metadata must be StyleX-aware.

## Required concepts

- item identity;
- files;
- dependencies;
- registry dependencies;
- StyleX requirements;
- tokens;
- themes;
- accessibility;
- docs;
- examples;
- version;
- license;
- provenance.

---

# ADR-014 — Registry Distribution

**Status:** Accepted for V1 prototype

## Decision

Support a static-first registry.

The registry should be usable without requiring a hosted Xeyy backend.

## Rationale

This reduces infrastructure requirements and supports source ownership.

---

# ADR-015 — CLI

**Status:** Accepted

## Decision

Build a dedicated Xeyy CLI.

Initial commands:

```text
init
add
update
doctor
info
docs
search
```

The CLI must support JSON output for automation.

---

# ADR-016 — Updates

**Status:** Accepted

## Decision

Use a conflict-aware update model.

The CLI must distinguish upstream changes from local modifications.

## Rule

Never silently overwrite locally modified source.

---

# ADR-017 — Documentation

**Status:** Accepted

## Decision

Documentation is part of the product architecture, not a marketing afterthought.

Every component must expose structured and human-readable information.

---

# ADR-018 — AI Compatibility

**Status:** Accepted as a product experiment

## Decision

Xeyy will optimize its information architecture for coding agents.

This includes:

- AGENTS.md;
- structured component metadata;
- registry metadata;
- JSON CLI output;
- deterministic file structure;
- explicit conventions;
- documentation retrieval;
- validation commands.

## Important constraint

Do not claim that Xeyy is "better for AI" until benchmark evidence exists.

---

# ADR-019 — Open Source

**Status:** Accepted direction; final license pending legal decision

## Decision

The core will be open source.

## Consequence

Community contribution and source inspection are first-class requirements.

---

# ADR-020 — Monetization

**Status:** Deferred

## Decision

Do not put monetization requirements into the V1 core.

Potential later revenue:

- premium blocks;
- premium templates;
- premium themes;
- hosted registry;
- enterprise/private registry;
- support/services.

---

# ADR-021 — Component Count

**Status:** Accepted

## Decision

V1 targets approximately 10–15 high-quality components.

## Rationale

Quality and system coherence are more important than breadth.

---

# ADR-022 — Blocks

**Status:** Deferred

Blocks come after the core component system, registry and documentation are stable.

---

# ADR-023 — Templates

**Status:** Deferred

Templates come after the source-distribution workflow is validated.

---

# ADR-024 — Hosted Registry

**Status:** Deferred

A hosted registry is not required for the initial source-distribution model.

---

# ADR-025 — Private Registry

**Status:** Deferred

Private registry functionality is an enterprise-stage capability.

---

# ADR-026 — MCP

**Status:** Deferred

MCP may become useful later, but it is not a V1 architectural dependency.

---

# ADR-027 — Visual Builder

**Status:** Rejected for V1

Xeyy will not initially become a visual UI builder.

---

# ADR-028 — React Native

**Status:** Rejected for V1

React Native is outside the V1 scope.

---

# ADR-029 — Multi-framework

**Status:** Rejected for V1

Vue, Svelte and other framework targets are outside the initial product boundary.

---

# ADR-030 — Dependency Philosophy

**Status:** Accepted

Dependencies should be:

- necessary;
- maintained;
- appropriately licensed;
- justified;
- tested.

Avoid dependencies that exist only for convenience when native platform or existing project functionality is sufficient.

---

# ADR-031 — Security

**Status:** Accepted

The system must treat registry-installed code as a supply-chain surface.

Required:

- safe path handling;
- dependency validation;
- provenance;
- trust levels;
- no arbitrary registry-triggered shell execution;
- safe conflict handling.

---

# ADR-032 — Testing

**Status:** Accepted

V1 requires:

- unit tests;
- component/integration tests;
- accessibility checks;
- E2E coverage for critical flows;
- visual validation;
- CLI tests;
- registry validation;
- CI.

---

# ADR-033 — Build Order

**Status:** Accepted

Implementation order:

```text
repository
→ StyleX/build
→ tokens
→ themes
→ primitives
→ first component
→ tests
→ registry
→ CLI
→ docs
→ update model
→ component expansion
→ AI benchmark
```

---

# ADR-034 — Reopening Decisions

An ADR may be reopened when:

1. new primary evidence contradicts it;
2. implementation exposes a material technical failure;
3. user research invalidates the assumption;
4. security/legal requirements change;
5. a dependency becomes unsuitable.

Aesthetic preference alone is insufficient reason to reopen an architecture decision.

---

# Decision Register Summary

| ID | Decision | Status |
|---|---|---|
| 001 | StyleX-native source-first ecosystem | Accepted |
| 002 | Source ownership | Accepted |
| 003 | React | Accepted |
| 004 | Next.js + Vite | Accepted |
| 005 | TypeScript-first | Accepted |
| 006 | pnpm | Accepted |
| 007 | Turborepo | Accepted |
| 008 | StyleX | Accepted |
| 009 | Base UI | Prototype-accepted |
| 010 | Three-layer tokens | Accepted |
| 011 | StyleX-native themes | Accepted |
| 012 | Explicit component APIs | Accepted |
| 013 | Machine-readable registry | Accepted |
| 014 | Static-first registry | Prototype-accepted |
| 015 | Dedicated CLI | Accepted |
| 016 | Conflict-aware updates | Accepted |
| 017 | Structured documentation | Accepted |
| 018 | AI compatibility experiment | Accepted |
| 019 | Open-source core | Accepted direction |
| 020 | Monetization | Deferred |
| 021 | 10–15 V1 components | Accepted |
| 022 | Blocks | Deferred |
| 023 | Templates | Deferred |
| 024 | Hosted registry | Deferred |
| 025 | Private registry | Deferred |
| 026 | MCP | Deferred |
| 027 | Visual builder | Rejected V1 |
| 028 | React Native | Rejected V1 |
| 029 | Multi-framework | Rejected V1 |

---

# Final Gate

The project can proceed to implementation specification once:

- the final name is cleared;
- the license decision is completed;
- the Base UI prototype passes technical validation;
- registry schema is frozen for V1;
- first component list is frozen.
