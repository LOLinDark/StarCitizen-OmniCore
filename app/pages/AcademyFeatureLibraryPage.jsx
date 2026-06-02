import { useEffect, useMemo, useState } from 'react';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  Select,
  Stack,
  SimpleGrid,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { shipControlsCategories, shipKeybindings } from '../data/starcitizen-keybindings';
import { featureAmbiguityAudit, featureTrainingNotes } from '../data/trainingAcademyFeatureNotes';
import DevTag from '../components/DevTag';
import { useLocation } from 'react-router-dom';

function toYouTubeEmbedUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?#]+)/i);
      if (shortsMatch?.[1]) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '').trim();
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return '';
  }

  return '';
}

function renderMediaCell(note) {
  const clipUrl = note?.shortClipUrl || '';
  const firstTutorial = (note?.tutorialVideos || [])[0] || null;
  const tutorialEmbed = toYouTubeEmbedUrl(firstTutorial?.url || '');

  return (
    <Stack gap={6}>
      <Box
        style={{
          border: '1px dashed rgba(0, 217, 255, 0.35)',
          borderRadius: 8,
          padding: 8,
          background: 'rgba(0, 20, 35, 0.28)',
          minWidth: 260,
        }}
      >
        <Text size="xs" fw={600} c="cyan">Short clip slot</Text>
        {clipUrl ? (
          <video
            controls
            preload="metadata"
            style={{ width: '100%', maxWidth: 300, marginTop: 6, borderRadius: 6 }}
            src={clipUrl}
          />
        ) : (
          <Text size="xs" c="dimmed" mt={4}>No short clip URL yet. Add note.shortClipUrl to populate this slot.</Text>
        )}
      </Box>

      <Box
        style={{
          border: '1px solid rgba(255, 152, 0, 0.35)',
          borderRadius: 8,
          padding: 8,
          background: 'rgba(40, 20, 0, 0.2)',
        }}
      >
        <Text size="xs" fw={600} c="orange.3">Deep tutorial slot</Text>
        {tutorialEmbed ? (
          <iframe
            title={firstTutorial?.title || 'Feature tutorial'}
            src={tutorialEmbed}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: 300, maxWidth: '100%', height: 168, border: 0, borderRadius: 6, marginTop: 6 }}
          />
        ) : firstTutorial?.url ? (
          <Anchor href={firstTutorial.url} target="_blank" rel="noreferrer" size="xs" mt={6}>
            {firstTutorial.title || 'Open tutorial link'}
          </Anchor>
        ) : (
          <Text size="xs" c="dimmed" mt={4}>No deep tutorial URL yet. Add note.tutorialVideos for this feature.</Text>
        )}
      </Box>
    </Stack>
  );
}

export default function AcademyFeatureLibraryPage() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [focusFeatureId, setFocusFeatureId] = useState('');
  const [expandedMediaRowId, setExpandedMediaRowId] = useState('');
  const [mediaPreviewsEnabled, setMediaPreviewsEnabled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const featureId = String(params.get('feature') || '').trim();

    if (!featureId) {
      setFocusFeatureId('');
      return;
    }

    setFocusFeatureId(featureId);
    setSearch((prev) => prev || featureId);

    const matched = shipKeybindings.find((binding) => binding.id === featureId);
    if (matched?.category) {
      setCategory(matched.category);
    }
  }, [location.search]);

  const categoryOptions = useMemo(() => {
    const options = Object.values(shipControlsCategories)
      .map((item) => ({ value: item.id, label: item.label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ value: 'all', label: 'All categories' }, ...options];
  }, []);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return shipKeybindings
      .filter((binding) => {
        if (category !== 'all' && binding.category !== category) return false;
        if (!term) return true;

        const note = featureTrainingNotes[binding.id] || {};
        const searchable = [
          binding.feature,
          binding.id,
          binding.description,
          binding.primaryKey,
          note.shortDescription,
          note.summary,
          note.longDescription,
          note.whenToUse,
          note.bestPractice,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchable.includes(term);
      })
      .map((binding) => {
        const note = featureTrainingNotes[binding.id] || {};
        return {
          ...binding,
          categoryLabel: shipControlsCategories[binding.category]?.label || binding.category,
          shortDescription: note.shortDescription || note.summary || binding.description || 'No short description yet.',
          longDescription: note.longDescription || 'No long description yet. Add note.longDescription to improve training depth.',
          note,
        };
      })
      .sort((a, b) => a.feature.localeCompare(b.feature));
  }, [search, category]);

  useEffect(() => {
    if (!focusFeatureId) return;

    const targetId = `feature-row-${focusFeatureId}`;
    const timerId = window.setTimeout(() => {
      const row = document.getElementById(targetId);
      if (row) {
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 40);

    return () => window.clearTimeout(timerId);
  }, [focusFeatureId, rows]);

  return (
    <Stack gap="md">
      <div>
        <Title order={2}><DevTag tag="GT01" /> Academy Feature Library</Title>
        <Text c="dimmed" size="sm" mt={4}>
          Canonical table of Star Citizen feature bindings with short + long guidance text and media slots.
          Tooltips should consume the same text fields, while this page is the deep-reference surface.
        </Text>
        <Group gap="xs" mt="xs">
          <Badge color="cyan" variant="light">{rows.length} features</Badge>
          <Badge color="orange" variant="outline">Shared data source: trainingAcademyFeatureNotes</Badge>
          {focusFeatureId && <Badge color="teal" variant="light">Focused: {focusFeatureId}</Badge>}
        </Group>
      </div>

      <Group align="flex-end" gap="sm" wrap="wrap">
        <TextInput
          label="Search"
          placeholder="Missile mode, decoy, IFCS, shields..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ minWidth: 280, flex: 1 }}
        />
        <Select
          label="Category"
          value={category}
          onChange={(value) => setCategory(value || 'all')}
          data={categoryOptions}
          style={{ minWidth: 320 }}
        />
        <Button
          variant={mediaPreviewsEnabled ? 'light' : 'filled'}
          color={mediaPreviewsEnabled ? 'gray' : 'orange'}
          onClick={() => {
            setExpandedMediaRowId('');
            setMediaPreviewsEnabled((prev) => !prev);
          }}
        >
          {mediaPreviewsEnabled ? 'Disable Media Previews' : 'Enable Media Previews'}
        </Button>
      </Group>

      <Stack gap="xs">
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <Title order={4}>Ambiguity Audit</Title>
          <Text size="xs" c="dimmed">Compact confusion map with direct feature links</Text>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
          {featureAmbiguityAudit.map((item) => (
            <Card
              key={item.id}
              withBorder
              radius="md"
              p="sm"
              style={{
                borderColor: 'rgba(0, 217, 255, 0.25)',
                background: 'rgba(0, 16, 28, 0.45)',
              }}
            >
              <Stack gap={6}>
                <Group justify="space-between" align="flex-start" wrap="wrap">
                  <Text fw={700} size="sm">{item.title}</Text>
                  <Badge color="cyan" variant="light">{item.relatedFeatureIds.length} related</Badge>
                </Group>
                <Text size="xs" c="orange.2">Confusion: {item.confusion}</Text>
                <Text size="xs" c="gray.3">Clarification: {item.clarification}</Text>
                <Group gap="xs" wrap="wrap">
                  {item.relatedFeatureIds.map((featureId) => (
                    <Anchor
                      key={`${item.id}-${featureId}`}
                      size="xs"
                      href={`/academy/feature-library?feature=${encodeURIComponent(featureId)}`}
                    >
                      {featureId}
                    </Anchor>
                  ))}
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      <ScrollArea style={{ height: 'calc(100vh - 320px)', minHeight: 300 }}>
        <Table striped highlightOnHover withTableBorder withColumnBorders horizontalSpacing="sm" verticalSpacing="sm" style={{ minWidth: 1400 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Feature</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th style={{ whiteSpace: 'nowrap', minWidth: 160 }}>Default Key</Table.Th>
              <Table.Th>Short Description</Table.Th>
              <Table.Th>Media (Short Clip + Deep Tutorial)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => {
              const tooltipContext = Array.isArray(row.note.tooltipContext) ? row.note.tooltipContext : [];
              const isFocusedRow = focusFeatureId && row.id === focusFeatureId;
              const isExpanded = expandedMediaRowId === row.id;

              return (
                <>
                  <Table.Tr
                    key={row.id}
                    id={`feature-row-${row.id}`}
                    style={{
                      cursor: 'pointer',
                      ...(isFocusedRow ? { background: 'rgba(0, 217, 255, 0.1)', boxShadow: 'inset 0 0 0 1px rgba(0, 217, 255, 0.45)' } : undefined),
                    }}
                    onClick={() => setExpandedMediaRowId((prev) => (prev === row.id ? '' : row.id))}
                  >
                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Text size="xs" c={isExpanded ? 'cyan' : 'dimmed'} style={{ lineHeight: 1 }}>
                          {isExpanded ? '▾' : '▸'}
                        </Text>
                        <div>
                          <Text fw={600}>{row.feature}</Text>
                          <Text size="xs" c="dimmed">{row.id}</Text>
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{row.categoryLabel}</Text>
                    </Table.Td>
                    <Table.Td style={{ whiteSpace: 'nowrap' }}>
                      <Badge color="blue" variant="light" style={{ whiteSpace: 'nowrap', maxWidth: 'none' }}>{row.primaryKey || '-'}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{row.shortDescription}</Text>
                      {row.note.whenToUse && <Text size="xs" c="dimmed" mt={4}>When: {row.note.whenToUse}</Text>}
                    </Table.Td>
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <Stack gap={6}>
                        <button
                          type="button"
                          disabled={!mediaPreviewsEnabled}
                          onClick={() => setExpandedMediaRowId((prev) => (prev === row.id ? '' : row.id))}
                          style={{
                            alignSelf: 'flex-start',
                            border: '1px solid rgba(0, 217, 255, 0.35)',
                            borderRadius: 6,
                            background: mediaPreviewsEnabled ? 'rgba(0, 20, 35, 0.5)' : 'rgba(35, 35, 35, 0.45)',
                            color: mediaPreviewsEnabled ? '#7dd3fc' : '#9ca3af',
                            padding: '4px 10px',
                            cursor: mediaPreviewsEnabled ? 'pointer' : 'not-allowed',
                            opacity: mediaPreviewsEnabled ? 1 : 0.75,
                            fontSize: 12,
                          }}
                        >
                          {!mediaPreviewsEnabled
                            ? 'Enable previews first'
                            : (isExpanded ? 'Hide Media' : 'Load Media')}
                        </button>
                        {mediaPreviewsEnabled && isExpanded ? renderMediaCell(row.note) : null}
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                  {isExpanded && (
                    <Table.Tr key={`${row.id}-expanded`} style={{ background: 'rgba(0, 10, 20, 0.55)' }}>
                      <Table.Td colSpan={5} style={{ paddingLeft: 40, paddingTop: 10, paddingBottom: 14 }}>
                        <Stack gap={6}>
                          <Text size="xs" fw={600} c="cyan.4" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Long Description</Text>
                          <Text size="sm">{row.longDescription}</Text>
                          {row.note.bestPractice && (
                            <Text size="xs" c="dimmed" mt={4}>Best practice: {row.note.bestPractice}</Text>
                          )}
                          {tooltipContext.map((line, index) => (
                            <Text key={`${row.id}-ctx-${index}`} size="xs" c="cyan" mt={4}>
                              Tooltip context: {line}
                            </Text>
                          ))}
                        </Stack>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
}
