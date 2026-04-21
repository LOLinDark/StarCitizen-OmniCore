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
  Badge,
} from '@mantine/core';
import { IconSearch, IconFilter, IconFolderOpen } from '@tabler/icons-react';
import { SciFiFrame } from '../../components/ui';
import { HOTASTable } from '../../components/HOTASTable';
import { StateIndicator } from '../../components/StateIndicator';
import { useHOTASFiltering } from '../../hooks/useHOTASFiltering';
import { shipControlsCategories } from '../../data/starcitizen-keybindings';
import DevTag from '../../components/DevTag';

export default function HOTASConfigPageDark() {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('flight');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('feature');
  const [sortOrder, setSortOrder] = useState('asc');
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

  // HC03 Dark Neon Blue theme colors
  const colors = {
    primary: '#00d9ff',
    primaryGlow: 'hsla(190, 100%, 50%, 0.15)',
    secondary: '#1e90ff',
    accent: '#b300ff',
    text: '#c1d0e0',
    textDim: '#6b7f96',

    headerBg: 'rgba(0, 217, 255, 0.1)',
    headerBorder: '#00d9ff',
    headerText: '#00d9ff',
    headerTextShadow: `0 0 5px hsla(190, 100%, 50%, 0.3)`,
    featureText: '#00d9ff',
    featureTextShadow: `0 0 5px hsla(190, 100%, 50%, 0.3)`,
    tableBg: '#0a0a0a',
    tableBoxShadow: `0 0 20px hsla(190, 100%, 50%, 0.15)`,
    primaryKeyHeaderColor: '#1e90ff',
    primaryKeyBorder: '2px solid #1e90ff',
    primaryKeyHeaderShadow: `0 0 5px hsla(217, 100%, 50%, 0.3)`,
    primaryKeyBadgeBg: 'rgba(0, 217, 255, 0.1)',
    primaryKeyBadgeColor: '#1e90ff',
    primaryKeyBadgeBorder: `1px solid #1e90ff`,
    alternativeHeaderColor: '#b300ff',
    alternativeBorder: '2px solid #b300ff',
    alternativeHeaderShadow: `0 0 5px hsla(270, 100%, 50%, 0.3)`,
    alternativeBadgeBg: 'rgba(179, 0, 255, 0.1)',
    alternativeBadgeColor: '#b300ff',
    alternativeBadgeBorder: `1px solid #b300ff`,
    categoryText: '#6b7f96',
    categoryTextShadow: `0 0 3px hsla(190, 100%, 50%, 0.15)`,
    statusHeaderColor: '#ff0055',
    statusBorder: '2px solid #ff0055',
    statusHeaderShadow: '0 0 5px rgba(255, 0, 85, 0.3)',
    rowBg: 'transparent',
    rowBorderColor: 'rgba(0, 217, 255, 0.1)',
    emptyKeyColor: 'rgba(255, 255, 255, 0.2)',
  };

  const getRowBackground = (binding) => {
    if (binding.changed) return 'rgba(255, 0, 85, 0.05)';
    if (binding.pendingApply) return 'rgba(0, 217, 255, 0.05)';
    return undefined;
  };
  const handleOpenFolder = async () => {
    try {
      const response = await fetch('/api/hotas/open-folder', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to open folder');
      console.log('[HC03] Profiles folder opened');
    } catch (error) {
      console.error('[HC03] Error opening folder:', error);
      alert('Could not open profiles folder');
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--oc-space-deep)',
        overflow: 'hidden',
      }}
    >
      <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack gap="xl">
          {/* Title Section */}
          <div style={{ textAlign: 'center' }}>
            <Text
              size="xl"
              fw={700}
              style={{
                color: colors.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
                textShadow: `0 0 10px ${colors.primaryGlow}`,
              }}
            >
              <DevTag tag="HC03" />HOTAS Configuration
            </Text>
            <Text
              size="sm"
              style={{
                color: colors.accent,
                textShadow: `0 0 5px hsla(270, 100%, 50%, 0.3)`,
              }}
            >
              Manage keybindings across different flight and combat modes
            </Text>
          </div>

          {/* Error Display */}
          {profilesError && (
            <Box
              p="md"
              style={{
                background: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '8px',
              }}
            >
              <Text size="sm" style={{ color: '#ff6b6b' }}>
                ⚠️ {profilesError}
              </Text>
            </Box>
          )}

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
                label: { color: colors.primary },
                input: {
                  backgroundColor: '#1a1a2e',
                  borderColor: colors.primary,
                  color: colors.text,
                },
              }}
            />

            {/* Controls Group */}
            <Group gap="xs" align="flex-end">
              <Button
                variant="outline"
                style={{
                  borderColor: colors.accent,
                  color: colors.accent,
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
                  backgroundColor: '#1a1a2e',
                  borderColor: colors.secondary,
                  color: colors.text,
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
                  backgroundColor: '#1a1a2e',
                  borderColor: colors.secondary,
                  color: colors.text,
                },
              }}
            />
          </Group>

          {/* Info Bar */}
          <Group
            justify="space-between"
            style={{
              color: colors.primary,
              textShadow: `0 0 5px ${colors.primaryGlow}`,
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
          <HOTASTable
            sortedBindings={sortedBindings}
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={setSortBy}
            setSortOrder={setSortOrder}
            colors={colors}
            getRowBackground={getRowBackground}
          />

          {/* Legend */}
          <Box
            style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: `2px solid ${colors.primary}`,
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: `0 0 12px ${colors.primaryGlow}`,
            }}
          >
            <Text
              size="xs"
              fw={600}
              style={{
                color: colors.primary,
                marginBottom: '0.5rem',
                textShadow: `0 0 5px ${colors.primaryGlow}`,
              }}
            >
              Status Legend
            </Text>
            <SimpleGrid cols={3} spacing="sm">
              <Group gap="xs">
                <Badge color="green" variant="filled" size="sm">
                  ✓ Applied
                </Badge>
                <Text size="xs" style={{ color: '#00d9ff' }}>
                  Matches default
                </Text>
              </Group>
              <Group gap="xs">
                <Badge color="orange" variant="filled" size="sm">
                  ◆ Changed
                </Badge>
                <Text size="xs" style={{ color: colors.primary }}>
                  Modified by user
                </Text>
              </Group>
              <Group gap="xs">
                <Badge color="yellow" variant="filled" size="sm">
                  ⧗ Pending
                </Badge>
                <Text size="xs" style={{ color: '#00d9ff' }}>
                  Will apply on exit
                </Text>
              </Group>
            </SimpleGrid>
          </Box>

          {/* Notes Section */}
          <Box
            style={{
              background: `rgba(179, 0, 255, 0.05)`,
              border: `2px solid ${colors.accent}`,
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: `0 0 12px hsla(270, 100%, 50%, 0.15)`,
            }}
          >
            <Text
              size="xs"
              fw={600}
              style={{
                color: colors.accent,
                marginBottom: '0.5rem',
                textShadow: `0 0 5px hsla(270, 100%, 50%, 0.3)`,
              }}
            >
              ℹ️ Notes
            </Text>
            <Stack gap="xs">
              <Text size="xs" style={{ color: colors.text }}>
                • <strong>Profiles</strong>: Load pre-made profiles or create your own. Export to XML for backup.
              </Text>
              <Text size="xs" style={{ color: colors.text }}>
                • <strong>States</strong>: Filter by context (ground, space flight, weapons, etc.) to reduce noise.
              </Text>
              <Text size="xs" style={{ color: colors.text }}>
                • <strong>Modifiers</strong>: SHIFT, CTRL, ALT can be combined with any key.
              </Text>
              <Text size="xs" style={{ color: colors.text }}>
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
