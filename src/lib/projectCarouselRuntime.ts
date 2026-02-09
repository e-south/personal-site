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
import { createCarouselHeightTransitionPlan } from '@/lib/projectCarouselTransitions';
import { getCarouselTransitionMode } from '@/lib/projectCarouselTransitions';
import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';
import {
  wrapCarouselIndex,
  type CarouselIndexTransitionResult,
} from '@/lib/projectCarouselTransitions';

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
  const HEIGHT_SYNC_INTERSECTION_RATIO = 0.72;
  let activeIndex = -1;
  let verticalCorrectionTimer: number | null = null;
  let trackQuickScrollFrame: number | null = null;
  let windowQuickScrollFrame: number | null = null;
  let trackHeightSyncFrame: number | null = null;
  let activePanelResizeObserver: ResizeObserver | null = null;
  let pendingPreScrollTimer: number | null = null;
  let pendingIndexFinalizeTimer: number | null = null;
  let pendingLongJumpSwapTimer: number | null = null;
  let pendingLongJumpReleaseTimer: number | null = null;
  let programmaticTargetIndex: number | null = null;
  let isProgrammaticTransition = false;
  const panelVisibilityRatios = panels.map(() => 0);
  const panelIndexById = new Map<string, number>();
  panels.forEach((panel, index) => {
    panelIndexById.set(panel.id, index);
  });
  const QUICK_SCROLL_DURATION_MS = 280;
  const QUICK_CORRECTION_DELAY_MS = QUICK_SCROLL_DURATION_MS + 36;
  const CORRECTION_THRESHOLD_PX = 10;
  const LONG_JUMP_THRESHOLD = 2;
  const LONG_JUMP_FADE_OUT_MS = prefersReducedMotion.matches ? 0 : 120;
  const LONG_JUMP_FADE_IN_MS = prefersReducedMotion.matches ? 0 : 180;
  const transitionPolicy = {
    heightTransitionMs: prefersReducedMotion.matches ? 0 : 520,
    preExpandDurationMs: prefersReducedMotion.matches ? 0 : 220,
    preExpandMinDeltaPx: 14,
  };
  const scrollCancelKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
  ]);
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

  const stopTrackHeightSync = () => {
    if (trackHeightSyncFrame !== null) {
      window.cancelAnimationFrame(trackHeightSyncFrame);
      trackHeightSyncFrame = null;
    }
  };

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

  const clearPendingPreScrollTimer = () => {
    if (pendingPreScrollTimer !== null) {
      window.clearTimeout(pendingPreScrollTimer);
      pendingPreScrollTimer = null;
    }
  };
  const clearPendingIndexFinalizeTimer = () => {
    if (pendingIndexFinalizeTimer !== null) {
      window.clearTimeout(pendingIndexFinalizeTimer);
      pendingIndexFinalizeTimer = null;
    }
  };
  const clearPendingLongJumpSwapTimer = () => {
    if (pendingLongJumpSwapTimer !== null) {
      window.clearTimeout(pendingLongJumpSwapTimer);
      pendingLongJumpSwapTimer = null;
    }
  };
  const clearPendingLongJumpReleaseTimer = () => {
    if (pendingLongJumpReleaseTimer !== null) {
      window.clearTimeout(pendingLongJumpReleaseTimer);
      pendingLongJumpReleaseTimer = null;
    }
  };
  const clearPendingTransitionTimers = () => {
    clearPendingPreScrollTimer();
    clearPendingIndexFinalizeTimer();
    clearPendingLongJumpSwapTimer();
    clearPendingLongJumpReleaseTimer();
  };
  const setProgrammaticTrackState = (active: boolean) => {
    track.classList.toggle('project-carousel-track--programmatic', active);
  };
  const clearLongJumpVisualState = () => {
    track.classList.remove('project-carousel-track--soft-swap');
  };

  const getPanelHeight = (panel: HTMLElement) => {
    const height = panel.getBoundingClientRect().height;
    if (!Number.isFinite(height) || height <= 0) {
      return 1;
    }
    return Math.ceil(height);
  };

  const syncTrackHeight = (index = activeIndex) => {
    const panel = panels[wrapIndex(index)];
    if (!(panel instanceof HTMLElement)) {
      return;
    }
    const nextHeight = getPanelHeight(panel);
    track.style.height = `${nextHeight}px`;
  };

  const scheduleTrackHeightSync = (index = activeIndex) => {
    stopTrackHeightSync();
    trackHeightSyncFrame = window.requestAnimationFrame(() => {
      trackHeightSyncFrame = null;
      syncTrackHeight(index);
    });
  };

  const disconnectActivePanelResizeObserver = () => {
    if (activePanelResizeObserver !== null) {
      activePanelResizeObserver.disconnect();
      activePanelResizeObserver = null;
    }
  };

  const observeActivePanelHeight = () => {
    disconnectActivePanelResizeObserver();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const panel = panels[activeIndex];
    if (!(panel instanceof HTMLElement)) {
      return;
    }
    activePanelResizeObserver = new ResizeObserver(() => {
      scheduleTrackHeightSync();
    });
    activePanelResizeObserver.observe(panel);
  };

  const quickScrollTrackTo = (
    targetLeft: number,
    onComplete: (() => void) | null = null,
  ) => {
    stopTrackQuickScroll();
    const startLeft = track.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) {
      track.scrollLeft = targetLeft;
      if (typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(
        1,
        (now - startedAt) / QUICK_SCROLL_DURATION_MS,
      );
      const eased = easeOutCubic(progress);
      track.scrollLeft = startLeft + distance * eased;
      if (progress < 1) {
        trackQuickScrollFrame = window.requestAnimationFrame(step);
        return;
      }
      trackQuickScrollFrame = null;
      if (typeof onComplete === 'function') {
        onComplete();
      }
    };
    trackQuickScrollFrame = window.requestAnimationFrame(step);
  };

  const quickScrollWindowTo = (targetTop: number) => {
    stopWindowQuickScroll();
    const startTop = window.scrollY;
    const distance = targetTop - startTop;
    if (Math.abs(distance) < 1) {
      window.scrollTo({
        top: targetTop,
        behavior: 'auto',
      });
      return;
    }
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(
        1,
        (now - startedAt) / QUICK_SCROLL_DURATION_MS,
      );
      const eased = easeOutCubic(progress);
      window.scrollTo({
        top: startTop + distance * eased,
        behavior: 'auto',
      });
      if (progress < 1) {
        windowQuickScrollFrame = window.requestAnimationFrame(step);
        return;
      }
      windowQuickScrollFrame = null;
    };
    windowQuickScrollFrame = window.requestAnimationFrame(step);
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
  const getMostVisiblePanelFromRatios = () => {
    let index = -1;
    let ratio = 0;
    panelVisibilityRatios.forEach((nextRatio, nextIndex) => {
      if (nextRatio <= ratio) {
        return;
      }
      ratio = nextRatio;
      index = nextIndex;
    });
    return { index, ratio };
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
        setProgrammaticTrackState(false);
        clearProgrammaticTargetIndex();
        isProgrammaticTransition = false;
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
    clearPendingIndexFinalizeTimer();
    pendingIndexFinalizeTimer = window.setTimeout(() => {
      pendingIndexFinalizeTimer = null;
      finalizeIndexScroll();
    }, QUICK_SCROLL_DURATION_MS);
  };

  const runLongJumpTransition = (targetIndex: number, targetHeight: number) => {
    disconnectActivePanelResizeObserver();
    stopTrackHeightSync();
    stopTrackQuickScroll();
    clearPendingTransitionTimers();
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
      pendingLongJumpReleaseTimer = window.setTimeout(() => {
        pendingLongJumpReleaseTimer = null;
      }, LONG_JUMP_FADE_IN_MS);
    };
    if (LONG_JUMP_FADE_OUT_MS <= 0) {
      finalizeLongJump();
      return;
    }
    pendingLongJumpSwapTimer = window.setTimeout(() => {
      pendingLongJumpSwapTimer = null;
      finalizeLongJump();
    }, LONG_JUMP_FADE_OUT_MS);
  };

  const getCurrentPanelHeight = (wrappedCurrentIndex: number) => {
    const currentPanel = panels[wrappedCurrentIndex];
    if (!(currentPanel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Active panel is missing.');
    }
    return getPanelHeight(currentPanel);
  };

  const getTargetPanelHeight = (wrappedTargetIndex: number) => {
    const targetPanel = panels[wrappedTargetIndex];
    if (!(targetPanel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    return getPanelHeight(targetPanel);
  };

  const runIndexTransition = (
    targetIndex: number,
    useQuickMotion = false,
  ): CarouselIndexTransitionResult => {
    clearPendingTransitionTimers();
    stopQuickScrolls();
    stopNativeSmoothScroll();
    clearVerticalCorrectionTimer();
    setProgrammaticTrackState(false);
    clearLongJumpVisualState();
    clearProgrammaticTargetIndex();
    isProgrammaticTransition = false;
    const originIndex = getClosestVisiblePanelIndex();
    const plan = createCarouselHeightTransitionPlan({
      targetIndex,
      currentIndex: originIndex,
      total,
      preExpandMinDeltaPx: transitionPolicy.preExpandMinDeltaPx,
      preExpandDurationMs: transitionPolicy.preExpandDurationMs,
      getCurrentHeight: getCurrentPanelHeight,
      getTargetHeight: getTargetPanelHeight,
    });
    if (plan.wrappedTargetIndex === originIndex) {
      setActiveIndex(originIndex, { force: true });
      return 'same';
    }
    const transitionMode = getCarouselTransitionMode({
      fromIndex: originIndex,
      toIndex: plan.wrappedTargetIndex,
      total,
      longJumpThreshold: LONG_JUMP_THRESHOLD,
    });
    if (transitionMode === 'long') {
      runLongJumpTransition(plan.wrappedTargetIndex, plan.targetHeight);
      return transitionMode;
    }
    disconnectActivePanelResizeObserver();
    stopTrackHeightSync();
    if (plan.preExpandBeforeScroll) {
      track.style.height = `${plan.targetHeight}px`;
      if (plan.preExpandDurationMs <= 0) {
        executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion);
        return transitionMode;
      }
      pendingPreScrollTimer = window.setTimeout(() => {
        pendingPreScrollTimer = null;
        executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion);
      }, plan.preExpandDurationMs);
      return transitionMode;
    }
    if (plan.postContractAfterScroll) {
      executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion, () => {
        track.style.height = `${plan.targetHeight}px`;
      });
      return transitionMode;
    }
    track.style.height = `${plan.targetHeight}px`;
    if (!plan.preExpandBeforeScroll) {
      executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion);
      return transitionMode;
    }
    return transitionMode;
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
    const siteHeader = document.querySelector('header');
    const headerOffset =
      siteHeader instanceof HTMLElement ? siteHeader.offsetHeight + 20 : 20;
    return Math.max(
      0,
      Math.round(
        window.scrollY + carousel.getBoundingClientRect().top - headerOffset,
      ),
    );
  };

  const clearVerticalCorrectionTimer = () => {
    if (verticalCorrectionTimer !== null) {
      window.clearTimeout(verticalCorrectionTimer);
      verticalCorrectionTimer = null;
    }
  };

  const correctCarouselVerticalOffset = (useQuickMotion = false) => {
    const targetTop = getCarouselTargetTop();
    const delta = targetTop - window.scrollY;
    if (Math.abs(delta) < CORRECTION_THRESHOLD_PX) {
      return;
    }
    if (useQuickMotion && !prefersReducedMotion.matches) {
      quickScrollWindowTo(targetTop);
      return;
    }
    window.scrollTo({
      top: targetTop,
      behavior: getBehavior(),
    });
  };

  const scrollCarouselIntoView = (useQuickMotion = false) => {
    clearVerticalCorrectionTimer();
    const targetTop = getCarouselTargetTop();
    if (useQuickMotion && !prefersReducedMotion.matches) {
      quickScrollWindowTo(targetTop);
      verticalCorrectionTimer = window.setTimeout(() => {
        verticalCorrectionTimer = null;
        correctCarouselVerticalOffset(true);
      }, QUICK_CORRECTION_DELAY_MS);
      return;
    }
    stopWindowQuickScroll();
    window.scrollTo({
      top: targetTop,
      behavior: getBehavior(),
    });
    if (getBehavior() === 'smooth') {
      verticalCorrectionTimer = window.setTimeout(() => {
        verticalCorrectionTimer = null;
        correctCarouselVerticalOffset(false);
      }, QUICK_CORRECTION_DELAY_MS);
      return;
    }
    correctCarouselVerticalOffset(false);
  };

  const navigateToPanelId = (
    panelId: string,
    useQuickMotion = false,
  ): boolean => {
    const transitionMode = scrollToPanelId(panelId, useQuickMotion);
    if (!transitionMode) {
      return false;
    }
    scrollCarouselIntoView(useQuickMotion && transitionMode !== 'wrap');
    return true;
  };

  const handleHashNavigation = (useQuickMotion = true) => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }
    const panelId = decodeURIComponent(hash.slice(1));
    navigateToPanelId(panelId, useQuickMotion);
  };

  const cancelProgrammaticReposition = () => {
    clearPendingTransitionTimers();
    stopQuickScrolls();
    stopNativeSmoothScroll();
    clearVerticalCorrectionTimer();
    setProgrammaticTrackState(false);
    clearLongJumpVisualState();
    clearProgrammaticTargetIndex();
    isProgrammaticTransition = false;
  };

  prevButtons.forEach((button) => {
    button.addEventListener('click', () => {
      runRelativeIndexTransition(-1);
    });
  });

  nextButtons.forEach((button) => {
    button.addEventListener('click', () => {
      runRelativeIndexTransition(1);
    });
  });

  dots.forEach((dot) => {
    const index = parseRequiredCarouselIndex(
      dot.dataset.index,
      '[projects-carousel] Dot index is invalid.',
    );
    dot.addEventListener('click', () => {
      runIndexTransition(index, true);
    });
  });
  const cardJumpCleanup: Array<() => void> = [];
  cardJumpLinks.forEach((link) => {
    const handleCardJump = (event: MouseEvent) => {
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('#')) {
        return;
      }
      const panelId = decodeURIComponent(href.slice(1));
      if (!panelId) {
        return;
      }
      event.preventDefault();
      if (!navigateToPanelId(panelId, true)) {
        return;
      }
      const nextHash = `#${panelId}`;
      if (window.location.hash === nextHash) {
        history.replaceState(null, '', nextHash);
        return;
      }
      history.pushState(null, '', nextHash);
    };
    link.addEventListener('click', handleCardJump);
    cardJumpCleanup.push(() => {
      link.removeEventListener('click', handleCardJump);
    });
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      runRelativeIndexTransition(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      runRelativeIndexTransition(1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      runIndexTransition(0, true);
    }
    if (event.key === 'End') {
      event.preventDefault();
      runIndexTransition(total - 1, true);
    }
  });

  const handleCancelKeys = (event: KeyboardEvent) => {
    if (!scrollCancelKeys.has(event.key)) {
      return;
    }
    cancelProgrammaticReposition();
  };
  const handleTrackContentLoad = () => {
    scheduleTrackHeightSync();
  };
  const handleResize = () => {
    scheduleTrackHeightSync();
  };
  window.addEventListener('wheel', cancelProgrammaticReposition, {
    passive: true,
  });
  window.addEventListener('touchmove', cancelProgrammaticReposition, {
    passive: true,
  });
  window.addEventListener('keydown', handleCancelKeys);
  window.addEventListener('resize', handleResize, { passive: true });
  track.addEventListener('load', handleTrackContentLoad, true);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLElement)) {
          return;
        }
        const index = parseRequiredCarouselIndex(
          entry.target.dataset.index,
          '[projects-carousel] Panel index is invalid.',
        );
        panelVisibilityRatios[index] = entry.isIntersecting
          ? entry.intersectionRatio
          : 0;
      });
      const { index, ratio } = getMostVisiblePanelFromRatios();
      if (!Number.isInteger(index) || index < 0) {
        return;
      }
      if (programmaticTargetIndex !== null) {
        if (index !== programmaticTargetIndex) {
          return;
        }
      }
      const isProgrammaticLockActive =
        isProgrammaticTransition && programmaticTargetIndex !== null;
      const shouldSyncHeight =
        !isProgrammaticLockActive && ratio >= HEIGHT_SYNC_INTERSECTION_RATIO;
      setActiveIndex(index, {
        syncHeight: shouldSyncHeight,
        observeHeight: shouldSyncHeight,
      });
    },
    {
      root: track,
      threshold: [0.45, 0.6, 0.75],
    },
  );

  panels.forEach((panel) => observer.observe(panel));
  setActiveIndex(0);
  handleHashNavigation(true);
  const handleHashChange = () => {
    handleHashNavigation(true);
  };
  window.addEventListener('hashchange', handleHashChange);
  const cleanup = () => {
    observer.disconnect();
    window.removeEventListener('hashchange', handleHashChange);
    window.removeEventListener('wheel', cancelProgrammaticReposition);
    window.removeEventListener('touchmove', cancelProgrammaticReposition);
    window.removeEventListener('keydown', handleCancelKeys);
    window.removeEventListener('resize', handleResize);
    track.removeEventListener('load', handleTrackContentLoad, true);
    cardJumpCleanup.forEach((dispose) => dispose());
    clearPendingTransitionTimers();
    stopQuickScrolls();
    clearVerticalCorrectionTimer();
    stopTrackHeightSync();
    disconnectActivePanelResizeObserver();
    setProgrammaticTrackState(false);
    clearLongJumpVisualState();
    clearProgrammaticTargetIndex();
    isProgrammaticTransition = false;
  };
  document.addEventListener('astro:before-swap', cleanup, { once: true });
  window.addEventListener('pagehide', cleanup, { once: true });
};

export const bindProjectCarousel = () => {
  initProjectCarousel();
  document.addEventListener('astro:page-load', initProjectCarousel);
};
