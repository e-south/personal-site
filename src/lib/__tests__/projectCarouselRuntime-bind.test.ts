import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('project carousel page-load binding', () => {
  it('guards page-load listener registration to a single bind', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain('let hasBoundProjectCarouselPageLoad = false;');
    expect(runtime).toContain('if (!hasBoundProjectCarouselPageLoad) {');
    expect(runtime).toContain("document.addEventListener('astro:page-load'");
    expect(runtime).toContain('hasBoundProjectCarouselPageLoad = true;');
  });
});
