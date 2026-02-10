/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/mobile-header-scroll.test.ts

Validates that the top banner scrolls away on mobile while remaining sticky on larger screens.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Mobile header scroll behavior', () => {
  it('keeps the top banner non-sticky on mobile and sticky on md+', async () => {
    const navbar = await read('src/components/ui/Navbar.astro');

    expect(navbar).toContain('md:sticky');
    expect(navbar).toContain('md:top-0');
    expect(navbar).not.toContain('class="sticky top-0');
  });
});
