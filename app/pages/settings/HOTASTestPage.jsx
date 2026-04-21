import {
  Container,
  Stack,
  Group,
  Text,
  Badge,
  Box,
  SimpleGrid,
  Button,
  Code,
  Alert,
  Table,
  Tabs,
} from '@mantine/core';
import { SciFiFrame } from '../../components/ui';
import {
  useHotasInput,
  X52_BUTTONS,
  X52_AXES,
  X52_MODES as MODES,
  LogitechX52Device,
} from '../../libraries/hotas/index.js';

// Build a unified lookup map matching the old X52_BUTTONS shape so the JSX
// below can continue using X52_BUTTONS[index] and X52_BUTTONS[`${i}-axis`]
// without any changes to the render tree.
// Axes are also keyed as `${index}-axis` for backward compatibility.
const AXIS_COMPAT = Object.fromEntries(
  Object.entries(X52_AXES).map(([i, meta]) => [`${i}-axis`, meta])
);
// Merge buttons + axis compat + POV hat directions into one map
const POV_HAT_COMPAT = {
  '9-hat-n':  { name: 'POV HAT North',     group: 'Look Around', type: 'button', code: 'POV_N',  note: 'POV 8-way' },
  '9-hat-ne': { name: 'POV HAT Northeast', group: 'Look Around', type: 'button', code: 'POV_NE', note: 'POV 8-way' },
  '9-hat-e':  { name: 'POV HAT East',      group: 'Look Around', type: 'button', code: 'POV_E',  note: 'POV 8-way' },
  '9-hat-se': { name: 'POV HAT Southeast', group: 'Look Around', type: 'button', code: 'POV_SE', note: 'POV 8-way' },
  '9-hat-s':  { name: 'POV HAT South',     group: 'Look Around', type: 'button', code: 'POV_S',  note: 'POV 8-way' },
  '9-hat-sw': { name: 'POV HAT Southwest', group: 'Look Around', type: 'button', code: 'POV_SW', note: 'POV 8-way' },
  '9-hat-w':  { name: 'POV HAT West',      group: 'Look Around', type: 'button', code: 'POV_W',  note: 'POV 8-way' },
  '9-hat-nw': { name: 'POV HAT Northwest', group: 'Look Around', type: 'button', code: 'POV_NW', note: 'POV 8-way' },
};
const X52_LOOKUP = { ...X52_BUTTONS, ...AXIS_COMPAT, ...POV_HAT_COMPAT };
const getDisplayButtonNumber = (btnIndex) => X52_LOOKUP[btnIndex]?.windowsIndex ?? (btnIndex + 1);

export default function HOTASTestPage() {
  const {
    gamepadConnected,
    gamepadInfo,
    lastInput,
    inputHistory,
    axisValues,
    currentMode,
    activeInputs,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearHistory,
  } = useHotasInput({ device: LogitechX52Device, trackKeyboard: true });

  // Derive axis9 raw value from axisValues for the debug panel
  const axis9RawValue = parseFloat(axisValues[9] ?? 0);

  const handleStartMonitoring = () => {
    startMonitoring();
    navigator.getGamepads?.();
  };

  const handleStopMonitoring = () => {
    stopMonitoring();
  };

  const handleClearHistory = () => {
    clearHistory();
  };

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
        <Stack gap="xl">
          {/* Title */}
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
              🎮 HOTAS Input Test Lab
            </Text>
            <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Real-time detection and monitoring of HOTAS devices (Logitech X52)
            </Text>
          </div>

          {/* Status Section */}
          <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
            <Box
              p="md"
              style={{
                background: 'rgba(0, 217, 255, 0.05)',
                borderRadius: '8px',
              }}
            >
              <Group justify="space-between" mb="md">
                <Group>
                  <Badge
                    color={gamepadConnected ? 'green' : 'gray'}
                    variant="filled"
                    size="lg"
                  >
                    🎮
                  </Badge>
                  <div>
                    <Text fw={600} style={{ color: '#00d9ff' }}>
                      Device Status
                    </Text>
                    <Text size="sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {gamepadConnected
                        ? `Connected: ${gamepadInfo?.id || 'Unknown Device'}`
                        : 'No gamepad detected'}
                    </Text>
                  </div>
                </Group>
                <Group>
                  <Badge
                    color={isMonitoring ? 'green' : 'gray'}
                    variant="filled"
                  >
                    {isMonitoring ? 'Monitoring' : 'Idle'}
                  </Badge>
                  {gamepadConnected && (
                    <Badge color={MODES[currentMode].color} variant="filled">
                      {MODES[currentMode].name}
                    </Badge>
                  )}
                </Group>
              </Group>

              <Group grow>
                <Button
                  onClick={handleStartMonitoring}
                  disabled={isMonitoring}
                  color="cyan"
                  variant="filled"
                >
                  Start Monitoring
                </Button>
                <Button
                  onClick={handleStopMonitoring}
                  disabled={!isMonitoring}
                  color="gray"
                  variant="outline"
                >
                  Stop Monitoring
                </Button>
                <Button
                  onClick={handleClearHistory}
                  variant="subtle"
                  color="cyan"
                >
                  Clear History
                </Button>
              </Group>
            </Box>
          </SciFiFrame>

          {/* Visual Input Indicators Row */}
          {isMonitoring && (
            <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
              <Box
                p="md"
                style={{
                  background: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '8px',
                }}
              >
                <Text size="sm" fw={600} style={{ color: '#00d9ff', marginBottom: '0.75rem' }}>
                  🎯 Active Inputs
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {/* Button Indicators (0-29) */}
                  {Array.from({ length: 30 }, (_, i) => i).map((btnIndex) => {
                    const isActive = activeInputs.has(`button-${btnIndex}`);
                    const btnInfo = X52_LOOKUP[btnIndex];
                    const displayNumber = getDisplayButtonNumber(btnIndex);
                    return (
                      <div
                        key={`btn-${btnIndex}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          background: isActive ? '#00d9ff' : 'rgba(0, 217, 255, 0.1)',
                          border: isActive
                            ? '2px solid #00d9ff'
                            : '1px solid rgba(0, 217, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: isActive ? '#000000' : 'rgba(0, 217, 255, 0.6)',
                          textShadow: isActive ? 'none' : 'none',
                          title: btnInfo?.name || `Button ${displayNumber}`,
                        }}
                        title={btnInfo?.name || `Button ${displayNumber}`}
                      >
                        B{displayNumber}
                      </div>
                    );
                  })}

                  {/* Axis Indicators (0-8, skipping 9 which is treated as HAT) */}
                  {Array.from({ length: 9 }, (_, i) => i).map((axisIndex) => {
                    const isActive = activeInputs.has(`axis-${axisIndex}`);
                    const axisInfo = X52_LOOKUP[`${axisIndex}-axis`];
                    return (
                      <div
                        key={`axis-${axisIndex}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          background: isActive ? '#00d9ff' : 'rgba(0, 217, 255, 0.1)',
                          border: isActive
                            ? '2px solid #00d9ff'
                            : '1px solid rgba(0, 217, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          fontSize: '10px',
                          fontWeight: 600,
                          color: isActive ? '#000000' : 'rgba(0, 217, 255, 0.6)',
                          title: axisInfo?.name || `Axis ${axisIndex}`,
                        }}
                        title={axisInfo?.name || `Axis ${axisIndex}`}
                      >
                        A{axisIndex}
                      </div>
                    );
                  })}

                  {/* POV HAT (Axis 9) 8-Directional Indicators */}
                  {['9-hat-n', '9-hat-ne', '9-hat-e', '9-hat-se', '9-hat-s', '9-hat-sw', '9-hat-w', '9-hat-nw'].map((hatDir) => {
                    const isActive = activeInputs.has(`button-${hatDir}`);
                    const dirLabel = hatDir.split('-').pop().toUpperCase();
                    const shortDir = dirLabel === 'N' ? '↑' : dirLabel === 'NE' ? '↗' : dirLabel === 'E' ? '→' : dirLabel === 'SE' ? '↘' : dirLabel === 'S' ? '↓' : dirLabel === 'SW' ? '↙' : dirLabel === 'W' ? '←' : '↖';
                    return (
                      <div
                        key={`hat-${hatDir}`}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          background: isActive ? '#00d9ff' : 'rgba(0, 217, 255, 0.1)',
                          border: isActive
                            ? '2px solid #00d9ff'
                            : '1px solid rgba(0, 217, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: isActive ? '#000000' : 'rgba(0, 217, 255, 0.6)',
                          title: `POV HAT ${dirLabel}`,
                        }}
                        title={`POV HAT ${dirLabel}`}
                      >
                        {shortDir}
                      </div>
                    );
                  })}
                </div>
              </Box>
            </SciFiFrame>
          )}

          {/* Tabs for different views */}
          <Tabs defaultValue="live" color="cyan">
            <Tabs.List>
              <Tabs.Tab value="live">Live Input</Tabs.Tab>
              <Tabs.Tab value="history">Input History</Tabs.Tab>
              <Tabs.Tab value="axes">Axis Values</Tabs.Tab>
              <Tabs.Tab value="reference">X52 Reference</Tabs.Tab>
            </Tabs.List>

            {/* Live Input Tab */}
            <Tabs.Panel value="live" pt="md">
              <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
                <Box
                  p="md"
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    borderRadius: '8px',
                  }}
                >
                  {lastInput ? (
                    <Stack gap="md">
                      <Box
                        p="md"
                        style={{
                          background: 'rgba(0, 217, 255, 0.1)',
                          border: '1px solid #00d9ff',
                          borderRadius: '8px',
                        }}
                      >
                        <Group mb="sm">
                          <Badge color="green" variant="filled">
                            ✓
                          </Badge>
                          <Text fw={600} style={{ color: '#00d9ff' }}>
                            Last Input Detected
                          </Text>
                        </Group>
                        <Code
                          block
                          style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            color: '#00ff88',
                            padding: '1rem',
                          }}
                        >
                          {JSON.stringify(lastInput, null, 2)}
                        </Code>
                      </Box>
                    </Stack>
                  ) : (
                    <Alert color="yellow" title="⚠️ Waiting for input">
                      {isMonitoring
                        ? 'Press a button, move an axis, or press a key'
                        : 'Click "Start Monitoring" to begin detecting inputs'}
                    </Alert>
                  )}
                </Box>
              </SciFiFrame>
            </Tabs.Panel>

            {/* Input History Tab */}
            <Tabs.Panel value="history" pt="md">
              <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
                <Box
                  p="md"
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    borderRadius: '8px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                  }}
                >
                  <Stack gap="sm">
                    {inputHistory.length > 0 ? (
                      inputHistory.map((input) => (
                        <Box
                          key={input.id}
                          p="sm"
                          style={{
                            background: 'rgba(0, 217, 255, 0.08)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '4px',
                          }}
                        >
                          <Group justify="space-between">
                            <div>
                              <Text size="sm" fw={600} style={{ color: '#00d9ff' }}>
                                {input.name || input.key || input.code}
                              </Text>
                              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {input.type} • {input.type === 'Axis' ? `Axis ${input.index}` : input.type === 'Button' ? `Button ${input.index}` : `Input ${input.index}`} • {input.action || ''}
                              </Text>
                            </div>
                            <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {input.timestamp}
                            </Text>
                          </Group>
                        </Box>
                      ))
                    ) : (
                      <Alert color="gray" title="ℹ️ No inputs">
                        No inputs recorded yet
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </SciFiFrame>
            </Tabs.Panel>

            {/* Axis Values Tab */}
            <Tabs.Panel value="axes" pt="md">
              <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
                <Box
                  p="md"
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    borderRadius: '8px',
                  }}
                >
                  {Object.keys(axisValues).length > 0 ? (
                    <Stack gap="md">
                      <Text fw={600} style={{ color: '#00d9ff' }}>
                        Active Axes (Axis 9 is displayed as HAT buttons in Active Inputs)
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        {Object.entries(axisValues)
                          .filter(([index]) => index !== '9') // Skip axis 9
                          .map(([index, value]) => (
                            <Box
                              key={index}
                              p="md"
                              style={{
                                background: 'rgba(0, 217, 255, 0.1)',
                                border: '1px solid #00d9ff',
                                borderRadius: '8px',
                              }}
                            >
                              <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={600}>
                                  {X52_LOOKUP[`${index}-axis`]?.name || `Axis ${index}`}
                                </Text>
                                <Badge color="cyan">{value}</Badge>
                              </Group>
                              <div
                                style={{
                                  background: 'rgba(0, 0, 0, 0.2)',
                                  height: '8px',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    background: '#00d9ff',
                                    height: '100%',
                                    width: `${((parseFloat(value) + 1) / 2) * 100}%`,
                                    transition: 'width 0.1s linear',
                                  }}
                                />
                              </div>
                            </Box>
                          ))}
                      </SimpleGrid>
                      
                      {/* Axis 9 (POV HAT) Debug Display */}
                      <Box
                        p="md"
                        style={{
                          background: 'rgba(255, 100, 100, 0.15)',
                          border: '2px solid #ff6464',
                          borderRadius: '8px',
                        }}
                      >
                        <Text fw={600} style={{ color: '#ff6464', marginBottom: '0.5rem' }}>
                          🔧 DEBUG: Axis 9 (POV HAT) Raw Value
                        </Text>
                        <Group gap="md">
                          <Box>
                            <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Raw Value:</Text>
                            <Text size="lg" fw={700} style={{ color: '#fff', fontFamily: 'monospace' }}>
                              {axis9RawValue.toFixed(3)}
                            </Text>
                          </Box>
                          <Box>
                            <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Last Direction:</Text>
                            <Text size="lg" fw={700} style={{ color: '#fff' }}>
                              {typeof lastInput?.index === 'string' && lastInput.index.includes('9-hat')
                                ? lastInput.index.replace('9-hat-', '').toUpperCase()
                                : '(none)'}
                            </Text>
                          </Box>
                        </Group>
                        <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.5rem' }}>
                          ⓘ Move the POV HAT in each direction and note the values below
                        </Text>
                        <Box mt="sm" p="xs" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}>
                          <Text size="xs">Range mapping (corrected):</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>value &lt; -0.85 → N ⬆️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>-0.85 to -0.6 → NE ↗️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>-0.6 to -0.35 → E ➡️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>-0.35 to -0.1 → SE ↘️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>-0.1 to 0.15 → S ⬇️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>0.15 to 0.4 → SW ↙️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>0.4 to 0.65 → W ⬅️</Text>
                          <Text size="xs" style={{ color: '#aaa' }}>value ≥ 0.65 → NW ↖️</Text>
                        </Box>
                      </Box>
                    </Stack>
                  ) : (
                    <Alert color="gray" title="ℹ️ No active axes">
                      {isMonitoring
                        ? 'Move analog sticks or sliders to see axis values'
                        : 'Start monitoring to see axis values'}
                    </Alert>
                  )}
                </Box>
              </SciFiFrame>
            </Tabs.Panel>

            {/* Reference Tab */}
            <Tabs.Panel value="reference" pt="md">
              <SciFiFrame variant="corners" cornerLength={12} strokeWidth={1}>
                <Box
                  p="md"
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    borderRadius: '8px',
                    overflowX: 'auto',
                  }}
                >
                  <Stack gap="md">
                    <div>
                      <Text fw={600} style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>
                        Logitech X52 HOTAS Specifications
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} gap="md">
                        <Box
                          p="sm"
                          style={{
                            background: 'rgba(0, 217, 255, 0.08)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '4px',
                          }}
                        >
                          <Text size="sm" fw={600} style={{ color: '#00d9ff' }}>
                            📊 Device Specs
                          </Text>
                          <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            23 Buttons<br />
                            3 × 8-way HAT Switches<br />
                            7 Control Axes<br />
                            47 Basic Commands<br />
                            3 Mode Switch (Red/Purple/Blue)<br />
                            200+ Commands (with Pinkie modifier)
                          </Text>
                        </Box>
                        <Box
                          p="sm"
                          style={{
                            background: 'rgba(0, 217, 255, 0.08)',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                            borderRadius: '4px',
                          }}
                        >
                          <Text size="sm" fw={600} style={{ color: '#00d9ff' }}>
                            🎛️ Mode System
                          </Text>
                          <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Red Mode: Combat Focus<br />
                            Purple Mode: Navigation<br />
                            Blue Mode: Mining/Trading<br />
                            Pinkie Modifier: Doubles modes to 6<br />
                            MFD: Shows current mode
                          </Text>
                        </Box>
                      </SimpleGrid>
                    </div>

                    <div>
                      <Text size="sm" fw={600} style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>
                        Button Groups
                      </Text>
                      <div style={{ overflowX: 'auto' }}>
                        <Table
                          striped
                          highlightOnHover
                          style={{
                            background: 'rgba(0, 217, 255, 0.03)',
                          }}
                        >
                          <Table.Thead>
                            <Table.Tr
                              style={{
                                background: 'rgba(0, 217, 255, 0.1)',
                              }}
                            >
                              <Table.Th style={{ color: '#00d9ff' }}>Index</Table.Th>
                              <Table.Th style={{ color: '#00d9ff' }}>Button Name</Table.Th>
                              <Table.Th style={{ color: '#00d9ff' }}>Group</Table.Th>
                              <Table.Th style={{ color: '#00d9ff' }}>Type</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {Object.entries(X52_LOOKUP)
                              .filter(([_, btn]) => btn.type !== 'axis')
                              .map(([index, btn]) => (
                                <Table.Tr
                                  key={index}
                                  style={{
                                    borderColor: 'rgba(0, 217, 255, 0.1)',
                                  }}
                                >
                                  <Table.Td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {index}
                                  </Table.Td>
                                  <Table.Td style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    {btn.name}
                                    {btn.note && (
                                      <Text size="xs" c="dimmed">
                                        ({btn.note})
                                      </Text>
                                    )}
                                  </Table.Td>
                                  <Table.Td style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {btn.group}
                                  </Table.Td>
                                  <Table.Td>
                                    <Badge size="sm" color="cyan" variant="light">
                                      {btn.type}
                                    </Badge>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                          </Table.Tbody>
                        </Table>
                      </div>
                    </div>

                    <div>
                      <Text size="sm" fw={600} style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>
                        All Inputs (Interactive - Active inputs highlight when monitoring)
                      </Text>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                          gap: '8px',
                        }}
                      >
                        {/* All Buttons (0-29) */}
                        {Array.from({ length: 30 }, (_, i) => i).map((btnIndex) => {
                          const isActive = activeInputs.has(`button-${btnIndex}`);
                          const btnInfo = X52_LOOKUP[btnIndex];
                          const displayNumber = getDisplayButtonNumber(btnIndex);
                          return (
                            <Box
                              key={`ref-btn-${btnIndex}`}
                              p="xs"
                              style={{
                                background: isActive
                                  ? 'rgba(0, 217, 255, 0.3)'
                                  : 'rgba(0, 217, 255, 0.08)',
                                border: isActive
                                  ? '2px solid #00d9ff'
                                  : '1px solid rgba(0, 217, 255, 0.2)',
                                borderRadius: '4px',
                                transition: 'all 0.1s ease',
                              }}
                            >
                              <Text
                                size="xs"
                                fw={isActive ? 700 : 600}
                                style={{ color: isActive ? '#00d9ff' : 'rgba(255, 255, 255, 0.8)' }}
                              >
                                {displayNumber}: {btnInfo?.name || `Button ${displayNumber}`}
                              </Text>
                              {btnInfo?.code && (
                                <Text
                                  size="xs"
                                  style={{ color: 'rgba(0, 217, 255, 0.6)', fontFamily: 'monospace', marginTop: '2px' }}
                                >
                                  [{btnInfo.code}]
                                </Text>
                              )}
                            </Box>
                          );
                        })}

                        {/* All Axes (0-8, skipping 9 which is treated as HAT) */}
                        {Array.from({ length: 9 }, (_, i) => i).map((axisIndex) => {
                          const isActive = activeInputs.has(`axis-${axisIndex}`);
                          const axisInfo = X52_LOOKUP[`${axisIndex}-axis`];
                          return (
                            <Box
                              key={`ref-axis-${axisIndex}`}
                              p="xs"
                              style={{
                                background: isActive
                                  ? 'rgba(0, 217, 255, 0.3)'
                                  : 'rgba(0, 217, 255, 0.08)',
                                border: isActive
                                  ? '2px solid #00d9ff'
                                  : '1px solid rgba(0, 217, 255, 0.2)',
                                borderRadius: '4px',
                                transition: 'all 0.1s ease',
                              }}
                            >
                              <Text
                                size="xs"
                                fw={isActive ? 700 : 600}
                                style={{ color: isActive ? '#00d9ff' : 'rgba(255, 255, 255, 0.8)' }}
                              >
                                A{axisIndex}: {axisInfo?.name || `Axis ${axisIndex}`}
                              </Text>
                              {axisInfo?.code && (
                                <Text
                                  size="xs"
                                  style={{ color: 'rgba(0, 217, 255, 0.6)', fontFamily: 'monospace', marginTop: '2px' }}
                                >
                                  [{axisInfo.code}]
                                </Text>
                              )}
                            </Box>
                          );
                        })}

                        {/* POV HAT (Axis 9) 8-Directional Buttons */}
                        {['9-hat-n', '9-hat-ne', '9-hat-e', '9-hat-se', '9-hat-s', '9-hat-sw', '9-hat-w', '9-hat-nw'].map((hatDir) => {
                          const isActive = activeInputs.has(`button-${hatDir}`);
                          const dirLabel = hatDir.split('-').pop().toUpperCase();
                          const hatInfo = X52_LOOKUP[hatDir];
                          return (
                            <Box
                              key={`ref-${hatDir}`}
                              p="xs"
                              style={{
                                background: isActive
                                  ? 'rgba(0, 217, 255, 0.3)'
                                  : 'rgba(0, 217, 255, 0.08)',
                                border: isActive
                                  ? '2px solid #00d9ff'
                                  : '1px solid rgba(0, 217, 255, 0.2)',
                                borderRadius: '4px',
                                transition: 'all 0.1s ease',
                              }}
                            >
                              <Text
                                size="xs"
                                fw={isActive ? 700 : 600}
                                style={{ color: isActive ? '#00d9ff' : 'rgba(255, 255, 255, 0.8)' }}
                              >
                                {hatInfo?.name || `POV HAT ${dirLabel}`}
                              </Text>
                              {hatInfo?.code && (
                                <Text
                                  size="xs"
                                  style={{ color: 'rgba(0, 217, 255, 0.6)', fontFamily: 'monospace', marginTop: '2px' }}
                                >
                                  [{hatInfo.code}]
                                </Text>
                              )}
                            </Box>
                          );
                        })}
                      </div>
                    </div>
                  </Stack>
                </Box>
              </SciFiFrame>
            </Tabs.Panel>
          </Tabs>

          {/* Help Section */}
          <Box
            p="md"
            style={{
              background: 'rgba(0, 217, 255, 0.05)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '8px',
            }}
          >
            <Text size="sm" fw={600} style={{ color: '#00d9ff', marginBottom: '0.5rem' }}>
              💡 How to Use
            </Text>
            <Stack gap="xs">
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                1. Connect your Logitech X52 HOTAS device to your computer
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                2. Click <strong>"Start Monitoring"</strong> to begin detecting inputs
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                3. Press buttons, move axes, or press keys - they will appear in the Live Input tab
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                4. View the <strong>Input History</strong> for the last 50 inputs
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                5. Check the <strong>Axis Values</strong> tab to see analog stick/throttle values in real-time
              </Text>
              <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                6. Use the <strong>X52 Reference</strong> tab to understand button mappings and the mode system
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </div>
  );
}
