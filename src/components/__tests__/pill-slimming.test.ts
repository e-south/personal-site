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
      'background: color-mix(in oklab, currentColor 6%, transparent);',
    );
  });

  it('uses slimmer pagination pills', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/ui/Pagination.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('padding: 0.35rem 0.85rem;');
    expect(contents).toContain(
      'background-color: color-mix(in oklab, hsl(var(--p)) 8%, transparent);',
    );
  });
});
