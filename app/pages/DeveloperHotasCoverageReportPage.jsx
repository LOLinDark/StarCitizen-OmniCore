import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Code,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import DevTag from '../components/DevTag';
import { StarCitizenProfileParser } from '../utils/starCitizenProfileParser';
import { starCitizenActionMapping } from '../utils/starCitizenActionMap';
import { shipKeybindings } from '../data/starcitizen-keybindings';
import {
  MODE_PLAY_GROUPS,
  getModePlayGroupsForActionName,
  getModePlayGroupsForBinding,
} from '../data/hotas-mode-groups';

function extractActionNamesFromText(text) {
  const result = new Set();
  const input = String(text || '');

  const xmlActionPattern = /<action\s+name="([^"]+)"/gi;
  let xmlMatch = xmlActionPattern.exec(input);
  while (xmlMatch) {
    result.add(xmlMatch[1].trim().toLowerCase());
    xmlMatch = xmlActionPattern.exec(input);
  }

  const actionLikePattern = /\b(v_[a-z0-9_]+)\b/gi;
  let tokenMatch = actionLikePattern.exec(input);
  while (tokenMatch) {
    result.add(tokenMatch[1].trim().toLowerCase());
    tokenMatch = actionLikePattern.exec(input);
  }

  return Array.from(result).sort();
}

function tallyGroups(items, getGroups) {
  const counts = {};
  items.forEach((item) => {
    const groups = getGroups(item);
    groups.forEach((groupId) => {
      counts[groupId] = (counts[groupId] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([groupId, count]) => ({
      groupId,
      count,
      label: MODE_PLAY_GROUPS[groupId]?.label || groupId,
    }));
}

export default function DeveloperHotasCoverageReportPage() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [profileActions, setProfileActions] = useState([]);
  const [externalActionsText, setExternalActionsText] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingProfileActions, setLoadingProfileActions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const response = await fetch('/api/hotas/profiles');
        if (!response.ok) throw new Error(`Failed to load profiles (${response.status})`);
        const data = await response.json();
        const values = Array.isArray(data?.profiles) ? data.profiles.map((p) => p.name) : [];
        setProfiles(values);
      } catch (loadError) {
        setError(loadError.message || 'Failed to load profiles');
      } finally {
        setLoadingProfiles(false);
      }
    };

    void loadProfiles();
  }, []);

  const handleAnalyzeProfile = async () => {
    if (!selectedProfile) {
      setProfileActions([]);
      return;
    }

    try {
      setError('');
      setLoadingProfileActions(true);
      const response = await fetch(`/api/hotas/profile/${encodeURIComponent(selectedProfile)}`);
      if (!response.ok) throw new Error(`Failed to load profile XML (${response.status})`);
      const payload = await response.json();
      const parser = new StarCitizenProfileParser(String(payload?.xmlContent || ''));
      const actions = parser
        .getAllBindings()
        .map((row) => String(row.actionName || '').trim().toLowerCase())
        .filter(Boolean);
      setProfileActions(Array.from(new Set(actions)).sort());
    } catch (loadError) {
      setError(loadError.message || 'Failed to parse selected profile');
      setProfileActions([]);
    } finally {
      setLoadingProfileActions(false);
    }
  };

  const pastedActions = useMemo(() => extractActionNamesFromText(externalActionsText), [externalActionsText]);

  const sourceActions = useMemo(() => {
    const all = new Set([...profileActions, ...pastedActions]);
    return Array.from(all).sort();
  }, [profileActions, pastedActions]);

  const actionMapEntries = useMemo(() => Object.entries(starCitizenActionMapping), []);
  const mappedActionNames = useMemo(() => new Set(actionMapEntries.map(([action]) => action.toLowerCase())), [actionMapEntries]);
  const mappedFeatureIds = useMemo(() => new Set(actionMapEntries.map(([, featureId]) => String(featureId))), [actionMapEntries]);

  const allFeatureIds = useMemo(() => shipKeybindings.map((binding) => binding.id), []);
  const featureById = useMemo(() => Object.fromEntries(shipKeybindings.map((binding) => [binding.id, binding])), []);

  const actionsMissingMapping = useMemo(
    () => sourceActions.filter((actionName) => !mappedActionNames.has(actionName)),
    [sourceActions, mappedActionNames]
  );

  const mappedFeaturesSeenFromSource = useMemo(() => {
    const seen = new Set();
    sourceActions.forEach((actionName) => {
      const featureId = starCitizenActionMapping[actionName];
      if (featureId) seen.add(featureId);
    });
    return seen;
  }, [sourceActions]);

  const featuresMissingActionMap = useMemo(
    () => allFeatureIds.filter((featureId) => !mappedFeatureIds.has(featureId)),
    [allFeatureIds, mappedFeatureIds]
  );

  const sourceMissingFeatures = useMemo(
    () => allFeatureIds.filter((featureId) => !mappedFeaturesSeenFromSource.has(featureId)),
    [allFeatureIds, mappedFeaturesSeenFromSource]
  );

  const missingActionGroups = useMemo(
    () => tallyGroups(actionsMissingMapping, (actionName) => getModePlayGroupsForActionName(actionName)),
    [actionsMissingMapping]
  );

  const missingFeatureGroups = useMemo(
    () => tallyGroups(sourceMissingFeatures, (featureId) => getModePlayGroupsForBinding(featureById[featureId])),
    [sourceMissingFeatures, featureById]
  );

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}><DevTag tag="HC11" /> HOTAS Coverage Report</Title>
        <Text c="dimmed" size="sm">
          Compare source actions (profile XML and pasted game action dumps) against OmniCore action mapping and feature coverage.
        </Text>
      </div>

      {error && (
        <Alert color="red" title="Coverage Report Error">
          {error}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Select
          label="Profile XML Source"
          placeholder={loadingProfiles ? 'Loading profiles...' : 'Select profile to analyze'}
          data={profiles.map((name) => ({ value: name, label: name }))}
          value={selectedProfile}
          onChange={(value) => setSelectedProfile(value || '')}
          searchable
          clearable
        />
        <Group align="flex-end">
          <Button onClick={() => void handleAnalyzeProfile()} loading={loadingProfileActions}>
            Analyze Selected Profile
          </Button>
        </Group>
      </SimpleGrid>

      <Textarea
        label="Optional External Action Dump"
        description="Paste action names or XML snippets from extracted game files (for example keybinding_localization/action definitions)."
        placeholder="Paste lines containing action names such as v_salvage_... or <action name=\"v_toggle_salvage_mode\">"
        autosize
        minRows={6}
        maxRows={14}
        value={externalActionsText}
        onChange={(event) => setExternalActionsText(event.currentTarget.value)}
      />

      <Group gap="sm">
        <Badge color="blue" variant="light">Source actions: {sourceActions.length}</Badge>
        <Badge color="grape" variant="light">Mapped action keys: {mappedActionNames.size}</Badge>
        <Badge color="red" variant="light">Source actions missing mapping: {actionsMissingMapping.length}</Badge>
        <Badge color="orange" variant="light">Features missing any action mapping: {featuresMissingActionMap.length}</Badge>
        <Badge color="yellow" variant="light">Features not covered by source: {sourceMissingFeatures.length}</Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Box>
          <Text fw={600} mb="xs">Missing Action Mapping by Play Group</Text>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Group</Table.Th>
                <Table.Th>Count</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {missingActionGroups.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={2}><Text size="sm" c="dimmed">No unmapped source actions in current dataset.</Text></Table.Td>
                </Table.Tr>
              )}
              {missingActionGroups.map((row) => (
                <Table.Tr key={row.groupId}>
                  <Table.Td>{row.label}</Table.Td>
                  <Table.Td>{row.count}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>

        <Box>
          <Text fw={600} mb="xs">Missing Feature Coverage by Play Group</Text>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Group</Table.Th>
                <Table.Th>Count</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {missingFeatureGroups.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={2}><Text size="sm" c="dimmed">All features are represented in current source actions.</Text></Table.Td>
                </Table.Tr>
              )}
              {missingFeatureGroups.map((row) => (
                <Table.Tr key={row.groupId}>
                  <Table.Td>{row.label}</Table.Td>
                  <Table.Td>{row.count}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Box>
          <Text fw={600} mb="xs">Source Actions Missing OmniCore Mapping (Top 80)</Text>
          <Box p="sm" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, maxHeight: 320, overflowY: 'auto' }}>
            {actionsMissingMapping.slice(0, 80).map((actionName) => (
              <Code key={actionName} block style={{ marginBottom: 6 }}>
                {actionName}
              </Code>
            ))}
            {actionsMissingMapping.length === 0 && <Text size="sm" c="dimmed">No missing action mappings.</Text>}
          </Box>
        </Box>

        <Box>
          <Text fw={600} mb="xs">Feature IDs Missing Action Mapping (Top 80)</Text>
          <Box p="sm" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, maxHeight: 320, overflowY: 'auto' }}>
            {featuresMissingActionMap.slice(0, 80).map((featureId) => (
              <Code key={featureId} block style={{ marginBottom: 6 }}>
                {featureId}
              </Code>
            ))}
            {featuresMissingActionMap.length === 0 && <Text size="sm" c="dimmed">No feature mapping gaps.</Text>}
          </Box>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
