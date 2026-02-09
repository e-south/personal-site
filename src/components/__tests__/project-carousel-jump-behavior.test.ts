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
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCard).toContain('data-project-card-jump');
    expect(projectCarousel).toContain("'[data-project-card-jump]'");
    expect(projectCarousel).toContain('event.preventDefault()');
    expect(projectCarousel).toContain('history.pushState');
    expect(projectCarousel).toContain('scrollCarouselIntoView');
    expect(projectCarousel).toContain('navigateToPanelId(panelId, true)');
  });

  it('lets project-card asset regions click through to the same jump overlay behavior', async () => {
    const projectCard = await read('src/components/projects/ProjectCard.astro');

    expect(projectCard).toContain('<ProjectBanner banner={banner} />');
    expect(projectCard).toContain('.project-card-jump');
    expect(projectCard).toContain('.project-card-asset');
    expect(projectCard).toContain('pointer-events: none;');
  });

  it('locks observer updates to the intended panel while a card-jump animation is active', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'let programmaticTargetIndex: number | null = null;',
    );
    expect(projectCarousel).toContain(
      'if (programmaticTargetIndex !== null) {',
    );
    expect(projectCarousel).toContain('index !== programmaticTargetIndex');
    expect(projectCarousel).toContain('programmaticTargetIndex = null;');
  });

  it('uses a distance-aware long-jump mode to avoid noisy multi-panel travel', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain('LONG_JUMP_THRESHOLD = 2;');
    expect(projectCarousel).toContain('project-carousel-track--soft-swap');
    expect(projectCarousel).toContain(
      "scrollCarouselIntoView(useQuickMotion && transitionMode !== 'wrap')",
    );
  });

  it('disables snap while programmatic x-axis repositioning is active to prevent horizontal jitter', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain('project-carousel-track--programmatic');
    expect(projectCarousel).toContain(
      '.project-carousel-track.project-carousel-track--programmatic {',
    );
    expect(projectCarousel).toContain('scroll-snap-type: none;');
  });

  it('treats same-target card clicks as vertical-only jumps without horizontal carousel repositioning', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'const getClosestVisiblePanelIndex = () => {',
    );
    expect(projectCarousel).not.toContain(
      'const syncActiveIndexToTrackPosition = () => {',
    );
    expect(projectCarousel).toContain(
      'const originIndex = getClosestVisiblePanelIndex();',
    );
    expect(projectCarousel).toContain(
      'const plan = createHeightTransitionPlan(targetIndex, originIndex);',
    );
    expect(projectCarousel).toContain(
      'if (plan.wrappedTargetIndex === originIndex) {',
    );
    expect(projectCarousel).toContain('stopQuickScrolls();');
    expect(projectCarousel).toContain('clearProgrammaticTargetIndex();');
    expect(projectCarousel).toContain("return 'same';");
  });

  it('cancels in-flight native smooth scrolling before applying a new target transition', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain('const stopNativeSmoothScroll = () => {');
    expect(projectCarousel).toContain('left: track.scrollLeft,');
    expect(projectCarousel).toContain('top: window.scrollY,');
    expect(projectCarousel).toContain('stopNativeSmoothScroll();');
  });

  it('settles on the exact target panel before releasing programmatic snap-lock', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'const settleTrackOnPanel = (index: number) => {',
    );
    expect(projectCarousel).toContain('const releaseProgrammaticTrackLock = (');
    expect(projectCarousel).toContain(
      'onComplete: (() => void) | null = null,',
    );
    expect(projectCarousel).toContain('window.requestAnimationFrame(() => {');
    expect(projectCarousel).toContain('setProgrammaticTrackState(false);');
  });

  it('uses smooth correction for vertical offset reconciliation instead of abrupt post-move snap', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain('const CORRECTION_THRESHOLD_PX = 10;');
    expect(projectCarousel).toContain(
      'const correctCarouselVerticalOffset = (useQuickMotion = false) => {',
    );
    expect(projectCarousel).toContain('quickScrollWindowTo(targetTop);');
    expect(projectCarousel).toContain('correctCarouselVerticalOffset(true);');
  });

  it('drives prev/next controls from the closest visible panel and uses smooth nearest-motion across wrap boundaries', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'const originIndex = getClosestVisiblePanelIndex();',
    );
    expect(projectCarousel).not.toContain(
      'runIndexTransition(originIndex - 1, true);',
    );
    expect(projectCarousel).not.toContain(
      'runIndexTransition(originIndex + 1, true);',
    );
    expect(projectCarousel).toContain('runRelativeIndexTransition(-1);');
    expect(projectCarousel).toContain('runRelativeIndexTransition(1);');
    expect(projectCarousel).not.toContain(
      'const isDirectionalWrapTransition = (',
    );
    expect(projectCarousel).not.toContain('transitionIntent');
    expect(projectCarousel).not.toContain("return 'wrap';");
    expect(projectCarousel).toContain("if (transitionMode === 'long') {");
    expect(projectCarousel).not.toContain('runForwardWrapTransition');
    expect(projectCarousel).not.toContain('project-carousel-wrap-clone');
    expect(projectCarousel).not.toContain('track.append(clone);');
  });

  it('keeps observer target-lock active until transition finalization to avoid mid-flight index churn', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'if (programmaticTargetIndex !== null) {',
    );
    expect(projectCarousel).toContain(
      'if (index !== programmaticTargetIndex) {',
    );
    expect(projectCarousel).not.toContain(
      'if (index !== programmaticTargetIndex) {\n            return;\n          }\n          clearProgrammaticTargetIndex();',
    );
  });

  it('tracks panel visibility ratios across observer updates and gates height sync until a stable intersection threshold', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'const panelVisibilityRatios = panels.map(() => 0);',
    );
    expect(projectCarousel).toContain(
      'const HEIGHT_SYNC_INTERSECTION_RATIO = 0.72;',
    );
    expect(projectCarousel).toContain(
      'const getMostVisiblePanelFromRatios = () => {',
    );
    expect(projectCarousel).toContain(
      'const isProgrammaticLockActive =\n          isProgrammaticTransition && programmaticTargetIndex !== null;',
    );
    expect(projectCarousel).toContain('const shouldSyncHeight =');
    expect(projectCarousel).toContain(
      '!isProgrammaticLockActive && ratio >= HEIGHT_SYNC_INTERSECTION_RATIO;',
    );
    expect(projectCarousel).toContain('setActiveIndex(index, {');
    expect(projectCarousel).toContain('syncHeight: shouldSyncHeight');
    expect(projectCarousel).toContain('observeHeight: shouldSyncHeight');
  });

  it('computes panel target scroll positions from snap geometry to prevent post-transition horizontal snap corrections', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );
    const carouselHelpers = await read('src/lib/projectCarousel.ts');

    expect(projectCarousel).toContain('const getTrackMaxScrollLeft = () =>');
    expect(projectCarousel).toContain('getTrackMaxScrollLeftFromTrack(track)');
    expect(projectCarousel).toContain(
      'const getTrackScrollPaddingInlineStart = () =>',
    );
    expect(projectCarousel).toContain(
      'getTrackScrollPaddingInlineStartFromTrack(track)',
    );
    expect(projectCarousel).toContain('getPanelTargetLeftFromGeometry');
    expect(carouselHelpers).toContain(
      'Math.max(0, track.scrollWidth - track.clientWidth);',
    );
    expect(carouselHelpers).toContain('const panelLeft = panel.offsetLeft;');
    expect(carouselHelpers).toContain('const panelWidth = panel.offsetWidth;');
    expect(carouselHelpers).toContain('isDesktopViewport');
  });

  it('keeps same-target card jumps on quick vertical motion to avoid delayed secondary reposition', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      "scrollCarouselIntoView(useQuickMotion && transitionMode !== 'wrap');",
    );
  });

  it('centralizes transition timer cleanup to keep programmatic motion state consistent', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'const clearPendingTransitionTimers = () => {',
    );
    expect(projectCarousel).toContain('clearPendingPreScrollTimer();');
    expect(projectCarousel).toContain('clearPendingIndexFinalizeTimer();');
    expect(projectCarousel).toContain('clearPendingLongJumpSwapTimer();');
    expect(projectCarousel).toContain('clearPendingLongJumpReleaseTimer();');
    expect(projectCarousel).toContain('clearPendingTransitionTimers();');
  });

  it('uses a shared relative-index transition helper for controls and keyboard arrows', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(projectCarousel).toContain(
      'const runRelativeIndexTransition = (offset: number) => {',
    );
    expect(projectCarousel).toContain(
      'runIndexTransition(originIndex + offset, true);',
    );
    expect(projectCarousel).toContain('runRelativeIndexTransition(-1);');
    expect(projectCarousel).toContain('runRelativeIndexTransition(1);');
  });

  it('keeps project panel vertical scrolling chained to page scrolling', async () => {
    const projectPanel = await read(
      'src/components/projects/ProjectPanel.astro',
    );

    expect(projectPanel).not.toContain('overscroll-behavior-y: contain;');
    expect(projectPanel).toContain('overscroll-behavior: auto;');
  });
});
