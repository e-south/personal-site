/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/homeLifecycle.ts

Binds Astro and browser lifecycle events for home runtime boot and teardown.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type BindHomeLifecycleOptions = {
  boot: () => void;
  teardown: () => void;
};

export const bindHomeLifecycle = ({
  boot,
  teardown,
}: BindHomeLifecycleOptions) => {
  document.addEventListener('astro:page-load', boot);
  document.addEventListener('astro:before-swap', teardown);
  window.addEventListener('pagehide', teardown);
};
