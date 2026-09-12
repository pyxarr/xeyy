import { z } from 'zod';

/**
 * Registry zod schemas — the single source of truth for both TypeScript
 * types and the emitted JSON Schema artifacts (see `generate-schemas.ts`).
 *
 * Xeyy V1 supports exactly five registry item types. Architectural concepts
 * such as primitives/tokens/hooks are NOT first-class registry types:
 *
 * - `registry:ui`       single-file/simple UI components   (components/ui/)
 * - `registry:component` multi-file component compositions (components/)
 * - `registry:block`    opinionated multi-component starts (components/blocks/)
 * - `registry:theme`    central StyleX theme/token system   (src/styles/theme.stylex.ts)
 * - `registry:internal` internal transitive dependencies   (components/internal/)
 */

export const sectionSchema = z.enum(['ui', 'components', 'blocks', 'themes', 'internal']);

export const registryItemTypeSchema = z.enum([
  'registry:ui',
  'registry:component',
  'registry:block',
  'registry:theme',
  'registry:internal',
]);

/**
 * File-level types. Distributable files are tagged with the registry item
 * type so the installer can map them to target directories. Example / docs
 * files are carried in the definition for reference but are never installed.
 */
export const registryFileTypeSchema = z.enum([
  'registry:ui',
  'registry:component',
  'registry:block',
  'registry:theme',
  'registry:internal',
  'example',
  'documentation',
]);

/** File path in the distributed payload, already carrying matchable repo sections. */
export const registryFileSchema = z
  .object({
    /** Source-relative path of the file, relative to the item's `source` directory. */
    path: z.string().min(1),
    type: registryFileTypeSchema,
    /** Optional install-time path override (e.g. theme file naming). */
    target: z.string().min(1).optional(),
    /** Source content, embedded by `xeyy build` into the distribution payload. */
    content: z.string().optional(),
  })
  .strict();

export const licenseMetadataSchema = z
  .object({
    type: z.string().optional(),
    copyright: z.string().optional(),
  })
  .strict();

export const stylexMetadataSchema = z
  .object({
    minVersion: z.string().optional(),
    features: z.array(z.string()).optional(),
    compiler: z.boolean().optional(),
    conditions: z.array(z.string()).optional(),
  })
  .strict();

export const accessibilityMetadataSchema = z
  .object({
    keyboard: z.boolean().optional(),
    focusManagement: z.boolean().optional(),
    aria: z.boolean().optional(),
    tested: z.boolean().optional(),
  })
  .strict();

export const registryItemSchema = z
  .object({
    /** URL of the item JSON Schema. */
    $schema: z.string().optional(),
    name: z.string().min(1),
    type: registryItemTypeSchema,
    version: z.string().min(1),
    title: z.string().optional(),
    description: z.string().optional(),
    author: z.string().optional(),
    homepage: z.string().url().optional(),
    categories: z.array(z.string().min(1)).optional(),
    docs: z.string().url().optional(),
    license: licenseMetadataSchema.optional(),
    /**
     * Directory of the canonical component source, relative to this registry
     * definition's own directory. `xeyy build` resolves and embeds the source
     * from here; it is not required for already-built distribution payloads.
     */
    source: z.string().min(1),
    files: z.array(registryFileSchema).min(1),
    /** npm package dependencies required by the installed source. */
    dependencies: z.array(z.string().min(1)).optional(),
    /** Other Xeyy registry items this item depends on. */
    registryDependencies: z.array(z.string().min(1)).optional(),
    /** Per-file source fingerprints recorded at registration time (change detection). */
    fingerprint: z.record(z.string(), z.string()).optional(),
    stylex: stylexMetadataSchema.optional(),
    accessibility: accessibilityMetadataSchema.optional(),
  })
  .strict();

/**
 * Public distribution payload — a registry item minus the internal `source`
 * path used only to locate canonical source at build time. `xeyy build` emits
 * payloads in this shape; `source` must never leak into the distribution.
 */
export const distRegistryItemSchema = registryItemSchema.omit({ source: true }).strict();

export const registryRootSchema = z
  .object({
    /** URL of the root JSON Schema. */
    $schema: z.string().optional(),
    name: z.string().min(1),
    homepage: z.string().optional(),
    version: z.string().optional(),
    /** Paths to colocated registry item files, relative to the registry content root. */
    items: z.array(z.string().min(1)),
  })
  .strict();

/** Catalog entry in the built `index.json` distribution. */
export const registryIndexEntrySchema = z
  .object({
    name: z.string().min(1),
    section: z.string().min(1),
    type: registryItemTypeSchema,
    version: z.string().min(1),
    title: z.string().optional(),
    description: z.string().optional(),
    categories: z.array(z.string().min(1)).optional(),
    dependencies: z.array(z.string().min(1)).optional(),
    registryDependencies: z.array(z.string().min(1)).optional(),
    /** Number of distributable files in the built payload. */
    fileCount: z.number().int().nonnegative(),
    /** Path to the built item payload, relative to the registry output dir. */
    path: z.string().min(1),
  })
  .strict();

/** Built distribution catalog (`dist/registry/index.json`). */
export const registryIndexSchema = z
  .object({
    $schema: z.string().optional(),
    name: z.string().min(1),
    homepage: z.string().optional(),
    version: z.string().optional(),
    items: z.array(registryIndexEntrySchema).min(1),
  })
  .strict();

export type RegistrySection = z.infer<typeof sectionSchema>;
export type RegistryItemType = z.infer<typeof registryItemTypeSchema>;
export type RegistryFileType = z.infer<typeof registryFileTypeSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type DistRegistryItem = z.infer<typeof distRegistryItemSchema>;
export type RegistryRoot = z.infer<typeof registryRootSchema>;
export type RegistryIndexEntry = z.infer<typeof registryIndexEntrySchema>;
export type RegistryIndex = z.infer<typeof registryIndexSchema>;
export type RegistryFile = z.infer<typeof registryFileSchema>;
export type LicenseMetadata = z.infer<typeof licenseMetadataSchema>;
export type StyleXMetadata = z.infer<typeof stylexMetadataSchema>;
export type AccessibilityMetadata = z.infer<typeof accessibilityMetadataSchema>;