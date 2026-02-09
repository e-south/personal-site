/*
--------------------------------------------------------------------------------
personal-site
src/pages/__tests__/hero-images.test.ts

Validates responsive hero image data wiring.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('hero images', () => {
  it('includes responsive image data for the rotator', async () => {
    const filePath = path.resolve(process.cwd(), 'src/pages/index.astro');
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('getImage');
    expect(contents).toContain('srcset');
    expect(contents).toContain('sizes');
  });

  it('accounts for cover width when sizing hero images', async () => {
    const filePath = path.resolve(process.cwd(), 'src/pages/index.astro');
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('heroContainerAspect');
    expect(contents).toContain('getHeroCoverWidth');
  });

  it('applies layered depth styling to hero media assets', async () => {
    const filePath = path.resolve(process.cwd(), 'src/pages/index.astro');
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('home-hero-image-shell::after');
    expect(contents).toContain('var(--site-shadow-2)');
    expect(contents).toContain('inset 0 1px 0');
  });
});
