/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselRuntime.ts

Binds interactive runtime behavior for the projects carousel.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';
import {
  wrapCarouselIndex,
  type CarouselIndexTransitionResult,
} from '@/lib/projectCarouselTransitions';
import { resolveProjectCarouselTargetTop } from '@/lib/projectCarouselTargetTop';
import {
  runQuickTrackScroll,
  runQuickWindowScroll,
} from '@/lib/projectCarouselMotion';
import { createProjectCarouselHeightSyncController } from '@/lib/projectCarouselHeightSync';
import { createProjectCarouselVisibilityObserver } from '@/lib/projectCarouselVisibilityObserver';
import {
  activateProgrammaticCarouselTransition,
  isProgrammaticCarouselTransitionLockActive,
} from '@/lib/projectCarouselProgrammaticState';
import { createProjectCarouselTransitionTimers } from '@/lib/projectCarouselTransitionTimers';
import { bindProjectCarouselEventBindings } from '@/lib/projectCarouselEventBindings';
import { createProjectCarouselTransitionOrchestration } from '@/lib/projectCarouselTransitionOrchestration';
import { createProjectCarouselViewportController } from '@/lib/projectCarouselViewport';
import { createProjectCarouselRuntimeConfig } from '@/lib/projectCarouselRuntimeConfig';
import { queryProjectCarouselElements } from '@/lib/projectCarouselElements';
import { applyCarouselActiveIndex } from '@/lib/projectCarouselActiveIndex';
import { createProjectCarouselTrackTargets } from '@/lib/projectCarouselTrackTargets';
import { createProjectCarouselPanelNavigation } from '@/lib/projectCarouselPanelNavigation';
import { createProjectCarouselRuntimeState } from '@/lib/projectCarouselRuntimeState';
import { createProjectCarouselTransitionExecution } from '@/lib/projectCarouselTransitionExecution';
import { createProjectCarouselTrackLockRelease } from '@/lib/projectCarouselTrackLockRelease';
import { createProjectCarouselTransitionScheduling } from '@/lib/projectCarouselTransitionScheduling';
import { createProjectCarouselPanelHeights } from '@/lib/projectCarouselPanelHeights';
import { createProjectCarouselTransitionCancellation } from '@/lib/projectCarouselTransitionCancellation';
import { bindProjectCarouselCleanupLifecycle } from '@/lib/projectCarouselCleanupLifecycle';

let hasBoundProjectCarouselPageLoad = false;

const initProjectCarousel = () => {
  const CARD_JUMP_LINK_SELECTOR = '[data-project-card-jump]';
  const carousel = document.querySelector('[data-project-carousel]');
  if (!(carousel instanceof HTMLElement)) {
    return;
  }

  if (carousel.dataset.carouselReady === 'true') {
    return;
  }
  carousel.dataset.carouselReady = 'true';

  const { track, panels, dots, prevButtons, nextButtons, cardJumpLinks } =
    queryProjectCarouselElements({
      carousel,
      cardJumpLinkSelector: CARD_JUMP_LINK_SELECTOR,
    });

  if (!(track instanceof HTMLElement)) {
    throw new Error('[projects-carousel] Track element not found.');
  }

  if (panels.length === 0) {
    throw new Error('[projects-carousel] No panels found.');
  }

  if (dots.length === 0 || dots.length % panels.length !== 0) {
    throw new Error(
      '[projects-carousel] Dot count does not match panel count.',
    );
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  );

  const total = panels.length;
  const runtimeConfig = createProjectCarouselRuntimeConfig({
    prefersReducedMotion: prefersReducedMotion.matches,
  });
  const HEIGHT_SYNC_INTERSECTION_RATIO =
    runtimeConfig.heightSyncIntersectionRatio;
  const QUICK_SCROLL_DURATION_MS = runtimeConfig.quickScrollDurationMs;
  const QUICK_CORRECTION_DELAY_MS = runtimeConfig.quickCorrectionDelayMs;
  const CORRECTION_THRESHOLD_PX = runtimeConfig.correctionThresholdPx;
  const LONG_JUMP_THRESHOLD = runtimeConfig.longJumpThreshold;
  const LONG_JUMP_FADE_OUT_MS = runtimeConfig.longJumpFadeOutMs;
  const LONG_JUMP_FADE_IN_MS = runtimeConfig.longJumpFadeInMs;
  const transitionPolicy = runtimeConfig.transitionPolicy;
  const wrapIndex = (index: number) => wrapCarouselIndex(index, total);
  const runtimeState = createProjectCarouselRuntimeState({
    wrapIndex,
    cancelAnimationFrame: (frameId) => window.cancelAnimationFrame(frameId),
  });
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

  const heightSyncController = createProjectCarouselHeightSyncController({
    track,
    panels,
    wrapIndex,
    resolveActiveIndex: runtimeState.readActiveIndex,
  });
  const stopTrackHeightSync = heightSyncController.stopTrackHeightSync;
  const scheduleTrackHeightSync = heightSyncController.scheduleTrackHeightSync;
  const disconnectActivePanelResizeObserver =
    heightSyncController.disconnectActivePanelResizeObserver;
  const observeActivePanelHeight =
    heightSyncController.observeActivePanelHeight;

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
  const transitionScheduling = createProjectCarouselTransitionScheduling({
    transitionTimers,
    quickScrollDurationMs: QUICK_SCROLL_DURATION_MS,
    longJumpFadeOutMs: LONG_JUMP_FADE_OUT_MS,
    longJumpFadeInMs: LONG_JUMP_FADE_IN_MS,
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
        read: runtimeState.readTrackQuickScrollFrame,
        write: runtimeState.writeTrackQuickScrollFrame,
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
        read: runtimeState.readWindowQuickScrollFrame,
        write: runtimeState.writeWindowQuickScrollFrame,
      },
    });
  };
  const setActiveIndex = (nextIndex: number, options = {}) => {
    const resolvedIndex = applyCarouselActiveIndex({
      nextIndex,
      activeIndex: runtimeState.readActiveIndex(),
      wrapIndex,
      dots,
      carousel,
      scheduleTrackHeightSync,
      observeActivePanelHeight,
      parseDotIndex: (dot) =>
        parseRequiredCarouselIndex(
          dot.dataset.index,
          '[projects-carousel] Dot index is invalid.',
        ),
      options,
    });
    runtimeState.setActiveIndex(resolvedIndex);
  };

  const { getPanelTargetLeft, getClosestVisiblePanelIndex } =
    createProjectCarouselTrackTargets({
      track,
      panels,
    });
  const runRelativeIndexTransition = (offset: number) => {
    const originIndex = getClosestVisiblePanelIndex();
    runIndexTransition(originIndex + offset, true);
  };
  const { releaseProgrammaticTrackLock } =
    createProjectCarouselTrackLockRelease({
      panels,
      track,
      wrapIndex,
      getPanelTargetLeft,
      setActiveIndex,
      setProgrammaticTrackState,
      clearLongJumpVisualState,
      clearProgrammaticTargetIndex: runtimeState.clearProgrammaticTargetIndex,
      setProgrammaticTransitionActive:
        runtimeState.setProgrammaticTransitionActive,
      requestAnimationFrame: (callback) =>
        window.requestAnimationFrame(callback),
    });
  const activateProgrammaticTransition = (targetIndex: number) => {
    activateProgrammaticCarouselTransition({
      targetIndex,
      setProgrammaticTargetIndex: runtimeState.setProgrammaticTargetIndex,
      setProgrammaticTransitionActive:
        runtimeState.setProgrammaticTransitionActive,
    });
  };
  const { executeIndexScroll, runLongJumpTransition } =
    createProjectCarouselTransitionExecution({
      panels,
      track,
      wrapIndex,
      getPanelTargetLeft,
      getBehavior,
      prefersReducedMotion,
      quickScrollTrackTo,
      stopTrackQuickScroll: runtimeState.stopTrackQuickScroll,
      activateProgrammaticTransition,
      releaseProgrammaticTrackLock,
      disconnectActivePanelResizeObserver,
      stopTrackHeightSync,
      setProgrammaticTrackState,
      clearLongJumpVisualState,
      clearPendingTransitionTimers:
        transitionScheduling.clearPendingTransitionTimers,
      schedulePendingIndexFinalize:
        transitionScheduling.schedulePendingIndexFinalize,
      schedulePendingLongJumpSwap:
        transitionScheduling.schedulePendingLongJumpSwap,
      schedulePendingLongJumpRelease:
        transitionScheduling.schedulePendingLongJumpRelease,
      longJumpFadeOutMs: LONG_JUMP_FADE_OUT_MS,
      longJumpFadeInMs: LONG_JUMP_FADE_IN_MS,
    });
  const { getCurrentPanelHeight, getTargetPanelHeight } =
    createProjectCarouselPanelHeights({
      panels,
      getPanelHeightForIndex: heightSyncController.getPanelHeightForIndex,
    });
  const transitionCancellation = createProjectCarouselTransitionCancellation({
    clearPendingTransitionTimers:
      transitionScheduling.clearPendingTransitionTimers,
    stopQuickScrolls: runtimeState.stopQuickScrolls,
    stopNativeSmoothScroll,
    clearVerticalCorrectionTimer: () =>
      viewportController.clearVerticalCorrectionTimer(),
    setProgrammaticTrackState,
    clearLongJumpVisualState,
    clearProgrammaticTargetIndex: runtimeState.clearProgrammaticTargetIndex,
    setProgrammaticTransitionActive:
      runtimeState.setProgrammaticTransitionActive,
  });

  const cancelCurrentTransition = () => {
    transitionCancellation.cancelCurrentTransition();
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
    transitionScheduling.schedulePendingPreScroll(() => {
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
    stopWindowQuickScroll: runtimeState.stopWindowQuickScroll,
  });
  const { navigateToPanelId, handleHashNavigation } =
    createProjectCarouselPanelNavigation({
      panels,
      runIndexTransition,
      scrollCarouselIntoView: (useQuickMotion) =>
        viewportController.scrollCarouselIntoView(useQuickMotion),
    });

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
    getProgrammaticTargetIndex: runtimeState.readProgrammaticTargetIndex,
    isProgrammaticTransitionActive: () =>
      isProgrammaticCarouselTransitionLockActive({
        isProgrammaticTransition: runtimeState.isProgrammaticTransitionActive(),
        programmaticTargetIndex: runtimeState.readProgrammaticTargetIndex(),
      }),
    setActiveIndex,
  });
  setActiveIndex(0);
  handleHashNavigation(true);
  bindProjectCarouselCleanupLifecycle({
    disconnectObserver: () => observer.disconnect(),
    disposeEventBindings,
    cancelCleanupTransition: transitionCancellation.cancelCleanupTransition,
    stopTrackHeightSync,
    disconnectActivePanelResizeObserver,
    documentTarget: document,
    windowTarget: window,
  });
};

export const bindProjectCarousel = () => {
  initProjectCarousel();
  if (!hasBoundProjectCarouselPageLoad) {
    document.addEventListener('astro:page-load', initProjectCarousel);
    hasBoundProjectCarouselPageLoad = true;
  }
};
