/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitionScheduling.ts

Applies project carousel timing policy to transition timer scheduling helpers.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type ProjectCarouselTransitionTimers = {
  clearPendingTransitionTimers: () => void;
  schedulePendingPreScrollTimer: (
    callback: () => void,
    delayMs: number,
  ) => void;
  schedulePendingIndexFinalizeTimer: (
    callback: () => void,
    delayMs: number,
  ) => void;
  schedulePendingLongJumpSwapTimer: (
    callback: () => void,
    delayMs: number,
  ) => void;
  schedulePendingLongJumpReleaseTimer: (
    callback: () => void,
    delayMs: number,
  ) => void;
};

type ProjectCarouselTransitionSchedulingOptions = {
  transitionTimers: ProjectCarouselTransitionTimers;
  quickScrollDurationMs: number;
  longJumpFadeOutMs: number;
  longJumpFadeInMs: number;
};

export const createProjectCarouselTransitionScheduling = ({
  transitionTimers,
  quickScrollDurationMs,
  longJumpFadeOutMs,
  longJumpFadeInMs,
}: ProjectCarouselTransitionSchedulingOptions) => {
  const clearPendingTransitionTimers = () => {
    transitionTimers.clearPendingTransitionTimers();
  };

  const schedulePendingPreScroll = (callback: () => void, delayMs: number) => {
    transitionTimers.schedulePendingPreScrollTimer(callback, delayMs);
  };

  const schedulePendingIndexFinalize = (callback: () => void) => {
    transitionTimers.schedulePendingIndexFinalizeTimer(
      callback,
      quickScrollDurationMs,
    );
  };

  const schedulePendingLongJumpSwap = (callback: () => void) => {
    transitionTimers.schedulePendingLongJumpSwapTimer(
      callback,
      longJumpFadeOutMs,
    );
  };

  const schedulePendingLongJumpRelease = (callback: () => void) => {
    transitionTimers.schedulePendingLongJumpReleaseTimer(
      callback,
      longJumpFadeInMs,
    );
  };

  return {
    clearPendingTransitionTimers,
    schedulePendingPreScroll,
    schedulePendingIndexFinalize,
    schedulePendingLongJumpSwap,
    schedulePendingLongJumpRelease,
  };
};
