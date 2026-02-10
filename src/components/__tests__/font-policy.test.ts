/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/font-policy.test.ts

Validates typography policy for editorial headings and sans UI controls.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Typography policy contract', () => {
  it('keeps the core variable font imports', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const packageJson = await read('package.json');
    const tailwind = await read('tailwind.config.mjs');

    expect(layout).toContain("import '@/styles/fonts.css';");
    expect(layout).not.toContain("import '@fontsource-variable/inter';");
    expect(layout).not.toContain("import '@fontsource-variable/fraunces';");
    expect(layout).not.toContain(
      "import '@fontsource-variable/jetbrains-mono';",
    );

    expect(packageJson).not.toContain('"@fontsource-variable/inter"');
    expect(packageJson).toContain('"@fontsource-variable/plus-jakarta-sans"');
    expect(packageJson).not.toContain('"@fontsource-variable/fraunces"');
    expect(packageJson).not.toContain('"@fontsource-variable/jetbrains-mono"');

    expect(tailwind).toContain(
      "sans: ['Manrope Variable', 'system-ui', 'sans-serif']",
    );
    expect(tailwind).toContain(
      "header: ['Plus Jakarta Sans Variable', 'system-ui', 'sans-serif']",
    );
    expect(tailwind).not.toContain('inter: [');
    expect(tailwind).toContain(
      "display: ['Source Serif 4 Variable', 'ui-serif', 'serif']",
    );
    expect(tailwind).toContain(
      "serif: ['Source Serif 4 Variable', 'ui-serif', 'serif']",
    );
    expect(tailwind).toContain("mono: ['ui-monospace', 'monospace']");
  });

  it('uses non-bold top-banner typography while keeping active links strongly emboldened only', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const headingTypography = await read('src/lib/layout/headingTypography.ts');
    const navLink = await read('src/components/ui/NavLink.astro');
    const navbar = await read('src/components/ui/Navbar.astro');
    const prose = await read('src/components/ui/Prose.astro');

    expect(layout).toContain('headingTypographyClasses');
    expect(headingTypography).toContain('[&_h1]:font-header');
    expect(headingTypography).toContain('[&_h2]:font-header');
    expect(headingTypography).toContain('[&_h3]:font-header');
    expect(headingTypography).toContain('[&_h4]:font-header');
    expect(headingTypography).toContain('[&_h1]:font-bold');
    expect(headingTypography).toContain('[&_h2]:font-bold');
    expect(headingTypography).toContain('[&_h3]:font-bold');
    expect(headingTypography).toContain('[&_h4]:font-bold');

    expect(prose).toContain('prose-headings:font-header');
    expect(prose).toContain('prose-headings:font-bold');

    expect(navLink).toContain('font-header');
    expect(navLink).toContain('font-medium');
    expect(navLink).toContain(
      "const activeClasses = 'text-base-content font-extrabold';",
    );
    expect(navLink).toContain(".nav-pill[data-nav-active='false']:hover");
    expect(navLink).toContain('const normalizedBase = normalizePath(withBase(');
    expect(navLink).toContain('const stripBasePrefix = (path: string) => {');
    expect(navLink).toContain('data-nav-active={isActive ?');
    expect(navLink).toContain('font-variation-settings:');
    expect(navLink).toContain(
      'class:list={[baseClass, activeClasses, className]}',
    );
    expect(navLink).not.toContain('.nav-active {');
    expect(navbar).toContain('font-header text-lg');
  });
});
