/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/storyCarousels.ts

Binds and manages horizontal story carousel interactions on the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type StoryCarouselsOptions = {
  getScrollBehavior: () => 'auto' | 'smooth';
};
const MIN_SWIPE_X_PX = 36;
const SCROLL_SETTLE_DELAY_MS = 120;

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

export const initStoryCarousels = ({
  getScrollBehavior,
}: StoryCarouselsOptions) => {
  const wrappers = Array.from(
    document.querySelectorAll('[data-carousel-wrapper]'),
  );
  if (wrappers.length === 0) {
    return () => {};
  }

  const cleanup: Array<() => void> = [];
  const addCleanup = (fn: () => void) => cleanup.push(fn);

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
    let itemOffsets: number[] = [];
    let offsetsDirty = true;
    const rebuildItemOffsets = () => {
      itemOffsets = items.map((item) => getItemOffset(carousel, item));
      offsetsDirty = false;
    };
    const markOffsetsDirty = () => {
      offsetsDirty = true;
    };
    const ensureItemOffsets = () => {
      if (!offsetsDirty && itemOffsets.length === items.length) {
        return;
      }
      rebuildItemOffsets();
    };
    const getClosestIndexFromOffsets = () => {
      ensureItemOffsets();
      const scrollLeft = carousel.scrollLeft;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      itemOffsets.forEach((offset, index) => {
        const distance = Math.abs(offset - scrollLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    };

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
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        markOffsetsDirty();
        if (shouldFixHeight) {
          window.requestAnimationFrame(updateLockHeight);
        }
      });
      resizeObserver.observe(carousel);
      items.forEach((item) => resizeObserver?.observe(item));
    }

    rebuildItemOffsets();
    updateLockHeight();

    const scrollToIndex = (nextIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(nextIndex, maxIndex));
      const target = items[clampedIndex];
      if (!target) {
        throw new Error('Story carousel target item is missing.');
      }
      ensureItemOffsets();
      carousel.scrollTo({
        left: itemOffsets[clampedIndex] ?? getItemOffset(carousel, target),
        behavior: getScrollBehavior(),
      });
      updateControls(prevButton, nextButton, clampedIndex, maxIndex);
    };

    const handlePrev = (event: Event) => {
      event.preventDefault();
      scrollToIndex(getClosestIndexFromOffsets() - 1);
    };
    const handleNext = (event: Event) => {
      event.preventDefault();
      scrollToIndex(getClosestIndexFromOffsets() + 1);
    };

    let touchStartX: number | null = null;
    let touchStartY: number | null = null;
    let touchStartIndex = 0;
    let settleTimer: number | null = null;
    const scheduleSettle = () => {
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
      }
      settleTimer = window.setTimeout(() => {
        settleTimer = null;
        scrollToIndex(getClosestIndexFromOffsets());
      }, SCROLL_SETTLE_DELAY_MS);
    };
    const clearTouchStart = () => {
      touchStartX = null;
      touchStartY = null;
    };
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartIndex = getClosestIndexFromOffsets();
    };
    const handleTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch || touchStartX === null || touchStartY === null) {
        clearTouchStart();
        return;
      }
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      clearTouchStart();
      if (
        Math.abs(deltaX) >= MIN_SWIPE_X_PX &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        const direction = deltaX < 0 ? 1 : -1;
        scrollToIndex(touchStartIndex + direction);
        return;
      }
      scrollToIndex(getClosestIndexFromOffsets());
    };
    const handleTouchCancel = () => {
      clearTouchStart();
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
          getClosestIndexFromOffsets(),
          maxIndex,
        );
        scheduleSettle();
      });
    };

    prevButton.addEventListener('click', handlePrev);
    nextButton.addEventListener('click', handleNext);
    carousel.addEventListener('scroll', handleScroll, { passive: true });
    carousel.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
    carousel.addEventListener('touchcancel', handleTouchCancel, {
      passive: true,
    });
    addCleanup(() => prevButton.removeEventListener('click', handlePrev));
    addCleanup(() => nextButton.removeEventListener('click', handleNext));
    addCleanup(() => carousel.removeEventListener('scroll', handleScroll));
    addCleanup(() =>
      carousel.removeEventListener('touchstart', handleTouchStart),
    );
    addCleanup(() => carousel.removeEventListener('touchend', handleTouchEnd));
    addCleanup(() =>
      carousel.removeEventListener('touchcancel', handleTouchCancel),
    );
    addCleanup(() => {
      if (scrollFrame !== null) {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = null;
      }
    });
    addCleanup(() => {
      clearTouchStart();
    });
    addCleanup(() => {
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
        settleTimer = null;
      }
    });
    addCleanup(() => {
      resizeObserver?.disconnect();
    });
    const handleWindowResize = () => {
      markOffsetsDirty();
      if (shouldFixHeight) {
        window.requestAnimationFrame(updateLockHeight);
      }
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });
    addCleanup(() => window.removeEventListener('resize', handleWindowResize));

    updateControls(
      prevButton,
      nextButton,
      getClosestIndexFromOffsets(),
      maxIndex,
    );
  });

  return () => {
    cleanup.forEach((fn) => fn());
  };
};
