/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/storyVideos-lazy-source.test.ts

Validates lazy story video source attachment and IO-first playback control.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('story videos lazy source contract', () => {
  it('defers source attachment until needed and avoids always-on autoplay markup', async () => {
    const runtime = await read('src/lib/home/storyVideos.ts');
    const mediaLeaf = await read('src/components/home/StoryMediaLeaf.astro');

    expect(mediaLeaf).toContain('data-story-video-src={item.src}');
    expect(mediaLeaf).not.toContain(
      '<source src={item.src} type="video/mp4" />',
    );
    expect(mediaLeaf).toContain('preload="none"');
    expect(mediaLeaf).not.toContain('autoplay');

    expect(runtime).toContain(
      'const attachSourceIfNeeded = (video: HTMLVideoElement) => {',
    );
    expect(runtime).toContain(
      "const sourceUrl = video.dataset.storyVideoSrc ?? '';",
    );
    expect(runtime).toContain("source.type = 'video/mp4';");
    expect(runtime).toContain(
      'visibilityByVideo.set(entry.target, entry.intersectionRatio);',
    );
    expect(runtime).toContain(
      'const getKnownVisibilityRatio = (video: HTMLVideoElement) => {',
    );
  });
});
