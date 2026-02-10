import { describe, expect, it } from 'vitest';

import { isHighlightedAuthor, parseAuthor } from '../utils';

describe('parseAuthor', () => {
  it('parses trailing asterisk markers as co-first flag', () => {
    expect(parseAuthor('Jane Doe*')).toEqual({
      name: 'Jane Doe',
      hasAsterisk: true,
    });
  });

  it('trims whitespace and preserves names without markers', () => {
    expect(parseAuthor('  John Smith  ')).toEqual({
      name: 'John Smith',
      hasAsterisk: false,
    });
  });
});

describe('isHighlightedAuthor', () => {
  it('matches highlighted names when content author includes trailing marker', () => {
    expect(isHighlightedAuthor('Eric J. South*', 'Eric J. South')).toBe(true);
  });

  it('does not match different authors', () => {
    expect(isHighlightedAuthor('Jane Doe', 'Eric J. South')).toBe(false);
  });
});
