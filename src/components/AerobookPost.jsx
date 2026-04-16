import { Card, Image, Group, Stack, Text, Badge, ActionIcon } from '@mantine/core';
import { useState } from 'react';
import YouTubePlayer from './YouTubePlayer';

export default function AerobookPost({ post, onSelect }) {
  const [isHovering, setIsHovering] = useState(false);

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
            <YouTubePlayer
              youtubeId={post.youtubeId}
              startSec={post.startSec}
              endSec={post.endSec}
              title={post.title}
              autoplay={true}
            />
          </div>
        ) : (
          <Image
            src={`https://img.youtube.com/vi/${post.youtubeId}/maxresdefault.jpg`}
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
                ▶
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
                  {post.category === 'star-citizen' && '🚀'}
                  {post.category === 'squadron-42' && '⚔️'}
                  {post.category === 'community-highlights' && '👥'}
                </Badge>
                <Text size="xs" c="dimmed">
                  {post.viewCount.toLocaleString()} views
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
                {post.creatorHandle[1]}
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
            {post.creatorHandle}
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
            ❤️ {post.likeCount.toLocaleString()}
          </div>
        )}
      </div>
    </Card>
  );
}
