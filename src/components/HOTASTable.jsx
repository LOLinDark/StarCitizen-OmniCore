import { Table, Badge, Text, Tooltip } from '@mantine/core';
import { SciFiFrame } from './ui';
import { StateIndicator } from './StateIndicator';

/**
 * Reusable HOTAS table component with sorting and theme customization
 * @param {Object} props
 * @param {Array} props.sortedBindings - Pre-sorted keybindings to display
 * @param {string} props.sortBy - Current sort column
 * @param {string} props.sortOrder - Current sort order ('asc' or 'desc')
 * @param {Function} props.setSortBy - Callback to change sort column
 * @param {Function} props.setSortOrder - Callback to change sort order
 * @param {Object} props.colors - Theme colors { headerBg, headerBorder, headerText, featureText, tableRowBg, rowBorderColor, alternateRowBg }
 * @param {Function} props.getRowBackground - Optional function to determine row background based on binding
 */
export const HOTASTable = ({
  sortedBindings,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  colors,
  getRowBackground,
}) => {
  const handleHeaderClick = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
      <div
        style={{
          overflowX: 'auto',
          color: colors.featureText || '#00d9ff',
          background: colors.tableBg || '#0a0a0a',
          borderRadius: '8px',
          boxShadow: colors.tableBoxShadow,
        }}
      >
        <Table
          highlightOnHover
          style={{
            minWidth: '800px',
            borderCollapse: 'collapse',
            background: colors.tableBg || '#0a0a0a',
          }}
        >
          <Table.Thead>
            <Table.Tr style={{ background: colors.headerBg }}>
              <Table.Th
                style={{
                  cursor: 'pointer',
                  color: colors.headerText,
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: `2px solid ${colors.headerBorder}`,
                  textShadow: colors.headerTextShadow,
                }}
                onClick={() => handleHeaderClick('feature')}
              >
                Feature {sortBy === 'feature' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.Th>
              <Table.Th
                style={{
                  cursor: 'pointer',
                  color: colors.primaryKeyHeaderColor,
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: colors.primaryKeyBorder,
                  textShadow: colors.primaryKeyHeaderShadow,
                }}
                onClick={() => handleHeaderClick('primaryKey')}
              >
                Primary Key {sortBy === 'primaryKey' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.Th>
              <Table.Th
                style={{
                  color: colors.alternativeHeaderColor,
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: colors.alternativeBorder,
                  textShadow: colors.alternativeHeaderShadow,
                }}
              >
                Alternative
              </Table.Th>
              <Table.Th
                style={{
                  cursor: 'pointer',
                  color: colors.headerText,
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: `2px solid ${colors.headerBorder}`,
                  textShadow: colors.headerTextShadow,
                }}
                onClick={() => handleHeaderClick('category')}
              >
                Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.Th>
              <Table.Th
                style={{
                  color: colors.statusHeaderColor,
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: colors.statusBorder,
                  textShadow: colors.statusHeaderShadow,
                }}
              >
                Status
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedBindings.map((binding) => (
              <Table.Tr
                key={binding.id}
                style={{
                  background: getRowBackground ? getRowBackground(binding) : colors.rowBg,
                  borderBottom: `1px solid ${colors.rowBorderColor}`,
                }}
              >
                <Table.Td style={{ padding: '1rem' }}>
                  <Tooltip label={binding.description}>
                    <Text
                      size="sm"
                      fw={500}
                      style={{
                        color: colors.featureText,
                        cursor: 'help',
                        textShadow: colors.featureTextShadow,
                      }}
                    >
                      {binding.feature}
                    </Text>
                  </Tooltip>
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  <Badge
                    style={{
                      backgroundColor: colors.primaryKeyBadgeBg,
                      color: colors.primaryKeyBadgeColor,
                      border: colors.primaryKeyBadgeBorder,
                    }}
                    size="lg"
                  >
                    {binding.primaryKey}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  {binding.secondaryKey ? (
                    <Badge
                      style={{
                        backgroundColor: colors.alternativeBadgeBg,
                        color: colors.alternativeBadgeColor,
                        border: colors.alternativeBadgeBorder,
                      }}
                      size="sm"
                    >
                      {binding.secondaryKey}
                    </Badge>
                  ) : (
                    <Text size="xs" style={{ color: colors.emptyKeyColor }}>
                      —
                    </Text>
                  )}
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  <Text size="xs" style={{ color: colors.categoryText, textShadow: colors.categoryTextShadow }}>
                    {binding.category}
                  </Text>
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  <StateIndicator changed={binding.changed} pendingApply={binding.pendingApply} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </SciFiFrame>
  );
};
