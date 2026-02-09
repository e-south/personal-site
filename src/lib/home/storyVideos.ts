/*
--------------------------------------------------------------------------------
personal-site
src/lib/home/storyVideos.ts

Controls autoplay and pause behavior for story videos on the home page.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

export const STORY_VIDEO_CHECK_EVENT = 'story:video-check';

type InitStoryVideosOptions = {
  checkEvent?: string;
};

export const initStoryVideos = ({
  checkEvent = STORY_VIDEO_CHECK_EVENT,
}: InitStoryVideosOptions = {}) => {
  const videos = Array.from(
    document.querySelectorAll('[data-story-video]'),
  ).filter(
    (video): video is HTMLVideoElement => video instanceof HTMLVideoElement,
  );
  if (videos.length === 0) {
    return () => {};
  }

  const cleanup: Array<() => void> = [];
  const addCleanup = (fn: () => void) => cleanup.push(fn);

  const playThreshold = 0.5;
  const pauseThreshold = 0.1;

  const ensurePlaybackAttributes = (video: HTMLVideoElement) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    if (!video.preload || video.preload === 'none') {
      video.preload = 'metadata';
    }
  };

  const setPlaybackState = (video: HTMLVideoElement, shouldPlay: boolean) => {
    const state = video.dataset.playState ?? 'idle';
    if (shouldPlay) {
      if (state === 'playing') {
        return;
      }
      video.dataset.playState = 'playing';
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          video.dataset.playState = 'paused';
        });
      }
      return;
    }
    if (state === 'paused') {
      return;
    }
    video.pause();
    video.dataset.playState = 'paused';
  };

  const updateByRatio = (video: HTMLVideoElement, ratio: number) => {
    if (ratio >= playThreshold) {
      setPlaybackState(video, true);
    } else if (ratio <= pauseThreshold) {
      setPlaybackState(video, false);
    }
  };

  const getVisibilityRatio = (video: HTMLVideoElement) => {
    const rect = video.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const visibleHeight = Math.max(
      0,
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0),
    );
    const visibleWidth = Math.max(
      0,
      Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0),
    );
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.width * rect.height;
    return totalArea > 0 ? visibleArea / totalArea : 0;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLVideoElement)) {
          return;
        }
        updateByRatio(entry.target, entry.intersectionRatio);
      });
    },
    {
      threshold: [0, pauseThreshold, playThreshold, 1],
    },
  );

  videos.forEach((video) => {
    ensurePlaybackAttributes(video);
    observer.observe(video);
    const handleLoaded = () => {
      updateByRatio(video, getVisibilityRatio(video));
    };
    video.addEventListener('loadeddata', handleLoaded);
    addCleanup(() => video.removeEventListener('loadeddata', handleLoaded));
  });

  let checkTimer: number | null = null;
  const scheduleCheck = () => {
    if (checkTimer !== null) {
      window.clearTimeout(checkTimer);
    }
    checkTimer = window.setTimeout(() => {
      checkTimer = null;
      videos.forEach((video) => {
        updateByRatio(video, getVisibilityRatio(video));
      });
    }, 150);
  };

  const handleVideoCheck = () => scheduleCheck();
  window.addEventListener(checkEvent, handleVideoCheck);
  addCleanup(() => window.removeEventListener(checkEvent, handleVideoCheck));

  const handleVisibilityChange = () => {
    if (document.hidden) {
      videos.forEach((video) => {
        video.pause();
        video.dataset.playState = 'paused';
      });
    } else {
      scheduleCheck();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  addCleanup(() =>
    document.removeEventListener('visibilitychange', handleVisibilityChange),
  );

  window.addEventListener('resize', scheduleCheck);
  addCleanup(() => window.removeEventListener('resize', scheduleCheck));

  scheduleCheck();

  return () => {
    observer.disconnect();
    if (checkTimer !== null) {
      window.clearTimeout(checkTimer);
    }
    cleanup.forEach((fn) => fn());
  };
};
