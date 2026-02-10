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
  const visibilityByVideo = new Map<HTMLVideoElement, number>();

  const attachSourceIfNeeded = (video: HTMLVideoElement) => {
    if (video.dataset.storyVideoAttached === 'true') {
      return;
    }
    const sourceUrl = video.dataset.storyVideoSrc ?? '';
    if (!sourceUrl) {
      throw new Error('Story video source is missing.');
    }
    const source = document.createElement('source');
    source.src = sourceUrl;
    source.type = 'video/mp4';
    video.append(source);
    video.dataset.storyVideoAttached = 'true';
    video.load();
  };

  const ensurePlaybackAttributes = (video: HTMLVideoElement) => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
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
      attachSourceIfNeeded(video);
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
  const getKnownVisibilityRatio = (video: HTMLVideoElement) => {
    const knownRatio = visibilityByVideo.get(video);
    if (typeof knownRatio === 'number') {
      return knownRatio;
    }
    return getVisibilityRatio(video);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!(entry.target instanceof HTMLVideoElement)) {
          return;
        }
        visibilityByVideo.set(entry.target, entry.intersectionRatio);
        updateByRatio(entry.target, entry.intersectionRatio);
      });
    },
    {
      threshold: [0, pauseThreshold, playThreshold, 1],
    },
  );

  videos.forEach((video) => {
    ensurePlaybackAttributes(video);
    visibilityByVideo.set(video, 0);
    observer.observe(video);
    const handleLoaded = () => {
      updateByRatio(video, getKnownVisibilityRatio(video));
    };
    video.addEventListener('loadeddata', handleLoaded);
    addCleanup(() => video.removeEventListener('loadeddata', handleLoaded));
    addCleanup(() => {
      visibilityByVideo.delete(video);
    });
  });

  let checkTimer: number | null = null;
  const scheduleCheck = () => {
    if (checkTimer !== null) {
      window.clearTimeout(checkTimer);
    }
    checkTimer = window.setTimeout(() => {
      checkTimer = null;
      videos.forEach((video) => {
        updateByRatio(video, getKnownVisibilityRatio(video));
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
