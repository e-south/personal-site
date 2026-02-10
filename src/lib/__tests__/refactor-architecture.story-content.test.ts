/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/refactor-architecture.story-content.test.ts

Locks refactor boundaries for story and blog content modularization.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('story chapter rendering modularization', () => {
  it('loads story chapter styles from a dedicated stylesheet module', async () => {
    const storyChapters = await read('src/components/home/StoryChapters.astro');
    const storyChapterStyles = await read('src/styles/story-chapters.css');

    expect(storyChapters).toContain("import '@/styles/story-chapters.css';");
    expect(storyChapters).not.toContain('<style>');
    expect(storyChapterStyles).toContain('.story-carousel');
    expect(storyChapterStyles).toContain('.story-chapter-cta:hover');
  });

  it('delegates story media item rendering from story chapters component', async () => {
    const storyChapters = await read('src/components/home/StoryChapters.astro');

    expect(storyChapters).toContain(
      "import StoryMediaItem from '@/components/home/StoryMediaItem.astro';",
    );
    expect(storyChapters).toContain('<StoryMediaItem');
  });

  it('extracts story media item rendering into dedicated component', async () => {
    const storyMediaItem = await read(
      'src/components/home/StoryMediaItem.astro',
    );

    expect(storyMediaItem).toContain("item.kind === 'stack'");
    expect(storyMediaItem).toContain(
      'class="story-media-caption story-media-stack-caption liquid-caption"',
    );
  });
});

describe('story media registry modularization', () => {
  it('delegates story registry validation to a dedicated helper module', async () => {
    const storyMedia = await read('src/data/storyMedia.ts');
    const storyMediaValidation = await read('src/lib/storyMediaValidation.ts');

    expect(storyMedia).toContain(
      "import { assertStoryRegistry } from '@/lib/storyMediaValidation';",
    );
    expect(storyMedia).toContain('assertStoryRegistry({');
    expect(storyMediaValidation).toContain(
      'export const assertStoryRegistry =',
    );
    expect(storyMediaValidation).toContain(
      'Story chapter order contains duplicates.',
    );
  });
});

describe('blog list rendering modularization', () => {
  it('shares blog list article rendering through a dedicated component', async () => {
    const blogIndexPage = await read('src/pages/blog/index.astro');
    const paginatedBlogPage = await read('src/pages/blog/[page].astro');
    const blogPostList = await read('src/components/blog/BlogPostList.astro');

    expect(blogIndexPage).toContain(
      "import BlogPostList from '@/components/blog/BlogPostList.astro';",
    );
    expect(paginatedBlogPage).toContain(
      "import BlogPostList from '@/components/blog/BlogPostList.astro';",
    );
    expect(blogIndexPage).toContain('<BlogPostList');
    expect(blogIndexPage).toContain('posts={page.data}');
    expect(blogIndexPage).toContain('articleClass="glass-card space-y-3 p-6"');
    expect(blogIndexPage).toContain('reveal');
    expect(paginatedBlogPage).toContain('<BlogPostList');
    expect(paginatedBlogPage).toContain('posts={page.data}');
    expect(paginatedBlogPage).toContain(
      'articleClass="section-divider-bottom pb-10 last:pb-0"',
    );
    expect(blogPostList).toContain('import type { BlogListItem }');
    expect(blogPostList).toContain('posts.map((post) =>');
    expect(blogPostList).toContain('blog-cover-media');
  });
});
