/*
--------------------------------------------------------------------------------
personal-site
src/pages/__tests__/publications-page.test.ts

Validates publications page author highlighting wiring is configuration-driven.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('publications page', () => {
  it('uses shared profile author name and utility helpers for author formatting', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/pages/publications.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('profile.authorName');
    expect(contents).toContain('isHighlightedAuthor');
    expect(contents).not.toContain("const authorName = 'Eric J. South';");
  });
});
