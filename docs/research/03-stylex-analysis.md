# 03 — StyleX Analysis

**Project:** Xeyy  
**Status:** Technical research / validation  
**Purpose:** Understand StyleX's actual styling model, constraints, APIs, compilation behavior, and implications for Xeyy's architecture.

---

## 1. Executive Summary

StyleX is not simply another CSS-in-JS library.

Its architecture is built around static analysis, compilation, atomic CSS, deterministic composition, typed styling contracts, variables, themes, and predictable output.

That distinction is central to Xeyy.

Xeyy should not treat StyleX as a replacement syntax for Tailwind classes or runtime CSS-in-JS.

Instead:

> **Xeyy's component architecture should be designed around the constraints and strengths of StyleX itself.**

The most important technical consequence is that Xeyy needs explicit component style contracts.

---

## 2. What StyleX Is

StyleX is a styling system for React-oriented applications designed to combine:

- expressive styling
- type safety
- composability
- predictable precedence
- static extraction
- atomic CSS
- theming

Its model intentionally limits some forms of arbitrary CSS composition.

This is a feature, not merely a limitation.

It allows component systems to establish clearer styling contracts.

---

## 3. Current Status

The current npm release observed during research is:

```text
@stylexjs/stylex 0.19.0
```

The project remains actively maintained in its public GitHub repository.

Xeyy should record the exact release being targeted during implementation because StyleX APIs and experimental features can change.

---

## 4. Core Styling Model

A typical StyleX component defines styles with:

```tsx
const styles = stylex.create({
  root: {
    display: 'flex',
    padding: 16,
  },
});
```

The component then applies them through StyleX:

```tsx
<div {...stylex.props(styles.root)} />
```

Or through composition where appropriate.

The important point is that styles are represented as structured JavaScript objects rather than arbitrary runtime CSS strings.

---

## 5. Static Analysis

StyleX is designed for compile-time extraction.

For statically analyzable styles, StyleX can extract CSS during the build rather than generating styles dynamically at runtime.

This distinction should be expressed carefully:

> StyleX statically extracts statically analyzable styles into CSS during build processing.

Do not describe this as an absolute statement that StyleX never has runtime behavior under any circumstances.

---

## 6. Atomic CSS

StyleX's compilation model can generate atomic CSS declarations.

Conceptually:

```text
component styles
      ↓
StyleX compiler
      ↓
atomic declarations
      ↓
optimized CSS
```

Benefits can include:

- reuse
- reduced duplication
- deterministic output
- predictable composition

Xeyy should build its design system so component APIs work naturally with this model.

---

## 7. Style Composition and Precedence

Style composition is one of StyleX's most important architectural features.

Instead of relying on string concatenation:

```tsx
className={`${base} ${variant}`}
```

Xeyy should prefer StyleX-native composition.

The component system should explicitly define precedence between:

```text
base
variant
size
state
user override
```

This is especially important for reusable components.

---

## 8. Static vs Dynamic Styling

Xeyy must distinguish:

### Static styling

Known during compilation.

Examples:

- spacing tokens
- colors
- typography
- borders
- radii
- fixed variants

### Dynamic styling

Depends on runtime data.

Examples:

```tsx
width: `${value}px`
```

or arbitrary runtime-generated CSS values.

StyleX's static-analysis constraints mean Xeyy should avoid designing APIs around arbitrary runtime CSS generation.

Where dynamic values are necessary, research and document the supported StyleX mechanisms explicitly.

---

## 9. Design Tokens

StyleX provides mechanisms for defining variables and constants.

Relevant APIs include:

```tsx
stylex.defineVars()
stylex.defineConsts()
```

These should form a major part of Xeyy's token architecture.

A conceptual structure:

```text
global primitives
      ↓
semantic variables
      ↓
theme
      ↓
component styles
```

---

## 10. Theming

StyleX provides theme-related APIs including:

```tsx
stylex.createTheme()
```

A Xeyy theme system should be built around StyleX's actual theme model.

Do not recreate Tailwind's CSS-variable architecture simply because it is familiar.

---

## 11. Conditions

StyleX supports structured conditional styling such as:

- pseudo-classes
- media queries
- other supported conditions

Example:

```tsx
const styles = stylex.create({
  button: {
    color: 'black',
    ':hover': {
      color: 'blue',
    },
    '@media (min-width: 768px)': {
      padding: 20,
    },
  },
});
```

Exact supported condition syntax should always be checked against the targeted StyleX version.

---

## 12. Child Selectors and CSS Relationships

StyleX's model discourages arbitrary descendant-selector architectures.

This has an important implication for component design.

Instead of:

```css
.parent .child { ... }
```

Xeyy should prefer explicit component relationships.

For example:

```tsx
<Card>
  <CardHeader />
  <CardContent />
</Card>
```

Each part should have a defined styling contract.

This makes component behavior easier to understand and can make agent-generated code more predictable.

---

## 13. TypeScript

TypeScript should be a first-class requirement for Xeyy.

Component APIs should use:

- explicit prop types
- discriminated unions where appropriate
- typed variants
- typed token references
- predictable defaults

Avoid clever APIs that hide styling behavior.

---

## 14. Component API Implications

Prefer APIs such as:

```tsx
<Button variant="primary" size="sm">
  Save
</Button>
```

rather than exposing arbitrary styling internals as the primary API.

A component should provide:

```text
semantic props
      ↓
style contract
      ↓
StyleX composition
```

This gives both humans and coding agents a clear model.

---

## 15. Accessibility Implications

StyleX itself does not provide accessible interaction behavior.

Therefore Xeyy should not attempt to build complex interactive primitives from scratch unless necessary.

For interactions such as:

- dialogs
- popovers
- menus
- tabs
- comboboxes

Xeyy should investigate mature accessible primitive systems.

Candidates include:

- Base UI
- Radix
- React Aria
- other well-maintained primitives

Research must cover:

- licensing
- StyleX compatibility
- bundle behavior
- server rendering
- accessibility quality
- maintenance
- API fit

---

## 16. Animation

Animation should not become a mandatory runtime dependency.

Prefer:

- CSS transitions
- CSS animations
- StyleX-compatible animation definitions
- browser-native behavior

If a motion library is supported, it should be optional.

All interactive motion should respect:

```text
prefers-reduced-motion
```

---

## 17. Advanced APIs

StyleX has additional APIs and concepts that may be useful for advanced cases.

These should not automatically become Xeyy core abstractions.

Examples include:

- `stylex.when.*`
- `stylex.env.*`
- `@stylexjs/atoms`
- advanced type utilities
- experimental APIs

### Policy

Only adopt an advanced API into Xeyy core when:

1. the targeted StyleX release supports it;
2. its behavior is documented;
3. it solves a real Xeyy problem;
4. it is stable enough for the intended release.

Experimental APIs should not become foundational dependencies without explicit validation.

---

## 18. Dev vs Production Output

StyleX's development and production output can differ.

Development builds may provide more readable/debuggable output.

Production builds optimize generated class names and CSS.

Xeyy documentation should therefore avoid relying on generated class-name formats.

---

## 19. Framework and Build Integration

Xeyy needs explicit support for:

- React
- TypeScript
- Vite
- Next.js

Before implementation, research:

- compiler integration
- SSR
- React Server Components
- CSS extraction
- development mode
- production builds
- monorepos
- package boundaries
- aliases
- testing environments

Do not assume that working in one bundler automatically means working correctly everywhere.

---

## 20. SSR / RSC Considerations

This requires dedicated validation.

Xeyy components should be tested in:

```text
Next.js
├── client components
├── server components
└── mixed trees
```

and:

```text
Vite
├── development
└── production
```

The exact StyleX integration should be verified against current official tooling before architecture is frozen.

---

## 21. Common Anti-Patterns for Xeyy

Avoid:

### Tailwind emulation

Do not recreate arbitrary utility-class generation merely because developers know Tailwind.

### Generic class merging

Do not introduce a class-name merging abstraction unless there is a demonstrated need.

### Runtime style generation

Do not make arbitrary runtime CSS the normal component API.

### Uncontrolled CSS escape hatches

Do not expose arbitrary selectors everywhere.

### Token duplication

Do not maintain an independent token system that conflicts with StyleX variables/themes.

### Primitive reinvention

Do not rebuild complex accessibility behavior without a compelling reason.

---

## 22. Implications for Xeyy's Design System

A likely architecture is:

```text
StyleX
  ↓
design tokens
  ↓
semantic variables
  ↓
themes
  ↓
accessible primitives
  ↓
Xeyy components
  ↓
blocks
  ↓
templates
```

Every layer should preserve the constraints of the layer below it.

---

## 23. Machine-Readable StyleX Knowledge

StyleX's structured styling model creates an opportunity for agent tooling.

Xeyy should provide machine-readable information about:

- valid component props
- variant combinations
- token references
- theme structure
- styling constraints
- accessibility requirements
- dependencies
- customization points

A coding agent should be able to understand:

```text
what this component is
how to install it
how to use it
what variants exist
what tokens it consumes
what it depends on
what it must not do
```

---

## 24. Technical Decisions to Validate

Before architecture is finalized, answer:

1. Which StyleX version does Xeyy target?
2. Which compiler integration is supported?
3. Which React versions are supported?
4. Which Next.js versions are supported?
5. Which Vite versions are supported?
6. Which primitive library is preferred?
7. How are dynamic values handled?
8. How are themes distributed?
9. How are component overrides composed?
10. How are styles exposed to users?
11. How does registry installation modify source?
12. How are generated files validated?

---

## 25. Open Questions

### API stability

Which StyleX APIs are sufficiently stable for Xeyy V1?

### Dynamic styling

What is the preferred Xeyy pattern for runtime values?

### Container queries

What exact support should Xeyy expose?

### Animation

How should keyframes and transitions be represented?

### RSC

Which components can remain server-compatible?

### Primitive integration

Should Xeyy use Base UI as the default primitive foundation?

### Tokens

How much of the token system should be generated versus authored?

---

## 26. Technical Conclusion

StyleX is technically strong enough to justify further Xeyy development.

But Xeyy must respect its model.

The core principle is:

> **Do not make StyleX behave like Tailwind. Make the UI ecosystem behave like StyleX.**

That means:

- explicit styling contracts
- typed variants
- native composition
- native variables
- native themes
- static-first design
- accessible primitives
- predictable component boundaries

The next document is **04 — shadcn/ui Analysis**, which studies the source-first ecosystem Xeyy is learning from.
