import { describe, expect, it } from 'vitest';
import {
  normalizeAbsoluteUrl,
  resolveAnalyticsEnv,
  resolveNewsletterEnv,
  resolvePublicSiteEnv,
} from '../env.mjs';

describe('environment URL normalization', () => {
  it('accepts secure absolute URLs', () => {
    expect(normalizeAbsoluteUrl('https://example.com', 'PUBLIC_SITE_URL')).toBe(
      'https://example.com',
    );
  });

  it('accepts localhost http URLs only when explicitly allowed', () => {
    expect(
      normalizeAbsoluteUrl('http://localhost:9000', 'PUBLIC_LISTMONK_URL', {
        allowHttpLocalhost: true,
      }),
    ).toBe('http://localhost:9000');
  });

  it('rejects non-http protocols', () => {
    expect(() =>
      normalizeAbsoluteUrl('ftp://example.com', 'PUBLIC_SITE_URL'),
    ).toThrow(/must use http or https/i);
  });

  it('rejects non-localhost http URLs', () => {
    expect(() =>
      normalizeAbsoluteUrl('http://example.com', 'PUBLIC_SITE_URL', {
        allowHttpLocalhost: true,
      }),
    ).toThrow(/must use https/i);
  });

  it('allows localhost http site URL in development mode', () => {
    const resolved = resolvePublicSiteEnv(
      {
        PUBLIC_SITE_URL: 'http://localhost:4321',
        PUBLIC_BASE_PATH: '',
      },
      { isDev: true },
    );
    expect(resolved.site).toBe('http://localhost:4321');
  });

  it('rejects http newsletter and analytics URLs outside localhost', () => {
    expect(() =>
      resolveNewsletterEnv({
        PUBLIC_LISTMONK_URL: 'http://example.com',
        PUBLIC_LISTMONK_LIST_UUIDS: 'list-a',
      }),
    ).toThrow(/must use https/i);
    expect(() =>
      resolveAnalyticsEnv({
        PUBLIC_GOATCOUNTER_ENDPOINT: 'http://example.com/count',
      }),
    ).toThrow(/must use https/i);
  });
});
