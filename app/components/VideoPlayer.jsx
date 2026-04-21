import { useRef, useEffect } from 'react';

/**
 * VideoPlayer - HTML5 video player component
 * Plays local MP4 files without YouTube UI/branding
 * 
 * Props:
 *   - videoPath: string - Path to MP4 file (e.g., '/assets/videos/star-citizen-hero.mp4')
 *   - title: string - Video title (for accessibility)
 *   - autoplay: boolean - Auto-play on mount (default: false)
 *   - loop: boolean - Loop when finished (default: true)
 *   - muted: boolean - Start muted (default: true for autoplay)
 */
export default function VideoPlayer({ 
  videoPath, 
  title = 'Video',
  autoplay = false,
  loop = true,
  muted = true,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (autoplay) {
      // Autoplay with muted required by browsers for policy compliance
      video.muted = true;
      video.play().catch((err) => {
        console.log('Autoplay prevented:', err);
      });
    }

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [autoplay, videoPath]);

  return (
    <video
      ref={videoRef}
      title={title}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
    >
      <source src={videoPath} type="video/mp4" />
      <p>Your browser does not support HTML5 video.</p>
    </video>
  );
}
