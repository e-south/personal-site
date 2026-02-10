/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/nucleotideEdge.ts

Builds and binds the nucleotide edge text effect for the site header.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

const NUCLEOTIDES = ['A', 'T', 'C', 'G'] as const;
const MIN_SEQUENCE_LENGTH = 120;
const MAX_SEQUENCE_LENGTH = 1200;
const EDGE_OVERFLOW_SPAN_PX = 0;
const ENABLE_IDLE_PERMUTATIONS = false;
const DEFAULT_CHARACTER_STRIDE_PX = 4.8;
const MIN_CHARACTER_STRIDE_PX = 3.2;
const MAX_CHARACTER_STRIDE_PX = 8.4;
const CHARACTER_STRIDE_SAMPLE = 'ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG';
const PERMUTATION_INTERVAL_MS = 220;
const MIN_PERMUTATIONS_PER_TICK = 4;
const MAX_PERMUTATIONS_PER_TICK = 18;
const EDGE_CHAR_CLASS = 'site-header-edge-char';
const HOVER_RADIUS_CHARS = 8;
const DEFAULT_HOVER_HUE_DEG = 0;
const HOVER_SATURATION_BASE = 80;
const HOVER_SATURATION_BOOST = 12;
const HOVER_LIGHTNESS_BASE = 40;
const HOVER_LIGHTNESS_BOOST = 14;
const HOVER_HALO_SPREAD_BASE_PX = 1.6;
const HOVER_HALO_SPREAD_BOOST_PX = 2.4;
const HOVER_HALO_ALPHA_BASE = 0.16;
const HOVER_HALO_ALPHA_BOOST = 0.14;
const HOVER_LIQUID_SWAY_SPEED_RAD_PER_MS = 0.012;
const HOVER_LIQUID_SWAY_PHASE_STEP_RAD = 0.52;
const HOVER_LIQUID_SHIFT_X_PX = 0.52;
const HOVER_LIQUID_SHIFT_Y_PX = 0.62;
const HOVER_LIQUID_SCALE_DELTA = 0.062;
const HOVER_RIPPLE_TRIGGER_VELOCITY_PX_PER_MS = 2.2;
const HOVER_RIPPLE_VELOCITY_RANGE_PX_PER_MS = 7.2;
const HOVER_RIPPLE_DECAY_MS = 190;
const HOVER_RIPPLE_SPREAD_CHARS = 6.4;
const HOVER_RIPPLE_PHASE_STEP_RAD = 0.86;
const HOVER_RIPPLE_SPEED_RAD_PER_MS = 0.045;
const HOVER_RIPPLE_SHIFT_X_PX = 0.28;
const HOVER_RIPPLE_SHIFT_Y_PX = 0.52;
const HOVER_RIPPLE_SCALE_DELTA = 0.028;
const HOVER_FALLOFF_EXPONENT = 1.4;
const TOUCH_PREVIEW_DURATION_MS = 560;
const POINTER_HEADER_PROXIMITY_TOP_PX = 88;
const POINTER_HEADER_PROXIMITY_BOTTOM_PX = 160;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizeHue = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const resolveHueFromRgb = (red: number, green: number, blue: number) => {
  const r = clamp(red, 0, 255) / 255;
  const g = clamp(green, 0, 255) / 255;
  const b = clamp(blue, 0, 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta <= 0) {
    return DEFAULT_HOVER_HUE_DEG;
  }
  if (max === r) {
    return normalizeHue(60 * (((g - b) / delta) % 6));
  }
  if (max === g) {
    return normalizeHue(60 * ((b - r) / delta + 2));
  }
  return normalizeHue(60 * ((r - g) / delta + 4));
};

const resolveHueFromColor = (colorValue: string) => {
  const color = colorValue.trim();
  if (!color) {
    return null;
  }

  const hslMatch = color.match(/hsla?\(\s*([-\d.]+)/i);
  if (hslMatch?.[1]) {
    const hue = Number(hslMatch[1]);
    if (Number.isFinite(hue)) {
      return normalizeHue(hue);
    }
  }

  const rgbMatch = color.match(
    /rgba?\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)/i,
  );
  if (rgbMatch?.[1] && rgbMatch[2] && rgbMatch[3]) {
    const red = Number(rgbMatch[1]);
    const green = Number(rgbMatch[2]);
    const blue = Number(rgbMatch[3]);
    if ([red, green, blue].every((channel) => Number.isFinite(channel))) {
      return resolveHueFromRgb(red, green, blue);
    }
  }

  const hexMatch = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hexMatch?.[1]) {
    const hex = hexMatch[1].toLowerCase();
    const expandedHex =
      hex.length === 3
        ? `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
        : hex;
    const red = Number.parseInt(expandedHex.slice(0, 2), 16);
    const green = Number.parseInt(expandedHex.slice(2, 4), 16);
    const blue = Number.parseInt(expandedHex.slice(4, 6), 16);
    if ([red, green, blue].every((channel) => Number.isFinite(channel))) {
      return resolveHueFromRgb(red, green, blue);
    }
  }

  return null;
};

const resolveHoverHueDeg = () => {
  const pageHeader = document.querySelector('.page-main-header');
  if (!(pageHeader instanceof HTMLElement)) {
    return DEFAULT_HOVER_HUE_DEG;
  }

  const styles = window.getComputedStyle(pageHeader);
  const colorCandidates = [
    styles.getPropertyValue('--site-page-header-hue'),
    styles.color,
    pageHeader.style.color,
  ];
  for (const candidate of colorCandidates) {
    const hue = resolveHueFromColor(candidate);
    if (hue !== null) {
      return hue;
    }
  }

  return DEFAULT_HOVER_HUE_DEG;
};

const shapeFalloff = (value: number) =>
  Math.pow(clamp(value, 0, 1), HOVER_FALLOFF_EXPONENT);

const pickNucleotide = (random: () => number) =>
  NUCLEOTIDES[Math.floor(random() * NUCLEOTIDES.length)] ?? 'A';

const resolveCharacterStride = (edge: HTMLElement) => {
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.whiteSpace = 'pre';
  probe.style.left = '-9999px';
  probe.style.top = '0';

  for (const character of CHARACTER_STRIDE_SAMPLE) {
    const characterProbe = document.createElement('span');
    characterProbe.className = EDGE_CHAR_CLASS;
    characterProbe.textContent = character;
    probe.append(characterProbe);
  }

  edge.append(probe);
  const width = probe.getBoundingClientRect().width;
  const sampleLength = probe.childElementCount;
  probe.remove();

  if (!Number.isFinite(width) || width <= 0 || sampleLength <= 0) {
    return DEFAULT_CHARACTER_STRIDE_PX;
  }

  return clamp(
    width / sampleLength,
    MIN_CHARACTER_STRIDE_PX,
    MAX_CHARACTER_STRIDE_PX,
  );
};

const resolveSequenceLength = (header: HTMLElement, edge: HTMLElement) => {
  const headerWidth = Math.ceil(header.getBoundingClientRect().width);
  const edgeWidth = Math.ceil(edge.getBoundingClientRect().width);
  const fallbackWidth = Math.max(
    window.innerWidth,
    document.documentElement.clientWidth,
  );
  const visibleWidth = Math.max(edgeWidth, headerWidth, 1);
  const targetWidth = visibleWidth > 1 ? visibleWidth : fallbackWidth;
  const characterStride = resolveCharacterStride(edge);
  const estimatedLength = Math.round(
    (targetWidth + EDGE_OVERFLOW_SPAN_PX) / characterStride,
  );
  return clamp(estimatedLength, MIN_SEQUENCE_LENGTH, MAX_SEQUENCE_LENGTH);
};

const resolvePermutationCount = (sequenceLength: number) =>
  clamp(
    Math.round(sequenceLength / 38),
    MIN_PERMUTATIONS_PER_TICK,
    MAX_PERMUTATIONS_PER_TICK,
  );

const resolveBaseColor = (index: number, sequenceLength: number) => {
  const center = (sequenceLength - 1) / 2;
  const maxDistance = Math.max(center, 1);
  const distance = Math.abs(index - center) / maxDistance;
  const accentMix = Math.round(78 - distance * 34);
  const textMix = 100 - accentMix;
  return `color-mix(in oklab, var(--site-text) ${textMix}%, var(--site-accent) ${accentMix}%)`;
};

export const buildNucleotideSequence = (
  length: number,
  random: () => number = Math.random,
) => {
  const targetLength = Math.max(1, Math.floor(length));
  const characters: string[] = [];
  for (let index = 0; index < targetLength; index += 1) {
    characters.push(pickNucleotide(random));
  }
  return characters.join('');
};

export const permuteNucleotideSequence = (
  sequence: string,
  swaps: number,
  random: () => number = Math.random,
) => {
  if (sequence.length < 2 || swaps <= 0) {
    return sequence;
  }

  const characters = sequence.split('');
  const maxSwaps = characters.length * 2;
  const safeSwaps = Math.max(1, Math.min(Math.floor(swaps), maxSwaps));

  for (let index = 0; index < safeSwaps; index += 1) {
    const anchor = Math.floor(random() * characters.length);
    const direction = random() < 0.5 ? -1 : 1;
    const partner =
      (anchor + direction + characters.length) % characters.length;

    const anchorChar = characters[anchor];
    characters[anchor] = characters[partner] ?? anchorChar;
    characters[partner] = anchorChar;
  }

  return characters.join('');
};

export const bindHeaderNucleotideEdge = () => {
  const header = document.querySelector('[data-site-header]');
  if (!(header instanceof HTMLElement)) {
    return () => {};
  }

  const edge = header.querySelector('[data-site-header-edge]');
  if (!(edge instanceof HTMLElement)) {
    return () => {};
  }
  const hoverHueDeg = resolveHoverHueDeg();

  const reducedMotionQuery = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  );
  const supportsPointerEvents = typeof window.PointerEvent === 'function';
  let rafId: number | null = null;
  let hoverRafId: number | null = null;
  let pointerMoveRafId: number | null = null;
  let touchPreviewTimer: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let resizeRaf: number | null = null;
  let lastPermutationAt = 0;
  let disposed = false;
  let sequenceLength = resolveSequenceLength(header, edge);
  let sequenceCharacters = buildNucleotideSequence(sequenceLength).split('');
  let hoverIndex: number | null = null;
  let pendingPointerPosition: { clientX: number; clientY: number } | null =
    null;
  let headerBounds: DOMRect | null = null;
  let edgeBounds: DOMRect | null = null;
  let boundsDirty = true;
  let characterSpans: HTMLSpanElement[] = [];
  let characterCenters: number[] = [];
  let baseColors: string[] = [];
  let renderedColors: string[] = [];
  let renderedShadows: string[] = [];
  let renderedTransforms: string[] = [];
  let renderedFilters: string[] = [];
  let hoverIndices = new Set<number>();
  let lastPointerSample: { clientX: number; at: number } | null = null;
  let pointerVelocityPxPerMs = 0;
  let pointerDeltaX = 0;
  let rippleCenterIndex: number | null = null;
  let rippleEnergy = 0;
  let rippleDirection = 1;
  let rippleStartedAt = 0;
  const viewport = window.visualViewport;

  const refreshCharacterCenters = () => {
    const centers: number[] = [];
    for (const span of characterSpans) {
      const rect = span.getBoundingClientRect();
      const width = rect.width > 0 ? rect.width : span.offsetWidth;
      const center = span.offsetLeft + width / 2;
      centers.push(center);
    }

    if (centers.length < 2) {
      characterCenters = [];
      return;
    }

    const spanWidth = centers[centers.length - 1] - centers[0];
    if (!Number.isFinite(spanWidth) || spanWidth <= 1) {
      characterCenters = [];
      return;
    }

    characterCenters = centers;
  };

  const clearTouchPreviewTimer = () => {
    if (touchPreviewTimer !== null) {
      window.clearTimeout(touchPreviewTimer);
      touchPreviewTimer = null;
    }
  };

  const clearRipple = () => {
    rippleCenterIndex = null;
    rippleEnergy = 0;
  };

  const markBoundsDirty = () => {
    boundsDirty = true;
  };

  const refreshBounds = () => {
    headerBounds = header.getBoundingClientRect();
    edgeBounds = edge.getBoundingClientRect();
    refreshCharacterCenters();
    boundsDirty = false;
  };

  const ensureBounds = () => {
    if (boundsDirty || !edgeBounds) {
      refreshBounds();
    }
  };

  const rebuildEdgeCharacters = () => {
    const fragment = document.createDocumentFragment();
    characterSpans = [];
    characterCenters = [];
    baseColors = [];
    renderedColors = [];
    renderedShadows = [];
    renderedTransforms = [];
    renderedFilters = [];
    hoverIndices = new Set<number>();

    for (let index = 0; index < sequenceLength; index += 1) {
      const character = sequenceCharacters[index] ?? 'A';
      const baseColor = resolveBaseColor(index, sequenceLength);
      const span = document.createElement('span');
      span.className = EDGE_CHAR_CLASS;
      span.textContent = character;
      span.style.color = baseColor;
      characterSpans.push(span);
      baseColors.push(baseColor);
      renderedColors.push(baseColor);
      renderedShadows.push('');
      renderedTransforms.push('');
      renderedFilters.push('');
      fragment.append(span);
    }

    edge.replaceChildren(fragment);
    refreshCharacterCenters();
  };

  const restoreBaseColor = (index: number) => {
    const span = characterSpans[index];
    const baseColor = baseColors[index];
    if (!span || !baseColor) {
      return;
    }
    if (renderedColors[index] !== baseColor) {
      span.style.color = baseColor;
      renderedColors[index] = baseColor;
    }
    if (renderedShadows[index] !== '') {
      span.style.removeProperty('text-shadow');
      renderedShadows[index] = '';
    }
    if (renderedTransforms[index] !== '') {
      span.style.removeProperty('transform');
      renderedTransforms[index] = '';
    }
    if (renderedFilters[index] !== '') {
      span.style.removeProperty('filter');
      renderedFilters[index] = '';
    }
  };

  const clearHoverPalette = () => {
    for (const index of hoverIndices) {
      restoreBaseColor(index);
    }
    hoverIndices = new Set<number>();
  };

  const renderIndices = (indices: Iterable<number>) => {
    for (const index of indices) {
      const span = characterSpans[index];
      if (!span) {
        continue;
      }
      const nextCharacter = sequenceCharacters[index] ?? 'A';
      if (span.textContent !== nextCharacter) {
        span.textContent = nextCharacter;
      }
    }
  };

  const stopHoverAnimation = () => {
    if (hoverRafId !== null) {
      window.cancelAnimationFrame(hoverRafId);
      hoverRafId = null;
    }
  };

  const applyHoverPalette = (timestamp: number) => {
    if (hoverIndex === null) {
      clearHoverPalette();
      return;
    }

    let rippleDecay = 0;
    if (rippleCenterIndex !== null && rippleEnergy > 0) {
      const rippleAge = Math.max(0, timestamp - rippleStartedAt);
      rippleDecay = clamp(1 - rippleAge / HOVER_RIPPLE_DECAY_MS, 0, 1);
      if (rippleDecay <= 0.001) {
        clearRipple();
        rippleDecay = 0;
      }
    }

    const start = Math.max(0, hoverIndex - HOVER_RADIUS_CHARS);
    const end = Math.min(sequenceLength - 1, hoverIndex + HOVER_RADIUS_CHARS);
    const nextHoverIndices = new Set<number>();

    for (let index = start; index <= end; index += 1) {
      const span = characterSpans[index];
      if (!span) {
        continue;
      }

      const distance = Math.abs(index - hoverIndex);
      const linearIntensity = 1 - distance / (HOVER_RADIUS_CHARS + 1);
      const intensity = shapeFalloff(linearIntensity);
      const hue = hoverHueDeg;
      let rippleX = 0;
      let rippleY = 0;
      let rippleScale = 0;
      let rippleTone = 0;
      let rippleGlow = 0;
      if (rippleDecay > 0 && rippleCenterIndex !== null) {
        const rippleDistance = index - rippleCenterIndex;
        const envelope = Math.exp(
          -Math.abs(rippleDistance) / HOVER_RIPPLE_SPREAD_CHARS,
        );
        const wavePhase =
          rippleDistance * HOVER_RIPPLE_PHASE_STEP_RAD -
          (timestamp - rippleStartedAt) *
            HOVER_RIPPLE_SPEED_RAD_PER_MS *
            rippleDirection;
        const wave = Math.sin(wavePhase);
        const rippleAmplitude = wave * envelope * rippleEnergy * rippleDecay;
        rippleX = rippleAmplitude * HOVER_RIPPLE_SHIFT_X_PX;
        rippleY = rippleAmplitude * HOVER_RIPPLE_SHIFT_Y_PX;
        rippleScale = Math.abs(rippleAmplitude) * HOVER_RIPPLE_SCALE_DELTA;
        rippleTone = Math.max(0, rippleAmplitude) * 7;
        rippleGlow = Math.abs(rippleAmplitude) * 0.11;
      }
      const saturation = clamp(
        Math.round(
          HOVER_SATURATION_BASE +
            intensity * HOVER_SATURATION_BOOST +
            rippleTone,
        ),
        0,
        100,
      );
      const lightness = clamp(
        Math.round(
          HOVER_LIGHTNESS_BASE + intensity * HOVER_LIGHTNESS_BOOST + rippleTone,
        ),
        0,
        100,
      );
      const shadowStrength = (
        HOVER_HALO_ALPHA_BASE +
        intensity * HOVER_HALO_ALPHA_BOOST +
        rippleGlow
      ).toFixed(3);
      const shadowSpread = (
        HOVER_HALO_SPREAD_BASE_PX +
        intensity * HOVER_HALO_SPREAD_BOOST_PX +
        rippleGlow * 2
      ).toFixed(2);
      const sway =
        Math.sin(
          timestamp * HOVER_LIQUID_SWAY_SPEED_RAD_PER_MS +
            index * HOVER_LIQUID_SWAY_PHASE_STEP_RAD,
        ) * intensity;
      const wobble =
        Math.cos(
          timestamp * HOVER_LIQUID_SWAY_SPEED_RAD_PER_MS * 0.74 +
            index * HOVER_LIQUID_SWAY_PHASE_STEP_RAD * 0.92,
        ) * intensity;
      const translateX = sway * HOVER_LIQUID_SHIFT_X_PX + rippleX;
      const translateY =
        -intensity * 0.24 + wobble * HOVER_LIQUID_SHIFT_Y_PX + rippleY;
      const scaleX =
        1 + intensity * HOVER_LIQUID_SCALE_DELTA + sway * 0.04 + rippleScale;
      const scaleY =
        1 -
        intensity * HOVER_LIQUID_SCALE_DELTA * 0.42 -
        sway * 0.03 +
        rippleScale * 0.22;
      const brightness = 1 + intensity * 0.14 + Math.abs(rippleY) * 0.05;
      const saturate = 1 + intensity * 0.28 + rippleTone * 0.015;
      const colorValue = `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
      if (renderedColors[index] !== colorValue) {
        span.style.color = `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
        renderedColors[index] = colorValue;
      }
      const shadowValue = `0 0 ${shadowSpread}px hsla(${Math.round(hue)}, 100%, ${Math.max(38, lightness)}%, ${shadowStrength})`;
      if (renderedShadows[index] !== shadowValue) {
        span.style.textShadow = shadowValue;
        renderedShadows[index] = shadowValue;
      }
      const transformValue = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      if (renderedTransforms[index] !== transformValue) {
        span.style.transform = transformValue;
        renderedTransforms[index] = transformValue;
      }
      const filterValue = `brightness(${brightness.toFixed(3)}) saturate(${saturate.toFixed(3)})`;
      if (renderedFilters[index] !== filterValue) {
        span.style.filter = filterValue;
        renderedFilters[index] = filterValue;
      }
      nextHoverIndices.add(index);
    }

    for (const index of hoverIndices) {
      if (!nextHoverIndices.has(index)) {
        restoreBaseColor(index);
      }
    }

    hoverIndices = nextHoverIndices;
  };

  const registerRipple = (timestamp: number) => {
    if (hoverIndex === null) {
      return;
    }
    if (pointerVelocityPxPerMs < HOVER_RIPPLE_TRIGGER_VELOCITY_PX_PER_MS) {
      return;
    }

    const velocityDelta =
      pointerVelocityPxPerMs - HOVER_RIPPLE_TRIGGER_VELOCITY_PX_PER_MS;
    const normalized = clamp(
      velocityDelta / HOVER_RIPPLE_VELOCITY_RANGE_PX_PER_MS,
      0,
      1,
    );
    if (normalized <= 0) {
      return;
    }

    rippleCenterIndex = hoverIndex;
    rippleEnergy = Math.max(rippleEnergy * 0.68, normalized);
    rippleStartedAt = timestamp;
    if (pointerDeltaX !== 0) {
      rippleDirection = pointerDeltaX > 0 ? 1 : -1;
    }
  };

  const startHoverAnimation = () => {
    if (
      disposed ||
      reducedMotionQuery.matches ||
      hoverIndex === null ||
      hoverRafId !== null
    ) {
      return;
    }

    const tick = (timestamp: number) => {
      if (disposed) {
        hoverRafId = null;
        return;
      }

      if (hoverIndex === null) {
        clearHoverPalette();
        hoverRafId = null;
        return;
      }

      applyHoverPalette(timestamp);
      hoverRafId = window.requestAnimationFrame(tick);
    };

    hoverRafId = window.requestAnimationFrame(tick);
  };

  const resolveHoverIndex = (clientX: number) => {
    ensureBounds();
    const bounds = edgeBounds;
    if (!bounds) {
      return null;
    }
    if (bounds.width <= 0) {
      return null;
    }

    const x = clamp(clientX - bounds.left, 0, Math.max(0, bounds.width - 0.01));
    if (characterCenters.length > 1) {
      const firstCenter = characterCenters[0] ?? 0;
      const lastCenter =
        characterCenters[characterCenters.length - 1] ?? firstCenter;
      const clampedCenterX = clamp(x, firstCenter, lastCenter);

      let low = 0;
      let high = characterCenters.length - 1;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const midCenter = characterCenters[mid] ?? 0;
        if (midCenter < clampedCenterX) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      const rightIndex = low;
      const leftIndex = Math.max(0, rightIndex - 1);
      const rightCenter =
        characterCenters[rightIndex] ?? characterCenters[leftIndex] ?? 0;
      const leftCenter =
        characterCenters[leftIndex] ?? characterCenters[rightIndex] ?? 0;
      const nearestIndex =
        Math.abs(rightCenter - clampedCenterX) <
        Math.abs(clampedCenterX - leftCenter)
          ? rightIndex
          : leftIndex;

      return clamp(nearestIndex, 0, Math.max(0, sequenceLength - 1));
    }

    const ratio = x / bounds.width;
    return clamp(
      Math.floor(ratio * sequenceLength),
      0,
      Math.max(0, sequenceLength - 1),
    );
  };

  const handlePointerMove = (
    event: PointerEvent,
    pointerTimestamp: number = performance.now(),
  ) => {
    const previousHoverIndex = hoverIndex;
    hoverIndex = resolveHoverIndex(event.clientX);
    if (hoverIndex === null) {
      clearRipple();
      clearHoverPalette();
      stopHoverAnimation();
      if (previousHoverIndex !== null && !reducedMotionQuery.matches) {
        startPermutations();
      }
      return;
    }

    if (reducedMotionQuery.matches) {
      stopPermutations();
      stopHoverAnimation();
      clearRipple();
      applyHoverPalette(0);
      return;
    }

    registerRipple(pointerTimestamp);

    if (previousHoverIndex === null) {
      stopPermutations();
    }

    startHoverAnimation();
  };

  const handlePointerLeave = () => {
    clearTouchPreviewTimer();
    const hadHover = hoverIndex !== null;
    hoverIndex = null;
    clearRipple();
    clearHoverPalette();
    stopHoverAnimation();
    if (hadHover && !reducedMotionQuery.matches) {
      startPermutations();
    }
  };

  const handleWindowCursorMove = (
    clientX: number,
    pointerTimestamp: number,
  ) => {
    const pointerLikeEvent = { clientX } as PointerEvent;
    handlePointerMove(pointerLikeEvent, pointerTimestamp);
  };

  const isPointerNearHeader = (clientY: number) => {
    ensureBounds();
    const currentHeaderBounds = headerBounds;
    const currentEdgeBounds = edgeBounds;
    if (!currentHeaderBounds || !currentEdgeBounds) {
      return false;
    }
    const bandTop =
      Math.min(currentHeaderBounds.top, currentEdgeBounds.top) -
      POINTER_HEADER_PROXIMITY_TOP_PX;
    const bandBottom =
      Math.max(currentHeaderBounds.bottom, currentEdgeBounds.bottom) +
      POINTER_HEADER_PROXIMITY_BOTTOM_PX;
    return clientY >= bandTop && clientY <= bandBottom;
  };

  const flushPointerMove = (timestamp: number) => {
    pointerMoveRafId = null;
    const position = pendingPointerPosition;
    pendingPointerPosition = null;
    if (!position) {
      return;
    }
    const previousPointer = lastPointerSample;
    if (!previousPointer) {
      pointerVelocityPxPerMs = 0;
      pointerDeltaX = 0;
    } else {
      const duration = Math.max(1, timestamp - previousPointer.at);
      pointerDeltaX = position.clientX - previousPointer.clientX;
      pointerVelocityPxPerMs = Math.abs(pointerDeltaX) / duration;
    }
    lastPointerSample = { clientX: position.clientX, at: timestamp };
    if (!isPointerNearHeader(position.clientY)) {
      pointerVelocityPxPerMs = 0;
      pointerDeltaX = 0;
      handlePointerLeave();
      return;
    }
    handleWindowCursorMove(position.clientX, timestamp);
  };

  const scheduleWindowCursorMove = (clientX: number, clientY: number) => {
    pendingPointerPosition = { clientX, clientY };
    if (pointerMoveRafId !== null) {
      return;
    }
    pointerMoveRafId = window.requestAnimationFrame((timestamp) => {
      flushPointerMove(timestamp);
    });
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    scheduleWindowCursorMove(event.clientX, event.clientY);
  };

  const handleWindowMouseMove = (event: MouseEvent) => {
    scheduleWindowCursorMove(event.clientX, event.clientY);
  };

  const startTouchPreview = (clientX: number) => {
    if (reducedMotionQuery.matches) {
      return;
    }
    const nextHoverIndex = resolveHoverIndex(clientX);
    if (nextHoverIndex === null) {
      return;
    }
    clearTouchPreviewTimer();
    hoverIndex = nextHoverIndex;
    stopPermutations();
    applyHoverPalette(performance.now());
    startHoverAnimation();
    touchPreviewTimer = window.setTimeout(() => {
      touchPreviewTimer = null;
      const hadHover = hoverIndex !== null;
      hoverIndex = null;
      clearRipple();
      clearHoverPalette();
      stopHoverAnimation();
      if (hadHover && !reducedMotionQuery.matches) {
        startPermutations();
      }
    }, TOUCH_PREVIEW_DURATION_MS);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') {
      return;
    }
    markBoundsDirty();
    startTouchPreview(event.clientX);
  };

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches.item(0);
    if (!touch) {
      return;
    }
    markBoundsDirty();
    startTouchPreview(touch.clientX);
  };

  const rebuildForWidth = () => {
    const nextLength = resolveSequenceLength(header, edge);
    markBoundsDirty();
    if (nextLength === sequenceLength) {
      return;
    }
    sequenceLength = nextLength;
    sequenceCharacters = buildNucleotideSequence(sequenceLength).split('');
    rebuildEdgeCharacters();
    hoverIndex =
      hoverIndex === null
        ? null
        : clamp(hoverIndex, 0, Math.max(0, sequenceLength - 1));
    if (hoverIndex !== null && reducedMotionQuery.matches) {
      applyHoverPalette(0);
    }
  };

  const stopPermutations = () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const startPermutations = () => {
    if (
      !ENABLE_IDLE_PERMUTATIONS ||
      disposed ||
      reducedMotionQuery.matches ||
      rafId !== null
    ) {
      return;
    }

    const tick = (timestamp: number) => {
      if (disposed) {
        rafId = null;
        return;
      }

      if (timestamp - lastPermutationAt >= PERMUTATION_INTERVAL_MS) {
        lastPermutationAt = timestamp;
        const changedIndices = new Set<number>();
        const swapCount = resolvePermutationCount(sequenceCharacters.length);
        const maxSwaps = sequenceCharacters.length * 2;
        const safeSwaps = Math.max(
          1,
          Math.min(Math.floor(swapCount), maxSwaps),
        );
        for (let index = 0; index < safeSwaps; index += 1) {
          const anchor = Math.floor(Math.random() * sequenceCharacters.length);
          const direction = Math.random() < 0.5 ? -1 : 1;
          const partner =
            (anchor + direction + sequenceCharacters.length) %
            sequenceCharacters.length;
          const anchorChar = sequenceCharacters[anchor];
          const partnerChar = sequenceCharacters[partner];
          if (anchorChar === partnerChar) {
            continue;
          }
          sequenceCharacters[anchor] = partnerChar ?? anchorChar ?? 'A';
          sequenceCharacters[partner] = anchorChar ?? partnerChar ?? 'A';
          changedIndices.add(anchor);
          changedIndices.add(partner);
        }
        renderIndices(changedIndices);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
  };

  const handleReducedMotionChange = () => {
    if (reducedMotionQuery.matches) {
      stopPermutations();
      stopHoverAnimation();
      clearTouchPreviewTimer();
      hoverIndex = null;
      clearRipple();
      clearHoverPalette();
      return;
    }
    startPermutations();
  };

  const scheduleRebuildForWidth = () => {
    if (resizeRaf !== null) {
      window.cancelAnimationFrame(resizeRaf);
    }
    resizeRaf = window.requestAnimationFrame(() => {
      resizeRaf = null;
      rebuildForWidth();
    });
  };

  const handleViewportResize = () => {
    markBoundsDirty();
    scheduleRebuildForWidth();
  };

  const addReducedMotionChangeListener = () => {
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  };

  const removeReducedMotionChangeListener = () => {
    reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
  };

  rebuildEdgeCharacters();
  markBoundsDirty();
  header.addEventListener('pointerenter', markBoundsDirty);
  if (supportsPointerEvents) {
    window.addEventListener('pointermove', handleWindowPointerMove, {
      passive: true,
    });
    header.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    });
  } else {
    window.addEventListener('mousemove', handleWindowMouseMove, {
      passive: true,
    });
    header.addEventListener('touchstart', handleTouchStart, { passive: true });
  }
  window.addEventListener('scroll', markBoundsDirty, {
    passive: true,
  });
  window.addEventListener('resize', handleViewportResize, { passive: true });
  viewport?.addEventListener('resize', handleViewportResize, { passive: true });

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      scheduleRebuildForWidth();
    });
    resizeObserver.observe(header);
  }

  addReducedMotionChangeListener();
  startPermutations();

  return () => {
    disposed = true;
    stopPermutations();
    stopHoverAnimation();
    clearTouchPreviewTimer();
    if (pointerMoveRafId !== null) {
      window.cancelAnimationFrame(pointerMoveRafId);
      pointerMoveRafId = null;
    }
    pendingPointerPosition = null;
    lastPointerSample = null;
    pointerVelocityPxPerMs = 0;
    pointerDeltaX = 0;
    clearRipple();
    clearHoverPalette();
    if (resizeRaf !== null) {
      window.cancelAnimationFrame(resizeRaf);
      resizeRaf = null;
    }
    resizeObserver?.disconnect();
    header.removeEventListener('pointerenter', markBoundsDirty);
    if (supportsPointerEvents) {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      header.removeEventListener('pointerdown', handlePointerDown);
    } else {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      header.removeEventListener('touchstart', handleTouchStart);
    }
    window.removeEventListener('scroll', markBoundsDirty);
    window.removeEventListener('resize', handleViewportResize);
    viewport?.removeEventListener('resize', handleViewportResize);
    removeReducedMotionChangeListener();
  };
};
