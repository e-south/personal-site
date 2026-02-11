/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/mobile-header-scroll.test.ts

Validates that the top banner stays sticky and uses hide/reveal behavior across devices.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readStylesheetBundle } from '../../test/readStylesheetBundle';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Header scroll behavior', () => {
  it('keeps the top banner sticky and uses intent-gated reveal behavior across desktop and mobile', async () => {
    const navbar = await read('src/components/ui/Navbar.astro');
    const pageEnhancements = await read('src/lib/layout/pageEnhancements.ts');
    const mobileHeaderVisibility = await read(
      'src/lib/layout/mobileHeaderVisibility.ts',
    );
    const layoutStyles = await readStylesheetBundle('src/styles/layout.css');
    const stickyHeaderOffset = await read(
      'src/lib/layout/stickyHeaderOffset.ts',
    );

    expect(navbar).toContain('sticky top-0');
    expect(navbar).toContain('data-site-header');
    expect(navbar).not.toContain('md:sticky');
    expect(pageEnhancements).toContain(
      "import { bindMobileHeaderVisibility } from '@/lib/layout/mobileHeaderVisibility';",
    );
    expect(pageEnhancements).toContain('bindMobileHeaderVisibility();');
    expect(mobileHeaderVisibility).toContain(
      "window.addEventListener('scroll'",
    );
    expect(mobileHeaderVisibility).toContain(
      "window.addEventListener('resize'",
    );
    expect(mobileHeaderVisibility).toContain(
      "header.classList.toggle('site-header-mobile-hidden'",
    );
    expect(mobileHeaderVisibility).toContain('const FORCE_SHOW_NEAR_TOP_PX =');
    expect(mobileHeaderVisibility).toContain(
      'const DIRECTION_CHANGE_DEADBAND_PX =',
    );
    expect(mobileHeaderVisibility).toContain(
      'const UPWARD_DISTANCE_TO_SHOW_PX =',
    );
    expect(mobileHeaderVisibility).toContain('const UPWARD_TIME_TO_SHOW_MS =');
    expect(mobileHeaderVisibility).toContain(
      'const getInputProfile = (): InputProfile =>',
    );
    expect(mobileHeaderVisibility).toContain(
      'if (Math.abs(delta) < DIRECTION_CHANGE_DEADBAND_PX) {',
    );
    expect(mobileHeaderVisibility).toContain('upwardAccumulatedPx');
    expect(mobileHeaderVisibility).toContain('upwardStartTs');
    expect(mobileHeaderVisibility).not.toContain(
      'window.innerWidth >= MOBILE_BREAKPOINT_PX',
    );
    expect(mobileHeaderVisibility).toContain(
      'if (currentScrollY <= FORCE_SHOW_NEAR_TOP_PX) {',
    );
    expect(layoutStyles).toContain('.site-header-edge {');
    expect(layoutStyles).toContain(
      '.site-header-edge.site-header-mobile-hidden {',
    );
    expect(layoutStyles).toContain('position: sticky;');
    expect(layoutStyles).toContain('top: 0;');
    expect(layoutStyles).not.toContain(
      '.site-header-edge {\n  position: relative;',
    );
    expect(stickyHeaderOffset).toContain(
      "document.querySelector('[data-site-header]')",
    );
    expect(stickyHeaderOffset).toContain('export const isStickyHeader = (');
    expect(stickyHeaderOffset).toContain(
      'window.getComputedStyle(header).position',
    );
    expect(stickyHeaderOffset).toContain(
      'const headerHeight = isStickyHeader(',
    );
  });
});
