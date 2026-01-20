import type { CollectionEntry } from 'astro:content';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import type {
  StoryMediaItem,
  StoryRegistry,
  StoryChapterSlug,
} from '@/data/storyMedia';

export type StoryChapter = {
  id: string;
  title: string;
  order: number;
  ctaLabel?: string;
  ctaHref?: string;
  Content: AstroComponentFactory;
  media: StoryMediaItem[];
};

type RenderResult = { Content: AstroComponentFactory };
export type RenderStoryEntry = (
  entry: CollectionEntry<'story'>,
) => Promise<RenderResult>;

type BuildStoryChaptersOptions = {
  chapters: CollectionEntry<'story'>[];
  registry: StoryRegistry;
  renderEntry?: RenderStoryEntry;
};

const defaultRenderEntry: RenderStoryEntry = async (entry) => {
  const { render } = await import('astro:content');
  return render(entry) as Promise<RenderResult>;
};

export const buildStoryChapters = async ({
  chapters,
  registry,
  renderEntry = defaultRenderEntry,
}: BuildStoryChaptersOptions): Promise<StoryChapter[]> => {
  if (!Array.isArray(chapters) || chapters.length === 0) {
    throw new Error('Story chapters are missing.');
  }
  if (!registry?.order?.length) {
    throw new Error('Story chapter order is missing.');
  }

  const entryMap = new Map<string, CollectionEntry<'story'>>();
  chapters.forEach((entry) => {
    if (!entry.slug) {
      throw new Error('Story chapter slug is missing.');
    }
    entryMap.set(entry.slug, entry);
  });

  const missingEntries = registry.order.filter((slug) => !entryMap.has(slug));
  if (missingEntries.length > 0) {
    throw new Error(
      `Story chapters missing for: ${missingEntries.join(', ')}.`,
    );
  }

  const extraEntries = chapters.filter(
    (entry) => !registry.order.includes(entry.slug as StoryChapterSlug),
  );
  if (extraEntries.length > 0) {
    throw new Error(
      `Story chapters not registered: ${extraEntries
        .map((entry) => entry.slug)
        .join(', ')}.`,
    );
  }

  const chapterItems = await Promise.all(
    registry.order.map(async (slug) => {
      const entry = entryMap.get(slug);
      if (!entry) {
        throw new Error(`Story chapter "${slug}" is missing.`);
      }
      const { Content } = await renderEntry(entry);
      if (!(slug in registry.chapterMedia)) {
        throw new Error(`Story chapter "${slug}" has no media mapping.`);
      }
      const mediaIds = registry.chapterMedia[slug] ?? [];
      const mediaItems = mediaIds.map((id) => {
        const item = registry.mediaById[id];
        if (!item) {
          throw new Error(`Story media "${id}" is missing.`);
        }
        if (item.kind === 'stack') {
          if (item.items.length === 0) {
            throw new Error(`Story media "${item.id}" stack is empty.`);
          }
          const itemIds = new Set<string>();
          item.items.forEach((stackItem) => {
            if (stackItem.kind === 'video' && !stackItem.poster) {
              throw new Error(
                `Story video "${stackItem.id}" is missing a poster.`,
              );
            }
            if (itemIds.has(stackItem.id)) {
              throw new Error(`Story media "${item.id}" repeats items.`);
            }
            itemIds.add(stackItem.id);
          });
        } else if (item.kind === 'video' && !item.poster) {
          throw new Error(`Story video "${item.id}" is missing a poster.`);
        }
        return item;
      });

      return {
        id: entry.slug,
        title: entry.data.title,
        order: registry.order.indexOf(slug) + 1,
        ctaLabel: entry.data.ctaLabel,
        ctaHref: entry.data.ctaHref,
        Content,
        media: mediaItems,
      };
    }),
  );

  return chapterItems;
};
