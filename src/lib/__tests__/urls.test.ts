import { describe, expect, it } from 'vitest';

import { toAbsoluteUrl, withBase } from '../urls';

describe('withBase', () => {
  it('keeps absolute URLs unchanged', () => {
    expect(withBase('https://example.com/blog')).toBe(
      'https://example.com/blog',
    );
  });

  it('keeps hash and query fragments unchanged', () => {
    expect(withBase('#section')).toBe('#section');
    expect(withBase('?q=astro')).toBe('?q=astro');
  });

  it('prefixes base for paths', () => {
    expect(withBase('/blog')).toBe('/blog');
  });
});

describe('toAbsoluteUrl', () => {
  it('builds absolute URLs', () => {
    expect(toAbsoluteUrl('/blog', 'https://example.com')).toBe(
      'https://example.com/blog',
    );
  });
});
