/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTrackLockRelease.ts

Settles track position and releases programmatic transition locks.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { resetProgrammaticCarouselState } from '@/lib/projectCarouselTransitionState';

type ActiveIndexOptions = {
  syncHeight?: boolean;
  observeHeight?: boolean;
  force?: boolean;
};

type ProjectCarouselTrackLockReleaseOptions = {
  panels: HTMLElement[];
  track: HTMLElement;
  wrapIndex: (index: number) => number;
  getPanelTargetLeft: (panel: HTMLElement) => number;
  setActiveIndex: (nextIndex: number, options?: ActiveIndexOptions) => void;
  setProgrammaticTrackState: (active: boolean) => void;
  clearLongJumpVisualState: () => void;
  clearProgrammaticTargetIndex: () => void;
  setProgrammaticTransitionActive: (active: boolean) => void;
  requestAnimationFrame: (callback: () => void) => number;
};

export const createProjectCarouselTrackLockRelease = ({
  panels,
  track,
  wrapIndex,
  getPanelTargetLeft,
  setActiveIndex,
  setProgrammaticTrackState,
  clearLongJumpVisualState,
  clearProgrammaticTargetIndex,
  setProgrammaticTransitionActive,
  requestAnimationFrame,
}: ProjectCarouselTrackLockReleaseOptions) => {
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
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resetProgrammaticCarouselState({
          setProgrammaticTrackState,
          clearLongJumpVisualState,
          clearProgrammaticTargetIndex,
          setProgrammaticTransitionActive,
        });
        if (typeof onComplete === 'function') {
          onComplete();
        }
      });
    });
  };

  return {
    releaseProgrammaticTrackLock,
  };
};
