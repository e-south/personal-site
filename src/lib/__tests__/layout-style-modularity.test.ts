/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/layout-style-modularity.test.ts

Enforces modular layout style imports to keep concerns decoupled.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('layout style modularity', () => {
  it('keeps layout.css as a style import hub for decoupled concerns', async () => {
    const layoutStyles = await read('src/styles/layout.css');

    expect(layoutStyles).toContain("@import './layout/tokens.css';");
    expect(layoutStyles).toContain("@import './layout/base.css';");
    expect(layoutStyles).toContain("@import './layout/header-effects.css';");
    expect(layoutStyles).toContain(
      "@import './layout/page-header-palette.css';",
    );
    expect(layoutStyles).toContain("@import './layout/effects.css';");
    expect(layoutStyles).toContain("@import './layout/dividers.css';");
  });
});
