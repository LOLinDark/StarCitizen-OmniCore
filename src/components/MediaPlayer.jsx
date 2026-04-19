import YouTubePlayer from './YouTubePlayer';

function getTwitchEmbedUrl(twitchId) {
  if (!twitchId) {
    return '';
  }

  const parent = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `https://player.twitch.tv/?video=v${encodeURIComponent(twitchId)}&parent=${encodeURIComponent(parent)}&autoplay=false`;
}

export default function MediaPlayer({ post, autoplay = false }) {
  if (!post) {
    return null;
  }

  if (post.source === 'twitch' && post.twitchId) {
    return (
      <iframe
        src={getTwitchEmbedUrl(post.twitchId)}
        title={post.title || 'Twitch video'}
        allow="autoplay; fullscreen"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#000',
          borderRadius: '8px',
        }}
      />
    );
  }

  return (
    <YouTubePlayer
      youtubeId={post.youtubeId}
      startSec={0}
      endSec={null}
      title={post.title}
      autoplay={autoplay}
      controls
      loop={false}
    />
  );
}
