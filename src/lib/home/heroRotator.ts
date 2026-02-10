/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/heroRotator.ts

Runs hero image rotation behavior for the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type HeroRotatorItem = {
  src: string;
  srcset: string;
  sizes: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

type InitHeroRotatorOptions = {
  defaultIntervalMs?: number;
  fadeMs?: number;
  prefersReducedMotion?: () => boolean;
};

const defaultPrefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const initHeroRotator = ({
  defaultIntervalMs = 6500,
  fadeMs = 450,
  prefersReducedMotion = defaultPrefersReducedMotion,
}: InitHeroRotatorOptions = {}) => {
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

  let items: HeroRotatorItem[] = [];
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
    if (typeof item.srcset !== 'string' || item.srcset.length === 0) {
      throw new Error(`Hero image ${index + 1} is missing a srcset.`);
    }
    if (typeof item.sizes !== 'string' || item.sizes.length === 0) {
      throw new Error(`Hero image ${index + 1} is missing sizes.`);
    }
    if (typeof item.alt !== 'string') {
      throw new Error(`Hero image ${index + 1} is missing alt text.`);
    }
  });

  const reduceMotion = prefersReducedMotion();
  const intervalValue = root.dataset.interval;
  const intervalMs =
    intervalValue === undefined ? defaultIntervalMs : Number(intervalValue);
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

  const apply = (item: HeroRotatorItem, index: number) => {
    img.src = item.src;
    img.srcset = item.srcset;
    img.sizes = item.sizes;
    const widthValue = Number(item.width);
    const heightValue = Number(item.height);
    if (Number.isFinite(widthValue) && widthValue > 0) {
      img.width = widthValue;
    }
    if (Number.isFinite(heightValue) && heightValue > 0) {
      img.height = heightValue;
    }
    img.alt = item.alt;
    caption.textContent = item.caption ?? '';
    const hasCaption = Boolean(item.caption);
    caption.dataset.empty = hasCaption ? 'false' : 'true';
    caption.setAttribute('aria-hidden', hasCaption ? 'false' : 'true');
    setActiveDot(index);
  };

  items.forEach((item) => {
    const preload = new Image();
    preload.srcset = item.srcset;
    preload.sizes = item.sizes;
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
    }, fadeMs);
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
