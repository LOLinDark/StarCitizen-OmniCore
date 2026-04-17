import { useState, useMemo } from 'react';
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
  Table,
} from '@mantine/core';
import { IconSearch, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { SciFiFrame } from '../../components/ui';

// Sample generic data for demo
const SAMPLE_DATA = [
  { id: 1, name: 'Alice Johnson', department: 'Engineering', role: 'Senior Developer', status: 'Active' },
  { id: 2, name: 'Bob Smith', department: 'Design', role: 'UI/UX Designer', status: 'Active' },
  { id: 3, name: 'Carol Davis', department: 'Product', role: 'Product Manager', status: 'On Leave' },
  { id: 4, name: 'David Wilson', department: 'Engineering', role: 'DevOps Engineer', status: 'Active' },
  { id: 5, name: 'Emma Brown', department: 'Marketing', role: 'Marketing Manager', status: 'Active' },
  { id: 6, name: 'Frank Miller', department: 'Engineering', role: 'Backend Developer', status: 'Active' },
  { id: 7, name: 'Grace Lee', department: 'Design', role: 'Graphic Designer', status: 'Inactive' },
  { id: 8, name: 'Henry Taylor', department: 'Product', role: 'Analyst', status: 'Active' },
];

export default function HOTASConfigPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Generic table colors
  const colors = {
    headerBg: '#e8f4fd',
    headerBorder: '#1e90ff',
    headerText: '#0052cc',
    tableBg: '#f0f8ff',
    tableBoxShadow: '0 0 15px rgba(30, 144, 255, 0.1)',
    rowBg: '#ffffff',
    rowBorderColor: '#d4e6f1',
    alternateRowBg: '#f8fbff',
  };

  // Get unique departments
  const departments = ['', ...Array.from(new Set(SAMPLE_DATA.map(d => d.department)))];

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = SAMPLE_DATA;
    
    // Filter by department
    if (selectedDepartment) {
      result = result.filter(item => item.department === selectedDepartment);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [selectedDepartment, searchQuery, sortBy, sortOrder]);

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
              [HC01] Data Table Demo
              {import.meta.env.DEV && (
                <span style={{ fontSize: '0.6em', marginLeft: '0.5em', color: '#ff9800' }}>
                  (DEV MODE - GENERIC VIEW)
                </span>
              )}
            </Text>
            <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Generic table view with search, filtering, and sorting capabilities
            </Text>
          </div>

          {/* Search & Filter on Same Row */}
          <Group grow align="flex-end" gap="md">
            <TextInput
              placeholder="Search by name, role, or department..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{
                '--input-border-color': '#00d9ff',
                '--input-focus-border-color': '#00d9ff',
              }}
            />
            <Select
              label="Department"
              placeholder="All departments"
              value={selectedDepartment}
              onChange={(value) => setSelectedDepartment(value || '')}
              data={departments.map(d => ({
                value: d,
                label: d || 'All Departments',
              }))}
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
              {selectedDepartment ? (
                <>
                  <strong>{selectedDepartment}</strong> department
                </>
              ) : (
                'All Departments'
              )}
            </Text>
            <Text size="sm" fw={600}>
              {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
            </Text>
          </Group>

          {/* Generic Table */}
          <Box
            style={{
              background: colors.tableBg,
              border: `1px solid ${colors.rowBorderColor}`,
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: colors.tableBoxShadow,
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover style={{ minWidth: '100%' }}>
                <Table.Thead
                  style={{
                    background: colors.headerBg,
                    borderBottom: `2px solid ${colors.headerBorder}`,
                  }}
                >
                  <Table.Tr>
                    {['name', 'department', 'role', 'status'].map((col) => (
                      <Table.Th
                        key={col}
                        onClick={() => {
                          if (sortBy === col) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy(col);
                            setSortOrder('asc');
                          }
                        }}
                        style={{
                          color: colors.headerText,
                          cursor: 'pointer',
                          userSelect: 'none',
                          padding: '1rem',
                          textTransform: 'capitalize',
                          fontWeight: 700,
                        }}
                      >
                        <Group gap={6} wrap="nowrap">
                          {col}
                          {sortBy === col && (
                            sortOrder === 'asc' ? (
                              <IconArrowUp size={14} />
                            ) : (
                              <IconArrowDown size={14} />
                            )
                          )}
                        </Group>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredData.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                        No records found
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <Table.Tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 0 ? colors.rowBg : colors.alternateRowBg,
                          borderBottom: `1px solid ${colors.rowBorderColor}`,
                        }}
                      >
                        <Table.Td style={{ padding: '0.75rem 1rem', color: colors.headerText, fontWeight: 600 }}>
                          {item.name}
                        </Table.Td>
                        <Table.Td style={{ padding: '0.75rem 1rem', color: '#666' }}>
                          {item.department}
                        </Table.Td>
                        <Table.Td style={{ padding: '0.75rem 1rem', color: '#666' }}>
                          {item.role}
                        </Table.Td>
                        <Table.Td style={{ padding: '0.75rem 1rem' }}>
                          <Badge
                            color={item.status === 'Active' ? 'green' : item.status === 'On Leave' ? 'yellow' : 'gray'}
                            variant="filled"
                            size="sm"
                          >
                            {item.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </div>
          </Box>

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
              ℹ️ How to Use
            </Text>
            <Stack gap="xs">
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>Search</strong>: Type in the search box to filter by name, role, or department
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>Department Filter</strong>: Select a department to show only those records
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>Sorting</strong>: Click any column header to sort by that column (ascending/descending)
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                • <strong>Generic View</strong>: This is a template for building data tables. Replace with your own data source.
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}
