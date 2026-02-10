/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTargetTop.ts

Resolves the projects carousel viewport target-top value for vertical alignment.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import {
  getStickyHeader,
  getStickyHeaderOffset,
} from '@/lib/layout/stickyHeaderOffset';

type ResolveProjectCarouselTargetTopOptions = {
  carousel: HTMLElement;
  baseOffsetPx?: number;
};

export const resolveProjectCarouselTargetTop = ({
  carousel,
  baseOffsetPx = 20,
}: ResolveProjectCarouselTargetTopOptions) => {
  const headerOffset = getStickyHeaderOffset({
    header: getStickyHeader(),
    baseOffsetPx,
  });
  return Math.max(
    0,
    Math.round(
      window.scrollY + carousel.getBoundingClientRect().top - headerOffset,
    ),
  );
};
