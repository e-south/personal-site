import { describe, expect, it } from 'vitest';

import { updateCvFrontmatter } from '../update-cv';

describe('updateCvFrontmatter', () => {
  it('replaces an existing updated field', () => {
    const input = `---\ntitle: 'CV'\nupdated: '2020-01-01'\n---\n\nBody\n`;
    const output = updateCvFrontmatter(input, '2024-02-03');
    expect(output).toContain("updated: '2024-02-03'");
    expect(output).not.toContain("updated: '2020-01-01'");
  });

  it('inserts updated when missing', () => {
    const input = `---\ntitle: 'CV'\n---\n\nBody\n`;
    const output = updateCvFrontmatter(input, '2024-02-03');
    const expectedFrontmatter = `---\ntitle: 'CV'\nupdated: '2024-02-03'\n---`;
    expect(output.startsWith(expectedFrontmatter)).toBe(true);
  });
});
