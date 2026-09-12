import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writeConfigSchema } from './generate-schemas.ts';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../../');

function main(): void {
  const outputDir = process.argv[2] ?? resolve(REPO_ROOT, 'dist/schema');

  console.log(`JSON Schemas → ${outputDir}`);
  const file = writeConfigSchema(outputDir);
  console.log(`  ${file}`);
}

main();