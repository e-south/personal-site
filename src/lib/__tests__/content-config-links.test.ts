import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('content link schema', () => {
  it('rejects protocol-relative values for internal links', async () => {
    const config = await read('src/content.config.ts');
    expect(config).toContain('z.string().regex(/^\\/(?!\\/)/)');
  });
});
