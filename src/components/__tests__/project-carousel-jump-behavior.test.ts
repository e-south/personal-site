/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/project-carousel-jump-behavior.test.ts

Validates project carousel jump behavior and scroll responsiveness.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Project carousel jump behavior', () => {
  it('intercepts project-card hash clicks and performs controlled carousel navigation', async () => {
    const projectCard = await read('src/components/projects/ProjectCard.astro');
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const eventBindings = await read('src/lib/projectCarouselEventBindings.ts');

    expect(projectCard).toContain('data-project-card-jump');
    expect(projectCarouselRuntime).toContain("'[data-project-card-jump]'");
    expect(eventBindings).toContain('event.preventDefault()');
    expect(eventBindings).toContain('history.pushState');
    expect(projectCarouselRuntime).toContain('scrollCarouselIntoView');
    expect(eventBindings).toContain('navigateToPanelId(panelId, true)');
  });

  it('lets project-card asset regions click through to the same jump overlay behavior', async () => {
    const projectCard = await read('src/components/projects/ProjectCard.astro');

    expect(projectCard).toContain('<ProjectBanner banner={banner} />');
    expect(projectCard).toContain('.project-card-jump');
    expect(projectCard).toContain('.project-card-asset');
    expect(projectCard).toContain('pointer-events: none;');
  });

  it('locks observer updates to the intended panel while a card-jump animation is active', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const runtimeState = await read('src/lib/projectCarouselRuntimeState.ts');
    const visibilityObserver = await read(
      'src/lib/projectCarouselVisibilityObserver.ts',
    );

    expect(projectCarouselRuntime).toContain(
      "import { createProjectCarouselRuntimeState } from '@/lib/projectCarouselRuntimeState';",
    );
    expect(runtimeState).toContain(
      'let programmaticTargetIndex: number | null = null;',
    );
    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselVisibilityObserver({',
    );
    expect(visibilityObserver).toContain(
      'if (programmaticTargetIndex !== null) {',
    );
    expect(visibilityObserver).toContain('index !== programmaticTargetIndex');
    expect(runtimeState).toContain('programmaticTargetIndex = null;');
  });

  it('uses a distance-aware long-jump mode to avoid noisy multi-panel travel', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const runtimeConfig = await read('src/lib/projectCarouselRuntimeConfig.ts');

    expect(projectCarouselRuntime).toContain(
      'const LONG_JUMP_THRESHOLD = runtimeConfig.longJumpThreshold;',
    );
    expect(runtimeConfig).toContain('longJumpThreshold: 2');
    expect(projectCarouselRuntime).toContain(
      'project-carousel-track--soft-swap',
    );
    expect(projectCarouselRuntime).toContain(
      'viewportController.scrollCarouselIntoView(',
    );
  });

  it('disables snap while programmatic x-axis repositioning is active to prevent horizontal jitter', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const projectCarouselStyles = await read('src/styles/project-carousel.css');

    expect(projectCarouselRuntime).toContain(
      'project-carousel-track--programmatic',
    );
    expect(projectCarouselStyles).toContain(
      '.project-carousel-track.project-carousel-track--programmatic {',
    );
    expect(projectCarouselStyles).toContain('scroll-snap-type: none;');
  });

  it('treats same-target card clicks as vertical-only jumps without horizontal carousel repositioning', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const transitionOrchestration = await read(
      'src/lib/projectCarouselTransitionOrchestration.ts',
    );

    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselTrackTargets({',
    );
    expect(projectCarouselRuntime).toContain('getClosestVisiblePanelIndex,');
    expect(projectCarouselRuntime).not.toContain(
      'const syncActiveIndexToTrackPosition = () => {',
    );
    expect(transitionOrchestration).toContain(
      'const originIndex = resolveCurrentIndex();',
    );
    expect(transitionOrchestration).toContain(
      'const plan = createCarouselHeightTransitionPlan({',
    );
    expect(transitionOrchestration).toContain(
      'if (plan.wrappedTargetIndex === originIndex) {',
    );
    expect(projectCarouselRuntime).toContain(
      'transitionCancellation.cancelCurrentTransition();',
    );
    expect(transitionOrchestration).toContain("return 'same';");
  });

  it('cancels in-flight native smooth scrolling before applying a new target transition', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const transitionState = await read(
      'src/lib/projectCarouselTransitionState.ts',
    );

    expect(projectCarouselRuntime).toContain(
      'const stopNativeSmoothScroll = () => {',
    );
    expect(projectCarouselRuntime).toContain('left: track.scrollLeft,');
    expect(projectCarouselRuntime).toContain('top: window.scrollY,');
    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselTransitionCancellation({',
    );
    expect(projectCarouselRuntime).toContain('stopNativeSmoothScroll,');
    expect(transitionState).toContain('stopNativeSmoothScroll?.();');
  });

  it('settles on the exact target panel before releasing programmatic snap-lock', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const trackLockRelease = await read(
      'src/lib/projectCarouselTrackLockRelease.ts',
    );

    expect(projectCarouselRuntime).toContain(
      "import { createProjectCarouselTrackLockRelease } from '@/lib/projectCarouselTrackLockRelease';",
    );
    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselTrackLockRelease({',
    );
    expect(trackLockRelease).toContain('const settleTrackOnPanel = (');
    expect(projectCarouselRuntime).toContain('releaseProgrammaticTrackLock,');
    expect(trackLockRelease).toContain(
      'const releaseProgrammaticTrackLock = (',
    );
    expect(trackLockRelease).toContain(
      'onComplete: (() => void) | null = null,',
    );
    expect(trackLockRelease).toContain('requestAnimationFrame(() => {');
    expect(trackLockRelease).toContain('resetProgrammaticCarouselState({');
  });

  it('uses smooth correction for vertical offset reconciliation instead of abrupt post-move snap', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const runtimeConfig = await read('src/lib/projectCarouselRuntimeConfig.ts');
    const projectCarouselViewport = await read(
      'src/lib/projectCarouselViewport.ts',
    );

    expect(projectCarouselRuntime).toContain(
      'const CORRECTION_THRESHOLD_PX = runtimeConfig.correctionThresholdPx;',
    );
    expect(runtimeConfig).toContain('correctionThresholdPx: 10');
    expect(projectCarouselViewport).toContain(
      'const correctCarouselVerticalOffset = (useQuickMotion = false) => {',
    );
    expect(projectCarouselViewport).toContain(
      'quickScrollWindowTo(targetTop);',
    );
    expect(projectCarouselViewport).toContain(
      'correctCarouselVerticalOffset(true);',
    );
  });

  it('drives prev/next controls from the closest visible panel and uses smooth nearest-motion across wrap boundaries', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const eventBindings = await read('src/lib/projectCarouselEventBindings.ts');
    const transitionOrchestration = await read(
      'src/lib/projectCarouselTransitionOrchestration.ts',
    );

    expect(projectCarouselRuntime).toContain(
      'const originIndex = getClosestVisiblePanelIndex();',
    );
    expect(projectCarouselRuntime).not.toContain(
      'runIndexTransition(originIndex - 1, true);',
    );
    expect(projectCarouselRuntime).not.toContain(
      'runIndexTransition(originIndex + 1, true);',
    );
    expect(eventBindings).toContain('runRelativeIndexTransition(-1);');
    expect(eventBindings).toContain('runRelativeIndexTransition(1);');
    expect(projectCarouselRuntime).not.toContain(
      'const isDirectionalWrapTransition = (',
    );
    expect(projectCarouselRuntime).not.toContain('transitionIntent');
    expect(projectCarouselRuntime).not.toContain("return 'wrap';");
    expect(transitionOrchestration).toContain(
      "if (transitionMode === 'long') {",
    );
    expect(projectCarouselRuntime).not.toContain('runForwardWrapTransition');
    expect(projectCarouselRuntime).not.toContain('project-carousel-wrap-clone');
    expect(projectCarouselRuntime).not.toContain('track.append(clone);');
  });

  it('keeps observer target-lock active until transition finalization to avoid mid-flight index churn', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const visibilityObserver = await read(
      'src/lib/projectCarouselVisibilityObserver.ts',
    );

    expect(visibilityObserver).toContain(
      'if (programmaticTargetIndex !== null) {',
    );
    expect(visibilityObserver).toContain(
      'if (index !== programmaticTargetIndex) {',
    );
    expect(visibilityObserver).not.toContain(
      'if (index !== programmaticTargetIndex) {\n            return;\n          }\n          clearProgrammaticTargetIndex();',
    );
    expect(projectCarouselRuntime).toContain(
      'getProgrammaticTargetIndex: runtimeState.readProgrammaticTargetIndex,',
    );
  });

  it('tracks panel visibility ratios across observer updates and gates height sync until a stable intersection threshold', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const runtimeConfig = await read('src/lib/projectCarouselRuntimeConfig.ts');
    const visibilityObserver = await read(
      'src/lib/projectCarouselVisibilityObserver.ts',
    );

    expect(visibilityObserver).toContain(
      'const panelVisibilityRatios = panels.map(() => 0);',
    );
    expect(projectCarouselRuntime).toContain(
      'const HEIGHT_SYNC_INTERSECTION_RATIO =',
    );
    expect(projectCarouselRuntime).toContain(
      'runtimeConfig.heightSyncIntersectionRatio;',
    );
    expect(runtimeConfig).toContain('heightSyncIntersectionRatio: 0.72');
    expect(projectCarouselRuntime).toContain(
      'heightSyncIntersectionRatio: HEIGHT_SYNC_INTERSECTION_RATIO,',
    );
    expect(visibilityObserver).toContain(
      'const getMostVisiblePanelFromRatios = (panelVisibilityRatios: number[]) => {',
    );
    expect(visibilityObserver).toContain('const isProgrammaticLockActive =');
    expect(visibilityObserver).toContain('const shouldSyncHeight =');
    expect(visibilityObserver).toContain(
      '!isProgrammaticLockActive && ratio >= heightSyncIntersectionRatio;',
    );
    expect(visibilityObserver).toContain('setActiveIndex(index, {');
    expect(visibilityObserver).toContain('syncHeight: shouldSyncHeight');
    expect(visibilityObserver).toContain('observeHeight: shouldSyncHeight');
  });

  it('computes panel target scroll positions from snap geometry to prevent post-transition horizontal snap corrections', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const carouselHelpers = await read('src/lib/projectCarousel.ts');
    const trackTargets = await read('src/lib/projectCarouselTrackTargets.ts');

    expect(projectCarouselRuntime).toContain(
      "from '@/lib/projectCarouselTrackTargets';",
    );
    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselTrackTargets',
    );
    expect(trackTargets).toContain('const getTrackMaxScrollLeft = () =>');
    expect(trackTargets).toContain('getTrackMaxScrollLeftFromTrack(track)');
    expect(trackTargets).toContain(
      'const getTrackScrollPaddingInlineStart = () =>',
    );
    expect(trackTargets).toContain(
      'getTrackScrollPaddingInlineStartFromTrack(track)',
    );
    expect(trackTargets).toContain('getPanelTargetLeftFromGeometry');
    expect(carouselHelpers).toContain(
      'Math.max(0, track.scrollWidth - track.clientWidth);',
    );
    expect(carouselHelpers).toContain('const panelLeft = panel.offsetLeft;');
    expect(carouselHelpers).toContain('const panelWidth = panel.offsetWidth;');
    expect(carouselHelpers).toContain('isDesktopViewport');
  });

  it('keeps same-target card jumps on quick vertical motion to avoid delayed secondary reposition', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );

    expect(projectCarouselRuntime).toContain(
      'viewportController.scrollCarouselIntoView(',
    );
  });

  it('centralizes transition timer cleanup to keep programmatic motion state consistent', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const transitionTimers = await read(
      'src/lib/projectCarouselTransitionTimers.ts',
    );
    const transitionScheduling = await read(
      'src/lib/projectCarouselTransitionScheduling.ts',
    );

    expect(projectCarouselRuntime).toContain(
      "import { createProjectCarouselTransitionTimers } from '@/lib/projectCarouselTransitionTimers';",
    );
    expect(projectCarouselRuntime).toContain(
      "import { createProjectCarouselTransitionScheduling } from '@/lib/projectCarouselTransitionScheduling';",
    );
    expect(projectCarouselRuntime).toContain(
      'const transitionTimers = createProjectCarouselTransitionTimers({',
    );
    expect(projectCarouselRuntime).toContain(
      'transitionScheduling.clearPendingTransitionTimers',
    );
    expect(projectCarouselRuntime).toContain(
      'transitionScheduling.schedulePendingPreScroll(',
    );
    expect(projectCarouselRuntime).toContain(
      'transitionScheduling.schedulePendingIndexFinalize',
    );
    expect(projectCarouselRuntime).toContain(
      'transitionScheduling.schedulePendingLongJumpSwap',
    );
    expect(projectCarouselRuntime).toContain(
      'transitionScheduling.schedulePendingLongJumpRelease',
    );
    expect(transitionTimers).toContain(
      'export const createProjectCarouselTransitionTimers = ({',
    );
    expect(transitionTimers).toContain(
      'const clearPendingTransitionTimers = () => {',
    );
    expect(transitionTimers).toContain('clearPendingPreScrollTimer();');
    expect(transitionScheduling).toContain(
      'export const createProjectCarouselTransitionScheduling = ({',
    );
  });

  it('uses a shared relative-index transition helper for controls and keyboard arrows', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const eventBindings = await read('src/lib/projectCarouselEventBindings.ts');

    expect(projectCarouselRuntime).toContain(
      'const runRelativeIndexTransition = (offset: number) => {',
    );
    expect(projectCarouselRuntime).toContain(
      'runIndexTransition(originIndex + offset, true);',
    );
    expect(eventBindings).toContain('runRelativeIndexTransition(-1);');
    expect(eventBindings).toContain('runRelativeIndexTransition(1);');
  });

  it('keeps project panel vertical scrolling chained to page scrolling', async () => {
    const projectPanel = await read(
      'src/components/projects/ProjectPanel.astro',
    );

    expect(projectPanel).not.toContain('overscroll-behavior-y: contain;');
    expect(projectPanel).toContain('overscroll-behavior: auto;');
  });
});
