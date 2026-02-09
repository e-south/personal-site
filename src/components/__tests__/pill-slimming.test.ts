/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/pill-slimming.test.ts

Validates slimmer pill styling for narrative and pagination controls.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Pill slimming styles', () => {
  it('uses slimmer narrative pills', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/home/StoryChapters.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('min-height: 2.1rem;');
    expect(contents).toContain(
      'color-mix(in oklab, var(--site-surface) 78%, transparent)',
    );
    expect(contents).toContain('#imperial-crick-training .story-carousel');
    expect(contents).toContain('height: var(--carousel-lock-height, auto);');
  });

  it('uses slimmer pagination pills', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/ui/Pagination.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('padding: 0.4rem 0.9rem;');
    expect(contents).toContain(
      'color-mix(in oklab, var(--site-surface) 74%, transparent)',
    );
  });
});
