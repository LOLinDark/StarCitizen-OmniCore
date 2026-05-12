/**
 * HOTASOverlaySaveTestPage
 *
 * Standalone diagnostic page for testing the overlay save pipeline:
 *  1. Fetches the live JSONC from the public data endpoint
 *  2. Shows the raw array with hotspot count and a preview of one hotspot
 *  3. Lets you mutate a test label and POST to /api/hotas-overlay-positions
 *  4. Displays the exact HTTP status, response body, and any errors
 *
 * Navigate to: /developer/hotas-overlay-save-test
 */
import React, { useState, useEffect } from 'react';
import { Box, Title, Text, Button, Stack, Badge, Group, Code, TextInput, Select } from '@mantine/core';

const DATA_FETCH_URL = '/data/hotas/overlays/hotas-x52-overlay-positions.jsonc';
const SAVE_URL = '/api/hotas-overlay-positions';

export default function HOTASOverlaySaveTestPage() {
  const [overlays, setOverlays] = useState(null);
  const [fetchStatus, setFetchStatus] = useState('idle'); // idle | loading | ok | error
  const [fetchError, setFetchError] = useState('');

  const [selectedId, setSelectedId] = useState('');
  const [editedLabel, setEditedLabel] = useState('');

  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | ok | error
  const [saveResult, setSaveResult] = useState(null);

  // ─── Step 1: Fetch ──────────────────────────────────────────────────────────

  async function handleFetch() {
    setFetchStatus('loading');
    setFetchError('');
    setOverlays(null);
    try {
      const res = await fetch(DATA_FETCH_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();

      // jsonc-parser is available via dynamic import (used elsewhere in app)
      const { parse } = await import('jsonc-parser');
      const parsed = parse(text);

      if (!Array.isArray(parsed)) throw new Error('Parsed result is not an array');
      setOverlays(parsed);
      setFetchStatus('ok');

      // Default selection to first hotspot
      if (parsed.length > 0) {
        setSelectedId(parsed[0].id);
        setEditedLabel(parsed[0].label || '');
      }
    } catch (err) {
      setFetchStatus('error');
      setFetchError(err.message);
    }
  }

  // Keep editedLabel in sync when selection changes
  useEffect(() => {
    if (!overlays || !selectedId) return;
    const hotspot = overlays.find((o) => o.id === selectedId);
    setEditedLabel(hotspot?.label || '');
  }, [selectedId, overlays]);

  // ─── Step 2: Mutate + Save ───────────────────────────────────────────────────

  async function handleSave() {
    if (!overlays) return;
    setSaveStatus('saving');
    setSaveResult(null);

    // Apply the label edit to a copy — does NOT mutate original state
    const modified = overlays.map((o) =>
      o.id === selectedId ? { ...o, label: editedLabel } : o
    );

    try {
      const res = await fetch(SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modified),
      });

      // Read body once as text, then try to JSON-parse it.
      // Never call both .json() and .text() — they share the same stream.
      let body = null;
      const rawText = await res.text().catch(() => '');
      try {
        body = JSON.parse(rawText);
      } catch {
        body = { raw: rawText || '(empty body)' };
      }

      setSaveResult({ status: res.status, ok: res.ok, body });
      setSaveStatus(res.ok ? 'ok' : 'error');

      // If save succeeded, update local state so a repeat save is idempotent
      if (res.ok) setOverlays(modified);
    } catch (err) {
      setSaveResult({ status: null, ok: false, body: null, networkError: err.message });
      setSaveStatus('error');
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  const selectedHotspot = overlays?.find((o) => o.id === selectedId);
  const hotspotOptions = (overlays || []).map((o) => ({ value: o.id, label: `${o.id} — "${o.label}"` }));

  return (
    <Box p="xl" maw={760}>
      <Title order={2} mb="xs">Overlay Save Pipeline Test</Title>
      <Text c="dimmed" size="sm" mb="xl">
        Three-step diagnostic: fetch → inspect/mutate → save. Each step shows raw HTTP details.
      </Text>

      {/* ── Step 1 ── */}
      <Title order={4} mb="xs">Step 1 — Fetch overlay data</Title>
      <Text size="xs" c="dimmed" mb="sm">GET {DATA_FETCH_URL}</Text>
      <Group mb="sm">
        <Button onClick={handleFetch} loading={fetchStatus === 'loading'} variant="outline" color="cyan">
          Fetch Overlay JSON
        </Button>
        {fetchStatus === 'ok' && (
          <Badge color="green">{overlays.length} hotspots loaded</Badge>
        )}
        {fetchStatus === 'error' && (
          <Badge color="red">Fetch failed</Badge>
        )}
      </Group>
      {fetchStatus === 'error' && (
        <Code block c="red" mb="md">{fetchError}</Code>
      )}
      {fetchStatus === 'ok' && overlays && (
        <Code block mb="md" style={{ maxHeight: 140, overflow: 'auto', fontSize: 11 }}>
          {JSON.stringify(overlays[0], null, 2)}
          {overlays.length > 1 ? `\n... and ${overlays.length - 1} more` : ''}
        </Code>
      )}

      {/* ── Step 2 ── */}
      {overlays && (
        <>
          <Title order={4} mt="lg" mb="xs">Step 2 — Inspect &amp; edit a hotspot label</Title>
          <Stack gap="sm" mb="md">
            <Select
              label="Select hotspot"
              data={hotspotOptions}
              value={selectedId}
              onChange={(v) => setSelectedId(v)}
              styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }}
            />
            {selectedHotspot && (
              <Code block style={{ fontSize: 11 }}>
                {JSON.stringify(selectedHotspot, null, 2)}
              </Code>
            )}
            <TextInput
              label="Edit label"
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.currentTarget.value)}
              description="Change this then save — you'll see it reflected in the JSONC file"
            />
          </Stack>

          {/* ── Step 3 ── */}
          <Title order={4} mt="lg" mb="xs">Step 3 — Save to backend</Title>
          <Text size="xs" c="dimmed" mb="sm">POST {SAVE_URL}</Text>
          <Group mb="sm">
            <Button
              onClick={handleSave}
              loading={saveStatus === 'saving'}
              color={saveStatus === 'ok' ? 'green' : saveStatus === 'error' ? 'red' : 'cyan'}
            >
              {saveStatus === 'ok' ? 'Saved ✓' : saveStatus === 'error' ? 'Save Failed — retry?' : 'Save'}
            </Button>
            {saveResult && (
              <Badge color={saveResult.ok ? 'green' : 'red'}>
                HTTP {saveResult.status ?? 'N/A'}
              </Badge>
            )}
          </Group>
          {saveResult && (
            <Code block style={{ fontSize: 11 }}>
              {saveResult.networkError
                ? `Network error: ${saveResult.networkError}`
                : JSON.stringify(saveResult.body, null, 2)}
            </Code>
          )}
        </>
      )}
    </Box>
  );
}
