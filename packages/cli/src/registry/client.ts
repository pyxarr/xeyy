import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { RegistryIndex, RegistryItem } from '@xeyy/registry';

export interface RegistryClient {
  index: RegistryIndex;
  items: Map<string, RegistryItem>;
  /** Path to the <output> dir (file source) or base URL (remote source). */
  source: string;
  remote: boolean;
}

/** Load a built registry distribution from a local `dist/registry` directory. */
export function loadDistRegistry(distDir: string): RegistryClient {
  const indexFile = join(distDir, 'index.json');
  if (!existsSync(indexFile)) {
    throw new Error(`Built registry index not found at ${indexFile}. Run \`xeyy build\` first.`);
  }

  const index = JSON.parse(readFileSync(indexFile, 'utf8')) as RegistryIndex;
  const items = new Map<string, RegistryItem>();

  for (const entry of index.items) {
    const itemFile = resolve(distDir, entry.path);
    if (!existsSync(itemFile)) {
      throw new Error(`Registry item payload missing: ${itemFile} (referenced by ${entry.name})`);
    }
    const item = JSON.parse(readFileSync(itemFile, 'utf8')) as RegistryItem;
    items.set(item.name, item);
  }

  return { index, items, source: distDir, remote: false };
}

/**
 * Load a built registry distribution from a remote base URL, e.g.
 * `https://xeyy-registry.vercel.app/registry` where `<base>/index.json` and
 * `<base>/<entry.path>` are served.
 */
export async function loadRemoteRegistry(baseUrl: string): Promise<RegistryClient> {
  const indexUrl = `${baseUrl.replace(/\/$/, '')}/index.json`;
  const res = await fetch(indexUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch registry index from ${indexUrl} (${res.status})`);
  }
  const index = (await res.json()) as RegistryIndex;

  const items = new Map<string, RegistryItem>();
  for (const entry of index.items) {
    const itemUrl = `${baseUrl.replace(/\/$/, '')}/${entry.path}`;
    const itemRes = await fetch(itemUrl);
    if (!itemRes.ok) {
      throw new Error(`Failed to fetch registry item ${entry.name} from ${itemUrl} (${itemRes.status})`);
    }
    const item = (await itemRes.json()) as RegistryItem;
    items.set(item.name, item);
  }

  return { index, items, source: baseUrl, remote: true };
}

export type { RegistryIndex, RegistryItem };

/**
 * Load registry items from a per-item URL template such as
 * `https://example.com/r/{name}.json`. Seeds the fetch with the requested names
 * and BFS-follows `registryDependencies` until the closure is loaded.
 *
 * The default config uses the base-URL form (`loadRemoteRegistry`), which
 * matches the deployed layout (`<base>/index.json` + `<base>/<entry.path>`).
 * Keep this template form for custom single-URL registries.
 */
export async function loadRemoteByTemplate(template: string, seedNames: string[]): Promise<RegistryClient> {
  const items = new Map<string, RegistryItem>();
  const queue = [...seedNames];
  const seen = new Set<string>();

  while (queue.length > 0) {
    const name = queue.shift()!;
    if (seen.has(name)) continue;
    seen.add(name);

    const url = template.replace('{name}', name);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch registry item "${name}" from ${url} (${res.status})`);
    }
    const item = (await res.json()) as RegistryItem;
    items.set(item.name, item);

    for (const dep of item.registryDependencies ?? []) {
      if (!seen.has(dep)) queue.push(dep);
    }
  }

  const index: RegistryIndex = {
    $schema: 'https://xeyy-registry.vercel.app/schema/registry-index.json',
    name: 'Remote Registry',
    items: Array.from(items.entries()).map(([name, item]) => ({
      name,
      section: item.type.startsWith('registry:theme') ? 'themes' : item.type.split(':')[1] ?? 'ui',
      type: item.type,
      version: item.version,
      ...(item.title ? { title: item.title } : {}),
      ...(item.description ? { description: item.description } : {}),
      fileCount: item.files.length,
      path: name,
    })),
  };

  return { index, items, source: template, remote: true };
}

export function getItem(client: RegistryClient, name: string): RegistryItem | undefined {
  return client.items.get(name);
}

export function searchItems(client: RegistryClient, query: string): RegistryItem[] {
  const q = query.toLowerCase();
  return Array.from(client.items.values()).filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.title?.toLowerCase().includes(q) ?? false) ||
      (item.description?.toLowerCase().includes(q) ?? false) ||
      (item.categories?.some((c) => c.toLowerCase().includes(q)) ?? false),
  );
}

export function listItems(client: RegistryClient): RegistryItem[] {
  const items = Array.from(client.items.values());
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

/** Validate an item payload shape expected by consuming commands. */
export function isRegistryItem(value: unknown): value is RegistryItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<RegistryItem>;
  return typeof v.name === 'string' && typeof v.type === 'string' && Array.isArray(v.files);
}

/**
 * Load the configured registry client for a project: the built distribution
 * when a local `dist/registry` exists (authoring mode), otherwise a remote
 * registry from `config.registries` (template or base-URL form).
 */
export async function loadConfiguredClient(
  config: { registries?: Record<string, string> },
  resolveDist: () => string,
  seedNames: string[],
): Promise<RegistryClient> {
  const dist = resolveDist();
  if (existsSync(join(dist, 'index.json'))) {
    return loadDistRegistry(dist);
  }

  const template = config.registries ? Object.values(config.registries)[0] : undefined;
  if (!template) {
    throw new Error(
      `No registry available. Build the local distribution (\`xeyy build\`) or configure a registry URL.`,
    );
  }
  return template.includes('{name}')
    ? loadRemoteByTemplate(template, seedNames)
    : loadRemoteRegistry(template);
}