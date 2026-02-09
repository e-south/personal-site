/*
--------------------------------------------------------------------------------
personal-site
src/pages/__tests__/cv-page.test.ts

Validates that the CV page keeps only PDF preview and download controls.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('cv page', () => {
  it('renders only the PDF preview and download control without text CV content', async () => {
    const filePath = path.resolve(process.cwd(), 'src/pages/cv.astro');
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('<iframe');
    expect(contents).toContain('{downloadLabel}');
    expect(contents).not.toContain('Text version');
    expect(contents).not.toContain('<Content />');
  });
});
