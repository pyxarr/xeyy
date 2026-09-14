import { describe, it, expect } from 'vitest';
import { humanizeTitle, resolveItemTitle } from './registry-add.ts';

describe('humanizeTitle', () => {
  it('capitalizes single-word names', () => {
    expect(humanizeTitle('button')).toBe('Button');
    expect(humanizeTitle('dialog')).toBe('Dialog');
  });

  it('turns kebab-case names into Title Case with spaces', () => {
    expect(humanizeTitle('default-theme')).toBe('Default Theme');
    expect(humanizeTitle('date-picker')).toBe('Date Picker');
    expect(humanizeTitle('base-button')).toBe('Base Button');
  });

  it('handles snake_case names', () => {
    expect(humanizeTitle('foo_bar')).toBe('Foo Bar');
  });

  it('splits camelCase boundaries', () => {
    expect(humanizeTitle('useNotification')).toBe('Use Notification');
  });
});

describe('resolveItemTitle (--yes / non-interactive path)', () => {
  it('uses the human-readable title when no --title override is given', () => {
    expect(resolveItemTitle(undefined, 'default-theme')).toBe('Default Theme');
    expect(resolveItemTitle(undefined, 'date-picker')).toBe('Date Picker');
  });

  it('prefers the --title override when provided', () => {
    expect(resolveItemTitle('Custom Date Picker', 'date-picker')).toBe('Custom Date Picker');
  });
});