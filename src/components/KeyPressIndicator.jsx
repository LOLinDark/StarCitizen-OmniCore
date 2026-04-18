import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Group, Badge, Text, Box, ActionIcon, Tooltip, Code } from '@mantine/core';
import { IconPin, IconPinnedOff, IconExternalLink } from '@tabler/icons-react';
import useAppStore from '../stores/useAppStore';
import {
  X52_BUTTONS,
  X52_AXES,
} from '../libraries/hotas/index.js';

// Same compat map used by the test page so tooltips show correct names
const AXIS_COMPAT = Object.fromEntries(
  Object.entries(X52_AXES).map(([i, meta]) => [`${i}-axis`, meta])
);
const X52_LOOKUP = { ...X52_BUTTONS, ...AXIS_COMPAT };
const getDisplayButtonNumber = (idx) => X52_LOOKUP[idx]?.windowsIndex ?? (idx + 1);

const HAT_DIRS = ['9-hat-n','9-hat-ne','9-hat-e','9-hat-se','9-hat-s','9-hat-sw','9-hat-w','9-hat-nw'];
const HAT_ARROWS = { n:'↑', ne:'↗', e:'→', se:'↘', s:'↓', sw:'↙', w:'←', nw:'↖' };
const MODE_STORAGE_KEY = 'omnicore.liveInput.mode';

/**
 * KeyPressIndicator Component
 * Displays live HOTAS input in a dockable panel.
 * - Docked (default): renders inline in the page at whatever position the parent places it.
 * - Detached: a dashed placeholder stays in the layout slot;
 *   the card becomes a fixed overlay (top-right) that persists while scrolling.
 *   Click the placeholder or the pin button to re-dock.
 */
export function KeyPressIndicator({
  onKeysChange = null,
  title = 'Live Input',
  inputLabel = null,
  assignmentLabel = '',
  connected = null,
  // Dev-mode extras (passed from HC05)
  rawInput = null,
  activeInputs = null,
  axisValues = null,
  gamepadInfo = null,
}) {
  const devMode = useAppStore((s) => s.devMode);
  const [isDocked, setIsDocked] = useState(true);
  const [isWindowed, setIsWindowed] = useState(false);
  const [modeReady, setModeReady] = useState(false);
  const [windowContainer, setWindowContainer] = useState(null);
  const popupRef = useRef(null);
  const popupContainerRef = useRef(null);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [keyLabels, setKeyLabels] = useState({});

  const closePopupWindow = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
    popupContainerRef.current = null;
    setWindowContainer(null);
  }, []);

  const openPopupWindow = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed && popupContainerRef.current) {
      popupRef.current.focus();
      setWindowContainer(popupContainerRef.current);
      return true;
    }

    const popup = window.open(
      '',
      'omnicore-live-input',
      'popup=yes,width=600,height=820,resizable=yes,scrollbars=yes'
    );

    if (!popup) return false;

    popup.document.title = title;
    popup.document.body.innerHTML = '';
    Object.assign(popup.document.body.style, {
      margin: '0',
      padding: '12px',
      background: '#05090f',
      fontFamily: 'Inter, Segoe UI, sans-serif',
    });

    const mount = popup.document.createElement('div');
    mount.id = 'live-input-window-root';
    popup.document.body.appendChild(mount);

    popup.addEventListener('beforeunload', () => {
      popupRef.current = null;
      popupContainerRef.current = null;
      setWindowContainer(null);
      setIsWindowed(false);
      setIsDocked(true);
    }, { once: true });

    popupRef.current = popup;
    popupContainerRef.current = mount;
    setWindowContainer(mount);
    popup.focus();
    return true;
  }, [title]);

  const toggleWindowMode = useCallback(() => {
    if (isWindowed) {
      setIsWindowed(false);
      setIsDocked(true);
      closePopupWindow();
      return;
    }

    const opened = openPopupWindow();
    if (opened) {
      setIsWindowed(true);
      setIsDocked(false);
    }
  }, [isWindowed, closePopupWindow, openPopupWindow]);

  useEffect(() => {
    const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY);

    if (savedMode === 'floating') {
      setIsDocked(false);
      setIsWindowed(false);
      setModeReady(true);
      return;
    }

    if (savedMode === 'window') {
      const opened = openPopupWindow();
      if (opened) {
        setIsWindowed(true);
        setIsDocked(false);
      } else {
        // If popup is blocked on restore, keep panel visible as floating.
        setIsWindowed(false);
        setIsDocked(false);
      }
      setModeReady(true);
      return;
    }

    setIsDocked(true);
    setIsWindowed(false);
    setModeReady(true);
  }, [openPopupWindow]);

  useEffect(() => {
    if (!modeReady) return;

    const mode = isWindowed ? 'window' : (isDocked ? 'docked' : 'floating');
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [isDocked, isWindowed, modeReady]);

  useEffect(() => {
    return () => {
      closePopupWindow();
    };
  }, [closePopupWindow]);

  const getKeyLabel = useCallback((code, key) => {
    // Map key codes to readable names
    const keyCodeMap = {
      // Joystick buttons (simulated from event, will need custom handling)
      'js1_button1': '🎮 1',
      'js1_button2': '🎮 2',
      'js1_button3': '🎮 3',
      'js1_button4': '🎮 4',
      'js1_button5': '🎮 5',
      'js1_button6': '🎮 6',
      'js1_button7': '🎮 7',
      'js1_button8': '🎮 8',
      'js1_button9': '🎮 9',
      'js1_button10': '🎮 10',
      'js1_button11': '🎮 11',
      'js1_button12': '🎮 12',
      'js1_button13': '🎮 13',
      'js1_button14': '🎮 14',
      'js1_button15': '🎮 15',
      'js1_button16': '🎮 16',
      
      // Keyboard special keys
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'Shift': 'SHIFT',
      'Control': 'CTRL',
      'Alt': 'ALT',
      'Enter': 'ENTER',
      'Space': 'SPACE',
      'Tab': 'TAB',
      
      // Fallback: use key itself or code
    };

    if (keyCodeMap[code]) return keyCodeMap[code];
    if (keyCodeMap[key]) return keyCodeMap[key];
    
    // For letter/number keys, just use the key
    if (key && key.length === 1) {
      return key.toUpperCase();
    }
    
    return key || code;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const label = getKeyLabel(e.code, e.key);
      const identifier = e.code || e.key;
      
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(identifier);
        
        setKeyLabels(old => ({
          ...old,
          [identifier]: label,
        }));
        
        if (onKeysChange) {
          onKeysChange(Array.from(newSet));
        }
        
        return newSet;
      });
    };

    const handleKeyUp = (e) => {
      const identifier = e.code || e.key;
      
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(identifier);
        
        if (onKeysChange) {
          onKeysChange(Array.from(newSet));
        }
        
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [getKeyLabel, onKeysChange]);

  if (!modeReady) return null;

  const sortedKeys = Array.from(pressedKeys).sort();

  // ─── shared card content ──────────────────────────────────────────────────
  const cardContent = ({ pinned, onToggleDock, inWindow = false }) => (
    <Box
      style={{
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        border: '2px solid #00d9ff',
        borderRadius: '12px',
        padding: inWindow ? '0.6rem' : '0.75rem',
        minWidth: '420px',
        maxWidth: inWindow ? '100%' : '70vw',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
      }}
    >
      {/* Header row */}
      <Box style={{ paddingRight: inWindow ? '11.5rem' : '12.5rem', marginBottom: 4 }}>
        <Text
          size="xs"
          fw={700}
          style={{ color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {title}
        </Text>
      </Box>

      <Group
        gap="xs"
        align="center"
        style={{ position: 'absolute', top: inWindow ? 8 : 10, right: inWindow ? 8 : 10 }}
      >
          {devMode && (
            <Badge color="orange" variant="light" size="xs">
              DEV MODE ACTIVE
            </Badge>
          )}
          {connected !== null && (
            <Badge color={connected ? 'green' : 'gray'} variant="filled" size="xs">
              {connected ? 'Connected' : 'Disconnected'}
            </Badge>
          )}
          {!inWindow && (
            <Tooltip label={pinned ? 'Detach panel' : 'Re-dock panel'} position="left" withArrow>
              <ActionIcon
                size="xs"
                variant="subtle"
                color="cyan"
                onClick={onToggleDock}
                aria-label={pinned ? 'Detach panel' : 'Dock panel'}
              >
                {pinned ? <IconPinnedOff size={14} /> : <IconPin size={14} />}
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip
            label={inWindow ? 'Return to page panel' : 'Pop out to window'}
            position="left"
            withArrow
          >
            <ActionIcon
              size="xs"
              variant="subtle"
              color={inWindow ? 'green' : 'cyan'}
              onClick={toggleWindowMode}
              aria-label={inWindow ? 'Return to page panel' : 'Pop out to window'}
            >
              <IconExternalLink size={14} />
            </ActionIcon>
          </Tooltip>
      </Group>

      {/* Current input */}
      {inputLabel ? (
        <Text
          size={inWindow ? 'xs' : 'sm'}
          fw={700}
          style={{ color: '#e3f2fd', marginBottom: '0.2rem', lineHeight: 1.2 }}
        >
          {inputLabel}
        </Text>
      ) : (
        <Text size="xs" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem', lineHeight: 1.2 }}>
          No input detected
        </Text>
      )}

      {/* Assignment label */}
      {!!assignmentLabel && (
        <Text
          size="xs"
          fw={600}
          style={{
            color: assignmentLabel.toLowerCase().includes('unassigned') ? '#ffb74d' : '#81c784',
            marginBottom: sortedKeys.length > 0 ? '0.35rem' : 0,
            lineHeight: 1.2,
          }}
        >
          {assignmentLabel}
        </Text>
      )}

      {/* Keyboard keys (if any) */}
      {sortedKeys.length > 0 && (
        <Group gap="xs" wrap="wrap">
          {sortedKeys.map(key => (
            <Badge
              key={key}
              color="cyan"
              variant="filled"
              size="md"
              style={{ fontWeight: 700, fontSize: '0.85rem', padding: '0.35rem 0.65rem' }}
            >
              {keyLabels[key] || key}
            </Badge>
          ))}
        </Group>
      )}

      {/* ── Dev Mode extras ───────────────────────────────────────────────── */}
      {devMode && (
        <>
          <Box style={{ borderTop: '1px solid rgba(0, 217, 255, 0.2)', margin: '0.4rem 0', paddingTop: '0.4rem' }} />

          {/* Device ID */}
          {gamepadInfo && (
            <Text size="xs" style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem', wordBreak: 'break-all' }}>
              {gamepadInfo.id}
            </Text>
          )}

          {/* Active inputs grid — same layout as test page */}
          {activeInputs && (
            <Box mb="xs">
              <Text size="xs" fw={600} style={{ color: '#00d9ff', marginBottom: '0.4rem' }}>
                Active Inputs
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {/* Buttons 0-29 */}
                {Array.from({ length: 30 }, (_, i) => i).map((idx) => {
                  const on = activeInputs.has(`button-${idx}`);
                  return (
                    <div
                      key={`b${idx}`}
                      title={X52_LOOKUP[idx]?.name || `Button ${getDisplayButtonNumber(idx)}`}
                      style={{
                        width: 28, height: 28, borderRadius: 3,
                        background: on ? '#00d9ff' : 'rgba(0,217,255,0.08)',
                        border: on ? '1px solid #00d9ff' : '1px solid rgba(0,217,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, fontWeight: 700,
                        color: on ? '#000' : 'rgba(0,217,255,0.5)',
                        transition: 'all 0.1s',
                      }}
                    >
                      B{getDisplayButtonNumber(idx)}
                    </div>
                  );
                })}
                {/* Axes 0-8 */}
                {Array.from({ length: 9 }, (_, i) => i).map((idx) => {
                  const on = activeInputs.has(`axis-${idx}`);
                  return (
                    <div
                      key={`a${idx}`}
                      title={X52_LOOKUP[`${idx}-axis`]?.name || `Axis ${idx}`}
                      style={{
                        width: 28, height: 28, borderRadius: 3,
                        background: on ? '#ff9800' : 'rgba(255,152,0,0.08)',
                        border: on ? '1px solid #ff9800' : '1px solid rgba(255,152,0,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, fontWeight: 700,
                        color: on ? '#000' : 'rgba(255,152,0,0.5)',
                        transition: 'all 0.1s',
                      }}
                    >
                      A{idx}
                    </div>
                  );
                })}
                {/* POV HAT */}
                {HAT_DIRS.map((dir) => {
                  const on = activeInputs.has(`button-${dir}`);
                  const arrow = HAT_ARROWS[dir.split('-').pop()];
                  return (
                    <div
                      key={dir}
                      title={`POV HAT ${dir.split('-').pop().toUpperCase()}`}
                      style={{
                        width: 28, height: 28, borderRadius: 3,
                        background: on ? '#00d9ff' : 'rgba(0,217,255,0.08)',
                        border: on ? '1px solid #00d9ff' : '1px solid rgba(0,217,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        color: on ? '#000' : 'rgba(0,217,255,0.5)',
                        transition: 'all 0.1s',
                      }}
                    >
                      {arrow}
                    </div>
                  );
                })}
              </div>
            </Box>
          )}

          {/* Axis value bars */}
          {axisValues && Object.keys(axisValues).length > 0 && (
            <Box mb="xs">
              <Text size="xs" fw={600} style={{ color: '#00d9ff', marginBottom: '0.4rem' }}>
                Axis Values
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                {Object.entries(axisValues).map(([idx, val]) => {
                  const name = X52_LOOKUP[`${idx}-axis`]?.name || `Axis ${idx}`;
                  const pct = ((parseFloat(val) + 1) / 2) * 100;
                  return (
                    <div key={idx}>
                      <Text size="xs" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.2 }}>
                        {name}
                      </Text>
                      <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#ff9800', borderRadius: 3, transition: 'width 0.05s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Box>
          )}

          {/* Raw lastInput JSON */}
          {rawInput && (
            <Box>
              <Text size="xs" fw={600} style={{ color: '#00d9ff', marginBottom: '0.4rem' }}>
                Raw Event
              </Text>
              <Code
                block
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  color: '#00ff88',
                  fontSize: '0.68rem',
                  padding: '0.5rem',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(rawInput, null, 2)}
              </Code>
            </Box>
          )}
        </>
      )}
    </Box>
  );

  // ─── docked: renders inline in page flow ─────────────────────────────────
  if (isWindowed && windowContainer) {
    return (
      <>
        <Tooltip label="Click to return Live Input panel to this page" position="top" withArrow>
          <Box
            onClick={toggleWindowMode}
            style={{
              border: '2px dashed rgba(0, 217, 255, 0.35)',
              borderRadius: '12px',
              padding: '1rem',
              minHeight: '82px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
          >
            <Group gap="xs" align="center">
              <IconExternalLink size={16} style={{ color: '#00d9ff' }} />
              <Text size="sm" style={{ color: '#00d9ff' }}>
                Live Input panel is in a separate window - click to return here
              </Text>
            </Group>
          </Box>
        </Tooltip>
        {createPortal(cardContent({ pinned: false, onToggleDock: () => {}, inWindow: true }), windowContainer)}
      </>
    );
  }

  if (isDocked) {
    return cardContent({ pinned: true, onToggleDock: () => setIsDocked(false) });
  }

  // ─── detached: placeholder in layout + fixed floating card ───────────────
  return (
    <>
      {/* Placeholder keeps the layout slot while the card is floating */}
      <Tooltip label="Click to re-dock Live Input panel" position="top" withArrow>
        <Box
          onClick={() => setIsDocked(true)}
          style={{
            border: '2px dashed rgba(0, 217, 255, 0.35)',
            borderRadius: '12px',
            padding: '1rem',
            minHeight: '82px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
        >
          <Group gap="xs" align="center">
            <IconPin size={16} style={{ color: '#00d9ff' }} />
            <Text size="sm" style={{ color: '#00d9ff' }}>
              Live Input panel is floating — click to re-dock
            </Text>
          </Group>
        </Box>
      </Tooltip>

      {/* Fixed floating overlay */}
      <Box style={{ position: 'fixed', top: '5rem', right: '1.5rem', zIndex: 1000 }}>
        {cardContent({ pinned: false, onToggleDock: () => setIsDocked(true) })}
      </Box>
    </>
  );
}

export default KeyPressIndicator;
