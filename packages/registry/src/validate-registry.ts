import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadRegistryItemFromRoot, validateRegistryRoot } from './index.ts';
import type { RegistryRoot } from './index.ts';

const REGISTRY_DIR = resolve(fileURLToPath(import.meta.url), '../../../..');
const DEFAULT_ROOT = resolve(REGISTRY_DIR, 'registry/registry.json');

function formatIssues(label: string, issues: { path: string; message: string }[]): void {
  if (issues.length === 0) {
    console.log(`  ✓ ${label}`);
    return;
  }
  console.log(`  ✗ ${label}`);
  for (const issue of issues) {
    console.log(`    - ${issue.path || '(root)'}: ${issue.message}`);
  }
}

function main(): void {
  const rootPath = process.argv[2] ?? DEFAULT_ROOT;
  console.log(`Validating registry: ${rootPath}\n`);

  let root: RegistryRoot;
  try {
    root = JSON.parse(readFileSync(rootPath, 'utf8')) as RegistryRoot;
  } catch (error) {
    console.error(`Failed to read ${rootPath}: ${(error as Error).message}`);
    process.exit(1);
  }

  const rootResult = validateRegistryRoot(root);
  formatIssues('registry.json structure', rootResult.issues);

  const scopeDir = resolve(REGISTRY_DIR, 'components');
  let failed = rootResult.valid ? 0 : 1;

  for (const itemPath of root.items) {
    const result = loadRegistryItemFromRoot(itemPath, REGISTRY_DIR, scopeDir);
    formatIssues(`item: ${result.item.name} (${itemPath})`, result.issues);
    if (!result.valid) {
      failed += 1;
    }
  }

  console.log(`\n${failed === 0 ? 'Registry OK.' : `Registry has ${failed} failing section(s).`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main();