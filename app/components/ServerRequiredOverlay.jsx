import { Anchor, Badge, Box, Group, Stack, Text, Title } from '@mantine/core';

/**
 * Full-page overlay shown on feature pages that require the local OmniCore server.
 * Renders in place of (or above) the page content when no backend is available.
 *
 * Props:
 *   featureName  string  e.g. "Peripheral Configuration"
 *   reason       string  optional extra detail about what specifically needs the server
 */
export default function ServerRequiredOverlay({ featureName = 'This feature', reason }) {
  return (
    <Box
      p="xl"
      style={{
        border: '1px solid rgba(255, 182, 0, 0.25)',
        borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(30,16,0,0.7) 0%, rgba(10,8,0,0.85) 100%)',
        maxWidth: 680,
        margin: '3rem auto',
      }}
    >
      <Stack gap="md">
        <Group gap="sm">
          <Badge size="md" variant="outline" style={{ borderColor: '#ffb600', color: '#ffb600', fontWeight: 700 }}>
            SERVER REQUIRED
          </Badge>
          <Badge size="sm" variant="light" color="gray">
            Demo Mode
          </Badge>
        </Group>

        <div>
          <Title order={3} style={{ color: 'rgba(255,210,100,0.9)', marginBottom: '0.4rem' }}>
            {featureName} needs the local server
          </Title>
          <Text size="sm" c="dimmed" style={{ lineHeight: 1.65 }}>
            {reason || (
              <>
                This tool reads and writes files on your machine — your Star Citizen game profile XMLs,
                HOTAS binding data, and local settings. That requires the OmniCore desktop server running
                on localhost alongside your game.
              </>
            )}
          </Text>
        </div>

        <Stack gap={6}>
          <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            To use this feature:
          </Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            1. Download the project from{' '}
            <Anchor
              href="https://github.com/LOLinDark/StarCitizen-OmniCore"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00d9ff' }}
            >
              github.com/LOLinDark/StarCitizen-OmniCore
            </Anchor>
            {' '}and follow the README setup guide.
          </Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            2. Start the local server (<code style={{ color: '#22d17b', background: 'rgba(34,209,123,0.1)', padding: '1px 5px', borderRadius: 3 }}>npm run server</code>), then open{' '}
            <code style={{ color: '#00d9ff', background: 'rgba(0,217,255,0.08)', padding: '1px 5px', borderRadius: 3 }}>http://localhost:4242</code>.
          </Text>
          <Text size="xs" c="dimmed" style={{ lineHeight: 1.6 }}>
            3. Star Citizen must be installed — the server locates your profile files automatically.
          </Text>
        </Stack>

        <Box
          p="sm"
          style={{
            borderRadius: 6,
            border: '1px solid rgba(34,209,123,0.2)',
            background: 'rgba(34,209,123,0.04)',
          }}
        >
          <Text size="xs" style={{ color: 'rgba(34,209,123,0.85)', lineHeight: 1.6 }}>
            <strong>Want a hosted online version?</strong>{' '}
            Online support is planned. Community funding directly determines what gets built next —
            if this matters to you,{' '}
            <Anchor
              href="https://github.com/sponsors/LOLinDark"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#22d17b' }}
            >
              consider supporting development
            </Anchor>
            {' '}and request it.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
