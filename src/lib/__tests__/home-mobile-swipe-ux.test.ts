/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/home-mobile-swipe-ux.test.ts

Validates mobile swipe behavior for home hero and story media carousels.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('home mobile swipe UX', () => {
  it('supports hero touch swipes and keeps dot state synced', async () => {
    const heroRotator = await read('src/lib/home/heroRotator.ts');
    const homePage = await read('src/pages/index.astro');

    expect(heroRotator).toContain('const MIN_SWIPE_X_PX =');
    expect(heroRotator).toContain("root.addEventListener('touchstart'");
    expect(heroRotator).toContain("root.addEventListener('touchend'");
    expect(heroRotator).toContain('const nextIndex = getWrappedIndex(');
    expect(heroRotator).toContain('showIndex(nextIndex, !reduceMotion);');
    expect(heroRotator).toContain('setActiveDot(index);');
    expect(heroRotator).toContain(
      'const preloadedIndices = new Set<number>();',
    );
    expect(heroRotator).toContain('const preloadIndex = (index: number) => {');
    expect(heroRotator).toContain(
      'const preloadNextFrom = (index: number) => {',
    );
    expect(heroRotator).not.toContain('items.forEach((item) => {');
    expect(homePage).toContain('[data-hero-rotator]');
    expect(homePage).toContain('touch-action: pan-y;');
  });

  it('snaps story carousel swipes to adjacent media with mobile-first full-asset viewport framing', async () => {
    const storyCarousels = await read('src/lib/home/storyCarousels.ts');
    const storyStyles = await read('src/styles/story-chapters.css');

    expect(storyCarousels).toContain('const MIN_SWIPE_X_PX =');
    expect(storyCarousels).toContain('const SCROLL_SETTLE_DELAY_MS = 120;');
    expect(storyCarousels).toContain("carousel.addEventListener('touchstart'");
    expect(storyCarousels).toContain("carousel.addEventListener('touchend'");
    expect(storyCarousels).toContain('let settleTimer: number | null = null;');
    expect(storyCarousels).toContain('const scheduleSettle = () => {');
    expect(storyCarousels).toContain('window.clearTimeout(settleTimer);');
    expect(storyCarousels).toContain(
      'scrollToIndex(getClosestIndexFromOffsets());',
    );
    expect(storyCarousels).toContain(
      'scrollToIndex(touchStartIndex + direction);',
    );
    expect(storyCarousels).toContain(
      'scrollToIndex(getClosestIndexFromOffsets());',
    );
    expect(storyStyles).toContain('scroll-snap-type: x mandatory;');
    expect(storyStyles).toContain('overscroll-behavior-x: contain;');
    expect(storyStyles).toContain('scrollbar-width: none;');
    expect(storyStyles).toContain('-ms-overflow-style: none;');
    expect(storyStyles).toContain('.story-carousel::-webkit-scrollbar {');
    expect(storyStyles).toContain('display: none;');
    expect(storyStyles).toContain('@media (max-width: 767px) {');
    expect(storyStyles).toContain(
      '--story-carousel-mobile-height: clamp(240px, 52vh, 420px);',
    );
    expect(storyStyles).toContain('.story-carousel-item .story-media-frame,');
    expect(storyStyles).toContain(
      'min-height: var(--story-carousel-mobile-height);',
    );
    expect(storyStyles).toContain('.story-carousel-controls {');
    expect(storyStyles).toContain('display: none;');
    expect(storyStyles).not.toContain('justify-content: space-between;');
  });
});
