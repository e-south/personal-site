/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/stickyHeaderOffset.ts

Provides shared sticky-header lookup and offset calculations for scroll alignment.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

const coerceFiniteNumber = (value: unknown, fallback = 0) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return numericValue;
};

const readHeaderHeight = (header: Element | null) => {
  if (!(header instanceof HTMLElement)) {
    return 0;
  }
  return coerceFiniteNumber(header.offsetHeight);
};

const readHeaderPosition = (header: Element | null) => {
  if (!(header instanceof HTMLElement) || typeof window === 'undefined') {
    return '';
  }
  return window.getComputedStyle(header).position;
};

type StickyHeaderOffsetOptions = {
  header: Element | null;
  baseOffsetPx?: number;
  minOffsetPx?: number;
};

export const getStickyHeader = () =>
  document.querySelector('[data-site-header]');

export const isStickyHeader = (header: Element | null) => {
  const position = readHeaderPosition(header);
  return position === 'sticky' || position === '-webkit-sticky';
};

export const getStickyHeaderOffset = ({
  header,
  baseOffsetPx = 0,
  minOffsetPx = Number.NEGATIVE_INFINITY,
}: StickyHeaderOffsetOptions) => {
  const headerHeight = isStickyHeader(header) ? readHeaderHeight(header) : 0;
  const offset = headerHeight + coerceFiniteNumber(baseOffsetPx);
  return Math.max(coerceFiniteNumber(minOffsetPx), offset);
};

export const getScrollMarginTop = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return coerceFiniteNumber(Number.parseFloat(style.scrollMarginTop || '0'));
};
