import { describe, expect, it } from 'vitest';

import { formatDateRange, formatLongDate, parseISODate } from '../dates';

describe('parseISODate', () => {
  it('parses date-only values', () => {
    const date = parseISODate('2024-01-15');
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
  });

  it('throws on invalid dates', () => {
    expect(() => parseISODate('not-a-date')).toThrow('Invalid date');
  });
});

describe('formatDateRange', () => {
  it('formats open-ended ranges', () => {
    expect(formatDateRange('2024-01-15')).toBe('Jan 2024 - Present');
  });

  it('formats closed ranges', () => {
    expect(formatDateRange('2024-01-15', '2024-03-15')).toBe(
      'Jan 2024 - Mar 2024',
    );
  });
});

describe('formatLongDate', () => {
  it('formats long dates', () => {
    const date = new Date(Date.UTC(2024, 0, 15, 12));
    expect(formatLongDate(date)).toBe('January 15, 2024');
  });
});
