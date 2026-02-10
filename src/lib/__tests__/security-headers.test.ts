import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildContentSecurityPolicy,
  collectInlineScriptHashesFromHtml,
} from '../../../scripts/write-csp-headers.mjs';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('deployment security headers', () => {
  it('sets baseline response hardening headers in netlify config', async () => {
    const contents = await read('netlify.toml');

    expect(contents).toContain('[[headers]]');
    expect(contents).toContain('X-Content-Type-Options = "nosniff"');
    expect(contents).toContain('X-Frame-Options = "DENY"');
    expect(contents).toContain(
      'Referrer-Policy = "strict-origin-when-cross-origin"',
    );
    expect(contents).not.toContain('Content-Security-Policy =');
  });

  it('builds CSP without unsafe-inline and without a wildcard connect policy', () => {
    const policy = buildContentSecurityPolicy({
      inlineScriptHashes: ["'sha256-test-hash'"],
      inlineStyleHashes: ["'sha256-style-hash'"],
      analyticsOrigin: 'https://stats.example.com',
      newsletterOrigin: 'https://newsletter.example.com',
    });

    expect(policy).toContain(
      "script-src 'self' 'sha256-test-hash' https://gc.zgo.at",
    );
    expect(policy).toContain("script-src-attr 'none'");
    expect(policy).toContain(
      "connect-src 'self' https://gc.zgo.at https://newsletter.example.com https://stats.example.com",
    );
    expect(policy).toContain("style-src 'self' 'sha256-style-hash'");
    expect(policy).toContain("style-src-elem 'self' 'sha256-style-hash'");
    expect(policy).toContain("style-src-attr 'unsafe-inline'");
    expect(policy).not.toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain("connect-src 'self' https:;");
  });

  it('collects hashes only from inline script blocks', () => {
    const hashes = collectInlineScriptHashesFromHtml(
      [
        '<script>window.alpha = 1;</script>',
        '<script type="module">console.log("beta");</script>',
        '<script src="/_astro/chunk.js"></script>',
      ].join('\n'),
    );

    expect(hashes).toHaveLength(2);
    expect(hashes.every((hash) => hash.startsWith("'sha256-"))).toBe(true);
  });
});
