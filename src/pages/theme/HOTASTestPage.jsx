import { useState, useEffect } from 'react';
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
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { SciFiFrame } from '../../components/ui';

// X52 Button Mapping Reference
const X52_BUTTONS = {
  // Joystick buttons
  1: { name: 'Trigger', group: 'Stick', type: 'button' },
  2: { name: 'Safe Button', group: 'Stick', type: 'button' },
  3: { name: 'Button A', group: 'Stick', type: 'button' },
  4: { name: 'Button B', group: 'Stick', type: 'button' },
  5: { name: 'Button C', group: 'Stick', type: 'button' },
  6: { name: 'Pinkie Switch', group: 'Stick', type: 'button', note: 'Modifier' },
  // HAT switches
  '16-19': { name: 'HAT 1 (8-way)', group: 'Stick', type: 'hat', directions: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
  // Throttle buttons
  7: { name: 'Fire D', group: 'Throttle', type: 'button' },
  8: { name: 'Button E', group: 'Throttle', type: 'button' },
  '9-14': { name: 'Toggles T1-T6', group: 'Throttle', type: 'toggle' },
  15: { name: 'Mouse Button', group: 'Throttle', type: 'button' },
  '20-23': { name: 'Throttle HAT (8-way)', group: 'Throttle', type: 'hat', directions: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] },
  // Axes
  0: { name: 'X Axis (Stick)', group: 'Axes', type: 'axis' },
  1: { name: 'Y Axis (Stick)', group: 'Axes', type: 'axis' },
  2: { name: 'Z Rotation', group: 'Axes', type: 'axis' },
  3: { name: 'Throttle Slider', group: 'Axes', type: 'axis' },
  4: { name: 'Rotary 1', group: 'Axes', type: 'axis' },
  5: { name: 'Rotary 2', group: 'Axes', type: 'axis' },
  6: { name: 'Slider', group: 'Axes', type: 'axis' },
};

const MODES = {
  0: { name: 'Red Mode', color: 'red' },
  1: { name: 'Purple Mode', color: 'violet' },
  2: { name: 'Blue Mode', color: 'blue' },
};

export default function HOTASTestPage() {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadInfo, setGamepadInfo] = useState(null);
  const [lastInput, setLastInput] = useState(null);
  const [inputHistory, setInputHistory] = useState([]);
  const [axisValues, setAxisValues] = useState({});
  const [currentMode, setCurrentMode] = useState(0);
  const [keyboardEvents, setKeyboardEvents] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isMonitoring) {
        const eventData = {
          id: Date.now(),
          type: 'KeyDown',
          key: e.key,
          code: e.code,
          timestamp: new Date().toLocaleTimeString(),
        };
        setLastInput(eventData);
        setKeyboardEvents((prev) => [eventData, ...prev.slice(0, 19)]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMonitoring]);

  // Gamepad API monitoring
  useEffect(() => {
    let animationFrameId;

    const handleGamepadConnected = (e) => {
      setGamepadConnected(true);
      setGamepadInfo(e.gamepad);
    };

    const handleGamepadDisconnected = () => {
      setGamepadConnected(false);
      setGamepadInfo(null);
    };

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads?.() || [];
      const gamepad = gamepads[0];

      if (gamepad && isMonitoring) {
        setGamepadInfo(gamepad);

        // Check buttons
        gamepad.buttons.forEach((button, index) => {
          if (button.pressed) {
            const eventData = {
              id: Date.now() + Math.random(),
              type: 'Button',
              index,
              name: X52_BUTTONS[index]?.name || `Button ${index}`,
              timestamp: new Date().toLocaleTimeString(),
            };
            setLastInput(eventData);
            setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
          }
        });

        // Update axis values
        const newAxisValues = {};
        gamepad.axes.forEach((value, index) => {
          if (Math.abs(value) > 0.1) {
            newAxisValues[index] = value.toFixed(2);
          }
        });
        setAxisValues(newAxisValues);

        // Detect mode from pinkie switch or other logic
        if (gamepad.buttons[6]?.pressed) {
          // Pinkie switch affects mode detection
          setCurrentMode((prev) => (prev + 1) % 3);
        }
      }

      if (isMonitoring) {
        animationFrameId = requestAnimationFrame(pollGamepad);
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    if (isMonitoring) {
      pollGamepad();
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isMonitoring]);

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    // Request gamepad access
    navigator.getGamepads?.();
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
  };

  const handleClearHistory = () => {
    setInputHistory([]);
    setKeyboardEvents([]);
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
                                {input.type} • Button {input.index ?? 'N/A'}
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
                        Active Axes
                      </Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        {Object.entries(axisValues).map(([index, value]) => (
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
                                {X52_BUTTONS[index]?.name || `Axis ${index}`}
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
                            {Object.entries(X52_BUTTONS)
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
