/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselHeightSync.ts

Coordinates project carousel height sync and active-panel ResizeObserver updates.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type CreateProjectCarouselHeightSyncControllerOptions = {
  track: HTMLElement;
  panels: HTMLElement[];
  wrapIndex: (index: number) => number;
  resolveActiveIndex: () => number;
};

export const createProjectCarouselHeightSyncController = ({
  track,
  panels,
  wrapIndex,
  resolveActiveIndex,
}: CreateProjectCarouselHeightSyncControllerOptions) => {
  let trackHeightSyncFrame: number | null = null;
  let activePanelResizeObserver: ResizeObserver | null = null;

  const getPanelHeight = (panel: HTMLElement) => {
    const height = panel.getBoundingClientRect().height;
    if (!Number.isFinite(height) || height <= 0) {
      return 1;
    }
    return Math.ceil(height);
  };

  const getPanelHeightForIndex = (index: number) => {
    const panel = panels[wrapIndex(index)];
    if (!(panel instanceof HTMLElement)) {
      throw new Error('[projects-carousel] Target panel is missing.');
    }
    return getPanelHeight(panel);
  };

  const stopTrackHeightSync = () => {
    if (trackHeightSyncFrame !== null) {
      window.cancelAnimationFrame(trackHeightSyncFrame);
      trackHeightSyncFrame = null;
    }
  };

  const syncTrackHeight = (index = resolveActiveIndex()) => {
    const panel = panels[wrapIndex(index)];
    if (!(panel instanceof HTMLElement)) {
      return;
    }
    const nextHeight = getPanelHeight(panel);
    track.style.height = `${nextHeight}px`;
  };

  const scheduleTrackHeightSync = (index = resolveActiveIndex()) => {
    stopTrackHeightSync();
    trackHeightSyncFrame = window.requestAnimationFrame(() => {
      trackHeightSyncFrame = null;
      syncTrackHeight(index);
    });
  };

  const disconnectActivePanelResizeObserver = () => {
    if (activePanelResizeObserver !== null) {
      activePanelResizeObserver.disconnect();
      activePanelResizeObserver = null;
    }
  };

  const observeActivePanelHeight = () => {
    disconnectActivePanelResizeObserver();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    const panel = panels[resolveActiveIndex()];
    if (!(panel instanceof HTMLElement)) {
      return;
    }
    activePanelResizeObserver = new ResizeObserver(() => {
      scheduleTrackHeightSync();
    });
    activePanelResizeObserver.observe(panel);
  };

  return {
    getPanelHeightForIndex,
    stopTrackHeightSync,
    scheduleTrackHeightSync,
    disconnectActivePanelResizeObserver,
    observeActivePanelHeight,
  };
};
