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
    const contents = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(contents).not.toContain('project-carousel-button__cap');
    expect(contents).toContain('project-carousel-button__icon');
    expect(contents).toContain('project-carousel-button__label');
    expect(contents).toContain('project-carousel-button--next');
    expect(contents).toContain('--control-height: 1.95rem;');
    expect(contents).toContain('border: 0;');
    expect(contents).toContain('transform: translateY(-1px);');
    expect(contents).toContain('inset 0 0 0 1px');
  });

  it('offsets the initial nav control onset lower while keeping sticky centering', async () => {
    const contents = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(contents).toContain('project-carousel-nav-layer');
    expect(contents).toContain('padding-top: clamp(2.4rem, 4.6vw, 3.6rem);');
    expect(contents).toContain('top: 50%;');
    expect(contents).toContain('transform: translateY(-50%);');
  });

  it('pre-expands carousel height before moving to longer narratives', async () => {
    const contents = await read('src/lib/projectCarouselRuntime.ts');

    expect(contents).toContain('const transitionPolicy = {');
    expect(contents).toContain('preExpandDurationMs');
    expect(contents).toContain('preExpandMinDeltaPx');
    expect(contents).toContain('createCarouselHeightTransitionPlan({');
    expect(contents).toContain('preExpandBeforeScroll');
    expect(contents).toContain('const runIndexTransition = (');
    expect(contents).toContain('targetIndex: number');
    expect(contents).toContain('useQuickMotion = false');
    expect(contents).not.toContain("transitionIntent = 'nearest'");
    expect(contents).toContain('pendingPreScrollTimer = window.setTimeout');
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
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );
    const runtime = await read('src/lib/projectCarouselRuntime.ts');

    expect(runtime).toContain('heightTransitionMs');
    expect(runtime).toContain("'--project-carousel-height-transition-ms'");
    expect(projectCarousel).toContain(
      'height var(--project-carousel-height-transition-ms, 520ms)',
    );
    expect(projectCarousel).toContain(
      'var(--project-carousel-height-transition-ms, 520ms)',
    );
  });

  it('defers contraction until after horizontal movement when target narratives are shorter', async () => {
    const runtime = await read('src/lib/projectCarouselRuntime.ts');
    const helperContents = await read('src/lib/projectCarouselTransitions.ts');

    expect(runtime).toContain('postContractAfterScroll');
    expect(helperContents).toContain('currentHeight - targetHeight');
    expect(runtime).toContain(
      'executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion, () => {',
    );
    expect(runtime).toContain('track.style.height = `${plan.targetHeight}px`;');
  });
});
