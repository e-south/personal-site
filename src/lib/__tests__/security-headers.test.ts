import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

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
    expect(contents).toContain('Content-Security-Policy =');
  });
});
