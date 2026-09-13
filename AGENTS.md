# Xeyy — Agent Engineering Rules

You are working inside the Xeyy monorepo.

These rules are mandatory unless the task explicitly overrides them.

## 1. Core principle

Write code that is:

* simple
* readable
* type-safe
* minimal
* composable
* maintainable
* easy for another developer or AI agent to understand

Prefer the simplest correct implementation over clever abstractions.

Do not write code merely because it is possible. Every abstraction must solve a real problem.

---

## 2. Understand before modifying

Before changing code:

1. Inspect the relevant package and its existing architecture.
2. Find existing utilities, types, schemas, and patterns that already solve the problem.
3. Understand how the changed code is consumed.
4. Check related tests.
5. Check the package's public API before changing it.

Do not blindly replace existing implementations.

Preserve useful existing behavior unless the task explicitly requires removing it.

---

## 3. Scope discipline

Only modify files/packages explicitly allowed by the current task.

If the task says:

```text
Only modify packages/tokens
```

then do not modify:

* components
* CLI
* registry
* config
* documentation outside the requested package
* unrelated package.json files
* unrelated tests
* generated files outside the requested scope

If a necessary change appears to require another package, stop and explain the dependency instead of silently expanding scope.

---

## 4. No speculative work

Do not implement future features "while you're here."

Do not add:

* unused abstractions
* unused types
* placeholder APIs
* speculative configuration
* unnecessary wrappers
* premature plugin systems
* generic factories without multiple real consumers
* compatibility layers that have no current consumer

Implement what is required now while keeping the architecture extensible.

---

## 5. TypeScript

Use strict TypeScript.

Prefer:

```ts
type
interface
const
readonly
```

when appropriate.

Avoid:

```ts
any
as any
@ts-ignore
@ts-expect-error
```

unless there is a documented technical reason.

Do not weaken types to make an error disappear.

Prefer fixing the underlying type problem.

Use discriminated unions when multiple variants genuinely have different behavior.

Keep public types explicit.

---

## 6. Functions

Functions should do one clear thing.

Prefer:

```ts
const result = validateTheme(theme);
```

over functions that validate, transform, write files, log output, and mutate state simultaneously.

Avoid deeply nested functions.

Avoid unnecessary parameters.

Prefer passing a small typed object when a function has many related parameters.

---

## 7. Naming

Names must describe intent.

Prefer:

```ts
themeContract
registryItem
semanticTokens
validateTheme
resolveTheme
```

Avoid vague names:

```ts
data
stuff
thing
obj
helper
manager
process
handle
```

unless the context genuinely makes the meaning obvious.

Use the terminology already established by Xeyy.

Do not randomly rename established concepts.

---

## 8. Comments

Write comments only when they explain something that is not obvious from the code.

Good:

```ts
// Source paths are retained during authoring because registry status
// uses them to compare canonical source files.
```

Bad:

```ts
// Create the theme
const theme = createTheme();
```

Do not comment every line.

Do not use comments to compensate for confusing code.

Prefer clearer code over explanatory comments.

---

## 9. Error handling

Errors must be actionable.

Bad:

```ts
throw new Error("Invalid");
```

Prefer:

```ts
throw new Error(
  `Invalid theme "${name}": missing required token "foreground".`,
);
```

Never silently swallow errors.

Do not use empty catch blocks.

Do not return fake/default values simply to avoid throwing.

---

## 10. Dependencies

Do not add a dependency when the platform or existing repository code can solve the problem.

Before adding a dependency:

1. Check whether an existing dependency already provides the functionality.
2. Check whether the functionality is small enough to implement locally.
3. Consider bundle/install impact.
4. Consider whether the dependency is appropriate for a library package.

Do not introduce dependencies casually.

---

## 11. StyleX rules

Xeyy uses StyleX.

Prefer the StyleX primitives already established by the project:

```ts
stylex.defineVars(...)
stylex.create(...)
stylex.createTheme(...)
stylex.props(...)
```

Do not introduce Tailwind utilities into Xeyy.

Do not replace StyleX with ordinary CSS merely because CSS is easier.

Do not hardcode design-system values inside components when an appropriate token exists.

Prefer semantic tokens:

```ts
tokens.primary
tokens.foreground
tokens.mutedForeground
```

over raw colors:

```ts
"#2563eb"
"#737373"
```

Keep raw palette values inside the appropriate theme/base-color layer.

---

## 12. Design tokens

Separate these concepts:

### Base color

The underlying color palette.

### Theme

Semantic values consumed by components.

### Style

Component visual/structural treatment.

Do not merge these concepts into one giant object merely for convenience.

The architecture should remain capable of representing:

```text
Base Color
    +
Theme
    +
Style
    ↓
Light + Dark
```

Every supported combination must have both light and dark modes.

---

## 13. Semantic styling

Components should consume semantic values rather than palette-specific values.

Prefer:

```text
primary
primaryForeground
muted
mutedForeground
border
ring
```

instead of:

```text
blue500
gray500
zinc200
```

This keeps components independent from the selected base color/theme.

This follows the same principle used by shadcn's current styling guidance: semantic colors should be preferred over raw palette colors.

---

## 14. External references

When implementing behavior intended to match another project, especially shadcn:

* inspect the current upstream source first
* use the current `main` branch where possible
* do not rely on old blog posts or outdated examples
* distinguish current behavior from legacy behavior
* do not invent values when exact upstream values are required

If Xeyy intentionally differs from upstream, document the reason in code or the relevant architecture documentation.

---

## 15. Tests

Every meaningful behavior change should have validation.

Prefer tests that verify behavior rather than implementation details.

Test:

* valid inputs
* invalid inputs
* edge cases
* required invariants
* important compatibility behavior

Do not add tests that merely increase coverage without testing useful behavior.

After changes, run the narrowest relevant checks first, then broader checks when appropriate.

---

## 16. Validation before completion

Never report a task as complete merely because the code was written.

At minimum:

1. Typecheck the affected package.
2. Run its tests.
3. Run relevant validation/build commands.
4. Inspect the final diff.
5. Check for accidental unrelated changes.

If a command fails, investigate it.

Do not hide failures.

Do not claim success when validation was not performed.

---

## 17. Generated files

Understand whether a file is:

* authored source
* generated output
* build artifact

Do not manually edit generated files when a generator is responsible for them.

Modify the source and regenerate instead.

If generated output is intentionally committed, verify that it matches the source.

---

## 18. Public API discipline

Before changing an exported API, check all current consumers.

Do not break an existing public API without a clear requirement.

Avoid exporting internal implementation details.

If something is only needed internally, keep it internal.

---

## 19. File organization

Keep files focused.

Prefer:

```text
theme.ts
base-color.ts
style.ts
validate.ts
```

over one enormous file containing unrelated responsibilities.

Do not create a new file for a tiny piece of logic unless it improves discoverability or separation of concerns.

Follow the existing package structure before inventing a new one.

---

## 20. Duplication

Do not duplicate logic unnecessarily.

But also do not create premature abstractions merely to eliminate a few repeated lines.

A small amount of obvious duplication is sometimes better than a complicated abstraction.

Abstract when:

* the behavior is genuinely shared
* the abstraction has a clear name
* multiple real consumers benefit from it
* the abstraction makes the code easier to understand

---

## 21. Backward compatibility

When modifying existing behavior:

* identify existing consumers
* preserve behavior where possible
* migrate deliberately
* remove obsolete code only when it is genuinely obsolete

Do not leave two competing implementations alive indefinitely.

If replacing an old architecture, complete the migration rather than creating another parallel system.

---

## 22. Git hygiene

Keep changes focused.

Do not modify unrelated formatting.

Do not reorder imports/files unnecessarily.

Do not rewrite entire files when a small change is sufficient.

Before finishing, inspect:

```bash
git diff
git status
```

The final diff should tell one coherent story.

---

## 23. Agent behavior

Do not ask the user questions that can be answered by inspecting the repository.

Do not guess when repository evidence is available.

Do not invent existing files, APIs, commands, or architecture.

If something is genuinely ambiguous and cannot be resolved from the repository or authoritative documentation, state the ambiguity clearly.

Do not make unrelated improvements while completing a task.

Do not change architecture without a concrete reason.

---

## 24. Completion report

When finished, report briefly:

### Changed

What was actually modified.

### Validation

Which checks/tests/builds were run and their results.

### Notes

Only important caveats or decisions.

Do not produce a long explanation unless requested.

---

## Final rule

**Correctness first. Simplicity second. Consistency third.**

The best Xeyy code should feel obvious to a developer reading it for the first time.
