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

    expect(layout).toContain("import '@fontsource-variable/manrope';");
    expect(layout).toContain("import '@fontsource-variable/source-serif-4';");
    expect(layout).toContain("import '@fontsource-variable/inter';");
    expect(layout).toContain(
      "import '@fontsource-variable/plus-jakarta-sans';",
    );
    expect(layout).not.toContain("import '@fontsource-variable/fraunces';");
    expect(layout).not.toContain(
      "import '@fontsource-variable/jetbrains-mono';",
    );

    expect(packageJson).toContain('"@fontsource-variable/inter"');
    expect(packageJson).toContain('"@fontsource-variable/plus-jakarta-sans"');
    expect(packageJson).not.toContain('"@fontsource-variable/fraunces"');
    expect(packageJson).not.toContain('"@fontsource-variable/jetbrains-mono"');

    expect(tailwind).toContain(
      "sans: ['Manrope Variable', 'system-ui', 'sans-serif']",
    );
    expect(tailwind).toContain(
      "header: ['Plus Jakarta Sans Variable', 'system-ui', 'sans-serif']",
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

  it('uses heavy sans typography for top banner controls and headers throughout the site', async () => {
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
    expect(navLink).toContain('font-bold');
    expect(navbar).toContain('font-header text-lg');
  });
});
