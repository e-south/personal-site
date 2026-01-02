import { describe, expect, it } from 'vitest';

import { parseISODate } from '../dates';

describe('parseISODate', () => {
  it('parses date-only strings without timezone shifts', () => {
    const parsed = parseISODate('2024-02-03');
    expect(parsed.getFullYear()).toBe(2024);
    expect(parsed.getMonth()).toBe(1);
    expect(parsed.getDate()).toBe(3);
  });

  it('rejects invalid date-only strings', () => {
    expect(() => parseISODate('2024-02-31')).toThrow('Invalid date');
  });

  it('parses full ISO timestamps', () => {
    const parsed = parseISODate('2024-02-03T12:00:00Z');
    expect(Number.isNaN(parsed.getTime())).toBe(false);
  });
});
