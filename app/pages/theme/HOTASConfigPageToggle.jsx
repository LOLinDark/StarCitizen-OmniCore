import { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Group,
  Select,
  Button,
  TextInput,
  Text,
  SimpleGrid,
  Box,
  SegmentedControl,
  Badge,
} from '@mantine/core';
import { IconSearch, IconFilter, IconMoon, IconSun, IconFolderOpen } from '@tabler/icons-react';
import { SciFiFrame } from '../../components/ui';
import { HOTASTable } from '../../components/HOTASTable';
import { StateIndicator } from '../../components/StateIndicator';
import { useHOTASFiltering } from '../../hooks/useHOTASFiltering';
import { shipControlsCategories } from '../../data/starcitizen-keybindings';

export default function HOTASConfigPageToggle() {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('flight');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('feature');
  const [sortOrder, setSortOrder] = useState('asc');
  const [theme, setTheme] = useState('light');
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState(null);

  // Load profiles from backend
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);
        const response = await fetch('/api/hotas/profiles');
        if (!response.ok) throw new Error('Failed to load profiles');
        const data = await response.json();
        setProfiles(data.profiles || []);
        setProfilesError(null);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setProfilesError('Could not load profiles from Star Citizen directory');
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };
    loadProfiles();
  }, []);

  // Use shared filtering hook
  const { sortedBindings, currentCategory, categoryList } = useHOTASFiltering(
    selectedCategory,
    searchQuery,
    sortBy,
    sortOrder
  );

  // Theme colors - light and dark variants
  const colorSchemes = {
    light: {
      headerBg: '#e3f2fd',
      headerBorder: '#2563eb',
      headerText: '#1e40af',
      featureText: '#2563eb',
      tableBg: '#ffffff',
      tableBoxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      primaryKeyHeaderColor: '#1e40af',
      primaryKeyBorder: '2px solid #2563eb',
      primaryKeyBadgeBg: undefined,
      primaryKeyBadgeColor: 'blue',
      alternativeHeaderColor: '#1e40af',
      alternativeBorder: '2px solid #2563eb',
      alternativeBadgeBg: undefined,
      alternativeBadgeColor: 'grape',
      categoryText: '#666666',
      statusHeaderColor: '#1e40af',
      statusBorder: '2px solid #2563eb',
      rowBg: '#ffffff',
      rowBorderColor: '#e5e7eb',
      emptyKeyColor: '#999999',
    },
    dark: {
      headerBg: 'rgba(0, 217, 255, 0.1)',
      headerBorder: '#00d9ff',
      headerText: '#00d9ff',
      featureText: '#00d9ff',
      tableBg: '#0a0a0a',
      tableBoxShadow: `0 0 20px hsla(190, 100%, 50%, 0.15)`,
      primaryKeyHeaderColor: '#1e90ff',
      primaryKeyBorder: '2px solid #1e90ff',
      primaryKeyBadgeBg: 'rgba(0, 217, 255, 0.1)',
      primaryKeyBadgeColor: '#1e90ff',
      alternativeHeaderColor: '#b300ff',
      alternativeBorder: '2px solid #b300ff',
      alternativeBadgeBg: 'rgba(179, 0, 255, 0.1)',
      alternativeBadgeColor: '#b300ff',
      categoryText: '#6b7f96',
      statusHeaderColor: '#ff0055',
      statusBorder: '2px solid #ff0055',
      rowBg: 'transparent',
      rowBorderColor: 'rgba(0, 217, 255, 0.1)',
      emptyKeyColor: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const colors = colorSchemes[theme];

  const getRowBackground = (binding) => {
    if (theme === 'light') {
      if (binding.changed) return '#ffffff';
      if (binding.pendingApply) return '#f9fafb';
    }
    if (theme === 'dark') {
      if (binding.changed) return 'rgba(255, 0, 85, 0.05)';
      if (binding.pendingApply) return 'rgba(0, 217, 255, 0.05)';
    }
    return undefined;
  };

  const handleOpenFolder = async () => {
    try {
      const response = await fetch('/api/hotas/open-folder', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to open folder');
      console.log('[HC04] Profiles folder opened');
    } catch (error) {
      console.error('[HC04] Error opening folder:', error);
      alert('Could not open profiles folder');
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: c.bg,
        overflow: 'hidden',
        transition: 'background-color 0.3s ease',
      }}
    >
      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack gap="xl">
          {/* Title Section with Theme Toggle */}
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1, textAlign: 'center' }}>
              <Text
                size="xl"
                fw={700}
                style={{
                  color: c.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem',
                  textShadow: theme === 'dark' ? `0 0 10px rgba(0, 255, 136, 0.5)` : 'none',
                }}
              >
                [HC04] HOTAS Configuration
              </Text>
              <Text
                size="sm"
                style={{
                  color: theme === 'dark' ? '#ff00ff' : '#666666',
                  textShadow: theme === 'dark' ? '0 0 5px rgba(255, 0, 255, 0.3)' : 'none',
                }}
              >
                Manage keybindings across different flight and combat modes
              </Text>
            </div>
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              data={[
                {
                  label: (
                    <Group gap={8}>
                      <IconSun size={16} />
                      <span>Light</span>
                    </Group>
                  ),
                  value: 'light',
                },
                {
                  label: (
                    <Group gap={8}>
                      <IconMoon size={16} />
                      <span>Dark</span>
                    </Group>
                  ),
                  value: 'dark',
                },
              ]}
              style={{
                '--input-bg': c.headerBg,
                '--input-color': c.primary,
              }}
            />
          </Group>

          {/* Profile & State Controls */}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* Profile Selector */}
            <Select
              label="Load Game Profile"
              placeholder={profilesLoading ? 'Loading profiles...' : 'Select a profile from Star Citizen'}
              value={selectedProfile}
              onChange={(value) => setSelectedProfile(value)}
              data={profiles.map(p => ({ value: p.name, label: p.name }))}
              searchable
              clearable
              disabled={profilesLoading || profiles.length === 0}
              styles={{
                label: { color: c.primary },
                input: {
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
                  borderColor: c.primary,
                  color: c.text,
                },
              }}
            />

            {/* Controls Group */}
            <Group gap="xs" align="flex-end">
              <Button
                variant="outline"
                style={{
                  borderColor: c.primary,
                  color: c.primary,
                }}
                size="sm"
                leftSection={<IconFolderOpen size={16} />}
                onClick={handleOpenFolder}
              >
                Open Folder
              </Button>
            </Group>
          </SimpleGrid>

          {/* Search & Category Filter on Same Row */}
          <Group grow align="flex-end" gap="md">
            <TextInput
              placeholder="Search keybindings..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              styles={{
                input: {
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
                  borderColor: c.primary,
                  color: c.text,
                },
              }}
            />
            <Select
              label="Category"
              placeholder="Select category"
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value || '')}
              data={[
                { value: '', label: 'All Categories' },
                ...categoryList.map(([key, category]) => ({
                  value: key,
                  label: category.label,
                })),
              ]}
              searchable
              styles={{
                input: {
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
                  borderColor: c.primary,
                  color: c.text,
                },
              }}
            />
          </Group>

          {/* Info Bar */}
          <Group
            justify="space-between"
            style={{
              color: c.textMuted,
              textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
            }}
          >
            <Text size="sm">
              {selectedCategory && currentCategory ? (
                <>
                  <strong>{currentCategory.label}</strong> — {currentCategory.description}
                </>
              ) : (
                'All Categories'
              )}
            </Text>
            <Text size="sm" fw={600}>
              {sortedBindings.length} binding{sortedBindings.length !== 1 ? 's' : ''}
            </Text>
          </Group>

          {/* Table */}
          <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
            <div
              style={{
                overflowX: 'auto',
                color: c.text,
                background: c.tableBg,
                borderRadius: '8px',
                boxShadow:
                  theme === 'dark'
                    ? '0 0 20px rgba(0, 255, 136, 0.15)'
                    : '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Table
                highlightOnHover
                style={{
                  minWidth: '800px',
                  borderCollapse: 'collapse',
                  background: c.tableBg,
                }}
              >
                <Table.Thead>
                  <Table.Tr style={{ background: c.headerBg }}>
                    <Table.Th
                      style={{
                        cursor: 'pointer',
                        color: c.headerText,
                        padding: '1rem',
                        fontWeight: 600,
                        borderBottom: `2px solid ${c.primary}`,
                        textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
                      }}
                      onClick={() => {
                        if (sortBy === 'feature') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('feature');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      Feature {sortBy === 'feature' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Table.Th>
                    <Table.Th
                      style={{
                        cursor: 'pointer',
                        color: c.headerText,
                        padding: '1rem',
                        fontWeight: 600,
                        borderBottom: `2px solid ${c.primary}`,
                        textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
                      }}
                      onClick={() => {
                        if (sortBy === 'primaryKey') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('primaryKey');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      Primary Key {sortBy === 'primaryKey' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: c.headerText,
                        padding: '1rem',
                        fontWeight: 600,
                        borderBottom: `2px solid ${c.primary}`,
                        textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
                      }}
                    >
                      Alternative
                    </Table.Th>
                    <Table.Th
                      style={{
                        cursor: 'pointer',
                        color: c.headerText,
                        padding: '1rem',
                        fontWeight: 600,
                        borderBottom: `2px solid ${c.primary}`,
                        textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
                      }}
                      onClick={() => {
                        if (sortBy === 'category') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('category');
                          setSortOrder('asc');
                        }
                      }}
                    >
                      Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Table.Th>
                    <Table.Th
                      style={{
                        color: c.headerText,
                        padding: '1rem',
                        fontWeight: 600,
                        borderBottom: `2px solid ${c.primary}`,
                        textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
                      }}
                    >
                      Status
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedBindings.map((binding, idx) => (
                    <Table.Tr
                      key={binding.id}
                      style={{
                        background:
                          binding.changed
                            ? theme === 'dark'
                              ? 'rgba(255, 0, 85, 0.05)'
                              : 'rgba(255, 107, 0, 0.05)'
                            : binding.pendingApply
                              ? theme === 'dark'
                                ? 'rgba(255, 170, 0, 0.05)'
                                : 'rgba(255, 165, 0, 0.05)'
                              : theme === 'light'
                                ? idx % 2 === 0
                                  ? '#ffffff'
                                  : '#f9fafb'
                                : 'transparent',
                        borderBottom: `1px solid ${c.border}`,
                      }}
                    >
                      <Table.Td style={{ padding: '1rem' }}>
                        <Tooltip label={binding.description}>
                          <Text
                            size="sm"
                            fw={500}
                            style={{
                              color: c.primary,
                              cursor: 'help',
                              textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.2)' : 'none',
                            }}
                          >
                            {binding.feature}
                          </Text>
                        </Tooltip>
                      </Table.Td>
                      <Table.Td style={{ padding: '1rem' }}>
                        <Badge
                          style={{
                            backgroundColor:
                              theme === 'light'
                                ? 'rgba(37, 99, 235, 0.1)'
                                : 'rgba(0, 255, 255, 0.1)',
                            color: theme === 'light' ? '#2563eb' : '#00ffff',
                            border: `1px solid ${theme === 'light' ? '#2563eb' : '#00ffff'}`,
                          }}
                          size="lg"
                        >
                          {binding.primaryKey}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ padding: '1rem' }}>
                        {binding.secondaryKey ? (
                          <Badge
                            style={{
                              backgroundColor:
                                theme === 'light'
                                  ? 'rgba(147, 51, 234, 0.1)'
                                  : 'rgba(255, 0, 255, 0.1)',
                              color: theme === 'light' ? '#9333ea' : '#ff00ff',
                              border: `1px solid ${theme === 'light' ? '#9333ea' : '#ff00ff'}`,
                            }}
                            size="sm"
                          >
                            {binding.secondaryKey}
                          </Badge>
                        ) : (
                          <Text
                            size="xs"
                            style={{
                              color: theme === 'light' ? '#999999' : 'rgba(255, 255, 255, 0.2)',
                            }}
                          >
                            —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ padding: '1rem' }}>
                        <Text size="xs" style={{ color: c.textMuted }}>
                          {binding.category}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ padding: '1rem' }}>
                        <StateIndicator changed={binding.changed} pendingApply={binding.pendingApply} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </SciFiFrame>

          {/* Legend */}
          <Box
            style={{
              background: c.headerBg,
              border: `2px solid ${c.primary}`,
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: theme === 'dark' ? `0 0 10px rgba(0, 255, 136, 0.1)` : 'none',
            }}
          >
            <Text
              size="xs"
              fw={600}
              style={{
                color: c.headerText,
                marginBottom: '0.5rem',
                textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
              }}
            >
              Status Legend
            </Text>
            <SimpleGrid cols={3} spacing="sm">
              <Group gap="xs">
                <Badge color="green" variant="filled" size="sm">
                  ✓ Applied
                </Badge>
                <Text size="xs" style={{ color: c.textMuted }}>
                  Matches default
                </Text>
              </Group>
              <Group gap="xs">
                <Badge color="orange" variant="filled" size="sm">
                  ◆ Changed
                </Badge>
                <Text size="xs" style={{ color: c.textMuted }}>
                  Modified by user
                </Text>
              </Group>
              <Group gap="xs">
                <Badge color="yellow" variant="filled" size="sm">
                  ⧗ Pending
                </Badge>
                <Text size="xs" style={{ color: c.textMuted }}>
                  Will apply on exit
                </Text>
              </Group>
            </SimpleGrid>
          </Box>

          {/* Notes Section */}
          <Box
            style={{
              background: c.headerBg,
              border: `2px solid ${c.primary}`,
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: theme === 'dark' ? `0 0 10px rgba(0, 255, 136, 0.1)` : 'none',
            }}
          >
            <Text
              size="xs"
              fw={600}
              style={{
                color: c.headerText,
                marginBottom: '0.5rem',
                textShadow: theme === 'dark' ? '0 0 5px rgba(0, 255, 136, 0.3)' : 'none',
              }}
            >
              ℹ️ Notes
            </Text>
            <Stack gap="xs">
              <Text size="xs" style={{ color: c.textMuted }}>
                • <strong>Profiles</strong>: Load pre-made profiles or create your own. Export to XML for backup.
              </Text>
              <Text size="xs" style={{ color: c.textMuted }}>
                • <strong>States</strong>: Filter by context (ground, space flight, weapons, etc.) to reduce noise.
              </Text>
              <Text size="xs" style={{ color: c.textMuted }}>
                • <strong>Modifiers</strong>: SHIFT, CTRL, ALT can be combined with any key.
              </Text>
              <Text size="xs" style={{ color: c.textMuted }}>
                • <strong>Binding Editor</strong> (Coming Soon): Click any row to edit. HOTAS device detection
                coming Phase 2.
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}
