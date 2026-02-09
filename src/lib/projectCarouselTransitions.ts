/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselTransitions.ts

Provides reusable transition planning helpers for project carousel runtime logic.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

export type CarouselTransitionMode = 'near' | 'long' | 'wrap';
export type CarouselIndexTransitionResult = 'same' | CarouselTransitionMode;

export type CarouselHeightTransitionPlan = {
  wrappedTargetIndex: number;
  targetHeight: number;
  preExpandBeforeScroll: boolean;
  postContractAfterScroll: boolean;
  preExpandDurationMs: number;
};

type GetCarouselTransitionModeOptions = {
  fromIndex: number;
  toIndex: number;
  total: number;
  longJumpThreshold: number;
};

type CreateCarouselHeightTransitionPlanOptions = {
  targetIndex: number;
  currentIndex: number;
  total: number;
  preExpandMinDeltaPx: number;
  preExpandDurationMs: number;
  getCurrentHeight: (wrappedCurrentIndex: number) => number;
  getTargetHeight: (wrappedTargetIndex: number) => number;
};

const assertPositiveTotal = (total: number) => {
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error('[projects-carousel] Panel count is invalid.');
  }
};

export const wrapCarouselIndex = (index: number, total: number) => {
  assertPositiveTotal(total);
  return ((index % total) + total) % total;
};

export const parseRequiredCarouselIndex = (
  value: string | number | undefined,
  errorMessage: string,
): number => {
  const index = Number(value);
  if (!Number.isInteger(index)) {
    throw new Error(errorMessage);
  }
  return index;
};

export const getCarouselJumpDistance = (
  fromIndex: number,
  toIndex: number,
  total: number,
) => {
  const wrappedFrom = wrapCarouselIndex(fromIndex, total);
  const wrappedTo = wrapCarouselIndex(toIndex, total);
  const rawDistance = Math.abs(wrappedTo - wrappedFrom);
  return Math.min(rawDistance, total - rawDistance);
};

export const getCarouselTransitionMode = ({
  fromIndex,
  toIndex,
  total,
  longJumpThreshold,
}: GetCarouselTransitionModeOptions): CarouselTransitionMode => {
  if (!Number.isInteger(fromIndex) || fromIndex < 0) {
    return 'near';
  }
  const jumpDistance = getCarouselJumpDistance(fromIndex, toIndex, total);
  return jumpDistance >= longJumpThreshold ? 'long' : 'near';
};

export const createCarouselHeightTransitionPlan = ({
  targetIndex,
  currentIndex,
  total,
  preExpandMinDeltaPx,
  preExpandDurationMs,
  getCurrentHeight,
  getTargetHeight,
}: CreateCarouselHeightTransitionPlanOptions): CarouselHeightTransitionPlan => {
  const wrappedTargetIndex = wrapCarouselIndex(targetIndex, total);
  const wrappedCurrentIndex = wrapCarouselIndex(currentIndex, total);
  const currentHeight = getCurrentHeight(wrappedCurrentIndex);
  const targetHeight = getTargetHeight(wrappedTargetIndex);
  const preExpandBeforeScroll =
    targetHeight - currentHeight >= preExpandMinDeltaPx;
  const postContractAfterScroll =
    currentHeight - targetHeight >= preExpandMinDeltaPx;
  return {
    wrappedTargetIndex,
    targetHeight,
    preExpandBeforeScroll,
    postContractAfterScroll,
    preExpandDurationMs: preExpandBeforeScroll ? preExpandDurationMs : 0,
  };
};
