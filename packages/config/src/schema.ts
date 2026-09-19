import { z } from 'zod';

import { iconLibraryIds } from '@xeyy/icons';

export const componentsConfigSchema = z.object({
  path: z.string().min(1),
}).strict();

export const themeConfigSchema = z.object({
  path: z.string().min(1),
}).strict();

export const aliasesConfigSchema = z.object({
  components: z.string().min(1),
}).strict();

export const registriesConfigSchema = z.record(
  z.string().min(1),
  z.string().url()
);

/** Authoring-mode registry configuration (used by the Xeyy repo itself). */
export const registryConfigSchema = z.object({
  /** Directory holding `registry.json` + colocated item definitions. */
  path: z.string().min(1).optional(),
  /** Canonical component source root (layout: <source>/ui, <source>/components, ...). */
  source: z.string().min(1).optional(),
  /** Where `xeyy build` writes the distribution payload. */
  dist: z.string().min(1).optional(),
  /**
   * Canonical theme source root (layout: <themes>/<name>). Theme sources are
   * often kept outside the component source root (e.g. a tokens package).
   * Defaults to `source` when omitted.
   */
  themes: z.string().min(1).optional(),
}).strict();

/** Supported icon library identifiers for the `iconLibrary` config field. */
export const iconLibraryConfigSchema = z.enum(iconLibraryIds);

export const xeyyConfigSchema = z.object({
  $schema: z.string().url().optional(),
  components: componentsConfigSchema,
  theme: themeConfigSchema,
  aliases: aliasesConfigSchema.optional(),
  // The field stays optional: the effective default (lucide) is applied by
  // `resolveIconLibrary`, not by zod, so loadConfig output is unchanged for
  // configs that omit it.
  iconLibrary: iconLibraryConfigSchema.optional(),
  registries: registriesConfigSchema.optional(),
  registry: registryConfigSchema.optional(),
}).strict();

export type ComponentsConfig = z.infer<typeof componentsConfigSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type AliasesConfig = z.infer<typeof aliasesConfigSchema>;
export type RegistriesConfig = z.infer<typeof registriesConfigSchema>;
export type RegistryConfig = z.infer<typeof registryConfigSchema>;
export type XeyyConfig = z.infer<typeof xeyyConfigSchema>;