/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselHash.ts

Normalizes project carousel hash parsing and hash update behavior.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type UpdateHashForPanelIdOptions = {
  panelId: string;
  currentHash: string;
  replaceHash: (nextHash: string) => void;
  pushHash: (nextHash: string) => void;
};

const decodePanelId = (value: string) => {
  const panelId = decodeURIComponent(value);
  if (!panelId) {
    return null;
  }
  return panelId;
};

export const getPanelIdFromHash = (hash: string) => {
  if (!hash || hash.length < 2) {
    return null;
  }
  return decodePanelId(hash.slice(1));
};

export const getPanelIdFromHref = (href: string) => {
  if (!href.startsWith('#')) {
    return null;
  }
  return decodePanelId(href.slice(1));
};

export const updateHashForPanelId = ({
  panelId,
  currentHash,
  replaceHash,
  pushHash,
}: UpdateHashForPanelIdOptions) => {
  const nextHash = `#${panelId}`;
  if (currentHash === nextHash) {
    replaceHash(nextHash);
    return;
  }
  pushHash(nextHash);
};
