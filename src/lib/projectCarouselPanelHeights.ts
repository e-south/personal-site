/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselPanelHeights.ts

Provides panel-height accessors used by project carousel transition planning.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type CreateProjectCarouselPanelHeightsOptions = {
  panels: HTMLElement[];
  getPanelHeightForIndex: (index: number) => number;
};

export const createProjectCarouselPanelHeights = ({
  panels,
  getPanelHeightForIndex,
}: CreateProjectCarouselPanelHeightsOptions) => {
  const getCurrentPanelHeight = (wrappedCurrentIndex: number) => {
    const currentPanel = panels[wrappedCurrentIndex];
    if (!(currentPanel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Active panel is missing.');
    }
    return getPanelHeightForIndex(wrappedCurrentIndex);
  };

  const getTargetPanelHeight = (wrappedTargetIndex: number) => {
    const targetPanel = panels[wrappedTargetIndex];
    if (!(targetPanel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    return getPanelHeightForIndex(wrappedTargetIndex);
  };

  return {
    getCurrentPanelHeight,
    getTargetPanelHeight,
  };
};
