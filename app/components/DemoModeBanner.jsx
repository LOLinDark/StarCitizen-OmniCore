import { Anchor, Badge, Box, Collapse, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useServerStatus } from '../hooks/useServerStatus';

/**
 * Shown across the whole app when the local OmniCore server is not reachable.
 * This is the normal state on GitHub Pages / any static host.
 */
export default function DemoModeBanner() {
  const { isChecking, serverAvailable } = useServerStatus();
  const [expanded, setExpanded] = useState(false);

  // Don't render anything while the first probe is in flight, or if server is up
  if (isChecking || serverAvailable) return null;

  return (
    <Box
      style={{
        background: 'linear-gradient(90deg, rgba(255,182,0,0.10) 0%, rgba(255,107,0,0.08) 100%)',
        borderBottom: '1px solid rgba(255,182,0,0.30)',
        padding: '0.55rem 1.25rem',
      }}
    >
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Group gap="sm" wrap="wrap">
          <Badge
            size="sm"
            variant="outline"
            style={{ borderColor: '#ffb600', color: '#ffb600', fontWeight: 700, letterSpacing: '0.07em' }}
          >
            DEMO MODE
          </Badge>
          <Text size="xs" style={{ color: 'rgba(255,210,100,0.9)' }}>
            You're viewing OmniCore online. Most tools require the local desktop server to function.
          </Text>
        </Group>

        <Text
          size="xs"
          style={{ color: 'rgba(255,182,0,0.75)', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Less info ▲' : 'More info ▼'}
        </Text>
      </Group>

      <Collapse in={expanded}>
        <Stack gap="xs" mt="sm" style={{ maxWidth: 780 }}>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            OmniCore is built primarily as a <strong style={{ color: 'rgba(255,255,255,0.75)' }}>local desktop application</strong> — it runs
            alongside Star Citizen on your own machine, where it can read and write your game profile XML files,
            manage HOTAS bindings, and sync data with your local drive. The GitHub Pages version is a
            live preview of the interface only; no data is loaded or saved while you're here.
          </Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Want to run it fully?</strong>{' '}
            Download the project from{' '}
            <Anchor
              href="https://github.com/LOLinDark/StarCitizen-OmniCore"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              style={{ color: '#00d9ff' }}
            >
              GitHub
            </Anchor>
            {' '}and follow the setup instructions to run it on localhost.
          </Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Want an online version?</strong>{' '}
            Online support — including server-side features, cloud sync, and a hosted backend — is planned but
            requires ongoing development work. If you'd like to see this happen sooner,{' '}
            <Anchor
              href="https://github.com/sponsors/LOLinDark"
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              style={{ color: '#22d17b' }}
            >
              consider supporting development
            </Anchor>
            {' '}and request it — community funding directly shapes what gets built next.
          </Text>
          <Text size="xs" style={{ color: 'rgba(255,182,0,0.55)', fontStyle: 'italic' }}>
            Features available right now without a server: Academy Feature Library, Training Guide, and most reference content.
          </Text>
        </Stack>
      </Collapse>
    </Box>
  );
}
