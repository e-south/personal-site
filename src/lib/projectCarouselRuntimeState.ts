/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselRuntimeState.ts

Manages mutable runtime state for project carousel transitions and animations.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type ProjectCarouselRuntimeStateConfig = {
  wrapIndex: (index: number) => number;
  cancelAnimationFrame: (frameId: number) => void;
};

export const createProjectCarouselRuntimeState = ({
  wrapIndex,
  cancelAnimationFrame,
}: ProjectCarouselRuntimeStateConfig) => {
  let activeIndex = -1;
  let trackQuickScrollFrame: number | null = null;
  let windowQuickScrollFrame: number | null = null;
  let programmaticTargetIndex: number | null = null;
  let isProgrammaticTransition = false;

  const readActiveIndex = () => activeIndex;
  const setActiveIndex = (nextIndex: number) => {
    activeIndex = nextIndex;
  };

  const readTrackQuickScrollFrame = () => trackQuickScrollFrame;
  const writeTrackQuickScrollFrame = (frameId: number | null) => {
    trackQuickScrollFrame = frameId;
  };
  const stopTrackQuickScroll = () => {
    if (trackQuickScrollFrame !== null) {
      cancelAnimationFrame(trackQuickScrollFrame);
      trackQuickScrollFrame = null;
    }
  };

  const readWindowQuickScrollFrame = () => windowQuickScrollFrame;
  const writeWindowQuickScrollFrame = (frameId: number | null) => {
    windowQuickScrollFrame = frameId;
  };
  const stopWindowQuickScroll = () => {
    if (windowQuickScrollFrame !== null) {
      cancelAnimationFrame(windowQuickScrollFrame);
      windowQuickScrollFrame = null;
    }
  };

  const stopQuickScrolls = () => {
    stopTrackQuickScroll();
    stopWindowQuickScroll();
  };

  const readProgrammaticTargetIndex = () => programmaticTargetIndex;
  const setProgrammaticTargetIndex = (nextIndex: number) => {
    programmaticTargetIndex = wrapIndex(nextIndex);
  };
  const clearProgrammaticTargetIndex = () => {
    programmaticTargetIndex = null;
  };

  const isProgrammaticTransitionActive = () => isProgrammaticTransition;
  const setProgrammaticTransitionActive = (active: boolean) => {
    isProgrammaticTransition = active;
  };

  return {
    readActiveIndex,
    setActiveIndex,
    readTrackQuickScrollFrame,
    writeTrackQuickScrollFrame,
    readWindowQuickScrollFrame,
    writeWindowQuickScrollFrame,
    stopTrackQuickScroll,
    stopWindowQuickScroll,
    stopQuickScrolls,
    readProgrammaticTargetIndex,
    setProgrammaticTargetIndex,
    clearProgrammaticTargetIndex,
    isProgrammaticTransitionActive,
    setProgrammaticTransitionActive,
  };
};
