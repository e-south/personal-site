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

  it('falls back to base for unsafe external schemes', async () => {
    const { withBase } = await loadUrls('/');
    expect(withBase('javascript:alert(1)')).toBe('/');
    expect(withBase('data:text/html,hello')).toBe('/');
  });

  it('rejects protocol-relative paths masquerading as internal routes', async () => {
    const { withBase } = await loadUrls('/');
    expect(withBase('//evil.example/path')).toBe('/');
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

describe('safe href helpers', () => {
  it('detects safe external href protocols', async () => {
    const { isSafeExternalHref } = await loadUrls('/');
    expect(isSafeExternalHref('https://example.com')).toBe(true);
    expect(isSafeExternalHref('mailto:person@example.com')).toBe(true);
    expect(isSafeExternalHref('tel:+15551234567')).toBe(true);
    expect(isSafeExternalHref('javascript:alert(1)')).toBe(false);
  });

  it('sanitizes unsafe href values to hash', async () => {
    const { sanitizeHref } = await loadUrls('/');
    expect(sanitizeHref('/projects')).toBe('/projects');
    expect(sanitizeHref('#about')).toBe('#about');
    expect(sanitizeHref('//evil.example/path')).toBe('#');
    expect(sanitizeHref('javascript:alert(1)')).toBe('#');
    expect(sanitizeHref('data:text/html,hello')).toBe('#');
  });
});
