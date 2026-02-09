/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/pageEnhancements.ts

Binds layout-level reveal and sticky-header scroll offset behavior.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type LayoutWindow = Window & {
  __layoutEnhancementsBound?: boolean;
};

export const bindLayoutEnhancements = () => {
  const appWindow = window as LayoutWindow;
  const stateKey = '__layoutEnhancementsBound';
  if (appWindow[stateKey]) {
    return;
  }
  appWindow[stateKey] = true;

  let revealObserver: IntersectionObserver | null = null;
  let headerResizeObserver: ResizeObserver | null = null;
  let scrollOffsetRaf: number | null = null;

  const clearRevealObserver = () => {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
  };

  const setScrollOffsetToken = () => {
    const header = document.querySelector('header');
    const headerHeight =
      header instanceof HTMLElement ? header.offsetHeight : 0;
    const offset = Math.max(56, Math.round(headerHeight + 24));
    document.documentElement.style.setProperty(
      '--site-scroll-offset',
      `${offset}px`,
    );
  };

  const scheduleScrollOffsetToken = () => {
    if (scrollOffsetRaf !== null) {
      window.cancelAnimationFrame(scrollOffsetRaf);
    }
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

    const header = document.querySelector('header');
    if (!(header instanceof HTMLElement)) {
      return;
    }

    headerResizeObserver = new ResizeObserver(() => {
      scheduleScrollOffsetToken();
    });
    headerResizeObserver.observe(header);
  };

  const initReveals = () => {
    clearRevealObserver();

    const revealItems = Array.from(
      document.querySelectorAll('[data-reveal]'),
    ).filter((item) => item instanceof HTMLElement) as HTMLElement[];

    if (revealItems.length === 0) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) {
      revealItems.forEach((item) => {
        item.dataset.revealReady = 'true';
        item.classList.add('is-visible');
        item.style.removeProperty('--reveal-delay');
      });
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('is-visible');
          revealObserver?.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      },
    );

    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    revealItems.forEach((item, index) => {
      item.dataset.revealReady = 'true';
      item.style.setProperty(
        '--reveal-delay',
        `${Math.min(index * 40, 160)}ms`,
      );
      const shouldStartVisible =
        item.getBoundingClientRect().top < viewportHeight * 0.92;
      item.classList.toggle('is-visible', shouldStartVisible);
      if (!shouldStartVisible) {
        revealObserver?.observe(item);
      }
    });
  };

  const bootPageEnhancements = () => {
    document.documentElement.classList.add('js-enhanced');
    bindHeaderOffsetTracking();
    initReveals();
  };

  window.addEventListener('resize', scheduleScrollOffsetToken, {
    passive: true,
  });

  bootPageEnhancements();
  document.addEventListener('astro:page-load', bootPageEnhancements);
  document.addEventListener('astro:before-swap', () => {
    clearRevealObserver();
    clearHeaderResizeObserver();
  });
};
