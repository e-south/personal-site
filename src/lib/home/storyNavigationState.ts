/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/storyNavigationState.ts

Manages snap and programmatic scroll state for home story navigation.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type StoryNavigationStateOptions = {
  html: HTMLElement;
  snapClass?: string;
  cancelAnimationFrame: (frameId: number) => void;
  clearTimeout: (timerId: number) => void;
  setTimeout: (callback: () => void, delayMs: number) => number;
};

export const createStoryNavigationState = ({
  html,
  snapClass = 'story-snap',
  cancelAnimationFrame,
  clearTimeout,
  setTimeout,
}: StoryNavigationStateOptions) => {
  let suppressSnap = false;
  let snapTimer: number | null = null;
  let activeScrollTarget: HTMLElement | null = null;
  let activeScrollFrame: number | null = null;

  const hasActiveScrollTarget = () => activeScrollTarget !== null;
  const isActiveScrollTarget = (target: HTMLElement) =>
    activeScrollTarget === target;
  const isSnapSuppressed = () => suppressSnap;

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

  const setActiveScrollFrame = (frameId: number | null) => {
    activeScrollFrame = frameId;
  };

  const clearActiveScroll = () => {
    if (activeScrollFrame !== null) {
      cancelAnimationFrame(activeScrollFrame);
      activeScrollFrame = null;
    }
    activeScrollTarget = null;
    applySnapState(false);
  };

  const clearSnapTimer = () => {
    if (snapTimer !== null) {
      clearTimeout(snapTimer);
      snapTimer = null;
    }
  };

  const restoreSnap = (isStoryInView: () => boolean) => {
    suppressSnap = false;
    applySnapState(isStoryInView());
  };

  const releaseScrollControl = () => {
    clearActiveScroll();
    suppressSnap = true;
    clearSnapTimer();
  };

  const cancelActiveScrollLock = () => {
    if (!activeScrollTarget) {
      return;
    }
    releaseScrollControl();
  };

  const beginProgrammaticScroll = (target: HTMLElement) => {
    clearActiveScroll();
    activeScrollTarget = target;
    suppressSnap = true;
    applySnapState(true);
    clearSnapTimer();
  };

  const scheduleSnapRestore = (restore: () => void, delayMs: number) => {
    clearSnapTimer();
    snapTimer = setTimeout(() => {
      snapTimer = null;
      restore();
    }, delayMs);
  };

  const cleanup = () => {
    clearActiveScroll();
    clearSnapTimer();
    applySnapState(false);
  };

  return {
    applySnapState,
    beginProgrammaticScroll,
    cancelActiveScrollLock,
    clearActiveScroll,
    cleanup,
    hasActiveScrollTarget,
    isActiveScrollTarget,
    isSnapSuppressed,
    restoreSnap,
    scheduleSnapRestore,
    setActiveScrollFrame,
  };
};
