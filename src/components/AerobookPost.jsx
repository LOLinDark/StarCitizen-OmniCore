import { Card, Image, Group, Text, Badge } from '@mantine/core';
import { useState } from 'react';
import MediaPlayer from './MediaPlayer';
import { formatRelativeTime } from '../utils/time';

export default function AerobookPost({ post, onSelect }) {
  const [isHovering, setIsHovering] = useState(false);
  const relativeTime = formatRelativeTime(post.publishedAt || post.timestamp);
  const thumbnail = post.thumbnailUrl || (post.youtubeId ? `https://img.youtube.com/vi/${post.youtubeId}/maxresdefault.jpg` : '');
  const sourceEmoji = post.source === 'twitch' ? '🎬' : '▶';
  const viewCount = Number(post.viewCount || 0);
  const likeCount = Number(post.likeCount || 0);
  const creatorLabel = post.creatorHandle || post.creatorName || '@StarCitizen';

  return (
    <Card
      shadow="md"
      p={0}
      radius="md"
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        transition: 'all 0.3s ease',
        backgroundColor: 'rgba(11, 20, 40, 0.8)',
        aspectRatio: '1',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onSelect?.(post)}
      className="aerobook-post"
    >
      {/* Video/Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#000',
        }}
      >
        {isHovering ? (
          <div style={{ width: '100%', height: '100%' }}>
            <MediaPlayer post={post} autoplay />
          </div>
        ) : (
          <Image
            src={thumbnail}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            fallback={
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 217, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00d9ff',
                  fontSize: '2rem',
                }}
              >
                {sourceEmoji}
              </div>
            }
          />
        )}

        {/* Overlay gradient + info (visible on hover) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            background: isHovering
              ? 'transparent'
              : 'linear-gradient(180deg, transparent 50%, rgba(11, 20, 40, 0.9) 100%)',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '12px',
            transition: 'all 0.3s ease',
          }}
        >
          {!isHovering && (
            <>
              <Text
                size="xs"
                fw={600}
                style={{
                  color: '#fff',
                  marginBottom: '4px',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {post.title}
              </Text>
              <Group gap={4} style={{ marginTop: '8px' }}>
                <Badge
                  size="xs"
                  variant="light"
                  style={{
                    backgroundColor: 'rgba(0, 217, 255, 0.2)',
                    color: '#00d9ff',
                    padding: '2px 6px',
                  }}
                >
                  {post.source === 'twitch' ? 'TWITCH' : 'YOUTUBE'}
                </Badge>
                <Text size="xs" c="dimmed">
                  {viewCount.toLocaleString()} views
                </Text>
                <Text size="xs" c="dimmed">
                  {relativeTime}
                </Text>
              </Group>
            </>
          )}
        </div>

        {/* Creator badge (top-left) */}
        <Group
          gap={4}
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            zIndex: 2,
          }}
        >
          <Image
            src={post.creatorAvatar}
            alt={post.creatorHandle}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid #00d9ff',
            }}
            fallback={
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#00d9ff',
                  color: '#0a1428',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {(post.creatorHandle || '@S')[1]}
              </div>
            }
          />
          <Text
            size="xs"
            fw={600}
            style={{
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {creatorLabel}
          </Text>
        </Group>

        {/* Like count (bottom-right on hover) */}
        {isHovering && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#ff006b',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            ❤️ {likeCount.toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
}
