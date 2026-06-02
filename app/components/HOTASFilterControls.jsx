import React from 'react';
import { Group, TextInput, Switch, SegmentedControl, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * Filter controls for HOTAS config table.
 * Props:
 * - searchQuery, setSearchQuery
 * - profileFilter, setProfileFilter
 * - searchByLiveInput, setSearchByLiveInput
 */
export default function HOTASFilterControls({
  searchQuery,
  setSearchQuery,
  profileFilter,
  setProfileFilter,
  searchByLiveInput,
  setSearchByLiveInput,
}) {
  return (
    <Group
      grow
      align="flex-end"
      gap="md"
      wrap="wrap"
      style={{ flexWrap: 'wrap', rowGap: 16, columnGap: 16 }}
    >
      <TextInput
        label="Search"
        placeholder={searchByLiveInput ? 'Live input active' : 'Search keybindings...'}
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        disabled={searchByLiveInput}
        style={{ flex: 2, minWidth: 220, flexBasis: 300 }}
      />
      <div style={{ minWidth: 0, flexBasis: 180 }}>
        <Text size="sm" fw={500} mb={4}>Filter</Text>
        <SegmentedControl
          value={profileFilter}
          onChange={setProfileFilter}
          data={[
            { value: 'all', label: 'All' },
            { value: 'hotas-assigned', label: 'HOTAS Assigned' },
            { value: 'hotas-empty', label: 'HOTAS Empty' },
            { value: 'kb-assigned', label: 'KB/M Assigned' },
            { value: 'kb-empty', label: 'KB/M Empty' },
            { value: 'fully-unbound', label: 'Fully Unbound' },
          ]}
          size="xs"
          style={{ overflow: 'visible' }}
        />
      </div>
      <Switch
        label="Search by Live Input"
        checked={searchByLiveInput}
        onChange={(e) => setSearchByLiveInput(e.currentTarget.checked)}
        size="sm"
        style={{ flexBasis: 180 }}
      />
    </Group>
  );
}
