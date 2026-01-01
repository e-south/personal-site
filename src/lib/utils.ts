import { profile } from '../settings';
import { template } from '../settings';

const normalizeAuthor = (author: string) => author.replace(/\*+$/, '').trim();

export const isHighlightedAuthor = (author: string) =>
  normalizeAuthor(author) === profile.author_name;

export function trimExcerpt(excerpt: string): string {
  const excerptLength = template.excerptLength;
  return excerpt.length > excerptLength
    ? `${excerpt.substring(0, excerptLength)}...`
    : excerpt;
}
