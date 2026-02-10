/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/storyNavigationLinks.ts

Binds hash-navigation links to story section scroll targets.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type BindStoryNavigationLinksOptions = {
  links: Element[];
  label: string;
  boundLinks: Set<Element>;
  bindToTarget: (
    link: HTMLAnchorElement,
    target: HTMLElement,
    href: string,
    label: string,
  ) => void;
};

export const bindStoryNavigationLinks = ({
  links,
  label,
  boundLinks,
  bindToTarget,
}: BindStoryNavigationLinksOptions) => {
  links.forEach((link) => {
    if (boundLinks.has(link)) {
      return;
    }
    if (!(link instanceof HTMLAnchorElement)) {
      throw new Error(`${label} control must be a link.`);
    }
    const href = link.getAttribute('href') ?? '';
    if (!href.startsWith('#')) {
      throw new Error(`${label} href must be a hash.`);
    }
    const target = document.querySelector(href);
    if (!(target instanceof HTMLElement)) {
      throw new Error(`${label} target is missing.`);
    }
    boundLinks.add(link);
    bindToTarget(link, target, href, label);
  });
};
