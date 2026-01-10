import { describe, expect, it } from 'vitest';
import type { CollectionEntry } from 'astro:content';
import type { StoryMediaItem, StoryRegistry } from '../../data/storyMedia';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { buildStoryChapters, type RenderStoryEntry } from '../story';

const renderEntry: RenderStoryEntry = async () => ({
  Content: (() => null) as AstroComponentFactory,
});

const makeEntry = (slug: string): CollectionEntry<'story'> =>
  ({
    id: `story/${slug}`,
    slug,
    body: '',
    collection: 'story',
    data: {
      title: slug,
    },
  }) as CollectionEntry<'story'>;

const makeMediaById = (ids: string[]): Record<string, StoryMediaItem> =>
  Object.fromEntries(
    ids.map((id) => [
      id,
      {
        id,
        kind: 'image',
        image: {
          src: `/images/${id}.jpg`,
          width: 1000,
          height: 800,
          format: 'jpg',
        },
        alt: `${id} alt`,
        caption: `${id} caption`,
      },
    ]),
  );

const makeRegistry = (options: {
  order: string[];
  chapterMedia: Record<string, string[]>;
  mediaIds: string[];
}): StoryRegistry =>
  ({
    order: options.order,
    chapterMedia: options.chapterMedia,
    mediaById: makeMediaById(options.mediaIds),
  }) as unknown as StoryRegistry;

describe('buildStoryChapters', () => {
  it('orders chapters using the registry and maps media', async () => {
    const chapters = [makeEntry('second'), makeEntry('first')];
    const registry = makeRegistry({
      order: ['first', 'second'],
      chapterMedia: {
        first: ['a'],
        second: ['b'],
      },
      mediaIds: ['a', 'b'],
    });

    const result = await buildStoryChapters({
      chapters,
      registry,
      renderEntry,
    });

    expect(result.map((chapter) => chapter.id)).toEqual(['first', 'second']);
    expect(result[0].media[0].id).toBe('a');
  });

  it('throws when a registry chapter is missing', async () => {
    const chapters = [makeEntry('first')];
    const registry = makeRegistry({
      order: ['first', 'missing'],
      chapterMedia: {
        first: [],
        missing: [],
      },
      mediaIds: [],
    });

    await expect(
      buildStoryChapters({ chapters, registry, renderEntry }),
    ).rejects.toThrow('Story chapters missing for: missing');
  });

  it('throws when an entry is not registered', async () => {
    const chapters = [makeEntry('first'), makeEntry('extra')];
    const registry = makeRegistry({
      order: ['first'],
      chapterMedia: {
        first: [],
      },
      mediaIds: [],
    });

    await expect(
      buildStoryChapters({ chapters, registry, renderEntry }),
    ).rejects.toThrow('Story chapters not registered: extra');
  });

  it('throws on missing media reference', async () => {
    const chapters = [makeEntry('first')];
    const registry = makeRegistry({
      order: ['first'],
      chapterMedia: {
        first: ['missing'],
      },
      mediaIds: ['present'],
    });

    await expect(
      buildStoryChapters({ chapters, registry, renderEntry }),
    ).rejects.toThrow('Story media "missing" is missing');
  });
});
