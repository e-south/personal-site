import { profile } from '../settings';
import { template } from '../settings';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] ?? char;
  });

export function highlightAuthor(authors: string): string {
  const safeAuthors = escapeHtml(authors);
  const safeName = escapeHtml(profile.author_name);
  if (safeAuthors.includes(safeName)) {
    return safeAuthors.replace(
      safeName,
      `<span class='font-medium underline'>${safeName}</span>`,
    );
  }
  return safeAuthors;
}

export function trimExcerpt(excerpt: string): string {
  const excerptLength = template.excerptLength;
  return excerpt.length > excerptLength
    ? `${excerpt.substring(0, excerptLength)}...`
    : excerpt;
}
