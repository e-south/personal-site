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
  const html = document.documentElement;
  const snapClass = 'story-snap';
  let suppressSnap = false;
  let snapTimer: number | null = null;
  let activeScrollTarget: HTMLElement | null = null;
  let activeScrollFrame: number | null = null;

  const applySnapState = (enabled: boolean) => {
    if (enabled && !activeScrollTarget) {
      return;
    }
    if (enabled) {
      html.classList.add(snapClass);
    } else {
      html.classList.remove(snapClass);
    }
  };

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
    if (activeScrollFrame !== null) {
      window.cancelAnimationFrame(activeScrollFrame);
      activeScrollFrame = null;
    }
    activeScrollTarget = null;
    applySnapState(false);
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
    suppressSnap = false;
    applySnapState(isStoryInView());
  };

  const releaseScrollControl = () => {
    clearActiveScroll();
    suppressSnap = true;
    if (snapTimer !== null) {
      window.clearTimeout(snapTimer);
      snapTimer = null;
    }
  };

  const cancelActiveScrollLock = () => {
    if (!activeScrollTarget) {
      return;
    }
    releaseScrollControl();
  };

  const handleScroll = () => {
    if (!suppressSnap && !activeScrollTarget) {
      applySnapState(isStoryInView());
      return;
    }
    if (!suppressSnap || activeScrollTarget) {
      return;
    }
    if (snapTimer !== null) {
      window.clearTimeout(snapTimer);
    }
    snapTimer = window.setTimeout(() => {
      snapTimer = null;
      restoreSnap();
    }, 160);
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
      if (activeScrollTarget !== target) {
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
      activeScrollFrame = window.requestAnimationFrame(check);
    };
    activeScrollFrame = window.requestAnimationFrame(check);
  };

  const scrollToTarget = (target: HTMLElement, href?: string) => {
    clearActiveScroll();
    activeScrollTarget = target;
    suppressSnap = true;
    applySnapState(true);
    if (snapTimer !== null) {
      window.clearTimeout(snapTimer);
      snapTimer = null;
    }
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
  const bindScrollLink = (link: HTMLAnchorElement, label: string) => {
    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('#')) {
      throw new Error(`${label} href must be a hash.`);
    }
    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) {
      throw new Error(`${label} target is missing.`);
    }
    const handleNext = (event: Event) => {
      event.preventDefault();
      scrollToTarget(target, href);
    };
    link.addEventListener('click', handleNext);
    addCleanup(() => link.removeEventListener('click', handleNext));
  };

  const bindLinks = (links: Element[], label: string) => {
    links.forEach((link) => {
      if (boundLinks.has(link)) {
        return;
      }
      if (!(link instanceof HTMLAnchorElement)) {
        throw new Error(`${label} control must be a link.`);
      }
      boundLinks.add(link);
      bindScrollLink(link, label);
    });
  };

  bindLinks(storyNavLinks, 'Story navigation');
  bindLinks(
    Array.from(document.querySelectorAll('[data-scroll-link]')),
    'Scroll link',
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (suppressSnap) {
          return;
        }
        if (entry.isIntersecting && !isHeroVisible()) {
          applySnapState(true);
        } else {
          applySnapState(false);
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
    applySnapState(false);
    if (snapTimer !== null) {
      window.clearTimeout(snapTimer);
      snapTimer = null;
    }
  });

  return () => {
    cleanup.forEach((fn) => fn());
  };
};
