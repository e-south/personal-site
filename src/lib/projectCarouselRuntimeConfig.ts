/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselRuntimeConfig.ts

Provides timing and threshold configuration for the project carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type CreateProjectCarouselRuntimeConfigOptions = {
  prefersReducedMotion: boolean;
};

export type ProjectCarouselTransitionPolicy = {
  heightTransitionMs: number;
  preExpandDurationMs: number;
  preExpandMinDeltaPx: number;
};

export type ProjectCarouselRuntimeConfig = {
  heightSyncIntersectionRatio: number;
  quickScrollDurationMs: number;
  quickCorrectionDelayMs: number;
  correctionThresholdPx: number;
  longJumpThreshold: number;
  longJumpFadeOutMs: number;
  longJumpFadeInMs: number;
  transitionPolicy: ProjectCarouselTransitionPolicy;
};

export const createProjectCarouselRuntimeConfig = ({
  prefersReducedMotion,
}: CreateProjectCarouselRuntimeConfigOptions): ProjectCarouselRuntimeConfig => {
  return {
    heightSyncIntersectionRatio: 0.72,
    quickScrollDurationMs: 280,
    quickCorrectionDelayMs: 280 + 36,
    correctionThresholdPx: 10,
    longJumpThreshold: 2,
    longJumpFadeOutMs: prefersReducedMotion ? 0 : 120,
    longJumpFadeInMs: prefersReducedMotion ? 0 : 180,
    transitionPolicy: {
      heightTransitionMs: prefersReducedMotion ? 0 : 520,
      preExpandDurationMs: prefersReducedMotion ? 0 : 220,
      preExpandMinDeltaPx: 14,
    },
  };
};
