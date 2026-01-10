import { describe, expect, it, vi } from 'vitest';

const loadUrls = async (baseUrl?: string) => {
  vi.resetModules();
  if (baseUrl !== undefined) {
    vi.stubEnv('BASE_URL', baseUrl);
  }
  const module = await import('../urls');
  vi.unstubAllEnvs();
  return module;
};

describe('withBase', () => {
  it('keeps absolute URLs unchanged', async () => {
    const { withBase } = await loadUrls('/');
    expect(withBase('https://example.com/blog')).toBe(
      'https://example.com/blog',
    );
  });

  it('keeps hash and query fragments unchanged', async () => {
    const { withBase } = await loadUrls('/');
    expect(withBase('#section')).toBe('#section');
    expect(withBase('?q=astro')).toBe('?q=astro');
  });

  it('prefixes base for paths', async () => {
    const { withBase } = await loadUrls('/');
    expect(withBase('/blog')).toBe('/blog');
  });

  it('respects non-root base paths', async () => {
    const { withBase } = await loadUrls('/lab/');
    expect(withBase('/blog')).toBe('/lab/blog');
  });
});

describe('toAbsoluteUrl', () => {
  it('builds absolute URLs', async () => {
    const { toAbsoluteUrl } = await loadUrls('/');
    expect(toAbsoluteUrl('/blog', 'https://example.com')).toBe(
      'https://example.com/blog',
    );
  });

  it('applies base paths before absolutizing', async () => {
    const { toAbsoluteUrl } = await loadUrls('/lab/');
    expect(toAbsoluteUrl('/blog', 'https://example.com')).toBe(
      'https://example.com/lab/blog',
    );
  });
});
