import { useCallback, useEffect, useRef } from 'react';

function onPlayerReadyFactory(autoplay) {
  return (event) => {
    if (autoplay && event?.target) {
      event.target.playVideo();
    }
  };
}

function onPlayerStateChangeFactory(cfgRef, playerRef) {
  return (event) => {
    const { startSec: clipStart, endSec: clipEnd, loop: shouldLoop } = cfgRef.current;

    if (playerRef.current?.checkInterval) {
      clearInterval(playerRef.current.checkInterval);
      playerRef.current.checkInterval = null;
    }

    const hasClipEnd = Number.isFinite(clipEnd);

    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!hasClipEnd) {
        return;
      }

      const checkInterval = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        if (currentTime >= clipEnd) {
          if (shouldLoop) {
            event.target.seekTo(clipStart);
            event.target.playVideo();
          } else {
            event.target.pauseVideo();
          }
        }
      }, 100);

      playerRef.current.checkInterval = checkInterval;
    } else if (event.data === window.YT.PlayerState.ENDED && shouldLoop) {
      event.target.seekTo(clipStart);
      event.target.playVideo();
    }
  };
}

export default function YouTubePlayer({
  youtubeId,
  startSec = 0,
  endSec = null,
  title,
  autoplay = true,
  controls = false,
  loop = true,
}) {
  const playerRef = useRef(null);
  const cfgRef = useRef({ startSec, endSec, loop });

  cfgRef.current = { startSec, endSec, loop };

  const initPlayer = useCallback(() => {
    if (!playerRef.current || !window.YT?.Player || !youtubeId) {
      return;
    }

    if (playerRef.current.player?.destroy) {
      playerRef.current.player.destroy();
    }

    const onReady = onPlayerReadyFactory(autoplay);
    const onStateChange = onPlayerStateChangeFactory(cfgRef, playerRef);

    playerRef.current.player = new window.YT.Player(playerRef.current, {
      width: '100%',
      height: '100%',
      videoId: youtubeId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: controls ? 1 : 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        start: cfgRef.current.startSec,
      },
      events: {
        onReady,
        onStateChange,
      },
    });
  }, [autoplay, controls, youtubeId]);

  useEffect(() => {
    if (!youtubeId) {
      return undefined;
    }

    const playerState = playerRef.current;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (playerState?.checkInterval) {
        clearInterval(playerState.checkInterval);
      }

      if (playerState?.player?.destroy) {
        playerState.player.destroy();
      }
    };
  }, [initPlayer, youtubeId]);

  return (
    <div
      ref={playerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      title={title}
    />
  );
}
