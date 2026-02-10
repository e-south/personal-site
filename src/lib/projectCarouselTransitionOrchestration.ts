/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitionOrchestration.ts

Coordinates project carousel index transitions and height-change sequencing.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import type { CarouselIndexTransitionResult } from '@/lib/projectCarouselTransitions';
import {
  createCarouselHeightTransitionPlan,
  getCarouselTransitionMode,
  wrapCarouselIndex,
} from '@/lib/projectCarouselTransitions';

type ActiveIndexOptions = {
  syncHeight?: boolean;
  observeHeight?: boolean;
  force?: boolean;
};

type TransitionPolicy = {
  preExpandDurationMs: number;
  preExpandMinDeltaPx: number;
};

type ProjectCarouselTransitionOrchestrationOptions = {
  total: number;
  longJumpThreshold: number;
  transitionPolicy: TransitionPolicy;
  track: HTMLElement;
  resolveCurrentIndex: () => number;
  getCurrentPanelHeight: (wrappedCurrentIndex: number) => number;
  getTargetPanelHeight: (wrappedTargetIndex: number) => number;
  cancelCurrentTransition: () => void;
  setActiveIndex: (nextIndex: number, options?: ActiveIndexOptions) => void;
  executeIndexScroll: (
    nextIndex: number,
    useQuickMotion?: boolean,
    onComplete?: (() => void) | null,
  ) => void;
  runPreExpandedScroll: (
    nextIndex: number,
    useQuickMotion: boolean,
    delayMs: number,
  ) => void;
  runLongJumpTransition: (targetIndex: number, targetHeight: number) => void;
  disconnectActivePanelResizeObserver: () => void;
  stopTrackHeightSync: () => void;
};

export const createProjectCarouselTransitionOrchestration = ({
  total,
  longJumpThreshold,
  transitionPolicy,
  track,
  resolveCurrentIndex,
  getCurrentPanelHeight,
  getTargetPanelHeight,
  cancelCurrentTransition,
  setActiveIndex,
  executeIndexScroll,
  runPreExpandedScroll,
  runLongJumpTransition,
  disconnectActivePanelResizeObserver,
  stopTrackHeightSync,
}: ProjectCarouselTransitionOrchestrationOptions) => {
  const wrapIndex = (index: number) => wrapCarouselIndex(index, total);

  const runIndexTransition = (
    targetIndex: number,
    useQuickMotion = false,
  ): CarouselIndexTransitionResult => {
    cancelCurrentTransition();

    const originIndex = resolveCurrentIndex();
    const plan = createCarouselHeightTransitionPlan({
      targetIndex,
      currentIndex: originIndex,
      total,
      preExpandMinDeltaPx: transitionPolicy.preExpandMinDeltaPx,
      preExpandDurationMs: transitionPolicy.preExpandDurationMs,
      getCurrentHeight: getCurrentPanelHeight,
      getTargetHeight: getTargetPanelHeight,
    });
    if (plan.wrappedTargetIndex === originIndex) {
      setActiveIndex(originIndex, { force: true });
      return 'same';
    }

    const transitionMode = getCarouselTransitionMode({
      fromIndex: originIndex,
      toIndex: wrapIndex(plan.wrappedTargetIndex),
      total,
      longJumpThreshold,
    });
    if (transitionMode === 'long') {
      runLongJumpTransition(plan.wrappedTargetIndex, plan.targetHeight);
      return transitionMode;
    }

    disconnectActivePanelResizeObserver();
    stopTrackHeightSync();

    if (plan.preExpandBeforeScroll) {
      track.style.height = `${plan.targetHeight}px`;
      runPreExpandedScroll(
        plan.wrappedTargetIndex,
        useQuickMotion,
        plan.preExpandDurationMs,
      );
      return transitionMode;
    }

    if (plan.postContractAfterScroll) {
      executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion, () => {
        track.style.height = `${plan.targetHeight}px`;
      });
      return transitionMode;
    }

    track.style.height = `${plan.targetHeight}px`;
    executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion);
    return transitionMode;
  };

  return {
    runIndexTransition,
  };
};
