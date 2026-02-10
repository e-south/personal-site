/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselVisibilityObserver.ts

Builds and wires the projects carousel visibility observer used to sync state.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';

type SetActiveIndexOptions = {
  syncHeight?: boolean;
  observeHeight?: boolean;
};

type CreateProjectCarouselVisibilityObserverOptions = {
  track: HTMLElement;
  panels: HTMLElement[];
  heightSyncIntersectionRatio: number;
  getProgrammaticTargetIndex: () => number | null;
  isProgrammaticTransitionActive: () => boolean;
  setActiveIndex: (nextIndex: number, options: SetActiveIndexOptions) => void;
};

const getMostVisiblePanelFromRatios = (panelVisibilityRatios: number[]) => {
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

export const createProjectCarouselVisibilityObserver = ({
  track,
  panels,
  heightSyncIntersectionRatio,
  getProgrammaticTargetIndex,
  isProgrammaticTransitionActive,
  setActiveIndex,
}: CreateProjectCarouselVisibilityObserverOptions) => {
  const panelVisibilityRatios = panels.map(() => 0);
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
      const { index, ratio } = getMostVisiblePanelFromRatios(
        panelVisibilityRatios,
      );
      if (!Number.isInteger(index) || index < 0) {
        return;
      }
      const programmaticTargetIndex = getProgrammaticTargetIndex();
      if (programmaticTargetIndex !== null) {
        if (index !== programmaticTargetIndex) {
          return;
        }
      }
      const isProgrammaticLockActive = isProgrammaticTransitionActive();
      const shouldSyncHeight =
        !isProgrammaticLockActive && ratio >= heightSyncIntersectionRatio;
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
  return observer;
};
