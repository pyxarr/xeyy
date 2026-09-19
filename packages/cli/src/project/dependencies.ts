import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execa } from 'execa';
import { detectPackageManager } from './detect.ts';

/** npm packages already declared by the project (dependencies + devDependencies). */
export function declaredNpmDependencies(projectDir: string): Set<string> {
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

/** Command a user would run to install the given packages manually. */
export function manualInstallCommand(projectDir: string, packages: string[]): string {
  const packageManager = detectPackageManager(projectDir);
  const args = packageManager === 'npm' ? 'install --save' : 'add';
  return `${packageManager} ${args} ${packages.join(' ')}`;
}

/** Install packages with the project's detected package manager. Throws on failure. */
export async function installDependencies(projectDir: string, packages: string[]): Promise<void> {
  if (packages.length === 0) return;
  const packageManager = detectPackageManager(projectDir);
  const args = packageManager === 'npm' ? ['install', '--save'] : ['add'];
  await execa(packageManager === 'npm' ? 'npm' : packageManager, [...args, ...packages], {
    cwd: projectDir,
    stdio: 'pipe',
  });
}
