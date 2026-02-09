/*
--------------------------------------------------------------------------------
personal-site
src/lib/home.ts

Handles interactive behavior for the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { initHeroRotator } from '@/lib/home/heroRotator';
import { initStoryVideos } from '@/lib/home/storyVideos';
import { STORY_VIDEO_CHECK_EVENT as VIDEO_CHECK_EVENT } from '@/lib/home/storyVideos';

const HERO_INTERVAL_MS = 6500;
const HERO_FADE_MS = 450;

let homeCleanup: (() => void) | null = null;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getScrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

const initStoryNavigation = () => {
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

  const header = document.querySelector('header');

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

  const getHeaderHeight = () => {
    if (!(header instanceof HTMLElement)) {
      return 0;
    }
    return header.offsetHeight;
  };

  const getSnapOffset = () => getHeaderHeight() + 24;

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
    const style = window.getComputedStyle(target);
    const marginTop = Number.parseFloat(style.scrollMarginTop || '0');
    if (!Number.isFinite(marginTop)) {
      return getHeaderHeight() + 24;
    }
    return getHeaderHeight() + 24 + marginTop;
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
      window.dispatchEvent(new Event(VIDEO_CHECK_EVENT));
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

const initStoryCarousels = () => {
  const wrappers = Array.from(
    document.querySelectorAll('[data-carousel-wrapper]'),
  );
  if (wrappers.length === 0) {
    return () => {};
  }

  const cleanup: Array<() => void> = [];
  const addCleanup = (fn: () => void) => cleanup.push(fn);
  const fixedHeightChapters = new Set([
    'phd-at-boston-university',
    'imperial-crick-training',
  ]);

  const getCarouselItems = (carousel: HTMLElement) => {
    const items = Array.from(
      carousel.querySelectorAll('[data-carousel-item]'),
    ).filter((item): item is HTMLElement => item instanceof HTMLElement);
    if (items.length < 2) {
      throw new Error('Story carousel needs at least two items.');
    }
    return items;
  };

  const getItemOffset = (carousel: HTMLElement, item: HTMLElement) => {
    const carouselRect = carousel.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    return itemRect.left - carouselRect.left + carousel.scrollLeft;
  };

  const getClosestIndex = (carousel: HTMLElement, items: HTMLElement[]) => {
    const scrollLeft = carousel.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    items.forEach((item, index) => {
      const offset = getItemOffset(carousel, item);
      const distance = Math.abs(offset - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  };

  const updateControls = (
    prevButton: HTMLButtonElement,
    nextButton: HTMLButtonElement,
    index: number,
    maxIndex: number,
  ) => {
    const prevDisabled = index <= 0;
    const nextDisabled = index >= maxIndex;
    prevButton.disabled = prevDisabled;
    prevButton.setAttribute('aria-disabled', prevDisabled ? 'true' : 'false');
    nextButton.disabled = nextDisabled;
    nextButton.setAttribute('aria-disabled', nextDisabled ? 'true' : 'false');
  };

  wrappers.forEach((wrapper) => {
    if (!(wrapper instanceof HTMLElement)) {
      throw new Error('Story carousel wrapper must be an element.');
    }
    const carousel = wrapper.querySelector('[data-carousel]');
    if (!(carousel instanceof HTMLElement)) {
      throw new Error('Story carousel is missing.');
    }
    const prevButton = wrapper.querySelector('[data-carousel-prev]');
    const nextButton = wrapper.querySelector('[data-carousel-next]');
    if (!(prevButton instanceof HTMLButtonElement)) {
      throw new Error('Story carousel previous button is missing.');
    }
    if (!(nextButton instanceof HTMLButtonElement)) {
      throw new Error('Story carousel next button is missing.');
    }

    const items = getCarouselItems(carousel);
    const maxIndex = items.length - 1;

    const chapterRoot = wrapper.closest('[data-story-chapter]');
    const shouldFixHeight =
      chapterRoot instanceof HTMLElement &&
      fixedHeightChapters.has(chapterRoot.id);

    const updateLockHeight = () => {
      if (!shouldFixHeight) {
        return;
      }
      const heights = items.map((item) =>
        Math.round(item.getBoundingClientRect().height),
      );
      const maxHeight = Math.max(...heights, 0);
      if (maxHeight > 0) {
        carousel.style.setProperty('--carousel-lock-height', `${maxHeight}px`);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (shouldFixHeight && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateLockHeight);
      });
      items.forEach((item) => resizeObserver?.observe(item));
    }

    updateLockHeight();

    const scrollToIndex = (nextIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(nextIndex, maxIndex));
      const target = items[clampedIndex];
      if (!target) {
        throw new Error('Story carousel target item is missing.');
      }
      carousel.scrollTo({
        left: getItemOffset(carousel, target),
        behavior: getScrollBehavior(),
      });
      updateControls(prevButton, nextButton, clampedIndex, maxIndex);
    };

    const handlePrev = (event: Event) => {
      event.preventDefault();
      scrollToIndex(getClosestIndex(carousel, items) - 1);
    };
    const handleNext = (event: Event) => {
      event.preventDefault();
      scrollToIndex(getClosestIndex(carousel, items) + 1);
    };

    let scrollFrame: number | null = null;
    const handleScroll = () => {
      if (scrollFrame !== null) {
        window.cancelAnimationFrame(scrollFrame);
      }
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        updateControls(
          prevButton,
          nextButton,
          getClosestIndex(carousel, items),
          maxIndex,
        );
      });
    };

    prevButton.addEventListener('click', handlePrev);
    nextButton.addEventListener('click', handleNext);
    carousel.addEventListener('scroll', handleScroll, { passive: true });
    addCleanup(() => prevButton.removeEventListener('click', handlePrev));
    addCleanup(() => nextButton.removeEventListener('click', handleNext));
    addCleanup(() => carousel.removeEventListener('scroll', handleScroll));
    addCleanup(() => {
      if (scrollFrame !== null) {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = null;
      }
    });
    addCleanup(() => {
      resizeObserver?.disconnect();
    });

    updateControls(
      prevButton,
      nextButton,
      getClosestIndex(carousel, items),
      maxIndex,
    );
  });

  return () => {
    cleanup.forEach((fn) => fn());
  };
};

const initHome = () => {
  const cleanupFns: Array<() => void> = [];
  const registerCleanup = (cleanup: (() => void) | void) => {
    if (typeof cleanup === 'function') {
      cleanupFns.push(cleanup);
    }
  };
  try {
    registerCleanup(
      initHeroRotator({
        defaultIntervalMs: HERO_INTERVAL_MS,
        fadeMs: HERO_FADE_MS,
        prefersReducedMotion,
      }),
    );
    registerCleanup(initStoryNavigation());
    registerCleanup(initStoryCarousels());
    registerCleanup(
      initStoryVideos({
        checkEvent: VIDEO_CHECK_EVENT,
      }),
    );
  } catch (error) {
    cleanupFns.forEach((cleanup) => cleanup());
    throw error;
  }
  return () => {
    cleanupFns.forEach((cleanup) => cleanup());
  };
};

const teardownHome = () => {
  if (homeCleanup) {
    homeCleanup();
    homeCleanup = null;
  }
};

const bootHome = () => {
  teardownHome();
  homeCleanup = initHome();
};

const bindLifecycle = () => {
  document.addEventListener('astro:page-load', bootHome);
  document.addEventListener('astro:before-swap', teardownHome);
  window.addEventListener('pagehide', teardownHome);
};

export const initHomePage = () => {
  const controllerKey = '__homeController';
  const docEl = document.documentElement as HTMLHtmlElement & {
    [key: string]: unknown;
  };
  const existingController = docEl[controllerKey] as
    | { boot: () => void }
    | undefined;
  if (existingController) {
    existingController.boot();
    return;
  }
  const controller = {
    boot: bootHome,
    teardown: teardownHome,
  };
  docEl[controllerKey] = controller;
  bindLifecycle();
  bootHome();
};
