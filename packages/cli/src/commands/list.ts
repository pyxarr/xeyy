import { Command } from 'commander';
import kleur from 'kleur';
import { readConfig } from '../config.ts';
import { resolveRegistryPath } from '../project/paths.ts';
import { loadDistRegistry, listItems } from '../registry/client.ts';

interface ListOptions {
  json: boolean;
}

export const list = new Command()
  .name('list')
  .description('List available registry components')
  .option('--json', 'output as JSON', false)
  .action((opts: ListOptions) => {
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
    const items = listItems(client);

    if (opts.json) {
      console.log(JSON.stringify(items.map((i) => ({
        name: i.name,
        version: i.version,
        type: i.type,
        title: i.title,
        categories: i.categories ?? [],
        files: i.files.length,
      })), null, 2));
      return;
    }

    if (items.length === 0) {
      console.log(kleur.dim('No components in registry.'));
      return;
    }

    console.log(kleur.bold(`\nRegistry components (${items.length})\n`));
    for (const item of items) {
      const title = item.title ? kleur.dim(` — ${item.title}`) : '';
      const cat = item.categories?.length ? kleur.dim(` [${item.categories.join(', ')}]`) : '';
      console.log(`  ${kleur.green(item.name)}${kleur.dim(` v${item.version}`)}${cat}${title}`);
    }
    console.log();
  });