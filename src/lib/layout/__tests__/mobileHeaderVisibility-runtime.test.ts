/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/__tests__/mobileHeaderVisibility-runtime.test.ts

Validates runtime header hide/reveal behavior while scrolling across viewports.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindMobileHeaderVisibility } from '../mobileHeaderVisibility';

type RafCallback = (timestamp: number) => void;

const installRafQueue = () => {
  let nextFrameId = 1;
  const callbacks = new Map<number, RafCallback>();

  vi.stubGlobal('requestAnimationFrame', (callback: RafCallback) => {
    const frameId = nextFrameId;
    nextFrameId += 1;
    callbacks.set(frameId, callback);
    return frameId;
  });

  vi.stubGlobal('cancelAnimationFrame', (frameId: number) => {
    callbacks.delete(frameId);
  });

  const runFrame = (timestamp = 0) => {
    const queued = Array.from(callbacks.entries());
    callbacks.clear();
    queued.forEach(([, callback]) => callback(timestamp));
  };

  return { runFrame };
};

const installMatchMedia = ({
  coarsePointer,
  compactViewport,
}: {
  coarsePointer: boolean;
  compactViewport: boolean;
}) => {
  vi.stubGlobal('matchMedia', (query: string) => {
    const matches =
      query === '(pointer: coarse)'
        ? coarsePointer
        : query === '(max-width: 768px)'
          ? compactViewport
          : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList;
  });
};

describe('mobileHeaderVisibility runtime', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('keeps the headband hidden for small upward nudges on fine-pointer devices', () => {
    const { runFrame } = installRafQueue();
    installMatchMedia({ coarsePointer: false, compactViewport: false });

    let scrollY = 24;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });

    document.body.innerHTML =
      '<header data-site-header class="site-header-edge"></header>';
    const header = document.querySelector('[data-site-header]');
    expect(header).toBeInstanceOf(HTMLElement);

    const teardown = bindMobileHeaderVisibility();

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(false);

    scrollY = 64;
    window.dispatchEvent(new Event('scroll'));
    runFrame(16);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(true);

    scrollY = 58;
    window.dispatchEvent(new Event('scroll'));
    runFrame(32);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(true);

    teardown();
  });

  it('reveals after cumulative upward distance reaches the fine-pointer threshold', () => {
    const { runFrame } = installRafQueue();
    installMatchMedia({ coarsePointer: false, compactViewport: false });

    let scrollY = 28;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });

    document.body.innerHTML =
      '<header data-site-header class="site-header-edge"></header>';
    const header = document.querySelector('[data-site-header]');
    expect(header).toBeInstanceOf(HTMLElement);

    const teardown = bindMobileHeaderVisibility();

    scrollY = 112;
    window.dispatchEvent(new Event('scroll'));
    runFrame(16);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(true);

    scrollY = 80;
    window.dispatchEvent(new Event('scroll'));
    runFrame(32);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(false);

    teardown();
  });

  it('reveals after sustained upward intent on coarse-pointer devices', () => {
    const { runFrame } = installRafQueue();
    installMatchMedia({ coarsePointer: true, compactViewport: true });

    let scrollY = 48;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });

    document.body.innerHTML =
      '<header data-site-header class="site-header-edge"></header>';
    const header = document.querySelector('[data-site-header]');
    expect(header).toBeInstanceOf(HTMLElement);

    const teardown = bindMobileHeaderVisibility();

    scrollY = 188;
    window.dispatchEvent(new Event('scroll'));
    runFrame(16);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(true);

    scrollY = 176;
    window.dispatchEvent(new Event('scroll'));
    runFrame(48);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(true);

    scrollY = 164;
    window.dispatchEvent(new Event('scroll'));
    runFrame(260);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(false);

    teardown();
  });

  it('forces visibility near the top and ignores negative overscroll bounce', () => {
    const { runFrame } = installRafQueue();
    installMatchMedia({ coarsePointer: false, compactViewport: false });

    let scrollY = 40;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });

    document.body.innerHTML =
      '<header data-site-header class="site-header-edge"></header>';
    const header = document.querySelector('[data-site-header]');
    expect(header).toBeInstanceOf(HTMLElement);

    const teardown = bindMobileHeaderVisibility();

    scrollY = 120;
    window.dispatchEvent(new Event('scroll'));
    runFrame(16);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(true);

    scrollY = -12;
    window.dispatchEvent(new Event('scroll'));
    runFrame(32);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(false);

    teardown();
  });
});
