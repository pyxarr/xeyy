import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import kleur from 'kleur';
import { validateFullRegistry } from '@xeyy/registry';
import { authoringPaths } from '../registry/authoring.ts';
import { resolveProjectRoot } from '../project/root.ts';

interface RegistryValidateOptions {
  json: boolean;
  registry?: string;
}

export const registryValidate = new Command()
  .name('validate')
  .description('Validate registry definitions (root + item schema, paths, categories)')
  .option('--json', 'output as JSON', false)
  .option('--registry <dir>', 'registry definition directory (default: config.registry.path)')
  .action((opts: RegistryValidateOptions) => {
    const projectDir = resolveProjectRoot();
    const base = authoringPaths(projectDir);
    const registryDir = opts.registry ?? base.registryDir;

    const rootFile = join(registryDir, 'registry.json');
    if (!existsSync(rootFile)) {
      console.error(kleur.red(`Registry root not found at ${rootFile}. Run \`xeyy registry add\` first.`));
      process.exit(4);
    }

    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(rootFile, 'utf8'));
    } catch (error) {
      console.error(kleur.red(`Malformed ${rootFile}: ${(error as Error).message}`));
      process.exit(1);
    }

    const result = validateFullRegistry(raw, {
      contentRoot: registryDir,
      scopeDir: dirname(registryDir),
    });

    if (opts.json) {
      console.log(JSON.stringify({
        valid: result.valid,
        rootIssues: result.rootIssues,
        itemIssues: Object.fromEntries([...result.itemIssues.entries()].map(([k, v]) => [k, v])),
        duplicateNames: result.duplicateNames,
      }, null, 2));
      process.exit(result.valid ? 0 : 1);
      return;
    }

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

    console.log(kleur.bold('\nValidating registry\n'));
    print('registry.json structure', result.rootIssues);
    for (const [itemPath, issues] of result.itemIssues) {
      print(`item: ${itemPath}`, issues);
    }
    for (const name of result.duplicateNames) {
      console.log(`  ✗ duplicate item name: ${name}`);
    }

    console.log();
    if (result.valid) {
      console.log(kleur.green('  Registry OK.'));
    } else {
      console.log(kleur.red(`  ${[...result.itemIssues.values()].reduce((n, i) => n + i.length, 0) + result.rootIssues.length + result.duplicateNames.length} issue(s) found.`));
      process.exit(1);
    }
    console.log();
  });