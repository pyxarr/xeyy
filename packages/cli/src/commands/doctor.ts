import { Command } from 'commander';
import { existsSync } from 'node:fs';
import kleur from 'kleur';
import { detectProject } from '../project/detect.ts';
import { resolveProjectRoot } from '../project/root.ts';
import { configExists, readConfig } from '../config.ts';
import { resolveRegistryPath } from '../project/paths.ts';
import { loadDistRegistry } from '../registry/client.ts';

interface DoctorOptions {
  json: boolean;
}

interface Check {
  name: string;
  status: 'PASS' | 'WARN' | 'ERROR';
  message: string;
}

function addCheck(checks: Check[], name: string, status: Check['status'], message: string): void {
  checks.push({ name, status, message });
}

export const doctor = new Command()
  .name('doctor')
  .description('Diagnose your project')
  .option('--json', 'output as JSON', false)
  .action((opts: DoctorOptions) => {
    const projectDir = resolveProjectRoot();
    const checks: Check[] = [];

    const info = detectProject(projectDir);

    addCheck(checks, 'React', info.hasReact ? 'PASS' : 'ERROR',
      info.hasReact ? 'React is installed' : 'React is not installed');

    addCheck(checks, 'TypeScript', info.hasTypeScript ? 'PASS' : 'WARN',
      info.hasTypeScript ? 'TypeScript configured' : 'No tsconfig.json found');

    addCheck(checks, 'StyleX', info.hasStylex ? 'PASS' : 'WARN',
      info.hasStylex ? 'StyleX is installed' : 'StyleX is not installed');

    if (info.hasStylex) {
      addCheck(checks, 'StyleX compiler', info.stylexCompiler !== 'none' ? 'PASS' : 'WARN',
        info.stylexCompiler !== 'none'
          ? `Compiler detected: ${info.stylexCompiler}`
          : 'No StyleX compiler plugin detected');
    }

    addCheck(checks, 'Configuration', configExists(projectDir) ? 'PASS' : 'WARN',
      configExists(projectDir) ? 'xeyy.config.json exists' : 'No xeyy.config.json — run xeyy init');

    if (configExists(projectDir)) {
      const config = readConfig(projectDir);
      if (config) {
        const registryPath = resolveRegistryPath(config, projectDir);
        addCheck(checks, 'Registry', existsSync(registryPath) ? 'PASS' : 'WARN',
          existsSync(registryPath)
            ? `Distributed registry at ${registryPath}`
            : `No built registry at ${registryPath} — run \`xeyy build\``);

        if (existsSync(registryPath)) {
          try {
            const client = loadDistRegistry(registryPath);
            addCheck(checks, 'Registry items', 'PASS', `${client.items.size} item(s) loaded`);
          } catch (err) {
            addCheck(checks, 'Registry items', 'ERROR', (err as Error).message);
          }
        }
      }
    }

    addCheck(checks, 'Framework', info.framework !== 'unknown' ? 'PASS' : 'WARN',
      info.framework !== 'unknown' ? `Detected: ${info.framework}` : 'Framework not detected');

    addCheck(checks, 'Package manager', 'PASS', `Detected: ${info.packageManager}`);

    if (opts.json) {
      console.log(JSON.stringify({
        checks: checks.map((c) => ({ name: c.name, status: c.status, message: c.message })),
        passed: checks.filter((c) => c.status === 'PASS').length,
        warnings: checks.filter((c) => c.status === 'WARN').length,
        errors: checks.filter((c) => c.status === 'ERROR').length,
      }, null, 2));
      return;
    }

    console.log(kleur.bold('\nXeyy doctor\n'));

    for (const check of checks) {
      const icon = check.status === 'PASS' ? kleur.green('✓')
        : check.status === 'WARN' ? kleur.yellow('!')
        : kleur.red('✗');
      const label = check.status === 'PASS' ? kleur.green(check.status)
        : check.status === 'WARN' ? kleur.yellow(check.status)
        : kleur.red(check.status);
      console.log(`  ${icon} ${label} ${kleur.bold(check.name)} — ${check.message}`);
    }

    const errors = checks.filter((c) => c.status === 'ERROR').length;
    const warnings = checks.filter((c) => c.status === 'WARN').length;

    console.log();
    if (errors > 0) {
      console.log(kleur.red(`  ${errors} error(s), ${warnings} warning(s)`));
    } else if (warnings > 0) {
      console.log(kleur.yellow(`  ${warnings} warning(s)`));
    } else {
      console.log(kleur.green('  All checks passed'));
    }
    console.log();

    process.exit(errors > 0 ? 1 : 0);
  });
