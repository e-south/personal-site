/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/projects-page-separation.test.ts

Validates the visual separation and narrative sizing behavior on the projects page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Projects page section separation', () => {
  it('includes a visual divider between project cards and narratives', async () => {
    const projectsPage = await read('src/pages/projects.astro');

    expect(projectsPage).toContain('section-divider-line');
    expect(projectsPage).toContain(
      'class="section-divider-line" aria-hidden="true"',
    );
  });

  it('avoids fixed-height sizing that pads short narrative panels', async () => {
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );
    const projectCarouselStyles = await read('src/styles/project-carousel.css');
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const projectCarouselHeightSync = await read(
      'src/lib/projectCarouselHeightSync.ts',
    );
    const projectPanel = await read(
      'src/components/projects/ProjectPanel.astro',
    );

    expect(projectCarousel).not.toContain('min-height: 70vh;');
    expect(projectCarousel).not.toContain('min-height: 80vh;');
    expect(projectCarousel).not.toContain(
      'project-carousel-track glass-card h-full',
    );
    expect(projectCarouselStyles).toContain('align-items: start;');
    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselHeightSyncController',
    );
    expect(projectCarouselHeightSync).toContain(
      'track.style.height = `${nextHeight}px`;',
    );
    expect(projectCarouselRuntime).toContain(
      'heightSyncController.scheduleTrackHeightSync',
    );
    expect(projectPanel).not.toContain('h-full w-full min-w-full');
    expect(projectPanel).not.toContain('min-h-full');
    expect(projectPanel).not.toContain('height: 100%;');
    expect(projectPanel).not.toContain('overflow-y: auto;');
    expect(projectPanel).toContain('overflow: visible;');
  });
});
