#!/usr/bin/env node
/**
 * Real consumer E2E for the Xeyy icon system.
 *
 * Uses the freshly built CLI and registry distribution in an isolated temp
 * consumer project:
 *
 *  1. fresh project + `xeyy init` (default Lucide configuration)
 *  2. `xeyy add checkbox select dialog` (fresh dependency installation)
 *  3. consumer typecheck (tsc)
 *  4. StyleX compile (babel) + React SSR render of the real components
 *  5. `xeyy migrate icons --from lucide --to tabler --yes`
 *  6. typecheck + compile + render again (unmapped icons stay safe)
 *  7. `xeyy migrate icons --from tabler --to lucide --yes`
 *
 * Requires network for the consumer's npm installs.
 * Usage: node scripts/e2e-icons.mjs
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CLI = join(REPO_ROOT, 'packages', 'cli', 'dist', 'index.js');

const CONSUMER_DEPS = [
  'react@19.2.8',
  'react-dom@19.2.8',
  '@stylexjs/stylex@0.19.0',
  'typescript@6.0.2',
  '@types/react@19.2.18',
  '@types/react-dom@19.2.4',
  '@babel/core@8.0.1',
  '@babel/preset-typescript@8.0.1',
  '@babel/preset-react@8.0.1',
  '@stylexjs/babel-plugin@0.19.0',
];

const TSCONFIG = {
  compilerOptions: {
    target: 'es2022',
    module: 'esnext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    isolatedModules: true,
  },
  include: ['src'],
};

/**
 * The components that must render for real, with the icons each must show.
 *
 * `script` is an expression, evaluated with `h` (createElement) and `mod` (the
 * compiled component module) in scope, producing the root element. Base UI
 * parts require their Root contexts, and the checkbox indicator only renders
 * when checked, so each composition matches how the component is actually used.
 */
const RENDER_CASES = [
  {
    name: 'Checkbox',
    file: 'checkbox.tsx',
    script: `h(mod.Checkbox, { 'data-e2e': 'Checkbox', defaultChecked: true })`,
    mustRender: ['lucide-check'],
  },
  {
    name: 'Select',
    file: 'select.tsx',
    script:
      `h(mod.Select, { 'data-e2e': 'Select', defaultValue: '1' }, ` +
      `h(mod.SelectTrigger, null, h(mod.SelectValue, null, 'Option 1')))`,
    mustRender: ['lucide-chevron-down'],
  },
  {
    name: 'Dialog',
    file: 'dialog.tsx',
    script: `h(mod.Dialog, { 'data-e2e': 'Dialog' }, h(mod.DialogTitle, null, 'Hello'))`,
    mustRender: [],
  },
];

const results = [];
let failed = false;

function fail(message) {
  results.push(`FAIL  ${message}`);
  failed = true;
}

function pass(message) {
  results.push(`PASS  ${message}`);
}

function check(condition, message) {
  (condition ? pass : fail)(message);
}

/** Run a command; non-zero exits are recorded. No shell: paths may contain spaces. */
function run(label, command, args, cwd, { timeout = 300000 } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout,
    env: { ...process.env, CI: '1', NO_COLOR: '1' },
  });
  const ok = result.status === 0;
  (ok ? pass : fail)(`${label} (exit ${result.status})`);
  if (!ok) {
    const tail = `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trimEnd().split('\n').slice(-15).join('\n');
    results.push(tail.split('\n').map((line) => `      ${line}`).join('\n'));
  }
  return { ...result, ok };
}

main();

function main() {
  for (const file of [CLI, join(REPO_ROOT, 'dist', 'registry', 'index.json')]) {
    if (!existsSync(file)) {
      fail(`missing build output: ${file}. Run "pnpm --filter xeyyui build" and "pnpm build:registry" first.`);
      console.log(results.join('\n'));
      process.exitCode = 1;
      return;
    }
  }

  const root = join(tmpdir(), `xeyy-icon-e2e-${process.pid}-${Date.now()}`);
  const dir = join(root, 'consumer');
  mkdirSync(dir, { recursive: true });

  try {
    runE2E(dir);
  } catch (error) {
    fail(`unexpected: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (failed) {
      results.push(`NOTE  temp project kept for debugging: ${root}`);
      process.exitCode = 1;
    } else {
      rmSync(root, { recursive: true, force: true });
    }
  }

  console.log(results.join('\n'));
}

function runE2E(dir) {
  // ── 1. fresh project ──────────────────────────────────────────────────────
  writeFileSync(
    join(dir, 'package.json'),
    `${JSON.stringify({ name: 'xeyy-icon-e2e', private: true, type: 'module', version: '0.0.0' }, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(join(dir, 'tsconfig.json'), `${JSON.stringify(TSCONFIG, null, 2)}\n`, 'utf8');

  // Base toolchain: app deps, not registry deps. npm is run through Node so no
  // shell (and no .cmd shim) is involved.
  run(
    'npm install (consumer base deps)',
    process.execPath,
    [join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'), 'install', '--no-audit', '--no-fund', '--loglevel=error', ...CONSUMER_DEPS],
    dir,
  );

  // Freshly regenerated distribution, copied in so init/add resolve it locally.
  mkdirSync(join(dir, 'dist'), { recursive: true });
  cpSync(join(REPO_ROOT, 'dist', 'registry'), join(dir, 'dist', 'registry'), { recursive: true });

  // ── 2. xeyy init (default Lucide) ─────────────────────────────────────────
  run('xeyy init', process.execPath, [CLI, 'init'], dir);
  const config = JSON.parse(readFileSync(join(dir, 'xeyy.config.json'), 'utf8'));
  check(config.iconLibrary === 'lucide', `init defaults iconLibrary to lucide (got ${config.iconLibrary})`);
  check(existsSync(join(dir, 'src', 'styles', 'theme.stylex.ts')), 'init scaffolded the theme');

  // ── 3. add checkbox select dialog ─────────────────────────────────────────
  const add = run('xeyy add checkbox select dialog', process.execPath, [CLI, 'add', 'checkbox', 'select', 'dialog', '--yes'], dir);
  if (add.ok) {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    check(
      ['@base-ui/react', 'lucide-react', '@stylexjs/stylex'].every((name) => pkg.dependencies?.[name]),
      'add installed registry dependencies (@base-ui/react, lucide-react, @stylexjs/stylex)',
    );
    check(
      RENDER_CASES.every((c) => existsSync(join(dir, 'src', 'components', 'ui', c.file))),
      'add wrote checkbox.tsx, select.tsx, dialog.tsx',
    );
  }

  // Unmapped-icon fixture, authored by the consumer.
  writeFileSync(
    join(dir, 'src', 'components', 'ui', 'custom-badge.tsx'),
    `import { Check, Sparkles } from 'lucide-react';\n\nexport function CustomBadge() {\n  return (\n    <span>\n      <Check data-icon="inline-start" />\n      <Sparkles data-icon="inline-end" />\n      Ready\n    </span>\n  );\n}\n`,
    'utf8',
  );

  // ── 4. typecheck + compile + render (Lucide) ──────────────────────────────
  const tsc = join(dir, 'node_modules', 'typescript', 'bin', 'tsc');
  run('consumer typecheck (lucide)', process.execPath, [tsc, '--noEmit'], dir);
  renderAll(dir, compileConsumer(dir), RENDER_CASES, 'lucide');

  // ── 5. migrate lucide → tabler ────────────────────────────────────────────
  const migrate = run('xeyy migrate icons --from lucide --to tabler', process.execPath, [CLI, 'migrate', 'icons', '--from', 'lucide', '--to', 'tabler', '--yes'], dir);
  if (migrate.ok) {
    const after = JSON.parse(readFileSync(join(dir, 'xeyy.config.json'), 'utf8'));
    check(after.iconLibrary === 'tabler', `migration set iconLibrary=tabler (got ${after.iconLibrary})`);
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    check(Boolean(pkg.dependencies?.['@tabler/icons-react']), 'migration installed @tabler/icons-react');
    check(readFileSync(join(dir, 'src', 'components', 'ui', 'checkbox.tsx'), 'utf8').includes('@tabler/icons-react'), 'checkbox.tsx migrated to @tabler/icons-react');
    const badge = readFileSync(join(dir, 'src', 'components', 'ui', 'custom-badge.tsx'), 'utf8');
    check(badge.includes("import { Sparkles } from 'lucide-react'"), 'unmapped Sparkles kept on lucide-react');
    check(badge.includes('IconCheck'), 'mapped Check migrated in custom-badge.tsx');
  }

  // ── 6. typecheck + compile + render (Tabler) ──────────────────────────────
  run('consumer typecheck (tabler)', process.execPath, [tsc, '--noEmit'], dir);
  const tablerBuild = compileConsumer(dir);
  const tablerCases = RENDER_CASES.map((c) => ({
    ...c,
    mustRender: c.mustRender.map((marker) => marker.replace('lucide-', 'tabler-icon-')),
  }));
  renderAll(dir, tablerBuild, tablerCases, 'tabler');

  // Unmapped-icon fixture must render mapped Tabler Check and keep Lucide Sparkles.
  const badgeModule = join(tablerBuild, 'components', 'ui', 'custom-badge.mjs');
  const badgeHtml = renderCompiled(dir, badgeModule, { name: 'CustomBadge', script: `h(mod.CustomBadge, { 'data-e2e': 'CustomBadge' })` });
  check(badgeHtml.includes('tabler-icon-check') && badgeHtml.includes('lucide-sparkles'), 'custom-badge rendered Tabler Check + unmapped Lucide Sparkles');
  check(badgeHtml.includes('data-icon="inline-start"') && badgeHtml.includes('data-icon="inline-end"'), 'custom-badge kept data-icon positions');

  // ── 7. migrate back to lucide ─────────────────────────────────────────────
  const back = run('xeyy migrate icons --from tabler --to lucide', process.execPath, [CLI, 'migrate', 'icons', '--from', 'tabler', '--to', 'lucide', '--yes'], dir);
  if (back.ok) {
    const after = JSON.parse(readFileSync(join(dir, 'xeyy.config.json'), 'utf8'));
    check(after.iconLibrary === 'lucide', `migrate-back set iconLibrary=lucide (got ${after.iconLibrary})`);
    check(readFileSync(join(dir, 'src', 'components', 'ui', 'checkbox.tsx'), 'utf8').includes('lucide-react'), 'checkbox.tsx migrated back to lucide-react');
  }
  run('consumer typecheck (migrated back)', process.execPath, [tsc, '--noEmit'], dir);
  renderAll(dir, compileConsumer(dir), RENDER_CASES, 'lucide (migrated back)');
}

function renderAll(dir, buildDir, cases, label) {
  for (const component of cases) {
    try {
      const html = renderCompiled(dir, join(buildDir, 'components', 'ui', component.file.replace(/\.tsx$/, '.mjs')), component);
      const missing = component.mustRender.filter((marker) => !html.includes(marker));
      check(missing.length === 0, `${component.name} rendered (${label})${missing.length > 0 ? ` — missing ${missing.join(', ')}` : ''}`);
    } catch (error) {
      fail(`${component.name} render (${label}): ${error instanceof Error ? error.message.split('\n')[0] : error}`);
    }
  }
}

/** Compile every installed component + theme with the StyleX babel plugin. */
function compileConsumer(dir) {
  const outDir = join(dir, 'build');
  const srcDir = join(dir, 'src');
  const targets = [];
  const uiDir = join(srcDir, 'components', 'ui');
  for (const file of readdirSync(uiDir)) {
    if (file.endsWith('.tsx')) targets.push(join(uiDir, file));
  }
  const themeFile = join(srcDir, 'styles', 'theme.stylex.ts');
  if (existsSync(themeFile)) targets.push(themeFile);

  // Mirror the source tree so relative imports (e.g. ../../styles/theme.stylex)
  // keep resolving, then give the emitted relative specifiers explicit .mjs
  // extensions so plain Node ESM can execute them.
  for (const file of targets) {
    const relative = file.slice(srcDir.length + 1).replace(/\\/g, '/');
    const outFile = join(outDir, relative.replace(/\.tsx?$/, '.mjs'));
    mkdirSync(dirname(outFile), { recursive: true });
    const code = transformFile(dir, file).replace(
      /(\bfrom\s+['"])(\.{1,2}\/[^'"]+?)(['"])/g,
      (match, prefix, specifier, suffix) =>
        specifier.endsWith('.stylex')
          ? `${prefix}${specifier}.mjs${suffix}` // `.stylex` is a naming suffix, not a Node extension
          : /\.[a-z]+$/.test(specifier)
            ? match
            : `${prefix}${specifier}.mjs${suffix}`,
    );
    writeFileSync(outFile, code, 'utf8');
  }
  return outDir;
}

/** Babel + StyleX transform for one consumer source file. */
function transformFile(dir, file) {
  const require = createRequire(join(dir, 'package.json'));
  const babel = require('@babel/core');
  const stylexPlugin = require('@stylexjs/babel-plugin');
  const presetTypescript = require('@babel/preset-typescript');
  const presetReact = require('@babel/preset-react');
  const unwrap = (mod) => (mod && mod.default ? mod.default : mod);
  const out = babel.transformFileSync(file, {
    babelrc: false,
    configFile: false,
    cwd: dir,
    root: dir,
    presets: [[unwrap(presetTypescript)], [unwrap(presetReact), { runtime: 'automatic' }]],
    plugins: [[unwrap(stylexPlugin), { dev: true, runtimeInjection: false, unstable_moduleResolution: { type: 'commonJS', rootDir: dir } }]],
    filename: file,
  });
  return out.code;
}

/** SSR-render one component composition from its compiled module. */
function renderCompiled(dir, moduleFile, component) {
  const script = [
    `import { createElement as h } from 'react';`,
    `import { renderToStaticMarkup } from 'react-dom/server';`,
    `import * as mod from ${JSON.stringify(pathToFileURL(moduleFile).href)};`,
    `const root = ${component.script};`,
    `if (root == null) throw new Error('render produced no root element');`,
    `console.log(renderToStaticMarkup(root));`,
  ].join('\n');
  const runner = join(dirname(moduleFile), `render-${component.name}.mjs`);
  writeFileSync(runner, script, 'utf8');
  const result = spawnSync(process.execPath, [runner], { cwd: dir, encoding: 'utf8', timeout: 60000 });
  if (result.status !== 0) {
    throw new Error(`render of ${component.name} failed: ${result.stderr?.slice(-500)}`);
  }
  return result.stdout;
}

