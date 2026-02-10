/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/layoutNavigation.ts

Builds navbar link sets for the layout using content-aware navigation rules.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { getNavigation, features } from '@/data/navigation';
import { hasPublishedBlogPosts } from '@/lib/content';

export const getLayoutNavigation = async () => {
  const blogAvailable = await hasPublishedBlogPosts();
  const navigation = getNavigation({
    blogAvailable,
    blogNavMode: features.blogNav,
  });
  const { internal: navItems, external: externalLinks } = navigation;
  return { navItems, externalLinks };
};
