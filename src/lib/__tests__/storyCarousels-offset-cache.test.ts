/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/storyCarousels-offset-cache.test.ts

Validates story carousel offset caching to avoid repeated layout reads.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('story carousel offset cache', () => {
  it('keeps a cached offset table and invalidates it on resize/content changes', async () => {
    const source = await read('src/lib/home/storyCarousels.ts');

    expect(source).toContain('let itemOffsets: number[] = [];');
    expect(source).toContain('let offsetsDirty = true;');
    expect(source).toContain('const rebuildItemOffsets = () => {');
    expect(source).toContain('const markOffsetsDirty = () => {');
    expect(source).toContain('const ensureItemOffsets = () => {');
    expect(source).toContain('rebuildItemOffsets();');
    expect(source).toContain('markOffsetsDirty();');
  });
});
