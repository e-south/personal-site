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
    const layoutStyles = await read('src/styles/layout.css');

    expect(layout).toContain("import '@/styles/layout.css';");
    expect(layout).not.toContain('<style is:global>');
    expect(layoutStyles).toContain("html[data-theme='dark'] {");
    expect(layoutStyles).toContain('--site-scroll-offset: 96px;');
    expect(layoutStyles).toContain('html.js-enhanced [data-reveal]');
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

  it('loads project carousel styles from a dedicated stylesheet module', async () => {
    const carousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );
    const carouselStyles = await read('src/styles/project-carousel.css');

    expect(carousel).toContain("import '@/styles/project-carousel.css';");
    expect(carousel).not.toContain('<style>');
    expect(carouselStyles).toContain(
      '.project-carousel-track.project-carousel-track--programmatic',
    );
    expect(carouselStyles).toContain('scroll-snap-type: none;');
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
    const transitionOrchestration = await read(
      'src/lib/projectCarouselTransitionOrchestration.ts',
    );

    expect(runtime).toContain(
      "import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';",
    );
    expect(transitionOrchestration).toContain(
      'createCarouselHeightTransitionPlan',
    );
    expect(transitionOrchestration).toContain('getCarouselTransitionMode');
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

  it('extracts carousel viewport alignment and correction handling into a dedicated module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const viewport = await read('src/lib/projectCarouselViewport.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselViewportController } from '@/lib/projectCarouselViewport';",
    );
    expect(runtime).toContain(
      'const viewportController = createProjectCarouselViewportController({',
    );
    expect(runtime).toContain('viewportController.scrollCarouselIntoView(');
    expect(runtime).toContain(
      'viewportController.clearVerticalCorrectionTimer',
    );

    expect(viewport).toContain(
      'export const createProjectCarouselViewportController = ({',
    );
    expect(viewport).toContain('const clearVerticalCorrectionTimer = () => {');
    expect(viewport).toContain('const scrollCarouselIntoView = (');
  });

  it('extracts project carousel viewport target-top resolution into a dedicated helper', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const targetTop = await read('src/lib/projectCarouselTargetTop.ts');

    expect(runtime).toContain(
      "import { resolveProjectCarouselTargetTop } from '@/lib/projectCarouselTargetTop';",
    );
    expect(runtime).toContain('resolveProjectCarouselTargetTop({');

    expect(targetTop).toContain(
      'export const resolveProjectCarouselTargetTop = (',
    );
    expect(targetTop).toContain('getStickyHeaderOffset({');
    expect(targetTop).toContain('window.scrollY');
  });

  it('extracts project carousel visibility observer sync into a dedicated module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const visibilityObserver = await read(
      'src/lib/projectCarouselVisibilityObserver.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselVisibilityObserver } from '@/lib/projectCarouselVisibilityObserver';",
    );
    expect(runtime).toContain(
      'const observer = createProjectCarouselVisibilityObserver({',
    );

    expect(visibilityObserver).toContain(
      'export const createProjectCarouselVisibilityObserver = ({',
    );
    expect(visibilityObserver).toContain('new IntersectionObserver(');
    expect(visibilityObserver).toContain('heightSyncIntersectionRatio');
  });

  it('extracts project carousel height-sync and panel ResizeObserver handling into a dedicated module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const heightSync = await read('src/lib/projectCarouselHeightSync.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselHeightSyncController } from '@/lib/projectCarouselHeightSync';",
    );
    expect(runtime).toContain(
      'const heightSyncController = createProjectCarouselHeightSyncController({',
    );
    expect(runtime).toContain(
      'heightSyncController.disconnectActivePanelResizeObserver',
    );

    expect(heightSync).toContain(
      'export const createProjectCarouselHeightSyncController = ({',
    );
    expect(heightSync).toContain('new ResizeObserver(() => {');
    expect(heightSync).toContain('const scheduleTrackHeightSync = (');
  });

  it('extracts project carousel runtime timing and threshold constants into a dedicated config module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const runtimeConfig = await read('src/lib/projectCarouselRuntimeConfig.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselRuntimeConfig } from '@/lib/projectCarouselRuntimeConfig';",
    );
    expect(runtime).toContain(
      'const runtimeConfig = createProjectCarouselRuntimeConfig({',
    );
    expect(runtime).toContain('runtimeConfig.quickScrollDurationMs');
    expect(runtime).toContain('runtimeConfig.transitionPolicy');

    expect(runtimeConfig).toContain(
      'export const createProjectCarouselRuntimeConfig = ({',
    );
    expect(runtimeConfig).toContain('quickScrollDurationMs: 280');
    expect(runtimeConfig).toContain('longJumpThreshold: 2');
    expect(runtimeConfig).toContain('heightSyncIntersectionRatio: 0.72');
  });

  it('extracts project carousel transition timer scheduling into a dedicated module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const transitionTimers = await read(
      'src/lib/projectCarouselTransitionTimers.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselTransitionTimers } from '@/lib/projectCarouselTransitionTimers';",
    );
    expect(runtime).toContain(
      'const transitionTimers = createProjectCarouselTransitionTimers({',
    );
    expect(runtime).toContain('transitionTimers.clearPendingTransitionTimers');
    expect(runtime).toContain(
      'transitionTimers.schedulePendingPreScrollTimer(',
    );
    expect(runtime).toContain(
      'transitionTimers.schedulePendingIndexFinalizeTimer(',
    );
    expect(runtime).toContain(
      'transitionTimers.schedulePendingLongJumpSwapTimer(',
    );

    expect(transitionTimers).toContain(
      'export const createProjectCarouselTransitionTimers = ({',
    );
    expect(transitionTimers).toContain(
      'const clearPendingTransitionTimers = () => {',
    );
    expect(transitionTimers).toContain(
      'const schedulePendingIndexFinalizeTimer = (',
    );
  });

  it('uses extracted hash helpers for project panel hash parsing and updates', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const eventBindings = await read('src/lib/projectCarouselEventBindings.ts');
    const hashHelpers = await read('src/lib/projectCarouselHash.ts');

    expect(runtime).toContain("from '@/lib/projectCarouselHash';");
    expect(runtime).toContain('getPanelIdFromHash');
    expect(eventBindings).toContain("from '@/lib/projectCarouselHash';");
    expect(eventBindings).toContain('getPanelIdFromHref');
    expect(eventBindings).toContain('updateHashForPanelId');

    expect(hashHelpers).toContain('export const getPanelIdFromHash = (');
    expect(hashHelpers).toContain('export const getPanelIdFromHref = (');
    expect(hashHelpers).toContain('export const updateHashForPanelId = (');
  });

  it('uses extracted transition state helpers for carousel programmatic reset flows', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const transitionState = await read(
      'src/lib/projectCarouselTransitionState.ts',
    );

    expect(runtime).toContain("from '@/lib/projectCarouselTransitionState';");
    expect(runtime).toContain('cancelProgrammaticCarouselTransition({');
    expect(runtime).toContain('resetProgrammaticCarouselState({');

    expect(transitionState).toContain(
      'export const resetProgrammaticCarouselState = (',
    );
    expect(transitionState).toContain(
      'export const cancelProgrammaticCarouselTransition = (',
    );
  });

  it('extracts programmatic transition activation and lock-state checks into a dedicated helper', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const programmaticState = await read(
      'src/lib/projectCarouselProgrammaticState.ts',
    );

    expect(runtime).toContain("from '@/lib/projectCarouselProgrammaticState';");
    expect(runtime).toContain('activateProgrammaticCarouselTransition({');
    expect(runtime).toContain('isProgrammaticCarouselTransitionLockActive({');

    expect(programmaticState).toContain(
      'export const activateProgrammaticCarouselTransition = ({',
    );
    expect(programmaticState).toContain(
      'export const isProgrammaticCarouselTransitionLockActive = ({',
    );
    expect(programmaticState).toContain(
      'isProgrammaticTransition && programmaticTargetIndex !== null',
    );
  });

  it('splits project carousel event listeners into a dedicated event-binding module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const eventBindings = await read('src/lib/projectCarouselEventBindings.ts');

    expect(runtime).toContain(
      "import { bindProjectCarouselEventBindings } from '@/lib/projectCarouselEventBindings';",
    );
    expect(runtime).toContain('bindProjectCarouselEventBindings({');
    expect(eventBindings).toContain(
      'export const bindProjectCarouselEventBindings = (',
    );
    expect(eventBindings).toContain("window.addEventListener('wheel'");
    expect(eventBindings).toContain("window.addEventListener('hashchange'");
  });

  it('splits index-transition planning into a dedicated transition orchestration module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const transitionOrchestration = await read(
      'src/lib/projectCarouselTransitionOrchestration.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselTransitionOrchestration } from '@/lib/projectCarouselTransitionOrchestration';",
    );
    expect(runtime).toContain('createProjectCarouselTransitionOrchestration({');
    expect(transitionOrchestration).toContain(
      'export const createProjectCarouselTransitionOrchestration = (',
    );
    expect(transitionOrchestration).toContain('const runIndexTransition = (');
    expect(transitionOrchestration).toContain(
      'createCarouselHeightTransitionPlan({',
    );
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
