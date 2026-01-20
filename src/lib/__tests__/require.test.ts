import { describe, expect, it } from 'vitest';

import { requireEntry, requireValue } from '../require';

describe('requireEntry', () => {
  it('returns the entry when present', () => {
    expect(requireEntry({ ok: true }, 'test/entry')).toEqual({ ok: true });
  });

  it('throws when the entry is missing', () => {
    expect(() => requireEntry(undefined, 'test/entry')).toThrow(
      'Missing content entry: test/entry.',
    );
  });
});

describe('requireValue', () => {
  it('returns the value when present', () => {
    expect(requireValue('value', 'test/value')).toBe('value');
  });

  it('throws when the value is empty', () => {
    expect(() => requireValue('', 'test/value')).toThrow(
      'Missing required value: test/value.',
    );
  });
});
