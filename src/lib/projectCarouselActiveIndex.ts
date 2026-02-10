/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselActiveIndex.ts

Computes active index state and closest-panel selection for carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

export type CarouselActiveIndexOptions = {
  syncHeight?: boolean;
  observeHeight?: boolean;
  force?: boolean;
};

type ApplyCarouselActiveIndexArgs = {
  nextIndex: number;
  activeIndex: number;
  wrapIndex: (index: number) => number;
  dots: HTMLButtonElement[];
  carousel: HTMLElement;
  scheduleTrackHeightSync: (index: number) => void;
  observeActivePanelHeight: () => void;
  parseDotIndex: (dot: HTMLButtonElement) => number;
  options: CarouselActiveIndexOptions;
};

type ResolveClosestVisiblePanelIndexArgs = {
  track: HTMLElement;
  panels: HTMLElement[];
  getPanelTargetLeft: (panel: HTMLElement) => number;
};

export const applyCarouselActiveIndex = ({
  nextIndex,
  activeIndex,
  wrapIndex,
  dots,
  carousel,
  scheduleTrackHeightSync,
  observeActivePanelHeight,
  parseDotIndex,
  options,
}: ApplyCarouselActiveIndexArgs) => {
  const { syncHeight = true, observeHeight = true, force = false } = options;

  const wrappedActiveIndex = wrapIndex(nextIndex);
  if (wrappedActiveIndex === activeIndex) {
    if (!force) {
      return activeIndex;
    }
    if (syncHeight) {
      scheduleTrackHeightSync(wrappedActiveIndex);
    }
    if (observeHeight) {
      observeActivePanelHeight();
    }
    return activeIndex;
  }

  const nextActiveIndex = wrappedActiveIndex;
  dots.forEach((dot) => {
    const dotIndex = parseDotIndex(dot);
    const isActive = dotIndex === nextActiveIndex;
    dot.dataset.active = String(isActive);
    dot.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
  carousel.dataset.activeIndex = String(nextActiveIndex);
  if (syncHeight) {
    scheduleTrackHeightSync(nextActiveIndex);
  }
  if (observeHeight) {
    observeActivePanelHeight();
  }
  return nextActiveIndex;
};

export const resolveClosestVisiblePanelIndex = ({
  track,
  panels,
  getPanelTargetLeft,
}: ResolveClosestVisiblePanelIndexArgs) => {
  const currentLeft = track.scrollLeft;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  panels.forEach((panel, index) => {
    const distance = Math.abs(getPanelTargetLeft(panel) - currentLeft);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};
