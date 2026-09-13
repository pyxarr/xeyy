import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONTRACT_KEYS } from './contract.ts';
import { BASE_COLORS } from './base-colors/index.ts';
import { THEMES } from './themes/index.ts';
import { composeThemePair } from './compose.ts';
import { STYLE_NAMES, PART_NAMES, PART_RECIPE_KEYS } from './styles/recipe.ts';
import { STYLE_RECIPES } from './styles/values.ts';
import { validate } from './validate.ts';
import { renderDefaultThemeSource } from '../scripts/generate-theme.ts';

test('validate runs and counts match the registered data', () => {
  const summary = validate();
  assert.equal(summary.baseColors, 7);
  assert.equal(summary.themes, 17);
  assert.equal(summary.compositions, 7 * 18);
  assert.equal(summary.styles, 8);
});

test('every base color exposes exactly the contract keys in both modes', () => {
  for (const base of BASE_COLORS) {
    for (const mode of ['light', 'dark'] as const) {
      const keys = Object.keys(base[mode]).sort();
      assert.deepEqual(keys, [...CONTRACT_KEYS].sort(), `${base.name}.${mode}`);
    }
  }
});

test('every theme overlay keys are a non-empty subset of the contract', () => {
  const allowed = new Set(CONTRACT_KEYS);
  for (const theme of THEMES) {
    for (const mode of ['light', 'dark'] as const) {
      const keys = Object.keys(theme[mode]);
      assert.ok(keys.length > 0, `${theme.name}.${mode} must override something`);
      assert.ok(keys.every((key) => allowed.has(key as (typeof CONTRACT_KEYS)[number])));
    }
  }
});

test('every base color x theme composition satisfies the contract', () => {
  for (const base of BASE_COLORS) {
    for (const theme of [null, ...THEMES]) {
      const composed = composeThemePair(base, theme);
      for (const mode of ['light', 'dark'] as const) {
        assert.deepEqual(
          Object.keys(composed[mode]).sort(),
          [...CONTRACT_KEYS].sort(),
          `${composed.name}.${mode}`,
        );
      }
    }
  }
});

test('every style exposes a recipe for every part using only the recipe vocabulary', () => {
  const allowed = new Set(PART_RECIPE_KEYS);
  for (const name of STYLE_NAMES) {
    const recipes = STYLE_RECIPES[name];
    assert.deepEqual(
      Object.keys(recipes).sort(),
      [...PART_NAMES].sort(),
      `${name} recipe coverage`,
    );
    for (const part of PART_NAMES) {
      for (const key of Object.keys(recipes[part])) {
        assert.ok(allowed.has(key), `${name}.${part} uses unknown key "${key}"`);
      }
    }
  }
});

test('no legacy depth-token structure survives in the style data', () => {
  const legacy = new Set([
    'depthValues',
    'darkDepthValues',
    'radiusControlSm',
    'radiusControlMd',
    'radiusControlLg',
    'radiusCard',
    'radiusOverlay',
    'radiusDialog',
    'cardPadding',
    'cardGap',
    'overlayPadding',
    'shadowXs',
    'shadowSm',
    'shadowMd',
    'shadowLg',
    'shadowXl',
    'shadow2xl',
  ]);
  for (const name of STYLE_NAMES) {
    const styleKeys = Object.keys(STYLE_RECIPES[name]);
    assert.ok(styleKeys.every((key) => !legacy.has(key)), `${name} hosts legacy keys`);
    for (const part of PART_NAMES) {
      for (const [key, value] of Object.entries(
        STYLE_RECIPES[name][part] as Record<string, unknown>,
      )) {
        assert.equal(typeof value, 'string', `${name}.${part}.${key}`);
      }
    }
  }
});

test('curated spot-checks match the upstream transcription', () => {
  const b = STYLE_RECIPES;
  assert.equal(b.vega.button.radius, 'md');
  assert.equal(b.maia.button.radius, '4xl');
  assert.equal(b.lyra.button.radius, 'none');
  assert.equal(b.sera.button.textTransform, 'uppercase');
  assert.equal(b.sera.button.letterSpacing, '0.1em');
  assert.equal(b.mira.button.fontSize, '0.75rem');
  assert.equal(b.maia.card.radius, '2xl');
  assert.equal(b.rhea.card.borderRadius, 'min(calc(0.625rem + 24px), 24px)');
  // Extract truth: upstream vega card uses `shadow-xs`.
  assert.equal(b.vega.card.boxShadow, '0 1px 2px 0 rgb(0 0 0 / 0.05)');
  assert.equal(
    b.luma.card.boxShadow,
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  );
  assert.equal(b.nova.dialogContent.padding, '1rem');
  assert.equal(b.maia.menuContent.radius, '2xl');
  assert.equal(b.maia.menuContent.boxShadow, '0 25px 50px -12px rgb(0 0 0 / 0.25)');
  assert.equal(b.lyra.dialogContent.radius, 'none');
  assert.equal(b.rhea.accordionTrigger.radius, undefined);
  assert.equal(b.rhea.accordionTrigger.padding, '1rem');
  assert.equal(b.sera.toggle.textTransform, 'uppercase');
  assert.equal(b.mira.selectTrigger.fontSize, '0.75rem');
  assert.equal(b.luma.switch.borderWidth, '2px');
  assert.equal(b.sera.switch.radius, 'none');
  assert.equal(b.vega.progress.radius, 'full');
  assert.equal(b.maia.skeleton.radius, 'xl');
  assert.equal(b.vega.sidebarMenuButton.padding, '0.5rem');
  // Extract truth: upstream lyra card uses `gap-(--card-spacing)` = spacing(4).
  assert.equal(b.lyra.card.gap, '1rem');
  assert.equal(b.vega.input.height, '2.25rem');
  // Button sm / switch / select / slider / badge default-size transcriptions.
  assert.equal(b.mira.buttonSizeSm.fontSize, '0.75rem');
  assert.equal(b.vega.switch.height, '18.4px');
  assert.equal(b.vega.switch.width, '32px');
  assert.equal(b.luma.switch.width, '2.75rem');
  assert.equal(b.sera.switch.width, '2.0625rem');
  assert.equal(b.sera.selectTrigger.height, '2.5rem');
  assert.equal(b.maia.sliderTrack.radius, '4xl');
  assert.equal(b.mira.sliderTrack.height, '0.25rem');
  assert.equal(b.sera.badge.borderWidth, '0');
});

test('default scaffold is a fresh render of the composable sources', () => {
  const onDisk = readFileSync(new URL('theme.stylex.ts', import.meta.url), 'utf8');
  assert.equal(onDisk, renderDefaultThemeSource());
  assert.ok(onDisk.includes('export const darkSemantic ='));
});

test('default scaffold is self-contained (imports only stylex)', () => {
  const onDisk = readFileSync(new URL('theme.stylex.ts', import.meta.url), 'utf8');
  const imports = [...onDisk.matchAll(/^import .+$/gm)].map((m) => m[0]).join('\n');
  assert.equal(imports, `import * as stylex from '@stylexjs/stylex';`);
});

test('default scaffold exports only semantic and darkSemantic', () => {
  const onDisk = readFileSync(new URL('theme.stylex.ts', import.meta.url), 'utf8');
  const exports = [...onDisk.matchAll(/^export const (\w+) =/gm)].map((m) => m[1]);
  assert.deepEqual(exports, ['semantic', 'darkSemantic']);
});