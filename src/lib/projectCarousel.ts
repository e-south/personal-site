/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarousel.ts

Provides reusable geometry helpers for the project carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

export const getTrackMaxScrollLeftFromTrack = (track: HTMLElement) =>
  Math.max(0, track.scrollWidth - track.clientWidth);

const clampTrackScrollLeft = (track: HTMLElement, value: number) =>
  Math.min(getTrackMaxScrollLeftFromTrack(track), Math.max(0, value));

export const getTrackScrollPaddingInlineStart = (track: HTMLElement) => {
  const styles = window.getComputedStyle(track);
  const rawValue =
    styles.scrollPaddingInlineStart || styles.scrollPaddingLeft || '0';
  const parsedValue = Number.parseFloat(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

type PanelTargetLeftOptions = {
  track: HTMLElement;
  panel: HTMLElement;
  isDesktopViewport: boolean;
  scrollPaddingInlineStart?: number;
};

export const getPanelTargetLeft = ({
  track,
  panel,
  isDesktopViewport,
  scrollPaddingInlineStart,
}: PanelTargetLeftOptions) => {
  const panelLeft = panel.offsetLeft;
  const panelWidth = panel.offsetWidth;
  const effectiveScrollPadding =
    scrollPaddingInlineStart ?? getTrackScrollPaddingInlineStart(track);
  if (isDesktopViewport) {
    return clampTrackScrollLeft(track, panelLeft - effectiveScrollPadding);
  }
  const centeredLeft = panelLeft - (track.clientWidth - panelWidth) / 2;
  return clampTrackScrollLeft(track, centeredLeft);
};
