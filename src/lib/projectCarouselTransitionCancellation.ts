/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitionCancellation.ts

Creates transition cancellation handlers for active and cleanup carousel flows.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { cancelProgrammaticCarouselTransition } from '@/lib/projectCarouselTransitionState';

type CreateProjectCarouselTransitionCancellationOptions = {
  clearPendingTransitionTimers: () => void;
  stopQuickScrolls: () => void;
  stopNativeSmoothScroll: () => void;
  clearVerticalCorrectionTimer: () => void;
  setProgrammaticTrackState: (active: boolean) => void;
  clearLongJumpVisualState: () => void;
  clearProgrammaticTargetIndex: () => void;
  setProgrammaticTransitionActive: (active: boolean) => void;
};

export const createProjectCarouselTransitionCancellation = ({
  clearPendingTransitionTimers,
  stopQuickScrolls,
  stopNativeSmoothScroll,
  clearVerticalCorrectionTimer,
  setProgrammaticTrackState,
  clearLongJumpVisualState,
  clearProgrammaticTargetIndex,
  setProgrammaticTransitionActive,
}: CreateProjectCarouselTransitionCancellationOptions) => {
  const cancelCurrentTransition = () => {
    cancelProgrammaticCarouselTransition({
      clearPendingTransitionTimers,
      stopQuickScrolls,
      stopNativeSmoothScroll,
      clearVerticalCorrectionTimer,
      setProgrammaticTrackState,
      clearLongJumpVisualState,
      clearProgrammaticTargetIndex,
      setProgrammaticTransitionActive,
    });
  };

  const cancelCleanupTransition = () => {
    cancelProgrammaticCarouselTransition({
      clearPendingTransitionTimers,
      stopQuickScrolls,
      clearVerticalCorrectionTimer,
      setProgrammaticTrackState,
      clearLongJumpVisualState,
      clearProgrammaticTargetIndex,
      setProgrammaticTransitionActive,
    });
  };

  return {
    cancelCurrentTransition,
    cancelCleanupTransition,
  };
};
