import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';
import {
  discoverCandidates,
  generateDefinition,
  type RegistryCandidate,
} from '@xeyy/registry';
import { authoringPaths, readRoot, writeRoot, rel } from '../registry/authoring.ts';
import { resolveProjectRoot } from '../project/root.ts';

interface RegistryAddOptions {
  yes: boolean;
  dryRun: boolean;
  json: boolean;
  force: boolean;
  title?: string;
  description?: string;
  registry?: string;
  source?: string;
  all: boolean;
}

function selectCandidates(
  candidates: RegistryCandidate[],
  names: string[],
): RegistryCandidate[] {
  if (names.length === 0) return candidates.filter((c) => !c.registered);
  const selected: RegistryCandidate[] = [];
  for (const wanted of names) {
    const match = candidates.filter(
      (c) => c.name === wanted || c.rel === wanted || c.rel.endsWith(`/${wanted}`),
    );
    if (match.length === 0) {
      throw new Error(`No component "${wanted}" found in source. Check \`xeyy registry status\`.`);
    }
    selected.push(...match);
  }
  return selected;
}

export const registryAdd = new Command()
  .name('add')
  .description('Register source components into the registry (create definitions)')
  .argument('[names...]', 'component names to register; interactive when omitted')
  .option('--all', 'register every unregistered component without prompting', false)
  .option('--force', 'overwrite an existing definition', false)
  .option('--yes', 'skip confirmation prompts', false)
  .option('--dry-run', 'show plan without writing files', false)
  .option('--json', 'output as JSON', false)
  .option('--title <title>', 'override title')
  .option('--description <description>', 'override description')
  .option('--registry <dir>', 'registry definition directory (default: config.registry.path)')
  .option('--source <dir>', 'component source root (default: config.registry.source)')
  .action(async (names: string[], opts: RegistryAddOptions) => {
    const projectDir = resolveProjectRoot();
    const spinner = ora('Discovering components...').start();

    try {
      const base = authoringPaths(projectDir);
      const registryDir = opts.registry ?? base.registryDir;
      const sourceDir = opts.source ?? base.sourceDir;

      if (!existsSync(sourceDir)) {
        spinner.fail(`Component source not found at ${sourceDir}`);
        console.error(kleur.dim('  Expected layout: <source>/ui, <source>/components, <source>/blocks, <source>/themes, <source>/internal'));
        process.exit(4);
      }

      const candidates = discoverCandidates({ sourceDir, registryDir, themeSourceDir: base.themeDir });
      spinner.stop();

      let requested = selectCandidates(candidates, names);
      if (names.length === 0 && !opts.all) {
        const eligible = requested;
        if (eligible.length === 0) {
          console.log(kleur.green('\nAll source components are already registered. Nothing to add.\n'));
          return;
        }
        const choices = eligible.map((c) => ({
          title: `${c.name}${c.registered ? kleur.dim(' (update)') : kleur.dim(` (${c.section})`)}`,
          value: c.rel,
        }));
        const { picked } = await prompts({
          type: 'multiselect',
          name: 'picked',
          message: 'Register components:',
          choices,
        });
        if (!picked || picked.length === 0) {
          console.log(kleur.yellow('\nCancelled. Nothing registered.\n'));
          return;
        }
        requested = eligible.filter((c) => picked.includes(c.rel));
      }

      // Filter out already-registered unless --force.
      let toRegister = requested;
      if (!opts.force) {
        toRegister = requested.filter((c) => !c.registered);
        const skipped = requested.filter((c) => c.registered);
        if (skipped.length > 0 && !opts.json) {
          console.log(kleur.yellow(`  Skipping already registered: ${skipped.map((c) => c.name).join(', ')} (use --force to regenerate)`));
        }
      }

      if (toRegister.length === 0) {
        console.log(kleur.dim('Nothing to register.'));
        return;
      }

      if (!opts.json) {
        console.log(kleur.bold('Registration plan\n'));
        for (const c of toRegister) {
          console.log(`  ${kleur.green('+')} ${c.name}${kleur.dim(` (${c.section})`)} → ${rel(c.name, projectDir, join(registryDir, c.section, c.name))}`);
        }
        console.log();
      }

      if (opts.dryRun) {
        console.log(kleur.dim('Dry run — no files written.'));
        return;
      }

      if (!opts.yes) {
        const { confirm } = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: `Register ${toRegister.length} component(s)?`,
          initial: true,
        });
        if (!confirm) {
          console.log(kleur.yellow('Cancelled.'));
          return;
        }
      }

      const root = readRoot(registryDir);
      const generated: { name: string; indexEntry: string; itemFilePath: string }[] = [];
      const errors: string[] = [];

      for (const candidate of toRegister) {
        try {
          // First pass: resolve suggestions (title/description/categories).
          const suggested = generateDefinition(candidate, { registryDir, candidates });

          let title = opts.title ?? suggested.titleFallback;
          let description = opts.description ?? suggested.descriptionFallback;
          let categories = suggested.item.categories ?? [];

          // Interactive pass: only ask for metadata that cannot be reliably
          // determined — description and category confirmation. Everything else
          // is derived automatically.
          const interactive = !opts.json && !opts.yes && !opts.dryRun;
          if (interactive) {
            const { description: desc } = await prompts({
              type: 'text',
              name: 'description',
              message: `Description for ${candidate.name}:`,
              initial: description,
            });
            if (typeof desc === 'string' && desc.trim().length > 0) {
              description = desc.trim();
            }

            const suggestedValues = new Set(categories);
            const categoryChoices = [
              { title: 'Form', value: 'form' },
              { title: 'Navigation', value: 'navigation' },
              { title: 'Overlay', value: 'overlay' },
              { title: 'Layout', value: 'layout' },
              { title: 'Data display', value: 'data-display' },
              { title: 'Feedback', value: 'feedback' },
              { title: 'Typography', value: 'typography' },
              { title: 'Media', value: 'media' },
              { title: 'Marketing', value: 'marketing' },
              { title: 'Dashboard', value: 'dashboard' },
              { title: 'Authentication', value: 'authentication' },
              { title: 'Settings', value: 'settings' },
              { title: 'Ecommerce', value: 'ecommerce' },
              { title: 'Interactive', value: 'interactive' },
              { title: 'Animated', value: 'animated' },
              { title: 'Accessible', value: 'accessible' },
              { title: 'Client only', value: 'client-only' },
              { title: 'Server compatible', value: 'server-compatible' },
            ].map((choice) => ({ ...choice, selected: suggestedValues.has(choice.value) }));
            const { selected } = await prompts({
              type: 'multiselect',
              name: 'selected',
              message: `Categories for ${candidate.name}:`,
              choices: categoryChoices,
              instructions: false,
              hint: 'space to toggle, enter to confirm',
            });
            if (Array.isArray(selected)) {
              categories = selected
                .map((idx: number) => categoryChoices[idx]?.value)
                .filter((v: string | undefined): v is string => Boolean(v));
            }
          }

          const g = generateDefinition(candidate, {
            registryDir,
            candidates,
            title,
            description: description.length > 0 ? description : undefined,
            categories: categories.length > 0 ? categories : undefined,
          });
          mkdirSync(join(registryDir, candidate.section, candidate.name), { recursive: true });
          writeFileSync(g.itemFilePath, `${JSON.stringify(g.item, null, 2)}\n`, 'utf8');
          generated.push({ name: g.name, indexEntry: g.indexEntry, itemFilePath: g.itemFilePath });
        } catch (error) {
          errors.push(`  ${kleur.red((error as Error).message)}`);
        }
      }

      if (errors.length > 0) {
        console.log(kleur.red('Registration failed:'));
        console.log(errors.join('\n'));
        process.exit(1);
      }

      for (const g of generated) {
        if (!root.items.includes(g.indexEntry)) root.items.push(g.indexEntry);
      }
      writeRoot(registryDir, root);

      if (opts.json) {
        console.log(JSON.stringify({
          registered: generated.map((g) => ({ name: g.name, file: g.itemFilePath })),
          rootItems: root.items,
        }, null, 2));
        return;
      }

      const writeSpinner = ora('Writing definitions...').start();
      writeSpinner.succeed(`${generated.length} definition(s) written`);
      console.log(kleur.green('\nRegistered:'));
      for (const g of generated) {
        console.log(`  ✓ ${g.name}`);
      }
      console.log();
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }
  });