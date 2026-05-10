import React from 'react';
import { Group, Text, SegmentedControl } from '@mantine/core';

/**
 * View switcher for HOTAS config page.
 * Props:
 * - tableView
 * - setTableView
 */
export default function HOTASViewSwitcher({ tableView, setTableView }) {
  return (
    <Group gap="md" align="center">
      <Text size="sm" fw={600}>View:</Text>
      <SegmentedControl
        value={tableView}
        onChange={setTableView}
        data={[
          { value: 'features', label: 'Features → Inputs' },
          { value: 'inputs', label: 'HOTAS Inputs → Features' },
        ]}
        size="xs"
      />
    </Group>
  );
}
