import { Table, Badge, Text, Tooltip } from '@mantine/core';
import { SciFiFrame } from './ui';
import { StateIndicator } from './StateIndicator';

// Pulse animation for listening indicator
const pulseStyle = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

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
 * @param {Function} props.isBindingLive - Optional function to determine if a row matches current live HOTAS input
 */
export const HOTASTable = ({
  sortedBindings,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  colors,
  getRowBackground,
  isBindingLive,
  showStatusColumn = true,
  onStartHotasCapture,
  activeCaptureBindingId = null,
  captureProgress = 0,
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
    <>
      <style>{pulseStyle}</style>
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
                Default {sortBy === 'primaryKey' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.Th>
              <Table.Th
                style={{
                  cursor: 'pointer',
                  color: '#ff9800',
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: '1px solid #ffb74d',
                  textShadow: undefined,
                }}
                onClick={() => handleHeaderClick('keyboardBinding')}
              >
                ⌨️ Keyboard/Mouse {sortBy === 'keyboardBinding' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.Th>
              <Table.Th
                style={{
                  cursor: 'pointer',
                  color: '#e91e63',
                  padding: '1rem',
                  fontWeight: 600,
                  borderBottom: '1px solid #f48fb1',
                  textShadow: undefined,
                }}
                onClick={() => handleHeaderClick('hotasBinding')}
              >
                🎮 HOTAS {sortBy === 'hotasBinding' && (sortOrder === 'asc' ? '↑' : '↓')}
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
              {showStatusColumn && (
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
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedBindings.map((binding) => {
              const rowIsLive = isBindingLive ? isBindingLive(binding) : false;
              const baseRowBg = getRowBackground ? getRowBackground(binding) : colors.rowBg;
              const isCapturingThis = activeCaptureBindingId === binding.id;
              const remainingSeconds = Math.max(0, Math.ceil(captureProgress * 3));

              return (
                <Table.Tr
                  key={binding.id}
                  style={{
                    background: rowIsLive ? '#ecfff4' : baseRowBg,
                    borderBottom: rowIsLive
                      ? '1px solid #66bb6a'
                      : `1px solid ${colors.rowBorderColor}`,
                    boxShadow: rowIsLive ? 'inset 0 0 0 1px #66bb6a' : undefined,
                  }}
                >
                <Table.Td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tooltip label={binding.description}>
                      <Text
                        size="sm"
                        fw={rowIsLive ? 700 : 500}
                        style={{
                          color: colors.featureText,
                          cursor: 'help',
                          textShadow: colors.featureTextShadow,
                        }}
                      >
                        {binding.feature}
                      </Text>
                    </Tooltip>
                    {!showStatusColumn && rowIsLive && (
                      <Badge color="green" size="xs" variant="filled">
                        LIVE
                      </Badge>
                    )}
                  </div>
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  {binding.primaryKey ? (
                    <Badge
                      style={{
                        backgroundColor: colors.primaryKeyBadgeBg,
                        color: colors.primaryKeyBadgeColor,
                        border: colors.primaryKeyBadgeBorder,
                      }}
                      size="sm"
                    >
                      {binding.primaryKey}
                    </Badge>
                  ) : (
                    <Text size="xs" style={{ color: colors.emptyKeyColor }}>
                      —
                    </Text>
                  )}
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  {binding.keyboardBinding ? (
                    <Badge
                      style={{
                        backgroundColor: '#fff3e0',
                        color: '#e65100',
                        border: '1px solid #ffb74d',
                      }}
                      size="sm"
                    >
                      {binding.keyboardBinding}
                    </Badge>
                  ) : (
                    <Text size="xs" style={{ color: colors.emptyKeyColor }}>
                      —
                    </Text>
                  )}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '0.65rem 1rem',
                    position: 'relative',
                    cursor: onStartHotasCapture ? 'context-menu' : 'default',
                    userSelect: 'none',
                    background: isCapturingThis ? 'rgba(106, 27, 154, 0.15)' : onStartHotasCapture ? 'rgba(233, 30, 99, 0.03)' : 'transparent',
                    border: isCapturingThis ? '2px solid #6a1b9a' : onStartHotasCapture ? '1px solid rgba(233, 30, 99, 0.3)' : 'none',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!onStartHotasCapture || isCapturingThis) return;
                    e.currentTarget.style.background = 'rgba(233, 30, 99, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(233, 30, 99, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    if (!onStartHotasCapture || isCapturingThis) return;
                    e.currentTarget.style.background = 'rgba(233, 30, 99, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(233, 30, 99, 0.3)';
                  }}
                  onContextMenu={(e) => {
                    if (!onStartHotasCapture) return;
                    e.preventDefault();
                    onStartHotasCapture(binding.id);
                  }}
                  title={isCapturingThis ? 'Listening for HOTAS input...' : 'Right-click to assign HOTAS input'}
                >
                  {isCapturingThis && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${captureProgress * 100}%`,
                        background: 'rgba(106, 27, 154, 0.3)',
                        pointerEvents: 'none',
                        transition: 'width 0.05s linear',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                  <div style={{ position: 'relative', zIndex: 1, minHeight: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCapturingThis ? (
                      <>
                        <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s ease-in-out infinite' }}>●</span>
                        <Text size="xs" fw={700} style={{ color: '#6a1b9a' }}>
                          Listening... {remainingSeconds}s
                        </Text>
                      </>
                    ) : binding.hotasBinding ? (
                      <Badge
                        style={{
                          backgroundColor: '#fce4ec',
                          color: '#c2185b',
                          border: '1px solid #f48fb1',
                        }}
                        size="sm"
                      >
                        {binding.hotasBinding}
                      </Badge>
                    ) : (
                      <Text size="xs" style={{ color: colors.emptyKeyColor }}>
                        —
                      </Text>
                    )}
                  </div>
                </Table.Td>
                <Table.Td style={{ padding: '1rem' }}>
                  <Text size="xs" style={{ color: colors.categoryText, textShadow: colors.categoryTextShadow }}>
                    {binding.category}
                  </Text>
                </Table.Td>
                {showStatusColumn && (
                  <Table.Td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StateIndicator changed={binding.changed} pendingApply={binding.pendingApply} />
                      {rowIsLive && (
                        <Badge color="green" size="xs" variant="filled">
                          LIVE
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                )}
              </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>
    </SciFiFrame>
    </>
  );
};
