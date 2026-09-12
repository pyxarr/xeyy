import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { xeyyConfigSchema } from './schema.ts';

/**
 * Public base URL for the generated JSON Schema documents. The `$id` of the
 * emitted schema is `<SCHEMA_BASE_URL>/<id>`, matching the path under which
 * the built file is served (`/schema/<id>`).
 *
 * Currently served by the deployed registry project; switch to
 * `https://xeyy.dev/schema` only when the custom domain is connected to the
 * same Vercel project (a deliberate, separate change).
 */
export const SCHEMA_BASE_URL = 'https://xeyy-registry.vercel.app/schema';

/** Public schema id: the `$id` suffix AND the built filename under `dist/schema/`. */
export const CONFIG_SCHEMA_ID = 'config.schema.json';

const CONFIG_SCHEMA_TITLE = 'Xeyy Config';

/** Serialize the config zod schema to a deterministic public JSON Schema document. */
export function generateConfigSchemaDocument(): string {
  const doc = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${SCHEMA_BASE_URL}/${CONFIG_SCHEMA_ID}`,
    title: CONFIG_SCHEMA_TITLE,
    ...z.toJSONSchema(xeyyConfigSchema),
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

/** Write the public schema document into `outputDir`, returning the written path. */
export function writeConfigSchema(outputDir: string): string {
  mkdirSync(outputDir, { recursive: true });
  const file = resolve(outputDir, CONFIG_SCHEMA_ID);
  writeFileSync(file, generateConfigSchemaDocument(), 'utf8');
  return file;
}

// ---------------------------------------------------------------------------
// CLI: regenerate the committed schema artifact in `src/schema/`. The build
// (`build-dist-schema.ts`) invokes `writeConfigSchema` directly with the
// deployment output dir.
// ---------------------------------------------------------------------------
const SCHEMA_DIR = resolve(fileURLToPath(import.meta.url), '../schema');

function isCliEntry(): boolean {
  const entry = process.argv[1];
  return typeof entry === 'string' && resolve(entry) === fileURLToPath(import.meta.url);
}

if (isCliEntry()) {
  console.log('Generating config JSON Schema from zod (`src/schema.ts`)...');
  const file = writeConfigSchema(SCHEMA_DIR);
  console.log(`  wrote ${file}`);
  console.log(`Done. JSON Schema artifact written to ${SCHEMA_DIR}.`);
}