import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  xeyyConfigSchema,
  defaultConfig,
  getConfigPath,
  configExists,
  loadConfig,
  readConfig,
  writeConfig,
  createDefaultConfig,
  ensureDir,
  resolveComponentPath,
  resolveThemePath,
  resolveRegistryAlias,
  getRegistryUrl,
} from './index.ts';

const TEST_DIR = join(tmpdir(), 'xeyy-config-test');

function createTestDir(): string {
  const testDir = join(TEST_DIR, `test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(testDir, { recursive: true });
  return testDir;
}

function cleanupTestDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('xeyyConfigSchema', () => {
  it('validates a complete valid config', () => {
    const validConfig = {
      $schema: 'https://xeyy.dev/schema.json',
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      aliases: { components: '@/components' },
      iconLibrary: 'lucide',
      registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' },
    };

    const result = xeyyConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validConfig);
  });

  it('validates config with only required fields', () => {
    const minimalConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
    };

    const result = xeyyConfigSchema.safeParse(minimalConfig);
    expect(result.success).toBe(true);
  });

  it('rejects config missing components', () => {
    const invalidConfig = {
      theme: { path: 'src/styles/theme.stylex.ts' },
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects config missing theme', () => {
    const invalidConfig = {
      components: { path: 'src/components/ui' },
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects empty components.path', () => {
    const invalidConfig = {
      components: { path: '' },
      theme: { path: 'src/styles/theme.stylex.ts' },
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects empty theme.path', () => {
    const invalidConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: '' },
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('rejects invalid registries URL', () => {
    const invalidConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      registries: { '@xeyy': 'not-a-url' },
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('accepts valid registries URL template', () => {
    const validConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' },
    };

    const result = xeyyConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('accepts an optional authoring registry block', () => {
    const validConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      registry: {
        path: 'registry',
        source: 'packages/components/src',
        dist: 'dist/registry',
      },
    };

    const result = xeyyConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('accepts a themes source in the authoring registry block', () => {
    const validConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      registry: {
        path: 'registry',
        source: 'packages/components/src',
        themes: 'packages/tokens/src',
        dist: 'dist/registry',
      },
    };

    const result = xeyyConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects unknown keys in the registry block', () => {
    const invalidConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      registry: { path: 'registry', bogus: 'x' },
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('accepts $schema field', () => {
    const validConfig = {
      $schema: 'https://xeyy.dev/schema.json',
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
    };

    const result = xeyyConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('rejects unknown fields', () => {
    const invalidConfig = {
      components: { path: 'src/components/ui' },
      theme: { path: 'src/styles/theme.stylex.ts' },
      unknownField: 'value',
    };

    const result = xeyyConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});

describe('defaultConfig', () => {
  it('is valid against the schema', () => {
    const result = xeyyConfigSchema.safeParse(defaultConfig);
    expect(result.success).toBe(true);
  });

  it('has expected default values', () => {
    expect(defaultConfig.components.path).toBe('src/components/ui');
    expect(defaultConfig.theme.path).toBe('src/styles/theme.stylex.ts');
    expect(defaultConfig.aliases?.components).toBe('@/components');
    expect(defaultConfig.iconLibrary).toBe('lucide');
    expect(defaultConfig.registries?.['@xeyy']).toBe('https://xeyy.dev/r/{name}.json');
    expect(defaultConfig.$schema).toBe('https://xeyy.dev/schema.json');
  });
});

describe('config file operations', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = createTestDir();
  });

  afterEach(() => {
    cleanupTestDir(testDir);
  });

  describe('getConfigPath', () => {
    it('returns correct path', () => {
      expect(getConfigPath(testDir)).toBe(resolve(testDir, 'xeyy.config.json'));
    });
  });

  describe('configExists', () => {
    it('returns false when config does not exist', () => {
      expect(configExists(testDir)).toBe(false);
    });

    it('returns true when config exists', () => {
      writeFileSync(getConfigPath(testDir), '{}');
      expect(configExists(testDir)).toBe(true);
    });
  });

  describe('loadConfig', () => {
    it('returns error when config file does not exist', () => {
      const result = loadConfig(testDir);
      expect(result.valid).toBe(false);
      expect(result.config).toBeNull();
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]!.message).toContain('not found');
    });

    it('returns error for malformed JSON', () => {
      writeFileSync(getConfigPath(testDir), '{ invalid json');
      const result = loadConfig(testDir);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]!.message).toContain('malformed JSON');
    });

    it('returns error for invalid config', () => {
      writeFileSync(getConfigPath(testDir), JSON.stringify({ components: { path: '' }, theme: { path: 'x' } }));
      const result = loadConfig(testDir);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('loads valid config', () => {
      const validConfig = {
        components: { path: 'src/components/ui' },
        theme: { path: 'src/styles/theme.stylex.ts' },
      };
      writeFileSync(getConfigPath(testDir), JSON.stringify(validConfig));
      const result = loadConfig(testDir);
      expect(result.valid).toBe(true);
      expect(result.config).toEqual(validConfig);
      expect(result.issues).toHaveLength(0);
    });

    it('loads config with all optional fields', () => {
      const fullConfig = {
        $schema: 'https://xeyy.dev/schema.json',
        components: { path: 'src/components/ui' },
        theme: { path: 'src/styles/theme.stylex.ts' },
        aliases: { components: '@/components' },
        iconLibrary: 'lucide',
        registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' },
      };
      writeFileSync(getConfigPath(testDir), JSON.stringify(fullConfig));
      const result = loadConfig(testDir);
      expect(result.valid).toBe(true);
      expect(result.config).toEqual(fullConfig);
    });
  });

  describe('readConfig', () => {
    it('returns null when config does not exist', () => {
      expect(readConfig(testDir)).toBeNull();
    });

    it('returns null for invalid config', () => {
      writeFileSync(getConfigPath(testDir), '{ invalid');
      expect(readConfig(testDir)).toBeNull();
    });

    it('returns parsed config for valid config', () => {
      const validConfig = {
        components: { path: 'src/components/ui' },
        theme: { path: 'src/styles/theme.stylex.ts' },
      };
      writeFileSync(getConfigPath(testDir), JSON.stringify(validConfig));
      const result = readConfig(testDir);
      expect(result).toEqual(validConfig);
    });
  });

  describe('writeConfig', () => {
    it('writes valid config to disk', () => {
      const config = {
        components: { path: 'src/components/ui' },
        theme: { path: 'src/styles/theme.stylex.ts' },
      };
      writeConfig(testDir, config);
      const result = readConfig(testDir);
      expect(result).toEqual(config);
    });

    it('throws for invalid config', () => {
      const invalidConfig = {
        components: { path: '' },
        theme: { path: 'src/styles/theme.stylex.ts' },
      };
      expect(() => writeConfig(testDir, invalidConfig)).toThrow('invalid configuration');
    });
  });

  describe('createDefaultConfig', () => {
    it('creates default config file', () => {
      const config = createDefaultConfig(testDir);
      expect(config).toEqual(defaultConfig);
      expect(configExists(testDir)).toBe(true);
      const result = readConfig(testDir);
      expect(result).toEqual(defaultConfig);
    });
  });

  describe('ensureDir', () => {
    it('creates directory', () => {
      const dir = join(testDir, 'new-dir');
      ensureDir(dir);
      expect(existsSync(dir)).toBe(true);
    });

    it('creates nested directories', () => {
      const dir = join(testDir, 'a', 'b', 'c');
      ensureDir(dir);
      expect(existsSync(dir)).toBe(true);
    });
  });

  describe('resolveComponentPath', () => {
    it('resolves path relative to project dir', () => {
      const config = { ...defaultConfig, components: { path: 'src/components/ui' } };
      const resolved = resolveComponentPath(config, testDir);
      expect(resolved).toBe(resolve(testDir, 'src/components/ui'));
    });
  });

  describe('resolveThemePath', () => {
    it('resolves path relative to project dir', () => {
      const config = { ...defaultConfig, theme: { path: 'src/styles/theme.stylex.ts' } };
      const resolved = resolveThemePath(config, testDir);
      expect(resolved).toBe(resolve(testDir, 'src/styles/theme.stylex.ts'));
    });
  });

  describe('resolveRegistryAlias', () => {
    it('returns undefined when registries not configured', () => {
      const config = { ...defaultConfig, registries: undefined };
      expect(resolveRegistryAlias(config, '@xeyy')).toBeUndefined();
    });

    it('returns URL for known alias', () => {
      const config = { ...defaultConfig, registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' } };
      expect(resolveRegistryAlias(config, '@xeyy')).toBe('https://xeyy.dev/r/{name}.json');
    });

    it('returns undefined for unknown alias', () => {
      const config = { ...defaultConfig, registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' } };
      expect(resolveRegistryAlias(config, '@unknown')).toBeUndefined();
    });
  });

  describe('getRegistryUrl', () => {
    it('returns undefined when registries not configured', () => {
      const config = { ...defaultConfig, registries: undefined };
      expect(getRegistryUrl(config, '@xeyy', 'button')).toBeUndefined();
    });

    it('substitutes {name} placeholder', () => {
      const config = { ...defaultConfig, registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' } };
      expect(getRegistryUrl(config, '@xeyy', 'button')).toBe('https://xeyy.dev/r/button.json');
    });

    it('returns undefined for unknown alias', () => {
      const config = { ...defaultConfig, registries: { '@xeyy': 'https://xeyy.dev/r/{name}.json' } };
      expect(getRegistryUrl(config, '@unknown', 'button')).toBeUndefined();
    });
  });
});