import { describe, expect, it } from 'vitest';
import { getPanelIdFromHash, getPanelIdFromHref } from '../projectCarouselHash';

describe('project carousel hash helpers', () => {
  it('returns null for malformed encoded hashes', () => {
    expect(getPanelIdFromHash('#%')).toBeNull();
    expect(getPanelIdFromHash('#%E0%A4%A')).toBeNull();
  });

  it('returns null for malformed encoded hrefs', () => {
    expect(getPanelIdFromHref('#%')).toBeNull();
    expect(getPanelIdFromHref('#%E0%A4%A')).toBeNull();
  });

  it('decodes valid panel ids', () => {
    expect(getPanelIdFromHash('#project%2Falpha')).toBe('project/alpha');
    expect(getPanelIdFromHref('#project%2Falpha')).toBe('project/alpha');
  });
});
