/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/__tests__/nucleotideEdge-runtime.test.ts

Validates runtime nucleotide hover behavior with a browser-like DOM.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindHeaderNucleotideEdge } from '../nucleotideEdge';

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

  const runFrame = (timestamp: number) => {
    const queued = Array.from(callbacks.entries());
    callbacks.clear();
    queued.forEach(([, callback]) => callback(timestamp));
  };

  return { runFrame };
};

const readTranslateMagnitude = (transform: string) => {
  const match = transform.match(
    /translate3d\(([-\d.]+)px,\s*([-\d.]+)px,\s*0\)\s*scale\(([-\d.]+),\s*([-\d.]+)\)/,
  );
  if (!match) {
    return 0;
  }

  const x = Number(match[1] ?? 0);
  const y = Number(match[2] ?? 0);
  return Math.hypot(x, y);
};

const readMaxTranslateMagnitude = (nodes: HTMLElement[]) =>
  nodes.reduce((maxMagnitude, node) => {
    const magnitude = readTranslateMagnitude(node.style.transform);
    return Math.max(maxMagnitude, magnitude);
  }, 0);

const readShadowAlpha = (textShadow: string) => {
  const match = textShadow.match(
    /hsla\([^,]+,\s*[^,]+,\s*[^,]+,\s*([-\d.]+)\)/,
  );
  if (!match) {
    return 0;
  }
  return Number(match[1] ?? 0);
};

describe('nucleotide edge runtime', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('applies hover color transitions to nearby nucleotides at runtime', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    const initialCharacters = edge?.querySelectorAll('.site-header-edge-char');
    expect(initialCharacters?.length).toBeGreaterThan(100);

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    );
    const activeAnimatedChars = characters.filter((node) =>
      (node as HTMLElement).style.textShadow.includes('hsla('),
    ).length;

    expect(activeAnimatedChars).toBeGreaterThan(0);

    teardown();
  });

  it('uses the active page header hue for hover color and glow', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    document.body.innerHTML = `
      <h1 class="page-main-header" style="color: rgb(127, 143, 255)">Title</h1>
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    ) as HTMLElement[];
    const activeChar = characters.find((node) =>
      node.style.textShadow.includes('hsla('),
    );
    expect(activeChar).toBeTruthy();

    const colorValue = activeChar?.style.color ?? '';
    const glowValue = activeChar?.style.textShadow ?? '';

    const glowHueMatch = glowValue.match(/hsla\(([-\d.]+)/);
    expect(glowHueMatch).toBeTruthy();
    const glowHue = Number(glowHueMatch?.[1] ?? -1);
    expect(glowHue).toBeGreaterThanOrEqual(220);
    expect(glowHue).toBeLessThanOrEqual(250);

    const hslHueMatch = colorValue.match(/hsl\(([-\d.]+)/);
    if (hslHueMatch) {
      const colorHue = Number(hslHueMatch[1]);
      expect(colorHue).toBeGreaterThanOrEqual(220);
      expect(colorHue).toBeLessThanOrEqual(250);
    } else {
      const rgbMatch = colorValue.match(
        /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/,
      );
      expect(rgbMatch).toBeTruthy();
      const red = Number(rgbMatch?.[1] ?? 0);
      const green = Number(rgbMatch?.[2] ?? 0);
      const blue = Number(rgbMatch?.[3] ?? 0);
      expect(blue).toBeGreaterThan(red);
      expect(blue).toBeGreaterThan(green);
    }

    teardown();
  });

  it('rebuilds character coverage on viewport resize changes', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]') as HTMLElement;
    const edge = document.querySelector(
      '[data-site-header-edge]',
    ) as HTMLElement;

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    const initialCount = edge.querySelectorAll('.site-header-edge-char').length;
    expect(initialCount).toBeGreaterThan(150);

    headerRect.width = 640;
    (headerRect as unknown as { right: number }).right = 640;
    edgeRect.width = 640;
    (edgeRect as unknown as { right: number }).right = 640;

    window.dispatchEvent(new Event('resize'));
    runFrame(500);
    runFrame(750);

    const resizedCount = edge.querySelectorAll('.site-header-edge-char').length;
    expect(resizedCount).toBeLessThan(initialCount);

    teardown();
  });

  it('applies liquid deformation directly on hovered characters', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();
    const edgeElement = edge as HTMLElement;

    expect(
      edgeElement.classList.contains('site-header-edge-line--lens-active'),
    ).toBe(false);

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 250, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    expect(
      edgeElement.classList.contains('site-header-edge-line--lens-active'),
    ).toBe(false);

    const characters = Array.from(
      edgeElement.querySelectorAll('.site-header-edge-char'),
    ) as HTMLElement[];
    const liquidCharacters = characters.filter((node) => {
      return node.style.transform !== '' || node.style.filter !== '';
    });
    expect(liquidCharacters.length).toBeGreaterThan(0);

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 250, clientY: 640 }),
    );

    runFrame(1000);
    runFrame(1250);

    const stillLiquidBelowHeader = characters.filter((node) => {
      return node.style.transform !== '' || node.style.filter !== '';
    });
    expect(stillLiquidBelowHeader.length).toBe(0);

    teardown();
  });

  it('targets deformation within the visible character slice', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]') as HTMLElement;
    const edge = document.querySelector(
      '[data-site-header-edge]',
    ) as HTMLElement;

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge.querySelectorAll('.site-header-edge-char'),
    ) as HTMLElement[];
    const visibleSlice = characters.slice(0, 260);
    const activeInVisibleSlice = visibleSlice.filter((node) => {
      return (
        node.style.transform !== '' ||
        node.style.filter !== '' ||
        node.style.textShadow.includes('hsla(')
      );
    });

    expect(activeInVisibleSlice.length).toBeGreaterThan(0);

    teardown();
  });

  it('extends character-level hover influence across a wider nucleotide band', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]') as HTMLElement;
    const edge = document.querySelector(
      '[data-site-header-edge]',
    ) as HTMLElement;

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );
    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge.querySelectorAll('.site-header-edge-char'),
    ) as HTMLElement[];
    const affectedCharacters = characters.filter((node) => {
      return (
        node.style.textShadow.includes('hsla(') ||
        node.style.transform !== '' ||
        node.style.filter !== ''
      );
    });

    expect(affectedCharacters.length).toBeGreaterThanOrEqual(15);

    teardown();
  });

  it('eases hover glow intensity toward the edge instead of linear stepping', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]') as HTMLElement;
    const edge = document.querySelector(
      '[data-site-header-edge]',
    ) as HTMLElement;

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );
    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge.querySelectorAll('.site-header-edge-char'),
    ) as HTMLElement[];
    const activeIndices = characters
      .map((node, index) => ({
        index,
        alpha: readShadowAlpha(node.style.textShadow),
      }))
      .filter((entry) => entry.alpha > 0);

    expect(activeIndices.length).toBeGreaterThanOrEqual(7);

    const center = activeIndices.reduce((maxEntry, entry) =>
      entry.alpha > maxEntry.alpha ? entry : maxEntry,
    );

    const maxDistance = activeIndices.reduce(
      (max, entry) => Math.max(max, Math.abs(entry.index - center.index)),
      0,
    );
    expect(maxDistance).toBeGreaterThanOrEqual(3);

    const alphaByDistance = new Map<number, number>();
    for (const entry of activeIndices) {
      const distance = Math.abs(entry.index - center.index);
      const previous = alphaByDistance.get(distance) ?? 0;
      alphaByDistance.set(distance, Math.max(previous, entry.alpha));
    }

    const centerAlpha = alphaByDistance.get(0) ?? 0;
    const nearAlpha = alphaByDistance.get(1) ?? 0;
    const edgeAlpha = alphaByDistance.get(maxDistance) ?? 0;
    const preEdgeAlpha = alphaByDistance.get(maxDistance - 1) ?? edgeAlpha;

    const centerDrop = centerAlpha - nearAlpha;
    const edgeDrop = preEdgeAlpha - edgeAlpha;

    expect(centerDrop).toBeGreaterThan(0);
    expect(edgeDrop).toBeGreaterThan(0);
    expect(edgeDrop).toBeLessThan(centerDrop);

    teardown();
  });

  it('reacts to cursor over the edge strip even when it sits outside header bounds', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 56,
      top: 0,
      right: 1000,
      bottom: 56,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    );
    const activeAnimatedChars = characters.filter((node) =>
      (node as HTMLElement).style.textShadow.includes('hsla('),
    ).length;

    expect(activeAnimatedChars).toBeGreaterThan(0);

    teardown();
  });

  it('binds pointer movement without duplicating mousemove listeners', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const teardown = bindHeaderNucleotideEdge();

    const pointerMoveRegistrations = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === 'pointermove',
    );
    const mouseMoveRegistrations = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === 'mousemove',
    );

    expect(pointerMoveRegistrations.length).toBeGreaterThan(0);
    expect(mouseMoveRegistrations).toHaveLength(0);

    teardown();
  });

  it('falls back to mousemove when PointerEvent is unavailable', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    vi.stubGlobal('PointerEvent', undefined);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const teardown = bindHeaderNucleotideEdge();

    const pointerMoveRegistrations = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === 'pointermove',
    );
    const mouseMoveRegistrations = addEventListenerSpy.mock.calls.filter(
      ([eventName]) => eventName === 'mousemove',
    );

    expect(pointerMoveRegistrations).toHaveLength(0);
    expect(mouseMoveRegistrations.length).toBeGreaterThan(0);

    teardown();
  });

  it('reuses cached bounds during pointer movement', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]') as HTMLElement;
    const edge = document.querySelector(
      '[data-site-header-edge]',
    ) as HTMLElement;

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    const readHeaderRect = vi.fn(() => headerRect);
    const readEdgeRect = vi.fn(() => edgeRect);

    Object.defineProperty(header, 'getBoundingClientRect', {
      value: readHeaderRect,
    });
    Object.defineProperty(edge, 'getBoundingClientRect', {
      value: readEdgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 250, clientY: 60 }),
    );
    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );
    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 750, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    expect(readHeaderRect.mock.calls.length).toBeLessThanOrEqual(3);
    expect(readEdgeRect.mock.calls.length).toBeLessThanOrEqual(3);

    teardown();
  });

  it('uses temporary touch preview interactions on pointerdown for touch input', () => {
    vi.useFakeTimers();
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    const touchPointerDownEvent = new MouseEvent('pointerdown', {
      clientX: 500,
      clientY: 60,
    });
    Object.defineProperty(touchPointerDownEvent, 'pointerType', {
      value: 'touch',
    });
    header?.dispatchEvent(touchPointerDownEvent);

    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    );
    const activeAnimatedChars = characters.filter((node) =>
      (node as HTMLElement).style.textShadow.includes('hsla('),
    ).length;
    expect(activeAnimatedChars).toBeGreaterThan(0);

    vi.advanceTimersByTime(700);
    runFrame(1000);
    runFrame(1250);

    const activeAfterTimeout = characters.filter((node) =>
      (node as HTMLElement).style.textShadow.includes('hsla('),
    ).length;
    expect(activeAfterTimeout).toBe(0);

    teardown();
    vi.useRealTimers();
  });

  it('keeps static hover color shifts for reduced motion users', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );

    runFrame(500);
    runFrame(750);

    const characters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    );
    const activeAnimatedChars = characters.filter((node) =>
      (node as HTMLElement).style.textShadow.includes('hsla('),
    ).length;

    expect(activeAnimatedChars).toBeGreaterThan(0);

    const firstActiveChar = characters.find((node) =>
      (node as HTMLElement).style.textShadow.includes('hsla('),
    ) as HTMLElement | undefined;
    expect(firstActiveChar).toBeTruthy();
    const initialShadow = firstActiveChar?.style.textShadow;
    const initialColor = firstActiveChar?.style.color;

    runFrame(1_000);
    runFrame(1_250);

    expect(firstActiveChar?.style.textShadow).toBe(initialShadow);
    expect(firstActiveChar?.style.color).toBe(initialColor);

    teardown();
  });

  it('adds stronger ripple deformation during fast cursor moves than slow moves', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 500, clientY: 60 }),
    );
    runFrame(100);
    runFrame(116);

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 504, clientY: 60 }),
    );
    runFrame(300);
    runFrame(316);

    const slowCharacters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    ) as HTMLElement[];
    const slowMagnitude = readMaxTranslateMagnitude(slowCharacters);

    window.dispatchEvent(
      new MouseEvent('pointermove', { clientX: 760, clientY: 60 }),
    );
    runFrame(332);
    runFrame(348);

    const fastCharacters = Array.from(
      edge?.querySelectorAll('.site-header-edge-char') ?? [],
    ) as HTMLElement[];
    const fastMagnitude = readMaxTranslateMagnitude(fastCharacters);

    expect(fastMagnitude).toBeGreaterThan(slowMagnitude + 0.12);

    teardown();
  });

  it('keeps nucleotide letters stable while idle with no pointer interaction', () => {
    const { runFrame } = installRafQueue();

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };

    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardown = bindHeaderNucleotideEdge();

    const readText = () =>
      Array.from(edge?.querySelectorAll('.site-header-edge-char') ?? [])
        .map((node) => (node as HTMLElement).textContent ?? '')
        .join('');

    const initialText = readText();
    runFrame(250);
    runFrame(500);
    runFrame(750);
    runFrame(1000);
    const stableText = readText();

    expect(stableText).toBe(initialText);

    teardown();
  });

  it('does not accumulate global listeners across repeated setup and teardown cycles', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    class MockResizeObserver {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    document.body.innerHTML = `
      <header data-site-header>
        <div data-site-header-edge></div>
      </header>
    `;

    const header = document.querySelector('[data-site-header]');
    const edge = document.querySelector('[data-site-header-edge]');
    expect(header).toBeInstanceOf(HTMLElement);
    expect(edge).toBeInstanceOf(HTMLElement);

    const headerRect: DOMRect = {
      x: 0,
      y: 0,
      width: 1000,
      height: 80,
      top: 0,
      right: 1000,
      bottom: 80,
      left: 0,
      toJSON: () => ({}),
    };
    const edgeRect: DOMRect = {
      x: 0,
      y: 56,
      width: 1000,
      height: 8,
      top: 56,
      right: 1000,
      bottom: 64,
      left: 0,
      toJSON: () => ({}),
    };

    Object.defineProperty(header as HTMLElement, 'getBoundingClientRect', {
      value: () => headerRect,
    });
    Object.defineProperty(edge as HTMLElement, 'getBoundingClientRect', {
      value: () => edgeRect,
    });

    const teardownFirst = bindHeaderNucleotideEdge();
    teardownFirst();
    const teardownSecond = bindHeaderNucleotideEdge();
    teardownSecond();

    const countEvent = (
      spy: typeof addEventListenerSpy,
      eventName: string,
    ): number => spy.mock.calls.filter(([name]) => name === eventName).length;

    expect(countEvent(addEventListenerSpy, 'pointermove')).toBe(
      countEvent(removeEventListenerSpy, 'pointermove'),
    );
    expect(countEvent(addEventListenerSpy, 'scroll')).toBe(
      countEvent(removeEventListenerSpy, 'scroll'),
    );
    expect(countEvent(addEventListenerSpy, 'resize')).toBe(
      countEvent(removeEventListenerSpy, 'resize'),
    );
  });
});
