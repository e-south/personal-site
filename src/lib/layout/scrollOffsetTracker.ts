/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/scrollOffsetTracker.ts

Tracks sticky header size and updates the global scroll offset token.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import {
  getStickyHeader,
  getStickyHeaderOffset,
  isStickyHeader,
} from '@/lib/layout/stickyHeaderOffset';

export const createScrollOffsetTracker = () => {
  let headerResizeObserver: ResizeObserver | null = null;
  let scrollOffsetRaf: number | null = null;

  const clearScheduledScrollOffsetUpdate = () => {
    if (scrollOffsetRaf !== null) {
      window.cancelAnimationFrame(scrollOffsetRaf);
      scrollOffsetRaf = null;
    }
  };

  const setScrollOffsetToken = () => {
    const header = getStickyHeader();
    const headerIsSticky = isStickyHeader(header);
    const offset = getStickyHeaderOffset({
      header,
      baseOffsetPx: headerIsSticky ? 24 : 0,
      minOffsetPx: headerIsSticky ? 56 : 0,
    });
    document.documentElement.style.setProperty(
      '--site-scroll-offset',
      `${offset}px`,
    );
  };

  const scheduleScrollOffsetToken = () => {
    clearScheduledScrollOffsetUpdate();
    scrollOffsetRaf = window.requestAnimationFrame(() => {
      scrollOffsetRaf = null;
      setScrollOffsetToken();
    });
  };

  const clearHeaderResizeObserver = () => {
    if (headerResizeObserver) {
      headerResizeObserver.disconnect();
      headerResizeObserver = null;
    }
  };

  const bindHeaderOffsetTracking = () => {
    clearHeaderResizeObserver();
    setScrollOffsetToken();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const header = getStickyHeader();
    if (!(header instanceof HTMLElement)) {
      return;
    }

    headerResizeObserver = new ResizeObserver(() => {
      scheduleScrollOffsetToken();
    });
    headerResizeObserver.observe(header);
  };

  const teardown = () => {
    clearHeaderResizeObserver();
    clearScheduledScrollOffsetUpdate();
  };

  return {
    bindHeaderOffsetTracking,
    scheduleScrollOffsetToken,
    teardown,
  };
};
