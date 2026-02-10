/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselPanelNavigation.ts

Builds panel-id and hash-driven navigation helpers for carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { getPanelIdFromHash } from '@/lib/projectCarouselHash';
import type { CarouselIndexTransitionResult } from '@/lib/projectCarouselTransitions';

type CreateProjectCarouselPanelNavigationArgs = {
  panels: HTMLElement[];
  runIndexTransition: (
    targetIndex: number,
    useQuickMotion?: boolean,
  ) => CarouselIndexTransitionResult;
  scrollCarouselIntoView: (useQuickMotion: boolean) => void;
  readHash?: () => string;
};

export const createProjectCarouselPanelNavigation = ({
  panels,
  runIndexTransition,
  scrollCarouselIntoView,
  readHash = () => window.location.hash,
}: CreateProjectCarouselPanelNavigationArgs) => {
  const panelIndexById = new Map<string, number>();
  panels.forEach((panel, index) => {
    panelIndexById.set(panel.id, index);
  });

  const scrollToPanelId = (
    panelId: string,
    useQuickMotion = false,
  ): CarouselIndexTransitionResult | false => {
    const mappedIndex = panelIndexById.get(panelId);
    if (typeof mappedIndex !== 'number' || !Number.isInteger(mappedIndex)) {
      return false;
    }
    return runIndexTransition(mappedIndex, useQuickMotion);
  };

  const navigateToPanelId = (
    panelId: string,
    useQuickMotion = false,
  ): boolean => {
    const transitionMode = scrollToPanelId(panelId, useQuickMotion);
    if (!transitionMode) {
      return false;
    }
    scrollCarouselIntoView(useQuickMotion && transitionMode !== 'wrap');
    return true;
  };

  const handleHashNavigation = (useQuickMotion = true) => {
    const panelId = getPanelIdFromHash(readHash());
    if (!panelId) {
      return;
    }
    navigateToPanelId(panelId, useQuickMotion);
  };

  return {
    navigateToPanelId,
    handleHashNavigation,
  };
};
