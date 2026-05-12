import { useEffect, useMemo, useState } from 'react';
import { Badge, Group, Stack, Text, TextInput, Select, SegmentedControl } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import DevTag from '../components/DevTag';

// Categorize settings by name prefix
function categorize(name) {
  const n = name.toLowerCase();
  if (n.startsWith('audio')) return 'Audio';
  if (n.startsWith('sysspec')) return 'Graphics';
  if (n.startsWith('headtracking') || n.startsWith('tobii') || n.startsWith('foip')) return 'Head Tracking';
  if (n.startsWith('lookahead')) return 'Look Ahead';
  if (n.startsWith('flight') || n.startsWith('pilot') || n.startsWith('speed')) return 'Flight';
  if (n.startsWith('turret')) return 'Turrets';
  if (n.startsWith('hmd')) return 'VR / HMD';
  if (n.startsWith('gforce') || n.startsWith('shake') || n.startsWith('motionblur')) return 'Effects';
  if (n.startsWith('preset') || n.startsWith('selectedship')) return 'Profile / Ship';
  if (n.startsWith('weapon')) return 'Weapons';
  if (n.startsWith('width') || n.startsWith('height') || n.startsWith('resolution') || n.startsWith('window') || n.startsWith('overscan') || n.startsWith('aspect') || n.startsWith('upscaling')) return 'Display';
  if (n.startsWith('textinput')) return 'Input';
  if (n.startsWith('crosshair') || n.startsWith('autozoom')) return 'HUD';
  if (n.startsWith('salvage') || n.startsWith('ads')) return 'Gameplay';
  return 'Other';
}

export default function GameSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modifiedFilter, setModifiedFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/game/settings');
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const data = await res.json();
        setSettings(data.settings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(settings.map((s) => s.category));
    return [...cats].sort().map((c) => ({ value: c, label: c }));
  }, [settings]);

  const filtered = useMemo(() => {
    let result = settings;
    if (categoryFilter) result = result.filter((s) => s.category === categoryFilter);
    if (modifiedFilter === 'modified') result = result.filter((s) => !s.isDefault);
    else if (modifiedFilter === 'default') result = result.filter((s) => s.isDefault);
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term));
    }
    return result;
  }, [settings, categoryFilter, modifiedFilter, search]);

  return (
    <Stack gap="xl">
      <div>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
          <DevTag tag="APP05" />Game Settings
        </h1>
        <Text c="dimmed">Browse and search Star Citizen's in-game settings from attributes.xml</Text>
      </div>

      {/* Filters */}
      <Group grow align="flex-end" gap="md" wrap="wrap">
        <TextInput
          label="Search"
          placeholder="Search settings..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 2, minWidth: 180 }}
        />
        <Select
          label="Category"
          placeholder="All Categories"
          value={categoryFilter}
          onChange={(v) => setCategoryFilter(v || '')}
          data={[{ value: '', label: 'All Categories' }, ...categories]}
          clearable
          searchable
          style={{ flex: 1, minWidth: 160 }}
        />
        <div>
          <Text size="sm" fw={500} mb={4}>Filter</Text>
          <SegmentedControl
            value={modifiedFilter}
            onChange={setModifiedFilter}
            data={[
              { value: 'all', label: 'All' },
              { value: 'modified', label: 'Modified' },
              { value: 'default', label: 'Default' },
            ]}
            size="xs"
          />
        </div>
      </Group>

      {/* Stats */}
      <Group gap="sm">
        <Badge color="cyan" variant="light" size="sm">{filtered.length} settings</Badge>
        <Badge color="green" variant="light" size="sm">
          {settings.filter((s) => !s.isDefault).length} modified
        </Badge>
      </Group>

      {/* Loading / Error */}
      {loading && <Text c="dimmed">Loading settings...</Text>}
      {error && <Text c="red" size="sm">{error}</Text>}

      {/* Table */}
      {!loading && (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(0, 217, 255, 0.15)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 217, 255, 0.08)', borderBottom: '1px solid rgba(0, 217, 255, 0.2)' }}>
                <th style={thStyle}>Setting</th>
                <th style={thStyle}>Value</th>
                <th style={thStyle}>Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#3a5060' }}>
                    No settings match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((setting) => (
                  <tr
                    key={setting.name}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: !setting.isDefault ? 'rgba(34, 209, 123, 0.04)' : 'transparent',
                    }}
                  >
                    <td style={{ ...tdStyle, color: '#e0eaf4', fontWeight: 500 }}>
                      {setting.name}
                      {!setting.isDefault && (
                        <Badge size="xs" color="green" variant="light" ml={8}>Modified</Badge>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: '#00d9ff', fontFamily: 'monospace' }}>
                      {setting.value}
                    </td>
                    <td style={{ ...tdStyle, color: '#6a8898' }}>
                      {setting.category}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Stack>
  );
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  color: '#6a8898',
  fontWeight: 700,
  letterSpacing: '0.07em',
  fontSize: '0.7rem',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
};

const tdStyle = {
  padding: '8px 14px',
};
