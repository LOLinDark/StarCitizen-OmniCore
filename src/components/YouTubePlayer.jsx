import { useEffect, useRef } from 'react';

export default function YouTubePlayer({ youtubeId, startSec = 0, endSec = 15, title, autoplay = true }) {
  const playerRef = useRef(null);
  const windowRef = useRef({ startSec, endSec });

  useEffect(() => {
    // Dynamically load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      // Cleanup
    };
  }, []);

  const initPlayer = () => {
    if (!playerRef.current) return;

    const player = new window.YT.Player(playerRef.current, {
      width: '100%',
      height: '100%',
      videoId: youtubeId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        start: windowRef.current.startSec,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    // Store player instance for later use
    playerRef.current.player = player;
  };

  const onPlayerReady = (event) => {
    // Optionally start playback
    if (event.target) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    const { startSec, endSec } = windowRef.current;
    const duration = endSec - startSec;

    if (event.data === window.YT.PlayerState.PLAYING) {
      // Check current time every 100ms
      const checkInterval = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        const clipStartTime = startSec;

        // If we've gone past the end time, loop back to start
        if (currentTime >= endSec) {
          event.target.seekTo(clipStartTime);
          event.target.playVideo();
        }
      }, 100);

      // Store interval ID for cleanup
      playerRef.current.checkInterval = checkInterval;
    } else if (event.data === window.YT.PlayerState.ENDED) {
      // Loop: seek to start and play again
      event.target.seekTo(startSec);
      event.target.playVideo();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      // Clean up interval when paused
      if (playerRef.current.checkInterval) {
        clearInterval(playerRef.current.checkInterval);
      }
    }
  };

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
