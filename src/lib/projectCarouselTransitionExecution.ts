/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitionExecution.ts

Executes project carousel panel transitions and long-jump motion flows.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type ProjectCarouselTransitionExecutionOptions = {
  panels: HTMLElement[];
  track: HTMLElement;
  wrapIndex: (index: number) => number;
  getPanelTargetLeft: (panel: HTMLElement) => number;
  getBehavior: () => 'auto' | 'smooth';
  prefersReducedMotion: MediaQueryList;
  quickScrollTrackTo: (
    targetLeft: number,
    onComplete?: (() => void) | null,
  ) => void;
  stopTrackQuickScroll: () => void;
  activateProgrammaticTransition: (targetIndex: number) => void;
  releaseProgrammaticTrackLock: (
    targetIndex: number,
    onComplete?: (() => void) | null,
  ) => void;
  disconnectActivePanelResizeObserver: () => void;
  stopTrackHeightSync: () => void;
  setProgrammaticTrackState: (active: boolean) => void;
  clearLongJumpVisualState: () => void;
  clearPendingTransitionTimers: () => void;
  schedulePendingIndexFinalize: (onComplete: () => void) => void;
  schedulePendingLongJumpSwap: (onSwap: () => void) => void;
  schedulePendingLongJumpRelease: (onRelease: () => void) => void;
  longJumpFadeOutMs: number;
  longJumpFadeInMs: number;
};

export const createProjectCarouselTransitionExecution = ({
  panels,
  track,
  wrapIndex,
  getPanelTargetLeft,
  getBehavior,
  prefersReducedMotion,
  quickScrollTrackTo,
  stopTrackQuickScroll,
  activateProgrammaticTransition,
  releaseProgrammaticTrackLock,
  disconnectActivePanelResizeObserver,
  stopTrackHeightSync,
  setProgrammaticTrackState,
  clearLongJumpVisualState,
  clearPendingTransitionTimers,
  schedulePendingIndexFinalize,
  schedulePendingLongJumpSwap,
  schedulePendingLongJumpRelease,
  longJumpFadeOutMs,
  longJumpFadeInMs,
}: ProjectCarouselTransitionExecutionOptions) => {
  const executeIndexScroll = (
    nextIndex: number,
    useQuickMotion = false,
    onComplete: (() => void) | null = null,
  ) => {
    const wrapped = wrapIndex(nextIndex);
    const panel = panels[wrapped];
    if (!(panel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    const targetLeft = getPanelTargetLeft(panel);
    const finalizeIndexScroll = () => {
      releaseProgrammaticTrackLock(wrapped, onComplete);
    };
    activateProgrammaticTransition(wrapped);
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
    schedulePendingIndexFinalize(() => {
      finalizeIndexScroll();
    });
  };

  const runLongJumpTransition = (targetIndex: number, targetHeight: number) => {
    disconnectActivePanelResizeObserver();
    stopTrackHeightSync();
    stopTrackQuickScroll();
    clearPendingTransitionTimers();
    activateProgrammaticTransition(targetIndex);
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
      if (longJumpFadeInMs <= 0) {
        return;
      }
      schedulePendingLongJumpRelease(() => {});
    };
    if (longJumpFadeOutMs <= 0) {
      finalizeLongJump();
      return;
    }
    schedulePendingLongJumpSwap(() => {
      finalizeLongJump();
    });
  };

  return {
    executeIndexScroll,
    runLongJumpTransition,
  };
};
