import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('story navigation scroll scheduling', () => {
  it('throttles scroll work through requestAnimationFrame', async () => {
    const source = await read('src/lib/home/storyNavigation.ts');

    expect(source).toContain('let scrollRafId: number | null = null;');
    expect(source).toContain('let viewportStateCache:');
    expect(source).toContain('const invalidateViewportStateCache = () => {');
    expect(source).toContain('window.requestAnimationFrame(() => {');
    expect(source).toContain('window.cancelAnimationFrame(scrollRafId);');
    expect(source).toContain('const settleOffset = getScrollOffset(target);');
    expect(source).not.toContain(
      'const currentOffset = getScrollOffset(target);',
    );
  });
});
