/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/navbar-nucleotide-edge.test.ts

Validates the top banner nucleotide edge styling and permutation contract.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { readStylesheetBundle } from '../../test/readStylesheetBundle';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Top banner nucleotide edge', () => {
  it('renders a contiguous nucleotide edge that mutates in place', async () => {
    const navbar = await read('src/components/ui/Navbar.astro');
    const navLink = await read('src/components/ui/NavLink.astro');
    const layoutStyles = await readStylesheetBundle('src/styles/layout.css');
    const nucleotideEdge = await read('src/lib/layout/nucleotideEdge.ts');
    const pageEnhancements = await read('src/lib/layout/pageEnhancements.ts');

    expect(navbar).toContain('site-header-edge');
    expect(navbar).toContain('data-site-header-edge');
    expect(navbar).not.toContain('border-b border-base-content/15');
    expect(navbar).toContain('site-header-external-divider');
    expect(navbar).not.toContain('md:border-l');
    expect(navbar).not.toContain('border-t border-base-content/10');
    expect(navLink).toContain(
      "const activeClasses = 'text-base-content font-extrabold';",
    );
    expect(navLink).toContain('nav-pill');
    expect(navLink).toContain(".nav-pill[data-nav-active='false']:hover");
    expect(navLink).not.toContain('nav-pill--active');
    expect(navLink).toContain('backdrop-filter:');
    expect(navLink).toContain('-webkit-backdrop-filter:');
    expect(navLink).not.toContain('.nav-active {');
    expect(navLink).not.toContain('box-shadow: 0 10px 22px');

    expect(layoutStyles).toContain('.site-header-edge-line');
    expect(layoutStyles).toContain('.site-header-edge-char');
    expect(layoutStyles).toContain('.site-header-external-divider');
    expect(layoutStyles).toContain('.site-header-external-divider::before');
    expect(layoutStyles).toContain('font-variant-ligatures: none;');
    expect(layoutStyles).toContain('letter-spacing:');
    expect(layoutStyles).toContain('left: -');
    expect(layoutStyles).toContain('right: -');
    expect(layoutStyles).toContain('padding-inline: 0;');
    expect(layoutStyles).toContain('pointer-events: none;');
    expect(layoutStyles).toContain('mask-image: linear-gradient(');
    expect(layoutStyles).toContain('-webkit-mask-image: linear-gradient(');
    expect(layoutStyles).not.toContain('padding-inline: 0.5rem;');
    expect(layoutStyles).not.toContain('@keyframes site-nucleotide-flow-a');
    expect(layoutStyles).not.toContain('@keyframes site-nucleotide-flow-b');
    expect(layoutStyles).not.toContain('-webkit-background-clip: text;');

    expect(nucleotideEdge).toContain(
      'export const buildNucleotideSequence = (',
    );
    expect(nucleotideEdge).toContain(
      'export const permuteNucleotideSequence = (',
    );
    expect(nucleotideEdge).toContain('site-header-edge-char');
    expect(nucleotideEdge).toContain('const HOVER_RADIUS_CHARS = 8;');
    expect(nucleotideEdge).toContain("header.addEventListener('pointerenter'");
    expect(nucleotideEdge).toContain('const supportsPointerEvents =');
    expect(nucleotideEdge).toContain("window.addEventListener('pointermove'");
    expect(nucleotideEdge).toContain("window.addEventListener('mousemove'");
    expect(nucleotideEdge).toContain("header.addEventListener('pointerdown'");
    expect(nucleotideEdge).toContain("header.addEventListener('touchstart'");
    expect(nucleotideEdge).toContain("window.addEventListener('scroll'");
    expect(nucleotideEdge).toContain("window.addEventListener('resize'");
    expect(nucleotideEdge).toContain('const isPointerNearHeader =');
    expect(nucleotideEdge).toContain(
      'if (!isPointerNearHeader(position.clientY))',
    );
    expect(nucleotideEdge).toContain('const ensureBounds = () => {');
    expect(nucleotideEdge).toContain('scheduleWindowCursorMove');
    expect(nucleotideEdge).toContain('startTouchPreview');
    expect(nucleotideEdge).toContain('stopPermutations();');
    expect(nucleotideEdge).toContain('startPermutations();');
    expect(nucleotideEdge).toContain('requestAnimationFrame');
    expect(nucleotideEdge).toContain('edge.replaceChildren(fragment);');
    expect(nucleotideEdge).toContain(
      'span.style.color = `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;',
    );
    expect(nucleotideEdge).toContain('span.style.textShadow =');
    expect(nucleotideEdge).toContain('(prefers-reduced-motion: reduce)');
    expect(nucleotideEdge).toContain('addReducedMotionChangeListener(');
    expect(nucleotideEdge).toContain('removeReducedMotionChangeListener(');
    expect(nucleotideEdge).toContain(
      "reducedMotionQuery.addEventListener('change', handleReducedMotionChange);",
    );
    expect(nucleotideEdge).toContain('reducedMotionQuery.removeEventListener(');
    expect(nucleotideEdge).not.toContain('reducedMotionQuery.addListener(');
    expect(nucleotideEdge).not.toContain('reducedMotionQuery.removeListener(');

    expect(pageEnhancements).toContain(
      "import { bindHeaderNucleotideEdge } from '@/lib/layout/nucleotideEdge';",
    );
    expect(pageEnhancements).toContain('bindHeaderNucleotideEdge();');
    expect(layoutStyles).toContain('animation: none;');
  });
});
