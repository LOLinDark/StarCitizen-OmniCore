import { useState, useEffect, useRef } from 'react';
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
  0: { name: 'Hair Trigger', group: 'Stick', type: 'button', code: 'BTN_STICK_TRIG' },
  1: { name: 'Safe Button', group: 'Stick', type: 'button', code: 'BTN_STICK_SAFE' },
  2: { name: 'Button A', group: 'Stick', type: 'button', code: 'BTN_STICK_A' },
  3: { name: 'Button B', group: 'Stick', type: 'button', code: 'BTN_STICK_B' },
  4: { name: 'Button C', group: 'Stick', type: 'button', code: 'BTN_STICK_C' },
  5: { name: 'Pinkie Switch', group: 'Stick', type: 'button', code: 'BTN_PINKIE', note: 'Modifier' },
  6: { name: 'D', group: 'Throttle', type: 'button', code: 'BTN_THR_D' },
  // Throttle buttons
  7: { name: 'Fire D', group: 'Throttle', type: 'button', code: 'BTN_THR_FIRED' },
  8: { name: 'Button E', group: 'Throttle', type: 'button', code: 'BTN_THR_E' },
  // Toggle Switches T1-T6
  9: { name: 'Toggle T1', group: 'Throttle', type: 'button', code: 'BTN_TOG_T1' },
  10: { name: 'Toggle T2', group: 'Throttle', type: 'button', code: 'BTN_TOG_T2' },
  11: { name: 'Toggle T3', group: 'Throttle', type: 'button', code: 'BTN_TOG_T3' },
  12: { name: 'Toggle T4', group: 'Throttle', type: 'button', code: 'BTN_TOG_T4' },
  13: { name: 'Toggle T5', group: 'Throttle', type: 'button', code: 'BTN_TOG_T5' },
  14: { name: 'Trigger Full (Full Press)', group: 'Stick', type: 'button', code: 'BTN_STICK_TRIG_FULL' },
  15: { name: 'Toggle T6', group: 'Throttle', type: 'button', code: 'BTN_TOG_T6' },
  // Mouse Button (on throttle)
  16: { name: 'Mouse Button', group: 'Throttle', type: 'button', code: 'BTN_THR_MOUSE' },
  // HAT 1 on Stick (8-way)
  17: { name: 'HAT 1 North', group: 'Stick', type: 'button', code: 'HAT_1_N' },
  18: { name: 'HAT 1 Northeast', group: 'Stick', type: 'button', code: 'HAT_1_NE' },
  19: { name: 'HAT 1 East', group: 'Stick', type: 'button', code: 'HAT_1_E' },
  20: { name: 'HAT 1 Southeast', group: 'Stick', type: 'button', code: 'HAT_1_SE' },
  // Throttle HAT 2 (8-way)
  21: { name: 'HAT 2 North', group: 'Throttle', type: 'button', code: 'HAT_2_N' },
  22: { name: 'HAT 2 Northeast', group: 'Throttle', type: 'button', code: 'HAT_2_NE' },
  23: { name: 'HAT 2 East', group: 'Throttle', type: 'button', code: 'HAT_2_E' },
  24: { name: 'HAT 2 Southeast', group: 'Throttle', type: 'button', code: 'HAT_2_SE' },
  25: { name: 'Button 25 (Extended)', group: 'Extended', type: 'button', code: 'BTN_EXT_25' },
  26: { name: 'Button 26 (Extended)', group: 'Extended', type: 'button', code: 'BTN_EXT_26' },
  27: { name: 'Button 27 (Extended)', group: 'Extended', type: 'button', code: 'BTN_EXT_27' },
  28: { name: 'Button 28 (Extended)', group: 'Extended', type: 'button', code: 'BTN_EXT_28' },
  29: { name: 'Button 29 (Extended)', group: 'Extended', type: 'button', code: 'BTN_EXT_29' },
  // Axes
  '0-axis': { name: 'X Axis (Stick)', group: 'Axes', type: 'axis', code: 'AX_X' },
  '1-axis': { name: 'Y Axis (Stick)', group: 'Axes', type: 'axis', code: 'AX_Y' },
  '2-axis': { name: 'Z Rotation', group: 'Axes', type: 'axis', code: 'AX_Z' },
  '3-axis': { name: 'Throttle Main', group: 'Axes', type: 'axis', code: 'AX_THR' },
  '4-axis': { name: 'Rotary 1 (Large)', group: 'Axes', type: 'axis', code: 'AX_ROT1' },
  '5-axis': { name: 'Rotary 2 (Small)', group: 'Axes', type: 'axis', code: 'AX_ROT2' },
  '6-axis': { name: 'Slider', group: 'Axes', type: 'axis', code: 'AX_SLD' },
  // Axis 9 mapped as 8-directional POV HAT (Point of View)
  '9-hat-n': { name: 'POV HAT North', group: 'Look Around', type: 'button', code: 'POV_N', note: 'POV 8-way' },
  '9-hat-ne': { name: 'POV HAT Northeast', group: 'Look Around', type: 'button', code: 'POV_NE', note: 'POV 8-way' },
  '9-hat-e': { name: 'POV HAT East', group: 'Look Around', type: 'button', code: 'POV_E', note: 'POV 8-way' },
  '9-hat-se': { name: 'POV HAT Southeast', group: 'Look Around', type: 'button', code: 'POV_SE', note: 'POV 8-way' },
  '9-hat-s': { name: 'POV HAT South', group: 'Look Around', type: 'button', code: 'POV_S', note: 'POV 8-way' },
  '9-hat-sw': { name: 'POV HAT Southwest', group: 'Look Around', type: 'button', code: 'POV_SW', note: 'POV 8-way' },
  '9-hat-w': { name: 'POV HAT West', group: 'Look Around', type: 'button', code: 'POV_W', note: 'POV 8-way' },
  '9-hat-nw': { name: 'POV HAT Northwest', group: 'Look Around', type: 'button', code: 'POV_NW', note: 'POV 8-way' },
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
  const [axis9RawValue, setAxis9RawValue] = useState(0);
  const [currentMode, setCurrentMode] = useState(0);
  const [keyboardEvents, setKeyboardEvents] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [previousButtonState, setPreviousButtonState] = useState({});
  const [previousAxisState, setPreviousAxisState] = useState({});
  const [activeInputs, setActiveInputs] = useState(new Set());
  
  // Use refs for synchronous state tracking between frames
  const previousButtonStateRef = useRef({});
  const previousAxisStateRef = useRef({});
  const previousAxis9StateRef = useRef({ n: false, ne: false, e: false, se: false, s: false, sw: false, w: false, nw: false, rawValue: null });

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
        const currentActiveInputs = new Set();

        // Check buttons using ref for proper state tracking
        gamepad.buttons.forEach((button, index) => {
          const isPressed = button.pressed;
          const wasPressed = previousButtonStateRef.current[index] || false;
          
          // Update ref immediately for next frame
          previousButtonStateRef.current[index] = isPressed;

          // Track active inputs
          if (isPressed) {
            currentActiveInputs.add(`button-${index}`);
          }

          // Only log on state change (press or release)
          if (isPressed && !wasPressed) {
            // Button just pressed
            const eventData = {
              id: Date.now() + Math.random(),
              type: 'Button',
              action: 'Pressed',
              index,
              name: X52_BUTTONS[index]?.name || `Button ${index}`,
              timestamp: new Date().toLocaleTimeString(),
            };
            setLastInput(eventData);
            setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
          } else if (!isPressed && wasPressed) {
            // Button just released
            const eventData = {
              id: Date.now() + Math.random(),
              type: 'Button',
              action: 'Released',
              index,
              name: X52_BUTTONS[index]?.name || `Button ${index}`,
              timestamp: new Date().toLocaleTimeString(),
            };
            setLastInput(eventData);
            setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
          }
        });

        // Track axis state changes (significant movement only)
        const newAxisValues = {};

        gamepad.axes.forEach((value, index) => {
          // IMPORTANT: Validate axis value - skip if outside valid range
          // Valid gamepad axes are always between -1 and 1
          // Anything outside this range is garbage/corruption data to ignore
          if (typeof value !== 'number' || value < -1 || value > 1) {
            return; // Skip invalid values
          }

          // Special handling for axis 9 (POV HAT - 8-way directional for looking around)
          if (index === 9) {
            // SIMPLE RAW VALUE LOGGING - NO MAPPING YET
            const previousValue = previousAxis9StateRef.current?.rawValue;
            
            // Log whenever value changes by more than 0.05 (significant movement)
            if (previousValue === null || Math.abs(value - previousValue) > 0.05) {
              console.log(`🎮 POV HAT RAW VALUE: ${value.toFixed(3)}`);
            }
            
            // Update display
            setAxis9RawValue(value);
            
            // Map analog value to 8 compass directions based on actual hardware values:
            // N: -1.000, NE: -0.714, E: -0.429, SE: -0.143, S: 0.143, SW: 0.143, W: 0.714, NW: 1.000
            let direction = null;
            
            // Center/neutral zone
            if (value > -0.1 && value < 0.1) {
              direction = null;
            }
            // North
            else if (value < -0.857) direction = 'n';
            // Northeast
            else if (value >= -0.857 && value < -0.571) direction = 'ne';
            // East
            else if (value >= -0.571 && value < -0.286) direction = 'e';
            // Southeast
            else if (value >= -0.286 && value < 0) direction = 'se';
            // South
            else if (value >= 0 && value < 0.286) direction = 's';
            // Southwest
            else if (value >= 0.286 && value < 0.571) direction = 'sw';
            // West
            else if (value >= 0.571 && value < 0.857) direction = 'w';
            // Northwest
            else if (value >= 0.857) direction = 'nw';
            
            // Set the active direction
            let newAxis9State = { n: false, ne: false, e: false, se: false, s: false, sw: false, w: false, nw: false };
            if (direction) {
              newAxis9State[direction] = true;
            }
            
            // Log direction changes using ref
            const previousAxis9StateCheck = previousAxis9StateRef.current;
            ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].forEach((dir) => {
              if (newAxis9State[dir] && !previousAxis9StateCheck[dir]) {
                // Direction just activated
                const dirName = dir.toUpperCase();
                const eventData = {
                  id: Date.now() + Math.random(),
                  type: 'Button',
                  action: 'Pressed',
                  index: `9-hat-${dir}`,
                  name: `POV HAT ${dirName}`,
                  timestamp: new Date().toLocaleTimeString(),
                };
                setLastInput(eventData);
                setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
                currentActiveInputs.add(`button-9-hat-${dir}`);
              } else if (!newAxis9State[dir] && previousAxis9StateCheck[dir]) {
                // Direction just deactivated
                const dirName = dir.toUpperCase();
                const eventData = {
                  id: Date.now() + Math.random(),
                  type: 'Button',
                  action: 'Released',
                  index: `9-hat-${dir}`,
                  name: `POV HAT ${dirName}`,
                  timestamp: new Date().toLocaleTimeString(),
                };
                setLastInput(eventData);
                setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
              } else if (newAxis9State[dir]) {
                // Direction is still active
                currentActiveInputs.add(`button-9-hat-${dir}`);
              }
            });
            
            // Store raw value in ref for next frame
            previousAxis9StateRef.current = { ...newAxis9State, rawValue: value };
            return;
          }

          const previousValue = previousAxisStateRef.current[index] || 0;
          
          // Update ref immediately for next frame
          previousAxisStateRef.current[index] = value;

          // Skip axis 9 (handled separately as POV HAT)
          if (index === 9) return;

          // Continuous axes: Rotary 1 (4), Rotary 2 (5), Slider (6) - log VALUE CHANGES
          const continuousAxes = [4, 5, 6];
          if (continuousAxes.includes(index)) {
            const valueChangeThreshold = 0.05; // Log changes larger than 5%
            const valueDifference = Math.abs(value - previousValue);
            
            // Log if value changed significantly
            if (valueDifference > valueChangeThreshold) {
              const eventData = {
                id: Date.now() + Math.random(),
                type: 'Axis',
                action: 'Value Changed',
                index,
                name: X52_BUTTONS[`${index}-axis`]?.name || `Axis ${index}`,
                value: value.toFixed(3),
                previousValue: previousValue.toFixed(3),
                timestamp: new Date().toLocaleTimeString(),
              };
              setLastInput(eventData);
              setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
            }
            
            // Always track and display continuous axes
            currentActiveInputs.add(`axis-${index}`);
            newAxisValues[index] = value.toFixed(3);
            return;
          }

          // Binary axes: Stick (0,1,2), Throttle (3) - use deadzone-based edge detection
          const deadzone = 0.15;
          const isActive = Math.abs(value) > deadzone;
          const previousActive = Math.abs(previousValue) > deadzone;

          // Track active axes
          if (isActive) {
            currentActiveInputs.add(`axis-${index}`);
          }

          // Only log on deadzone crossing (edge detection)
          if (isActive && !previousActive) {
            const eventData = {
              id: Date.now() + Math.random(),
              type: 'Axis',
              action: 'Engaged',
              index,
              name: X52_BUTTONS[`${index}-axis`]?.name || `Axis ${index}`,
              value: value.toFixed(3),
              timestamp: new Date().toLocaleTimeString(),
            };
            setLastInput(eventData);
            setInputHistory((prev) => [eventData, ...prev.slice(0, 49)]);
          }

          // Update display values
          if (isActive) {
            newAxisValues[index] = value.toFixed(2);
          }
        });
        
        setAxisValues(newAxisValues);
        setActiveInputs(currentActiveInputs);

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
                    const btnInfo = X52_BUTTONS[btnIndex];
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
                          title: btnInfo?.name || `Button ${btnIndex + 1}`,
                        }}
                        title={btnInfo?.name || `Button ${btnIndex + 1}`}
                      >
                        B{btnIndex + 1}
                      </div>
                    );
                  })}

                  {/* Axis Indicators (0-8, skipping 9 which is treated as HAT) */}
                  {Array.from({ length: 9 }, (_, i) => i).map((axisIndex) => {
                    const isActive = activeInputs.has(`axis-${axisIndex}`);
                    const axisInfo = X52_BUTTONS[`${axisIndex}-axis`];
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
                                  {X52_BUTTONS[`${index}-axis`]?.name || `Axis ${index}`}
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
                          const btnInfo = X52_BUTTONS[btnIndex];
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
                                {btnIndex + 1}: {btnInfo?.name || `Button ${btnIndex + 1}`}
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
                          const axisInfo = X52_BUTTONS[`${axisIndex}-axis`];
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
                          const hatInfo = X52_BUTTONS[hatDir];
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
