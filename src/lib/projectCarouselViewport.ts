/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselViewport.ts

Controls projects carousel viewport alignment and post-scroll correction behavior.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type CreateProjectCarouselViewportControllerOptions = {
  getTargetTop: () => number;
  getBehavior: () => 'auto' | 'smooth';
  prefersReducedMotion: MediaQueryList;
  quickCorrectionDelayMs: number;
  correctionThresholdPx: number;
  quickScrollWindowTo: (targetTop: number) => void;
  stopWindowQuickScroll: () => void;
};

export const createProjectCarouselViewportController = ({
  getTargetTop,
  getBehavior,
  prefersReducedMotion,
  quickCorrectionDelayMs,
  correctionThresholdPx,
  quickScrollWindowTo,
  stopWindowQuickScroll,
}: CreateProjectCarouselViewportControllerOptions) => {
  let verticalCorrectionTimer: number | null = null;

  const clearVerticalCorrectionTimer = () => {
    if (verticalCorrectionTimer !== null) {
      window.clearTimeout(verticalCorrectionTimer);
      verticalCorrectionTimer = null;
    }
  };

  const correctCarouselVerticalOffset = (useQuickMotion = false) => {
    const targetTop = getTargetTop();
    const delta = targetTop - window.scrollY;
    if (Math.abs(delta) < correctionThresholdPx) {
      return;
    }
    if (useQuickMotion && !prefersReducedMotion.matches) {
      quickScrollWindowTo(targetTop);
      return;
    }
    window.scrollTo({
      top: targetTop,
      behavior: getBehavior(),
    });
  };

  const scrollCarouselIntoView = (useQuickMotion = false) => {
    clearVerticalCorrectionTimer();
    const targetTop = getTargetTop();
    if (useQuickMotion && !prefersReducedMotion.matches) {
      quickScrollWindowTo(targetTop);
      verticalCorrectionTimer = window.setTimeout(() => {
        verticalCorrectionTimer = null;
        correctCarouselVerticalOffset(true);
      }, quickCorrectionDelayMs);
      return;
    }
    stopWindowQuickScroll();
    window.scrollTo({
      top: targetTop,
      behavior: getBehavior(),
    });
    if (getBehavior() === 'smooth') {
      verticalCorrectionTimer = window.setTimeout(() => {
        verticalCorrectionTimer = null;
        correctCarouselVerticalOffset(false);
      }, quickCorrectionDelayMs);
      return;
    }
    correctCarouselVerticalOffset(false);
  };

  return {
    clearVerticalCorrectionTimer,
    scrollCarouselIntoView,
  };
};
