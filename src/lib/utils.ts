import { template } from '../settings';

const normalizeAuthor = (author: string) => author.replace(/\*+$/, '').trim();

export const isHighlightedAuthor = (author: string, highlightName?: string) =>
  Boolean(
    highlightName && normalizeAuthor(author) === normalizeAuthor(highlightName),
  );

export function trimExcerpt(excerpt: string): string {
  const excerptLength = template.excerptLength;
  return excerpt.length > excerptLength
    ? `${excerpt.substring(0, excerptLength)}...`
    : excerpt;
}
