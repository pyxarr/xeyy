# 16 — Final Implementation Specification

**Project:** Xeyy  
**Status:** Pre-implementation specification  
**Date:** 2026-09-10

---

# 1. Implementation Objective

Build the smallest production-quality version of Xeyy that proves the core thesis:

> A React developer can initialize a StyleX project, install accessible source-owned components, customize them through StyleX-native tokens and themes, understand them through documentation, and safely maintain them without depending on a runtime Xeyy component package.

---

# 2. V1 Success Condition

V1 is successful when a developer can perform:

```text
create project
    ↓
xeyy init
    ↓
xeyy add button
    ↓
source appears locally
    ↓
component works
    ↓
developer changes variant/style
    ↓
StyleX compiles correctly
    ↓
xeyy docs button
    ↓
xeyy update
    ↓
local changes are preserved
```

This workflow is more important than component quantity.

---

# 3. Repository

Locked tooling:

```text
pnpm
Turborepo
TypeScript
```

Proposed top-level structure:

```text
xeyy/
├── apps/
│   ├── docs/
│   └── playground/
│
├── packages/
│   ├── cli/
│   ├── config/
│   ├── registry/
│   ├── tokens/
│   ├── primitives/
│   ├── utils/
│   └── types/
│
├── registry/
│   ├── components/
│   ├── blocks/
│   ├── templates/
│   └── registry.json
│
├── components/
│   └── examples/
│
├── docs/
│
├── tests/
│
├── tooling/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
└── README.md
```

This is an implementation starting point, not permission to create every directory immediately.

---

# 4. Package Responsibilities

## `packages/cli`

Responsible for:

- CLI commands;
- project detection;
- registry client;
- installation;
- update;
- diagnostics;
- JSON output.

Must not contain component implementations.

---

## `packages/types`

Shared TypeScript types for:

- registry metadata;
- component metadata;
- tokens;
- themes;
- CLI responses;
- diagnostics.

---

## `packages/registry`

Responsible for:

- schema definitions;
- registry validation;
- dependency resolution;
- metadata loading.

It should remain independent of terminal UI.

---

## `packages/tokens`

Responsible for:

- token definitions;
- semantic token contracts;
- theme contracts.

It must not contain component-specific implementation.

---

## `packages/primitives`

Only Xeyy-owned primitive wrappers or integration contracts that are genuinely reusable belong here.

Do not create wrappers merely to rename Base UI APIs.

---

## `packages/config`

Shared configuration and detection logic.

---

## `packages/utils`

Small generic utilities that do not justify independent packages.

---

# 5. Component Source Model

Components distributed to users should have self-contained source.

Example:

```text
button/
├── button.tsx
├── button.test.tsx
├── button.example.tsx
└── button.meta.json
```

Where possible, registry metadata should identify:

- source files;
- dependencies;
- primitive dependency;
- tokens;
- supported themes;
- accessibility notes;
- examples;
- version.

---

# 6. Component Implementation Contract

Every V1 component must satisfy:

```text
TypeScript
+
React
+
StyleX
+
accessible primitive behavior where needed
+
tokens
+
explicit variants
+
documented states
+
tests
+
example
+
metadata
```

---

# 7. StyleX Contract

Xeyy source must:

- use StyleX APIs intentionally;
- preserve static analyzability;
- avoid unnecessary dynamic style generation;
- avoid Tailwind-specific merging abstractions;
- keep styling contracts local and explicit;
- use token/theme variables for semantic values;
- document any advanced StyleX feature.

The implementation must be validated against the current supported StyleX version rather than assumptions from older versions.

---

# 8. Token Implementation

Token source should be separated conceptually into:

```text
primitive/
semantic/
component/
theme/
```

Example conceptual relationship:

```text
blue-500
    ↓
color-brand
    ↓
button-primary-background
```

The component should normally consume:

```text
button-primary-background
```

rather than directly consuming:

```text
blue-500
```

This allows themes to change semantic meaning without rewriting component logic.

---

# 9. Theme Implementation

V1:

- light;
- dark.

Required behavior:

```text
Theme
  ↓
semantic variables
  ↓
component styles
```

No component should contain duplicated light/dark implementation when a semantic token can express the difference.

---

# 10. Primitive Integration

Base UI is the preferred primitive layer for complex interactive components.

Example conceptual architecture:

```text
Xeyy Dialog
   │
   ├── Base UI behavior
   │
   ├── Xeyy component API
   │
   ├── StyleX styles
   │
   └── Xeyy semantic tokens
```

Xeyy should not fork primitive behavior without a clear reason.

---

# 11. V1 Component Set

Initial target:

### Foundation

- Button
- Input
- Label
- Textarea

### Selection

- Select
- Tabs

### Feedback

- Alert
- Progress
- Toast

### Overlay

- Dialog
- Popover
- Tooltip
- Dropdown Menu

Final component selection is frozen only after primitive compatibility testing.

---

# 12. CLI

Initial command contract:

```bash
xeyy init
xeyy add button
xeyy update
xeyy doctor
xeyy info button
xeyy docs button
xeyy search button
```

Every command should eventually support:

```text
--json
--help
```

Non-interactive automation must be possible.

---

# 13. `xeyy init`

Responsibilities:

1. detect framework;
2. detect package manager;
3. verify React/TypeScript;
4. verify StyleX configuration;
5. create/update Xeyy configuration;
6. initialize tokens/theme infrastructure;
7. validate the resulting project.

It must not blindly rewrite unrelated project configuration.

---

# 14. `xeyy add`

Responsibilities:

1. resolve item;
2. load metadata;
3. validate dependencies;
4. detect conflicts;
5. determine target files;
6. install required dependencies;
7. copy source;
8. update local metadata/configuration;
9. validate installation.

Failure must leave the project in a recoverable state.

---

# 15. `xeyy update`

The update algorithm should conceptually compare:

```text
upstream original
local current
new upstream
```

Then classify:

```text
unchanged → safe update
locally modified + upstream unchanged → preserve local
upstream modified + local unchanged → update
both modified → conflict
```

No destructive overwrite by default.

---

# 16. `xeyy doctor`

Checks:

- React;
- TypeScript;
- StyleX;
- framework;
- configuration;
- registry;
- dependencies;
- component metadata;
- token configuration;
- theme configuration.

Output:

```text
PASS
WARN
ERROR
```

JSON output should be available for agents and CI.

---

# 17. Registry

The registry must have:

```text
registry.json
```

plus item metadata.

Conceptual item:

```json
{
  "name": "button",
  "type": "component",
  "version": "0.1.0",
  "files": [],
  "dependencies": [],
  "registryDependencies": [],
  "stylex": {},
  "tokens": {},
  "theme": {},
  "accessibility": {},
  "docs": {},
  "license": {}
}
```

The exact schema is defined by Document 10 and must be validated before implementation.

---

# 18. Registry Trust

Registry content must be treated as untrusted input.

Before installation:

- validate paths;
- reject traversal;
- validate metadata;
- resolve dependencies;
- detect unsafe targets;
- require explicit handling for destructive conflicts.

---

# 19. Documentation

Documentation application should provide:

```text
Introduction
Getting Started
Installation
Tokens
Themes
Components
CLI
Registry
Customization
Accessibility
AI / Agents
Contributing
```

Each component page:

```text
Overview
Installation
Usage
API
Variants
States
Accessibility
Customization
Responsive behavior
Theming
Examples
Source
```

---

# 20. Machine-Readable Documentation

Every component should expose metadata suitable for tooling.

Minimum information:

```text
name
description
props
variants
states
dependencies
tokens
primitive
accessibility
examples
source
version
```

The canonical source for this information should be defined once and consumed by:

- docs;
- registry;
- CLI;
- agent tooling.

Avoid maintaining the same information independently in three places.

---

# 21. AGENTS.md

The repository should include agent guidance covering:

- architecture;
- StyleX rules;
- token rules;
- component conventions;
- testing;
- registry;
- CLI;
- forbidden patterns;
- validation commands.

The file must explain **how to work with Xeyy**, not merely advertise the project.

---

# 22. AI Validation

Create a benchmark after the first stable component/registry workflow.

Baseline:

```text
Task
→ agent using Xeyy docs/metadata
```

Comparison:

```text
Task
→ agent using ordinary project docs
```

Measure:

- correctness;
- accessibility;
- StyleX correctness;
- unnecessary changes;
- task completion;
- human intervention.

Do not market benchmark results before the experiment is completed.

---

# 23. Testing Architecture

## Component

- render;
- interaction;
- keyboard;
- focus;
- states;
- variants;
- theme.

## Accessibility

- automated accessibility assertions;
- keyboard navigation;
- focus behavior;
- ARIA contract.

## Visual

- screenshots or equivalent visual regression.

## CLI

- command behavior;
- invalid input;
- conflict behavior;
- JSON output;
- cross-platform paths.

## Registry

- schema;
- dependencies;
- installation;
- invalid metadata;
- malicious paths.

---

# 24. CI Pipeline

Minimum pipeline:

```text
install
→ typecheck
→ lint
→ unit tests
→ component tests
→ accessibility tests
→ build
→ registry validation
→ CLI tests
```

Later:

```text
E2E
→ visual regression
→ package publishing
```

---

# 25. Release Model

Initial versions:

```text
0.0.x  internal prototype
0.1.x  public experimental
0.2.x  expanding foundation
0.x    ecosystem development
1.0.0  stable V1
```

A stable 1.0 release requires the V1 acceptance checklist, not simply a component count.

---

# 26. Security Requirements

Never:

- execute arbitrary registry scripts;
- trust registry-provided target paths;
- silently overwrite files;
- install undeclared dependencies;
- hide dependency changes.

Always:

- validate;
- report;
- preserve user changes;
- expose provenance.

---

# 27. Dependency Policy

A dependency must have:

1. a clear responsibility;
2. acceptable license;
3. maintenance evidence;
4. compatibility with the supported environments;
5. a reason it cannot reasonably be implemented locally.

Avoid dependency accumulation.

---

# 28. Prototype Milestones

## P0 — Repository

Deliver:

- pnpm workspace;
- Turborepo;
- TypeScript;
- CI skeleton.

## P1 — StyleX

Deliver:

- StyleX compilation;
- Next.js example;
- Vite example;
- basic token/theme experiment.

## P2 — First Component

Deliver:

- Button;
- StyleX;
- variants;
- tests;
- docs;
- metadata.

## P3 — Registry

Deliver:

- schema;
- registry item;
- validation;
- static distribution.

## P4 — CLI

Deliver:

- init;
- add;
- info;
- doctor.

## P5 — Update

Deliver:

- source fingerprint;
- three-way comparison;
- conflict handling.

## P6 — Foundation Expansion

Deliver remaining V1 components.

## P7 — AI Benchmark

Deliver:

- agent instructions;
- structured metadata;
- benchmark;
- measured results.

---

# 29. First Implementation Experiment

The first real experiment should not be the entire component library.

Build:

```text
Button
+
tokens
+
theme
+
registry
+
CLI add
+
docs
```

Then test the complete path:

```text
registry
→ CLI
→ application
→ StyleX
→ component
→ customization
→ update
```

If this workflow is flawed, scaling components only multiplies the problem.

---

# 30. V1 Acceptance Criteria

## Product

- [ ] Clear positioning
- [ ] Clear target user
- [ ] User validation
- [ ] Competitive differentiation

## Technology

- [ ] React
- [ ] TypeScript
- [ ] StyleX
- [ ] Next.js
- [ ] Vite
- [ ] pnpm
- [ ] Turborepo

## Design system

- [ ] Tokens
- [ ] Themes
- [ ] Typography
- [ ] Color
- [ ] Spacing
- [ ] Responsive behavior
- [ ] Accessibility

## Distribution

- [ ] Registry
- [ ] CLI
- [ ] Add
- [ ] Update
- [ ] Conflict handling
- [ ] Validation

## Documentation

- [ ] Component docs
- [ ] API metadata
- [ ] Examples
- [ ] Customization docs
- [ ] Agent docs

## Quality

- [ ] Unit
- [ ] Integration
- [ ] E2E
- [ ] Accessibility
- [ ] Visual
- [ ] CI

## Open source

- [ ] License
- [ ] CONTRIBUTING
- [ ] CODE_OF_CONDUCT
- [ ] SECURITY
- [ ] Issue templates
- [ ] PR templates

---

# 31. Explicitly Deferred

Not part of the first implementation:

- hosted registry;
- private registry;
- marketplace;
- visual builder;
- AI agent;
- MCP;
- React Native;
- Vue;
- Svelte;
- hundreds of components;
- premium commerce;
- complex analytics.

---

# 32. Definition of Done for the First Vertical Slice

The first vertical slice is complete only when a clean Next.js or Vite project can:

1. initialize Xeyy;
2. install Button;
3. compile StyleX;
4. render correctly;
5. switch themes;
6. customize the component;
7. read its docs;
8. inspect metadata;
9. run validation;
10. update without losing local modifications.

This is the first meaningful proof of the Xeyy thesis.

---

# 33. Implementation Principle

Do not build infrastructure because it looks complete.

Build the smallest system that proves:

> **source ownership + StyleX + tokens + accessible primitives + registry + CLI + documentation**

work together as one developer experience.

Only expand after that workflow succeeds.
