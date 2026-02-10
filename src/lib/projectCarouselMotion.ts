/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselMotion.ts

Provides reusable quick-scroll motion primitives for project carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type AnimationFrameStore = {
  read: () => number | null;
  write: (frameId: number | null) => void;
};

type QuickTrackScrollOptions = {
  track: HTMLElement;
  targetLeft: number;
  durationMs: number;
  ease: (value: number) => number;
  frameStore: AnimationFrameStore;
  onComplete?: (() => void) | null;
};

type QuickWindowScrollOptions = {
  targetTop: number;
  durationMs: number;
  ease: (value: number) => number;
  frameStore: AnimationFrameStore;
};

const cancelActiveFrame = ({ read, write }: AnimationFrameStore) => {
  const frameId = read();
  if (frameId === null) {
    return;
  }
  window.cancelAnimationFrame(frameId);
  write(null);
};

export const runQuickTrackScroll = ({
  track,
  targetLeft,
  durationMs,
  ease,
  frameStore,
  onComplete = null,
}: QuickTrackScrollOptions) => {
  cancelActiveFrame(frameStore);

  const startLeft = track.scrollLeft;
  const distance = targetLeft - startLeft;
  if (Math.abs(distance) < 1) {
    track.scrollLeft = targetLeft;
    if (typeof onComplete === 'function') {
      onComplete();
    }
    return;
  }

  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = ease(progress);
    track.scrollLeft = startLeft + distance * eased;

    if (progress < 1) {
      frameStore.write(window.requestAnimationFrame(step));
      return;
    }

    frameStore.write(null);
    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  frameStore.write(window.requestAnimationFrame(step));
};

export const runQuickWindowScroll = ({
  targetTop,
  durationMs,
  ease,
  frameStore,
}: QuickWindowScrollOptions) => {
  cancelActiveFrame(frameStore);

  const startTop = window.scrollY;
  const distance = targetTop - startTop;
  if (Math.abs(distance) < 1) {
    window.scrollTo({
      top: targetTop,
      behavior: 'auto',
    });
    return;
  }

  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / durationMs);
    const eased = ease(progress);
    window.scrollTo({
      top: startTop + distance * eased,
      behavior: 'auto',
    });

    if (progress < 1) {
      frameStore.write(window.requestAnimationFrame(step));
      return;
    }

    frameStore.write(null);
  };

  frameStore.write(window.requestAnimationFrame(step));
};
