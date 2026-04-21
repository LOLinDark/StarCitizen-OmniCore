import { useMemo, useState } from 'react';
import { Badge, Box, Button, Card, Group, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import DevTag from '../components/DevTag';

const roleOptions = [
  { value: 'pilot', label: 'Pilot' },
  { value: 'copilot', label: 'Co-pilot' },
  { value: 'gunner', label: 'Turret / Gunner' },
  { value: 'mining', label: 'Mining Operator' },
  { value: 'salvage', label: 'Salvage Operator' },
];

const shipClassOptions = [
  { value: 'fighter', label: 'Fighter' },
  { value: 'multicrew', label: 'Multi-crew' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'hauler', label: 'Hauler' },
  { value: 'explorer', label: 'Explorer' },
];

const modeOptions = [
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
];

export default function DeveloperHotasProfileMatrixLabPage() {
  const [role, setRole] = useState('pilot');
  const [shipClass, setShipClass] = useState('fighter');
  const [activeMode, setActiveMode] = useState('green');

  const generatedProfileName = useMemo(() => {
    return `omnicore_${role}_${shipClass}_${activeMode}.xml`;
  }, [role, shipClass, activeMode]);

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}><DevTag tag="HC07" />Profile Matrix Lab (Phase 4)</Title>
        <Text c="dimmed" mt={4}>
          Developer test surface for role + ship + mode profile generation and instant XML apply workflows.
        </Text>
        <Group gap="xs" mt="xs">
          <Badge color="yellow" variant="light">Current device target: X52</Badge>
          <Text size="sm" c="dimmed">Logitech/Saitek X52 three-mode workflow is the active implementation baseline.</Text>
        </Group>
      </div>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Select label="Role" value={role} onChange={(value) => setRole(value || 'pilot')} data={roleOptions} />
        <Select label="Ship Class" value={shipClass} onChange={(value) => setShipClass(value || 'fighter')} data={shipClassOptions} />
        <Select label="Mode" value={activeMode} onChange={(value) => setActiveMode(value || 'green')} data={modeOptions} />
      </SimpleGrid>

      <Card withBorder radius="md" p="md">
        <Stack gap="xs">
          <Group justify="space-between">
            <Text fw={600}>Generated Variant (Preview)</Text>
            <Badge color="cyan" variant="light">Prototype</Badge>
          </Group>
          <Text size="sm">Target output file: {generatedProfileName}</Text>
          <Text size="sm" c="dimmed">
            This page scaffolds the matrix workflow. Actual merge/export/apply endpoints are the next implementation step.
          </Text>
          <Group>
            <Button variant="light" color="cyan" disabled>
              Generate Variant XML (coming soon)
            </Button>
            <Button variant="light" color="orange" disabled>
              Apply Variant to Live Mapping (coming soon)
            </Button>
          </Group>
        </Stack>
      </Card>

      <Box
        p="md"
        style={{
          border: '1px solid rgba(76, 201, 240, 0.35)',
          borderRadius: '8px',
          background: 'rgba(76, 201, 240, 0.08)',
        }}
      >
        <Text size="sm" fw={600}>Planned Next Steps</Text>
        <Text size="sm">Current scope: keep HC07 aligned with X52 mode semantics before expanding to other HOTAS models.</Text>
        <Text size="sm">1. Add profile template model (base + mode overrides + role/ship modifiers).</Text>
        <Text size="sm">2. Add backend endpoint to materialize and write variant XML files.</Text>
        <Text size="sm">3. Add one-click active profile switch into Star Citizen mappings folder.</Text>
      </Box>
    </Stack>
  );
}
