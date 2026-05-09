import { Text } from '@mantine/core';

export default function AppFooter() {
  return (
    <footer
      style={{
        padding: '2rem 3%',
        borderTop: '1px solid rgba(0, 217, 255, 0.1)',
        background: 'rgba(4, 8, 20, 0.9)',
        textAlign: 'center',
      }}
    >
      <Text size="xs" fw={700} style={{ color: 'rgba(0, 217, 255, 0.5)', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
        STAR CITIZEN FAN PROJECT
      </Text>
      <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.3)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
        Star Citizen, Squadron 42, Roberts Space Industries, and Cloud Imperium are registered trademarks of Cloud Imperium Rights LLC.
        This is a non-commercial fan project, made under the Star Citizen Fan Kit terms. Not affiliated with or endorsed by Cloud Imperium Games.
      </Text>
    </footer>
  );
}
