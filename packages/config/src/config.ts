import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { xeyyConfigSchema, type XeyyConfig } from './schema.ts';

const CONFIG_FILE = 'xeyy.config.json';

const DEFAULT_SCHEMA_URL = 'https://xeyy-registry.vercel.app/schema/config.schema.json';

export const defaultConfig: XeyyConfig = {
  $schema: DEFAULT_SCHEMA_URL,
  components: { path: 'src/components/ui' },
  theme: { path: 'src/styles/theme.stylex.ts' },
  aliases: { components: '@/components' },
  iconLibrary: 'lucide',
  registries: { '@xeyy': 'https://xeyy-registry.vercel.app/registry' },
};

export interface ConfigValidationResult {
  valid: boolean;
  config: XeyyConfig | null;
  issues: ConfigValidationIssue[];
}

export interface ConfigValidationIssue {
  path: string;
  message: string;
}

function issuesFromZod(error: { issues: { path: (string | number | symbol)[]; message: string }[] }): ConfigValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.filter((p): p is string | number => typeof p !== 'symbol').join('.') : '(root)',
    message: issue.message,
  }));
}

export function getConfigPath(projectDir: string): string {
  return resolve(projectDir, CONFIG_FILE);
}

export function configExists(projectDir: string): boolean {
  return existsSync(getConfigPath(projectDir));
}

export function loadConfig(projectDir: string): ConfigValidationResult {
  const configPath = getConfigPath(projectDir);

  if (!existsSync(configPath)) {
    return {
      valid: false,
      config: null,
      issues: [{ path: CONFIG_FILE, message: `config file not found at ${configPath}` }],
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (e) {
    return {
      valid: false,
      config: null,
      issues: [{ path: CONFIG_FILE, message: `malformed JSON: ${(e as Error).message}` }],
    };
  }

  const parsed = xeyyConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      valid: false,
      config: null,
      issues: issuesFromZod(parsed.error),
    };
  }

  return { valid: true, config: parsed.data, issues: [] };
}

export function readConfig(projectDir: string): XeyyConfig | null {
  const result = loadConfig(projectDir);
  return result.valid ? result.config : null;
}

export function writeConfig(projectDir: string, config: XeyyConfig): void {
  const configPath = getConfigPath(projectDir);
  const parsed = xeyyConfigSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`invalid configuration: ${issuesFromZod(parsed.error).map((i) => `${i.path}: ${i.message}`).join(', ')}`);
  }
  writeFileSync(configPath, `${JSON.stringify(parsed.data, null, 2)}\n`, 'utf8');
}

export function createDefaultConfig(projectDir: string): XeyyConfig {
  writeConfig(projectDir, defaultConfig);
  return defaultConfig;
}

export function ensureDir(dirPath: string): void {
  mkdirSync(dirPath, { recursive: true });
}

export function resolveComponentPath(config: XeyyConfig, projectDir: string): string {
  return resolve(projectDir, config.components.path);
}

export function resolveThemePath(config: XeyyConfig, projectDir: string): string {
  return resolve(projectDir, config.theme.path);
}

export function resolveRegistryDir(config: XeyyConfig, projectDir: string): string {
  return resolve(projectDir, config.registry?.path ?? 'registry');
}

export function resolveRegistrySource(config: XeyyConfig, projectDir: string): string {
  return resolve(projectDir, config.registry?.source ?? 'packages/components/src');
}

export function resolveRegistryDist(config: XeyyConfig, projectDir: string): string {
  return resolve(projectDir, config.registry?.dist ?? 'dist/registry');
}

/**
 * Canonical theme source root — often a separate tokens package. Falls back to
 * the component source root when not configured (shared layout).
 */
export function resolveRegistryThemeSource(config: XeyyConfig, projectDir: string): string {
  return resolve(projectDir, config.registry?.themes ?? config.registry?.source ?? 'packages/components/src');
}

export function resolveRegistryAlias(config: XeyyConfig, alias: string): string | undefined {
  return config.registries?.[alias];
}

export function getRegistryUrl(config: XeyyConfig, alias: string, name: string): string | undefined {
  const template = resolveRegistryAlias(config, alias);
  if (!template) return undefined;
  return template.replace('{name}', name);
}