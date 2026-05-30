import React from 'react';
import { Box, Text, Stack } from '@mantine/core';

/**
 * Notes/info section for HOTAS config page.
 * Use for user guidance and tips.
 */
export default function HOTASNotesSection() {
  return (
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
          • <strong>Binding capture</strong>: Right-click the Keyboard/Mouse or HOTAS column for any row, then press the desired input.
        </Text>
        <Text size="xs">
          • <strong>Short vs Long</strong>: Button rows marked Short or Long are guidance based on feature wording.
          Star Citizen usually decides hold behavior at runtime per feature.
        </Text>
        <Text size="xs">
          • <strong>Advanced mode plan</strong>: Universal custom "force long press" for any feature is not enabled in
          standard mode to avoid confusing behavior.
        </Text>
      </Stack>
    </Box>
  );
}
