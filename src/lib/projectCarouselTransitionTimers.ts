/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitionTimers.ts

Tracks and clears project carousel transition timers used by motion orchestration.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type CreateProjectCarouselTransitionTimersOptions = {
  setTimeout: (callback: () => void, delayMs: number) => number;
  clearTimeout: (timerId: number) => void;
};

export const createProjectCarouselTransitionTimers = ({
  setTimeout,
  clearTimeout,
}: CreateProjectCarouselTransitionTimersOptions) => {
  let pendingPreScrollTimer: number | null = null;
  let pendingIndexFinalizeTimer: number | null = null;
  let pendingLongJumpSwapTimer: number | null = null;
  let pendingLongJumpReleaseTimer: number | null = null;

  const clearPendingPreScrollTimer = () => {
    if (pendingPreScrollTimer !== null) {
      clearTimeout(pendingPreScrollTimer);
      pendingPreScrollTimer = null;
    }
  };

  const clearPendingIndexFinalizeTimer = () => {
    if (pendingIndexFinalizeTimer !== null) {
      clearTimeout(pendingIndexFinalizeTimer);
      pendingIndexFinalizeTimer = null;
    }
  };

  const clearPendingLongJumpSwapTimer = () => {
    if (pendingLongJumpSwapTimer !== null) {
      clearTimeout(pendingLongJumpSwapTimer);
      pendingLongJumpSwapTimer = null;
    }
  };

  const clearPendingLongJumpReleaseTimer = () => {
    if (pendingLongJumpReleaseTimer !== null) {
      clearTimeout(pendingLongJumpReleaseTimer);
      pendingLongJumpReleaseTimer = null;
    }
  };

  const clearPendingTransitionTimers = () => {
    clearPendingPreScrollTimer();
    clearPendingIndexFinalizeTimer();
    clearPendingLongJumpSwapTimer();
    clearPendingLongJumpReleaseTimer();
  };

  const schedulePendingPreScrollTimer = (
    callback: () => void,
    delayMs: number,
  ) => {
    clearPendingPreScrollTimer();
    pendingPreScrollTimer = setTimeout(() => {
      pendingPreScrollTimer = null;
      callback();
    }, delayMs);
  };

  const schedulePendingIndexFinalizeTimer = (
    callback: () => void,
    delayMs: number,
  ) => {
    clearPendingIndexFinalizeTimer();
    pendingIndexFinalizeTimer = setTimeout(() => {
      pendingIndexFinalizeTimer = null;
      callback();
    }, delayMs);
  };

  const schedulePendingLongJumpSwapTimer = (
    callback: () => void,
    delayMs: number,
  ) => {
    clearPendingLongJumpSwapTimer();
    pendingLongJumpSwapTimer = setTimeout(() => {
      pendingLongJumpSwapTimer = null;
      callback();
    }, delayMs);
  };

  const schedulePendingLongJumpReleaseTimer = (
    callback: () => void,
    delayMs: number,
  ) => {
    clearPendingLongJumpReleaseTimer();
    pendingLongJumpReleaseTimer = setTimeout(() => {
      pendingLongJumpReleaseTimer = null;
      callback();
    }, delayMs);
  };

  return {
    clearPendingTransitionTimers,
    schedulePendingPreScrollTimer,
    schedulePendingIndexFinalizeTimer,
    schedulePendingLongJumpSwapTimer,
    schedulePendingLongJumpReleaseTimer,
  };
};
