import { Command } from 'commander';
import { existsSync, statSync } from 'node:fs';
import { relative } from 'node:path';
import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';
import { getIconLibrary, iconLibraryIds, type IconLibraryId } from '@xeyy/icons';
import { readConfig, writeConfig, resolveIconLibrary, resolveComponentPath } from '../config.ts';
import { detectPackageManager } from '../project/detect.ts';
import { declaredNpmDependencies, installDependencies, manualInstallCommand } from '../project/dependencies.ts';
import { resolveProjectRoot } from '../project/root.ts';
import { canMigrateIconLibraries } from '../icons/imports.ts';
import {
  applyIconMigration,
  scanProjectIconMigration,
  summarizeIconMigration,
  type IconMigrationScan,
} from '../icons/migration.ts';

interface MigrateIconsOptions {
  from?: string;
  to: string;
  yes: boolean;
}

/** Resolve a CLI-provided icon library value without casting. */
function parseIconLibrary(value: string | undefined): IconLibraryId | undefined {
  if (value === undefined) return undefined;
  return iconLibraryIds.find((id) => id === value);
}

function supportedLibraries(): string {
  return iconLibraryIds.join(', ');
}

function projectRelative(projectDir: string, path: string): string {
  return relative(projectDir, path).split('\\').join('/');
}

function printPlan(scan: IconMigrationScan, projectDir: string, searchDir: string): void {
  const summary = summarizeIconMigration(scan);
  console.log(kleur.bold('\nXeyy icon migration plan\n'));
  console.log(`  From:   ${getIconLibrary(scan.from).displayName} ${kleur.dim(`(${getIconLibrary(scan.from).packageName})`)}`);
  console.log(`  To:     ${getIconLibrary(scan.to).displayName} ${kleur.dim(`(${getIconLibrary(scan.to).packageName})`)}`);
  console.log(`  Source: ${projectRelative(projectDir, searchDir)} ${kleur.dim(`(${scan.scanned} file(s) scanned, ${scan.candidates} importing ${getIconLibrary(scan.from).packageName})`)}`);

  if (scan.edits.length > 0) {
    console.log(kleur.bold('\nFiles:'));
    for (const edit of scan.edits) {
      const iconCount = edit.mapped.length;
      console.log(`  ${kleur.green('~')} ${edit.relativePath} ${kleur.dim(`(${iconCount} icon(s))`)}`);
    }
  } else {
    console.log(kleur.dim('\n  No files need changes.'));
  }

  if (summary.mapped.length > 0) {
    console.log(kleur.bold('\nIcons:'));
    for (const icon of summary.mapped) {
      console.log(`  ${icon.from} → ${icon.to}${icon.localName === icon.to ? '' : kleur.dim(` (bound as ${icon.localName})`)}`);
    }
  }

  if (summary.unmapped.length > 0) {
    console.log(kleur.bold(kleur.yellow('\nUnmapped icons (left on their original package):')));
    for (const icon of summary.unmapped) {
      console.log(`  ${kleur.yellow('!')} ${icon.name} ${kleur.dim(`(${getIconLibrary(icon.library).packageName}, ${icon.files.join(', ')})`)}`);
    }
  }

  if (summary.skipped.length > 0) {
    console.log(kleur.bold('\nImports left untouched:'));
    for (const skip of summary.skipped) {
      console.log(`  ${kleur.dim('-')} ${skip.spec} ${kleur.dim(`(${skip.reason}) in ${skip.files.join(', ')}`)}`);
    }
  }

  if (summary.otherLibraries.length > 0) {
    console.log(kleur.bold('\nOther icon libraries in this directory (not migrated):'));
    for (const entry of summary.otherLibraries) {
      console.log(`  ${kleur.dim('-')} ${getIconLibrary(entry.library).packageName} ${kleur.dim(`(${entry.files.length} file(s))`)}`);
    }
  }

  if (scan.failures.length > 0) {
    console.log(kleur.bold(kleur.red('\nCould not process (left unchanged):')));
    for (const failure of scan.failures) {
      console.log(`  ${kleur.red('✗')} ${failure.relativePath}: ${failure.message}`);
    }
  }
  console.log();
}

export const migrateIcons = new Command()
  .name('icons')
  .description('Rewrite icon-library imports in your component source')
  .option('--from <library>', 'icon library currently imported (default: your configured iconLibrary)')
  .requiredOption('--to <library>', `icon library to migrate to (${supportedLibraries()})`)
  .option('--yes', 'skip confirmation prompts', false)
  .action(async (opts: MigrateIconsOptions) => {
    const projectDir = resolveProjectRoot();
    const config = readConfig(projectDir);
    if (!config) {
      console.error(kleur.red('No xeyy.config.json found. Run `xeyy init` first.'));
      process.exit(3);
    }

    const to = parseIconLibrary(opts.to);
    if (!to) {
      console.error(kleur.red(`Unknown icon library "${opts.to}". Supported: ${supportedLibraries()}.`));
      process.exit(2);
    }
    const requestedFrom = parseIconLibrary(opts.from);
    if (opts.from !== undefined && !requestedFrom) {
      console.error(kleur.red(`Unknown icon library "${opts.from}". Supported: ${supportedLibraries()}.`));
      process.exit(2);
    }
    const from = requestedFrom ?? resolveIconLibrary(config);

    if (from === to) {
      console.log(kleur.yellow(`\nSource already targets ${getIconLibrary(to).displayName}. Nothing to migrate.`));
      console.log();
      return;
    }
    if (!canMigrateIconLibraries(from, to)) {
      const source = getIconLibrary(from);
      const target = getIconLibrary(to);
      console.error(kleur.red(`\nNo verified icon mappings from ${source.displayName} to ${target.displayName}.`));
      if (!source.migrationSourceSupported) {
        console.error(kleur.dim(`  ${source.displayName} has no verified migration mappings away from it.`));
      }
      if (!target.migrationTargetSupported) {
        console.error(kleur.dim(`  ${target.displayName} has no verified migration mappings into it.`));
      }
      console.error(kleur.dim('  Source was left untouched.'));
      process.exit(2);
    }

    const searchDir = resolveComponentPath(config, projectDir);
    if (!existsSync(searchDir) || !statSync(searchDir).isDirectory()) {
      console.error(kleur.red(`Components directory not found: ${searchDir}`));
      process.exit(4);
    }

    const spinner = ora('Scanning source...').start();
    let scan: IconMigrationScan;
    try {
      scan = scanProjectIconMigration({ searchDir, from, to });
      spinner.succeed(`Scanned ${scan.scanned} file(s)`);
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }

    printPlan(scan, projectDir, searchDir);

    const changedCount = scan.edits.filter((edit) => edit.changed).length;
    if (scan.failures.length > 0) {
      console.error(kleur.red('Migration aborted: fix the reported files before retrying. No source or config was changed.'));
      process.exit(1);
    }

    if (!opts.yes) {
      const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: `Migrate ${changedCount} file(s) and update xeyy.config.json?`,
        initial: false,
      });
      if (!confirm) {
        console.log(kleur.yellow('Cancelled.'));
        return;
      }
    }

    const targetPackage = getIconLibrary(to).packageName;
    const declared = declaredNpmDependencies(projectDir);
    if (declared.has(targetPackage)) {
      console.log(kleur.dim(`  ${targetPackage} already declared in package.json`));
    } else {
      const pm = detectPackageManager(projectDir);
      const installSpinner = ora(`Installing ${targetPackage} with ${pm}...`).start();
      try {
        await installDependencies(projectDir, [targetPackage]);
        installSpinner.succeed(`${targetPackage} installed`);
      } catch (error) {
        installSpinner.fail(`Failed to install ${targetPackage}`);
        console.error(kleur.red(`  ${(error as Error).message}`));
        console.log(kleur.yellow(`  Run manually: ${manualInstallCommand(projectDir, [targetPackage])}`));
        process.exit(1);
      }
    }

    try {
      const written = applyIconMigration(scan);
      console.log(kleur.green(`  ${written.length} file(s) updated`));
      writeConfig(projectDir, { ...config, iconLibrary: to });
      console.log(kleur.green(`  xeyy.config.json updated: iconLibrary = ${to}`));
    } catch (error) {
      console.error(kleur.red(`  Failed to update xeyy.config.json: ${(error as Error).message}`));
      process.exit(1);
    }

    const summary = summarizeIconMigration(scan);
    console.log();
    console.log(kleur.bold('Done.\n'));
    console.log(`  Files:    ${scan.edits.length}`);
    console.log(`  Icons:    ${summary.mapped.length} mapped to ${targetPackage}`);
    if (summary.unmapped.length > 0) {
      console.log(kleur.yellow(`  Unmapped: ${summary.unmapped.map((icon) => icon.name).join(', ')} (still imported from ${getIconLibrary(from).packageName})`));
      console.log(kleur.dim('  Add verified mappings for these icons before re-running to migrate them.'));
    }
    if (scan.failures.length > 0) {
      console.log(kleur.red(`  Failed:   ${scan.failures.length} file(s) left unchanged`));
    }
    console.log();

    if (scan.failures.length > 0) process.exit(1);
  });

export const migrate = new Command()
  .name('migrate')
  .description('Migrate existing source to a different configuration');

migrate.addCommand(migrateIcons);
