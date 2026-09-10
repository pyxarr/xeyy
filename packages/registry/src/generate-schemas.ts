import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { registryItemSchema, registryRootSchema } from './schemas.ts';

const SCHEMA_DIR = resolve(fileURLToPath(import.meta.url), '../schema');
const SCHEMA_BASE_URL = 'https://xeyy.tools/schema';

interface EmitOptions {
  filename: string;
  id: string;
  title: string;
}

function emit({ filename, id, title }: EmitOptions, schema: z.ZodType): void {
  const file = resolve(SCHEMA_DIR, filename);
  mkdirSync(dirname(file), { recursive: true });

  const doc = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${SCHEMA_BASE_URL}/${id}`,
    title,
    ...z.toJSONSchema(schema),
  };

  writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  console.log(`  wrote ${file}`);
}

console.log('Generating registry JSON Schemas from zod (`src/schemas.ts`)...');

emit(
  { filename: 'registry-item.schema.json', id: 'registry-item.schema.json', title: 'Xeyy Registry Item' },
  registryItemSchema,
);

emit(
  { filename: 'registry.schema.json', id: 'registry.schema.json', title: 'Xeyy Registry Root' },
  registryRootSchema,
);

console.log(`Done. JSON Schema artifacts written to ${SCHEMA_DIR}.`);