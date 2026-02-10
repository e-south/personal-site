/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/project-carousel-controls.test.ts

Validates project carousel control markup.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('ProjectCarousel controls', () => {
  it('renders minimal prev/next pills with hover lift and border accent', async () => {
    const carouselStyles = await read('src/styles/project-carousel.css');
    const sideControl = await read(
      'src/components/projects/ProjectCarouselSideControl.astro',
    );

    expect(sideControl).not.toContain('project-carousel-button__cap');
    expect(sideControl).toContain('project-carousel-button__icon');
    expect(sideControl).toContain('project-carousel-button__label');
    expect(sideControl).toContain('project-carousel-button--next');
    expect(carouselStyles).toContain('--control-height: 1.95rem;');
    expect(carouselStyles).toContain('border: 0;');
    expect(carouselStyles).toContain('transform: translateY(-1px);');
    expect(carouselStyles).toContain('inset 0 0 0 1px');
  });

  it('offsets the initial nav control onset lower while keeping sticky centering', async () => {
    const contents = await read('src/styles/project-carousel.css');

    expect(contents).toContain('project-carousel-nav-layer');
    expect(contents).toContain('padding-top: clamp(2.4rem, 4.6vw, 3.6rem);');
    expect(contents).toContain('top: 50%;');
    expect(contents).toContain('transform: translateY(-50%);');
  });

  it('pre-expands carousel height before moving to longer narratives', async () => {
    const contents = await read('src/lib/projectCarouselRuntime.ts');
    const runtimeConfig = await read('src/lib/projectCarouselRuntimeConfig.ts');
    const transitionOrchestration = await read(
      'src/lib/projectCarouselTransitionOrchestration.ts',
    );
    const transitionTimers = await read(
      'src/lib/projectCarouselTransitionTimers.ts',
    );

    expect(contents).toContain(
      'const transitionPolicy = runtimeConfig.transitionPolicy;',
    );
    expect(runtimeConfig).toContain('preExpandDurationMs');
    expect(runtimeConfig).toContain('preExpandMinDeltaPx');
    expect(transitionOrchestration).toContain(
      'createCarouselHeightTransitionPlan({',
    );
    expect(transitionOrchestration).toContain('preExpandBeforeScroll');
    expect(transitionOrchestration).toContain('const runIndexTransition = (');
    expect(transitionOrchestration).toContain('targetIndex: number');
    expect(transitionOrchestration).toContain('useQuickMotion = false');
    expect(contents).not.toContain("transitionIntent = 'nearest'");
    expect(contents).toContain(
      'transitionTimers.schedulePendingPreScrollTimer(',
    );
    expect(transitionTimers).toContain(
      'const schedulePendingPreScrollTimer = (',
    );
  });

  it('guards against stale observer and duplicate index updates during pre-expand transitions', async () => {
    const contents = await read('src/lib/projectCarouselRuntime.ts');

    expect(contents).toContain('let activeIndex = -1;');
    expect(contents).toContain(
      'const wrappedActiveIndex = wrapIndex(nextIndex);',
    );
    expect(contents).toContain('if (wrappedActiveIndex === activeIndex) {');
    expect(contents).toContain('disconnectActivePanelResizeObserver();');
  });

  it('uses a fluid, configurable height transition for project narrative resizing', async () => {
    const projectCarouselStyles = await read('src/styles/project-carousel.css');
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain('heightTransitionMs');
    expect(runtime).toContain("'--project-carousel-height-transition-ms'");
    expect(projectCarouselStyles).toContain(
      'height var(--project-carousel-height-transition-ms, 520ms)',
    );
    expect(projectCarouselStyles).toContain(
      'var(--project-carousel-height-transition-ms, 520ms)',
    );
  });

  it('defers contraction until after horizontal movement when target narratives are shorter', async () => {
    const transitionOrchestration = await read(
      'src/lib/projectCarouselTransitionOrchestration.ts',
    );
    const helperContents = await read('src/lib/projectCarouselTransitions.ts');

    expect(transitionOrchestration).toContain('postContractAfterScroll');
    expect(helperContents).toContain('currentHeight - targetHeight');
    expect(transitionOrchestration).toContain(
      'executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion, () => {',
    );
    expect(transitionOrchestration).toContain(
      'track.style.height = `${plan.targetHeight}px`;',
    );
  });
});
