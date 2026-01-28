/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/project-carousel-controls.test.ts

Validates project carousel control markup.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ProjectCarousel controls', () => {
  it('renders split pill markup for prev/next buttons', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('project-carousel-button__cap');
    expect(contents).toContain('project-carousel-button__label');
    expect(contents).toContain('project-carousel-button--next');
  });
});
