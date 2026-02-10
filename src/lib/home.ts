/*
--------------------------------------------------------------------------------
personal-site
src/lib/home.ts

Initializes home page runtime and binds one-time lifecycle wiring.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { bindHomeLifecycle } from '@/lib/home/homeLifecycle';
import { createHomeRuntime } from '@/lib/home/homeRuntime';

const homeRuntime = createHomeRuntime();

export const initHomePage = () => {
  const controllerKey = '__homeController';
  const docEl = document.documentElement as HTMLHtmlElement & {
    [key: string]: unknown;
  };
  const existingController = docEl[controllerKey] as
    | { boot: () => void }
    | undefined;
  if (existingController) {
    existingController.boot();
    return;
  }
  const controller = {
    boot: homeRuntime.boot,
    teardown: homeRuntime.teardown,
  };
  docEl[controllerKey] = controller;
  bindHomeLifecycle({
    boot: homeRuntime.boot,
    teardown: homeRuntime.teardown,
  });
  homeRuntime.boot();
};
