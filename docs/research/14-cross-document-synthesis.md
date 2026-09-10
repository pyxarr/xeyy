# 14 — Cross-Document Synthesis & Decision Audit

**Project:** Xeyy  
**Former working name:** Stylerlex UI  
**Status:** Research synthesis / decision-lock document  
**Date:** 2026-09-10

> This document consolidates Research/Planning Documents 01–13 into a single decision layer. It does not replace those documents. Where an earlier document contains a proposal that conflicts with stronger evidence or a later decision, this document records the resolution and the reason.

---

## 1. Purpose

Documents 01–13 establish the research base, product requirements, architecture, design-system specification, CLI, registry, AI strategy, business model, and roadmap.

The remaining risk is no longer lack of ideas. The remaining risk is **inconsistency between documents**.

This audit therefore answers:

1. What is already sufficiently established?
2. Which decisions can now be locked?
3. Which proposals must remain conditional?
4. Which claims are evidence-backed versus hypotheses?
5. What must be implemented first?
6. What must explicitly not be built yet?
7. What must be experimentally validated before V1?

---

# 2. Executive Decision

Xeyy should proceed as a:

> **StyleX-native, source-first React UI ecosystem and developer infrastructure layer.**

The product should combine:

- accessible headless primitives;
- StyleX-native styling;
- typed design tokens and themes;
- source-owned components;
- a machine-readable registry;
- a CLI for installation and maintenance;
- documentation designed for both humans and coding agents;
- templates and blocks after the core component system is stable.

Xeyy should **not** initially compete on raw component count.

Its differentiation should come from the depth of integration between:

**StyleX → components → tokens → registry → CLI → documentation → AI/agents.**

---

# 3. Evidence Status

Each conclusion belongs to one of four classes.

| Class | Meaning |
|---|---|
| Confirmed | Supported by primary/current evidence or an explicit project decision |
| Strongly supported | Multiple credible signals support it, but it remains partly inferential |
| Hypothesis | Plausible product claim requiring validation |
| Unknown | Insufficient evidence; must not be presented as fact |

The project must not convert hypotheses into marketing claims without validation.

---

# 4. What Research 01–13 Establishes

## 4.1 StyleX

StyleX is a mature, actively maintained styling system with significant production use and an active open-source repository.

The current public repository shows active development and the 0.19.0 release added functionality including `@stylexjs/atoms`, ESLint 10 compatibility, fixes around `sx`, pseudo-element ordering, and theme resolution.

**Decision:** StyleX is technically credible enough to be the V1 styling foundation.

**Not decided:** Long-term market size or whether StyleX becomes a dominant ecosystem.

---

## 4.2 Existing StyleX Ecosystem

The ecosystem is not empty.

Relevant projects include:

- Kanso UI;
- RSX UI;
- shadcn-cssinjs;
- other smaller StyleX component experiments.

**Decision:** Xeyy cannot position itself as "the first StyleX component library."

The opportunity must instead be:

> a more complete, cohesive StyleX-native ecosystem and developer workflow.

---

## 4.3 shadcn/ui

shadcn/ui has evolved beyond a static component collection.

Its current ecosystem includes:

- source registries;
- GitHub registries;
- registry schemas;
- programmatic registry APIs;
- CLI capabilities;
- agent skills;
- documentation retrieval;
- templates;
- presets;
- registry distribution of components, hooks, tokens, workflows and agent instructions.

**Decision:** Xeyy should study shadcn as a **distribution and developer-experience model**, not merely as a component visual reference.

---

## 4.4 Base UI

Base UI provides unstyled React primitives focused on accessibility and complex interaction behavior and is MIT licensed.

**Decision:** Base UI is the preferred primitive foundation for the first Xeyy architecture, subject to implementation validation.

This means:

- Base UI owns complex behavior;
- Xeyy owns the visual/style contract;
- StyleX owns styling;
- Xeyy tokens/themes provide visual semantics.

---

# 5. Locked Product Direction

## 5.1 Product

Xeyy is not primarily:

- a Tailwind alternative;
- a CSS-in-JS framework;
- a visual builder;
- a hosted SaaS;
- a Figma replacement;
- an AI coding agent;
- a React Native library.

It is:

> a source-first UI ecosystem for React applications using StyleX.

---

# 6. Target Users

## Primary

1. StyleX developers.
2. React developers adopting StyleX.
3. Design-system engineers building React/StyleX systems.

## Secondary

1. AI-assisted developers.
2. Teams standardizing on StyleX.
3. Open-source React developers.
4. Startups needing a customizable UI foundation.

**Decision:** Do not optimize V1 equally for every persona.

The primary V1 user is:

> A React/TypeScript developer who wants production-quality accessible UI while retaining ownership of component source and using StyleX as the styling system.

---

# 7. Framework Scope

## V1

- React
- TypeScript
- Next.js
- Vite
- StyleX

## Explicitly deferred

- React Native
- Vue
- Svelte
- framework-independent UI distribution
- server-side framework expansion

The registry may technically be extensible, but the product should not promise broad framework support in V1.

---

# 8. Monorepo Decision

## Locked

- **Package manager:** pnpm
- **Monorepo orchestration:** Turborepo

Turborepo is responsible for:

- task orchestration;
- caching;
- dependency-aware execution;
- build/test/lint pipelines.

pnpm is responsible for:

- workspaces;
- dependency installation;
- package management;
- lockfile management.

The two responsibilities must not be conflated.

---

# 9. Source Ownership

Source ownership is a core product principle.

When a developer installs a component:

- the component source enters the application;
- the developer can inspect it;
- the developer can modify it;
- the developer does not depend on a runtime Xeyy component package for ordinary rendering.

This is central to the product.

---

# 10. Primitive Decision

## Proposed V1

**Base UI + StyleX**

Base UI supplies:

- interaction;
- focus behavior;
- keyboard behavior;
- ARIA behavior;
- complex state management.

Xeyy supplies:

- StyleX styling;
- tokens;
- themes;
- component composition;
- visual variants;
- documentation;
- examples.

### Boundary

A Xeyy component must not duplicate complex accessibility behavior already solved correctly by its primitive dependency unless there is a documented reason.

---

# 11. Component Architecture Decision

Components should be organized around:

1. primitive behavior;
2. semantic tokens;
3. explicit variants;
4. explicit states;
5. responsive behavior;
6. composition;
7. accessibility;
8. documentation.

Avoid:

- hidden global selectors;
- arbitrary descendant styling;
- runtime class-merging systems designed for Tailwind;
- excessive abstraction;
- component APIs that hide important StyleX behavior.

---

# 12. Token Decision

Xeyy will use a layered token model:

### Layer 1 — Primitive tokens

Examples:

- color scales;
- spacing;
- typography;
- radii;
- sizing;
- motion.

### Layer 2 — Semantic tokens

Examples:

- foreground;
- background;
- muted;
- destructive;
- focus;
- border;
- surface.

### Layer 3 — Component tokens

Examples:

- button height;
- button padding;
- dialog surface;
- input border;
- navigation spacing.

Components should consume semantic/component tokens rather than hard-code primitive values wherever practical.

---

# 13. Theme Decision

Themes should be implemented using StyleX-native variable/theme mechanisms rather than a parallel Tailwind-style CSS-variable convention.

Requirements:

- light theme;
- dark theme;
- custom theme extension;
- semantic token mapping;
- predictable inheritance;
- typed token definitions;
- no component-specific theme hacks.

---

# 14. Registry Decision

The registry is not just a download index.

It is the machine-readable representation of:

- component source;
- files;
- dependencies;
- registry dependencies;
- tokens;
- themes;
- accessibility information;
- documentation;
- examples;
- version;
- provenance;
- license;
- agent context.

Xeyy should learn from the current shadcn registry model while defining a **StyleX-specific metadata layer** rather than copying Tailwind-specific fields.

---

# 15. CLI Decision

The minimum CLI surface is:

```text
xeyy init
xeyy add <item>
xeyy update
xeyy doctor
xeyy info
xeyy docs
xeyy search
```

The CLI must support:

- interactive use;
- non-interactive use;
- JSON output;
- project detection;
- conflict detection;
- dependency resolution;
- registry validation;
- safe updates.

---

# 16. Update Model

Because source ownership means users can modify installed files, automatic overwrite is unsafe.

The V1 update model should therefore distinguish:

1. untouched local source;
2. locally modified source;
3. upstream changes;
4. conflicts.

A three-way comparison model is preferred.

The CLI should never silently destroy user modifications.

---

# 17. AI Strategy Decision

AI compatibility is a product hypothesis, not a guaranteed moat.

Xeyy should make its system easy for agents to understand by exposing:

- AGENTS.md;
- machine-readable registry metadata;
- component metadata;
- explicit component contracts;
- predictable file structure;
- CLI JSON output;
- documentation APIs;
- examples;
- StyleX-specific conventions;
- validation commands.

The hypothesis must be tested against baseline implementations.

---

# 18. AI Benchmark

The benchmark should measure tasks such as:

- install a component;
- customize a component;
- create a new component;
- change a variant;
- change a theme;
- debug a StyleX error;
- add responsive behavior;
- update a component without breaking local changes.

Metrics:

- task success;
- correctness;
- accessibility regressions;
- StyleX violations;
- unnecessary dependencies;
- number of human interventions;
- time to completion.

The benchmark must compare Xeyy against relevant alternatives rather than measuring Xeyy in isolation.

---

# 19. Business Decision

The open-source core should remain free.

Potential later revenue:

1. premium templates;
2. premium blocks;
3. premium themes;
4. hosted registry;
5. private registries;
6. enterprise support;
7. services;
8. sponsorship.

Do not monetize the core before adoption signals justify it.

---

# 20. Licensing

The license must be finalized before public V1.

The default direction is:

- open-source core;
- permissive license;
- dependency licenses tracked explicitly;
- third-party notices included where required.

This document does not constitute legal advice or final legal clearance.

A legal review is required before publication.

---

# 21. V1 Component Strategy

Do not begin with dozens or hundreds of components.

Target approximately **10–15 excellent components**.

Recommended categories:

### Foundations

- Button
- Input
- Label
- Textarea
- Select

### Feedback

- Alert
- Toast
- Progress

### Overlays

- Dialog
- Popover
- Tooltip

### Navigation / structure

- Tabs
- Dropdown Menu

The exact list remains subject to primitive coverage and implementation validation.

---

# 22. Blocks and Templates

Blocks/templates are later-stage distribution products.

Do not build them before:

- component APIs stabilize;
- registry works;
- tokens/themes work;
- documentation works;
- source ownership works.

---

# 23. Documentation Decision

Every component must have:

1. purpose;
2. installation;
3. source;
4. API;
5. variants;
6. states;
7. accessibility;
8. composition;
9. responsive behavior;
10. theming;
11. customization;
12. examples;
13. known limitations.

Documentation should have both:

- human-readable pages;
- machine-readable structured metadata.

---

# 24. Testing Decision

Required layers:

### Unit

Pure logic and utility behavior.

### Component/integration

Interaction and accessibility behavior.

### E2E

Real application workflows.

### Accessibility

Automated checks plus manual keyboard/screen-reader review where appropriate.

### Visual

Stable component snapshots or equivalent visual regression checks.

### Registry

Schema, dependency graph, metadata and installation tests.

### CLI

Cross-platform command behavior.

---

# 25. Security Decision

The highest-risk surface is source distribution.

Threats include:

- malicious registries;
- malicious registry dependencies;
- path traversal;
- arbitrary file overwrite;
- untrusted postinstall behavior;
- compromised dependencies;
- misleading provenance.

Required protections:

- path validation;
- restricted targets;
- registry trust model;
- dependency review;
- provenance metadata;
- lockfile integrity;
- no arbitrary shell execution from registry content;
- explicit confirmation for risky operations.

---

# 26. Build Order

The implementation order should be:

```text
1. Repository
2. StyleX + build pipeline
3. Token foundation
4. Theme foundation
5. Primitive integration
6. First component
7. Component test harness
8. Registry schema
9. Registry build/validation
10. CLI init/add
11. Documentation
12. Update model
13. Remaining V1 components
14. AI metadata
15. Benchmark
16. Templates/blocks
```

---

# 27. What Must NOT Be Built Yet

Do not start with:

- hosted SaaS;
- marketplace;
- hundreds of components;
- visual builder;
- complex cloud infrastructure;
- private registry;
- AI agent;
- MCP server as a primary feature;
- premium templates;
- advanced analytics;
- multi-framework support.

These are downstream capabilities.

---

# 28. Research-to-Implementation Gate

Before writing production components, all of the following must be true:

- [x] StyleX researched.
- [x] Competitive landscape researched.
- [x] shadcn architecture researched.
- [x] user research synthesized.
- [x] product requirements defined.
- [x] architecture drafted.
- [x] design system drafted.
- [x] CLI drafted.
- [x] registry drafted.
- [x] AI strategy drafted.
- [x] business model drafted.
- [x] roadmap drafted.
- [ ] final decisions locked.
- [ ] ADRs created.
- [ ] implementation specification approved.
- [ ] repository created.

---

# 29. Critical Remaining Unknowns

These must not be falsely marked solved:

1. Final project name/trademark clearance.
2. Final open-source license.
3. Exact Base UI integration boundaries.
4. Exact StyleX token/theme implementation after prototype.
5. Registry schema final shape.
6. Update/merge implementation.
7. Actual AI performance advantage.
8. User adoption.
9. Exact V1 component list.
10. Whether hosted infrastructure is ever economically justified.

---

# 30. Final Decision

The project is ready to move from **research** into **decision locking and implementation specification**.

The next documents are:

**15 — Architecture Decision Records**

followed by:

**16 — Final Implementation Specification**

Only then should production implementation begin.
