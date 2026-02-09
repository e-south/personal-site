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
  it('keeps only the two core variable font imports', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const packageJson = await read('package.json');
    const tailwind = await read('tailwind.config.mjs');

    expect(layout).toContain("import '@fontsource-variable/manrope';");
    expect(layout).toContain("import '@fontsource-variable/source-serif-4';");
    expect(layout).not.toContain("import '@fontsource-variable/fraunces';");
    expect(layout).not.toContain(
      "import '@fontsource-variable/jetbrains-mono';",
    );

    expect(packageJson).not.toContain('"@fontsource-variable/fraunces"');
    expect(packageJson).not.toContain('"@fontsource-variable/jetbrains-mono"');

    expect(tailwind).toContain(
      "sans: ['Manrope Variable', 'system-ui', 'sans-serif']",
    );
    expect(tailwind).toContain(
      "display: ['Source Serif 4 Variable', 'ui-serif', 'serif']",
    );
    expect(tailwind).toContain(
      "serif: ['Source Serif 4 Variable', 'ui-serif', 'serif']",
    );
    expect(tailwind).toContain("mono: ['ui-monospace', 'monospace']");
  });

  it('uses serif only for major headings while keeping nav controls sans', async () => {
    const settings = await read('src/settings.ts');
    const layout = await read('src/layouts/Layout.astro');
    const navLink = await read('src/components/ui/NavLink.astro');
    const navbar = await read('src/components/ui/Navbar.astro');
    const prose = await read('src/components/ui/Prose.astro');

    expect(settings).toContain("bodyFont: 'sans'");
    expect(settings).toContain("displayFont: 'serif'");
    expect(settings).toContain("proseFont: 'sans'");

    expect(layout).toContain('[&_h1]:font-serif');
    expect(layout).toContain('[&_h2]:font-serif');
    expect(layout).toContain('[&_h3]:font-sans');
    expect(layout).toContain('[&_h4]:font-sans');

    expect(prose).toContain('prose-h1:font-serif');
    expect(prose).toContain('prose-h2:font-serif');
    expect(prose).toContain('prose-h3:font-sans');

    expect(navLink).toContain('font-sans');
    expect(navLink).not.toContain('font-display');
    expect(navbar).not.toContain('font-display');
    expect(navbar).toContain('font-sans text-lg');
  });
});
