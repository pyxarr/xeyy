# 07 — Architecture

**Project:** Xeyy  
**Status:** Architecture planning / decision document  
**Phase:** Phase 1 — Architecture  
**Purpose:** Define the technical architecture Xeyy will build on before implementation begins.

> **Architecture principle:** This document converts the product requirements and validated research into explicit architectural boundaries and decisions. Where a decision has not been validated, it is marked as an open question rather than presented as fact.

---

## 1. Architecture Objective

Xeyy is a source-first, StyleX-native UI ecosystem for React applications.

The architecture must support the complete Xeyy workflow:

```text
Developer
   │
   ├── Documentation
   ├── CLI
   └── Registry
          │
          ▼
     Xeyy source
          │
          ├── Components
          ├── Primitives
          ├── Tokens
          ├── Themes
          ├── Blocks
          └── Templates
```

The architecture should make the following possible without creating unnecessary coupling:

- discover a component
- understand its implementation
- install its source into an application
- customize that source
- use StyleX-native styling
- use shared tokens and themes
- validate the component
- document it
- expose machine-readable metadata
- allow CLI and AI-assisted workflows to consume the same underlying information

---

# 2. Architectural Principles

## 2.1 Source-first

Xeyy components are fundamentally source artifacts.

The architecture must preserve the user's ownership and ability to inspect and modify component code.

Xeyy should not require a proprietary runtime layer merely to use its components.

## 2.2 StyleX-native

StyleX is part of the architectural foundation, not an implementation detail.

Component APIs, token architecture, styling conventions, theming, and build behavior must be designed around StyleX's actual capabilities and constraints.

## 2.3 TypeScript-first

TypeScript is first-class across the project.

Requirements include:

- strict TypeScript
- accurate component prop types
- useful editor inference
- exported types where appropriate
- no unnecessary `any`
- useful compiler errors

## 2.4 Small dependency surface

Prefer:

- zero unnecessary runtime dependencies
- mature dependencies
- explicit peer dependencies
- audited packages
- small dependency surfaces

A dependency should not be introduced merely to save a small amount of code.

## 2.5 Composable architecture

Lower-level primitives should remain reusable.

The dependency direction should generally move from foundational concerns toward higher-level UI:

```text
Tokens
   ↓
Primitives
   ↓
Components
   ↓
Blocks
   ↓
Templates
```

Higher-level layers should not become hidden dependencies of lower-level layers.

## 2.6 Machine-readable by design

The architecture should expose enough structured information for:

- CLI tooling
- documentation generation
- registry consumption
- validation
- AI-assisted development

AI support should be built from the same source and metadata system rather than becoming a disconnected feature.

---

# 3. High-Level Architecture

Xeyy consists of five major architectural surfaces.

```text
                         ┌──────────────┐
                         │   Developer  │
                         └───────┬──────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
             CLI              Docs            Registry
                │                │                │
                └────────────────┼────────────────┘
                                 ▼
                         Xeyy metadata/source
                                 │
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
        Components            Tokens              Themes
             │
             ▼
        Primitives
```

The important architectural property is that these surfaces should consume a **shared canonical source/metadata model** rather than maintaining separate definitions.

---

# 4. Repository Architecture

Xeyy will use a monorepo.

The repository should separate:

1. applications
2. reusable infrastructure packages
3. source-distributed UI
4. registry content
5. documentation
6. development tooling
7. tests
8. architecture and contributor documentation

Proposed structure:

```text
xeyy/
├── apps/
│   ├── docs/
│   ├── playground/
│   └── registry/
│
├── packages/
│   ├── cli/
│   ├── tokens/
│   ├── primitives/
│   ├── registry/
│   ├── config/
│   └── utils/
│
├── components/
│   ├── button/
│   ├── badge/
│   ├── input/
│   └── ...
│
├── registry/
│   ├── components/
│   ├── blocks/
│   ├── templates/
│   └── themes/
│
├── docs/
│   └── adr/
│
├── scripts/
├── tests/
│
├── AGENTS.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

This structure is the architectural baseline, not a claim that every directory must survive unchanged through implementation.

The distinction between `components/` and `packages/` is intentional:

- `components/` contains source intended for distribution/customization by users.
- `packages/` contains reusable Xeyy infrastructure.

---

# 5. Monorepo Tooling

## Decision

**Xeyy will use pnpm workspaces + Turborepo.**

### pnpm

pnpm will provide:

- package management
- workspace management
- dependency installation
- workspace linking

### Turborepo

Turborepo will provide:

- task orchestration
- build pipelines
- caching
- dependency-aware task execution
- faster local and CI workflows

The project will not use Nx as its monorepo orchestration layer.

This decision should be recorded in an ADR.

### ADR

```text
ADR-002: pnpm + Turborepo
Status: Accepted
```

---

# 6. Package Architecture

The package layer is infrastructure, not the primary distribution mechanism for UI source.

Potential packages:

```text
@xeyy/cli
@xeyy/tokens
@xeyy/primitives
@xeyy/registry
@xeyy/config
@xeyy/utils
```

The exact public package names remain subject to final naming/package-availability checks.

## 6.1 CLI

Responsible for project-facing commands such as:

```text
xeyy init
xeyy add
xeyy update
xeyy info
xeyy list
```

The final command surface is a product/tooling decision and should not be expanded unnecessarily.

## 6.2 Tokens

Provides the infrastructure needed for Xeyy's token architecture where a distributable package is useful.

The package must not become a reason to force every application into an opaque runtime abstraction.

## 6.3 Primitives

Provides reusable foundational behavior where shared primitives are architecturally justified.

The distinction between package-distributed primitives and source-distributed primitives must remain explicit.

## 6.4 Registry

Provides registry schemas, validation, parsing, and related infrastructure.

Registry content itself remains separate from registry infrastructure.

## 6.5 Config

Contains shared configuration where centralizing configuration reduces duplication without hiding important project behavior.

## 6.6 Utils

Utility code should remain small.

The package should not become a miscellaneous dumping ground for unrelated helpers.

---

# 7. Source-First Component Distribution

This is one of Xeyy's most important architectural boundaries.

The user-facing component should ultimately exist as application source rather than requiring a permanent dependency on an opaque Xeyy component runtime.

Conceptually:

```text
Xeyy Registry
      │
      │ add component
      ▼
User application
      │
      └── components/ui/button.tsx
```

The user can then:

- inspect the source
- modify it
- compose it
- integrate it with their own design system
- remove Xeyy-specific code when appropriate

Xeyy infrastructure remains available for discovery, updates, validation, and documentation.

---

# 8. Component Architecture

Every component must follow a predictable convention.

A component directory may contain:

```text
button/
├── button.tsx
├── button.test.tsx
├── button.stories.tsx
└── README.md
```

The exact supporting-file requirements depend on the component and testing/documentation strategy.

## Component responsibilities

A component should clearly define:

- public props
- variants
- StyleX styles
- accessibility behavior
- token usage
- composition behavior
- responsive behavior where relevant
- theme compatibility

Components should avoid hidden global styling contracts.

## Component boundary rule

A component should not depend on consumers reaching inside the component to manipulate descendants with undocumented selectors.

Styling and behavior should be expressed through explicit component contracts.

---

# 9. StyleX Architecture

StyleX is the styling foundation of Xeyy.

The intended model is:

```text
Component
    │
    ▼
StyleX style definitions
    │
    ▼
Tokens / variables
    │
    ▼
Theme
    │
    ▼
StyleX compilation
    │
    ▼
Generated CSS
```

Xeyy should favor StyleX's statically analyzable styling model and avoid introducing a runtime styling abstraction that undermines that model.

## StyleX rules

Xeyy components should use:

- explicit StyleX style definitions
- composable style contracts
- StyleX-compatible tokens/variables
- StyleX-supported pseudo states
- StyleX-supported media conditions
- typed component APIs

Advanced or experimental StyleX APIs should not automatically become V1 architectural dependencies.

Each API used by Xeyy must be verified against the StyleX version selected by the implementation.

---

# 10. Style Composition and Precedence

Xeyy must define a consistent rule for composing styles.

The component architecture should make style precedence predictable.

A conceptual model:

```text
Base style
    ↓
Variant style
    ↓
State style
    ↓
Responsive/conditional style
    ↓
Consumer-supported style override
```

The actual implementation must follow StyleX's documented composition and precedence behavior rather than inventing a parallel precedence system.

A component must not rely on undocumented CSS ordering tricks.

---

# 11. Token Architecture

Xeyy will use layered tokens.

```text
Primitive tokens
       ↓
Semantic tokens
       ↓
Component tokens
       ↓
Component styles
```

## 11.1 Primitive tokens

Represent foundational design values such as:

- color scales
- spacing
- typography values
- radii
- shadows
- sizing
- motion values

## 11.2 Semantic tokens

Represent meaning rather than raw values.

Examples conceptually include:

```text
background
foreground
muted
border
primary
destructive
focus
```

## 11.3 Component tokens

Represent component-specific design decisions.

For example:

```text
button background
button foreground
button radius
button height
```

This layering allows a theme to change semantic meaning without requiring every component to be rewritten.

---

# 12. Theme Architecture

Xeyy must support:

- light themes
- dark themes
- custom themes
- application-level overrides

The conceptual relationship is:

```text
Primitive tokens
       ↓
Semantic tokens
       ↓
Theme
       ↓
Component tokens
       ↓
Component styles
```

Theme architecture must remain compatible with StyleX's actual variable/theme mechanisms.

The implementation should not introduce an independent CSS-in-JS theme runtime simply to imitate another ecosystem.

---

# 13. Registry Architecture

The registry is a first-class architectural subsystem.

```text
registry/
├── components/
├── blocks/
├── templates/
└── themes/
```

Each registry item should contain enough metadata to describe what is being distributed.

Potential metadata includes:

```text
name
type
version
files
dependencies
registryDependencies
stylexRequirements
tokens
themeRequirements
documentation
examples
license
```

The final schema must be formally specified before implementation.

## Registry responsibilities

The registry must support:

- discovery
- installation
- validation
- metadata retrieval
- versioning
- dependency resolution
- documentation integration
- machine-readable consumption

Registry infrastructure and registry content should remain separate concerns.

---

# 14. CLI Architecture

The CLI is the primary project-facing interface to the registry.

Conceptually:

```text
CLI
 │
 ├── detect project
 │
 ├── resolve registry item
 │
 ├── validate requirements
 │
 ├── resolve dependencies
 │
 ├── write source
 │
 └── report result
```

The CLI should understand enough about the host project to avoid blindly modifying incompatible projects.

Important behaviors include:

- clear errors
- predictable output
- non-interactive operation where practical
- cross-platform behavior
- safe file handling
- conflict detection
- idempotent operations where practical

---

# 15. Update Model

Because components are source-owned, updates require a different model from normal package upgrades.

The architecture should distinguish between:

### Fresh installation

```text
registry → source
```

### Update

```text
registry
   ↓
new source
   ↓
compare with local source
   ↓
detect changes/conflicts
   ↓
developer decision
```

Xeyy should not silently overwrite user modifications.

The exact merge/update strategy remains an implementation decision that must be validated through prototyping.

---

# 16. Documentation Architecture

Documentation should be generated or assembled from the same canonical component and registry information wherever practical.

Conceptually:

```text
Component source
      │
      ├── Registry metadata
      ├── Documentation
      ├── Examples
      └── AI-readable metadata
```

This minimizes divergence between:

- what the docs say
- what the registry installs
- what the component actually implements

Documentation should cover:

- installation
- usage
- API
- variants
- accessibility
- theming
- customization
- StyleX considerations
- examples

---

# 17. AI / Agent Architecture

AI support is an architectural layer rather than a single documentation file.

The intended pipeline is:

```text
Source
  ↓
Structured metadata
  ↓
Registry
  ↓
CLI
  ↓
Documentation
  ↓
AI / Agent context
```

Potential machine-readable information includes:

- component identity
- API
- dependencies
- installation instructions
- StyleX requirements
- token usage
- theme requirements
- examples
- constraints
- accessibility information

Project-level guidance such as `AGENTS.md` can complement this system.

The goal is predictable machine consumption without making AI the only interface to Xeyy.

---

# 18. Framework Architecture

V1 targets:

- React
- TypeScript
- StyleX
- Next.js
- Vite

The core component architecture should not become coupled to Next.js.

Conceptually:

```text
                    Xeyy Core
                 /      |      \
             React   TypeScript  StyleX
                │
          ┌─────┴─────┐
          ▼           ▼
       Next.js       Vite
```

Framework-specific behavior belongs at integration boundaries.

React Native is explicitly outside V1.

---

# 19. Build Architecture

The build system should be dependency-aware:

```text
Source
   ↓
Type checking
   ↓
StyleX compilation
   ↓
Build
   ↓
Unit/component tests
   ↓
Accessibility checks
   ↓
Registry validation
   ↓
Release
```

Turborepo should orchestrate these tasks according to package dependencies.

The exact StyleX compiler/bundler integration must be validated against the selected versions of React, Next.js, Vite, TypeScript, and StyleX before implementation is considered stable.

---

# 20. Testing Architecture

Testing should exist at multiple levels.

```text
Component tests
      ↓
Accessibility tests
      ↓
Integration tests
      ↓
Visual tests
      ↓
CLI tests
      ↓
Registry validation
```

Not every component requires every test type, but the project's Definition of Done must determine which checks are mandatory.

Testing infrastructure should be reusable across the monorepo.

---

# 21. Dependency Boundaries

The dependency direction should remain explicit.

Preferred:

```text
tokens
   ↓
primitives
   ↓
components
   ↓
blocks
   ↓
templates
```

Infrastructure should not create circular dependencies.

For example:

```text
❌ tokens → components
❌ primitives → CLI
❌ components → docs application
❌ registry content → docs application
```

Applications may consume packages, but reusable packages should not depend on an application.

---

# 22. Security and Supply Chain

The source-first model creates an important security boundary: installing a component means introducing source code into another project.

Therefore registry architecture must eventually address:

- schema validation
- dependency validation
- malicious or unexpected source
- registry trust
- version integrity
- package/dependency risks
- safe installation behavior

The CLI must avoid executing arbitrary component code merely to inspect or install metadata where that can be avoided.

---

# 23. Code Quality

The monorepo should enforce:

- strict TypeScript
- linting
- formatting
- consistent naming
- small components
- no dead code
- no unexplained magic numbers
- reproducible builds
- automated validation

The formatter decision between Prettier and Biome remains a tooling decision unless implementation research establishes a clear winner.

---

# 24. Architecture Decision Records

Major architectural decisions should live under:

```text
docs/adr/
```

Each ADR should contain:

```text
Context
Decision
Alternatives
Consequences
Status
```

Initial ADR set:

```text
ADR-001: Source-first distribution
ADR-002: pnpm + Turborepo
ADR-003: StyleX-native styling
ADR-004: Primitive architecture
ADR-005: Registry format
ADR-006: CLI architecture
ADR-007: Theme architecture
ADR-008: Licensing
ADR-009: AI metadata
```

Additional ADRs should be created whenever a decision materially affects the architecture.

---

# 25. Architectural Boundaries

The following boundaries are intentional:

### Xeyy infrastructure

```text
CLI
Registry infrastructure
Metadata
Documentation infrastructure
Build/test tooling
```

### Xeyy source

```text
Components
Primitives
Tokens
Themes
Blocks
Templates
```

### User application

```text
Installed component source
Application-specific tokens
Application-specific themes
Application composition
Business logic
```

Xeyy should not become the application's business-logic framework.

---

# 26. V1 Architecture Scope

V1 should focus on proving the architecture rather than maximizing component count.

Target:

- React
- TypeScript
- StyleX
- Next.js
- Vite
- tokens
- themes
- foundational primitives
- approximately 10–15 high-quality components
- registry
- CLI
- documentation
- templates/examples
- testing and accessibility foundations

React Native, visual builders, SaaS functionality, Figma replacement, and AI coding agents are outside V1.

---

# 27. Architecture Acceptance Criteria

Architecture is considered ready for implementation when:

- [ ] repository structure is approved
- [x] pnpm + Turborepo is selected
- [ ] package boundaries are approved
- [ ] source-distribution model is approved
- [ ] component structure is approved
- [ ] StyleX conventions are approved
- [ ] token hierarchy is approved
- [ ] theme model is approved
- [ ] registry schema is approved
- [ ] CLI architecture is approved
- [ ] documentation architecture is approved
- [ ] AI metadata architecture is approved
- [ ] dependency boundaries are approved
- [ ] build pipeline is approved
- [ ] testing strategy is approved
- [ ] security boundaries are documented
- [ ] required ADRs are created

---

# 28. Open Architecture Questions

The following should be resolved before implementation locks the architecture:

1. Exact final monorepo directory structure.
2. Which Xeyy capabilities require npm packages versus source distribution.
3. Whether primitives are source-distributed, package-distributed, or hybrid.
4. Exact registry schema.
5. Exact registry hosting architecture.
6. Exact CLI command surface.
7. Component file convention.
8. StyleX version and supported API surface.
9. Exact token implementation.
10. Exact theme implementation.
11. Next.js and Vite integration details.
12. Testing stack.
13. Visual testing stack.
14. Formatter choice.
15. Release/versioning workflow.
16. Update/merge strategy for modified source.
17. Registry security/integrity model.

These are intentionally open rather than being invented prematurely.

---

# 29. Final Architectural Position

Xeyy's architecture is built around one central idea:

> **The component source belongs to the developer; Xeyy provides the infrastructure that makes that source easy to discover, install, understand, customize, validate, document, and maintain.**

The architecture therefore treats:

- StyleX as the styling foundation
- source as the primary component artifact
- the registry as distribution infrastructure
- the CLI as the project interface
- tokens/themes as first-class design-system infrastructure
- documentation and metadata as shared information layers
- AI compatibility as a machine-readable extension of the same architecture
- pnpm + Turborepo as the monorepo foundation

The architecture is intentionally designed so that Xeyy can grow from a component ecosystem into broader StyleX developer infrastructure without requiring a fundamental rewrite of its core model.
