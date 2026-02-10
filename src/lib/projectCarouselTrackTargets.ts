/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTrackTargets.ts

Builds track-target and closest-panel geometry helpers for carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import {
  getPanelTargetLeft as getPanelTargetLeftFromGeometry,
  getTrackMaxScrollLeftFromTrack,
  getTrackScrollPaddingInlineStart as getTrackScrollPaddingInlineStartFromTrack,
} from '@/lib/projectCarousel';
import { resolveClosestVisiblePanelIndex } from '@/lib/projectCarouselActiveIndex';

type CreateProjectCarouselTrackTargetsArgs = {
  track: HTMLElement;
  panels: HTMLElement[];
  readIsDesktopViewport?: () => boolean;
};

export const createProjectCarouselTrackTargets = ({
  track,
  panels,
  readIsDesktopViewport = () => window.matchMedia('(min-width: 768px)').matches,
}: CreateProjectCarouselTrackTargetsArgs) => {
  const getTrackMaxScrollLeft = () => getTrackMaxScrollLeftFromTrack(track);
  const clampTrackScrollLeft = (value: number) =>
    Math.min(getTrackMaxScrollLeft(), Math.max(0, value));
  const getTrackScrollPaddingInlineStart = () =>
    getTrackScrollPaddingInlineStartFromTrack(track);

  const getPanelTargetLeft = (panel: HTMLElement) => {
    const scrollPaddingInlineStart = getTrackScrollPaddingInlineStart();
    return clampTrackScrollLeft(
      getPanelTargetLeftFromGeometry({
        track,
        panel,
        isDesktopViewport: readIsDesktopViewport(),
        scrollPaddingInlineStart,
      }),
    );
  };

  const getClosestVisiblePanelIndex = () =>
    resolveClosestVisiblePanelIndex({
      track,
      panels,
      getPanelTargetLeft,
    });

  return {
    getPanelTargetLeft,
    getClosestVisiblePanelIndex,
  };
};
