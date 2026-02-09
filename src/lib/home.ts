/*
--------------------------------------------------------------------------------
personal-site
src/lib/home.ts

Handles interactive behavior for the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { initHeroRotator } from '@/lib/home/heroRotator';
import { initStoryCarousels } from '@/lib/home/storyCarousels';
import { initStoryNavigation } from '@/lib/home/storyNavigation';
import { initStoryVideos } from '@/lib/home/storyVideos';
import { STORY_VIDEO_CHECK_EVENT as VIDEO_CHECK_EVENT } from '@/lib/home/storyVideos';

const HERO_INTERVAL_MS = 6500;
const HERO_FADE_MS = 450;

let homeCleanup: (() => void) | null = null;

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
