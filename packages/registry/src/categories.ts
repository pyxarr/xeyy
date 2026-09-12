/**
 * Xeyy category vocabulary.
 *
 * Categories are a strict, closed vocabulary grouped into three dimensions.
 * Users are not allowed to invent arbitrary categories through the CLI — an
 * unknown category must be added to the vocabulary in this module / the schema
 * before it can be used.
 */

export const categoryGroups = ['functional', 'context', 'behavior'] as const;
export type CategoryGroup = (typeof categoryGroups)[number];

/** Functional: what the component does. */
export const functionalCategories = [
  'form',
  'navigation',
  'overlay',
  'layout',
  'data-display',
  'feedback',
  'typography',
  'media',
] as const;

/** Context: the surface the component is usually used in. */
export const contextCategories = [
  'marketing',
  'dashboard',
  'authentication',
  'settings',
  'ecommerce',
] as const;

/** Behavior: how the component behaves at runtime. */
export const behaviorCategories = [
  'interactive',
  'animated',
  'accessible',
  'client-only',
  'server-compatible',
] as const;

export const allCategories = [
  ...functionalCategories,
  ...contextCategories,
  ...behaviorCategories,
] as const;

export type Category = (typeof allCategories)[number];

export const categoryGroupOf = new Map<string, CategoryGroup>();
for (const c of functionalCategories) categoryGroupOf.set(c, 'functional');
for (const c of contextCategories) categoryGroupOf.set(c, 'context');
for (const c of behaviorCategories) categoryGroupOf.set(c, 'behavior');

export function isCategory(value: string): value is Category {
  return (allCategories as readonly string[]).includes(value);
}

/**
 * Validate a candidate category list.
 * - every entry must be part of the vocabulary
 * - the list must not contain duplicates
 * - at most one category per functional/context group is enforced (behavior
 *   categories describe orthogonal runtime properties and may combine freely)
 */
export function validateCategories(
  categories: string[],
  options: { strictGroups?: boolean } = {},
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const c of categories) {
    if (!isCategory(c)) {
      issues.push(`"${c}" is not a valid Xeyy category`);
    }
  }

  const seen = new Set<string>();
  for (const c of categories) {
    if (seen.has(c)) issues.push(`duplicate category "${c}"`);
    seen.add(c);
  }

  if (options.strictGroups ?? true) {
    const groups = categoryGroups.filter((g) => g !== 'behavior');
    for (const group of groups) {
      const chosen = categories.filter((c) => isCategory(c) && categoryGroupOf.get(c) === group);
      if (chosen.length > 1) {
        issues.push(`"${chosen[1]}" conflicts with "${chosen[0]}" (at most one "${group}" category)`);
        break;
      }
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Suggest categories from the item's name + analyzed role. Suggestions are
 * conservative: they only fire on well-known signals and can always be edited
 * by the user. Never silently final — suggestions are always confirmed.
 */
export function suggestCategories(input: {
  name: string;
  baseUiComponents: string[];
  interactive?: boolean;
  accessible?: boolean;
  animated?: boolean;
  roleHints?: string[];
}): Category[] {
  const name = input.name.toLowerCase();
  const hints = new Set((input.roleHints ?? []).map((h) => h.toLowerCase()));
  const suggested = new Set<Category>();

  const hasRole = (...roles: string[]) => roles.some((r) => hints.has(r));

  if (hasRole('form') || /^(input|select|checkbox|radio|textarea|combobox|field|form|label|number-field)/.test(name)) {
    suggested.add('form');
  }
  if (hasRole('navigation') || /^(nav|menu|menubar|tabs|pagination|breadcrumb|toolbar)/.test(name)) {
    suggested.add('navigation');
  }
  if (hasRole('overlay') || /^(dialog|modal|popover|tooltip|drawer|sheet|alert-dialog|dropdown)/.test(name)) {
    suggested.add('overlay');
  }
  if (hasRole('layout') || /^(layout|container|stack|grid|sidebar|header|footer|section)/.test(name)) {
    suggested.add('layout');
  }
  if (hasRole('data-display') || /^(table|data-table|data-grid|list|card|avatar|badge|stat)/.test(name)) {
    suggested.add('data-display');
  }
  if (hasRole('feedback') || /^(alert|toast|notification|banner|progress|skeleton|spinner)/.test(name)) {
    suggested.add('feedback');
  }
  if (hasRole('marketing') || /^(marketing|hero|pricing|cta|logo|feature|testimonial|stats|footer)/.test(name)) {
    suggested.add('marketing');
  }
  if (hasRole('dashboard') || /^(dashboard|chart|metric|widget|analytics|overview|panel)/.test(name)) {
    suggested.add('dashboard');
  }
  if (hasRole('authentication') || /^(login|signin|signup|auth|register|password|otp)/.test(name)) {
    suggested.add('authentication');
  }
  if (hasRole('settings') || /^(settings|preferences|profile|account)/.test(name)) {
    suggested.add('settings');
  }
  if (hasRole('ecommerce') || /^(cart|checkout|product|pricing|order)/.test(name)) {
    suggested.add('ecommerce');
  }
  if (hasRole('typography') || /^(heading|title|text|typography|paragraph|caption)/.test(name)) {
    suggested.add('typography');
  }
  if (hasRole('media') || /^(image|video|media|avatar|icon|gallery)/.test(name)) {
    suggested.add('media');
  }

  if (input.interactive ?? true) {
    suggested.add('interactive');
  }
  if (input.accessible ?? true) {
    suggested.add('accessible');
  }
  if (input.animated) {
    suggested.add('animated');
  }

  // Client-only components: anything built on DOM-heavy headless primitives
  // like dialogs/popovers is conservatively flagged; server compatibility is
  // only claimed when we have positive evidence.
  const probablyClientOnly = input.baseUiComponents.some((c) =>
    ['dialog', 'popover', 'tooltip', 'dropdown', 'menu', 'combobox', 'select', 'sheet'].includes(c),
  );
  const serverCompatible = (input.interactive ?? true) === false && !probablyClientOnly;

  if (probablyClientOnly) {
    suggested.add('client-only');
  } else if (serverCompatible) {
    suggested.add('server-compatible');
  }

  return allCategories.filter((c) => suggested.has(c));
}