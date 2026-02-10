/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/refactor-architecture.home-layout.test.ts

Locks refactor boundaries for home and layout modularization.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readStylesheetBundle } from '../../test/readStylesheetBundle';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('home runtime modularization', () => {
  it('uses dedicated home runtime and lifecycle binders from home entrypoint', async () => {
    const home = await read('src/lib/home.ts');
    const homeRuntime = await read('src/lib/home/homeRuntime.ts');
    const homeLifecycle = await read('src/lib/home/homeLifecycle.ts');

    expect(home).toContain(
      "import { createHomeRuntime } from '@/lib/home/homeRuntime';",
    );
    expect(home).toContain(
      "import { bindHomeLifecycle } from '@/lib/home/homeLifecycle';",
    );
    expect(home).toContain('const homeRuntime = createHomeRuntime();');
    expect(home).toContain('bindHomeLifecycle({');

    expect(homeRuntime).toContain('export const createHomeRuntime = () =>');
    expect(homeLifecycle).toContain('export const bindHomeLifecycle = ({');
  });

  it('delegates hero and story video logic from home runtime module', async () => {
    const home = await read('src/lib/home.ts');
    const homeRuntime = await read('src/lib/home/homeRuntime.ts');

    expect(homeRuntime).toContain(
      "import { initHeroRotator } from '@/lib/home/heroRotator';",
    );
    expect(homeRuntime).toContain('initStoryVideos,');
    expect(homeRuntime).toContain("from '@/lib/home/storyVideos';");
    expect(homeRuntime).toContain('initHeroRotator({');
    expect(homeRuntime).toContain('initStoryVideos({');
    expect(home).not.toContain(
      "import { initHeroRotator } from '@/lib/home/heroRotator';",
    );
  });

  it('delegates story carousel runtime wiring from home runtime module', async () => {
    const homeRuntime = await read('src/lib/home/homeRuntime.ts');

    expect(homeRuntime).toContain(
      "import { initStoryCarousels } from '@/lib/home/storyCarousels';",
    );
    expect(homeRuntime).toContain('initStoryCarousels({ getScrollBehavior })');
  });

  it('delegates story navigation runtime from home runtime module', async () => {
    const homeRuntime = await read('src/lib/home/homeRuntime.ts');
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');
    const storyNavigationState = await read(
      'src/lib/home/storyNavigationState.ts',
    );
    const storyNavigationLinks = await read(
      'src/lib/home/storyNavigationLinks.ts',
    );

    expect(homeRuntime).toContain(
      "import { initStoryNavigation } from '@/lib/home/storyNavigation';",
    );
    expect(homeRuntime).toContain('initStoryNavigation({');
    expect(storyNavigation).toContain(
      "import { createStoryNavigationState } from '@/lib/home/storyNavigationState';",
    );
    expect(storyNavigation).toContain('export const initStoryNavigation = (');
    expect(storyNavigation).toContain('data-story-nav');
    expect(storyNavigation).toContain('Story navigation controls are missing.');
    expect(storyNavigationState).toContain(
      'export const createStoryNavigationState = (',
    );
    expect(storyNavigationState).toContain('const applySnapState = (');
    expect(storyNavigation).toContain(
      "import { bindStoryNavigationLinks } from '@/lib/home/storyNavigationLinks';",
    );
    expect(storyNavigation).toContain('bindStoryNavigationLinks({');
    expect(storyNavigationLinks).toContain(
      'export const bindStoryNavigationLinks = ({',
    );
    expect(storyNavigationLinks).toContain('href must be a hash.');
    expect(storyNavigationLinks).toContain('target is missing.');
  });

  it('extracts hero rotator and story video modules', async () => {
    const heroRotator = await read('src/lib/home/heroRotator.ts');
    const storyVideos = await read('src/lib/home/storyVideos.ts');

    expect(heroRotator).toContain('export const initHeroRotator =');
    expect(heroRotator).toContain('Home hero rotator root is missing.');
    expect(storyVideos).toContain('export const initStoryVideos =');
    expect(storyVideos).toContain('story:video-check');
  });

  it('extracts story carousel runtime module', async () => {
    const storyCarousels = await read('src/lib/home/storyCarousels.ts');

    expect(storyCarousels).toContain('export const initStoryCarousels =');
    expect(storyCarousels).toContain(
      'Story carousel needs at least two items.',
    );
    expect(storyCarousels).toContain('phd-at-boston-university');
    expect(storyCarousels).toContain('imperial-crick-training');
  });
});

describe('layout enhancement modularization', () => {
  it('uses shared layout client initializer from layout file', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const layoutClient = await read('src/lib/layout/layoutClient.ts');

    expect(layout).toContain(
      "import { initLayoutClient } from '@/lib/layout/layoutClient';",
    );
    expect(layout).toContain('initLayoutClient();');
    expect(layoutClient).toContain(
      "import { bindLayoutEnhancements } from '@/lib/layout/pageEnhancements';",
    );
    expect(layoutClient).toContain('export const initLayoutClient = () =>');
    expect(layoutClient).toContain('bindLayoutEnhancements();');
  });

  it('loads layout navigation data from a dedicated navigation helper', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const layoutNavigation = await read('src/lib/layout/layoutNavigation.ts');

    expect(layout).toContain(
      "import { getLayoutNavigation } from '@/lib/layout/layoutNavigation';",
    );
    expect(layout).toContain(
      'const { navItems, externalLinks } = await getLayoutNavigation();',
    );
    expect(layoutNavigation).toContain(
      "import { getNavigation, features } from '@/data/navigation';",
    );
    expect(layoutNavigation).toContain(
      "import { hasPublishedBlogPosts } from '@/lib/content';",
    );
    expect(layoutNavigation).toContain(
      'export const getLayoutNavigation = async () =>',
    );
  });

  it('keeps reveal and scroll-offset logic in dedicated helper module', async () => {
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');
    const revealEffects = await read('src/lib/layout/revealEffects.ts');
    const scrollOffsetTracker = await read(
      'src/lib/layout/scrollOffsetTracker.ts',
    );

    expect(enhancements).toContain(
      "import { createRevealEffectsController } from '@/lib/layout/revealEffects';",
    );
    expect(enhancements).toContain(
      "import { createScrollOffsetTracker } from '@/lib/layout/scrollOffsetTracker';",
    );
    expect(enhancements).toContain('const revealEffects =');
    expect(enhancements).toContain('const scrollOffsetTracker =');
    expect(enhancements).toContain(
      'export const bindLayoutEnhancements = () =>',
    );
    expect(revealEffects).toContain(
      'export const createRevealEffectsController = () =>',
    );
    expect(revealEffects).toContain('new IntersectionObserver(');
    expect(scrollOffsetTracker).toContain(
      'export const createScrollOffsetTracker = () =>',
    );
    expect(scrollOffsetTracker).toContain('const headerIsSticky =');
    expect(scrollOffsetTracker).toContain('setScrollOffsetToken');
  });

  it('shares sticky-header offset helpers across layout and scroll runtimes', async () => {
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');
    const scrollOffsetTracker = await read(
      'src/lib/layout/scrollOffsetTracker.ts',
    );
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const projectCarouselTargetTop = await read(
      'src/lib/projectCarouselTargetTop.ts',
    );
    const stickyHeaderOffset = await read(
      'src/lib/layout/stickyHeaderOffset.ts',
    );

    expect(stickyHeaderOffset).toContain(
      'export const getStickyHeader = () =>',
    );
    expect(stickyHeaderOffset).toContain(
      'export const getStickyHeaderOffset = (',
    );
    expect(stickyHeaderOffset).toContain('export const getScrollMarginTop = (');

    expect(enhancements).toContain(
      "import { createScrollOffsetTracker } from '@/lib/layout/scrollOffsetTracker';",
    );
    expect(scrollOffsetTracker).toContain(
      "from '@/lib/layout/stickyHeaderOffset';",
    );
    expect(scrollOffsetTracker).toContain('getStickyHeader');
    expect(scrollOffsetTracker).toContain('getStickyHeaderOffset');

    expect(storyNavigation).toContain(
      "from '@/lib/layout/stickyHeaderOffset';",
    );
    expect(storyNavigation).toContain('getScrollMarginTop');
    expect(storyNavigation).toContain('getStickyHeader');
    expect(storyNavigation).toContain('getStickyHeaderOffset');

    expect(projectCarouselRuntime).toContain(
      "from '@/lib/projectCarouselTargetTop';",
    );
    expect(projectCarouselRuntime).toContain('resolveProjectCarouselTargetTop');
    expect(projectCarouselTargetTop).toContain(
      "from '@/lib/layout/stickyHeaderOffset';",
    );
    expect(projectCarouselTargetTop).toContain('getStickyHeader');
    expect(projectCarouselTargetTop).toContain('getStickyHeaderOffset');
  });

  it('uses a dedicated helper for layout heading typography classes', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const headingTypography = await read('src/lib/layout/headingTypography.ts');

    expect(layout).toContain(
      "import { headingTypographyClasses } from '@/lib/layout/headingTypography';",
    );
    expect(layout).toContain('headingTypographyClasses');
    expect(headingTypography).toContain(
      'export const headingTypographyClasses',
    );
    expect(headingTypography).toContain('[&_h1]:font-header');
    expect(headingTypography).toContain('[&_h6]:tracking-tight');
  });

  it('loads global layout theme rules from a dedicated stylesheet module', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const layoutStyles = await readStylesheetBundle('src/styles/layout.css');

    expect(layout).toContain("import '@/styles/layout.css';");
    expect(layout).not.toContain('<style is:global>');
    expect(layoutStyles).toContain("html[data-theme='dark'] {");
    expect(layoutStyles).toContain('--site-scroll-offset: 96px;');
    expect(layoutStyles).toContain('html.js-enhanced [data-reveal]');
  });
});
