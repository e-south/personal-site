/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/refactor-architecture.test.ts

Locks refactor boundaries for modular home, layout, and project carousel logic.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('home runtime modularization', () => {
  it('delegates hero and story video logic from home orchestrator', async () => {
    const home = await read('src/lib/home.ts');

    expect(home).toContain(
      "import { initHeroRotator } from '@/lib/home/heroRotator';",
    );
    expect(home).toContain(
      "import { initStoryVideos } from '@/lib/home/storyVideos';",
    );
    expect(home).toContain('initHeroRotator({');
    expect(home).toContain('initStoryVideos({');
  });

  it('extracts hero rotator and story video modules', async () => {
    const heroRotator = await read('src/lib/home/heroRotator.ts');
    const storyVideos = await read('src/lib/home/storyVideos.ts');

    expect(heroRotator).toContain('export const initHeroRotator =');
    expect(heroRotator).toContain('Home hero rotator root is missing.');
    expect(storyVideos).toContain('export const initStoryVideos =');
    expect(storyVideos).toContain('story:video-check');
  });
});

describe('layout enhancement modularization', () => {
  it('uses shared layout enhancement binder from layout file', async () => {
    const layout = await read('src/layouts/Layout.astro');

    expect(layout).toContain(
      "import { bindLayoutEnhancements } from '@/lib/layout/pageEnhancements';",
    );
    expect(layout).toContain('bindLayoutEnhancements();');
  });

  it('keeps reveal and scroll-offset logic in dedicated helper module', async () => {
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');

    expect(enhancements).toContain('const setScrollOffsetToken = () =>');
    expect(enhancements).toContain('const initReveals = () =>');
    expect(enhancements).toContain(
      'export const bindLayoutEnhancements = () =>',
    );
  });
});

describe('project carousel helper extraction', () => {
  it('uses shared project carousel geometry helpers from component script', async () => {
    const carousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(carousel).toContain(
      "import { getTrackMaxScrollLeftFromTrack } from '@/lib/projectCarousel';",
    );
    expect(carousel).toContain('getTrackMaxScrollLeftFromTrack(track)');
  });

  it('defines reusable project carousel geometry helpers', async () => {
    const helpers = await read('src/lib/projectCarousel.ts');

    expect(helpers).toContain(
      'export const getTrackMaxScrollLeftFromTrack = (',
    );
    expect(helpers).toContain(
      'export const getTrackScrollPaddingInlineStart = (',
    );
    expect(helpers).toContain('export const getPanelTargetLeft = (');
  });
});
