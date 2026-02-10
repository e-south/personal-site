/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/home-runtime-loading.test.ts

Validates home runtime boot wiring without React client hydration.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('home runtime loading', () => {
  it('boots home runtime from an Astro script instead of a React island', async () => {
    const indexPage = await read('src/pages/index.astro');
    const homeModule = await read('src/lib/home.ts');

    expect(indexPage).toContain("import { initHomePage } from '@/lib/home';");
    expect(indexPage).toContain('initHomePage();');
    expect(indexPage).not.toContain('HomeController');
    expect(indexPage).not.toContain('client:load');
    expect(homeModule).toContain('export const initHomePage = () => {');
  });
});
