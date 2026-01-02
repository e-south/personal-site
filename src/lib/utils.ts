const normalizeAuthor = (author: string) => author.replace(/\*+$/, '').trim();

export const isHighlightedAuthor = (author: string, highlightName?: string) =>
  Boolean(
    highlightName && normalizeAuthor(author) === normalizeAuthor(highlightName),
  );

export function trimExcerpt(excerpt: string, maxLength: number): string {
  return excerpt.length > maxLength
    ? `${excerpt.substring(0, maxLength)}...`
    : excerpt;
}
