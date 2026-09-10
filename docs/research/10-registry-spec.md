# 10 — Registry Specification

**Project:** Xeyy  
**Document:** Registry Specification  
**Status:** Research-backed planning specification  
**Scope:** Source registry model, schema, item types, dependencies, versions, distribution, validation, security, hosting, discovery, updates, and machine-readable metadata.

---

# 1. Registry Purpose

The Xeyy registry is the distribution layer for source-owned UI.

It must answer:

- What exists?
- What files make it up?
- What does it depend on?
- What StyleX requirements does it have?
- What tokens/themes does it use?
- Which version is this?
- How should it be installed?
- How should an AI agent understand it?
- What license governs it?

The registry is therefore more than a component index.

It is the machine-readable contract connecting:

```text
Source
 ↓
Metadata
 ↓
CLI
 ↓
Documentation
 ↓
Developer
 ↓
AI tooling
```

---

# 2. Research Baseline

Current shadcn registry architecture is the strongest directly relevant benchmark.

The current registry supports:

- root `registry.json`
- nested `include` files
- typed registry items
- dependencies
- registry dependencies
- files with target paths
- custom registries
- GitHub repositories as source registries
- schema validation
- registry discovery
- programmatic registry APIs
- machine-readable item metadata
- distribution beyond components

Sources:
- https://ui.shadcn.com/docs/registry
- https://ui.shadcn.com/docs/registry/registry-json
- https://ui.shadcn.com/docs/registry/github
- https://ui.shadcn.com/docs/registry/api-reference
- https://ui.shadcn.com/docs/changelog/2026-05-registry-include
- https://ui.shadcn.com/docs/changelog/2026-06-github-registries

This means Xeyy should not create a registry that only knows:

```json
{
  "name": "button"
}
```

The registry needs to become useful infrastructure.

---

# 3. Core Registry Principle

The registry is **source metadata**, not a replacement for source control.

A registry item should point to or contain source artifacts that can be inspected and installed.

The source remains authoritative.

---

# 4. Registry Layers

```text
Source registry
      ↓
Registry schema
      ↓
Registry items
      ↓
Dependency graph
      ↓
CLI resolution
      ↓
Installed source
```

The registry should be static-first.

A server should not be required for the basic ecosystem to function.

---

# 5. Static-First Architecture

V1 should prefer:

```text
Git repository
   ↓
static registry files
   ↓
CDN/static hosting
   ↓
CLI
```

Advantages:

- cheap
- cacheable
- mirrorable
- inspectable
- Git-native
- open-source friendly
- fewer operational dependencies

A hosted registry service can be added later.

---

# 6. Registry Repository Structure

Proposed:

```text
registry/
├── registry.json
├── components/
│   ├── button/
│   │   ├── registry.json
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   └── examples/
│   └── ...
├── blocks/
├── templates/
├── themes/
├── tokens/
├── hooks/
└── conventions/
```

The exact layout can change.

The important rule is predictable locality between metadata and source.

---

# 7. Root Registry

Conceptual:

```json
{
  "$schema": "...",
  "name": "xeyy",
  "homepage": "...",
  "version": "...",
  "items": []
}
```

For large registries, `include` should be considered so each category can maintain local metadata.

---

# 8. Registry Item Types

Initial candidate types:

```text
component
primitive
hook
token
theme
block
template
utility
config
rule
convention
```

Potential future:

```text
migration
codemod
workflow
agent-instruction
```

The type system should remain extensible.

---

# 9. Component Item

Conceptual:

```json
{
  "name": "button",
  "type": "component",
  "title": "Button",
  "description": "A production-ready button.",
  "category": "actions",
  "version": "0.1.0",
  "files": [],
  "dependencies": [],
  "registryDependencies": [],
  "stylex": {},
  "tokens": [],
  "accessibility": {},
  "examples": [],
  "documentation": {}
}
```

The actual schema must be finalized before implementation.

---

# 10. File Model

Each file should identify:

```text
path
type
target
```

Potential types:

```text
source
test
example
documentation
config
style
token
agent
```

A file target should be explicit when the destination differs from the default installation path.

---

# 11. Dependency Types

At minimum distinguish:

### Package dependencies

NPM dependencies required by installed source.

```text
dependencies
devDependencies
peerDependencies
```

### Registry dependencies

Other Xeyy registry items.

```text
registryDependencies
```

### Optional dependencies

Dependencies needed only for optional functionality.

---

# 12. Dependency Graph

Example:

```text
Dialog
 ├── Dialog primitive
 ├── Button
 └── tokens
```

The registry should resolve this graph before installation.

Circular registry dependencies must be rejected.

---

# 13. Dependency Validation

Validation should detect:

- missing items
- circular dependencies
- invalid versions
- incompatible framework
- incompatible StyleX version
- incompatible token schema
- conflicting files
- invalid package dependency specifications

---

# 14. StyleX Metadata

StyleX-specific metadata is a major opportunity.

Potential:

```json
"stylex": {
  "minVersion": "0.19.0",
  "features": [
    "create",
    "defineVars",
    "createTheme"
  ],
  "compiler": true,
  "conditions": [
    "hover",
    "focus-visible",
    "media"
  ]
}
```

This allows the CLI and agents to understand StyleX requirements before installation.

Exact fields must follow verified StyleX capabilities.

---

# 15. Token Metadata

Potential:

```json
"tokens": {
  "required": [
    "color.primary",
    "color.primaryForeground",
    "radius.md"
  ],
  "optional": []
}
```

This can help:

- docs
- validation
- theme generation
- AI
- migration tools

---

# 16. Theme Metadata

Potential:

```json
"theme": {
  "required": true,
  "tokens": [],
  "supportsDark": true
}
```

Theme metadata should describe requirements, not duplicate theme implementation.

---

# 17. Accessibility Metadata

Potential:

```json
"accessibility": {
  "keyboard": true,
  "focusManagement": true,
  "aria": true,
  "tested": true
}
```

This metadata should never be treated as proof of accessibility by itself.

It is descriptive metadata.

Actual accessibility remains a test/review responsibility.

---

# 18. Versioning

Registry items should be versioned.

Why:

```text
docs change
source changes
dependencies change
API changes
```

Source-owned components make explicit updates especially important.

A developer should know:

```text
Installed: 0.1.0
Latest:    0.2.0
```

before updating.

---

# 19. Version Semantics

Potential:

```text
major
minor
patch
```

Semantic versioning should apply where the component's API and behavior justify it.

The registry may use pre-1.0 versions during experimentation.

---

# 20. Provenance

Every registry item should eventually expose:

- registry
- version
- source revision
- license
- author/maintainer
- publication date
- dependencies

This helps users understand exactly what code they are installing.

---

# 21. License Metadata

Each item should declare its license where necessary.

Example:

```json
"license": {
  "type": "MIT",
  "copyright": "..."
}
```

Registry validation should ensure required license metadata is present.

Third-party components must retain required attribution.

---

# 22. Security Model

A registry distributes executable source.

Therefore registry security is a product-level concern.

Threats:

- malicious source
- compromised maintainer
- dependency confusion
- malicious target path
- path traversal
- hidden scripts
- dependency substitution
- compromised hosting

Mitigations:

- JSON schema validation
- source review
- protected publishing
- provenance
- path restrictions
- dependency review
- CI security checks
- signed/reproducible release artifacts where practical

---

# 23. File Target Security

Never allow:

```text
../../package.json
../../.env
```

or equivalent traversal.

Target paths must be normalized and restricted to intended project roots.

Absolute paths should be rejected unless explicitly and safely supported.

---

# 24. Registry Trust Levels

Potential levels:

```text
official
community
external
local
```

The CLI could display:

```text
Registry: Xeyy Official
Trust: Official
```

or:

```text
Registry: example.com
Trust: External
```

Trust labels must not be presented as cryptographic security guarantees.

---

# 25. External Registries

Xeyy should support external registries only after the core registry model is stable.

Potential syntax:

```bash
xeyy add @registry/item
```

or:

```bash
xeyy add https://registry.example.com/item
```

External registry support creates additional security and compatibility responsibilities.

---

# 26. Git-Based Registries

The current shadcn ecosystem demonstrates that a public GitHub repository can itself function as a source registry using a root registry definition.

This is attractive for Xeyy because it:

- keeps source and metadata together
- reduces infrastructure
- supports community registries
- makes forks/mirrors easier

Xeyy should evaluate Git-native registries as a first-class option.

---

# 27. Registry API

V1 can be static.

Potential endpoints later:

```text
GET /registry
GET /registry/button
GET /registry/dialog
GET /registry/search?q=form
```

But the CLI should not depend on a custom server if static registry files are sufficient.

---

# 28. Programmatic API

A reusable registry library may expose:

```text
resolveRegistry()
getItem()
searchItems()
validateRegistry()
resolveDependencies()
```

This can support:

- CLI
- docs
- tests
- AI tools
- IDE integrations

The API should be separate from terminal rendering.

---

# 29. Registry Search

Search dimensions:

- name
- title
- description
- category
- tags
- framework
- accessibility
- dependencies
- StyleX features
- version

Search should be deterministic and usable without AI.

---

# 30. Registry Discovery

Future registry directory:

```text
Official
Community
Organization
Private
```

Community registries should be clearly identified.

Security guidance should tell users to inspect external source before installation.

---

# 31. Machine-Readable Registry

The registry should be designed for agents.

An agent should be able to answer:

```text
What is this?
What files will be added?
What dependencies are needed?
Does it require StyleX?
What components does it depend on?
What accessibility behavior does it provide?
How is it customized?
```

without parsing arbitrary documentation prose.

---

# 32. Documentation Linkage

Registry items should link to:

- docs
- examples
- API
- source
- changelog
- migration notes

This avoids separate, manually maintained component identities.

---

# 33. Example Metadata

Conceptual complete item:

```json
{
  "$schema": "...",
  "name": "dialog",
  "type": "component",
  "version": "0.1.0",
  "title": "Dialog",
  "description": "Accessible modal dialog.",
  "category": "overlay",
  "files": [
    {
      "path": "dialog.tsx",
      "type": "source"
    },
    {
      "path": "dialog.test.tsx",
      "type": "test"
    }
  ],
  "registryDependencies": [
    "button"
  ],
  "dependencies": [
    "@base-ui/react"
  ],
  "stylex": {
    "minVersion": "0.19.0"
  },
  "tokens": [
    "surface",
    "foreground",
    "border",
    "radius"
  ],
  "theme": {
    "supportsDark": true
  },
  "accessibility": {
    "keyboard": true,
    "focusManagement": true
  }
}
```

This is illustrative, not the final schema.

---

# 34. Registry Validation

CI should validate:

- JSON schema
- unique names
- file existence
- file path safety
- dependency existence
- version validity
- license metadata
- documentation references
- examples
- source/test consistency

---

# 35. Registry Build

Potential process:

```text
source registry
      ↓
validate
      ↓
resolve includes
      ↓
resolve metadata
      ↓
generate distributable index
      ↓
publish
```

A generated registry can improve consumption, but source metadata should remain authoritative.

---

# 36. Registry Update Strategy

Updates must preserve source ownership.

Registry versions should never imply that installed code changes automatically.

The user explicitly chooses:

```bash
xeyy update button
```

---

# 37. Registry and Blocks

A block can depend on multiple components:

```text
dashboard-block
 ├── card
 ├── button
 ├── input
 ├── table
 └── dialog
```

The registry should represent this dependency graph.

---

# 38. Registry and Templates

Templates are larger installation units.

They may include:

- multiple components
- tokens
- themes
- configuration
- routes
- example data

Templates require stricter validation because they can modify many files.

---

# 39. Registry and Agent Instructions

Future registry items may distribute:

```text
AGENTS.md
project conventions
testing rules
StyleX rules
```

The current shadcn GitHub registry model already demonstrates that registries can distribute project conventions and agent files.

Xeyy should support this only with explicit, visible installation behavior.

---

# 40. Registry Acceptance Criteria

- [ ] root schema defined
- [ ] item schema defined
- [ ] file schema defined
- [ ] dependency model defined
- [ ] version model defined
- [ ] StyleX metadata defined
- [ ] token metadata defined
- [ ] theme metadata defined
- [ ] license metadata defined
- [ ] security validation defined
- [ ] static hosting works
- [ ] CLI consumes registry
- [ ] machine-readable output works
- [ ] registry CI validates all items
- [ ] external registry policy documented

---

# 41. Final Registry Position

Xeyy's registry should become the **canonical machine-readable description of its source ecosystem**.

It should not merely answer:

> “Where is button.tsx?”

It should answer:

> “What is Button, what does it require, what StyleX/token/theme assumptions does it make, what source will be installed, how is it tested, how is it documented, and how can tooling safely operate on it?”

That is the registry layer that can eventually support CLI, docs, IDEs, automation, and AI agents from one source of truth.
