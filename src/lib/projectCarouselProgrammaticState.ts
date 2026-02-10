/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselProgrammaticState.ts

Provides helpers for programmatic carousel transition activation and lock checks.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type ActivateProgrammaticCarouselTransitionOptions = {
  targetIndex: number;
  setProgrammaticTargetIndex: (nextIndex: number) => void;
  setProgrammaticTransitionActive: (active: boolean) => void;
};

type ProgrammaticCarouselTransitionLockState = {
  isProgrammaticTransition: boolean;
  programmaticTargetIndex: number | null;
};

export const activateProgrammaticCarouselTransition = ({
  targetIndex,
  setProgrammaticTargetIndex,
  setProgrammaticTransitionActive,
}: ActivateProgrammaticCarouselTransitionOptions) => {
  setProgrammaticTransitionActive(true);
  setProgrammaticTargetIndex(targetIndex);
};

export const isProgrammaticCarouselTransitionLockActive = ({
  isProgrammaticTransition,
  programmaticTargetIndex,
}: ProgrammaticCarouselTransitionLockState) => {
  return isProgrammaticTransition && programmaticTargetIndex !== null;
};
