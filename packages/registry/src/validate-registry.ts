import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateFullRegistry } from './index.ts';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../../');
const DEFAULT_ROOT = resolve(REPO_ROOT, 'registry/registry.json');

function main(): void {
  const rootPath = process.argv[2] ?? DEFAULT_ROOT;
  console.log(`Validating registry: ${rootPath}\n`);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(rootPath, 'utf8'));
  } catch (error) {
    console.error(`Failed to read ${rootPath}: ${(error as Error).message}`);
    process.exit(1);
  }

  const result = validateFullRegistry(raw, {
    contentRoot: resolve(rootPath, '..'),
    scopeDir: REPO_ROOT,
  });

  const print = (label: string, issues: { path: string; message: string }[]): void => {
    if (issues.length === 0) {
      console.log(`  ✓ ${label}`);
      return;
    }
    console.log(`  ✗ ${label}`);
    for (const issue of issues) {
      console.log(`    - ${issue.path || '(root)'}: ${issue.message}`);
    }
  };

  print('registry.json structure', result.rootIssues);
  for (const [itemPath, issues] of result.itemIssues) {
    print(`registry item: ${itemPath}`, issues);
  }
  for (const name of result.duplicateNames) {
    console.log(`  ✗ duplicate item name: ${name}`);
  }

  const failedRoom = result.rootIssues.length + [...result.itemIssues.values()].reduce((n, i) => n + i.length, 0) + result.duplicateNames.length;
  console.log(`\n${failedRoom === 0 ? 'Registry OK.' : `Registry has ${failedRoom} failing section(s).`}`);
  process.exit(failedRoom === 0 ? 0 : 1);
}

main();