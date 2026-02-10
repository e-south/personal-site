/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/pageEnhancements.ts

Binds layout-level reveal and sticky-header scroll offset behavior.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { bindHeaderNucleotideEdge } from '@/lib/layout/nucleotideEdge';
import { bindMobileHeaderVisibility } from '@/lib/layout/mobileHeaderVisibility';
import { createRevealEffectsController } from '@/lib/layout/revealEffects';
import { createScrollOffsetTracker } from '@/lib/layout/scrollOffsetTracker';

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

  const revealEffects = createRevealEffectsController();
  const scrollOffsetTracker = createScrollOffsetTracker();
  let clearHeaderNucleotideEdge: (() => void) | null = null;
  let clearMobileHeaderVisibility: (() => void) | null = null;

  const bootPageEnhancements = () => {
    document.documentElement.classList.add('js-enhanced');
    clearHeaderNucleotideEdge?.();
    clearHeaderNucleotideEdge = bindHeaderNucleotideEdge();
    clearMobileHeaderVisibility?.();
    clearMobileHeaderVisibility = bindMobileHeaderVisibility();
    scrollOffsetTracker.bindHeaderOffsetTracking();
    revealEffects.initReveals();
  };

  window.addEventListener(
    'resize',
    scrollOffsetTracker.scheduleScrollOffsetToken,
    {
      passive: true,
    },
  );

  bootPageEnhancements();
  document.addEventListener('astro:page-load', bootPageEnhancements);
  document.addEventListener('astro:before-swap', () => {
    revealEffects.clearRevealObserver();
    scrollOffsetTracker.teardown();
    clearHeaderNucleotideEdge?.();
    clearHeaderNucleotideEdge = null;
    clearMobileHeaderVisibility?.();
    clearMobileHeaderVisibility = null;
  });
};
