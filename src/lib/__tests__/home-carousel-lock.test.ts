/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/home-carousel-lock.test.ts

Ensures story carousels lock height for specified chapters.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('story carousel height lock', () => {
  it('includes Imperial / Crick and PhD chapters', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/lib/home/storyCarousels.ts',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('imperial-crick-training');
    expect(contents).toContain('phd-at-boston-university');
  });
});
