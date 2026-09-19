# Xeyy

StyleX-native React component registry and CLI — a source-first component
distribution ecosystem inspired by shadcn/ui. Users receive **source code**
instead of installing an npm runtime component package.

## Architecture

```text
packages/components          canonical component development source
registry/                    registry metadata + item definitions (source)
dist/registry/               generated distribution artifacts (embedded content)
xeyy.dev/r/                  hosted distribution
user project                 installed source
```

```text
packages/components/
        │
        ▼  component development
xeyy registry add
        │
        ▼  source discovery + analysis
registry/
        │
        ▼
xeyy registry validate  →  xeyy build
        │                        │
        ▼                        ▼
  CI / publishing           dist/registry/  →  hosted at xeyy.dev/r/
                                        │
                                        ▼ user project source
                                 xeyy add button
```

The registry author never hand-maintains item JSON. `xeyy registry add`
discovers components, analyzes their source, infers dependencies/categories,
and writes `registry/<section>/<name>/registry.json`. Definitions reference the
canonical source; `xeyy build` resolves and embeds the actual source content
into the distributable payload.

## Commands

| Command | Purpose |
| --- | --- |
| `xeyy registry add [names...]` | Discover components in `packages/components/src`, analyze source, prompt for metadata, write definitions. |
| `xeyy registry status` | Report `new / modified / deleted / unregistered / unchanged` between source and definitions. |
| `xeyy registry sync` | Reconcile definitions with canonical source, preserving authored metadata. `--prune` removes orphaned definitions. |
| `xeyy registry validate` | Full registry validation (schema, categories, paths, source files, duplicates, composition). For CI. |
| `xeyy build` | Compose + validate the source registry and emit `dist/registry` with embedded content. |
| `xeyy add <items...>` | Install official/custom registry components into the user project. |
| `xeyy migrate icons --from <library> --to <library> [--yes]` | Rewrite icon imports in your project from one icon library to another. |

All `registry` subcommands and `build` accept `--reg`/`--reg --registry`, `--source`, `--output` overrides where relevant, plus `--dry-run`, `--yes`, and `--json` for scripting.

## Registry catalog layout

```text
registry/
├── registry.json          # root: composes items from colocated definitions
├── ui/…/registry.json
├── components/…/registry.json
├── blocks/…/registry.json
├── themes/…/registry.json
└── internal/…/registry.json
```

Built output:

```text
dist/registry/
├── index.json             # catalog (name/type/section/version/fileCount/path)
├── ui/button.json         # payload with embedded file content
├── components/data-table.json
├── blocks/login-form.json
└── themes/default-theme.json
```

The CLI loads only `index.json` for `list`/`search`; item payloads are fetched on demand.

## Registry item types (V1)

| Type | Meaning | Install target |
| --- | --- | --- |
| `registry:ui` | single-file/simple UI components (`button`, `input`, `badge`) | `<components>/` |
| `registry:component` | multi-file component compositions (`data-table`) | `<components root>/` |
| `registry:block` | opinionated multi-component starts (`login-form`) | `<components root>/blocks/` |
| `registry:theme` | central StyleX theme/token system | `src/styles/theme.stylex.ts` |
| `registry:internal` | internal transitive dependencies | `<components root>/internal/` |

There is no `registry:token`, `registry:hook`, `registry:lib`, `registry:primitive` — tokens belong to the theme; shared internals are `registry:internal`.

## Item definition (source)

```json
{
  "$schema": "https://xeyy.dev/schema/registry-item.json",
  "name": "button",
  "type": "registry:ui",
  "version": "1.0.0",
  "title": "Button",
  "description": "A themeable Button component built on Base UI and StyleX.",
  "categories": ["form", "interactive", "accessible"],
  "source": "../../../packages/components/src/ui/button",
  "files": [{ "path": "button.tsx", "type": "registry:ui" }],
  "dependencies": ["@base-ui/react", "@stylexjs/stylex"],
  "fingerprint": { "button.tsx": "<sha256>" }
}
```

- `source` is relative to the definition directory; `build` embeds file
  contents into the distribution payload and never duplicates source.
- `files[].content` exists only in built payloads.
- Built payloads (`dist/registry/**`) omit the internal `source` path —
  consumers receive only installable files and public metadata. `source`
  remains in the source definitions under `registry/`.
- `fingerprint` records per-file sha256 for change detection.

## Discovery & analysis

`xeyy registry add` scans the configured source root for section
directories (`ui`, `components`, `blocks`, `internal`) and a theme source
(`config.registry.themes`, defaulting to the source root) for `themes`.
Scans are deterministic; ignored dirs (`node_modules`, `dist`, `build`,
`coverage`, dot-dirs, symlinks) are never candidates. Empty or test-only
components are not registered.

Analysis detects: TS/TSX source files, npm imports (excluding `@xeyy/tokens`
and react peers), Base UI usage, StyleX features/conditions, accessibility
signals, registry dependencies (imports of other Xeyy components), and
client-only indicators. The CLI prompts for anything ambiguous.

## Categories

Strict closed vocabulary (unknown categories are rejected):

- **Functional**: `form`, `navigation`, `overlay`, `layout`, `data-display`, `feedback`, `typography`, `media`
- **Context**: `marketing`, `dashboard`, `authentication`, `settings`, `ecommerce`
- **Behavior**: `interactive`, `animated`, `accessible`, `client-only`, `server-compatible`

Behavior categories combine freely; at most one functional + one context
category per item. The CLI suggests categories from analysis and the user
confirms or edits them.

## Theme / token distribution

The canonical default theme source lives at `packages/tokens/src/theme.stylex.ts`.
It is a **generated** self-contained file (neutral base color + vega style) with
no imports other than `@stylexjs/stylex`, so it can be copied verbatim into
consumer projects. Its single source of truth is the composable token data in
`packages/tokens/src` (`.ts` data modules under `base-colors`, `themes`,
`styles`); regenerate it with `pnpm --filter @xeyy/tokens generate:theme`.
`packages/tokens` remains the internal Xeyy design-system package — consumers
**never** install `@xeyy/tokens`. The `registry:theme` item references that
generated source; `xeyy build` embeds it; `xeyy add <theme>` installs it to the
consumer's configured `theme.path` (default `src/styles/theme.stylex.ts`) and
component source that imports `@xeyy/tokens` has those imports rewritten at
install time to a relative import of the installed theme file.

`theme.path` is the **installed** theme destination (`xeyy add <theme>` writes
it there; for consumers the default is `src/styles/theme.stylex.ts`). This
repository's own config resolves `theme.path` to the canonical generated default
at `packages/tokens/src/theme.stylex.ts` — installed output is a verbatim copy
of that file (kept fresh by `generate:theme` + tests), so in-repo installs and
development share the same source of truth.

## Hosting

`xeyy build` emits the distribution to `dist/registry` and the regenerated
public JSON Schemas (from the Zod registry definitions) to `dist/schema`.
Publishing is an operational step outside this repository: host the build
output statically so that each item is reachable as `https://xeyy.dev/r/{name}.json`
(e.g. `https://xeyy.dev/r/button.json`, `https://xeyy.dev/r/default-theme.json`)
and each schema as `/schema/registry.json`, `/schema/registry-item.json`,
`/schema/registry-index.json`. A base-URL registry (for example
`https://xeyy.dev/r/` + `index.json`) is also supported. Consumers point at
the public registry via `"registries": { "@xeyy": "https://xeyy.dev/r/{name}.json" }`
— plain names like `xeyy add button` resolve against it without typing a
namespace.

## Usage

Author workflow:

```bash
# Build a component under packages/components/src/ui/button/
xeyy registry add                # discover + analyze + register
xeyy registry status             # optional: see what changed
xeyy registry add                # or xeyy registry sync when source changes
xeyy registry validate           # CI-safe validation
xeyy build                       # emit dist/registry
```

Consumer workflow:

```bash
xeyy init
xeyy add button
xeyy add dialog
xeyy add default-theme
```

Unqualified names resolve against the official Xeyy registry. Custom
registries can be added under `registries` in `xeyy.config.json` as a base URL
or `{name}` template; the built local `dist/registry` is used automatically
when present.

## Verification

Root scripts used by CI (for the strict verification pipeline):

```bash
pnpm validate:config     # xeyy.config.json contract (schema + path safety/existence)
pnpm validate:registry   # source registry definitions (schema, categories, paths, files, duplicates)
pnpm check-types         # TypeScript across @xeyy/config, @xeyy/registry, xeyyui CLI
pnpm test                # unit suites for @xeyy/config, @xeyy/registry, xeyyui CLI
pnpm build:registry      # emit dist/registry + public JSON Schemas to dist/schema
pnpm validate:dist       # validate dist/registry (index, payloads, public rules, consistency)
```

`dist/registry` is temporary build output: it is gitignored, never committed,
and never uploaded as a CI artifact. Production deployment runs the registry
build independently and hosts the resulting output at `xeyy.dev/r/`.

## Configuration

`xeyy.config.json`:

```jsonc
{
  "components": { "path": "src/components/ui" },
  "theme": { "path": "src/styles/theme.stylex.ts" },
  "aliases": { "components": "@/components" },
  "registries": { "@xeyy": "https://xeyy.dev/r/{name}.json" },
  "registry": {
    "path": "registry",
    "source": "packages/components/src",
    "themes": "packages/tokens/src",
    "dist": "dist/registry"
  }
}
```

The `registry` block configures authoring (`path`, `source`, optional
`themes`, `dist`); the other fields control consumer installation.

## Icon libraries

Components use **direct icon imports** from a plain icon package — the source
you install is yours to edit. There is no Xeyy icon runtime, wrapper component,
or provider.

`xeyy.config.json` accepts an optional `iconLibrary` field:

```jsonc
{
  "iconLibrary": "lucide" // default when omitted
}
```

Supported libraries:

| Library | Package | Migration |
| --- | --- | --- |
| `lucide` (default) | `lucide-react` | verified mappings |
| `tabler` | `@tabler/icons-react` | verified mappings |
| `phosphor` | `@phosphor-icons/react` | verified mappings |
| `remixicon` | `@remixicon/react` | verified mappings |
| `hugeicons` | `@hugeicons/react` | not migratable (data-component API) |

### How `xeyy add` handles icons

Registry metadata records which icon library each component imports (derived
automatically from source at registration time; never maintained by hand).
`xeyy add`:

- installs the icon package(s) the component needs, alongside its other npm
  dependencies;
- if the component uses a different library than your `iconLibrary`, rewrites
  its imports to your library using verified name mappings;
- leaves icons without a verified equivalent untouched on their original
  package and reports them clearly, so nothing is silently substituted;
- type-only imports, re-exports, dynamic `import()` and namespace/default
  imports are never rewritten and always reported.

The hosted registry always serves the same canonical source regardless of your
`iconLibrary`; adaptation happens locally, at install time.

### `xeyy migrate icons`

Switch an existing project between icon libraries:

```bash
xeyy migrate icons --from lucide --to tabler --yes
```

- `--from` defaults to your configured `iconLibrary`; `--to` is required.
- Scans `.ts/.tsx` under your configured `components.path`, rewrites named
  imports (aliases, multiline lists, multiple icons) via AST-safe edits that
  preserve formatting, comments and JSX usage.
- Installs the target icon package and updates `iconLibrary` in
  `xeyy.config.json`.
- Unmapped icons stay on their original package (both packages remain
  installed) and are listed in the output.
- If any file cannot be parsed or rewritten safely, the command aborts before
  writing anything.


## Development

See each package's `package.json` for scripts. Packages: `@xeyy/registry`
(registry engine), `@xeyy/config` (config schema/helpers), `xeyyui` CLI,
`@xeyy/components` (canonical source), `@xeyy/tokens` (internal token/theme
source). The full implementation spec lives in `docs/research`.