/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselRuntime.ts

Binds interactive runtime behavior for the projects carousel.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { getTrackMaxScrollLeftFromTrack } from '@/lib/projectCarousel';
import {
  getPanelTargetLeft as getPanelTargetLeftFromGeometry,
  getTrackScrollPaddingInlineStart as getTrackScrollPaddingInlineStartFromTrack,
} from '@/lib/projectCarousel';
import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';
import {
  wrapCarouselIndex,
  type CarouselIndexTransitionResult,
} from '@/lib/projectCarouselTransitions';
import { getPanelIdFromHash } from '@/lib/projectCarouselHash';
import { resolveProjectCarouselTargetTop } from '@/lib/projectCarouselTargetTop';
import {
  runQuickTrackScroll,
  runQuickWindowScroll,
} from '@/lib/projectCarouselMotion';
import { createProjectCarouselHeightSyncController } from '@/lib/projectCarouselHeightSync';
import { createProjectCarouselVisibilityObserver } from '@/lib/projectCarouselVisibilityObserver';
import {
  cancelProgrammaticCarouselTransition,
  resetProgrammaticCarouselState,
} from '@/lib/projectCarouselTransitionState';
import { createProjectCarouselTransitionTimers } from '@/lib/projectCarouselTransitionTimers';
import { bindProjectCarouselEventBindings } from '@/lib/projectCarouselEventBindings';
import { createProjectCarouselTransitionOrchestration } from '@/lib/projectCarouselTransitionOrchestration';
import { createProjectCarouselViewportController } from '@/lib/projectCarouselViewport';
import { createProjectCarouselRuntimeConfig } from '@/lib/projectCarouselRuntimeConfig';

const initProjectCarousel = () => {
  const carousel = document.querySelector('[data-project-carousel]');
  if (!(carousel instanceof HTMLElement)) {
    return;
  }

  if (carousel.dataset.carouselReady === 'true') {
    return;
  }
  carousel.dataset.carouselReady = 'true';

  const track = carousel.querySelector('[data-carousel-track]');
  if (!(track instanceof HTMLElement)) {
    throw new Error('[projects-carousel] Track element not found.');
  }

  const panels = Array.from(
    track.querySelectorAll('[data-carousel-panel]'),
  ).filter((panel): panel is HTMLElement => panel instanceof HTMLElement);

  if (panels.length === 0) {
    throw new Error('[projects-carousel] No panels found.');
  }

  const dots = Array.from(
    carousel.querySelectorAll('[data-carousel-dot]'),
  ).filter((dot): dot is HTMLButtonElement => dot instanceof HTMLButtonElement);

  if (dots.length === 0 || dots.length % panels.length !== 0) {
    throw new Error(
      '[projects-carousel] Dot count does not match panel count.',
    );
  }

  const prevButtons = Array.from(
    carousel.querySelectorAll('[data-carousel-prev]'),
  ).filter(
    (button): button is HTMLButtonElement =>
      button instanceof HTMLButtonElement,
  );

  const nextButtons = Array.from(
    carousel.querySelectorAll('[data-carousel-next]'),
  ).filter(
    (button): button is HTMLButtonElement =>
      button instanceof HTMLButtonElement,
  );
  const cardJumpLinks = Array.from(
    document.querySelectorAll('[data-project-card-jump]'),
  ).filter(
    (link): link is HTMLAnchorElement => link instanceof HTMLAnchorElement,
  );

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  );

  const total = panels.length;
  const runtimeConfig = createProjectCarouselRuntimeConfig({
    prefersReducedMotion: prefersReducedMotion.matches,
  });
  const HEIGHT_SYNC_INTERSECTION_RATIO =
    runtimeConfig.heightSyncIntersectionRatio;
  let activeIndex = -1;
  let trackQuickScrollFrame: number | null = null;
  let windowQuickScrollFrame: number | null = null;
  let programmaticTargetIndex: number | null = null;
  let isProgrammaticTransition = false;
  const panelIndexById = new Map<string, number>();
  panels.forEach((panel, index) => {
    panelIndexById.set(panel.id, index);
  });
  const QUICK_SCROLL_DURATION_MS = runtimeConfig.quickScrollDurationMs;
  const QUICK_CORRECTION_DELAY_MS = runtimeConfig.quickCorrectionDelayMs;
  const CORRECTION_THRESHOLD_PX = runtimeConfig.correctionThresholdPx;
  const LONG_JUMP_THRESHOLD = runtimeConfig.longJumpThreshold;
  const LONG_JUMP_FADE_OUT_MS = runtimeConfig.longJumpFadeOutMs;
  const LONG_JUMP_FADE_IN_MS = runtimeConfig.longJumpFadeInMs;
  const transitionPolicy = runtimeConfig.transitionPolicy;
  type ActiveIndexOptions = {
    syncHeight?: boolean;
    observeHeight?: boolean;
    force?: boolean;
  };
  const wrapIndex = (index: number) => wrapCarouselIndex(index, total);
  const getBehavior = () => (prefersReducedMotion.matches ? 'auto' : 'smooth');
  const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;
  track.style.setProperty(
    '--project-carousel-height-transition-ms',
    `${transitionPolicy.heightTransitionMs}ms`,
  );
  track.style.setProperty(
    '--project-carousel-swap-transition-ms',
    `${LONG_JUMP_FADE_IN_MS}ms`,
  );
  const setProgrammaticTargetIndex = (nextIndex: number) => {
    programmaticTargetIndex = wrapIndex(nextIndex);
  };
  const clearProgrammaticTargetIndex = () => {
    programmaticTargetIndex = null;
  };
  const setProgrammaticTransitionActive = (active: boolean) => {
    isProgrammaticTransition = active;
  };

  const stopTrackQuickScroll = () => {
    if (trackQuickScrollFrame !== null) {
      window.cancelAnimationFrame(trackQuickScrollFrame);
      trackQuickScrollFrame = null;
    }
  };

  const stopWindowQuickScroll = () => {
    if (windowQuickScrollFrame !== null) {
      window.cancelAnimationFrame(windowQuickScrollFrame);
      windowQuickScrollFrame = null;
    }
  };

  const heightSyncController = createProjectCarouselHeightSyncController({
    track,
    panels,
    wrapIndex,
    resolveActiveIndex: () => activeIndex,
  });
  const stopTrackHeightSync = heightSyncController.stopTrackHeightSync;
  const scheduleTrackHeightSync = heightSyncController.scheduleTrackHeightSync;
  const disconnectActivePanelResizeObserver =
    heightSyncController.disconnectActivePanelResizeObserver;
  const observeActivePanelHeight =
    heightSyncController.observeActivePanelHeight;

  const stopQuickScrolls = () => {
    stopTrackQuickScroll();
    stopWindowQuickScroll();
  };
  const stopNativeSmoothScroll = () => {
    track.scrollTo({
      left: track.scrollLeft,
      behavior: 'auto',
    });
    window.scrollTo({
      top: window.scrollY,
      behavior: 'auto',
    });
  };

  const transitionTimers = createProjectCarouselTransitionTimers({
    setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
    clearTimeout: (timerId) => window.clearTimeout(timerId),
  });
  const setProgrammaticTrackState = (active: boolean) => {
    track.classList.toggle('project-carousel-track--programmatic', active);
  };
  const clearLongJumpVisualState = () => {
    track.classList.remove('project-carousel-track--soft-swap');
  };

  const quickScrollTrackTo = (
    targetLeft: number,
    onComplete: (() => void) | null = null,
  ) => {
    runQuickTrackScroll({
      track,
      targetLeft,
      durationMs: QUICK_SCROLL_DURATION_MS,
      ease: easeOutCubic,
      frameStore: {
        read: () => trackQuickScrollFrame,
        write: (frameId) => {
          trackQuickScrollFrame = frameId;
        },
      },
      onComplete,
    });
  };

  const quickScrollWindowTo = (targetTop: number) => {
    runQuickWindowScroll({
      targetTop,
      durationMs: QUICK_SCROLL_DURATION_MS,
      ease: easeOutCubic,
      frameStore: {
        read: () => windowQuickScrollFrame,
        write: (frameId) => {
          windowQuickScrollFrame = frameId;
        },
      },
    });
  };
  const setActiveIndex = (
    nextIndex: number,
    {
      syncHeight = true,
      observeHeight = true,
      force = false,
    }: ActiveIndexOptions = {},
  ) => {
    const wrappedActiveIndex = wrapIndex(nextIndex);
    if (wrappedActiveIndex === activeIndex) {
      if (!force) {
        return;
      }
      if (syncHeight) {
        scheduleTrackHeightSync(wrappedActiveIndex);
      }
      if (observeHeight) {
        observeActivePanelHeight();
      }
      return;
    }
    activeIndex = wrappedActiveIndex;
    dots.forEach((dot) => {
      const dotIndex = parseRequiredCarouselIndex(
        dot.dataset.index,
        '[projects-carousel] Dot index is invalid.',
      );
      const isActive = dotIndex === activeIndex;
      dot.dataset.active = String(isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    carousel.dataset.activeIndex = String(activeIndex);
    if (syncHeight) {
      scheduleTrackHeightSync(activeIndex);
    }
    if (observeHeight) {
      observeActivePanelHeight();
    }
  };

  const getTrackMaxScrollLeft = () => getTrackMaxScrollLeftFromTrack(track);
  const clampTrackScrollLeft = (value: number) =>
    Math.min(getTrackMaxScrollLeft(), Math.max(0, value));
  const getTrackScrollPaddingInlineStart = () =>
    getTrackScrollPaddingInlineStartFromTrack(track);
  const getPanelTargetLeft = (panel: HTMLElement) => {
    const isDesktopViewport = window.matchMedia('(min-width: 768px)').matches;
    const scrollPaddingInlineStart = getTrackScrollPaddingInlineStart();
    return clampTrackScrollLeft(
      getPanelTargetLeftFromGeometry({
        track,
        panel,
        isDesktopViewport,
        scrollPaddingInlineStart,
      }),
    );
  };
  const getClosestVisiblePanelIndex = () => {
    const currentLeft = track.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    panels.forEach((panel, index) => {
      const distance = Math.abs(getPanelTargetLeft(panel) - currentLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };
  const runRelativeIndexTransition = (offset: number) => {
    const originIndex = getClosestVisiblePanelIndex();
    runIndexTransition(originIndex + offset, true);
  };
  const settleTrackOnPanel = (index: number) => {
    const wrappedIndex = wrapIndex(index);
    const panel = panels[wrappedIndex];
    if (!(panel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    const targetLeft = getPanelTargetLeft(panel);
    if (Math.abs(track.scrollLeft - targetLeft) >= 1) {
      track.scrollTo({
        left: targetLeft,
        behavior: 'auto',
      });
    }
    setActiveIndex(wrappedIndex, {
      syncHeight: true,
      observeHeight: true,
      force: true,
    });
  };
  const releaseProgrammaticTrackLock = (
    index: number,
    onComplete: (() => void) | null = null,
  ) => {
    settleTrackOnPanel(index);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        resetProgrammaticCarouselState({
          setProgrammaticTrackState,
          clearLongJumpVisualState,
          clearProgrammaticTargetIndex,
          setProgrammaticTransitionActive,
        });
        if (typeof onComplete === 'function') {
          onComplete();
        }
      });
    });
  };
  const executeIndexScroll = (
    nextIndex: number,
    useQuickMotion = false,
    onComplete: (() => void) | null = null,
  ) => {
    const wrapped = wrapIndex(nextIndex);
    const panel = panels[wrapped];
    if (!panel) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    const targetLeft = getPanelTargetLeft(panel);
    const finalizeIndexScroll = () => {
      releaseProgrammaticTrackLock(wrapped, onComplete);
    };
    isProgrammaticTransition = true;
    setProgrammaticTargetIndex(wrapped);
    setProgrammaticTrackState(true);
    if (useQuickMotion && !prefersReducedMotion.matches) {
      quickScrollTrackTo(targetLeft, () => {
        finalizeIndexScroll();
      });
      return;
    }
    stopTrackQuickScroll();
    track.scrollTo({
      left: targetLeft,
      behavior: getBehavior(),
    });
    if (getBehavior() === 'auto') {
      finalizeIndexScroll();
      return;
    }
    transitionTimers.schedulePendingIndexFinalizeTimer(() => {
      finalizeIndexScroll();
    }, QUICK_SCROLL_DURATION_MS);
  };

  const runLongJumpTransition = (targetIndex: number, targetHeight: number) => {
    disconnectActivePanelResizeObserver();
    stopTrackHeightSync();
    stopTrackQuickScroll();
    transitionTimers.clearPendingTransitionTimers();
    isProgrammaticTransition = true;
    setProgrammaticTargetIndex(targetIndex);
    setProgrammaticTrackState(true);
    track.classList.add('project-carousel-track--soft-swap');
    track.style.height = `${targetHeight}px`;
    const finalizeLongJump = () => {
      const panel = panels[targetIndex];
      if (!(panel instanceof HTMLElement)) {
        throw new Error('[projects-carousel] Target panel is missing.');
      }
      const targetLeft = getPanelTargetLeft(panel);
      track.scrollTo({
        left: targetLeft,
        behavior: 'auto',
      });
      releaseProgrammaticTrackLock(targetIndex);
      clearLongJumpVisualState();
      if (LONG_JUMP_FADE_IN_MS <= 0) {
        return;
      }
      transitionTimers.schedulePendingLongJumpReleaseTimer(
        () => {},
        LONG_JUMP_FADE_IN_MS,
      );
    };
    if (LONG_JUMP_FADE_OUT_MS <= 0) {
      finalizeLongJump();
      return;
    }
    transitionTimers.schedulePendingLongJumpSwapTimer(() => {
      finalizeLongJump();
    }, LONG_JUMP_FADE_OUT_MS);
  };

  const getCurrentPanelHeight = (wrappedCurrentIndex: number) => {
    const currentPanel = panels[wrappedCurrentIndex];
    if (!(currentPanel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Active panel is missing.');
    }
    return heightSyncController.getPanelHeightForIndex(wrappedCurrentIndex);
  };

  const getTargetPanelHeight = (wrappedTargetIndex: number) => {
    const targetPanel = panels[wrappedTargetIndex];
    if (!(targetPanel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    return heightSyncController.getPanelHeightForIndex(wrappedTargetIndex);
  };

  const cancelCurrentTransition = () => {
    cancelProgrammaticCarouselTransition({
      clearPendingTransitionTimers:
        transitionTimers.clearPendingTransitionTimers,
      stopQuickScrolls,
      stopNativeSmoothScroll,
      clearVerticalCorrectionTimer:
        viewportController.clearVerticalCorrectionTimer,
      setProgrammaticTrackState,
      clearLongJumpVisualState,
      clearProgrammaticTargetIndex,
      setProgrammaticTransitionActive,
    });
  };

  const runPreExpandedScroll = (
    wrappedTargetIndex: number,
    useQuickMotion: boolean,
    delayMs: number,
  ) => {
    if (delayMs <= 0) {
      executeIndexScroll(wrappedTargetIndex, useQuickMotion);
      return;
    }
    transitionTimers.schedulePendingPreScrollTimer(() => {
      executeIndexScroll(wrappedTargetIndex, useQuickMotion);
    }, delayMs);
  };

  const transitionOrchestration = createProjectCarouselTransitionOrchestration({
    total,
    longJumpThreshold: LONG_JUMP_THRESHOLD,
    transitionPolicy,
    track,
    resolveCurrentIndex: getClosestVisiblePanelIndex,
    getCurrentPanelHeight,
    getTargetPanelHeight,
    cancelCurrentTransition,
    setActiveIndex,
    executeIndexScroll,
    runPreExpandedScroll,
    runLongJumpTransition,
    disconnectActivePanelResizeObserver,
    stopTrackHeightSync,
  });

  const runIndexTransition = (
    targetIndex: number,
    useQuickMotion = false,
  ): CarouselIndexTransitionResult => {
    return transitionOrchestration.runIndexTransition(
      targetIndex,
      useQuickMotion,
    );
  };

  const scrollToPanelId = (
    panelId: string,
    useQuickMotion = false,
  ): CarouselIndexTransitionResult | false => {
    const mappedIndex = panelIndexById.get(panelId);
    if (typeof mappedIndex !== 'number' || !Number.isInteger(mappedIndex)) {
      return false;
    }
    return runIndexTransition(mappedIndex, useQuickMotion);
  };

  const getCarouselTargetTop = () => {
    return resolveProjectCarouselTargetTop({
      carousel,
      baseOffsetPx: 20,
    });
  };
  const viewportController = createProjectCarouselViewportController({
    getTargetTop: getCarouselTargetTop,
    getBehavior,
    prefersReducedMotion,
    quickCorrectionDelayMs: QUICK_CORRECTION_DELAY_MS,
    correctionThresholdPx: CORRECTION_THRESHOLD_PX,
    quickScrollWindowTo,
    stopWindowQuickScroll,
  });

  const navigateToPanelId = (
    panelId: string,
    useQuickMotion = false,
  ): boolean => {
    const transitionMode = scrollToPanelId(panelId, useQuickMotion);
    if (!transitionMode) {
      return false;
    }
    viewportController.scrollCarouselIntoView(
      useQuickMotion && transitionMode !== 'wrap',
    );
    return true;
  };

  const handleHashNavigation = (useQuickMotion = true) => {
    const panelId = getPanelIdFromHash(window.location.hash);
    if (!panelId) {
      return;
    }
    navigateToPanelId(panelId, useQuickMotion);
  };

  const cancelProgrammaticReposition = () => {
    cancelCurrentTransition();
  };

  const disposeEventBindings = bindProjectCarouselEventBindings({
    track,
    total,
    dots,
    prevButtons,
    nextButtons,
    cardJumpLinks,
    runRelativeIndexTransition,
    runIndexTransition,
    navigateToPanelId,
    cancelProgrammaticReposition,
    scheduleTrackHeightSync,
    handleHashNavigation,
  });

  const observer = createProjectCarouselVisibilityObserver({
    track,
    panels,
    heightSyncIntersectionRatio: HEIGHT_SYNC_INTERSECTION_RATIO,
    getProgrammaticTargetIndex: () => programmaticTargetIndex,
    isProgrammaticTransitionActive: () =>
      isProgrammaticTransition && programmaticTargetIndex !== null,
    setActiveIndex,
  });
  setActiveIndex(0);
  handleHashNavigation(true);
  const cleanup = () => {
    observer.disconnect();
    disposeEventBindings();
    cancelProgrammaticCarouselTransition({
      clearPendingTransitionTimers:
        transitionTimers.clearPendingTransitionTimers,
      stopQuickScrolls,
      clearVerticalCorrectionTimer:
        viewportController.clearVerticalCorrectionTimer,
      setProgrammaticTrackState,
      clearLongJumpVisualState,
      clearProgrammaticTargetIndex,
      setProgrammaticTransitionActive,
    });
    stopTrackHeightSync();
    disconnectActivePanelResizeObserver();
  };
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  window.addEventListener('pagehide', cleanup, { once: true });
};

export const bindProjectCarousel = () => {
  initProjectCarousel();
  document.addEventListener('astro:page-load', initProjectCarousel);
};
