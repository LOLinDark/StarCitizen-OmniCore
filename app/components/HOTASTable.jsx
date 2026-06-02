import { Table, Badge, Text, Tooltip, Anchor } from '@mantine/core';
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
  onStartModeHotasCapture,
  showModeColumns = false,
  activeCaptureBindingId = null,
  activeModeCaptureKey = '',
  captureProgress = 0,
  onStartKeyboardCapture,
  activeKeyboardCaptureBindingId = null,
  keyboardCaptureProgress = 0,
  trainingNotes = {},
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
                  borderBottom: '1px solid rgba(255, 152, 0, 0.3)',
                  textShadow: undefined,
                }}
                onClick={() => handleHeaderClick('keyboardBinding')}
              >
                ⌨️ Keyboard/Mouse {sortBy === 'keyboardBinding' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Table.Th>
              {!showModeColumns && (
                <Table.Th
                  style={{
                    cursor: 'pointer',
                    color: '#e91e63',
                    padding: '1rem',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(233, 30, 99, 0.3)',
                    textShadow: undefined,
                  }}
                  onClick={() => handleHeaderClick('hotasBinding')}
                >
                  {`🎮 HOTAS ${sortBy === 'hotasBinding' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
                </Table.Th>
              )}
              {showModeColumns && (
                <>
                  <Table.Th
                    style={{
                      color: '#7cb342',
                      padding: '1rem',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(124, 179, 66, 0.35)',
                    }}
                  >
                    Green
                  </Table.Th>
                  <Table.Th
                    style={{
                      color: '#ffa726',
                      padding: '1rem',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(255, 167, 38, 0.35)',
                    }}
                  >
                    Orange
                  </Table.Th>
                  <Table.Th
                    style={{
                      color: '#ef5350',
                      padding: '1rem',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(239, 83, 80, 0.35)',
                    }}
                  >
                    Red
                  </Table.Th>
                </>
              )}
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
              const isCapturingKeyboard = activeKeyboardCaptureBindingId === binding.id;
              const remainingSeconds = Math.max(0, Math.ceil(captureProgress * 3));
              const remainingKeyboardSeconds = Math.max(0, Math.ceil(keyboardCaptureProgress * 3));
              const note = trainingNotes?.[binding.id] || null;
              const tutorialCount = note?.tutorialVideos?.length || 0;
              const discussionCount = (note?.devDiscussionVideos?.length || 0) + (note?.readingLinks?.length || 0);
              const shortDescription = note?.shortDescription || note?.summary || binding.description || 'No training notes yet.';
              const longDescription = note?.longDescription || '';
              const tooltipContext = Array.isArray(note?.tooltipContext) ? note.tooltipContext.filter(Boolean) : [];
              const tooltipContent = (
                <div style={{ maxWidth: 420 }}>
                  <Text size="xs" fw={700} c="cyan">{binding.feature}</Text>
                  <Text size="xs" c="gray.3" mt={4}>{shortDescription}</Text>
                  {longDescription && (
                    <Text size="xs" c="gray.5" mt={4}>{longDescription}</Text>
                  )}
                  {note?.whenToUse && (
                    <Text size="xs" c="orange.2" mt={4}>When: {note.whenToUse}</Text>
                  )}
                  {note?.bestPractice && (
                    <Text size="xs" c="teal.1" mt={2}>Best Practice: {note.bestPractice}</Text>
                  )}
                  {tooltipContext.map((line, index) => (
                    <Text key={`${binding.id}-context-${index}`} size="xs" c="blue.2" mt={2}>
                      Context: {line}
                    </Text>
                  ))}
                  {(tutorialCount > 0 || discussionCount > 0) && (
                    <Text size="xs" c="dimmed" mt={4}>
                      {tutorialCount} tutorial link{tutorialCount === 1 ? '' : 's'} | {discussionCount} reference link{discussionCount === 1 ? '' : 's'}
                    </Text>
                  )}
                </div>
              );

              const renderHotasCell = (modeKey = null) => {
                const value = modeKey ? binding.modeHotasBindings?.[modeKey] : binding.hotasBinding;
                const isCapturingModeCell = modeKey
                  ? activeModeCaptureKey === `${binding.id}:${modeKey}`
                  : isCapturingThis;

                return (
                  <Table.Td
                    style={{
                      padding: '0.65rem 1rem',
                      position: 'relative',
                      cursor: (modeKey ? onStartModeHotasCapture : onStartHotasCapture) ? 'context-menu' : 'default',
                      userSelect: 'none',
                      background: isCapturingModeCell ? 'rgba(106, 27, 154, 0.15)' : (modeKey ? 'rgba(233, 30, 99, 0.02)' : onStartHotasCapture ? 'rgba(233, 30, 99, 0.03)' : 'transparent'),
                      border: isCapturingModeCell ? '2px solid #6a1b9a' : (modeKey || onStartHotasCapture) ? '1px solid rgba(233, 30, 99, 0.2)' : 'none',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!(modeKey ? onStartModeHotasCapture : onStartHotasCapture) || isCapturingModeCell) return;
                      e.currentTarget.style.background = 'rgba(233, 30, 99, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(233, 30, 99, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      if (!(modeKey ? onStartModeHotasCapture : onStartHotasCapture) || isCapturingModeCell) return;
                      e.currentTarget.style.background = modeKey ? 'rgba(233, 30, 99, 0.02)' : 'rgba(233, 30, 99, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(233, 30, 99, 0.2)';
                    }}
                    onContextMenu={(e) => {
                      if (modeKey) {
                        if (!onStartModeHotasCapture) return;
                        e.preventDefault();
                        onStartModeHotasCapture(binding.id, modeKey);
                        return;
                      }

                      if (!onStartHotasCapture) return;
                      e.preventDefault();
                      onStartHotasCapture(binding.id);
                    }}
                    title={isCapturingModeCell ? 'Listening for HOTAS input...' : (modeKey ? `Right-click to assign HOTAS input for ${modeKey} mode` : 'Right-click to assign HOTAS input')}
                  >
                    {isCapturingModeCell && (
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
                      {isCapturingModeCell ? (
                        <>
                          <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s ease-in-out infinite' }}>●</span>
                          <Text size="xs" fw={700} style={{ color: '#6a1b9a' }}>
                            Listening... {remainingSeconds}s
                          </Text>
                        </>
                      ) : value ? (
                        <Badge
                          style={{
                            backgroundColor: 'rgba(233, 30, 99, 0.12)',
                            color: '#f48fb1',
                            border: '1px solid rgba(233, 30, 99, 0.3)',
                          }}
                          size="sm"
                        >
                          {value}
                        </Badge>
                      ) : (
                        <Text size="xs" style={{ color: colors.emptyKeyColor }}>
                          —
                        </Text>
                      )}
                    </div>
                  </Table.Td>
                );
              };

              return (
                <Table.Tr
                  key={binding.id}
                  style={{
                    background: rowIsLive ? 'rgba(34, 209, 123, 0.08)' : baseRowBg,
                    borderBottom: rowIsLive
                      ? '1px solid rgba(34, 209, 123, 0.3)'
                      : `1px solid ${colors.rowBorderColor}`,
                    boxShadow: rowIsLive ? 'inset 0 0 0 1px rgba(34, 209, 123, 0.2)' : undefined,
                  }}
                >
                <Table.Td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tooltip label={tooltipContent} multiline>
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
                    <Anchor
                      size="xs"
                      href={`/academy/feature-library?feature=${encodeURIComponent(binding.id)}`}
                      c="cyan"
                      underline="hover"
                      title="Open detailed feature guide"
                    >
                      Details
                    </Anchor>
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
                <Table.Td
                  style={{
                    padding: '0.65rem 1rem',
                    position: 'relative',
                    cursor: onStartKeyboardCapture ? 'context-menu' : 'default',
                    userSelect: 'none',
                    background: isCapturingKeyboard ? 'rgba(230, 81, 0, 0.15)' : onStartKeyboardCapture ? 'rgba(255, 152, 0, 0.03)' : 'transparent',
                    border: isCapturingKeyboard ? '2px solid #e65100' : onStartKeyboardCapture ? '1px solid rgba(255, 152, 0, 0.35)' : 'none',
                    borderRadius: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!onStartKeyboardCapture || isCapturingKeyboard) return;
                    e.currentTarget.style.background = 'rgba(255, 152, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 152, 0, 0.65)';
                  }}
                  onMouseLeave={(e) => {
                    if (!onStartKeyboardCapture || isCapturingKeyboard) return;
                    e.currentTarget.style.background = 'rgba(255, 152, 0, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 152, 0, 0.35)';
                  }}
                  onContextMenu={(e) => {
                    if (!onStartKeyboardCapture) return;
                    e.preventDefault();
                    onStartKeyboardCapture(binding.id);
                  }}
                  title={isCapturingKeyboard ? 'Listening for keyboard/mouse input...' : 'Right-click to assign keyboard or mouse input'}
                >
                  {isCapturingKeyboard && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${keyboardCaptureProgress * 100}%`,
                        background: 'rgba(230, 81, 0, 0.28)',
                        pointerEvents: 'none',
                        transition: 'width 0.05s linear',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                  <div style={{ position: 'relative', zIndex: 1, minHeight: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isCapturingKeyboard ? (
                      <>
                        <span style={{ fontSize: '1.2rem', animation: 'pulse 1.5s ease-in-out infinite' }}>●</span>
                        <Text size="xs" fw={700} style={{ color: '#e65100' }}>
                          Listening... {remainingKeyboardSeconds}s
                        </Text>
                      </>
                    ) : binding.keyboardBinding ? (
                      <Badge
                        style={{
                          backgroundColor: 'rgba(255, 152, 0, 0.12)',
                          color: '#ffb74d',
                          border: '1px solid rgba(255, 152, 0, 0.3)',
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
                  </div>
                </Table.Td>
                {!showModeColumns && renderHotasCell()}
                {showModeColumns && renderHotasCell('green')}
                {showModeColumns && renderHotasCell('orange')}
                {showModeColumns && renderHotasCell('red')}
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
