/*
--------------------------------------------------------------------------------
personal-site
src/lib/home.ts

Handles interactive behavior for the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

const HERO_INTERVAL_MS = 6500;
const HERO_FADE_MS = 450;
const VIDEO_CHECK_EVENT = 'story:video-check';

let homeCleanup: (() => void) | null = null;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getScrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

const initHeroRotator = () => {
  const root = document.querySelector('[data-hero-rotator]');
  if (!(root instanceof HTMLElement)) {
    throw new Error('Home hero rotator root is missing.');
  }

  const img = root.querySelector('[data-hero-image]');
  const caption = root.querySelector('[data-hero-caption]');
  if (!(img instanceof HTMLImageElement) || !(caption instanceof HTMLElement)) {
    throw new Error('Home hero rotator elements are missing.');
  }

  const imagesRaw = root.dataset.images;
  if (!imagesRaw) {
    throw new Error('Home hero rotator images are missing.');
  }
  let items: Array<{ src: string; alt: string; caption?: string }> = [];
  try {
    items = JSON.parse(imagesRaw);
  } catch (error) {
    throw new Error('Home hero rotator data is invalid.', { cause: error });
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Home hero rotator has no images.');
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Hero image ${index + 1} is invalid.`);
    }
    if (!item.src) {
      throw new Error(`Hero image ${index + 1} is missing a src.`);
    }
    if (typeof item.alt !== 'string') {
      throw new Error(`Hero image ${index + 1} is missing alt text.`);
    }
  });

  const reduceMotion = prefersReducedMotion();
  const intervalValue = root.dataset.interval;
  const intervalMs =
    intervalValue === undefined ? HERO_INTERVAL_MS : Number(intervalValue);
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    throw new Error('Home hero rotator interval is invalid.');
  }

  const shell = root.closest('[data-hero-shell]');
  const dots = Array.from(
    shell?.querySelectorAll('[data-hero-dot]') ?? [],
  ).filter((dot) => dot instanceof HTMLButtonElement) as HTMLButtonElement[];

  if (dots.length > 0 && dots.length !== items.length) {
    throw new Error('Home hero rotator dots do not match image count.');
  }

  const setActiveDot = (index: number) => {
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
  };

  const apply = (
    item: { src: string; alt: string; caption?: string },
    index: number,
  ) => {
    img.src = item.src;
    img.alt = item.alt;
    caption.textContent = item.caption ?? '';
    const hasCaption = Boolean(item.caption);
    caption.dataset.empty = hasCaption ? 'false' : 'true';
    caption.setAttribute('aria-hidden', hasCaption ? 'false' : 'true');
    setActiveDot(index);
  };

  items.forEach((item) => {
    const preload = new Image();
    preload.src = item.src;
  });

  const order = items.map((_, index) => index);
  let position = 0;
  let currentIndex = order[position];
  apply(items[currentIndex], currentIndex);

  let fadeTimeout: number | null = null;
  let intervalId: number | null = null;

  const clearFade = () => {
    if (fadeTimeout !== null) {
      window.clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }
  };

  const showIndex = (index: number, withFade: boolean) => {
    if (index < 0 || index >= items.length) {
      return;
    }
    currentIndex = index;
    clearFade();
    if (!withFade) {
      root.classList.remove('is-fading');
      apply(items[index], index);
      return;
    }
    root.classList.add('is-fading');
    fadeTimeout = window.setTimeout(() => {
      apply(items[index], index);
      root.classList.remove('is-fading');
    }, HERO_FADE_MS);
  };

  const setOrderFromIndex = (index: number) => {
    position = Math.max(0, Math.min(index, order.length - 1));
  };

  const advance = () => {
    position = (position + 1) % order.length;
    showIndex(order[position], !reduceMotion);
  };

  const resetInterval = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    if (reduceMotion || items.length < 2) {
      return;
    }
    intervalId = window.setInterval(advance, intervalMs);
  };

  const dotCleanup: Array<() => void> = [];

  dots.forEach((dot) => {
    const indexValue = Number(dot.dataset.heroIndex);
    if (!Number.isFinite(indexValue)) {
      return;
    }
    const onClick = () => {
      if (indexValue === currentIndex) {
        return;
      }
      setOrderFromIndex(indexValue);
      showIndex(indexValue, !reduceMotion);
      resetInterval();
    };
    dot.addEventListener('click', onClick);
    dotCleanup.push(() => dot.removeEventListener('click', onClick));
  });

  resetInterval();

  return () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
    }
    clearFade();
    dotCleanup.forEach((cleanup) => cleanup());
  };
};

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
    return Number.isFinite(marginTop) ? marginTop : 0;
  };

  const getTargetScrollTop = (target: HTMLElement, offset: number) => {
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    return Math.max(0, Math.round(top));
  };

  const restoreSnap = () => {
    suppressSnap = false;
    applySnapState(isStoryInView());
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

  const scheduleVideoCheck = () => {
    const delay = prefersReducedMotion() ? 0 : 250;
    window.setTimeout(() => {
      window.dispatchEvent(new Event(VIDEO_CHECK_EVENT));
    }, delay);
  };

  const waitForScrollSettle = (target: HTMLElement, offset: number) => {
    const start = performance.now();
    const check = () => {
      if (activeScrollTarget !== target) {
        return;
      }
      const delta = Math.abs(target.getBoundingClientRect().top - offset);
      const elapsed = performance.now() - start;
      if (delta <= 2 || elapsed > 1600) {
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
        waitForScrollSettle(target, offset);
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

const initStoryVideos = () => {
  const videos = Array.from(
    document.querySelectorAll('[data-story-video]'),
  ).filter(
    (video): video is HTMLVideoElement => video instanceof HTMLVideoElement,
  );
  if (videos.length === 0) {
    return () => {};
  }

  const cleanup: Array<() => void> = [];
  const addCleanup = (fn: () => void) => cleanup.push(fn);

  const playThreshold = 0.5;
  const pauseThreshold = 0.1;

  const ensurePlaybackAttributes = (video: HTMLVideoElement) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    if (!video.preload || video.preload === 'none') {
      video.preload = 'metadata';
    }
  };

  const setPlaybackState = (video: HTMLVideoElement, shouldPlay: boolean) => {
    const state = video.dataset.playState ?? 'idle';
    if (shouldPlay) {
      if (state === 'playing') {
        return;
      }
      video.dataset.playState = 'playing';
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.dataset.playState = 'paused';
        });
      }
      return;
    }
    if (state === 'paused') {
      return;
    }
    video.pause();
    video.dataset.playState = 'paused';
  };

  const updateByRatio = (video: HTMLVideoElement, ratio: number) => {
    if (ratio >= playThreshold) {
      setPlaybackState(video, true);
    } else if (ratio <= pauseThreshold) {
      setPlaybackState(video, false);
    }
  };

  const getVisibilityRatio = (video: HTMLVideoElement) => {
    const rect = video.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const visibleHeight = Math.max(
      0,
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
    );
    const visibleWidth = Math.max(
      0,
      Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0),
    );
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.width * rect.height;
    return totalArea > 0 ? visibleArea / totalArea : 0;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLVideoElement)) {
          return;
        }
        updateByRatio(entry.target, entry.intersectionRatio);
      });
    },
    {
      threshold: [0, pauseThreshold, playThreshold, 1],
    },
  );

  videos.forEach((video) => {
    ensurePlaybackAttributes(video);
    observer.observe(video);
    const handleLoaded = () => {
      updateByRatio(video, getVisibilityRatio(video));
    };
    video.addEventListener('loadeddata', handleLoaded);
    addCleanup(() => video.removeEventListener('loadeddata', handleLoaded));
  });

  let checkTimer: number | null = null;
  const scheduleCheck = () => {
    if (checkTimer !== null) {
      window.clearTimeout(checkTimer);
    }
    checkTimer = window.setTimeout(() => {
      checkTimer = null;
      videos.forEach((video) => {
        updateByRatio(video, getVisibilityRatio(video));
      });
    }, 150);
  };

  const handleVideoCheck = () => scheduleCheck();
  window.addEventListener(VIDEO_CHECK_EVENT, handleVideoCheck);
  addCleanup(() =>
    window.removeEventListener(VIDEO_CHECK_EVENT, handleVideoCheck),
  );

  const handleVisibilityChange = () => {
    if (document.hidden) {
      videos.forEach((video) => {
        video.pause();
        video.dataset.playState = 'paused';
      });
    } else {
      scheduleCheck();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  addCleanup(() =>
    document.removeEventListener('visibilitychange', handleVisibilityChange),
  );

  window.addEventListener('resize', scheduleCheck);
  addCleanup(() => window.removeEventListener('resize', scheduleCheck));

  scheduleCheck();

  return () => {
    observer.disconnect();
    if (checkTimer !== null) {
      window.clearTimeout(checkTimer);
    }
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
    registerCleanup(initHeroRotator());
    registerCleanup(initStoryNavigation());
    registerCleanup(initStoryCarousels());
    registerCleanup(initStoryVideos());
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
