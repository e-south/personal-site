/*
--------------------------------------------------------------------------------
personal-site
src/components/__tests__/deep-seafoam-glass.test.ts

Validates Deep Seafoam Glass styling and layout contracts.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = async (relativePath: string) =>
  readFile(path.resolve(process.cwd(), relativePath), 'utf-8');

describe('Deep Seafoam Glass theme contract', () => {
  it('defines global seafoam tokens, glass utilities, focus rings, and progressive reveals', async () => {
    const layout = await read('src/layouts/Layout.astro');
    const contents = await read('src/styles/layout.css');
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');
    const layoutClient = await read('src/lib/layout/layoutClient.ts');

    expect(layout).toContain("import '@/styles/layout.css';");
    expect(contents).toContain('--site-radius-control: 14px;');
    expect(contents).toContain('--site-glass-blur: 10px;');
    expect(contents).toContain('.glass-surface');
    expect(contents).toContain('.focus-ring:focus-visible');
    expect(contents).toContain('[data-reveal]');
    expect(contents).toContain('js-enhanced');
    expect(contents).toContain("data-reveal-ready='true'");
    expect(layout).toContain('initLayoutClient();');
    expect(layoutClient).toContain('bindLayoutEnhancements();');
    expect(enhancements).toContain('IntersectionObserver');
    expect(enhancements).toContain('(prefers-reduced-motion: reduce)');
  });

  it('uses deterministic accent styles instead of hashed hues', async () => {
    const navLink = await read('src/components/ui/NavLink.astro');
    const pillLink = await read('src/components/ui/PillLink.astro');
    const tagChip = await read('src/components/ui/TagChip.astro');
    const carousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(navLink).not.toContain('hashToHue');
    expect(pillLink).not.toContain('hashToHue');
    expect(tagChip).not.toContain('hashToHue');
    expect(carousel).not.toContain('hashToHue');

    expect(navLink).toContain('focus-ring');
    expect(pillLink).toContain('focus-ring');
  });

  it('uses page-anchored corner glows without scroll-following overlays', async () => {
    const contents = await read('src/styles/layout.css');

    expect(contents).toContain('1260px circle at 10% -14%');
    expect(contents).toContain('site-shell');
    expect(contents).toContain('radial-gradient(');
    expect(contents).toContain('at 108% 50%');
    expect(contents).toContain(
      'color-mix(in oklab, var(--site-accent) 14%, transparent) 0%',
    );
    expect(contents).toContain(
      'color-mix(in oklab, var(--site-accent-soft) 8%, transparent) 16%',
    );
    expect(contents).toContain('transparent 44%');
    expect(contents).not.toContain('--site-edge-glow-y');
    expect(contents).not.toContain('background-position:');
    expect(contents).not.toContain('background-size:');
    expect(contents).not.toContain('--site-corner-glow-y');
    expect(contents).not.toContain('circle at 108%');
    expect(contents).not.toContain('calc(100% + 6rem)');
    expect(contents).not.toContain('data-bottom-glow');
    expect(contents).not.toContain('.site-bottom-glow');
    expect(contents).not.toContain('scheduleBottomGlowProgress');
    expect(contents).not.toContain(
      "window.addEventListener('scroll', scheduleBottomGlowProgress",
    );
  });
});

describe('Security and UX hardening contract', () => {
  it('does not rely on raw html injection for homepage overview copy', async () => {
    const contents = await read('src/pages/index.astro');
    expect(contents).not.toContain('set:html={overview}');
    expect(contents).toContain('parseOverviewSegments');
  });

  it('does not globally force all external links to open in a new tab', async () => {
    const layout = await read('src/layouts/Layout.astro');
    expect(layout).not.toContain('setExternalTargets');
    expect(layout).not.toContain("anchor.setAttribute('target', '_blank')");
  });

  it('keeps visible scrollbar affordances for horizontal carousels', async () => {
    const storyChapters = await read('src/components/home/StoryChapters.astro');
    const projectCarousel = await read(
      'src/components/projects/ProjectCarousel.astro',
    );

    expect(storyChapters).not.toContain('scrollbar-width: none;');
    expect(projectCarousel).not.toContain('scrollbar-width: none;');
  });

  it('applies focus-ring styling on key inline links', async () => {
    const blogIndex = await read('src/pages/blog/index.astro');
    const blogPaged = await read('src/pages/blog/[page].astro');
    const projectPanel = await read(
      'src/components/projects/ProjectPanel.astro',
    );

    expect(blogIndex).toContain('class="focus-ring hover:text-accent"');
    expect(blogPaged).toContain('class="focus-ring hover:text-accent"');
    expect(projectPanel).toContain(
      'class="focus-ring text-accent/80 transition hover:text-accent"',
    );
  });
});

describe('Home hero primary conversion', () => {
  it('places newsletter subscribe CTA in the hero secondary column', async () => {
    const contents = await read('src/pages/index.astro');

    expect(contents).toContain(
      "import SubscribeCta from '@/components/ui/SubscribeCta.astro';",
    );
    expect(contents).toContain('data-home-hero-secondary');
    expect(contents).toContain('<SubscribeCta');
  });
});

describe('Projects first-fold layout', () => {
  it('renders a soft project card grid before the detailed carousel', async () => {
    const contents = await read('src/pages/projects.astro');

    expect(contents).toContain('getProjectCards');
    expect(contents).toContain('ProjectCard');
    expect(contents).toContain('data-project-grid');
    expect(contents).toContain('<ProjectCarousel');
  });
});

describe('Requested polish adjustments', () => {
  it('renders footer copyright text without a glass card shell', async () => {
    const footer = await read('src/components/ui/Footer.astro');
    expect(footer).not.toContain('glass-surface');
    expect(footer).toContain('Copyright ©');
  });

  it('does not render project carousel dots inside a glass card shell', async () => {
    const nav = await read('src/components/projects/ProjectCarouselNav.astro');
    expect(nav).not.toContain('glass-surface');
    expect(nav).toContain('data-carousel-dot');
  });

  it('allows project cards to deep-link to their narrative panels', async () => {
    const card = await read('src/components/projects/ProjectCard.astro');
    const contentLib = await read('src/lib/content.ts');

    expect(card).toContain('href={`#project-${project.slug}`}');
    expect(contentLib).toContain('slug: string;');
    expect(contentLib).toContain('slug: project.slug');
  });

  it('promotes the first co-culture narrative asset into the top project card banner', async () => {
    const coCultureProject = await read(
      'src/content/projects/synthetic-microbial-communities/index.md',
    );

    expect(coCultureProject).toContain('banners:');
    expect(coCultureProject).toContain('- placement: above');
    expect(coCultureProject).toContain(
      'image: ./CrickYeastPhysicalWorkflow.svg',
    );
  });

  it('renders project-card assets as the final block so image media always sits at card bottom', async () => {
    const card = await read('src/components/projects/ProjectCard.astro');
    const linkBlockStart = card.indexOf('project.links && (');
    const assetMapStart = card.indexOf('cardBanners.map');

    expect(card).toContain('const cardBanners = project.banners ?? [];');
    expect(card).not.toContain('bannersAbove');
    expect(card).not.toContain('bannersBelow');
    expect(card).toContain('cardBanners.map');
    expect(linkBlockStart).toBeGreaterThan(-1);
    expect(assetMapStart).toBeGreaterThan(linkBlockStart);
  });

  it('uses lift with subtle border emphasis for pill hover states', async () => {
    const pillLink = await read('src/components/ui/PillLink.astro');

    expect(pillLink).toContain('border: 1px solid transparent;');
    expect(pillLink).toContain('transform 220ms');
    expect(pillLink).toContain('border-color:');
    expect(pillLink).toContain('translateY(-1px)');
    expect(pillLink).not.toContain('var(--site-shadow-glow)');
  });

  it('removes contact cards for email and location while keeping labels', async () => {
    const contact = await read('src/pages/contact.astro');

    expect(contact).not.toContain('glass-card');
    expect(contact).toContain('Email');
    expect(contact).toContain('Location');
  });

  it('applies lift and border transitions to project topic tags', async () => {
    const tagChip = await read('src/components/ui/TagChip.astro');

    expect(tagChip).toContain('border: 1px solid transparent;');
    expect(tagChip).toContain('transform 220ms');
    expect(tagChip).toContain('.tag-chip:hover');
    expect(tagChip).toContain('border-color:');
    expect(tagChip).not.toContain('var(--site-shadow-glow)');
  });

  it('uses a shared liquid-glass fill for media captions', async () => {
    const layout = await read('src/styles/layout.css');
    const homePage = await read('src/pages/index.astro');
    const storyMediaLeaf = await read(
      'src/components/home/StoryMediaLeaf.astro',
    );
    const storyMediaItem = await read(
      'src/components/home/StoryMediaItem.astro',
    );
    const projectBanner = await read(
      'src/components/projects/ProjectBanner.astro',
    );

    expect(layout).toContain('.liquid-caption');
    expect(layout).toContain('backdrop-filter: blur(var(--site-glass-blur));');
    expect(layout).toContain(
      'color-mix(in oklab, var(--site-surface) 74%, transparent)',
    );

    expect(homePage).toContain('data-hero-caption');
    expect(homePage).toContain('liquid-caption');
    expect(storyMediaLeaf).toContain(
      'class="story-media-caption liquid-caption"',
    );
    expect(storyMediaItem).toContain(
      'class="story-media-caption story-media-stack-caption liquid-caption"',
    );
    expect(projectBanner).toContain('project-banner-caption liquid-caption');
  });

  it('uses a white canvas and full-width fit for all project panel media assets', async () => {
    const projectPanel = await read(
      'src/components/projects/ProjectPanel.astro',
    );
    const projectBanner = await read(
      'src/components/projects/ProjectBanner.astro',
    );

    expect(projectPanel).toContain(
      ':global([data-carousel-panel] .prose picture)',
    );
    expect(projectPanel).toContain(':global([data-carousel-panel] .prose img)');
    expect(projectPanel).toContain('object-fit: contain;');
    expect(projectPanel).toContain('inline-size: 100%;');
    expect(projectPanel).toContain(
      '--project-media-canvas-padding-inline: 0.72rem;',
    );
    expect(projectPanel).toContain(
      '--project-media-canvas-padding-block: 0.62rem;',
    );
    expect(projectPanel).toContain(
      'padding-inline: var(--project-media-canvas-padding-inline);',
    );
    expect(projectPanel).toContain(
      'padding-block: var(--project-media-canvas-padding-block);',
    );
    expect(projectPanel).toContain('@media (min-width: 768px)');
    expect(projectPanel).toContain(
      '--project-media-canvas-padding-inline: 0.98rem;',
    );
    expect(projectPanel).toContain(
      '--project-media-canvas-padding-block: 0.76rem;',
    );
    expect(projectPanel).toContain('background: #fff;');
    expect(projectPanel).not.toContain(
      'border: 1px solid color-mix(in oklab, var(--site-border) 62%, transparent);',
    );
    expect(projectPanel).not.toContain(
      '0 0 0 1px color-mix(in oklab, #fff 82%, transparent),',
    );
    expect(projectPanel).toContain('box-shadow:');
    expect(projectBanner).not.toContain('<figure class="glass-card');
    expect(projectBanner).toContain('box-shadow:');
    expect(projectBanner).toContain('background: #fff;');
    expect(projectBanner).not.toContain(
      'border: 1px solid color-mix(in oklab, var(--site-border) 62%, transparent);',
    );
    expect(projectBanner).not.toContain(
      '0 0 0 1px color-mix(in oklab, #fff 82%, transparent),',
    );
  });

  it('uses depth-first blog cover media without nested border cards', async () => {
    const blogIndex = await read('src/pages/blog/index.astro');
    const blogPaged = await read('src/pages/blog/[page].astro');
    const blogSlug = await read('src/pages/blog/[slug].astro');
    const layout = await read('src/styles/layout.css');

    expect(blogIndex).toContain('class="blog-cover-media media-depth-surface');
    expect(blogPaged).toContain('class="blog-cover-media media-depth-surface');
    expect(blogSlug).toContain('class="blog-cover-media media-depth-surface');
    expect(blogIndex).not.toContain('border border-base-content/10');
    expect(blogPaged).not.toContain('border border-base-content/10');
    expect(layout).toContain('--site-media-depth-shadow:');
    expect(layout).toContain('.media-depth-surface');
    expect(layout).toContain('box-shadow: var(--site-media-depth-shadow);');
  });

  it('accounts for sticky header offset in story and project hash scrolling', async () => {
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');
    const projectCarouselTargetTop = await read(
      'src/lib/projectCarouselTargetTop.ts',
    );
    const stickyHeaderOffset = await read(
      'src/lib/layout/stickyHeaderOffset.ts',
    );

    expect(storyNavigation).toContain('getStickyHeaderOffset({');
    expect(storyNavigation).toContain('baseOffsetPx: 24 + marginTop');
    expect(projectCarouselTargetTop).toContain('getStickyHeaderOffset({');
    expect(projectCarouselTargetTop).toContain('baseOffsetPx');
    expect(stickyHeaderOffset).toContain(
      'export const getStickyHeaderOffset =',
    );
  });
});

describe('Smart scroll offset hardening', () => {
  it('defines and updates a global scroll offset token from sticky header height', async () => {
    const layout = await read('src/styles/layout.css');
    const enhancements = await read('src/lib/layout/pageEnhancements.ts');

    expect(layout).toContain('--site-scroll-offset');
    expect(layout).toContain('scroll-padding-top: var(--site-scroll-offset);');
    expect(enhancements).toContain('ResizeObserver');
    expect(enhancements).toContain('isStickyHeader');
    expect(enhancements).toContain('headerIsSticky ? 24 : 0');
    expect(enhancements).toContain('headerIsSticky ? 56 : 0');
    expect(enhancements).toContain('setScrollOffsetToken');
  });

  it('applies a final corrective alignment pass after home smooth-scroll jumps', async () => {
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');

    expect(storyNavigation).toContain('finalizeScrollAlignment');
    expect(storyNavigation).toContain("behavior: 'auto'");
  });

  it('cancels jump-lock alignment immediately on manual scroll intent', async () => {
    const storyNavigation = await read('src/lib/home/storyNavigation.ts');

    expect(storyNavigation).toContain('cancelActiveScrollLock');
    expect(storyNavigation).toContain("window.addEventListener('wheel'");
    expect(storyNavigation).toContain("window.addEventListener('touchmove'");
    expect(storyNavigation).toContain("window.addEventListener('keydown'");
  });

  it('applies a final corrective alignment pass after project hash jumps', async () => {
    const projectCarouselRuntime = await read(
      'src/lib/projectCarouselRuntime.ts',
    );
    const projectCarouselViewport = await read(
      'src/lib/projectCarouselViewport.ts',
    );

    expect(projectCarouselRuntime).toContain(
      'createProjectCarouselViewportController',
    );
    expect(projectCarouselViewport).toContain('correctCarouselVerticalOffset');
    expect(projectCarouselRuntime).toContain("behavior: 'auto'");
  });
});

describe('Home narrative media presentation', () => {
  it('renders each about narrative chapter as a glass card surface', async () => {
    const storyChapters = await read('src/components/home/StoryChapters.astro');

    expect(storyChapters).toContain(
      'class="story-chapter glass-card section-divider-bottom px-5 py-12',
    );
  });

  it('removes frame borders while keeping rounded corners and depth', async () => {
    const storyMediaLeaf = await read(
      'src/components/home/StoryMediaLeaf.astro',
    );

    expect(storyMediaLeaf).not.toContain('story-media-frame glass-card');
    expect(storyMediaLeaf).toContain('border-radius: var(--site-radius-card);');
    expect(storyMediaLeaf).toContain('box-shadow:');
  });
});

describe('Home hero image framing', () => {
  it('removes glass-card border framing around hero rotator while keeping depth', async () => {
    const homePage = await read('src/pages/index.astro');

    expect(homePage).not.toContain(
      'glass-card relative overflow-hidden rounded-3xl p-1',
    );
    expect(homePage).toContain('home-hero-image-shell');
    expect(homePage).toContain('.home-hero-image-shell');
    expect(homePage).toContain('var(--site-shadow-1),');
    expect(homePage).toContain('var(--site-shadow-2),');
    expect(homePage).toContain('home-hero-image-shell::after');
  });
});
