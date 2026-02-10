/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselEventBindings.ts

Registers and cleans up project carousel UI and window event handlers.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import {
  getPanelIdFromHref,
  updateHashForPanelId,
} from '@/lib/projectCarouselHash';
import { parseRequiredCarouselIndex } from '@/lib/projectCarouselTransitions';

type ProjectCarouselEventBindingsOptions = {
  track: HTMLElement;
  total: number;
  dots: HTMLButtonElement[];
  prevButtons: HTMLButtonElement[];
  nextButtons: HTMLButtonElement[];
  cardJumpLinks: HTMLAnchorElement[];
  runRelativeIndexTransition: (offset: number) => void;
  runIndexTransition: (targetIndex: number, useQuickMotion?: boolean) => void;
  navigateToPanelId: (panelId: string, useQuickMotion?: boolean) => boolean;
  cancelProgrammaticReposition: () => void;
  scheduleTrackHeightSync: () => void;
  handleHashNavigation: (useQuickMotion?: boolean) => void;
};

export const bindProjectCarouselEventBindings = ({
  track,
  total,
  dots,
  prevButtons,
  nextButtons,
  cardJumpLinks,
  runRelativeIndexTransition,
  runIndexTransition,
  navigateToPanelId,
  cancelProgrammaticReposition,
  scheduleTrackHeightSync,
  handleHashNavigation,
}: ProjectCarouselEventBindingsOptions) => {
  const cleanup: Array<() => void> = [];
  const addCleanup = (fn: () => void) => cleanup.push(fn);

  prevButtons.forEach((button) => {
    const handlePrev = () => {
      runRelativeIndexTransition(-1);
    };
    button.addEventListener('click', handlePrev);
    addCleanup(() => {
      button.removeEventListener('click', handlePrev);
    });
  });

  nextButtons.forEach((button) => {
    const handleNext = () => {
      runRelativeIndexTransition(1);
    };
    button.addEventListener('click', handleNext);
    addCleanup(() => {
      button.removeEventListener('click', handleNext);
    });
  });

  dots.forEach((dot) => {
    const index = parseRequiredCarouselIndex(
      dot.dataset.index,
      '[projects-carousel] Dot index is invalid.',
    );
    const handleDot = () => {
      runIndexTransition(index, true);
    };
    dot.addEventListener('click', handleDot);
    addCleanup(() => {
      dot.removeEventListener('click', handleDot);
    });
  });

  cardJumpLinks.forEach((link) => {
    const handleCardJump = (event: MouseEvent) => {
      const href = link.getAttribute('href') ?? '';
      const panelId = getPanelIdFromHref(href);
      if (!panelId) {
        return;
      }
      event.preventDefault();
      if (!navigateToPanelId(panelId, true)) {
        return;
      }
      updateHashForPanelId({
        panelId,
        currentHash: window.location.hash,
        replaceHash: (nextHash) => {
          history.replaceState(null, '', nextHash);
        },
        pushHash: (nextHash) => {
          history.pushState(null, '', nextHash);
        },
      });
    };
    link.addEventListener('click', handleCardJump);
    addCleanup(() => {
      link.removeEventListener('click', handleCardJump);
    });
  });

  const handleTrackKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      runRelativeIndexTransition(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      runRelativeIndexTransition(1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      runIndexTransition(0, true);
    }
    if (event.key === 'End') {
      event.preventDefault();
      runIndexTransition(total - 1, true);
    }
  };
  track.addEventListener('keydown', handleTrackKeyDown);
  addCleanup(() => {
    track.removeEventListener('keydown', handleTrackKeyDown);
  });

  const scrollCancelKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
  ]);

  const handleCancelKeys = (event: KeyboardEvent) => {
    if (!scrollCancelKeys.has(event.key)) {
      return;
    }
    cancelProgrammaticReposition();
  };
  const handleTrackContentLoad = () => {
    scheduleTrackHeightSync();
  };
  const handleResize = () => {
    scheduleTrackHeightSync();
  };
  const handleHashChange = () => {
    handleHashNavigation(true);
  };

  window.addEventListener('wheel', cancelProgrammaticReposition, {
    passive: true,
  });
  window.addEventListener('touchmove', cancelProgrammaticReposition, {
    passive: true,
  });
  window.addEventListener('keydown', handleCancelKeys);
  window.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener('hashchange', handleHashChange);
  track.addEventListener('load', handleTrackContentLoad, true);

  addCleanup(() => {
    window.removeEventListener('wheel', cancelProgrammaticReposition);
  });
  addCleanup(() => {
    window.removeEventListener('touchmove', cancelProgrammaticReposition);
  });
  addCleanup(() => {
    window.removeEventListener('keydown', handleCancelKeys);
  });
  addCleanup(() => {
    window.removeEventListener('resize', handleResize);
  });
  addCleanup(() => {
    window.removeEventListener('hashchange', handleHashChange);
  });
  addCleanup(() => {
    track.removeEventListener('load', handleTrackContentLoad, true);
  });

  return () => {
    cleanup.forEach((dispose) => dispose());
  };
};
