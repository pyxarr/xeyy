import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateDistRegistry } from './dist-validation.ts';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../../');

function main(): void {
  const arg = process.argv[2];
  const distDir = arg ? resolve(arg) : resolve(REPO_ROOT, 'dist/registry');
  console.log(`Validating distribution: ${distDir}\n`);

  const result = validateDistRegistry({ distDir });

  const print = (label: string, issues: { path: string; message: string }[]): void => {
    if (issues.length === 0) {
      console.log(`  ✓ ${label}`);
      return;
    }
    console.log(`  ✗ ${label}`);
    for (const issue of issues) {
      console.log(`    - ${issue.path}: ${issue.message}`);
    }
  };

  print('distribution index', result.rootIssues);
  for (const [payloadPath, issues] of result.itemIssues) {
    print(`item payload: ${payloadPath}`, issues);
  }
  print('consistency / cross-references', result.consistencyIssues);

  const failed = result.rootIssues.length + result.itemIssues.size + result.consistencyIssues.length;
  console.log(`\n${failed === 0 ? 'Distribution OK.' : `Distribution invalid (${failed} failing section(s)).`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main();