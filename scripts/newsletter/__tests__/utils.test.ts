import { describe, expect, it } from 'vitest';

import { absolutizeUrl, assertSlugSegment, resolveSlug } from '../utils';

describe('assertSlugSegment', () => {
  it('accepts a valid slug segment', () => {
    expect(assertSlugSegment('my-post-1')).toBe('my-post-1');
  });

  it('rejects whitespace', () => {
    expect(() => assertSlugSegment('my post')).toThrow(
      'Slug must not include whitespace.',
    );
  });

  it('rejects path separators', () => {
    expect(() => assertSlugSegment('blog/my-post')).toThrow(
      'Slug must be a single path segment.',
    );
  });

  it('rejects traversal tokens', () => {
    expect(() => assertSlugSegment('../escape')).toThrow(
      'Slug must not include "..".',
    );
  });
});

describe('resolveSlug', () => {
  it('prefers an explicit slug', () => {
    expect(resolveSlug(undefined, 'manual-slug')).toBe('manual-slug');
  });

  it('extracts a slug from a blog URL', () => {
    expect(resolveSlug('https://example.com/blog/my-slug')).toBe('my-slug');
  });

  it('returns empty when no blog segment is present', () => {
    expect(resolveSlug('https://example.com/about')).toBe('');
  });

  it('throws on invalid URLs', () => {
    expect(() => resolveSlug('not-a-url')).toThrow(
      '--url must be a valid absolute URL.',
    );
  });
});

describe('absolutizeUrl', () => {
  it('absolutizes relative URLs against a base', () => {
    expect(absolutizeUrl('/blog/test', 'https://example.com')).toBe(
      'https://example.com/blog/test',
    );
  });

  it('keeps absolute scheme URLs intact', () => {
    expect(
      absolutizeUrl('mailto:test@example.com', 'https://example.com'),
    ).toBe('mailto:test@example.com');
  });

  it('throws on empty URLs', () => {
    expect(() => absolutizeUrl('', 'https://example.com')).toThrow(
      'Encountered an empty URL in the newsletter HTML.',
    );
  });

  it('throws on malformed URLs', () => {
    expect(() =>
      absolutizeUrl('http://[invalid', 'https://example.com'),
    ).toThrow('Invalid URL in newsletter HTML: http://[invalid');
  });
});
