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
  it('keeps the core variable font imports, including Inter for heavy headings and banner text', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const packageJson = await read('package.json');
    const tailwind = await read('tailwind.config.mjs');

    expect(layout).toContain("import '@fontsource-variable/manrope';");
    expect(layout).toContain("import '@fontsource-variable/source-serif-4';");
    expect(layout).toContain("import '@fontsource-variable/inter';");
    expect(layout).not.toContain("import '@fontsource-variable/fraunces';");
    expect(layout).not.toContain(
      "import '@fontsource-variable/jetbrains-mono';",
    );

    expect(packageJson).toContain('"@fontsource-variable/inter"');
    expect(packageJson).not.toContain('"@fontsource-variable/fraunces"');
    expect(packageJson).not.toContain('"@fontsource-variable/jetbrains-mono"');

    expect(tailwind).toContain(
      "sans: ['Manrope Variable', 'system-ui', 'sans-serif']",
    );
    expect(tailwind).toContain(
      "inter: ['Inter Variable', 'system-ui', 'sans-serif']",
    );
    expect(tailwind).toContain(
      "display: ['Source Serif 4 Variable', 'ui-serif', 'serif']",
    );
    expect(tailwind).toContain(
      "serif: ['Source Serif 4 Variable', 'ui-serif', 'serif']",
    );
    expect(tailwind).toContain("mono: ['ui-monospace', 'monospace']");
  });

  it('uses heavy Inter for top banner controls and headers throughout the site', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const headingTypography = await read('src/lib/layout/headingTypography.ts');
    const navLink = await read('src/components/ui/NavLink.astro');
    const navbar = await read('src/components/ui/Navbar.astro');
    const prose = await read('src/components/ui/Prose.astro');

    expect(layout).toContain('headingTypographyClasses');
    expect(headingTypography).toContain('[&_h1]:font-inter');
    expect(headingTypography).toContain('[&_h2]:font-inter');
    expect(headingTypography).toContain('[&_h3]:font-inter');
    expect(headingTypography).toContain('[&_h4]:font-inter');
    expect(headingTypography).toContain('[&_h1]:font-black');
    expect(headingTypography).toContain('[&_h2]:font-black');
    expect(headingTypography).toContain('[&_h3]:font-black');
    expect(headingTypography).toContain('[&_h4]:font-black');

    expect(prose).toContain('prose-headings:font-inter');
    expect(prose).toContain('prose-headings:font-black');

    expect(navLink).toContain('font-inter');
    expect(navLink).toContain('font-black');
    expect(navbar).toContain('font-inter text-lg');
  });
});
