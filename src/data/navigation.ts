export type BlogNavMode = 'auto' | 'show' | 'hide';

export type InternalNavItem = {
  label: string;
  href: `/${string}` | '/';
  kind: 'internal';
};

export type ExternalNavItem = {
  label: string;
  href: `http${'s' | ''}://${string}`;
  kind: 'external';
  icon: 'scholar' | 'github' | 'linkedin' | 'bluesky' | 'x';
};

export type NavItem = InternalNavItem | ExternalNavItem;

export type Navigation = {
  internal: InternalNavItem[];
  external: ExternalNavItem[];
};

export const features = {
  blogNav: 'auto',
} satisfies { blogNav: BlogNavMode };

export const SCHOLAR_URL =
  'https://scholar.google.com/citations?user=1VGyau8AAAAJ&hl=en';
export const BLUESKY_URL = 'https://bsky.app/profile/ericsouth.bsky.social';
export const X_URL = 'https://x.com/ericsouth_';

const baseNavItems = [
  { label: 'CV', href: '/cv', kind: 'internal' },
  { label: 'Projects', href: '/projects', kind: 'internal' },
  { label: 'Publications', href: '/publications', kind: 'internal' },
] satisfies readonly InternalNavItem[];

const blogNavItem: InternalNavItem = {
  label: 'Blog',
  href: '/blog',
  kind: 'internal',
};
const contactNavItem: InternalNavItem = {
  label: 'Contact',
  href: '/contact',
  kind: 'internal',
};

const externalNavItems = [
  {
    label: 'Google Scholar',
    href: SCHOLAR_URL,
    kind: 'external',
    icon: 'scholar',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/e-south',
    kind: 'external',
    icon: 'github',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/eric-south-xyz/',
    kind: 'external',
    icon: 'linkedin',
  },
  { label: 'Bluesky', href: BLUESKY_URL, kind: 'external', icon: 'bluesky' },
  { label: 'X', href: X_URL, kind: 'external', icon: 'x' },
] satisfies readonly ExternalNavItem[];

export const getNavigation = (options?: {
  blogAvailable?: boolean;
  blogNavMode?: BlogNavMode;
}): Navigation => {
  const { blogAvailable = false, blogNavMode = features.blogNav } =
    options ?? {};
  const shouldShowBlog =
    blogNavMode === 'show' || (blogNavMode === 'auto' && blogAvailable);

  const internal = shouldShowBlog
    ? [...baseNavItems, blogNavItem, contactNavItem]
    : [...baseNavItems, contactNavItem];

  return { internal, external: externalNavItems };
};
