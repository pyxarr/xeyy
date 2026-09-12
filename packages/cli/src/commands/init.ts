import { Command } from 'commander';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import kleur from 'kleur';
import ora from 'ora';
import prompts from 'prompts';
import { execa } from 'execa';
import { detectProject } from '../project/detect.ts';
import { configExists, createDefaultConfig, readConfig, ensureDir, resolveThemePath } from '../config.ts';
import { loadConfiguredClient } from '../registry/client.ts';
import { stageFiles } from '../registry/install.ts';
import { resolveDistDirPath } from '../project/paths.ts';
import { printLogo } from '../logo.ts';

export const init = new Command()
  .name('init')
  .description('Initialize Xeyy in your project')
  .action(async () => {
    const projectDir = process.cwd();
    const spinner = ora('Detecting project...').start();

    try {
      const info = detectProject(projectDir);

      if (!info.hasReact) {
        spinner.fail('React not detected');
        console.error(kleur.red('\nXeyy requires React. Install react and react-dom first.'));
        process.exit(3);
      }

      if (!info.hasTypeScript) {
        spinner.fail('TypeScript not detected');
        console.error(kleur.red('\nXeyy requires TypeScript. Add a tsconfig.json first.'));
        process.exit(3);
      }

      if (!info.hasStylex) {
        spinner.warn('StyleX not detected');
        const { install } = await prompts({
          type: 'confirm',
          name: 'install',
          message: 'Install StyleX and compiler plugin?',
          initial: true,
        });
        if (install) {
          const deps = ['@stylexjs/stylex'];
          if (info.framework === 'next') deps.push('@stylexjs/nextjs-plugin');
          else if (info.framework === 'vite') deps.push('@stylexjs/vite-plugin');
          else deps.push('@stylexjs/babel-plugin');
          const installSpinner = ora('Installing StyleX...').start();
          try {
            const args = info.packageManager === 'npm' ? ['install', '--save'] : ['add'];
            await execa(info.packageManager === 'npm' ? 'npm' : info.packageManager, [...args, ...deps], { cwd: projectDir, stdio: 'pipe' });
            installSpinner.succeed('StyleX installed');
          } catch (err) {
            installSpinner.fail('Failed to install StyleX');
            console.log(kleur.yellow(`  Run manually: ${info.packageManager} add ${deps.join(' ')}`));
          }
        }
      }

      spinner.text = 'Checking configuration...';

      if (configExists(projectDir)) {
        spinner.stop();
        const existing = readConfig(projectDir);
        console.log(kleur.yellow('\nXeyy is already configured.'));
        if (existing) {
          console.log(`  Components: ${existing.components.path}`);
          console.log(`  Theme:      ${existing.theme.path}`);
          if (existing.aliases) console.log(`  Aliases:    ${existing.aliases.components}`);
          if (existing.iconLibrary) console.log(`  Icons:      ${existing.iconLibrary}`);
          const existingRegistryName = existing.registries && Object.keys(existing.registries).length > 0
            ? Object.keys(existing.registries)[0]
            : 'local';
          console.log(`  Registry:   ${existingRegistryName}`);
        }
        const { overwrite } = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: 'Reinitialize with default config?',
          initial: false,
        });
        if (!overwrite) return;
      }

      spinner.text = 'Creating configuration...';
      spinner.start();

      const config = createDefaultConfig(projectDir);
      const componentsDir = resolve(projectDir, config.components.path);
      const themeDir = resolve(projectDir, dirname(config.theme.path));

      ensureDir(componentsDir);
      ensureDir(themeDir);

      const themeTarget = resolveThemePath(config, projectDir);
      if (!existsSync(themeTarget)) {
        spinner.text = 'Scaffolding default theme...';
        try {
          const client = await loadConfiguredClient(
            config,
            () => resolveDistDirPath(config, projectDir),
            ['default-theme'],
          );
          const theme = client.items.get('default-theme');
          if (!theme) throw new Error('default-theme not found in registry');
          for (const file of stageFiles([theme], config, projectDir)) {
            ensureDir(dirname(file.target));
            writeFileSync(file.target, file.content, 'utf8');
          }
        } catch (err) {
          console.log(kleur.yellow(`  Could not scaffold default theme (${(err as Error).message}). Run \`xeyy add default-theme\` when online.`));
        }
      }

      spinner.succeed('Configuration created');

      printLogo();
      console.log(kleur.bold('Project initialized.\n'));
      console.log(`  Package manager: ${kleur.green(info.packageManager)}`);
      console.log(`  Framework:       ${kleur.green(info.framework)}`);
      console.log(`  StyleX compiler: ${info.stylexCompiler === 'none' ? kleur.yellow('not detected') : kleur.green(info.stylexCompiler)}`);
      console.log(`  Components:      ${kleur.green(config.components.path)}`);
      console.log(`  Theme:           ${kleur.green(config.theme.path)}`);
      console.log(`  Aliases:         ${kleur.green(config.aliases?.components ?? 'none')}`);
      console.log(`  Icon library:    ${kleur.green(config.iconLibrary ?? 'none')}`);
      const registryKeys = config.registries ? Object.keys(config.registries) : [];
      const registryName = registryKeys.length > 0 ? registryKeys[0]! : 'local';
      console.log(`  Registry:        ${kleur.green(registryName)}`);
      console.log();
      console.log(`  ${kleur.bold('Next step:')} xeyy add button`);
      console.log();
    } catch (error) {
      spinner.fail((error as Error).message);
      process.exit(1);
    }
  });