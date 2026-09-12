import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { xeyyConfigSchema } from './schema.ts';

const SCHEMA_DIR = resolve(fileURLToPath(import.meta.url), '../schema');
const SCHEMA_BASE_URL = 'https://xeyy.dev/schema';

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

console.log('Generating config JSON Schema from zod (`src/schema.ts`)...');

emit(
  { filename: 'config.schema.json', id: 'config.schema.json', title: 'Xeyy Config' },
  xeyyConfigSchema,
);

console.log(`Done. JSON Schema artifact written to ${SCHEMA_DIR}.`);