/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/refactor-architecture.test.ts

Locks refactor boundaries for modular home, layout, and project carousel logic.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('home runtime modularization', () => {
  it('delegates hero and story video logic from home orchestrator', async () => {
    const home = await read('src/lib/home.ts');

    expect(home).toContain(
      "import { initHeroRotator } from '@/lib/home/heroRotator';",
    );
    expect(home).toContain(
      "import { initStoryVideos } from '@/lib/home/storyVideos';",
    );
    expect(home).toContain('initHeroRotator({');
    expect(home).toContain('initStoryVideos({');
  });

  it('delegates story carousel runtime wiring from home orchestrator', async () => {
    const home = await read('src/lib/home.ts');

    expect(home).toContain(
      "import { initStoryCarousels } from '@/lib/home/storyCarousels';",
    );
    expect(home).toContain('initStoryCarousels({ getScrollBehavior })');
  });

  it('delegates story navigation runtime from home orchestrator', async () => {
    const home = await read('src/lib/home.ts');
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');

    expect(home).toContain(
      "import { initStoryNavigation } from '@/lib/home/storyNavigation';",
    );
    expect(home).toContain('initStoryNavigation({');
    expect(storyNavigation).toContain('export const initStoryNavigation = (');
    expect(storyNavigation).toContain('data-story-nav');
    expect(storyNavigation).toContain('Story navigation controls are missing.');
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
  it('uses shared layout enhancement binder from layout file', async () => {
    const layout = await read('src/layouts/Layout.astro');

    expect(layout).toContain(
      "import { bindLayoutEnhancements } from '@/lib/layout/pageEnhancements';",
    );
    expect(layout).toContain('bindLayoutEnhancements();');
  });

  it('keeps reveal and scroll-offset logic in dedicated helper module', async () => {
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');

    expect(enhancements).toContain('const setScrollOffsetToken = () =>');
    expect(enhancements).toContain('const initReveals = () =>');
    expect(enhancements).toContain(
      'export const bindLayoutEnhancements = () =>',
    );
  });

  it('shares sticky-header offset helpers across layout and scroll runtimes', async () => {
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
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

    expect(enhancements).toContain("from '@/lib/layout/stickyHeaderOffset';");
    expect(enhancements).toContain('getStickyHeader');
    expect(enhancements).toContain('getStickyHeaderOffset');

    expect(storyNavigation).toContain(
      "from '@/lib/layout/stickyHeaderOffset';",
    );
    expect(storyNavigation).toContain('getScrollMarginTop');
    expect(storyNavigation).toContain('getStickyHeader');
    expect(storyNavigation).toContain('getStickyHeaderOffset');

    expect(projectCarouselRuntime).toContain(
      "from '@/lib/layout/stickyHeaderOffset';",
    );
    expect(projectCarouselRuntime).toContain('getStickyHeader');
    expect(projectCarouselRuntime).toContain('getStickyHeaderOffset');
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
});

describe('project carousel helper extraction', () => {
  it('uses dedicated project carousel runtime binder from component script', async () => {
    const carousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(carousel).toContain(
      "import { bindProjectCarousel } from '@/lib/projectCarouselRuntime';",
    );
    expect(carousel).toContain('bindProjectCarousel();');
  });

  it('extracts project carousel side controls into a dedicated component', async () => {
    const carousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );
    const sideControl = await read(
      'src/components/projects/ProjectCarouselSideControl.astro',
    );

    expect(carousel).toContain(
      "import ProjectCarouselSideControl from '@/components/projects/ProjectCarouselSideControl.astro';",
    );
    expect(carousel).toContain('<ProjectCarouselSideControl');
    expect(sideControl).toContain('data-carousel-prev');
    expect(sideControl).toContain('data-carousel-next');
  });

  it('uses shared project carousel geometry helpers from component script', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain(
      "import { getTrackMaxScrollLeftFromTrack } from '@/lib/projectCarousel';",
    );
    expect(runtime).toContain('getTrackMaxScrollLeftFromTrack(track)');
  });

  it('defines reusable project carousel geometry helpers', async () => {
    const helpers = await read('src/lib/projectCarousel.ts');

    expect(helpers).toContain(
      'export const getTrackMaxScrollLeftFromTrack = (',
    );
    expect(helpers).toContain(
      'export const getTrackScrollPaddingInlineStart = (',
    );
    expect(helpers).toContain('export const getPanelTargetLeft = (');
  });

  it('uses shared transition helpers from a dedicated carousel module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain(
      "import { createCarouselHeightTransitionPlan } from '@/lib/projectCarouselTransitions';",
    );
    expect(runtime).toContain(
      "import { getCarouselTransitionMode } from '@/lib/projectCarouselTransitions';",
    );
    expect(runtime).toContain(
      "import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';",
    );
  });

  it('uses extracted quick-scroll motion helpers for carousel and window movement', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const motion = await read('src/lib/projectCarouselMotion.ts');

    expect(runtime).toContain("from '@/lib/projectCarouselMotion';");
    expect(runtime).toContain('runQuickTrackScroll');
    expect(runtime).toContain('runQuickWindowScroll');
    expect(runtime).toContain('runQuickTrackScroll({');
    expect(runtime).toContain('runQuickWindowScroll({');

    expect(motion).toContain('export const runQuickTrackScroll = (');
    expect(motion).toContain('export const runQuickWindowScroll = (');
  });

  it('uses extracted hash helpers for project panel hash parsing and updates', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const hashHelpers = await read('src/lib/projectCarouselHash.ts');

    expect(runtime).toContain("from '@/lib/projectCarouselHash';");
    expect(runtime).toContain('getPanelIdFromHash');
    expect(runtime).toContain('getPanelIdFromHref');
    expect(runtime).toContain('updateHashForPanelId');

    expect(hashHelpers).toContain('export const getPanelIdFromHash = (');
    expect(hashHelpers).toContain('export const getPanelIdFromHref = (');
    expect(hashHelpers).toContain('export const updateHashForPanelId = (');
  });

  it('extracts project carousel runtime module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain('export const bindProjectCarousel = () =>');
    expect(runtime).toContain(
      "throw new Error('[projects-carousel] Track element not found.');",
    );
    expect(runtime).not.toContain('@param {');
  });
});

describe('story chapter rendering modularization', () => {
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
