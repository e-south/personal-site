/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/pill-hover-policy.test.ts

Validates modern pill hover styling with borderless defaults.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Pill hover policy', () => {
  it('uses borderless defaults with lift + subtle border hover for reusable pills', async () => {
    const pillLink = await read('src/components/ui/PillLink.astro');
    const tagChip = await read('src/components/ui/TagChip.astro');

    expect(pillLink).not.toContain(
      'rounded-[var(--site-radius-control)] border',
    );
    expect(pillLink).toContain('border: 1px solid transparent;');
    expect(pillLink).toContain('.pill-link:hover');
    expect(pillLink).toContain('border-color:');
    expect(pillLink).toContain('translateY(-1px)');
    expect(pillLink).not.toContain('var(--site-shadow-glow)');

    expect(tagChip).not.toContain(
      'rounded-[var(--site-radius-control)] border',
    );
    expect(tagChip).toContain('border: 1px solid transparent;');
    expect(tagChip).toContain('.tag-chip:hover');
    expect(tagChip).toContain('border-color:');
    expect(tagChip).toContain('translateY(-1px)');
    expect(tagChip).not.toContain('var(--site-shadow-glow)');
  });

  it('applies the same borderless defaults and hover lift to narrative and pagination pills', async () => {
    const storyChapterStyles = await read('src/styles/story-chapters.css');
    const pagination = await read('src/components/ui/Pagination.astro');

    expect(storyChapterStyles).not.toContain('border border-base-300');
    expect(storyChapterStyles).toContain('border: 1px solid transparent;');
    expect(storyChapterStyles).toContain('.story-carousel-button:hover');
    expect(storyChapterStyles).toContain('.story-nav-link:hover');
    expect(storyChapterStyles).toContain('transform: translateY(-1px);');

    expect(pagination).toContain('border: 1px solid transparent;');
    expect(pagination).toContain('.pagination-pill:hover');
    expect(pagination).toContain('border-color:');
    expect(pagination).toContain('transform: translateY(-1px);');
  });
});
