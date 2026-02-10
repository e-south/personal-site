/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/mobileHeaderVisibility.ts

Applies scroll-direction hide/reveal behavior to the sticky site header.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

const TOP_REVEAL_SCROLL_PX = 16;
const DIRECTION_THRESHOLD_PX = 6;

export const bindMobileHeaderVisibility = () => {
  const header = document.querySelector('[data-site-header]');
  if (!(header instanceof HTMLElement)) {
    return () => {};
  }

  let rafId: number | null = null;
  let disposed = false;
  let lastScrollY = window.scrollY;

  const applyVisibility = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY <= TOP_REVEAL_SCROLL_PX) {
      header.classList.toggle('site-header-mobile-hidden', false);
      lastScrollY = currentScrollY;
      return;
    }

    const delta = currentScrollY - lastScrollY;
    if (delta > DIRECTION_THRESHOLD_PX) {
      header.classList.toggle('site-header-mobile-hidden', true);
    } else if (delta < -DIRECTION_THRESHOLD_PX) {
      header.classList.toggle('site-header-mobile-hidden', false);
    }
    lastScrollY = currentScrollY;
  };

  const scheduleApplyVisibility = () => {
    if (rafId !== null || disposed) {
      return;
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      if (disposed) {
        return;
      }
      applyVisibility();
    });
  };

  window.addEventListener('scroll', scheduleApplyVisibility, {
    passive: true,
  });
  window.addEventListener('resize', scheduleApplyVisibility, {
    passive: true,
  });

  applyVisibility();

  return () => {
    disposed = true;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    header.classList.toggle('site-header-mobile-hidden', false);
    window.removeEventListener('scroll', scheduleApplyVisibility);
    window.removeEventListener('resize', scheduleApplyVisibility);
  };
};
