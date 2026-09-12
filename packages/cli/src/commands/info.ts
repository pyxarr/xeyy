import { Command } from 'commander';
import kleur from 'kleur';
import { readConfig } from '../config.ts';
import { resolveRegistryPath } from '../project/paths.ts';
import { loadDistRegistry, getItem } from '../registry/client.ts';

interface InfoOptions {
  json: boolean;
}

export const info = new Command()
  .name('info')
  .description('Show component metadata')
  .argument('<item>', 'component name')
  .option('--json', 'output as JSON', false)
  .action((name: string, opts: InfoOptions) => {
    const projectDir = process.cwd();
    const config = readConfig(projectDir);
    if (!config) {
      console.error(kleur.red('No xeyy.config.json found. Run `xeyy init` first.'));
      process.exit(3);
    }

    const registryPath = resolveRegistryPath(config, projectDir);
    let client;
    try {
      client = loadDistRegistry(registryPath);
    } catch (error) {
      console.error(kleur.red((error as Error).message));
      process.exit(4);
    }
    const item = getItem(client, name);

    if (!item) {
      console.error(kleur.red(`Component "${name}" not found in registry.`));
      process.exit(4);
    }

    if (opts.json) {
      console.log(JSON.stringify(item, null, 2));
      return;
    }

    console.log(kleur.bold(`\n${item.title ?? item.name}`));
    console.log(kleur.dim(`  ${item.description ?? 'No description'}\n`));

    console.log(`  ${kleur.bold('Name:')}        ${item.name}`);
    console.log(`  ${kleur.bold('Version:')}     ${item.version}`);
    console.log(`  ${kleur.bold('Type:')}        ${item.type}`);
    if (item.categories?.length) console.log(`  ${kleur.bold('Categories:')}  ${item.categories.join(', ')}`);

    console.log(kleur.bold('\n  Files:'));
    for (const file of item.files) {
      const target = file.target ? ` → ${file.target}` : '';
      console.log(`    ${kleur.green(file.path)}${kleur.dim(` (${file.type})`)}${kleur.dim(target)}`);
    }

    if (item.dependencies?.length) {
      console.log(kleur.bold('\n  Dependencies:'));
      for (const dep of item.dependencies) {
        console.log(`    ${dep}`);
      }
    }

    if (item.registryDependencies?.length) {
      console.log(kleur.bold('\n  Registry dependencies:'));
      for (const dep of item.registryDependencies) {
        console.log(`    ${dep}`);
      }
    }

    if (item.accessibility) {
      console.log(kleur.bold('\n  Accessibility:'));
      const a = item.accessibility;
      if (a.keyboard) console.log(`    ${kleur.green('✓')} Keyboard navigation`);
      if (a.aria) console.log(`    ${kleur.green('✓')} ARIA attributes`);
      if (a.focusManagement) console.log(`    ${kleur.green('✓')} Focus management`);
      if (a.tested) console.log(`    ${kleur.green('✓')} Tested`);
    }

    if (item.stylex) {
      console.log(kleur.bold('\n  StyleX:'));
      if (item.stylex.minVersion) console.log(`    Min version: ${item.stylex.minVersion}`);
      if (item.stylex.features) console.log(`    Features: ${item.stylex.features.join(', ')}`);
      if (item.stylex.compiler) console.log(`    ${kleur.green('✓')} Requires compiler`);
    }

    if (item.license) {
      console.log(kleur.bold(`\n  License: ${item.license.type ?? 'Unknown'}`));
    }

    console.log();
  });