const AUTHOR_MARKER_PATTERN = /\*+$/;

const normalizeAuthor = (author: string) =>
  author.replace(AUTHOR_MARKER_PATTERN, '').trim();

export const parseAuthor = (author: string) => {
  const trimmed = author.trim();
  return {
    name: normalizeAuthor(trimmed),
    hasAsterisk: AUTHOR_MARKER_PATTERN.test(trimmed),
  };
};

export const isHighlightedAuthor = (author: string, highlightName?: string) =>
  Boolean(
    highlightName && normalizeAuthor(author) === normalizeAuthor(highlightName),
  );

export function trimExcerpt(excerpt: string, maxLength: number): string {
  return excerpt.length > maxLength
    ? `${excerpt.substring(0, maxLength)}...`
    : excerpt;
}
