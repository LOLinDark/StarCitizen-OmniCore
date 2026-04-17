import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Switch,
} from '@mantine/core';
import { IconSearch, IconFolderOpen } from '@tabler/icons-react';
import { HOTASTable } from '../components/HOTASTable';
import { KeyPressIndicator } from '../components/KeyPressIndicator';
import { useHOTASFiltering } from '../hooks/useHOTASFiltering';
import { shipKeybindings, shipControlsCategories } from '../data/starcitizen-keybindings';
import { logitechX52ProOptimal } from '../utils/defaultProfiles';
import { StarCitizenProfileParser } from '../utils/starCitizenProfileParser';
import { starCitizenActionMapping, parseInputString, formatInputForDisplay } from '../utils/starCitizenActionMap';
import { useHotasInput, LogitechX52Device } from '../libraries/hotas';
import DevTag from '../components/DevTag';

export default function HOTASConfigMainPage() {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('feature');
  const [sortOrder, setSortOrder] = useState('asc');
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState(null);
  const [showUnboundOnly, setShowUnboundOnly] = useState(false);
  const [searchByLiveInput, setSearchByLiveInput] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [mergedBindings, setMergedBindings] = useState(null);
  const { lastInput: lastHotasInput, gamepadConnected, activeInputs, axisValues, gamepadInfo } = useHotasInput({
    enabled: true,
    trackKeyboard: false,
    device: LogitechX52Device,
  });

  const normalizeText = (value) => String(value || '').toLowerCase();

  const isBindingLive = useCallback((binding) => {
    if (!binding?.hotasBinding || !lastHotasInput) return false;

    const hotasText = normalizeText(binding.hotasBinding);

    if (lastHotasInput.type === 'Button') {
      // POV HAT directions come through as string indices like "9-hat-ne".
      if (typeof lastHotasInput.index === 'string' && lastHotasInput.index.startsWith('9-hat-')) {
        const direction = lastHotasInput.index.replace('9-hat-', '');
        return hotasText.includes('hat') && hotasText.includes(direction);
      }

      const candidates = [];
      if (Number.isInteger(lastHotasInput.displayIndex)) candidates.push(lastHotasInput.displayIndex);
      if (Number.isInteger(lastHotasInput.index)) {
        candidates.push(lastHotasInput.index);
        candidates.push(lastHotasInput.index + 1);
      }

      return candidates.some((num) => new RegExp(`\\b(button|btn)\\s*${num}\\b`, 'i').test(hotasText));
    }

    if (lastHotasInput.type === 'Axis') {
      if (Number.isInteger(lastHotasInput.index) && /axis/i.test(hotasText)) {
        if (new RegExp(`\\baxis\\s*${lastHotasInput.index}\\b`, 'i').test(hotasText)) return true;
      }

      const axisNamePrefix = normalizeText(lastHotasInput.name).split('(')[0].trim();
      return axisNamePrefix ? hotasText.includes(axisNamePrefix) : false;
    }

    return false;
  }, [lastHotasInput]);

  const liveInputLabel = useMemo(() => {
    if (!lastHotasInput) return 'No live HOTAS input yet';
    if (lastHotasInput.type === 'Button') {
      if (typeof lastHotasInput.index === 'string') return lastHotasInput.name || lastHotasInput.index;
      const displayNumber = Number.isInteger(lastHotasInput.displayIndex)
        ? lastHotasInput.displayIndex
        : (Number.isInteger(lastHotasInput.index) ? lastHotasInput.index + 1 : '?');
      return `Button ${displayNumber}`;
    }
    if (lastHotasInput.type === 'Axis') {
      const numericValue = Number(lastHotasInput.value);
      return Number.isFinite(numericValue)
        ? `${lastHotasInput.name || 'Axis'} (${numericValue.toFixed(2)})`
        : (lastHotasInput.name || 'Axis movement');
    }
    return lastHotasInput.name || 'Input detected';
  }, [lastHotasInput]);

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

  // Use shared filtering hook for defaults
  const hookResult = useHOTASFiltering(
    selectedCategory,
    searchQuery,
    sortBy,
    sortOrder
  );

  // Use merged bindings if profile loaded, otherwise use defaults
  const { sortedBindings: unfilteredBindings, currentCategory, categoryList } = useMemo(() => {
    if (mergedBindings) {
      // Filter merged bindings by category and search
      let results = mergedBindings;
      if (selectedCategory) {
        results = results.filter(b => b.category === selectedCategory);
      }
      if (searchQuery) {
        results = results.filter(b => 
          b.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.primaryKey && b.primaryKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Sort
      const sorted = [...results].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
      
      return {
        sortedBindings: sorted,
        currentCategory: shipControlsCategories[selectedCategory],
        categoryList: Object.entries(shipControlsCategories),
      };
    }
    
    return {
      sortedBindings: hookResult.sortedBindings,
      currentCategory: hookResult.currentCategory,
      categoryList: hookResult.categoryList,
    };
  }, [mergedBindings, selectedCategory, searchQuery, sortBy, sortOrder, hookResult]);

  // Filter by bound/unbound status
  const sortedBindings = useMemo(() => {
    let results = unfilteredBindings;

    if (searchByLiveInput) {
      results = lastHotasInput ? results.filter((binding) => isBindingLive(binding)) : [];
    }

    if (showUnboundOnly) {
      results = results.filter(binding => !binding.primaryKey && !binding.secondaryKey);
    }

    return results;
  }, [unfilteredBindings, showUnboundOnly, searchByLiveInput, lastHotasInput, isBindingLive]);

  const liveMatchedBindings = useMemo(() => {
    if (!lastHotasInput) return [];
    return unfilteredBindings.filter((binding) => isBindingLive(binding));
  }, [lastHotasInput, unfilteredBindings, isBindingLive]);

  const inputAssignmentLabel = useMemo(() => {
    if (!lastHotasInput) return 'Unassigned';
    if (liveMatchedBindings.length === 0) return 'Unassigned';
    if (liveMatchedBindings.length === 1) return `Assigned: ${liveMatchedBindings[0].feature}`;
    return `Assigned to ${liveMatchedBindings.length} features`;
  }, [lastHotasInput, liveMatchedBindings]);

  // HOTAS-specific colors
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
      setProfileName('');
      setMergedBindings(null);
      return;
    }

    // Helper: Parse AI profile string and extract device type
    const parseAIBindingString = (bindingStr) => {
      if (!bindingStr) return { keyboard: null, hotas: null };
      
      // Check for device hints in the string
      const isKeyboardBinding = bindingStr.toLowerCase().includes('keyboard') || 
                                bindingStr.toLowerCase().includes('mouse');
      const isHotasBinding = bindingStr.toLowerCase().includes('joystick');
      
      // If both types are mentioned or only partial info, classify smartly
      if (bindingStr.includes('(keyboard)') || bindingStr.includes('(keyboard)')) {
        return { keyboard: bindingStr, hotas: null };
      }
      if (bindingStr.includes('(joystick)') || bindingStr.includes('(HOTAS)')) {
        return { keyboard: null, hotas: bindingStr };
      }
      
      // Default heuristic: F-keys, mouse wheel, modifiers = keyboard; axis/buttons = HOTAS
      if (/^[FfMm]\d+|Mouse|keyboard|Spacebar|Shift|Ctrl|Alt|Backspace|Tab|Return|Enter|Comma|Numpad/.test(bindingStr)) {
        return { keyboard: bindingStr, hotas: null };
      }
      if (/Joystick|axis|button|Hat|Throttle/.test(bindingStr)) {
        return { keyboard: null, hotas: bindingStr };
      }
      
      // If contains both, try to split
      if (bindingStr.includes(' | ') || bindingStr.includes(' & ')) {
        const parts = bindingStr.split(/\s*[|&]\s*/);
        return {
          keyboard: parts[0]?.includes('keyboard') ? parts[0] : (parts.length > 0 && /keyboard|Mouse|Ctrl|Shift/.test(parts[0]) ? parts[0] : null),
          hotas: parts[1]?.includes('joystick') ? parts[1] : (parts.length > 1 && /joystick|axis|button/.test(parts[1]) ? parts[1] : null),
        };
      }
      
      // Default: treat as keyboard binding
      return { keyboard: bindingStr, hotas: null };
    };

    // Handle AI-generated profile
    if (profileName === '__ai_x52_optimal') {
      console.log('[HC05] Loading AI-generated X52 Optimal profile');
      setSelectedProfile(profileName);
      setProfileName(logitechX52ProOptimal.profileName);
      
      // Merge AI profile bindings with defaults
      const merged = shipKeybindings.map(binding => {
        const aiBinding = logitechX52ProOptimal.bindings[binding.id];
        if (!aiBinding) return binding;
        
        // Parse the AI binding string to separate keyboard and HOTAS
        const { keyboard, hotas } = parseAIBindingString(aiBinding);
        
        return {
          ...binding,
          primaryKey: binding.primaryKey, // Keep original default
          keyboardBinding: keyboard,
          hotasBinding: hotas,
          _aiBinding: aiBinding, // For reference
        };
      });
      setMergedBindings(merged);
      return;
    }

    try {
      console.log(`[HC05] Loading profile: ${profileName}`);
      setSelectedProfile(profileName);
      const response = await fetch(`/api/hotas/profile/${profileName}`);
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      console.log(`[HC05] Profile loaded:`, data.profile);
      console.log('[HC05] Profile content length:', data.xmlContent?.length);
      
      // Extract and set profile name from XML if available
      if (data.profileName) {
        setProfileName(data.profileName);
      } else if (profileName) {
        setProfileName(profileName);
      }
      
      // Parse XML and merge keybindings
      if (data.xmlContent) {
        try {
          const parser = new StarCitizenProfileParser(data.xmlContent);
          console.log('[HC05] XML parsed successfully');
          
          // Get all bindings from profile (both keyboard and joystick)
          const allBindings = parser.getAllBindings();
          console.log('[HC05] Found bindings in profile:', allBindings.length);
          
          // Create a map of Star Citizen action → { device, input }
          const profileBindingsMap = {};
          allBindings.forEach(binding => {
            const key = `${binding.actionMapName}:${binding.actionName}`;
            profileBindingsMap[key] = {
              device: binding.device,
              input: binding.input,
              formatted: formatInputForDisplay(parseInputString(binding.input)),
            };
          });
          
          console.log('[HC05] Profile bindings map created:', Object.keys(profileBindingsMap).length, 'actions');
          
          // Merge profile bindings into our keybindings
          const merged = shipKeybindings.map(binding => {
            // Find if this feature has a mapping in Star Citizen
            const scAction = starCitizenActionMapping[binding.id];
            if (!scAction) {
              console.log('[HC05] No SC action found for feature:', binding.id);
              return binding; // Return unchanged if no mapping
            }
            
            // Check if profile has a binding for this action
            const profileKey = `${scAction.mapName}:${scAction.actionName}`;
            const profileBinding = profileBindingsMap[profileKey];
            
            if (profileBinding) {
              console.log(`[HC05] Merging binding for ${binding.id}:`, profileBinding.formatted, `(${profileBinding.device})`);
              
              // Separate keyboard and HOTAS bindings
              const mergedBinding = { ...binding };
              if (profileBinding.device === 'keyboard') {
                mergedBinding.keyboardBinding = profileBinding.formatted;
              } else if (profileBinding.device === 'joystick') {
                mergedBinding.hotasBinding = profileBinding.formatted;
              }
              
              return mergedBinding;
            }
            
            return binding;
          });
          
          console.log('[HC05] Profile merged into keybindings');
          setMergedBindings(merged);
        } catch (parseError) {
          console.error('[HC05] Error parsing profile XML:', parseError);
          alert(`Could not parse profile: ${parseError.message}`);
          setSelectedProfile('');
          setProfileName('');
          setMergedBindings(null);
        }
      }
    } catch (error) {
      console.error(`[HC05] Error loading profile:`, error);
      alert(`Could not load profile: ${error.message}`);
      setSelectedProfile('');
      setProfileName('');
      setMergedBindings(null);
    }
  };

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}><DevTag tag="HC05" />HOTAS Config</h1>
            {profileName && (
              <Text size="lg" fw={600} style={{ marginBottom: '0.5rem', color: '#1e90ff' }}>
                📋 {profileName}
              </Text>
            )}
            <Text c="dimmed">Configure and optimize your flight stick for precision piloting</Text>
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
            placeholder={profilesLoading ? 'Loading profiles...' : 'Select a profile'}
            value={selectedProfile}
            onChange={handleLoadProfile}
            data={[
              {
                group: '🤖 OmniCore AI Profiles',
                items: [
                  {
                    value: '__ai_x52_optimal',
                    label: logitechX52ProOptimal.profileName,
                  },
                ],
              },
              {
                group: '🎮 Your Game Profiles',
                items: profiles.map(p => ({ value: p.name, label: p.name })),
              },
            ]}
            searchable
            clearable
            disabled={profilesLoading && profiles.length === 0}
          />

          {/* Controls Group */}
          <Group gap="xs" align="flex-end">
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconFolderOpen size={16} />}
              onClick={handleOpenFolder}
            >
              Open Folder
            </Button>
          </Group>
        </SimpleGrid>

        {/* Search & Category Filter & Toggle on Same Row */}
        <Group grow align="flex-end" gap="md">
          <TextInput
            placeholder={searchByLiveInput ? 'Live input search enabled - press HOTAS input' : 'Search keybindings...'}
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            disabled={searchByLiveInput}
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
          />
          <Switch
            label="Unbound Only"
            checked={showUnboundOnly}
            onChange={(e) => setShowUnboundOnly(e.currentTarget.checked)}
            size="sm"
          />
          <Switch
            label="Search by Live Input"
            checked={searchByLiveInput}
            onChange={(e) => setSearchByLiveInput(e.currentTarget.checked)}
            size="sm"
          />
        </Group>

        {/* Live Input Panel – dockable */}
        <KeyPressIndicator
          title="HC05 Live Input"
          inputLabel={liveInputLabel}
          assignmentLabel={inputAssignmentLabel}
          connected={gamepadConnected}
          rawInput={lastHotasInput}
          activeInputs={activeInputs}
          axisValues={axisValues}
          gamepadInfo={gamepadInfo}
        />

        {/* Info Bar */}
        <Group justify="space-between" style={{ color: '#666' }}>
          <Group gap="sm" align="center">
            <Text size="sm">
              {selectedCategory && currentCategory ? (
                <>
                  <strong>{currentCategory.label}</strong> — {currentCategory.description}
                </>
              ) : (
                'All Categories'
              )}
            </Text>
            <Badge color={gamepadConnected ? 'green' : 'gray'} variant="light" size="sm">
              {gamepadConnected ? `Live: ${liveInputLabel}` : 'HOTAS disconnected'}
            </Badge>
          </Group>
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
          isBindingLive={isBindingLive}
        />

        {/* Legend */}
        <Box
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <Text size="xs" fw={600} style={{ marginBottom: '0.5rem' }}>
            Status Legend
          </Text>
          <SimpleGrid cols={3} spacing="sm">
            <Group gap="xs">
              <Badge color="green" variant="filled" size="sm">
                ✓ Applied
              </Badge>
              <Text size="xs">Matches default</Text>
            </Group>
            <Group gap="xs">
              <Badge color="orange" variant="filled" size="sm">
                ◆ Changed
              </Badge>
              <Text size="xs">Modified by user</Text>
            </Group>
            <Group gap="xs">
              <Badge color="yellow" variant="filled" size="sm">
                ⧗ Pending
              </Badge>
              <Text size="xs">Will apply on exit</Text>
            </Group>
          </SimpleGrid>
        </Box>

        {/* Notes Section */}
        <Box
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <Text size="xs" fw={600} style={{ marginBottom: '0.5rem' }}>
            ℹ️ Notes
          </Text>
          <Stack gap="xs">
            <Text size="xs">
              • <strong>Profiles</strong>: Load pre-made profiles or create your own. Export to XML for backup.
            </Text>
            <Text size="xs">
              • <strong>States</strong>: Filter by context (ground, space flight, weapons, etc.) to reduce noise.
            </Text>
            <Text size="xs">
              • <strong>Modifiers</strong>: SHIFT, CTRL, ALT can be combined with any key.
            </Text>
            <Text size="xs">
              • <strong>Binding Editor</strong> (Coming Soon): Click any row to edit. HOTAS device detection coming Phase 2.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
    </>
  );
}
