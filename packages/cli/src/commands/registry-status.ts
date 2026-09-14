import { Command } from 'commander';
import kleur from 'kleur';
import { analyzeStatus } from '@xeyy/registry';
import { authoringPaths, requireSourceDir, statusGlyph, typeLabel } from '../registry/authoring.ts';
import { resolveProjectRoot } from '../project/root.ts';

interface RegistryStatusOptions {
  json: boolean;
  registry?: string;
  source?: string;
}

const ORDER = ['new', 'modified', 'deleted', 'unregistered', 'unchanged'] as const;

export const registryStatus = new Command()
  .name('status')
  .description('Show change status between canonical source and registry definitions')
  .option('--json', 'output as JSON', false)
  .option('--registry <dir>', 'registry definition directory (default: config.registry.path)')
  .option('--source <dir>', 'component source root (default: config.registry.source)')
  .action((opts: RegistryStatusOptions) => {
    const projectDir = resolveProjectRoot();
    const base = authoringPaths(projectDir);
    const registryDir = opts.registry ?? base.registryDir;
    const sourceDir = opts.source ?? base.sourceDir;

    requireSourceDir(sourceDir);

    const report = analyzeStatus({ sourceDir, registryDir, themeSourceDir: base.themeDir });

    if (opts.json) {
      console.log(JSON.stringify({
        entries: report.entries.map((e) => ({
          name: e.name,
          section: e.section,
          status: e.status,
          changes: e.changes,
          registered: e.registered,
        })),
        total: report.total,
      }, null, 2));
      return;
    }

    console.log(kleur.bold('\nRegistry status\n'));

    const groups = new Map<string, typeof report.entries>();
    for (const entry of report.entries) {
      const list = groups.get(entry.status) ?? [];
      list.push(entry);
      groups.set(entry.status, list);
    }

    for (const status of ORDER) {
      const entries = groups.get(status);
      if (!entries || entries.length === 0) continue;
      console.log(`  ${statusGlyph(status)} (${entries.length})`);
      for (const entry of entries) {
        const section = entry.section !== 'themes' ? entry.section : 'theme';
        const details = entry.changes.length > 0 ? kleur.dim(` — ${entry.changes.slice(0, 3).join(', ')}${entry.changes.length > 3 ? ' …' : ''}`) : '';
        console.log(`    ${kleur.green(entry.name)}${kleur.dim(` [${typeLabel(section === 'theme' ? 'registry:theme' : `registry:${section}`)}]`)}${details}`);
      }
      console.log();
    }

    const actionCount = report.entries.filter((e) => e.status !== 'unchanged').length;
    if (actionCount === 0) {
      console.log(kleur.green('  All components up to date.'));
    } else {
      console.log(kleur.dim(`  ${actionCount} item(s) need attention. Run \`xeyy registry sync\` to reconcile.`));
    }
    console.log();
  });