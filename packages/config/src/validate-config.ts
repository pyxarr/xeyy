import { existsSync, statSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadConfig,
  resolveComponentPath,
  resolveThemePath,
  resolveRegistryDir,
  resolveRegistrySource,
  resolveRegistryDist,
  resolveRegistryThemeSource,
} from './index.ts';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '../../../..');

function isWithin(dir: string, candidate: string): boolean {
  const rel = relative(dir, candidate);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

function safeResolved(value: string, baseDir: string): string | undefined {
  if (isAbsolute(value) || value.includes('\0') || /[\\/]$/.test(value)) {
    return undefined;
  }
  const resolved = resolve(baseDir, value);
  return isWithin(baseDir, resolved) ? resolved : undefined;
}

function isFile(p: string): boolean {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function print(label: string, issues: { path: string; message: string }[]): void {
  if (issues.length === 0) {
    console.log(`  ✓ ${label}`);
    return;
  }
  console.log(`  ✗ ${label}`);
  for (const issue of issues) {
    console.log(`    - ${issue.path || '(root)'}: ${issue.message}`);
  }
}

function main(): void {
  const projectDir = resolve(process.argv[2] ?? REPO_ROOT);
  console.log(`Validating Xeyy configuration: ${resolve(projectDir, 'xeyy.config.json')}\n`);

  const result = loadConfig(projectDir);
  const schemaIssues = result.valid ? [] : result.issues;
  const pathIssues: { path: string; message: string }[] = [];

  if (result.valid && result.config) {
    const config = result.config;
    const authoring = config.registry !== undefined;

    const components = safeResolved(config.components.path, projectDir);
    if (!components) {
      pathIssues.push({ path: 'components.path', message: `unsafe path "${config.components.path}"` });
    } else if (authoring && !isDir(components)) {
      pathIssues.push({ path: 'components.path', message: `directory does not exist: ${config.components.path}` });
    }

    const theme = safeResolved(config.theme.path, projectDir);
    if (!theme) {
      pathIssues.push({ path: 'theme.path', message: `unsafe path "${config.theme.path}"` });
    } else if (authoring && !isFile(theme)) {
      pathIssues.push({ path: 'theme.path', message: `file does not exist: ${config.theme.path}` });
    }

    if (authoring) {
      const registryDir = safeResolved(config.registry!.path ?? 'registry', projectDir);
      if (!registryDir) {
        pathIssues.push({ path: 'registry.path', message: `unsafe path "${config.registry!.path ?? 'registry'}"` });
      } else if (!isDir(registryDir)) {
        pathIssues.push({ path: 'registry.path', message: `directory does not exist: ${config.registry!.path ?? 'registry'}` });
      }

      const sourceDir = safeResolved(config.registry!.source ?? 'packages/components/src', projectDir);
      if (!sourceDir) {
        pathIssues.push({ path: 'registry.source', message: `unsafe path "${config.registry!.source ?? 'packages/components/src'}"` });
      } else if (!isDir(sourceDir)) {
        pathIssues.push({ path: 'registry.source', message: `directory does not exist: ${config.registry!.source ?? 'packages/components/src'}` });
      }

      const themesDir = safeResolved(config.registry!.themes ?? 'packages/components/src', projectDir);
      if (!themesDir) {
        pathIssues.push({ path: 'registry.themes', message: `unsafe path "${config.registry!.themes ?? 'packages/components/src'}"` });
      } else if (!isDir(themesDir)) {
        pathIssues.push({ path: 'registry.themes', message: `directory does not exist: ${config.registry!.themes ?? 'packages/components/src'}` });
      }

      const distDir = safeResolved(config.registry!.dist ?? 'dist/registry', projectDir);
      if (!distDir) {
        pathIssues.push({ path: 'registry.dist', message: `unsafe path "${config.registry!.dist ?? 'dist/registry'}"` });
      }
      // The dist dir is build output; it is intentionally not required to exist yet.
    }
  }

  const labelFor = (p: string): string => {
    const rel = relative(projectDir, p);
    return rel.startsWith('..') ? p : rel;
  };

  if (result.valid && result.config) {
    console.log(`  ${labelFor(resolveComponentPath(result.config, projectDir))}   components.path`);
    console.log(`  ${labelFor(resolveThemePath(result.config, projectDir))}   theme.path`);
    if (result.config.registry) {
      console.log(`  ${labelFor(resolveRegistryDir(result.config, projectDir))}   registry.path (definitions)`);
      console.log(`  ${labelFor(resolveRegistrySource(result.config, projectDir))}   registry.source (components)`);
      console.log(`  ${labelFor(resolveRegistryThemeSource(result.config, projectDir))}   registry.themes (theme source)`);
      console.log(`  ${labelFor(resolveRegistryDist(result.config, projectDir))}   registry.dist (build output)`);
    }
    console.log();
  }

  print('config schema', schemaIssues);
  print('path safety / existence', pathIssues);
  console.log(`  ✓ aliases.components = ${result.config?.aliases?.components ?? "(default) '@/components'"}`);

  if (!existsSync(resolve(projectDir, 'xeyy.config.json'))) {
    console.error('\nConfig missing — xeyy.config.json does not exist.');
    process.exit(1);
  }

  const failed = schemaIssues.length + pathIssues.length;
  console.log(`\n${failed === 0 ? 'Config OK.' : `Config invalid (${failed} failing section(s)).`}`);
  process.exit(failed === 0 ? 0 : 1);
}

main();