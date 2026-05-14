import { useState, useMemo, useEffect } from 'react';
import { Badge, Box, Card, Group, Select, Stack, Text, Title, Code, Table } from '@mantine/core';
import DevTag from '../components/DevTag';
import { shipKeybindings, shipControlsCategories } from '../data/starcitizen-keybindings';
import { featureToStarCitizenAction, parseInputString, formatInputForDisplay } from '../utils/starCitizenActionMap';
import { X52_BUTTONS, X52_AXES } from '../libraries/hotas';

// Sample a few bindings to demonstrate the data flow
const SAMPLE_FEATURE_IDS = [
  'flight_pitch_axis',
  'flight_throttle_up',
  'flight_strafe_up',
  'flight_boost',
  'weapons_fire_group_1',
  'flight_landing_system_toggle',
];

function DataNode({ label, color = '#00d9ff', children, badge }) {
  return (
    <Card
      p="sm"
      radius="sm"
      style={{
        border: `1px solid ${color}55`,
        background: `${color}08`,
        minWidth: 200,
      }}
    >
      <Group gap="xs" mb={4}>
        <Text size="xs" fw={700} style={{ color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Text>
        {badge && <Badge size="xs" color={color} variant="light">{badge}</Badge>}
      </Group>
      {children}
    </Card>
  );
}

function Arrow({ label, direction = 'right' }) {
  const char = direction === 'right' ? '→' : '↓';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.25rem 0.5rem' }}>
      <Text size="xs" c="dimmed" fw={600} style={{ whiteSpace: 'nowrap' }}>
        {char} {label}
      </Text>
    </div>
  );
}

export default function DeveloperHotasDataFlowPage() {
  const [selectedFeature, setSelectedFeature] = useState(SAMPLE_FEATURE_IDS[0]);
  const [profileBindings, setProfileBindings] = useState(null);
  const [profileName, setProfileName] = useState(null);

  // Load first available profile for live data demo
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/hotas/profiles');
        if (!res.ok) return;
        const { profiles } = await res.json();
        if (!profiles?.length) return;
        const first = profiles[0].name;
        setProfileName(first);
        const profileRes = await fetch(`/api/hotas/profile/${first}`);
        if (!profileRes.ok) return;
        const { xmlContent } = await profileRes.json();
        // Extract raw rebind lines for display
        const rebindPattern = /<action\s+name="([^"]+)"[^>]*>[\s\S]*?<rebind\s+input="([^"]+)"/gi;
        const map = {};
        let match;
        while ((match = rebindPattern.exec(xmlContent)) !== null) {
          const action = match[1].toLowerCase();
          if (!map[action]) map[action] = [];
          map[action].push(match[2]);
        }
        setProfileBindings(map);
      } catch { /* ignore */ }
    }
    loadProfile();
  }, []);

  const featureData = useMemo(() => {
    const binding = shipKeybindings.find((b) => b.id === selectedFeature);
    if (!binding) return null;

    const actionNames = featureToStarCitizenAction[selectedFeature] || [];
    const xmlTokens = actionNames.flatMap((a) => profileBindings?.[a.toLowerCase()] || []);
    const x52Match = xmlTokens.length > 0 ? xmlTokens[0] : null;

    // Find X52 device mapping
    let deviceInfo = null;
    if (x52Match) {
      const btnMatch = x52Match.match(/js1_button(\d+)/i);
      const axisMatch = x52Match.match(/js1_axis(\d+)/i);
      if (btnMatch) {
        const winIdx = parseInt(btnMatch[1]);
        const entry = Object.entries(X52_BUTTONS).find(([, m]) => (m.windowsIndex ?? parseInt(Object.keys(X52_BUTTONS).find((k) => X52_BUTTONS[k] === m)) + 1) === winIdx);
        deviceInfo = entry ? { type: 'Button', name: entry[1].name, group: entry[1].group } : { type: 'Button', name: `Button ${winIdx}`, group: 'Unknown' };
      } else if (axisMatch) {
        const axisIdx = parseInt(axisMatch[1]);
        const meta = X52_AXES[axisIdx];
        deviceInfo = meta ? { type: 'Axis', name: meta.name, group: meta.group } : { type: 'Axis', name: `Axis ${axisIdx}`, group: 'Unknown' };
      }
    }

    return { binding, actionNames, xmlTokens, x52Match, deviceInfo };
  }, [selectedFeature, profileBindings]);

  const featureOptions = SAMPLE_FEATURE_IDS.map((id) => {
    const b = shipKeybindings.find((k) => k.id === id);
    return { value: id, label: b ? `${b.feature} (${id})` : id };
  });

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}><DevTag tag="HC08" />HOTAS Data Flow Diagram</Title>
        <Text c="dimmed" mt={4}>
          Interactive visualization of how data flows between the game's XML profile, OmniCore's internal mapping, and the two table views.
        </Text>
        <Text size="xs" c="dimmed" mt="xs">
          Select a feature below to trace its data path end-to-end. Mismatches between layers will be highlighted.
        </Text>
      </div>

      <Select
        label="Trace Feature"
        value={selectedFeature}
        onChange={(v) => setSelectedFeature(v || SAMPLE_FEATURE_IDS[0])}
        data={featureOptions}
        style={{ maxWidth: 400 }}
      />

      {featureData && (
        <>
          {/* Layer 1: Data Sources */}
          <Title order={4} style={{ color: '#00d9ff' }}>Data Pipeline</Title>

          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <DataNode label="starcitizen-keybindings.js" color="#00d9ff" badge="Internal">
              <Text size="xs"><strong>id:</strong> {featureData.binding.id}</Text>
              <Text size="xs"><strong>feature:</strong> {featureData.binding.feature}</Text>
              <Text size="xs"><strong>category:</strong> {featureData.binding.category}</Text>
              <Text size="xs"><strong>defaultKey:</strong> {featureData.binding.primaryKey || '—'}</Text>
            </DataNode>

            <Arrow label="featureToStarCitizenAction" />

            <DataNode label="starCitizenActionMap.js" color="#ff6b00" badge="Mapping">
              <Text size="xs"><strong>SC action(s):</strong></Text>
              {featureData.actionNames.length > 0 ? (
                featureData.actionNames.map((a) => (
                  <Code key={a} style={{ fontSize: '0.7rem', display: 'block' }}>{a}</Code>
                ))
              ) : (
                <Text size="xs" c="red">⚠ No mapping defined</Text>
              )}
            </DataNode>

            <Arrow label="XML parse + match" />

            <DataNode label="Game XML Profile" color="#22d17b" badge={profileName || 'No profile'}>
              {featureData.xmlTokens.length > 0 ? (
                featureData.xmlTokens.map((t) => (
                  <Code key={t} style={{ fontSize: '0.7rem', display: 'block' }}>{t}</Code>
                ))
              ) : (
                <Text size="xs" c="dimmed">No binding found in profile</Text>
              )}
            </DataNode>

            <Arrow label="X52 device map" />

            <DataNode label="X52 Physical Input" color="#b300ff" badge="Device">
              {featureData.deviceInfo ? (
                <>
                  <Text size="xs"><strong>type:</strong> {featureData.deviceInfo.type}</Text>
                  <Text size="xs"><strong>name:</strong> {featureData.deviceInfo.name}</Text>
                  <Text size="xs"><strong>group:</strong> {featureData.deviceInfo.group}</Text>
                </>
              ) : (
                <Text size="xs" c="dimmed">No device match</Text>
              )}
            </DataNode>
          </div>

          {/* Validation */}
          <Card p="sm" radius="sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Text size="xs" fw={700} mb={4} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6a8898' }}>
              Pipeline Status
            </Text>
            <Group gap="sm">
              <Badge
                color={featureData.actionNames.length > 0 ? 'green' : 'red'}
                variant="light"
                size="sm"
              >
                Action Map: {featureData.actionNames.length > 0 ? 'OK' : 'MISSING'}
              </Badge>
              <Badge
                color={featureData.xmlTokens.length > 0 ? 'green' : 'yellow'}
                variant="light"
                size="sm"
              >
                XML Binding: {featureData.xmlTokens.length > 0 ? 'Found' : 'Not in profile'}
              </Badge>
              <Badge
                color={featureData.deviceInfo ? 'green' : 'yellow'}
                variant="light"
                size="sm"
              >
                Device Match: {featureData.deviceInfo ? 'Resolved' : 'No match'}
              </Badge>
            </Group>
          </Card>

          {/* Table rendering context */}
          <Title order={4} style={{ color: '#00d9ff' }}>Table Rendering</Title>
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <DataNode label="Profile Bindings Table (HC05)" color="#00d9ff" badge="Features → Inputs">
              <Text size="xs">Row shows: <strong>{featureData.binding.feature}</strong></Text>
              <Text size="xs">HOTAS col: {featureData.x52Match || featureData.binding.hotasBinding || '—'}</Text>
              <Text size="xs">KB col: {featureData.binding.keyboardBinding || featureData.binding.primaryKey || '—'}</Text>
            </DataNode>

            <DataNode label="Input Assignment Table" color="#b300ff" badge="Inputs → Features">
              {featureData.deviceInfo ? (
                <>
                  <Text size="xs">Row shows: <strong>{featureData.deviceInfo.name}</strong></Text>
                  <Text size="xs">Assigned Feature: {featureData.binding.feature}</Text>
                </>
              ) : (
                <Text size="xs" c="dimmed">Input not resolved — won't appear in table</Text>
              )}
            </DataNode>
          </div>
        </>
      )}

      {/* Architecture reference */}
      <Box
        p="md"
        style={{
          border: '1px solid rgba(0, 217, 255, 0.2)',
          borderRadius: 8,
          background: 'rgba(0, 217, 255, 0.04)',
        }}
      >
        <Text size="sm" fw={700} mb="xs">File Reference</Text>
        <Table horizontalSpacing="xs" verticalSpacing={4} style={{ fontSize: '0.75rem' }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>File</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Key Export</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td><Code>app/data/starcitizen-keybindings.js</Code></Table.Td>
              <Table.Td>Feature definitions (id, name, category, defaults)</Table.Td>
              <Table.Td><Code>shipKeybindings</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code>app/utils/starCitizenActionMap.js</Code></Table.Td>
              <Table.Td>OmniCore feature ID → SC XML action name(s)</Table.Td>
              <Table.Td><Code>featureToStarCitizenAction</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code>app/utils/starCitizenProfileParser.js</Code></Table.Td>
              <Table.Td>Parses game XML into structured binding objects</Table.Td>
              <Table.Td><Code>StarCitizenProfileParser</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code>app/libraries/hotas/index.js</Code></Table.Td>
              <Table.Td>X52 device map (buttons, axes, modes, names)</Table.Td>
              <Table.Td><Code>X52_BUTTONS, X52_AXES</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code>SC/LIVE/.../mappings/*.xml</Code></Table.Td>
              <Table.Td>Player's actual keybinding profile (game file)</Table.Td>
              <Table.Td>Read via <Code>/api/hotas/profile/:name</Code></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
}
