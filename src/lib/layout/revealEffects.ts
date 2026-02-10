/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/revealEffects.ts

Builds and manages reveal-on-scroll effects for layout-level content blocks.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

export const createRevealEffectsController = () => {
  let revealObserver: IntersectionObserver | null = null;

  const clearRevealObserver = () => {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
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

  return {
    clearRevealObserver,
    initReveals,
  };
};
