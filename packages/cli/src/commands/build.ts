import { Command } from 'commander';
import { existsSync } from 'node:fs';
import kleur from 'kleur';
import ora from 'ora';
import { buildRegistry } from '@xeyy/registry';
import { authoringPaths } from '../registry/authoring.ts';

interface BuildOptions {
  json: boolean;
  registry?: string;
  output?: string;
}

export const build = new Command()
  .name('build')
  .description('Build the distribution payload from registry definitions + canonical source')
  .option('--json', 'output as JSON', false)
  .option('--registry <dir>', 'registry definition directory (default: config.registry.path)')
  .option('--output <dir>', 'distribution output directory (default: config.registry.dist)')
  .action((opts: BuildOptions) => {
    const projectDir = process.cwd();
    const base = authoringPaths(projectDir);
    const registryDir = opts.registry ?? base.registryDir;
    const outputDir = opts.output ?? base.distDir;

    if (!existsSync(registryDir)) {
      console.error(kleur.red(`Registry directory not found at ${registryDir}.`));
      process.exit(4);
    }

    const spinner = ora('Building registry...').start();
    try {
      const result = buildRegistry({ registryDir, outputDir });

      if (opts.json) {
        spinner.stop();
        console.log(JSON.stringify({
          itemCount: result.itemCount,
          outputDir: result.outputDir,
          schemaDir: result.schemaDir,
          index: result.index,
        }, null, 2));
        return;
      }

      spinner.succeed(`Built ${result.itemCount} item(s)`);
      console.log(kleur.bold('\nDistribution:'));
      console.log(`  ${kleur.green('index.json')} → ${outputDir}`);
      console.log(`  ${kleur.dim('schemas')} → ${result.schemaDir}`);
      for (const entry of result.index.items) {
        console.log(`  ✓ ${entry.name}${kleur.dim(` (${entry.section})`)} → ${entry.path}`);
      }
      console.log();
      console.log(kleur.dim('Consumers install these via `xeyy add`.'));
      console.log();
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }
  });