/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/section-divider-consistency.test.ts

Validates shared section divider styling usage across major section breaks.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readStylesheetBundle } from '../../test/readStylesheetBundle';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Section divider consistency', () => {
  it('defines shared divider tokens and utilities in the global layout', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const layoutStyles = await readStylesheetBundle('src/styles/layout.css');

    expect(layout).toContain("import '@/styles/layout.css';");
    expect(layoutStyles).toContain('--site-divider-line:');
    expect(layoutStyles).toContain('.section-divider-line');
    expect(layoutStyles).toContain('.section-divider-bottom::after');
  });

  it('uses shared divider classes across section breaker locations', async () => {
    const projects = await read('src/pages/projects.astro');
    const contact = await read('src/pages/contact.astro');
    const storyChapters = await read('src/components/home/StoryChapters.astro');
    const blogPage = await read('src/pages/blog/[page].astro');
    const blogSlug = await read('src/pages/blog/[slug].astro');

    expect(projects).toContain('section-divider-line');
    expect(contact).toContain('section-divider-bottom');
    expect(storyChapters).toContain('section-divider-bottom');
    expect(blogPage).toContain('section-divider-bottom');
    expect(blogSlug).toContain('section-divider-bottom');
  });
});
