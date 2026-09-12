import type { RegistryItem } from '@xeyy/registry';
import type { RegistryClient } from './client.ts';

export interface ResolvedItem {
  item: RegistryItem;
  /** Topologically ordered dependencies (leaf-first, before their dependents). */
  dependencies: RegistryItem[];
}

/**
 * Resolve an item plus its transitive registry dependencies.
 * `dependencies` is ordered so that every dependency precedes the items that
 * use it — the installer must write dependencies first so components whose
 * source imports point back at them resolve.
 */
export function resolveItem(client: RegistryClient, name: string): ResolvedItem {
  const root = client.items.get(name);
  if (!root) {
    throw new Error(`Item "${name}" not found in registry`);
  }

  const order: string[] = [];
  const state = new Map<string, 0 | 1 | 2>();

  function visit(item: RegistryItem, via: string[]): void {
    const mark = state.get(item.name) ?? 0;
    if (mark === 2) return;
    if (mark === 1) {
      throw new Error(`Circular registry dependency: ${[...via, item.name].join(' → ')}`);
    }
    state.set(item.name, 1);
    for (const depName of item.registryDependencies ?? []) {
      const dep = client.items.get(depName);
      if (!dep) {
        throw new Error(`Registry dependency "${depName}" not found (required by "${item.name}")`);
      }
      visit(dep, [...via, item.name]);
    }
    state.set(item.name, 2);
    order.push(item.name);
  }

  visit(root, [name]);

  const dependencies = order.slice(0, -1).map((depName) => {
    const dep = client.items.get(depName);
    if (!dep) throw new Error(`Registry dependency "${depName}" missing after resolution`);
    return dep;
  });

  return { item: root, dependencies };
}

export function resolveAll(client: RegistryClient, names: string[]): ResolvedItem[] {
  return names.map((name) => resolveItem(client, name));
}

/** Flatten resolved items into a single deps-first install order (no duplicates). */
export function flattenResolved(resolvedItems: ResolvedItem[]): RegistryItem[] {
  const out: RegistryItem[] = [];
  const seen = new Set<string>();
  for (const resolved of resolvedItems) {
    for (const dep of resolved.dependencies) {
      if (!seen.has(dep.name)) {
        seen.add(dep.name);
        out.push(dep);
      }
    }
  }
  for (const resolved of resolvedItems) {
    if (!seen.has(resolved.item.name)) {
      seen.add(resolved.item.name);
      out.push(resolved.item);
    }
  }
  return out;
}