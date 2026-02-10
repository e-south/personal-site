/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselElements.ts

Queries and types DOM elements required by the project carousel runtime.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type QueryProjectCarouselElementsArgs = {
  carousel: HTMLElement;
  cardJumpLinkSelector: string;
};

export type ProjectCarouselElements = {
  track: HTMLElement | null;
  panels: HTMLElement[];
  dots: HTMLButtonElement[];
  prevButtons: HTMLButtonElement[];
  nextButtons: HTMLButtonElement[];
  cardJumpLinks: HTMLAnchorElement[];
};

export const queryProjectCarouselElements = ({
  carousel,
  cardJumpLinkSelector,
}: QueryProjectCarouselElementsArgs): ProjectCarouselElements => {
  const trackElement = carousel.querySelector('[data-carousel-track]');
  const track = trackElement instanceof HTMLElement ? trackElement : null;

  const panels =
    track === null
      ? []
      : Array.from(track.querySelectorAll('[data-carousel-panel]')).filter(
          (panel): panel is HTMLElement => panel instanceof HTMLElement,
        );

  const dots = Array.from(
    carousel.querySelectorAll('[data-carousel-dot]'),
  ).filter((dot): dot is HTMLButtonElement => dot instanceof HTMLButtonElement);

  const prevButtons = Array.from(
    carousel.querySelectorAll('[data-carousel-prev]'),
  ).filter(
    (button): button is HTMLButtonElement =>
      button instanceof HTMLButtonElement,
  );

  const nextButtons = Array.from(
    carousel.querySelectorAll('[data-carousel-next]'),
  ).filter(
    (button): button is HTMLButtonElement =>
      button instanceof HTMLButtonElement,
  );

  const cardJumpLinks = Array.from(
    document.querySelectorAll(cardJumpLinkSelector),
  ).filter(
    (link): link is HTMLAnchorElement => link instanceof HTMLAnchorElement,
  );

  return {
    track,
    panels,
    dots,
    prevButtons,
    nextButtons,
    cardJumpLinks,
  };
};
