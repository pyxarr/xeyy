import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { rewriteTokenImports, extractTokenImports, flattenSiblingImports } from '@xeyy/registry';
import type { RegistryItem } from '@xeyy/registry';
import type { XeyyConfig } from '@xeyy/config';
import { resolveComponentPath, resolveThemePath } from '../config.ts';
import { installTargetFor } from '../project/paths.ts';

export interface StagedFile {
  item: string;
  itemType: string;
  /** Payload-relative source path (for reporting). */
  sourcePath: string;
  target: string;
  content: string;
}

export class InstallError extends Error {}

/** True when any item's embedded source imports `@xeyy/tokens` (needs a theme). */
export function requiresTheme(items: RegistryItem[]): boolean {
  for (const item of items) {
    for (const file of item.files) {
      if (!file.content) continue;
      if (extractTokenImports(file.content).length > 0) return true;
    }
  }
  return false;
}

/** Compute the absolute destination theme file (config.theme.path by default). */
export function themeTargetFile(installItems: RegistryItem[], config: XeyyConfig, projectDir: string): string {
  const theme = installItems.find(
    (item) =>
      item.type === 'registry:theme' &&
      item.files.some((file) => file.type === 'registry:theme'),
  );
  if (theme) {
    const themeFile = theme.files.find((file) => file.type === 'registry:theme')!;
    return installTargetFor('registry:theme', themeFile.path, config, projectDir).path;
  }
  return resolveThemePath(config, projectDir);
}

function safeInstallPath(p: string): string {
  if (isAbsolute(p) || p.includes('..') || p.includes('\0') || /^[\\/]/.test(p)) {
    throw new InstallError(`Unsafe install path: ${p}`);
  }
  return p.replace(/\\/g, '/');
}

/**
 * Stage every distributable file for the given items (in install order).
 * Component/block/internal/ui files get their `@xeyy/tokens` imports rewritten
 * to point at the installed theme file; themes are installed verbatim.
 * Experientially, example/documentation files are never installed.
 */
export function stageFiles(
  installItems: RegistryItem[],
  config: XeyyConfig,
  projectDir: string,
): StagedFile[] {
  const staged: StagedFile[] = [];
  const themeTarget = themeTargetFile(installItems, config, projectDir);
  const componentsDir = resolveComponentPath(config, projectDir);
  const siblingNames = installItems
    .filter((item) => item.type !== 'registry:theme')
    .map((item) => item.name);

  for (const item of installItems) {
    for (const file of item.files) {
      // Only files tagged with the item's own type are distributable.
      if (file.type !== item.type) continue;
      const path = safeInstallPath(file.target ?? file.path);
      const placement = installTargetFor(item.type, path, config, projectDir);

      let content = file.content;
      if (content === undefined) {
        throw new InstallError(
          `Item "${item.name}" is missing embedded content — build the registry first (\`xeyy build\`).`,
        );
      }

      if (item.type !== 'registry:theme') {
        const fromDir = placement.baseDir === componentsDir ? componentsDir : dirname(placement.path);
        content = rewriteTokenImports(content, fromDir, themeTarget);
        // Components install flat into the components directory; folder-style
        // sibling imports (`../button/button`) must point at the flat file
        // (`./button`) or the installed source will not resolve.
        content = flattenSiblingImports(content, siblingNames);
      }

      staged.push({
        item: item.name,
        itemType: item.type,
        sourcePath: file.path,
        target: placement.path,
        content,
      });
    }
  }

  return staged;
}

/** Human-readable project-relative path for display. */
export function displayPath(target: string, projectDir: string): string {
  const rel = relative(projectDir, target).split('\\').join('/');
  return rel.startsWith('..') ? target : rel;
}