import { z } from 'zod';

/**
 * Registry zod schemas — the single source of truth for both TypeScript
 * types and the emitted JSON Schema artifacts (see `generate-schemas.ts`).
 *
 * Mirrors ADR-013 (machine-readable, StyleX-aware source registry) and
 * the item shape in docs/research/10-registry-spec.md.
 */

export const registryItemTypeSchema = z.enum([
  'component',
  'primitive',
  'hook',
  'token',
  'theme',
  'block',
  'template',
  'utility',
  'config',
  'rule',
  'convention',
]);

export const registryFileTypeSchema = z.enum([
  'source',
  'test',
  'example',
  'documentation',
  'config',
  'style',
  'token',
  'agent',
]);

export const registryFileSchema = z
  .object({
    /** Path of the file, relative to the registry item's directory. */
    path: z.string().min(1),
    type: registryFileTypeSchema,
    /** Optional destination path when it differs from the installation default. */
    target: z.string().min(1).optional(),
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

export const tokenMetadataSchema = z
  .object({
    required: z.array(z.string()).optional(),
    optional: z.array(z.string()).optional(),
  })
  .strict();

export const themeMetadataSchema = z
  .object({
    required: z.boolean().optional(),
    supportsDark: z.boolean().optional(),
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

export const licenseMetadataSchema = z
  .object({
    type: z.string().optional(),
    copyright: z.string().optional(),
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
    category: z.string().optional(),
    files: z.array(registryFileSchema).min(1),
    /** npm package dependencies required by the installed source. */
    dependencies: z.record(z.string(), z.string()).optional(),
    /** npm package dependencies needed only for optional functionality. */
    optionalDependencies: z.record(z.string(), z.string()).optional(),
    /** Other Xeyy registry items this item depends on. */
    registryDependencies: z.array(z.string().min(1)).optional(),
    stylex: stylexMetadataSchema.optional(),
    tokens: tokenMetadataSchema.optional(),
    theme: themeMetadataSchema.optional(),
    accessibility: accessibilityMetadataSchema.optional(),
    license: licenseMetadataSchema.optional(),
    /** Machine-readable links to docs, examples, API, changelog. */
    documentation: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const registryRootSchema = z
  .object({
    /** URL of the root JSON Schema. */
    $schema: z.string().optional(),
    name: z.string().min(1),
    homepage: z.string().optional(),
    version: z.string().optional(),
    /** Paths to colocated registry item files, relative to the content root. */
    items: z.array(z.string().min(1)),
  })
  .strict();

export type RegistryItemType = z.infer<typeof registryItemTypeSchema>;
export type RegistryFileType = z.infer<typeof registryFileTypeSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type RegistryRoot = z.infer<typeof registryRootSchema>;
export type RegistryFile = z.infer<typeof registryFileSchema>;
export type StyleXMetadata = z.infer<typeof stylexMetadataSchema>;
export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;
export type ThemeMetadata = z.infer<typeof themeMetadataSchema>;
export type AccessibilityMetadata = z.infer<typeof accessibilityMetadataSchema>;
export type LicenseMetadata = z.infer<typeof licenseMetadataSchema>;