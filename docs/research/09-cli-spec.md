# 09 — CLI Specification

**Project:** Xeyy  
**Document:** CLI Specification  
**Status:** Research-backed planning specification  
**Scope:** CLI behavior, architecture, commands, safety, project detection, registry interaction, updates, diagnostics, machine-readable operation, testing, and release requirements.

---

## 1. Executive Summary

The Xeyy CLI is the developer-facing interface to the Xeyy source-first ecosystem.

Its job is not merely to copy files. It should provide a reliable bridge between:

```text
Developer
   ↓
CLI
   ↓
Project detection
   ↓
Registry resolution
   ↓
Validation
   ↓
Source installation/update
   ↓
Project verification
```

The CLI must preserve the central Xeyy principle:

> The developer owns the installed source.

The CLI therefore must never behave like a hidden runtime package manager for UI components.

The current ecosystem establishes an important benchmark: shadcn's current CLI has evolved beyond a simple `add` command. Its v4 CLI includes project information, documentation/context commands, presets, templates, dry-run/diff/view workflows, registry support, and agent-oriented capabilities. Its registry system can also use public GitHub repositories directly as source registries. Xeyy should treat this as the current competitive baseline rather than designing a 2023-era clone.

---

# 2. CLI Goals

## Primary goals

1. Initialize Xeyy support in a React project.
2. Detect project/framework compatibility.
3. Install source-owned components.
4. Resolve component dependencies.
5. Explain what will be installed.
6. Validate StyleX requirements.
7. Update installed components safely.
8. Detect local modifications before updates.
9. Provide diagnostics.
10. Expose machine-readable output.
11. Work in interactive and automation contexts.
12. Fail safely and explain how to recover.

## Non-goals

V1 CLI should not:

- become a general-purpose package manager
- become a project scaffolding platform for every framework
- execute arbitrary registry code
- silently overwrite source
- require a hosted Xeyy account
- require telemetry
- require a cloud service for basic operation
- become an AI agent itself

---

# 3. Research Baseline

Current shadcn CLI research establishes several patterns worth learning from:

- `init` initializes projects.
- `add` installs items.
- `info` provides project/component context useful to coding agents.
- `docs` exposes component documentation/context.
- `build` produces registry artifacts.
- `list`, `search`, and `view` work with registries.
- GitHub repositories can act directly as source registries.
- registry items can include more than components: hooks, config, docs, templates, workflows, rules, and project conventions.

Sources:
- https://ui.shadcn.com/docs/cli
- https://ui.shadcn.com/docs/registry
- https://ui.shadcn.com/docs/registry/github
- https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- https://ui.shadcn.com/docs/changelog/2026-06-github-registries

Xeyy should adopt the useful product lessons while keeping the implementation StyleX-specific.

---

# 4. Proposed Command Surface

V1 candidate commands:

```text
xeyy init
xeyy add <items...>
xeyy list
xeyy search <query>
xeyy info <item>
xeyy docs <item>
xeyy update <items...>
xeyy doctor
xeyy config
```

Potential later commands:

```text
xeyy remove
xeyy diff
xeyy check
xeyy registry
xeyy theme
xeyy create
xeyy migrate
```

The CLI should resist command inflation. A command belongs in core only when it represents a repeated developer workflow.

---

# 5. `init`

## Purpose

Prepare a compatible project for Xeyy.

Example:

```bash
pnpm dlx xeyyui@latest init
```

## Responsibilities

- detect package manager
- detect React
- detect framework
- detect TypeScript
- detect StyleX
- detect StyleX compiler integration
- inspect project structure
- establish Xeyy configuration
- establish token/theme conventions where required
- report changes before applying them

## Safety

`init` must:

- avoid destructive edits
- show what it will change
- create backups or use safe writes where appropriate
- fail clearly when the project is unsupported
- support non-interactive mode

---

# 6. Project Detection

The CLI should detect:

```text
package.json
pnpm-lock.yaml
package-lock.json
yarn.lock
bun.lock
tsconfig.json
next.config.*
vite.config.*
StyleX configuration
source directories
path aliases
existing Xeyy config
```

Detection should be evidence-based.

The CLI must not assume Next.js merely because React is installed.

---

# 7. Configuration

A project-level Xeyy configuration file is likely necessary.

Possible conceptual shape:

```json
{
  "$schema": "...",
  "components": {
    "path": "src/components/ui"
  },
  "tokens": {
    "path": "src/styles/tokens"
  },
  "registry": {
    "default": "https://..."
  }
}
```

The exact schema is an open decision until the registry and project architecture are finalized.

Configuration must remain small.

---

# 8. `add`

Example:

```bash
xeyy add button dialog input
```

Workflow:

```text
parse arguments
 ↓
load project config
 ↓
resolve registry
 ↓
resolve requested items
 ↓
resolve registry dependencies
 ↓
resolve npm dependencies
 ↓
validate StyleX requirements
 ↓
detect file conflicts
 ↓
show plan
 ↓
write files
 ↓
install required dependencies
 ↓
validate result
```

The command should support:

```bash
xeyy add button
xeyy add button dialog
xeyy add @registry/button
xeyy add https://example.com/registry/button
```

Exact external-registry syntax remains open.

---

# 9. Installation Plan

Before modifying a project, the CLI should be able to produce a plan:

```text
Xeyy installation plan

Components:
  button
  dialog

Files:
  + src/components/ui/button.tsx
  + src/components/ui/dialog.tsx

Registry dependencies:
  dialog → popover

Package dependencies:
  @base-ui/react

No existing files will be overwritten.
```

For automation:

```bash
xeyy add dialog --dry-run --json
```

---

# 10. Conflict Detection

The CLI must distinguish:

```text
new file
existing identical file
existing modified file
existing incompatible file
```

Suggested behavior:

- identical → report and skip
- unmodified known source → safe update
- modified source → stop or require explicit decision
- unrelated existing file → never silently overwrite

---

# 11. Source Fingerprinting

To support safe updates, the CLI should maintain enough information to know whether an installed file was changed locally.

Possible approaches:

1. source hash
2. registry version metadata
3. local installation manifest
4. three-way diff
5. combination of the above

A local manifest could conceptually record:

```json
{
  "button": {
    "version": "0.1.0",
    "files": {
      "button.tsx": {
        "sourceHash": "..."
      }
    }
  }
}
```

The final implementation must avoid creating unnecessary project metadata.

---

# 12. `update`

Example:

```bash
xeyy update button
```

The CLI should show:

```text
Installed: 0.1.0
Available: 0.2.0

Changed:
  button.tsx

Local modifications detected:
  button.tsx

Action required:
  review diff
```

Never silently overwrite customized source.

---

# 13. Three-Way Update Model

The ideal future model:

```text
        original v1
        /        \
       /          \
local v1          upstream v2
       \          /
        merge analysis
             ↓
       proposed v2
```

Possible results:

```text
automatic merge
manual conflict
safe replacement
skip
```

This is a major potential Xeyy differentiator, but it should not block the first usable release.

---

# 14. `doctor`

Proposed:

```bash
xeyy doctor
```

Checks:

- Node version
- package manager
- React
- TypeScript
- StyleX
- compiler/plugin
- framework
- config
- aliases
- registry connectivity
- registry schema
- dependency consistency
- expected directories
- source permissions
- incompatible configuration

Output should explain:

```text
Problem
Cause
Recommended action
Verification
```

Example:

```text
StyleX compiler integration not detected.

Expected:
  @stylexjs/babel-plugin

Detected:
  @stylexjs/stylex 0.19.0

Try:
  ...

Run xeyy doctor again after fixing the configuration.
```

---

# 15. `info`

Example:

```bash
xeyy info button
```

Should expose:

- component name
- version
- purpose
- files
- dependencies
- registry dependencies
- StyleX requirements
- tokens
- theme requirements
- accessibility notes
- examples
- documentation
- compatibility

Machine mode:

```bash
xeyy info button --json
```

This is important for AI-assisted development.

---

# 16. `docs`

Example:

```bash
xeyy docs dialog
```

The command can return concise structured context:

```text
Dialog

Purpose:
...

Composition:
...

Keyboard:
...

Dependencies:
...

Example:
...
```

The CLI should not require an LLM to explain the component.

---

# 17. Search

Example:

```bash
xeyy search form
```

Search should support:

- name
- description
- category
- tags
- accessibility
- dependencies
- framework
- StyleX capability

Future:

```bash
xeyy search "controlled dialog"
```

Natural-language search can be added later without making it the baseline.

---

# 18. JSON Output

Automation should be first-class.

Candidate:

```bash
xeyy list --json
xeyy info button --json
xeyy search dialog --json
xeyy doctor --json
xeyy add button --dry-run --json
```

JSON output should have a stable schema.

Human-readable terminal output and machine-readable output should be separate presentation layers over the same command result model.

---

# 19. Non-Interactive Mode

CI and agents must not depend on prompts.

Example:

```bash
xeyy add button --yes
```

Potential:

```bash
xeyy add button --non-interactive
```

The final flag naming must be standardized.

Commands should fail rather than make dangerous assumptions.

---

# 20. Exit Codes

The CLI should use predictable exit codes.

Conceptually:

```text
0  success
1  general failure
2  invalid arguments
3  project incompatibility
4  registry failure
5  conflict requiring user action
6  validation failure
7  security/trust failure
```

Exact values should be documented and stable.

---

# 21. Error Design

Bad:

```text
Error: failed
```

Good:

```text
Xeyy could not detect a StyleX compiler.

Detected:
  React 19
  StyleX 0.19.0

Missing:
  StyleX build integration

Try:
  xeyy doctor
```

Every common error should have:

- cause
- context
- corrective action
- verification step
- documentation reference where available

---

# 22. Registry Trust

The CLI is effectively a source-code installation tool.

Therefore it must treat registry input as untrusted.

It should:

- validate registry schema
- validate file paths
- reject path traversal
- restrict writes to intended project locations
- validate dependencies
- avoid executing downloaded source during inspection
- clearly identify external registries
- show installation plans
- preserve provenance metadata

The CLI should never evaluate arbitrary registry JavaScript simply to determine metadata.

---

# 23. Dependency Installation

If an item requires npm packages, the CLI should report them before installation.

Example:

```text
Package dependencies:
  @base-ui/react

Install these dependencies? [Y/n]
```

Non-interactive mode requires explicit policy.

The CLI should use the project's existing package manager when possible.

It should not force npm when the project uses pnpm.

---

# 24. Framework Compatibility

V1:

```text
React
TypeScript
Next.js
Vite
StyleX
```

The CLI should detect unsupported projects rather than attempting partial installation.

Framework-specific configuration should be isolated.

---

# 25. Package Manager Detection

Preferred:

```text
pnpm → pnpm
yarn → yarn
npm → npm
bun → bun
```

The CLI should respect lockfile/project configuration.

Xeyy's own monorepo uses pnpm + Turborepo, but the installed CLI should not require consuming applications to use pnpm.

---

# 26. Telemetry

No telemetry by default.

If telemetry is ever introduced:

- disclose it
- minimize data
- provide configuration
- do not collect source code
- avoid identifying users unnecessarily
- document retention
- provide an opt-out where appropriate

The default should preserve open-source trust.

---

# 27. Security Model

Threats:

1. malicious registry
2. path traversal
3. dependency confusion
4. compromised registry content
5. malicious scripts
6. unsafe update
7. configuration injection
8. credential leakage

Mitigations:

- schema validation
- path normalization
- allowlisted targets
- provenance
- explicit external registry handling
- no automatic arbitrary script execution
- dependency review
- safe writes
- secure publishing

---

# 28. Cross-Platform Requirements

Test:

- Linux
- macOS
- Windows

At minimum:

- paths
- shell behavior
- file permissions
- terminal formatting
- package manager detection
- registry downloads
- line endings

---

# 29. CLI Package Architecture

Possible package:

```text
packages/cli/
├── src/
│   ├── commands/
│   ├── registry/
│   ├── project/
│   ├── install/
│   ├── update/
│   ├── diagnostics/
│   ├── output/
│   ├── config/
│   └── security/
├── tests/
└── package.json
```

The CLI should separate domain logic from terminal presentation.

---

# 30. Registry Client

The registry client should:

- fetch registry metadata
- validate schemas
- resolve includes
- resolve dependencies
- cache where appropriate
- support static registry files
- support Git-based sources if adopted
- expose structured results

It should not contain component-specific UI logic.

---

# 31. CLI and Registry Boundary

```text
CLI
 ↓
Registry client
 ↓
Registry schema
 ↓
Registry source
```

The CLI should not know that a registry item is a Button in order to install it.

It should operate from metadata.

---

# 32. Testing

Required test layers:

### Unit

- argument parsing
- config
- registry resolution
- dependency resolution
- path safety
- hashing

### Integration

- real project fixtures
- real registry fixtures
- installation
- update
- conflict detection

### E2E

- init
- add
- update
- doctor
- JSON output

### Security

- traversal
- malformed JSON
- malicious paths
- unexpected file targets
- external registry failures

---

# 33. Release Criteria

CLI V1 requires:

- command tests
- cross-platform checks
- documented errors
- JSON schema if JSON output is public
- stable exit codes
- safe installation
- registry validation
- no silent destructive writes
- documentation
- changelog entry

---

# 34. Future Commands

Potential:

```text
xeyy remove
xeyy diff
xeyy migrate
xeyy theme
xeyy registry add
xeyy registry list
xeyy create
xeyy check
```

These should be added only after evidence of need.

---

# 35. CLI Acceptance Criteria

- [ ] init works on supported Next.js project
- [ ] init works on supported Vite project
- [ ] add installs source
- [ ] add resolves dependencies
- [ ] add validates project
- [ ] add detects conflicts
- [ ] update detects modifications
- [ ] doctor diagnoses common failures
- [ ] info exposes machine-readable metadata
- [ ] JSON output is stable
- [ ] non-interactive mode works
- [ ] errors are actionable
- [ ] path traversal is prevented
- [ ] external registry handling is safe
- [ ] Linux/macOS/Windows are tested
- [ ] documentation exists

---

# 36. Final CLI Position

The Xeyy CLI should feel less like a package installer and more like a **source-distribution and project-integration tool**.

The ideal experience is:

```bash
pnpm dlx xeyyui init
pnpm dlx xeyyui add button dialog input
```

followed by a project that contains understandable, editable source.

The CLI's moat is not command count.

It is:

> **safe source distribution + StyleX-aware validation + reliable updates + excellent diagnostics + machine-readable project context.**
