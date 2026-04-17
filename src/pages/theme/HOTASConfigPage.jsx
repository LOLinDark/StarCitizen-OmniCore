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
import { SciFiFrame, SciFiBackground } from '../../components/ui';
import { HOTASTable } from '../../components/HOTASTable';
import { StateIndicator } from '../../components/StateIndicator';
import { useHOTASFiltering } from '../../hooks/useHOTASFiltering';
import { shipControlsCategories } from '../../data/starcitizen-keybindings';

export default function HOTASConfigPage() {
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
        console.log('[HC01] Attempting to load profiles from /api/hotas/profiles');
        const response = await fetch('/api/hotas/profiles');
        console.log('[HC01] Response status:', response.status);
        if (!response.ok) {
          const error = await response.text();
          console.error('[HC01] Response error:', error);
          throw new Error(`Failed to load profiles (${response.status})`);
        }
        const data = await response.json();
        console.log('[HC01] Profiles loaded:', data.profiles?.length);
        setProfiles(data.profiles || []);
        setProfilesError(null);
      } catch (error) {
        console.error('[HC01] Error loading profiles:', error);
        setProfilesError(`Could not load profiles: ${error.message}`);
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

  // HC01 Blue/Sci-Fi theme colors - mostly-blue table styling
  const colors = {
    headerBg: '#e8f4fd',
    headerBorder: '#1e90ff',
    headerText: '#0052cc',
    headerTextShadow: undefined,
    featureText: '#0052cc',
    featureTextShadow: undefined,
    tableBg: '#f0f8ff',
    tableBoxShadow: '0 0 15px rgba(30, 144, 255, 0.1)',
    primaryKeyHeaderColor: '#1e90ff',
    primaryKeyBorder: undefined,
    primaryKeyHeaderShadow: undefined,
    primaryKeyBadgeBg: '#e3f2fd',
    primaryKeyBadgeColor: 'blue',
    primaryKeyBadgeBorder: undefined,
    alternativeHeaderColor: '#1e90ff',
    alternativeBorder: undefined,
    alternativeHeaderShadow: undefined,
    alternativeBadgeBg: '#f3e5f5',
    alternativeBadgeColor: 'grape',
    alternativeBadgeBorder: undefined,
    categoryText: '#333333',
    categoryTextShadow: undefined,
    statusHeaderColor: '#1e90ff',
    statusBorder: undefined,
    statusHeaderShadow: undefined,
    rowBg: '#ffffff',
    rowBorderColor: '#d4e6f1',
    alternateRowBg: '#f8fbff',
    emptyKeyColor: '#999999',
  };

  const getRowBackground = (binding) => {
    if (binding.changed) return '#fff3cd';
    if (binding.pendingApply) return '#d1ecf1';
    return undefined;
  };

  const handleOpenFolder = async () => {
    try {
      const response = await fetch('/api/hotas/open-folder', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to open folder');
      console.log('[HC01] Profiles folder opened');
    } catch (error) {
      console.error('[HC01] Error opening folder:', error);
      alert('Could not open profiles folder');
    }
  };

  const handleLoadProfile = async (profileName) => {
    if (!profileName) {
      setSelectedProfile('');
      return;
    }
    try {
      console.log(`[HC01] Loading profile: ${profileName}`);
      setSelectedProfile(profileName);
      const response = await fetch(`/api/hotas/profile/${profileName}`);
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      console.log(`[HC01] Profile loaded:`, data.profile);
      console.log('[HC01] Profile content length:', data.xmlContent?.length);
      // TODO: Parse XML and merge keybindings
    } catch (error) {
      console.error(`[HC01] Error loading profile:`, error);
      alert(`Could not load profile: ${error.message}`);
      setSelectedProfile('');
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
                color: '#00d9ff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.5rem',
              }}
            >
              [HC01] HOTAS Configuration
              {import.meta.env.DEV && (
                <span style={{ fontSize: '0.6em', marginLeft: '0.5em', color: '#ff9800' }}>
                  (DEV MODE)
                </span>
              )}
            </Text>
            <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
              onChange={handleLoadProfile}
              data={profiles.map(p => ({ value: p.name, label: p.name }))}
              searchable
              clearable
              disabled={profilesLoading || profiles.length === 0}
              style={{
                '--input-border-color': '#00d9ff',
                '--input-focus-border-color': '#00d9ff',
              }}
            />

            {/* Controls Group */}
            <Group gap="xs" align="flex-end">
              <Button
                variant="outline"
                color="cyan"
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
              style={{
                '--input-border-color': '#00d9ff',
                '--input-focus-border-color': '#00d9ff',
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
              style={{
                '--input-border-color': '#00d9ff',
                '--input-focus-border-color': '#00d9ff',
              }}
            />
          </Group>

          {/* Info Bar */}
          <Group justify="space-between" style={{ color: 'rgba(0, 217, 255, 0.8)' }}>
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
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <Text size="xs" fw={600} style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>
              Status Legend
            </Text>
            <SimpleGrid cols={3} spacing="sm">
              <Group gap="xs">
                <Badge color="green" variant="filled" size="sm">
                  ✓ Applied
                </Badge>
                <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Matches default
                </Text>
              </Group>
              <Group gap="xs">
                <Badge color="orange" variant="filled" size="sm">
                  ◆ Changed
                </Badge>
                <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Modified by user
                </Text>
              </Group>
              <Group gap="xs">
                <Badge color="yellow" variant="filled" size="sm">
                  ⧗ Pending
                </Badge>
                <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Will apply on exit
                </Text>
              </Group>
            </SimpleGrid>
          </Box>

          {/* Notes Section */}
          <Box
            style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <Text size="xs" fw={600} style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>
              ℹ️ Notes
            </Text>
            <Stack gap="xs">
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>Profiles</strong>: Load pre-made profiles or create your own. Export to XML for backup.
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>States</strong>: Filter by context (ground, space flight, weapons, etc.) to reduce noise.
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>Modifiers</strong>: SHIFT, CTRL, ALT can be combined with any key.
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
