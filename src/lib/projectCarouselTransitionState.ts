/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitionState.ts

Provides reset and cancellation helpers for programmatic carousel transitions.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type ProgrammaticCarouselStateOptions = {
  setProgrammaticTrackState: (active: boolean) => void;
  clearLongJumpVisualState: () => void;
  clearProgrammaticTargetIndex: () => void;
  setProgrammaticTransitionActive: (active: boolean) => void;
};

type ProgrammaticCarouselCancelOptions = ProgrammaticCarouselStateOptions & {
  clearPendingTransitionTimers: () => void;
  stopQuickScrolls: () => void;
  clearVerticalCorrectionTimer: () => void;
  stopNativeSmoothScroll?: () => void;
};

export const resetProgrammaticCarouselState = ({
  setProgrammaticTrackState,
  clearLongJumpVisualState,
  clearProgrammaticTargetIndex,
  setProgrammaticTransitionActive,
}: ProgrammaticCarouselStateOptions) => {
  setProgrammaticTrackState(false);
  clearLongJumpVisualState();
  clearProgrammaticTargetIndex();
  setProgrammaticTransitionActive(false);
};

export const cancelProgrammaticCarouselTransition = ({
  clearPendingTransitionTimers,
  stopQuickScrolls,
  clearVerticalCorrectionTimer,
  stopNativeSmoothScroll,
  setProgrammaticTrackState,
  clearLongJumpVisualState,
  clearProgrammaticTargetIndex,
  setProgrammaticTransitionActive,
}: ProgrammaticCarouselCancelOptions) => {
  clearPendingTransitionTimers();
  stopQuickScrolls();
  stopNativeSmoothScroll?.();
  clearVerticalCorrectionTimer();
  resetProgrammaticCarouselState({
    setProgrammaticTrackState,
    clearLongJumpVisualState,
    clearProgrammaticTargetIndex,
    setProgrammaticTransitionActive,
  });
};
