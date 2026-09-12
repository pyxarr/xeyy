import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';
import { execa } from 'execa';
import type { RegistryItem } from '@xeyy/registry';
import { readConfig, ensureDir } from '../config.ts';
import { detectPackageManager } from '../project/detect.ts';
import { resolveDistDirPath } from '../project/paths.ts';
import { loadConfiguredClient } from '../registry/client.ts';
import { resolveAll, flattenResolved } from '../registry/resolver.ts';
import { stageFiles, requiresTheme, displayPath, themeTargetFile } from '../registry/install.ts';
import { printLogo } from '../logo.ts';

interface AddOptions {
  dryRun: boolean;
  yes: boolean;
  json: boolean;
  overwrite: boolean;
}

function declaredNpmDependencies(projectDir: string): Set<string> {
  const pkgFile = resolve(projectDir, 'package.json');
  if (!existsSync(pkgFile)) return new Set();
  try {
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
  } catch {
    return new Set();
  }
}

export const add = new Command()
  .name('add')
  .description('Add components from the registry')
  .argument('<items...>', 'component names to install (e.g. button, default-theme)')
  .option('--dry-run', 'show plan without writing files', false)
  .option('--yes', 'skip confirmation prompts', false)
  .option('--json', 'output as JSON', false)
  .option('--overwrite', 'overwrite existing files without prompting', false)
  .action(async (itemNames: string[], opts: AddOptions) => {
    const projectDir = process.cwd();
    const spinner = ora('Loading registry...').start();

    try {
      const config = readConfig(projectDir);
      if (!config) {
        spinner.fail('No xeyy.config.json found');
        console.error(kleur.red('\nRun `xeyy init` first.'));
        process.exit(3);
      }

      const client = await loadConfiguredClient(
        config,
        () => resolveDistDirPath(config, projectDir),
        itemNames,
      );
      if (client.remote) {
        spinner.succeed(`Registry loaded (${client.source})`);
      } else {
        spinner.succeed(`Registry loaded from ${client.source}`);
      }

      spinner.text = 'Resolving dependencies...';
      const resolved = resolveAll(client, itemNames);
      const installItems = flattenResolved(resolved);

      // Components that import @xeyy/tokens need the theme installed.
let themeAlreadyPresent = false;
    if (requiresTheme(installItems) && !installItems.some((item) => item.type === 'registry:theme')) {
      const themeTarget = themeTargetFile(installItems, config, projectDir);
      if (existsSync(themeTarget)) {
        themeAlreadyPresent = true;
      } else {
        const theme = client.items.get('default-theme');
        if (theme) {
          installItems.push(theme);
        } else {
          spinner.warn('Installed components import @xeyy/tokens but no theme is available.');
          console.log(kleur.yellow('  Install a theme component too, e.g. `xeyy add default-theme`.'));
        }
      }
    }

      spinner.text = 'Planning files...';
      const staged = stageFiles(installItems, config, projectDir);

      const npmDeps: Record<string, string> = {};
      for (const item of installItems) {
        for (const dep of item.dependencies ?? []) {
          npmDeps[dep] = npmDeps[dep] ?? 'latest';
        }
      }

      // Dependencies already declared in the project are automatically skipped —
      // never re-install what the user already has.
      const declared = declaredNpmDependencies(projectDir);
      const alreadyPresent = Object.keys(npmDeps).filter((dep) => declared.has(dep));
      for (const dep of alreadyPresent) delete npmDeps[dep];

      if (opts.json) {
        console.log(JSON.stringify({
          items: installItems.map((i) => ({ name: i.name, version: i.version, type: i.type })),
          files: staged.map((f) => displayPath(f.target, projectDir)),
          dependencies: Object.keys(npmDeps),
          themeRequired: requiresTheme(installItems),
        }, null, 2));
        return;
      }

      spinner.stop();

      console.log(kleur.bold('\nXeyy installation plan\n'));

      console.log(kleur.bold('Components:'));
      for (const item of installItems) {
        const isDirect = itemNames.includes(item.name);
        console.log(`  ${isDirect ? kleur.green('●') : kleur.dim('○')} ${item.name}${kleur.dim(` (${item.type})`)}${!isDirect ? kleur.dim(' (dependency)') : ''}`);
      }

      console.log(kleur.bold('\nFiles:'));
      for (const f of staged) {
        console.log(`  ${kleur.green('+')} ${displayPath(f.target, projectDir)}`);
      }

      if (Object.keys(npmDeps).length > 0) {
        console.log(kleur.bold('\nPackage dependencies:'));
        for (const name of Object.keys(npmDeps)) {
          console.log(`  ${name}`);
        }
      }

      if (alreadyPresent.length > 0) {
        console.log(kleur.bold('\nAlready present (skipping install):'));
        for (const name of alreadyPresent) {
          console.log(`  ${kleur.dim(name)}`);
        }
      }

      const existingConflicts = staged.filter((f) => existsSync(f.target));
      if (existingConflicts.length > 0) {
        console.log(kleur.bold(kleur.yellow('\nExisting files:')));
        for (const f of existingConflicts) {
          const rel = displayPath(f.target, projectDir);
          console.log(`  ${kleur.yellow('!')} ${rel}`);
        }
      }

      console.log();

      if (opts.dryRun) {
        console.log(kleur.dim('Dry run — no files written.'));
        return;
      }

      if (!opts.yes) {
        const { confirm } = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: 'Install these components?',
          initial: true,
        });
        if (!confirm) {
          console.log(kleur.yellow('Cancelled.'));
          return;
        }
      }

      let skipConflicting = existingConflicts.length > 0 && !opts.overwrite;
      if (existingConflicts.length > 0 && !opts.yes && !opts.overwrite) {
        const { overwrite } = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: `Overwrite ${existingConflicts.length} existing file(s)?`,
          initial: false,
        });
        if (!overwrite) {
          skipConflicting = true;
        }
      }
      if (existingConflicts.length > 0 && opts.yes && !opts.overwrite) {
        skipConflicting = true;
        for (const f of existingConflicts) {
          console.log(kleur.yellow(`  Skipping existing file: ${displayPath(f.target, projectDir)}`));
        }
      }

      const writeSpinner = ora('Writing files...').start();
      let filesWritten = 0;

      for (const f of staged) {
        if (skipConflicting && existsSync(f.target)) continue;
        ensureDir(resolve(f.target, '..'));
        writeFileSync(f.target, f.content, 'utf8');
        filesWritten++;
      }
      writeSpinner.succeed(`${filesWritten} file(s) written`);

      if (Object.keys(npmDeps).length > 0) {
        const pm = detectPackageManager(projectDir);
        const depList = Object.keys(npmDeps).map((name) => name);

        const installSpinner = ora(`Installing dependencies with ${pm}...`).start();
        try {
          const args = pm === 'npm' ? ['install', '--save'] : ['add'];
          await execa(pm === 'npm' ? 'npm' : pm, [...args, ...depList], { cwd: projectDir, stdio: 'pipe' });
          installSpinner.succeed('Dependencies installed');
        } catch (err) {
          installSpinner.fail('Failed to install dependencies');
          console.error(kleur.red(`  ${(err as Error).message}`));
          console.log(kleur.yellow(`  Run manually: ${pm} add ${depList.join(' ')}`));
        }
      }

      printLogo();
      console.log(kleur.bold('Done.\n'));
      console.log(`  Installed: ${installItems.map((i) => i.name).join(', ')}`);
      console.log(`  Files:     ${filesWritten}`);
      console.log();

      const themeInstalled = installItems.some((i) => i.type === 'registry:theme');
      if (themeInstalled) {
        console.log(`${kleur.dim('Theme written to your configured theme path. Components already point at it.')}`);
      } else if (themeAlreadyPresent) {
        console.log(`${kleur.dim('Theme already present at your configured theme path. Components already point at it.')}`);
      }
      console.log();
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }
  });