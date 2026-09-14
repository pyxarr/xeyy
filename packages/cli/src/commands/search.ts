import { Command } from 'commander';
import kleur from 'kleur';
import { readConfig } from '../config.ts';
import { resolveProjectRoot } from '../project/root.ts';
import { resolveRegistryPath } from '../project/paths.ts';
import { loadConfiguredClient, searchItems } from '../registry/client.ts';

interface SearchOptions {
  json: boolean;
}

export const search = new Command()
  .name('search')
  .description('Search registry components')
  .argument('<query>', 'search query')
  .option('--json', 'output as JSON', false)
  .action(async (query: string, opts: SearchOptions) => {
    const projectDir = resolveProjectRoot();
    const config = readConfig(projectDir);
    if (!config) {
      console.error(kleur.red('No xeyy.config.json found. Run `xeyy init` first.'));
      process.exit(3);
    }

    let client;
    try {
      client = await loadConfiguredClient(config, () => resolveRegistryPath(config, projectDir), []);
    } catch (error) {
      console.error(kleur.red((error as Error).message));
      process.exit(4);
    }
    const results = searchItems(client, query);

    if (opts.json) {
      console.log(JSON.stringify(results.map((i) => ({
        name: i.name,
        version: i.version,
        title: i.title,
        description: i.description,
        categories: i.categories ?? [],
      })), null, 2));
      return;
    }

    if (results.length === 0) {
      console.log(kleur.dim(`No results for "${query}".`));
      return;
    }

    console.log(kleur.bold(`\nSearch results for "${query}" (${results.length})\n`));
    for (const item of results) {
      const title = item.title ? ` — ${item.title}` : '';
      console.log(`  ${kleur.green(item.name)}${kleur.dim(` v${item.version}`)}${title}`);
      if (item.description) {
        console.log(`    ${kleur.dim(item.description.slice(0, 80))}`);
      }
    }
    console.log();
  });