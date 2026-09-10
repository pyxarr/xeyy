# 08 — Xeyy Design System Specification

**Project:** Xeyy  
**Status:** Planning specification  
**Phase:** Phase 1 — Architecture / Design System  
**Purpose:** Define what makes a Xeyy component a Xeyy component before implementation begins.

---

# 1. Purpose

Xeyy is intended to be a source-first, StyleX-native UI ecosystem for React applications.

This document defines the design-system layer that sits on top of the architecture established in Doc 07.

It covers:

- design principles
- StyleX constraints
- primitives
- tokens
- themes
- typography
- color
- spacing
- sizing
- radius
- elevation
- motion
- layout
- responsive behavior
- component taxonomy
- V1 component inventory
- component anatomy
- APIs and variants
- interaction states
- accessibility
- Base UI integration
- customization
- documentation
- testing
- governance

The goal is not to imitate an existing design system. The goal is to establish a coherent system that uses the strengths of StyleX and accessible React primitives while preserving Xeyy's source-first model.

---

# 2. Design-System Objective

The Xeyy design system must make production UI development predictable.

A developer should be able to answer:

- What token should I use?
- What component should I use?
- How should I style a state?
- How should I create a variant?
- How should I customize the component?
- How does theming work?
- What accessibility behavior is expected?
- How does the component behave responsively?
- What source will the CLI install?
- What information can an AI agent inspect?

The design system should reduce decisions that every individual application would otherwise have to make repeatedly.

---

# 3. What Makes a Xeyy Component?

A Xeyy component is not defined only by its visual appearance.

A component qualifies as Xeyy when it follows the Xeyy component contract:

```text
                 Xeyy Component
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
   Accessible      StyleX-native      Typed API
    behavior          styling
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                Xeyy token system
                       │
                       ▼
                 Theme support
                       │
                       ▼
               Source ownership
                       │
                       ▼
              Registry metadata
```

Therefore a Xeyy component should have:

1. predictable React API
2. TypeScript types
3. StyleX-native styles
4. token-based styling
5. theme compatibility
6. accessible interaction behavior
7. explicit state handling
8. documented variants
9. tests appropriate to its complexity
10. registry metadata
11. source that users can inspect and customize

This is the core component contract.

---

# 4. Design Principles

## 4.1 Source ownership

The installed component belongs to the application developer.

## 4.2 Explicit over magical

Prefer explicit APIs and explicit styling contracts over hidden behavior.

## 4.3 Accessible by default

Accessibility is part of component architecture, not a post-processing step.

## 4.4 StyleX-native

Do not reproduce Tailwind or another styling system's architecture inside StyleX.

## 4.5 Token-driven

Components should derive visual decisions from the token system wherever a reusable design decision exists.

## 4.6 Composable

Components should be useful individually and composable with other components.

## 4.7 Predictable variants

Variants should be explicit, typed, documented, and finite.

## 4.8 Responsive by design

Responsive behavior should be considered during component design, not added after desktop styling is complete.

## 4.9 Minimal dependencies

Do not introduce dependencies without a clear architectural reason.

## 4.10 Machine-readable

Component behavior and metadata should be understandable by tooling and AI systems.

---

# 5. StyleX Design-System Constraints

StyleX is the styling foundation.

The design system must respect the actual capabilities of the StyleX version selected for implementation.

The system should favor:

- statically analyzable style definitions
- explicit style composition
- typed variables
- StyleX conditions
- StyleX themes where appropriate
- compile-time CSS extraction

The system must not assume that every CSS feature or runtime styling technique is available in the same form through StyleX.

Experimental StyleX APIs should not become V1 dependencies without explicit validation.

---

# 6. Primitive Architecture

Xeyy should distinguish between:

### Behavior primitives

Responsible primarily for interaction and accessibility.

Examples:

- dialog
- popover
- tooltip
- menu
- select
- tabs

### Visual primitives

Responsible primarily for consistent visual building blocks.

Examples:

- button
- input
- badge
- separator
- label

### Layout primitives

Responsible for structural composition.

Examples:

- stack
- inline
- container
- grid

The exact primitive inventory must remain intentionally small.

---

# 7. Base UI Integration

Where complex interactive behavior is required, Xeyy should prefer mature accessible primitives rather than rebuilding behavior unnecessarily.

Base UI is a major candidate for this layer because it provides unstyled React primitives focused on accessible interaction behavior.

The architectural model is:

```text
Base UI behavior
       ↓
Xeyy component contract
       ↓
Xeyy StyleX styles
       ↓
Xeyy tokens/themes
```

Xeyy should own:

- visual system
- styling
- token usage
- component API decisions
- documentation
- source distribution

Base UI, where used, can provide:

- interaction logic
- focus management
- keyboard behavior
- ARIA behavior

Xeyy must verify the specific Base UI APIs and licensing/dependency implications before implementation.

---

# 8. Token Architecture

The token hierarchy is:

```text
Primitive tokens
      ↓
Semantic tokens
      ↓
Component tokens
      ↓
Component styles
```

This hierarchy separates raw design values from design intent.

---

# 9. Primitive Tokens

Primitive tokens represent raw design values.

Categories:

```text
Color
Spacing
Sizing
Typography
Radius
Border
Shadow
Motion
Breakpoint
Layer
```

Primitive tokens should generally not be consumed directly by application components when a semantic token exists.

For example:

```text
❌ Button → blue-600

✅ Button → primary-background
```

This makes theme changes and design-system evolution easier.

---

# 10. Semantic Tokens

Semantic tokens express meaning.

Initial categories should include:

### Surfaces

- background
- surface
- surface-subtle
- surface-raised
- surface-inverse

### Content

- foreground
- foreground-muted
- foreground-subtle
- foreground-inverse

### Borders

- border
- border-muted
- border-strong
- border-focus

### Brand/interaction

- primary
- primary-foreground
- secondary
- secondary-foreground
- accent
- accent-foreground

### Status

- success
- success-foreground
- warning
- warning-foreground
- destructive
- destructive-foreground
- info
- info-foreground

The final token names must be established before implementation and should avoid unnecessary duplication.

---

# 11. Component Tokens

Component tokens represent design decisions local to a component.

For example:

```text
button-height
button-padding-inline
button-radius
button-font-weight
button-primary-background
button-primary-foreground
```

Component tokens should be introduced when they provide meaningful customization or prevent repeated hard-coded relationships.

Do not create a token for every literal value.

---

# 12. Token Ownership

The design system should establish clear ownership:

```text
Primitive token
    → design system

Semantic token
    → theme/design system

Component token
    → component/design system

Application-specific token
    → consuming application
```

The consuming application should be able to extend the system without modifying Xeyy's source repository.

---

# 13. Token Source and Generation

The research indicates that modern StyleX UI projects can use structured design-token sources and token-generation pipelines.

Xeyy should therefore evaluate a standards-based token source, potentially using the W3C Design Tokens Community Group format, together with a deterministic generation pipeline.

This is an architectural direction, not yet a final implementation decision.

Before implementation, the project must decide:

- canonical token source format
- generation tool
- generated output
- StyleX variable representation
- package/source distribution
- validation strategy

---

# 14. Color System

The color system should be semantic-first.

A theme should define meaning:

```text
background
foreground
primary
destructive
border
focus
```

rather than requiring components to know specific color scales.

A component should not encode assumptions such as:

```text
blue = primary
red = destructive
```

The semantic layer owns that mapping.

---

# 15. Light and Dark Themes

V1 must support at least:

- light theme
- dark theme

The architecture should allow additional themes.

Conceptually:

```text
                    Semantic tokens
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
         Light theme             Dark theme
              │                       │
              └───────────┬───────────┘
                          ▼
                    Components
```

Components should consume semantic variables rather than branching manually on light/dark mode.

---

# 16. Typography System

Typography should be tokenized.

Required dimensions:

- font family
- font size
- line height
- font weight
- letter spacing

The system should define semantic roles such as:

```text
display
heading
title
body
label
caption
code
```

The final scale must be selected during implementation/design validation rather than invented solely for this document.

---

# 17. Spacing System

Spacing should use a consistent scale.

Spacing should support:

- component internals
- component gaps
- section spacing
- layout spacing

Components should avoid arbitrary spacing values when an existing token communicates the intended relationship.

However, the system must not create excessive token granularity merely to eliminate every literal value.

---

# 18. Sizing System

Sizing should cover:

- control heights
- icon sizes
- touch targets
- container widths
- common content widths

Controls should have a small number of intentional sizes rather than dozens of arbitrary variants.

---

# 19. Radius System

The radius scale should support a coherent surface language.

Potential semantic levels:

```text
none
small
medium
large
full
```

The exact values must be determined during visual-system implementation.

Components should consume semantic/component radius tokens rather than hard-coded values wherever appropriate.

---

# 20. Border and Elevation System

Xeyy should prefer a restrained elevation model.

Primary visual hierarchy should come from:

1. surface/background relationships
2. borders
3. spacing
4. typography
5. limited shadows

Shadows should not become the default mechanism for every component.

The final elevation scale must be validated visually.

---

# 21. Motion System

Motion should be purposeful.

The system should define:

- duration tokens
- easing tokens
- enter transitions
- exit transitions
- emphasis transitions

Examples of appropriate motion:

- popover opening
- dialog appearance
- menu appearance
- accordion expansion
- loading feedback

Motion should not be applied merely because a component can animate.

---

# 22. Reduced Motion

Components with meaningful animation must provide reduced-motion behavior.

Conceptually:

```text
Normal motion
     │
     ├── user prefers motion → animated behavior
     │
     └── reduced motion → reduced/no animation
```

The implementation must use the StyleX-supported mechanism appropriate to the selected version.

---

# 23. Iconography

Icons should be consistent in:

- stroke/fill model
- visual weight
- sizing
- alignment
- accessibility behavior

Decorative icons should not unnecessarily become accessible announcements.

Meaningful icons must have an accessible name when required.

The exact icon library is an open decision.

---

# 24. Layout System

Xeyy should provide conventions rather than a massive layout framework.

Core layout concepts:

```text
Container
Stack
Inline
Grid
Center
Separator
```

These should be evaluated for V1 inclusion based on actual component needs.

---

# 25. Responsive System

Responsive behavior should use StyleX-supported media conditions.

Components should define behavior at the level where it matters.

Examples:

```text
desktop navigation → mobile navigation
wide dialog → constrained mobile dialog
multi-column grid → stacked grid
```

Components should not automatically introduce breakpoints simply because breakpoints exist.

---

# 26. Touch and Hover Behavior

Hover-only interactions must account for touch environments.

Where hover-specific behavior is used, Xeyy should follow the established StyleX authoring guidance for restricting hover behavior to environments that actually support hover.

The design system should avoid making essential functionality dependent on hover.

---

# 27. Component Taxonomy

The initial taxonomy:

### Foundations

- tokens
- themes
- typography
- icons

### Forms

- button
- input
- textarea
- checkbox
- radio
- switch
- select
- label
- field

### Feedback

- alert
- toast
- progress
- skeleton
- spinner

### Navigation

- tabs
- breadcrumb
- pagination
- menu

### Overlays

- dialog
- popover
- tooltip
- dropdown menu
- command

### Data display

- badge
- avatar
- card
- table
- separator

### Layout

- container
- stack
- grid
- separator

This is the taxonomy, not the V1 component list.

---

# 28. V1 Component Strategy

V1 should contain approximately 10–15 excellent components.

Selection criteria:

1. high utility
2. representative StyleX patterns
3. accessibility importance
4. composition value
5. ability to demonstrate theming
6. useful API surface
7. meaningful registry value
8. reasonable implementation complexity

V1 should not attempt to recreate an entire mature component ecosystem.

---

# 29. Proposed V1 Candidates

Initial candidate set:

```text
Button
Badge
Input
Textarea
Label
Card
Separator
Alert
Dialog
Popover
Tooltip
Dropdown Menu
Tabs
Select
Avatar
```

This is a candidate set for validation, not a final promise.

The final selection should account for:

- primitive dependencies
- Base UI coverage
- implementation complexity
- accessibility testing
- design-system coverage
- differentiation from existing StyleX libraries

---

# 30. Component Anatomy

A component should have a predictable anatomy.

Conceptually:

```text
Component
├── Root
├── Content
├── Label
├── Description
├── Indicator
└── Action
```

Not every component uses every slot.

The component should expose only meaningful structural parts.

Avoid exposing internal DOM details merely to provide customization points.

---

# 31. Component API

APIs should be:

- typed
- explicit
- composable
- minimal
- predictable

Avoid excessive boolean props.

Prefer finite variants where the design space is intentionally bounded.

For example:

```text
size
variant
disabled
loading
```

rather than dozens of independent styling flags.

---

# 32. Variant Architecture

Variants must have:

- explicit names
- TypeScript types
- documentation
- test coverage
- token mapping

A variant should represent a meaningful design-system state.

Bad:

```text
blue
blue2
blueLarge
customBlue
```

Better:

```text
primary
secondary
destructive
outline
ghost
```

The exact variants must be component-specific and should not blindly copy another library.

---

# 33. State Architecture

Interactive components should explicitly model relevant states.

Potential states:

```text
default
hover
focus
focus-visible
active
disabled
selected
checked
open
closed
loading
error
invalid
```

Not every component needs every state.

State styling should be expressed through StyleX-compatible conditions and component contracts.

---

# 34. Focus Architecture

Keyboard focus must be visible.

Xeyy should establish a consistent focus treatment through semantic tokens.

The design system should distinguish:

- focus
- focus-visible

where appropriate.

Focus indicators must not be removed simply to achieve a cleaner visual design.

---

# 35. Disabled and Loading States

Disabled components should:

- communicate disabled state visually
- expose correct semantic state
- prevent inappropriate interaction

Loading components should:

- communicate progress
- avoid accidental duplicate actions
- preserve layout where practical
- remain accessible

The exact behavior depends on the component.

---

# 36. Accessibility Architecture

Accessibility is part of the Definition of Done.

Requirements include:

- semantic HTML where possible
- keyboard access
- visible focus
- appropriate ARIA
- correct labels
- correct roles/states
- screen-reader behavior
- sufficient target size
- reduced-motion support where relevant
- appropriate contrast

Complex interactive behavior should preferably use tested primitives rather than being independently recreated.

---

# 37. Form Accessibility

Form components must establish relationships between:

```text
Label
   ↓
Control
   ↓
Description
   ↓
Error message
```

The API should make correct associations easy.

Validation state should be represented semantically rather than only through color.

---

# 38. Composition Architecture

Components should support composition without requiring consumers to override internal implementation details.

Preferred:

```text
<Dialog>
  <DialogTrigger />
  <DialogContent>
    ...
  </DialogContent>
</Dialog>
```

rather than:

```text
<Component internalSelectorOverride="..." />
```

Composition should be based on explicit component contracts.

---

# 39. Customization Model

The source-first model means customization should primarily happen by editing source.

Customization levels:

```text
Theme/token customization
        ↓
Component style customization
        ↓
Component API composition
        ↓
Direct source modification
```

Xeyy should not force consumers into a large configuration API merely to change visual details.

---

# 40. Style Override Policy

Consumer overrides must be intentional.

A component may expose a supported style-composition mechanism where necessary.

The implementation must follow StyleX's composition model.

Avoid recreating utility-class conflict resolution systems solely to support arbitrary style overrides.

---

# 41. Responsive Component API

Responsive behavior should generally remain inside the component or layout system.

Avoid APIs such as:

```text
mobilePadding
tabletPadding
desktopPadding
```

unless there is a compelling semantic reason.

Prefer token/StyleX responsive rules that preserve the component's conceptual API.

---

# 42. Documentation Standard

Every component should document:

```text
Purpose
Installation
Basic usage
API
Variants
States
Accessibility
Theming
Customization
Examples
```

Complex components should additionally document:

- keyboard interactions
- composition
- controlled/uncontrolled behavior
- responsive behavior
- limitations

---

# 43. Testing Standard

Component testing should cover behavior rather than implementation details.

Depending on complexity:

- rendering
- interaction
- keyboard behavior
- accessibility
- state changes
- variants
- theme behavior
- responsive behavior where testable

Visual testing should be used where visual regressions are important.

---

# 44. Visual Validation

A component is not complete merely because its unit tests pass.

Visual validation should check:

- alignment
- spacing
- typography
- state transitions
- theme appearance
- responsive behavior
- focus treatment
- disabled state
- dark mode
- reduced-motion behavior where applicable

Storybook or an equivalent development environment should be evaluated as part of the implementation architecture.

---

# 45. Component Definition of Done

A component is complete only when:

- [ ] implementation exists
- [ ] TypeScript types are accurate
- [ ] StyleX styling is used correctly
- [ ] tokens are used appropriately
- [ ] themes work
- [ ] variants are documented
- [ ] states are handled
- [ ] accessibility is reviewed
- [ ] keyboard behavior is tested where relevant
- [ ] responsive behavior is implemented where relevant
- [ ] reduced motion is handled where relevant
- [ ] tests exist
- [ ] examples exist
- [ ] documentation exists
- [ ] registry metadata exists
- [ ] dependency requirements are declared
- [ ] source can be installed/customized

---

# 46. Design-System Governance

A component should not enter the core library simply because someone wants it.

New components should be evaluated against:

```text
Is it broadly useful?
        ↓
Does it solve a repeated problem?
        ↓
Does it fit the design language?
        ↓
Can it be maintained?
        ↓
Does it add meaningful ecosystem value?
```

Components that are highly application-specific should generally remain outside the core system and may instead become examples, blocks, or templates.

---

# 47. Blocks and Templates

Blocks and templates are higher-level composition layers.

```text
Components
     ↓
Blocks
     ↓
Templates
```

They should demonstrate how Xeyy components compose in real applications.

Blocks should not become disguised application frameworks.

---

# 48. Differentiation

The research shows that Xeyy cannot differentiate merely by claiming:

- StyleX support
- source ownership
- Base UI usage
- tokens
- themes
- registry
- CLI

Existing projects already cover portions of this territory.

Xeyy's intended differentiation is the **cohesive integration** of these capabilities into a StyleX-native developer experience:

```text
StyleX
  +
Accessible primitives
  +
Source ownership
  +
Typed design tokens
  +
Themes
  +
Registry
  +
CLI
  +
Documentation
  +
Machine-readable metadata
```

The system should feel like one coherent StyleX ecosystem rather than a collection of independently assembled features.

---

# 49. Competitive Design-System Lessons

Research of the current ecosystem produces several important constraints.

## Kanso

Kanso demonstrates that StyleX can be paired with:

- Base UI
- design tokens
- Style Dictionary
- Storybook
- tests
- theming

Therefore these features alone are not a sufficient moat.

## RSX UI

RSX demonstrates that a smaller StyleX component library can provide:

- TypeScript
- accessibility-oriented components
- themes
- StyleX styling

Xeyy therefore needs stronger infrastructure and developer experience than simply another component catalog.

## shadcn-cssinjs

This project demonstrates that:

- shadcn-style source distribution
- Base UI
- StyleX
- registry-based installation

can already coexist.

Therefore Xeyy must differentiate at the ecosystem/infrastructure level.

## shadcn/ui

The current shadcn ecosystem demonstrates the importance of:

- source distribution
- registries
- CLI
- templates
- blocks
- machine-readable metadata
- AI/agent support

Xeyy should learn from the model without copying its Tailwind-specific implementation or branding.

---

# 50. Design-System Architecture Summary

The resulting architecture is:

```text
                 Xeyy Design System
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Tokens         Themes       Typography
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  StyleX styling
                         │
                         ▼
                Accessible primitives
                         │
                         ▼
                    Components
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
             Blocks             Templates
```

And surrounding infrastructure:

```text
Components
    │
    ├── Registry metadata
    ├── Documentation
    ├── Tests
    ├── Examples
    └── AI-readable information
             │
             ▼
            CLI
```

---

# 51. Open Decisions

The following remain open and should not be silently invented:

1. Exact token values.
2. Exact token naming convention.
3. W3C DTCG adoption.
4. Style Dictionary adoption.
5. Exact StyleX variable architecture.
6. Exact theme implementation.
7. Exact typography scale.
8. Exact color palette.
9. Exact spacing scale.
10. Exact radius scale.
11. Exact icon library.
12. Exact animation library, if any.
13. Exact Base UI dependency strategy.
14. Final V1 component list.
15. Exact layout primitive inventory.
16. Exact visual identity.
17. Storybook or alternative visual-development environment.
18. Visual regression tooling.
19. Component style-override API.
20. Exact registry metadata fields.

Each decision should be validated before implementation.

---

# 52. Design-System Acceptance Criteria

Doc 08 is ready for implementation when:

- [ ] token hierarchy is approved
- [ ] token naming is approved
- [ ] theme architecture is approved
- [ ] typography system is approved
- [ ] color system is approved
- [ ] spacing system is approved
- [ ] sizing system is approved
- [ ] radius system is approved
- [ ] motion system is approved
- [ ] icon strategy is approved
- [ ] primitive strategy is approved
- [ ] Base UI strategy is approved
- [ ] V1 components are selected
- [ ] component anatomy is approved
- [ ] component API conventions are approved
- [ ] variant conventions are approved
- [ ] state conventions are approved
- [ ] accessibility requirements are approved
- [ ] responsive conventions are approved
- [ ] customization model is approved
- [ ] testing model is approved
- [ ] visual validation model is approved

---

# 53. Final Position

Xeyy's design system should not attempt to win by having the largest component count.

The objective is to create a **deeply coherent StyleX-native system** in which:

```text
Tokens
  ↓
Themes
  ↓
StyleX
  ↓
Accessible primitives
  ↓
Components
  ↓
Blocks
  ↓
Templates
```

all follow the same conventions and feed the same:

```text
Registry
CLI
Documentation
Metadata
AI tooling
```

The defining property of a Xeyy component is therefore not its appearance.

It is the complete contract:

> **Accessible behavior + typed API + StyleX-native styling + token architecture + theme compatibility + source ownership + registry metadata + documentation + validation.**

That contract is the foundation for the implementation phase.
