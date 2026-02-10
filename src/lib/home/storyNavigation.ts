/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/storyNavigation.ts

Binds story-section scroll navigation and snap behavior on the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import {
  getScrollMarginTop,
  getStickyHeader,
  getStickyHeaderOffset,
} from '@/lib/layout/stickyHeaderOffset';
import { createStoryNavigationState } from '@/lib/home/storyNavigationState';
import { bindStoryNavigationLinks } from '@/lib/home/storyNavigationLinks';

type StoryNavigationOptions = {
  prefersReducedMotion: () => boolean;
  getScrollBehavior: () => 'auto' | 'smooth';
  videoCheckEvent: string;
};

export const initStoryNavigation = ({
  prefersReducedMotion,
  getScrollBehavior,
  videoCheckEvent,
}: StoryNavigationOptions) => {
  const storyRoot = document.querySelector('[data-story-snap]');
  if (!(storyRoot instanceof HTMLElement)) {
    throw new Error('Story section is missing.');
  }
  if (!storyRoot.id) {
    throw new Error('Story section id is missing.');
  }
  const chapters = Array.from(
    storyRoot.querySelectorAll('[data-story-chapter]'),
  );
  if (chapters.length === 0) {
    throw new Error('Story chapters are missing.');
  }
  const firstChapter = chapters[0];
  if (!(firstChapter instanceof HTMLElement) || !firstChapter.id) {
    throw new Error('Story chapter id is missing.');
  }

  const header = getStickyHeader();

  const cleanup: Array<() => void> = [];
  const addCleanup = (fn: () => void) => cleanup.push(fn);
  const state = createStoryNavigationState({
    html: document.documentElement,
    cancelAnimationFrame: (frameId) => {
      window.cancelAnimationFrame(frameId);
    },
    clearTimeout: (timerId) => {
      window.clearTimeout(timerId);
    },
    setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
  });

  const getSnapOffset = () =>
    getStickyHeaderOffset({
      header,
      baseOffsetPx: 24,
    });

  const isHeroVisible = () => {
    const topGuard = getSnapOffset();
    return firstChapter.getBoundingClientRect().top > topGuard;
  };

  const isStoryInView = () => {
    if (isHeroVisible()) {
      return false;
    }
    const rect = storyRoot.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const topThreshold = viewportHeight * 0.15;
    const bottomThreshold = viewportHeight * 0.85;
    return rect.top < bottomThreshold && rect.bottom > topThreshold;
  };

  const clearActiveScroll = () => {
    state.clearActiveScroll();
  };

  const getScrollOffset = (target: HTMLElement) => {
    const marginTop = getScrollMarginTop(target);
    return getStickyHeaderOffset({
      header,
      baseOffsetPx: 24 + marginTop,
    });
  };

  const getTargetScrollTop = (target: HTMLElement, offset: number) => {
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    return Math.max(0, Math.round(top));
  };

  const restoreSnap = () => {
    state.restoreSnap(isStoryInView);
  };

  const cancelActiveScrollLock = () => {
    state.cancelActiveScrollLock();
  };

  const handleScroll = () => {
    if (!state.isSnapSuppressed() && !state.hasActiveScrollTarget()) {
      state.applySnapState(isStoryInView());
      return;
    }
    if (!state.isSnapSuppressed() || state.hasActiveScrollTarget()) {
      return;
    }
    state.scheduleSnapRestore(restoreSnap, 160);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  addCleanup(() => window.removeEventListener('scroll', handleScroll));

  window.addEventListener('wheel', cancelActiveScrollLock, { passive: true });
  addCleanup(() => window.removeEventListener('wheel', cancelActiveScrollLock));

  window.addEventListener('touchmove', cancelActiveScrollLock, {
    passive: true,
  });
  addCleanup(() =>
    window.removeEventListener('touchmove', cancelActiveScrollLock),
  );

  const cancelScrollKeys = new Set([
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
  ]);
  const handleKeyCancel = (event: KeyboardEvent) => {
    if (!cancelScrollKeys.has(event.key)) {
      return;
    }
    cancelActiveScrollLock();
  };
  window.addEventListener('keydown', handleKeyCancel);
  addCleanup(() => window.removeEventListener('keydown', handleKeyCancel));

  const scheduleVideoCheck = () => {
    const delay = prefersReducedMotion() ? 0 : 250;
    window.setTimeout(() => {
      window.dispatchEvent(new Event(videoCheckEvent));
    }, delay);
  };

  const waitForScrollSettle = (target: HTMLElement) => {
    const finalizeScrollAlignment = () => {
      window.scrollTo({
        top: getTargetScrollTop(target, getScrollOffset(target)),
        behavior: 'auto',
      });
    };

    const start = performance.now();
    const check = () => {
      if (!state.isActiveScrollTarget(target)) {
        return;
      }
      const currentOffset = getScrollOffset(target);
      const delta = Math.abs(
        target.getBoundingClientRect().top - currentOffset,
      );
      const elapsed = performance.now() - start;
      if (delta <= 2 || elapsed > 1600) {
        finalizeScrollAlignment();
        clearActiveScroll();
        restoreSnap();
        return;
      }
      state.setActiveScrollFrame(window.requestAnimationFrame(check));
    };
    state.setActiveScrollFrame(window.requestAnimationFrame(check));
  };

  const scrollToTarget = (target: HTMLElement, href?: string) => {
    state.beginProgrammaticScroll(target);
    const behavior = getScrollBehavior();
    const offset = href === '#top' ? 0 : getScrollOffset(target);
    const performScroll = () => {
      window.scrollTo({
        top: getTargetScrollTop(target, offset),
        behavior,
      });
      if (href) {
        history.replaceState(null, '', href);
      }
      scheduleVideoCheck();
    };
    if (behavior === 'smooth') {
      window.requestAnimationFrame(() => {
        performScroll();
        waitForScrollSettle(target);
      });
    } else {
      performScroll();
      clearActiveScroll();
      restoreSnap();
    }
  };

  const storyNavLinks = Array.from(
    document.querySelectorAll('[data-story-nav]'),
  );
  if (storyNavLinks.length === 0) {
    throw new Error('Story navigation controls are missing.');
  }
  const boundLinks = new Set<Element>();
  const bindToTarget = (
    link: HTMLAnchorElement,
    target: HTMLElement,
    href: string,
  ) => {
    const handleNext = (event: Event) => {
      event.preventDefault();
      scrollToTarget(target, href);
    };
    link.addEventListener('click', handleNext);
    addCleanup(() => link.removeEventListener('click', handleNext));
  };

  bindStoryNavigationLinks({
    links: storyNavLinks,
    label: 'Story navigation',
    boundLinks,
    bindToTarget,
  });
  bindStoryNavigationLinks({
    links: Array.from(document.querySelectorAll('[data-scroll-link]')),
    label: 'Scroll link',
    boundLinks,
    bindToTarget,
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (state.isSnapSuppressed()) {
          return;
        }
        if (entry.isIntersecting && !isHeroVisible()) {
          state.applySnapState(true);
        } else {
          state.applySnapState(false);
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '-15% 0px -15% 0px',
    },
  );

  observer.observe(storyRoot);
  addCleanup(() => {
    observer.disconnect();
    state.cleanup();
  });

  return () => {
    cleanup.forEach((fn) => fn());
  };
};
