/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/mobileHeaderVisibility.ts

Applies intent-gated hide/reveal behavior to the sticky site header.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

const FORCE_SHOW_NEAR_TOP_PX = 24;
const DIRECTION_CHANGE_DEADBAND_PX = 6;
const UPWARD_DISTANCE_TO_SHOW_PX = {
  coarse: 96,
  fine: 32,
} as const;
const UPWARD_TIME_TO_SHOW_MS = {
  coarse: 320,
  fine: 120,
} as const;

type InputProfile = keyof typeof UPWARD_DISTANCE_TO_SHOW_PX;
type ScrollDirection = 'up' | 'down' | null;

const getInputProfile = (): InputProfile => {
  const supportsMatchMedia = typeof window.matchMedia === 'function';
  const coarsePointer = supportsMatchMedia
    ? window.matchMedia('(pointer: coarse)').matches
    : false;
  const compactViewport = supportsMatchMedia
    ? window.matchMedia('(max-width: 768px)').matches
    : false;
  return coarsePointer || compactViewport ? 'coarse' : 'fine';
};

const getNow = () =>
  typeof window.performance?.now === 'function'
    ? window.performance.now()
    : Date.now();

export const bindMobileHeaderVisibility = () => {
  const header = document.querySelector('[data-site-header]');
  if (!(header instanceof HTMLElement)) {
    return () => {};
  }

  let rafId: number | null = null;
  let disposed = false;
  let lastScrollY = Math.max(0, window.scrollY);
  let inputProfile = getInputProfile();
  let currentDirection: ScrollDirection = null;
  let upwardAccumulatedPx = 0;
  let upwardStartTs = 0;

  const resetUpwardIntent = () => {
    upwardAccumulatedPx = 0;
    upwardStartTs = 0;
  };

  const applyVisibility = (timestamp: number) => {
    const currentScrollY = Math.max(0, window.scrollY);
    if (currentScrollY <= FORCE_SHOW_NEAR_TOP_PX) {
      header.classList.toggle('site-header-mobile-hidden', false);
      resetUpwardIntent();
      currentDirection = 'up';
      lastScrollY = currentScrollY;
      return;
    }

    const delta = currentScrollY - lastScrollY;
    if (Math.abs(delta) < DIRECTION_CHANGE_DEADBAND_PX) {
      lastScrollY = currentScrollY;
      return;
    }

    if (delta > 0) {
      currentDirection = 'down';
      resetUpwardIntent();
      header.classList.toggle('site-header-mobile-hidden', true);
      lastScrollY = currentScrollY;
      return;
    }

    if (currentDirection !== 'up') {
      currentDirection = 'up';
      upwardAccumulatedPx = 0;
      upwardStartTs = timestamp;
    }

    upwardAccumulatedPx += Math.abs(delta);
    const elapsedMs = timestamp - upwardStartTs;
    const distanceThreshold = UPWARD_DISTANCE_TO_SHOW_PX[inputProfile];
    const timeThreshold = UPWARD_TIME_TO_SHOW_MS[inputProfile];

    if (
      upwardAccumulatedPx >= distanceThreshold ||
      elapsedMs >= timeThreshold
    ) {
      header.classList.toggle('site-header-mobile-hidden', false);
    }

    lastScrollY = currentScrollY;
  };

  const scheduleApplyVisibility = () => {
    if (rafId !== null || disposed) {
      return;
    }
    rafId = window.requestAnimationFrame((timestamp) => {
      rafId = null;
      if (disposed) {
        return;
      }
      applyVisibility(timestamp);
    });
  };

  const handleResize = () => {
    inputProfile = getInputProfile();
    scheduleApplyVisibility();
  };

  window.addEventListener('scroll', scheduleApplyVisibility, {
    passive: true,
  });
  window.addEventListener('resize', handleResize, {
    passive: true,
  });

  applyVisibility(getNow());

  return () => {
    disposed = true;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    header.classList.toggle('site-header-mobile-hidden', false);
    window.removeEventListener('scroll', scheduleApplyVisibility);
    window.removeEventListener('resize', handleResize);
  };
};
