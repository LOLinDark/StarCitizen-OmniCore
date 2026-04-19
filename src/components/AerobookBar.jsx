import { Group, Button, Badge, Tooltip } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchLatestMediaMeta } from '../core/api/providers/media';
import VerseMail from './VerseMail';

const STORAGE_KEY = 'omnicore.aerobook.latest-seen';

function readSeenTimestamp() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

function writeSeenTimestamp(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore storage write failures.
  }
}

export default function AerobookBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasNewVideo, setHasNewVideo] = useState(false);
  const [verseMailOpen, setVerseMailOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkLatest() {
      try {
        const latest = await fetchLatestMediaMeta();
        const latestPublishedAt = latest?.latestPublishedAt || null;

        if (!mounted || !latestPublishedAt) {
          return;
        }

        if (location.pathname === '/aerobook') {
          writeSeenTimestamp(latestPublishedAt);
          setHasNewVideo(false);
          return;
        }

        const seen = readSeenTimestamp();
        setHasNewVideo(!seen || Date.parse(latestPublishedAt) > Date.parse(seen));
      } catch {
        if (mounted) {
          setHasNewVideo(false);
        }
      }
    }

    checkLatest();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    function onSeen(event) {
      const value = event?.detail?.latestPublishedAt;
      if (value) {
        writeSeenTimestamp(value);
      }
      setHasNewVideo(false);
    }

    window.addEventListener('aerobook:seen-latest', onSeen);
    return () => window.removeEventListener('aerobook:seen-latest', onSeen);
  }, []);

  return (
    <Group
      gap="xs"
      p="xs"
      style={{
        backgroundColor: 'rgba(11, 20, 40, 0.9)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        minHeight: '44px',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Aerobook Navigation */}
      <Tooltip label="Verse Media" position="bottom">
        <Button
          variant="subtle"
          size="sm"
          onClick={() => navigate('/aerobook')}
          style={{
            color: '#00d9ff',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.5rem 0.75rem',
            position: 'relative',
          }}
        >
          📸 Aerobook
          {hasNewVideo && (
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#27d17c',
                boxShadow: '0 0 8px rgba(39, 209, 124, 0.8)',
              }}
            />
          )}
        </Button>
      </Tooltip>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '20px',
          backgroundColor: 'rgba(0, 217, 255, 0.2)',
          margin: '0 0.5rem',
        }}
      />

      {/* Live Streamers */}
      <Tooltip label="Follow creators and see who is live" position="bottom">
        <Button
          variant="subtle"
          size="sm"
          onClick={() => navigate('/aerobook?tab=live')}
          style={{
            color: '#ff9e44',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.5rem 0.75rem',
          }}
        >
          🎬 Live
          <Badge size="xs" color="orange" variant="light" ml={4}>
            Beta
          </Badge>
        </Button>
      </Tooltip>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '20px',
          backgroundColor: 'rgba(0, 217, 255, 0.2)',
          margin: '0 0.5rem',
        }}
      />

      {/* VerseMail */}
      <Tooltip label="VerseMail — Secure Quantum Transmission" position="bottom">
        <Button
          variant="subtle"
          size="sm"
          onClick={() => setVerseMailOpen(true)}
          style={{
            color: '#b8cfe0',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.5rem 0.75rem',
          }}
        >
          ✉ VerseMail
        </Button>
      </Tooltip>

      {/* More bookmarks (Roadmap) */}
      <Tooltip label="Bookmark customization coming soon" position="bottom">
        <Button
          variant="subtle"
          size="sm"
          disabled
          style={{
            color: 'rgba(0, 255, 136, 0.3)',
            fontSize: '0.85rem',
            fontWeight: 600,
            padding: '0.5rem 0.75rem',
            cursor: 'not-allowed',
          }}
        >
          + More
        </Button>
      </Tooltip>

      {/* VerseMail modal */}
      <VerseMail opened={verseMailOpen} onClose={() => setVerseMailOpen(false)} />
    </Group>
  );
}
