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

describe('mobileHeaderVisibility runtime', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('hides on downward scroll and reveals on upward scroll even on desktop widths', () => {
    const { runFrame } = installRafQueue();

    let scrollY = 24;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollY,
    });
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1280,
      writable: true,
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

    scrollY = 28;
    window.dispatchEvent(new Event('scroll'));
    runFrame(32);

    expect(
      (header as HTMLElement).classList.contains('site-header-mobile-hidden'),
    ).toBe(false);

    teardown();
  });
});
