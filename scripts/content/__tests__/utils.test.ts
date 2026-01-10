import { describe, expect, it } from 'vitest';

import {
  ensureIsoDate,
  formatLocalISODate,
  slugify,
  yamlString,
} from '../utils';

describe('formatLocalISODate', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 2);
    expect(formatLocalISODate(date)).toBe('2024-01-02');
  });
});

describe('ensureIsoDate', () => {
  it('accepts valid ISO dates', () => {
    expect(ensureIsoDate('2024-12-05')).toBe('2024-12-05');
  });

  it('rejects invalid ISO dates', () => {
    expect(() => ensureIsoDate('2024-02-31')).toThrow('Invalid date');
  });
});

describe('slugify', () => {
  it('builds URL-safe slugs', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });

  it('rejects empty slugs', () => {
    expect(() => slugify('   ')).toThrow('Slug cannot be empty.');
  });
});

describe('yamlString', () => {
  it('wraps values in single quotes and escapes apostrophes', () => {
    expect(yamlString("Sam's CV")).toBe("'Sam''s CV'");
  });
});
