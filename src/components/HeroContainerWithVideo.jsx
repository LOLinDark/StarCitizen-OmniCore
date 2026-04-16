import { Group, Stack, Text, Image, Overlay } from '@mantine/core';
import { useState, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import SciFiFrame from './ui/SciFiFrame';

export default function HeroContainerWithVideo({ 
  heroData,
  onClick,
  title,
  description,
}) {
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  if (!heroData) {
    return null;
  }

  const { heroImage, hoverVideo, fallbackImage } = heroData;

  return (
    <Group
      ref={containerRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: isHovering ? '2px solid #00d9ff' : '2px solid rgba(0, 217, 255, 0.3)',
        boxShadow: isHovering
          ? '0 0 30px rgba(0, 217, 255, 0.5), inset 0 0 30px rgba(0, 217, 255, 0.1)'
          : '0 0 15px rgba(0, 217, 255, 0.2)',
      }}
    >
      {/* Background Image (always visible when not hovering) */}
      {!isHovering && (
        <Image
          src={heroImage.url}
          alt={heroImage.alt}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            top: 0,
            left: 0,
          }}
          fallback={
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#00d9ff',
              }}
            >
              ▶
            </div>
          }
        />
      )}

      {/* Hover Video Player */}
      {isHovering && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          }}
        >
          <VideoPlayer
            videoPath={hoverVideo.videoPath}
            title={hoverVideo.title}
            autoplay={true}
            loop={true}
            muted={true}
          />
        </div>
      )}

      {/* Overlay Gradient + Text (visible when not hovering) */}
      {!isHovering && (
        <Overlay
          gradient="linear-gradient(180deg, transparent 0%, rgba(11, 20, 40, 0.8) 100%)"
          opacity={1}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* Text Content (visible when not hovering) */}
      {!isHovering && (
        <Stack
          gap="md"
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            zIndex: 2,
            color: '#fff',
          }}
        >
          <div>
            <Text
              size="xl"
              fw={700}
              style={{
                color: '#00d9ff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              {title}
            </Text>
            <Text
              size="sm"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {description}
            </Text>
          </div>
          <Text
            size="xs"
            style={{
              color: 'rgba(0, 217, 255, 0.8)',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            ▶ Hover to explore
          </Text>
        </Stack>
      )}

      {/* Click Indicator */}
      {isHovering && (
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            zIndex: 3,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          <Text size="sm" fw={600} style={{ color: '#00d9ff' }}>
            Click to Learn More →
          </Text>
        </div>
      )}
    </Group>
  );
}
