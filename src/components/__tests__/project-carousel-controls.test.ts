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

describe('ProjectCarousel controls', () => {
  it('renders minimal prev/next pills with hover lift and border accent', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

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
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('project-carousel-nav-layer');
    expect(contents).toContain('padding-top: clamp(2.4rem, 4.6vw, 3.6rem);');
    expect(contents).toContain('top: 50%;');
    expect(contents).toContain('transform: translateY(-50%);');
  });

  it('pre-expands carousel height before moving to longer narratives', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

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
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('let activeIndex = -1;');
    expect(contents).toContain(
      'const wrappedActiveIndex = wrapIndex(nextIndex);',
    );
    expect(contents).toContain('if (wrappedActiveIndex === activeIndex) {');
    expect(contents).toContain('disconnectActivePanelResizeObserver();');
  });

  it('uses a fluid, configurable height transition for project narrative resizing', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const contents = await readFile(filePath, 'utf-8');

    expect(contents).toContain('heightTransitionMs');
    expect(contents).toContain("'--project-carousel-height-transition-ms'");
    expect(contents).toContain(
      'height var(--project-carousel-height-transition-ms, 520ms)',
    );
    expect(contents).toContain(
      'var(--project-carousel-height-transition-ms, 520ms)',
    );
  });

  it('defers contraction until after horizontal movement when target narratives are shorter', async () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/projects/ProjectCarousel.astro',
    );
    const helperPath = path.resolve(
      process.cwd(),
      'src/lib/projectCarouselTransitions.ts',
    );
    const contents = await readFile(filePath, 'utf-8');
    const helperContents = await readFile(helperPath, 'utf-8');

    expect(contents).toContain('postContractAfterScroll');
    expect(helperContents).toContain('currentHeight - targetHeight');
    expect(contents).toContain(
      'executeIndexScroll(plan.wrappedTargetIndex, useQuickMotion, () => {',
    );
    expect(contents).toContain(
      'track.style.height = `${plan.targetHeight}px`;',
    );
  });
});
