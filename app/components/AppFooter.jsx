import { Anchor, Group, Text } from '@mantine/core';

export default function AppFooter() {
  return (
    <footer
      style={{
        padding: '2rem 3%',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        background: 'rgba(4, 8, 20, 0.9)',
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        {/* Creator */}
        <Text size="sm" fw={700} style={{ color: '#00d9ff', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Created by LOLinDark
        </Text>
        <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.45)', marginBottom: '0.75rem' }}>
          UEE Citizen Record #123919 &middot; Enlisted: Mar 19, 2013
        </Text>

        {/* Links */}
        <Group gap="md" justify="center" mb="md">
          <Anchor href="https://github.com/LOLinDark/StarCitizen-OmniCore" target="_blank" rel="noopener noreferrer" size="xs" style={{ color: '#00d9ff' }}>
            GitHub
          </Anchor>
          <Anchor href="https://github.com/LOLinDark/StarCitizen-OmniCore/issues" target="_blank" rel="noopener noreferrer" size="xs" style={{ color: '#00d9ff' }}>
            Report a Bug
          </Anchor>
          <Anchor href="https://robertsspaceindustries.com/citizens/LOLinDark" target="_blank" rel="noopener noreferrer" size="xs" style={{ color: '#00d9ff' }}>
            RSI Profile
          </Anchor>
        </Group>

        {/* Disclaimer */}
        <Text size="xs" fw={700} style={{ color: 'rgba(255, 189, 89, 0.5)', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
          STAR CITIZEN FAN PROJECT
        </Text>
        <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.25)', lineHeight: 1.6 }}>
          Star Citizen, Squadron 42, Roberts Space Industries, and Cloud Imperium are registered trademarks of Cloud Imperium Rights LLC.
          This is a non-commercial fan project, made under the Star Citizen Fan Kit terms. Not affiliated with or endorsed by Cloud Imperium Games.
        </Text>
      </div>
    </footer>
  );
}
