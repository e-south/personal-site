/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/refactor-architecture.project-carousel.test.ts

Locks refactor boundaries for project carousel modularization.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

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
    const trackTargets = await read('src/lib/projectCarouselTrackTargets.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselTrackTargets } from '@/lib/projectCarouselTrackTargets';",
    );
    expect(runtime).toContain('createProjectCarouselTrackTargets({');
    expect(trackTargets).toContain('getTrackMaxScrollLeftFromTrack(track)');
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

  it('extracts project carousel panel-height accessors into a dedicated helper module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const panelHeights = await read('src/lib/projectCarouselPanelHeights.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselPanelHeights } from '@/lib/projectCarouselPanelHeights';",
    );
    expect(runtime).toContain(
      'const { getCurrentPanelHeight, getTargetPanelHeight } =',
    );
    expect(runtime).toContain('createProjectCarouselPanelHeights({');

    expect(panelHeights).toContain(
      'export const createProjectCarouselPanelHeights = ({',
    );
    expect(panelHeights).toContain('const getCurrentPanelHeight = (');
    expect(panelHeights).toContain('const getTargetPanelHeight = (');
    expect(panelHeights).toContain(
      "throw new Error('[projects-carousel] Active panel is missing.');",
    );
    expect(panelHeights).toContain(
      "throw new Error('[projects-carousel] Target panel is missing.');",
    );
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
    const transitionScheduling = await read(
      'src/lib/projectCarouselTransitionScheduling.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselTransitionTimers } from '@/lib/projectCarouselTransitionTimers';",
    );
    expect(runtime).toContain(
      "import { createProjectCarouselTransitionScheduling } from '@/lib/projectCarouselTransitionScheduling';",
    );
    expect(runtime).toContain(
      'const transitionTimers = createProjectCarouselTransitionTimers({',
    );
    expect(runtime).toContain('createProjectCarouselTransitionScheduling({');
    expect(runtime).toContain(
      'transitionScheduling.clearPendingTransitionTimers',
    );
    expect(runtime).toContain('transitionScheduling.schedulePendingPreScroll(');
    expect(runtime).toContain(
      'transitionScheduling.schedulePendingIndexFinalize',
    );
    expect(runtime).toContain(
      'transitionScheduling.schedulePendingLongJumpSwap',
    );
    expect(runtime).toContain(
      'transitionScheduling.schedulePendingLongJumpRelease',
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
    expect(transitionScheduling).toContain(
      'export const createProjectCarouselTransitionScheduling = ({',
    );
    expect(transitionScheduling).toContain(
      'transitionTimers.schedulePendingIndexFinalizeTimer(',
    );
  });

  it('uses extracted hash helpers for project panel hash parsing and updates', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const panelNavigation = await read(
      'src/lib/projectCarouselPanelNavigation.ts',
    );
    const eventBindings = await read('src/lib/projectCarouselEventBindings.ts');
    const hashHelpers = await read('src/lib/projectCarouselHash.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselPanelNavigation } from '@/lib/projectCarouselPanelNavigation';",
    );
    expect(runtime).toContain('createProjectCarouselPanelNavigation({');
    expect(eventBindings).toContain("from '@/lib/projectCarouselHash';");
    expect(eventBindings).toContain('getPanelIdFromHref');
    expect(eventBindings).toContain('updateHashForPanelId');
    expect(panelNavigation).toContain("from '@/lib/projectCarouselHash';");
    expect(panelNavigation).toContain('getPanelIdFromHash');
    expect(panelNavigation).toContain(
      'export const createProjectCarouselPanelNavigation = ({',
    );
    expect(panelNavigation).toContain('const panelIndexById = new Map');
    expect(panelNavigation).toContain('const handleHashNavigation = (');

    expect(hashHelpers).toContain('export const getPanelIdFromHash = (');
    expect(hashHelpers).toContain('export const getPanelIdFromHref = (');
    expect(hashHelpers).toContain('export const updateHashForPanelId = (');
  });

  it('uses extracted transition state helpers for carousel programmatic reset flows', async () => {
    const transitionState = await read(
      'src/lib/projectCarouselTransitionState.ts',
    );
    const trackLockRelease = await read(
      'src/lib/projectCarouselTrackLockRelease.ts',
    );
    const transitionCancellation = await read(
      'src/lib/projectCarouselTransitionCancellation.ts',
    );

    expect(trackLockRelease).toContain('resetProgrammaticCarouselState({');
    expect(transitionCancellation).toContain(
      "import { cancelProgrammaticCarouselTransition } from '@/lib/projectCarouselTransitionState';",
    );
    expect(transitionCancellation).toContain(
      'cancelProgrammaticCarouselTransition({',
    );

    expect(transitionState).toContain(
      'export const resetProgrammaticCarouselState = (',
    );
    expect(transitionState).toContain(
      'export const cancelProgrammaticCarouselTransition = (',
    );
  });

  it('extracts project carousel transition cancellation wiring into a dedicated helper', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const transitionCancellation = await read(
      'src/lib/projectCarouselTransitionCancellation.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselTransitionCancellation } from '@/lib/projectCarouselTransitionCancellation';",
    );
    expect(runtime).toContain('const transitionCancellation =');
    expect(runtime).toContain('createProjectCarouselTransitionCancellation({');
    expect(runtime).toContain('transitionCancellation.cancelCurrentTransition');
    expect(runtime).toContain('transitionCancellation.cancelCleanupTransition');

    expect(transitionCancellation).toContain(
      'export const createProjectCarouselTransitionCancellation = ({',
    );
    expect(transitionCancellation).toContain('const cancelCurrentTransition =');
    expect(transitionCancellation).toContain('const cancelCleanupTransition =');
    expect(transitionCancellation).toContain(
      "import { cancelProgrammaticCarouselTransition } from '@/lib/projectCarouselTransitionState';",
    );
  });

  it('extracts project carousel cleanup lifecycle registration into a dedicated helper', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const cleanupLifecycle = await read(
      'src/lib/projectCarouselCleanupLifecycle.ts',
    );

    expect(runtime).toContain(
      "import { bindProjectCarouselCleanupLifecycle } from '@/lib/projectCarouselCleanupLifecycle';",
    );
    expect(runtime).toContain('bindProjectCarouselCleanupLifecycle({');
    expect(runtime).toContain(
      'cancelCleanupTransition: transitionCancellation.cancelCleanupTransition,',
    );

    expect(cleanupLifecycle).toContain(
      'export const bindProjectCarouselCleanupLifecycle = ({',
    );
    expect(cleanupLifecycle).toContain('const cleanup = () => {');
    expect(cleanupLifecycle).toContain('disconnectObserver();');
    expect(cleanupLifecycle).toContain(
      "documentTarget.addEventListener('astro:before-swap'",
    );
    expect(cleanupLifecycle).toContain(
      "windowTarget.addEventListener('pagehide', cleanup, { once: true });",
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

  it('extracts transition execution into a dedicated module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const transitionExecution = await read(
      'src/lib/projectCarouselTransitionExecution.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselTransitionExecution } from '@/lib/projectCarouselTransitionExecution';",
    );
    expect(runtime).toContain('createProjectCarouselTransitionExecution({');
    expect(transitionExecution).toContain(
      'export const createProjectCarouselTransitionExecution = ({',
    );
    expect(transitionExecution).toContain('const executeIndexScroll = (');
    expect(transitionExecution).toContain(
      'const runLongJumpTransition = (targetIndex: number, targetHeight: number) => {',
    );
  });

  it('extracts track-settling and programmatic lock release into a dedicated module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const trackLockRelease = await read(
      'src/lib/projectCarouselTrackLockRelease.ts',
    );

    expect(runtime).toContain(
      "import { createProjectCarouselTrackLockRelease } from '@/lib/projectCarouselTrackLockRelease';",
    );
    expect(runtime).toContain('createProjectCarouselTrackLockRelease({');
    expect(trackLockRelease).toContain('const settleTrackOnPanel = (');
    expect(trackLockRelease).toContain(
      'const releaseProgrammaticTrackLock = (',
    );
    expect(trackLockRelease).toContain('requestAnimationFrame(() => {');
    expect(trackLockRelease).toContain('resetProgrammaticCarouselState({');
  });

  it('extracts project carousel runtime module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain('export const bindProjectCarousel = () =>');
    expect(runtime).toContain(
      "throw new Error('[projects-carousel] Track element not found.');",
    );
    expect(runtime).not.toContain('@param {');
  });

  it('extracts project carousel mutable runtime state into a dedicated controller module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const runtimeState = await read('src/lib/projectCarouselRuntimeState.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselRuntimeState } from '@/lib/projectCarouselRuntimeState';",
    );
    expect(runtime).toContain('const runtimeState =');
    expect(runtime).toContain('createProjectCarouselRuntimeState({');
    expect(runtimeState).toContain(
      'export const createProjectCarouselRuntimeState = ({',
    );
    expect(runtimeState).toContain('let activeIndex = -1;');
    expect(runtimeState).toContain('let trackQuickScrollFrame: number | null');
    expect(runtimeState).toContain('let windowQuickScrollFrame: number | null');
    expect(runtimeState).toContain(
      'let programmaticTargetIndex: number | null',
    );
    expect(runtimeState).toContain('let isProgrammaticTransition = false;');
  });

  it('extracts project carousel element querying into a dedicated helper module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const carouselElements = await read('src/lib/projectCarouselElements.ts');

    expect(runtime).toContain(
      "import { queryProjectCarouselElements } from '@/lib/projectCarouselElements';",
    );
    expect(runtime).toContain('const CARD_JUMP_LINK_SELECTOR');
    expect(runtime).toContain('queryProjectCarouselElements({');
    expect(runtime).toContain('cardJumpLinkSelector: CARD_JUMP_LINK_SELECTOR,');
    expect(carouselElements).toContain(
      'export const queryProjectCarouselElements = ({',
    );
    expect(carouselElements).toContain('document.querySelectorAll(');
  });

  it('extracts project carousel track target and closest-panel geometry into a dedicated helper module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const trackTargets = await read('src/lib/projectCarouselTrackTargets.ts');

    expect(runtime).toContain(
      "import { createProjectCarouselTrackTargets } from '@/lib/projectCarouselTrackTargets';",
    );
    expect(runtime).toContain('createProjectCarouselTrackTargets({');
    expect(runtime).toContain('getPanelTargetLeft,');
    expect(runtime).toContain('getClosestVisiblePanelIndex,');
    expect(trackTargets).toContain(
      'export const createProjectCarouselTrackTargets = ({',
    );
    expect(trackTargets).toContain(
      'const getTrackScrollPaddingInlineStart = () =>',
    );
    expect(trackTargets).toContain('const getClosestVisiblePanelIndex = () =>');
  });

  it('extracts project carousel active-index and closest-panel selection into a dedicated helper module', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const activeIndex = await read('src/lib/projectCarouselActiveIndex.ts');

    expect(runtime).toContain(
      "import { applyCarouselActiveIndex } from '@/lib/projectCarouselActiveIndex';",
    );
    expect(runtime).toContain('const setActiveIndex = (');
    expect(runtime).toContain('applyCarouselActiveIndex({');
    expect(activeIndex).toContain('export const applyCarouselActiveIndex = ({');
    expect(activeIndex).toContain(
      'export const resolveClosestVisiblePanelIndex = ({',
    );
    expect(activeIndex).toContain("dot.setAttribute('aria-current'");
  });
});
