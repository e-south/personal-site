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
