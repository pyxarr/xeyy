import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRegistry } from './index.ts';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../../');

function main(): void {
  const registryDir = process.argv[2] ?? resolve(REPO_ROOT, 'registry');
  const outputDir = process.argv[3] ?? resolve(REPO_ROOT, 'dist/registry');

  console.log(`Building registry: ${registryDir} → ${outputDir}`);
  const result = buildRegistry({ registryDir, outputDir, name: 'Xeyy Registry' });
  console.log(`Built ${result.itemCount} item(s).`);
  console.log(`  JSON Schemas → ${result.schemaDir}`);
  for (const entry of result.index.items) {
    console.log(`  ✓ ${entry.name} (${entry.section}) → ${entry.path}`);
  }
}

main();