import {
  Badge,
  Button,
  Card,
  Code,
  ColorInput,
  Container,
  Group,
  List,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMemo, useState } from 'react';
import { useSettingsStore } from '../stores';
import {
  buildThemeExport,
  getThemePresetById,
  mapThemeToWordPressVars,
  THEME_LAB_STANDARD_VERSION,
  THEME_PRESETS
} from '../theme/themeLabStandard';

export default function ThemePage() {
  const customTheme = useSettingsStore((s) => s.customTheme);
  const setCustomTheme = useSettingsStore((s) => s.setCustomTheme);
  const resetCustomTheme = useSettingsStore((s) => s.resetCustomTheme);

  const initialTheme = customTheme || { presetId: THEME_PRESETS[0].id, ...THEME_PRESETS[0].tokens };
  const [presetId, setPresetId] = useState(initialTheme.presetId);
  const [primaryColor, setPrimaryColor] = useState(initialTheme.primaryColor);
  const [accentColor, setAccentColor] = useState(initialTheme.accentColor || '#38bdf8');
  const [surfaceColor, setSurfaceColor] = useState(initialTheme.surfaceColor || '#ecfeff');
  const [radius, setRadius] = useState(initialTheme.radius || 'md');
  const [fontFamily, setFontFamily] = useState(initialTheme.fontFamily || '"Poppins", "Segoe UI", sans-serif');
  const [importText, setImportText] = useState('');

  const currentTheme = useMemo(() => ({
    presetId,
    primaryColor,
    accentColor,
    surfaceColor,
    radius,
    fontFamily
  }), [presetId, primaryColor, accentColor, surfaceColor, radius, fontFamily]);

  const wordpressMap = useMemo(() => mapThemeToWordPressVars(currentTheme), [currentTheme]);

  function applyPreset(nextPresetId) {
    const preset = getThemePresetById(nextPresetId);
    setPresetId(nextPresetId);
    setPrimaryColor(preset.tokens.primaryColor);
    setAccentColor(preset.tokens.accentColor);
    setSurfaceColor(preset.tokens.surfaceColor);
    setRadius(preset.tokens.radius);
    setFontFamily(preset.tokens.fontFamily);
  }

  const saveTheme = () => {
    setCustomTheme(currentTheme);
    notifications.show({ title: 'Theme Saved', message: 'Theme changes applied', color: 'green' });
  };

  const resetTheme = () => {
    const preset = THEME_PRESETS[0];
    resetCustomTheme();
    applyPreset(preset.id);
    notifications.show({ title: 'Theme Reset', message: 'Default theme restored', color: 'orange' });
  };

  function onExportTheme() {
    const payload = buildThemeExport(currentTheme);
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    notifications.show({ title: 'Theme Copied', message: 'Theme JSON copied to clipboard.', color: 'blue' });
  }

  function onImportTheme() {
    try {
      const parsed = JSON.parse(importText);
      const config = parsed.config || parsed;
      if (!config.primaryColor || !config.accentColor || !config.surfaceColor) {
        throw new Error('Missing required color tokens');
      }
      setPresetId(config.presetId || 'custom-import');
      setPrimaryColor(config.primaryColor);
      setAccentColor(config.accentColor);
      setSurfaceColor(config.surfaceColor);
      setRadius(config.radius || 'md');
      setFontFamily(config.fontFamily || '"Poppins", "Segoe UI", sans-serif');
      notifications.show({ title: 'Theme Imported', message: 'Imported values are now active in Theme Lab.', color: 'teal' });
    } catch (error) {
      notifications.show({ title: 'Import Failed', message: error.message, color: 'red' });
    }
  }

  return (
    <Container size="lg">
      <Group justify="space-between" mb="md">
        <Title>Theme Lab Standard v1</Title>
        <Badge color="cyan" variant="filled">v{THEME_LAB_STANDARD_VERSION}</Badge>
      </Group>

      <Stack gap="md">
        <Card withBorder>
          <Title order={3} mb="sm">Preset Direction</Title>
          <Select
            value={presetId}
            onChange={(value) => value && applyPreset(value)}
            data={THEME_PRESETS.map((preset) => ({ value: preset.id, label: `${preset.name} - ${preset.description}` }))}
          />
          <Text size="sm" c="dimmed" mt="xs">
            Use presets to trial visual directions quickly before custom tuning.
          </Text>
        </Card>

        <Card withBorder>
          <Title order={3} mb="sm">Token Editing</Title>
          <Stack>
            <ColorInput label="Primary Color" value={primaryColor} onChange={setPrimaryColor} format="hex" />
            <ColorInput label="Accent Color" value={accentColor} onChange={setAccentColor} format="hex" />
            <ColorInput label="Surface Color" value={surfaceColor} onChange={setSurfaceColor} format="hex" />
            <Select
              label="Border Radius"
              value={radius}
              onChange={(value) => setRadius(value || 'md')}
              data={[
                { value: 'xs', label: 'Extra Small' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
                { value: 'xl', label: 'Extra Large' }
              ]}
            />
            <TextInput label="Font Family" value={fontFamily} onChange={(event) => setFontFamily(event.currentTarget.value)} />
          </Stack>
        </Card>

        <Card withBorder>
          <Title order={3} mb="sm">Component Preview</Title>
          <div style={{ background: surfaceColor, borderRadius: 12, padding: 16, border: `1px solid ${accentColor}` }}>
            <Text fw={700} style={{ color: primaryColor, fontFamily }}>Theme Lab Showcase</Text>
            <Text size="sm" c="dimmed" mt="xs" mb="sm">
              Previewing button, card, and text hierarchy with selected tokens.
            </Text>
            <Group>
              <Button style={{ backgroundColor: primaryColor, borderRadius: radius === 'xs' ? 4 : radius === 'sm' ? 6 : radius === 'md' ? 8 : radius === 'lg' ? 12 : 16 }}>
                Save Changes
              </Button>
              <Button variant="outline" style={{ color: accentColor, borderColor: accentColor }}>
                Compare
              </Button>
            </Group>
          </div>
        </Card>

        <Group>
          <Button onClick={saveTheme} flex={1}>Save Theme</Button>
          <Button variant="light" onClick={onExportTheme}>Copy JSON</Button>
          <Button onClick={resetTheme} color="red" variant="outline">Reset</Button>
        </Group>

        <Card withBorder>
          <Title order={3} mb="sm">Import Theme JSON</Title>
          <Textarea
            placeholder="Paste exported theme JSON here"
            value={importText}
            onChange={(event) => setImportText(event.currentTarget.value)}
            minRows={3}
          />
          <Group mt="sm">
            <Button variant="outline" onClick={onImportTheme}>Import Theme</Button>
          </Group>
        </Card>

        <Card withBorder>
          <Title order={3} mb="sm">WordPress Token Map</Title>
          <Table withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>WordPress Variable</Table.Th>
                <Table.Th>Value</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Object.entries(wordpressMap).map(([key, value]) => (
                <Table.Tr key={key}>
                  <Table.Td><Code>{key}</Code></Table.Td>
                  <Table.Td><Code>{value}</Code></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <List size="xs" mt="sm">
            <List.Item>Use this map to align React themes with WordPress business websites.</List.Item>
            <List.Item>Keep the same token names across projects for faster rollout.</List.Item>
          </List>
        </Card>
      </Stack>
    </Container>
  );
}
