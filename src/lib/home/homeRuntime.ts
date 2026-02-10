/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/homeRuntime.ts

Creates boot and teardown handlers for home page interactive runtime modules.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { initHeroRotator } from '@/lib/home/heroRotator';
import { initStoryCarousels } from '@/lib/home/storyCarousels';
import { initStoryNavigation } from '@/lib/home/storyNavigation';
import {
  initStoryVideos,
  STORY_VIDEO_CHECK_EVENT as VIDEO_CHECK_EVENT,
} from '@/lib/home/storyVideos';

const HERO_INTERVAL_MS = 6500;
const HERO_FADE_MS = 450;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getScrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

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
    registerCleanup(
      initStoryNavigation({
        prefersReducedMotion,
        getScrollBehavior,
        videoCheckEvent: VIDEO_CHECK_EVENT,
      }),
    );
    registerCleanup(initStoryCarousels({ getScrollBehavior }));
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

export const createHomeRuntime = () => {
  let homeCleanup: (() => void) | null = null;

  const teardown = () => {
    if (homeCleanup) {
      homeCleanup();
      homeCleanup = null;
    }
  };

  const boot = () => {
    teardown();
    homeCleanup = initHome();
  };

  return { boot, teardown };
};
