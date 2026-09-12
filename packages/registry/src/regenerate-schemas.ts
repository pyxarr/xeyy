import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateRegistrySchemaDocument, registrySchemaSources } from './generate-schemas.ts';

const SCHEMA_DIR = resolve(fileURLToPath(import.meta.url), '../schema');

/** Committed source-tree artifact filename for each public schema id. */
const SOURCE_ARTIFACT_FILENAME: Record<string, string> = {
  'registry.json': 'registry.schema.json',
  'registry-item.json': 'registry-item.schema.json',
  'registry-index.json': 'registry-index.schema.json',
};

console.log('Generating registry JSON Schemas from zod (`src/schemas.ts`)...');
for (const source of registrySchemaSources) {
  const file = resolve(SCHEMA_DIR, SOURCE_ARTIFACT_FILENAME[source.id] ?? source.id);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, generateRegistrySchemaDocument(source), 'utf8');
  console.log(`  wrote ${file}`);
}
console.log(`Done. JSON Schema artifacts written to ${SCHEMA_DIR}.`);