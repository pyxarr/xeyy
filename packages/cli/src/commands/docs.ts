import { Command } from 'commander';
import kleur from 'kleur';
import { readConfig } from '../config.ts';
import { resolveProjectRoot } from '../project/root.ts';
import { resolveRegistryPath } from '../project/paths.ts';
import { loadConfiguredClient, getItem } from '../registry/client.ts';

interface DocsOptions {
  json: boolean;
}

export const docs = new Command()
  .name('docs')
  .description('Show component documentation and usage examples')
  .argument('<item>', 'component name')
  .option('--json', 'output as JSON', false)
  .action(async (name: string, opts: DocsOptions) => {
    const projectDir = resolveProjectRoot();
    const config = readConfig(projectDir);
    if (!config) {
      console.error(kleur.red('No xeyy.config.json found. Run `xeyy init` first.'));
      process.exit(3);
    }

    let client;
    try {
      client = await loadConfiguredClient(config, () => resolveRegistryPath(config, projectDir), [name]);
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
      console.log(JSON.stringify({
        name: item.name,
        title: item.title,
        description: item.description,
        categories: item.categories,
        files: item.files,
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
        accessibility: item.accessibility,
        stylex: item.stylex,
      }, null, 2));
      return;
    }

    console.log(kleur.bold(`\n${item.title ?? item.name}\n`));

    if (item.description) {
      console.log(`  ${item.description}\n`);
    }

    if (item.categories?.length) {
      console.log(`  ${kleur.bold('Categories:')} ${item.categories.join(', ')}\n`);
    }

    const exampleFile = item.files.find((f) => f.type === 'example');
    if (exampleFile?.content) {
      console.log(kleur.bold('  Usage example:\n'));
      for (const line of exampleFile.content.split('\n')) {
        console.log(`  ${kleur.dim(line)}`);
      }
      console.log();
    } else if (exampleFile?.path) {
      console.log(kleur.dim(`  (example file ${exampleFile.path} exists but has no embedded content)\n`));
    }

    if (item.accessibility) {
      console.log(kleur.bold('  Accessibility:'));
      const a = item.accessibility;
      const labels: string[] = [];
      if (a.keyboard) labels.push('keyboard navigation');
      if (a.aria) labels.push('ARIA attributes');
      if (a.focusManagement) labels.push('focus management');
      if (a.tested) labels.push('tested');
      if (labels.length > 0) {
        console.log(`    ${labels.join(', ')}`);
      }
      console.log();
    }

    if (item.stylex?.features) {
      console.log(kleur.bold('  StyleX features:'));
      console.log(`    ${item.stylex.features.join(', ')}`);
      console.log();
    }

    if (item.registryDependencies?.length) {
      console.log(kleur.bold('  Depends on:'));
      console.log(`    ${item.registryDependencies.join(', ')}`);
      console.log();
    }
  });