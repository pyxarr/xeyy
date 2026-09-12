import { Command } from 'commander';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';
import {
  analyzeStatus,
  discoverCandidates,
  generateDefinition,
  readCandidateDefinition,
  type RegistryItem,
} from '@xeyy/registry';
import { authoringPaths, readRoot, writeRoot, rel, statusGlyph } from '../registry/authoring.ts';

interface RegistrySyncOptions {
  dryRun: boolean;
  yes: boolean;
  json: boolean;
  prune: boolean;
  registry?: string;
  source?: string;
}

interface SyncAction {
  name: string;
  kind: 'generated' | 'updated' | 'pruned';
  target?: string;
}

export const registrySync = new Command()
  .name('sync')
  .description('Reconcile registry definitions with canonical source')
  .option('--dry-run', 'show the plan without writing files', false)
  .option('--yes', 'skip confirmation prompts', false)
  .option('--json', 'output as JSON', false)
  .option('--prune', 'delete definitions whose source component is gone', false)
  .option('--registry <dir>', 'registry definition directory (default: config.registry.path)')
  .option('--source <dir>', 'component source root (default: config.registry.source)')
  .action(async (opts: RegistrySyncOptions) => {
    const projectDir = process.cwd();
    const base = authoringPaths(projectDir);
    const registryDir = opts.registry ?? base.registryDir;
    const sourceDir = opts.source ?? base.sourceDir;

    const spinner = ora('Reconciling registry...').start();
    try {
      const candidates = discoverCandidates({ sourceDir, registryDir, themeSourceDir: base.themeDir });
      const report = analyzeStatus({ sourceDir, registryDir, themeSourceDir: base.themeDir, gitAvailable: false });

      const actions: SyncAction[] = [];

      for (const entry of report.entries) {
        if (entry.status === 'unchanged') continue;

        if (entry.status === 'deleted') {
          if (opts.prune) {
            actions.push({ name: entry.name, kind: 'pruned', target: entry.rel });
          }
          continue;
        }

        // new / unregistered / modified → generate (preserving existing metadata).
        const candidate = candidates.find((c) => c.rel === entry.rel);
        if (!candidate) continue;

        let existing: RegistryItem | null = null;
        if (candidate.registered) {
          const raw = readCandidateDefinition(candidate);
          if (raw) existing = raw as RegistryItem;
        }

        const g = generateDefinition(candidate, {
          registryDir,
          candidates,
          version: existing?.version,
          title: existing?.title,
          description: existing?.description,
          categories: existing?.categories,
          author: existing?.author,
          homepage: existing?.homepage,
          docs: existing?.docs,
        });
        actions.push({
          name: g.name,
          kind: existing ? 'updated' : 'generated',
          target: rel(g.name, projectDir, g.itemFilePath),
        });
      }

      if (opts.json) {
        console.log(JSON.stringify({ actions, total: actions.length }, null, 2));
        return;
      }

      spinner.stop();

      if (actions.length === 0) {
        console.log(kleur.green('\nRegistry is in sync. Nothing to do.\n'));
        return;
      }

      console.log(kleur.bold('\nSync plan\n'));
      for (const action of actions) {
        const glyph = action.kind === 'pruned' ? kleur.red('✗') : action.kind === 'updated' ? kleur.yellow('~') : kleur.green('+');
        console.log(`  ${glyph} ${action.name}${action.target ? kleur.dim(` → ${action.target}`) : ''}`);
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
          message: `Apply ${actions.length} change(s)?`,
          initial: true,
        });
        if (!confirm) {
          console.log(kleur.yellow('Cancelled.'));
          return;
        }
      }

      const writeSpinner = ora('Applying changes...').start();
      const root = readRoot(registryDir);
      let generated = 0;

      for (const action of actions) {
        const entry = report.entries.find((e) => e.name === action.name);
        const candidate = candidates.find((c) => c.rel === entry?.rel);
        if (!candidate) continue;

        if (action.kind === 'pruned') {
          const dir = join(registryDir, entry!.section, entry!.name);
          if (existsSync(dir)) {
            rmSync(dir, { recursive: true, force: true });
          }
          const defItem = `./${entry!.section}/${entry!.name}/registry.json`;
          root.items = root.items.filter((i) => i.replace(/\\/g, '/') !== defItem.replace(/\\/g, '/'));
          continue;
        }

        let existing: RegistryItem | null = null;
        if (candidate.registered) {
          const raw = readCandidateDefinition(candidate);
          if (raw) existing = raw as RegistryItem;
        }

        const probe = generateDefinition(candidate, { registryDir, candidates });
        const g = generateDefinition(candidate, {
          registryDir,
          candidates,
          version: existing?.version,
          title: existing?.title ?? probe.titleFallback,
          description: existing?.description ?? probe.descriptionFallback,
          categories: existing?.categories ?? probe.item.categories,
          author: existing?.author,
          homepage: existing?.homepage,
          docs: existing?.docs,
        });
        mkdirSync(join(registryDir, candidate.section, candidate.name), { recursive: true });
        writeFileSync(g.itemFilePath, `${JSON.stringify(g.item, null, 2)}\n`, 'utf8');
        if (!root.items.includes(g.indexEntry)) root.items.push(g.indexEntry);
        generated++;
      }

      writeRoot(registryDir, root);
      writeSpinner.succeed(`${generated} definition(s) written, ${actions.filter((a) => a.kind === 'pruned').length} pruned`);
      console.log();

      for (const action of actions) {
        console.log(`  ${statusGlyph(action.kind === 'pruned' ? 'deleted' : 'new')} ${action.name}`);
      }
      console.log();
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }
  });