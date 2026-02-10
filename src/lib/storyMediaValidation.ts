/*
--------------------------------------------------------------------------------
personal-site
src/lib/storyMediaValidation.ts

Validates story chapter ordering, media mappings, and backing asset references.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type StoryMediaLeafDefinition = {
  id: string;
  kind: 'image' | 'video';
  assetPaths: string[];
  poster?: unknown;
};

type StoryMediaStackDefinition = {
  id: string;
  kind: 'stack';
  assetPaths: string[];
  items: StoryMediaDefinition[];
};

type StoryMediaDefinition =
  | StoryMediaLeafDefinition
  | StoryMediaStackDefinition;

type AssertStoryRegistryOptions<
  ChapterSlug extends string,
  MediaId extends string,
> = {
  chapterOrder: readonly ChapterSlug[];
  chapterMedia: Record<ChapterSlug, readonly MediaId[]>;
  mediaById: Record<MediaId, StoryMediaDefinition>;
  doesAssetExist: (path: string) => boolean;
};

const assertMediaDefinition = (
  item: StoryMediaDefinition,
  doesAssetExist: (path: string) => boolean,
) => {
  if (item.kind === 'stack') {
    if (item.items.length === 0) {
      throw new Error(`Story media "${item.id}" stack is empty.`);
    }

    const itemIds = new Set<string>();
    item.items.forEach((stackItem) => {
      if (itemIds.has(stackItem.id)) {
        throw new Error(`Story media "${item.id}" repeats items.`);
      }

      itemIds.add(stackItem.id);
      assertMediaDefinition(stackItem, doesAssetExist);
    });
  } else if (item.kind === 'video' && !item.poster) {
    throw new Error(`Story video "${item.id}" is missing a poster.`);
  }

  item.assetPaths.forEach((path) => {
    if (!doesAssetExist(path)) {
      throw new Error(`Story media "${item.id}" is missing asset "${path}".`);
    }
  });
};

export const assertStoryRegistry = <
  ChapterSlug extends string,
  MediaId extends string,
>({
  chapterOrder,
  chapterMedia,
  mediaById,
  doesAssetExist,
}: AssertStoryRegistryOptions<ChapterSlug, MediaId>) => {
  const chapterOrderSet = new Set(chapterOrder);
  if (chapterOrderSet.size !== chapterOrder.length) {
    throw new Error('Story chapter order contains duplicates.');
  }

  const missingChapterKeys = chapterOrder.filter(
    (slug) => !(slug in chapterMedia),
  );
  if (missingChapterKeys.length > 0) {
    throw new Error(
      `Story chapter media map is missing entries for: ${missingChapterKeys.join(
        ', ',
      )}.`,
    );
  }

  const extraChapterKeys = Object.keys(chapterMedia).filter(
    (slug) => !chapterOrderSet.has(slug as ChapterSlug),
  );
  if (extraChapterKeys.length > 0) {
    throw new Error(
      `Story chapter media map has unknown chapters: ${extraChapterKeys.join(', ')}.`,
    );
  }

  (Object.entries(chapterMedia) as [ChapterSlug, readonly MediaId[]][]).forEach(
    ([slug, mediaIds]) => {
      const mediaSet = new Set(mediaIds);
      if (mediaSet.size !== mediaIds.length) {
        throw new Error(`Story chapter "${slug}" repeats media IDs.`);
      }

      mediaIds.forEach((id) => {
        if (!(id in mediaById)) {
          throw new Error(`Story media "${id}" is missing.`);
        }
      });
    },
  );

  (Object.values(mediaById) as StoryMediaDefinition[]).forEach((item) => {
    assertMediaDefinition(item, doesAssetExist);
  });
};
