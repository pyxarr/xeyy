import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Xeyy projects are anchored by `xeyy.config.json`. Commands must resolve the
 * project root instead of assuming the process cwd, because the CLI can be
 * launched with a different working directory (e.g. `pnpm --filter xeyyui
 * start ...` runs inside `packages/cli` while the project root is an ancestor).
 *
 * Resolution order:
 * 1. nearest ancestor (including the start dir) containing `xeyy.config.json`
 * 2. otherwise, the ancestor carrying the strongest workspace/repo marker
 *    (`pnpm-workspace.yaml`, then `.git`, then `package.json`); ties go to the
 *    nearest ancestor
 * 3. otherwise the start dir, preserving cwd-relative behavior outside a project
 */
const CONFIG_FILE = 'xeyy.config.json';

const ROOT_MARKERS = ['pnpm-workspace.yaml', '.git', 'package.json'] as const;

function ancestors(startDir: string): string[] {
  const dirs: string[] = [];
  let dir = resolve(startDir);
  for (;;) {
    dirs.push(dir);
    const parent = resolve(dir, '..');
    if (parent === dir) break;
    dir = parent;
  }
  return dirs;
}

export function resolveProjectRoot(startDir = process.cwd()): string {
  const start = resolve(startDir);

  for (const dir of ancestors(start)) {
    if (existsSync(resolve(dir, CONFIG_FILE))) return dir;
  }

  let best: { dir: string; marker: number } | null = null;
  for (const dir of ancestors(start)) {
    for (let marker = 0; marker < ROOT_MARKERS.length; marker++) {
      if (existsSync(resolve(dir, ROOT_MARKERS[marker]!))) {
        if (best === null || marker < best.marker) {
          best = { dir, marker };
        }
        break;
      }
    }
  }
  if (best) return best.dir;

  return start;
}