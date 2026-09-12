import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type PackageManager = 'pnpm' | 'yarn' | 'npm' | 'bun';

export type Framework = 'next' | 'vite' | 'react' | 'unknown';

export type StylexCompiler = 'babel' | 'vite' | 'webpack' | 'none';

export interface ProjectInfo {
  packageManager: PackageManager;
  framework: Framework;
  hasReact: boolean;
  hasTypeScript: boolean;
  stylexCompiler: StylexCompiler;
  hasStylex: boolean;
  rootDir: string;
}

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function findUp(startDir: string, filename: string): string | null {
  let dir = startDir;
  while (true) {
    if (existsSync(resolve(dir, filename))) return dir;
    const parent = resolve(dir, '..');
    if (parent === dir) return null;
    dir = parent;
  }
}

export function detectPackageManager(rootDir: string): PackageManager {
  const lockfileDir = findUp(rootDir, 'pnpm-lock.yaml');
  if (lockfileDir) return 'pnpm';
  if (existsSync(resolve(rootDir, 'yarn.lock'))) return 'yarn';
  if (existsSync(resolve(rootDir, 'bun.lock'))) return 'bun';
  if (existsSync(resolve(rootDir, 'package-lock.json'))) return 'npm';
  return 'npm';
}

export function detectFramework(rootDir: string): Framework {
  if (existsSync(resolve(rootDir, 'next.config.js')) || existsSync(resolve(rootDir, 'next.config.mjs')) || existsSync(resolve(rootDir, 'next.config.ts'))) return 'next';
  if (existsSync(resolve(rootDir, 'vite.config.ts')) || existsSync(resolve(rootDir, 'vite.config.js')) || existsSync(resolve(rootDir, 'vite.config.mjs'))) return 'vite';
  const pkg = readJsonSafe(resolve(rootDir, 'package.json'));
  if (pkg && typeof pkg === 'object' && 'dependencies' in pkg) {
    const deps = pkg.dependencies as Record<string, string> | undefined;
    if (deps && ('react' in deps || 'react-dom' in deps)) return 'react';
  }
  return 'unknown';
}

export function detectStylexCompiler(rootDir: string): StylexCompiler {
  const allDeps: Record<string, string> = {};
  let dir = rootDir;
  for (let i = 0; i < 5; i++) {
    const pkg = readJsonSafe(resolve(dir, 'package.json'));
    if (pkg) {
      Object.assign(allDeps, {
        ...((pkg.dependencies as Record<string, string>) ?? {}),
        ...((pkg.devDependencies as Record<string, string>) ?? {}),
      });
    }
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  if ('@stylexjs/babel-plugin' in allDeps || '@stylexjs/nextjs-plugin' in allDeps) return 'babel';
  if ('@stylexjs/vite-plugin' in allDeps) return 'vite';
  if ('@stylexjs/webpack-plugin' in allDeps) return 'webpack';
  if ('@stylexjs/stylex' in allDeps) return 'none';
  return 'none';
}

export function detectProject(rootDir: string): ProjectInfo {
  const pkg = readJsonSafe(resolve(rootDir, 'package.json'));
  const allDeps = pkg
    ? {
        ...((pkg.dependencies as Record<string, string>) ?? {}),
        ...((pkg.devDependencies as Record<string, string>) ?? {}),
      }
    : {};

  return {
    packageManager: detectPackageManager(rootDir),
    framework: detectFramework(rootDir),
    hasReact: 'react' in allDeps,
    hasTypeScript: existsSync(resolve(rootDir, 'tsconfig.json')),
    stylexCompiler: detectStylexCompiler(rootDir),
    hasStylex: '@stylexjs/stylex' in allDeps,
    rootDir,
  };
}
