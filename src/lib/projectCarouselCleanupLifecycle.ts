/*
--------------------------------------------------------------------------------
personal-site
src/lib/projectCarouselCleanupLifecycle.ts

Registers project carousel cleanup handlers for swap and pagehide lifecycle.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

type BindProjectCarouselCleanupLifecycleOptions = {
  disconnectObserver: () => void;
  disposeEventBindings: () => void;
  cancelCleanupTransition: () => void;
  stopTrackHeightSync: () => void;
  disconnectActivePanelResizeObserver: () => void;
  documentTarget: Document;
  windowTarget: Window;
};

export const bindProjectCarouselCleanupLifecycle = ({
  disconnectObserver,
  disposeEventBindings,
  cancelCleanupTransition,
  stopTrackHeightSync,
  disconnectActivePanelResizeObserver,
  documentTarget,
  windowTarget,
}: BindProjectCarouselCleanupLifecycleOptions) => {
  const cleanup = () => {
    disconnectObserver();
    disposeEventBindings();
    cancelCleanupTransition();
    stopTrackHeightSync();
    disconnectActivePanelResizeObserver();
  };

  documentTarget.addEventListener('astro:before-swap', cleanup, { once: true });
  windowTarget.addEventListener('pagehide', cleanup, { once: true });
};
