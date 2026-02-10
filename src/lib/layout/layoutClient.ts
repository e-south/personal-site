/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/layoutClient.ts

Initializes layout-level client behavior after hydration and page transitions.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { bindLayoutEnhancements } from '@/lib/layout/pageEnhancements';

export const initLayoutClient = () => {
  bindLayoutEnhancements();
};
