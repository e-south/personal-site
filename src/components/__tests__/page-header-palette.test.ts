/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/page-header-palette.test.ts

Validates categorical main-header color palette usage across key pages.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readStylesheetBundle } from '../../test/readStylesheetBundle';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Page header palette', () => {
  it('defines shared sea-glass compatible header color tokens and category classes', async () => {
    const layoutStyles = await readStylesheetBundle('src/styles/layout.css');
    const mainHeaderBlock =
      layoutStyles.match(/\.page-main-header\s*\{[^}]*\}/)?.[0] ?? '';

    expect(layoutStyles).toContain('.page-main-header {');
    expect(mainHeaderBlock).toContain(
      'color: var(--site-page-header-hue) !important;',
    );
    expect(mainHeaderBlock).not.toContain('text-shadow');
    expect(layoutStyles).toContain('.page-main-header--home {');
    expect(layoutStyles).toContain('.page-main-header--cv {');
    expect(layoutStyles).toContain('.page-main-header--projects {');
    expect(layoutStyles).toContain('.page-main-header--publications {');
    expect(layoutStyles).toContain('.page-main-header--blog {');
    expect(layoutStyles).toContain('.page-main-header--contact {');
    expect(layoutStyles).toContain('--site-page-header-home: #00efff;');
    expect(layoutStyles).toContain('--site-page-header-cv: #7f8fff;');
    expect(layoutStyles).toContain('--site-page-header-projects: #29f2b3;');
    expect(layoutStyles).toContain('--site-page-header-publications: #ff9552;');
    expect(layoutStyles).toContain('--site-page-header-blog: #ffe066;');
    expect(layoutStyles).toContain('--site-page-header-contact: #ff5db8;');
  });

  it('applies category header classes to requested page titles', async () => {
    const homePage = await read('src/pages/index.astro');
    const cvPage = await read('src/pages/cv.astro');
    const projectsPage = await read('src/pages/projects.astro');
    const publicationsPage = await read('src/pages/publications.astro');
    const blogIndexPage = await read('src/pages/blog/index.astro');
    const blogPagedPage = await read('src/pages/blog/[page].astro');
    const contactPage = await read('src/pages/contact.astro');

    expect(homePage).toContain('page-main-header page-main-header--home');
    expect(cvPage).toContain('page-main-header page-main-header--cv');
    expect(projectsPage).toContain(
      'page-main-header page-main-header--projects',
    );
    expect(publicationsPage).toContain(
      'page-main-header page-main-header--publications',
    );
    expect(blogIndexPage).toContain('page-main-header page-main-header--blog');
    expect(blogPagedPage).toContain('page-main-header page-main-header--blog');
    expect(contactPage).toContain('page-main-header page-main-header--contact');
  });

  it('reuses the same palette for about narrative section headers', async () => {
    const storyChapters = await read('src/components/home/StoryChapters.astro');
    const storyChapterStyles = await read('src/styles/story-chapters.css');

    expect(storyChapters).toContain('class="story-chapter-title');
    expect(storyChapterStyles).toContain('.story-chapter-title {');
    expect(storyChapterStyles).toContain(
      '#about > .story-chapter:nth-of-type(6n + 1) .story-chapter-title {',
    );
    expect(storyChapterStyles).toContain(
      'color: var(--site-page-header-home);',
    );
    expect(storyChapterStyles).toContain('color: var(--site-page-header-cv);');
    expect(storyChapterStyles).toContain(
      'color: var(--site-page-header-projects);',
    );
    expect(storyChapterStyles).toContain(
      'color: var(--site-page-header-publications);',
    );
    expect(storyChapterStyles).toContain(
      'color: var(--site-page-header-blog);',
    );
    expect(storyChapterStyles).toContain(
      'color: var(--site-page-header-contact);',
    );
  });

  it('uses white project top-card headers while keeping project tab narrative headers white', async () => {
    const projectCard = await read('src/components/projects/ProjectCard.astro');
    const projectPanel = await read(
      'src/components/projects/ProjectPanel.astro',
    );

    expect(projectCard).toContain('class="project-card-title');
    expect(projectCard).toContain('.project-card-title {');
    expect(projectCard).toContain('color: var(--site-text);');
    expect(projectCard).not.toContain(
      '.project-card:nth-of-type(6n + 1) .project-card-title {',
    );
    expect(projectCard).not.toContain('color: var(--site-page-header-home);');
    expect(projectCard).not.toContain('color: var(--site-page-header-cv);');
    expect(projectCard).not.toContain(
      'color: var(--site-page-header-projects);',
    );
    expect(projectCard).not.toContain(
      'color: var(--site-page-header-publications);',
    );
    expect(projectCard).not.toContain('color: var(--site-page-header-blog);');
    expect(projectCard).not.toContain(
      'color: var(--site-page-header-contact);',
    );

    expect(projectPanel).toContain(
      'class="project-panel-title text-3xl font-semibold text-base-content"',
    );
  });
});
