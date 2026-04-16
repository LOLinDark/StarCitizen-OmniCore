import { Group, Button, Badge, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function AerobookBar() {
  const navigate = useNavigate();

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
          style={{
            color: '#00d9ff',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.5rem 0.75rem',
          }}
          onClick={() => navigate('/aerobook')}
        >
          📸 Aerobook
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

      {/* Live Streamers (Roadmap) */}
      <Tooltip label="Coming Soon - Live Streamers Directory" position="bottom">
        <Button
          variant="subtle"
          size="sm"
          disabled
          style={{
            color: 'rgba(255, 107, 0, 0.5)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.5rem 0.75rem',
            cursor: 'not-allowed',
          }}
        >
          🎬 Live
          <Badge size="xs" color="orange" variant="light" ml={4}>
            Soon
          </Badge>
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
    </Group>
  );
}
