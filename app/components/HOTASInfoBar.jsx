import React from 'react';
import { Group, Badge, Text } from '@mantine/core';

/**
 * Info bar for HOTAS config page.
 * Props:
 * - selectedProfile
 * - xmlSaveStatus
 * - xmlSaveMessage
 * - modeOverridesSaveStatus
 * - modeOverridesSaveMessage
 * - showModeOverridesStatus
 * - captureWarning
 * - sortedBindings (array)
 */
export default function HOTASInfoBar({
  selectedProfile,
  xmlSaveStatus,
  xmlSaveMessage,
  modeOverridesSaveStatus,
  modeOverridesSaveMessage,
  showModeOverridesStatus = false,
  captureWarning,
  sortedBindings,
}) {
  return (
    <Group justify="space-between" style={{ color: '#666' }}>
      <Group gap="sm" align="center">
        {selectedProfile && !selectedProfile.startsWith('__ai_') && xmlSaveStatus !== 'idle' && (
          <Badge
            color={xmlSaveStatus === 'saving' ? 'blue' : (xmlSaveStatus === 'saved' ? 'green' : 'red')}
            variant="light"
            size="sm"
            title={xmlSaveMessage}
          >
            {xmlSaveStatus === 'saving'
              ? 'XML saving...'
              : (xmlSaveStatus === 'saved' ? 'XML saved' : 'XML save failed')}
          </Badge>
        )}
        {selectedProfile && showModeOverridesStatus && modeOverridesSaveStatus !== 'idle' && (
          <Badge
            color={modeOverridesSaveStatus === 'saving' ? 'blue' : (modeOverridesSaveStatus === 'saved' ? 'green' : 'red')}
            variant="light"
            size="sm"
            title={modeOverridesSaveMessage}
          >
            {modeOverridesSaveStatus === 'saving'
              ? 'Mode overrides saving...'
              : (modeOverridesSaveStatus === 'saved' ? 'Mode overrides saved' : 'Mode overrides failed')}
          </Badge>
        )}
        {captureWarning && (
          <Badge color="orange" variant="light" size="sm" title={captureWarning}>
            Binding conflict warning
          </Badge>
        )}
      </Group>
      <Text size="sm" fw={600}>
        {sortedBindings.length} binding{sortedBindings.length !== 1 ? 's' : ''}
      </Text>
    </Group>
  );
}
