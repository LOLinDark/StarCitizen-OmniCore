import { Container, Text, SimpleGrid, Stack } from '@mantine/core';
import { SciFiFrame } from '../components/ui';

const FEATURES = [
  { icon: '🚀', title: 'New Player Guide', desc: 'Path to Prosperity — coming soon' },
  { icon: '🛸', title: 'Ship Database', desc: 'Coming soon' },
  { icon: '📍', title: 'Location Guide', desc: 'Coming soon' },
  { icon: '🎮', title: 'HOTAS Config', desc: 'Coming soon' },
  { icon: '💰', title: 'Economy Tracker', desc: 'Coming soon' },
  { icon: '⚔️', title: 'Loadout Builder', desc: 'Coming soon' },
];

export default function DashboardPage() {
  return (
    <Container size="lg">
      <h1 className="scifi-heading" style={{ marginBottom: 4 }}>OMNI-CORE</h1>
      <Text c="dimmed" mb="lg" style={{ letterSpacing: '0.15em' }}>
        Citizen Operations &amp; Intelligence Network
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {FEATURES.map((f) => (
          <SciFiFrame key={f.title} variant="corners" cornerLength={12} strokeWidth={1} padding={3}>
            <Stack gap={4}>
              <Text size="lg">{f.icon}</Text>
              <Text fw={600} style={{ color: 'var(--oc-cyan)' }}>{f.title}</Text>
              <Text size="sm" c="dimmed">{f.desc}</Text>
            </Stack>
          </SciFiFrame>
        ))}
      </SimpleGrid>
    </Container>
  );
}
