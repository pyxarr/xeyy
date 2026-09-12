import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { z } from 'zod';

import { registryItemSchema, registryRootSchema } from './schemas.ts';
import { registryIndexSchema } from './schemas.ts';

/**
 * Public base URL for the generated JSON Schema documents. The `$id` of every
 * emitted schema is `<SCHEMA_BASE_URL>/<id>`, matching the path under which
 * the built file is served (`/schema/<id>`).
 *
 * Currently served by the deployed registry project; switch to
 * `https://xeyy.dev/schema` only when the custom domain is connected to the
 * same Vercel project (a deliberate, separate change).
 */
export const SCHEMA_BASE_URL = 'https://xeyy-registry.vercel.app/schema';

export interface RegistrySchemaSource {
  /**
   * Public schema id: the `$id` suffix AND the built filename under
   * `dist/schema/`, e.g. `registry.json`.
   */
  id: string;
  /** Document title. */
  title: string;
  /** Canonical zod schema — the single source of truth for the JSON Schema. */
  schema: z.ZodType;
}

/** The three public registry schema contracts, generated from `schemas.ts`. */
export const registrySchemaSources: RegistrySchemaSource[] = [
  { id: 'registry-item.json', title: 'Xeyy Registry Item', schema: registryItemSchema },
  { id: 'registry.json', title: 'Xeyy Registry Root', schema: registryRootSchema },
  { id: 'registry-index.json', title: 'Xeyy Registry Catalog Index', schema: registryIndexSchema },
];

/** Serialize one zod schema to a deterministic public JSON Schema document. */
export function generateRegistrySchemaDocument(source: RegistrySchemaSource): string {
  const doc = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${SCHEMA_BASE_URL}/${source.id}`,
    title: source.title,
    ...z.toJSONSchema(source.schema),
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

/** Write the public schema documents into `outputDir`, returning written paths. */
export function writeRegistrySchemas(outputDir: string): string[] {
  mkdirSync(outputDir, { recursive: true });
  return registrySchemaSources.map((source) => {
    const file = resolve(outputDir, source.id);
    writeFileSync(file, generateRegistrySchemaDocument(source), 'utf8');
    return file;
  });
}