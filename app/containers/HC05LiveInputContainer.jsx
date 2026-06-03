import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Title, Text, Tooltip } from '@mantine/core';
import Moveable from 'react-moveable';
import HOTASInputView from '../components/HOTASInputView.jsx';
import { X52_BUTTONS, X52_AXES } from '../libraries/hotas';

// Path to the HOTAS image (place in public/assets or adjust as needed)
import { getImagePath } from '../utils/pathUtils';
const HOTAS_IMAGE = getImagePath('/assets/hotas/x52-hotas-transparent-background-omnicore-starcitizen.png');

const OVERLAY_AXIS_MAP = {
  throttle: 2,
  'rotary-1': 4,
  'rotary-2': 3,
  slider: 6,
};

const OVERLAY_POV_MAP = {
  'pov-hat-2-n': 'n',
  'pov-hat-2-e': 'e',
  'pov-hat-2-s': 's',
  'pov-hat-2-w': 'w',
};

const OVERLAY_BUTTON_ALIASES = {
  'hair-trigger': ['Hair Trigger'],
  'trigger-full': ['Trigger Full Press'],
  safe: ['Safe Button'],
  'button-a': ['Button A'],
  'button-b': ['Button B'],
  'button-c': ['Button C'],
  'pinkie-switch': ['Pinkie Switch'],
  'button-d': ['D'],
  'fire-d': ['D', 'Fire D'], // Fire D is same as D button
  'button-e': ['Button E'],
  'mouse-button': ['Mouse Button'],
  'mfd-function': ['Function', 'Button 27'],
  'mfd-timer-toggle': ['Start/Stop Timer', 'Button 28'],
  'mfd-timer-reset': ['Reset Timer', 'Button 29'],
  clutch: ['Information (i) / Clutch', 'Clutch', 'Button 30'],
  // HAT 1 (stick) — discrete buttons
  'pov-hat-1-n': ['HAT 1 North'],
  'pov-hat-1-e': ['HAT 1 East'],
  'pov-hat-1-s': ['HAT 1 South'],
  'pov-hat-1-w': ['HAT 1 West'],
  // HAT 3 (throttle) — discrete buttons
  'pov-hat-3-n': ['HAT 3 North'],
  'pov-hat-3-e': ['HAT 3 East'],
  'pov-hat-3-s': ['HAT 3 South'],
  'pov-hat-3-w': ['HAT 3 West'],
};

const MODE_INDEX_TO_KEY = {
  0: 'green',
  1: 'orange',
  2: 'red',
};

function normalizeName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findButtonIndexByNameCandidates(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const wanted = new Set(candidates.map(normalizeName));

  for (const [indexText, meta] of Object.entries(X52_BUTTONS)) {
    if (wanted.has(normalizeName(meta?.name))) {
      return Number(indexText);
    }
  }

  return null;
}

function resolveOverlayButtonIndex(overlay) {
  const toggleMatch = String(overlay?.id || '').match(/^toggle-t([1-6])$/i);
  if (toggleMatch) {
    return findButtonIndexByNameCandidates([`Toggle T${toggleMatch[1]}`]);
  }

  const aliases = OVERLAY_BUTTON_ALIASES[overlay?.id] || [overlay?.label || ''];
  return findButtonIndexByNameCandidates(aliases);
}

function buildOverlayInputMeta(overlay) {
  if (Object.prototype.hasOwnProperty.call(OVERLAY_AXIS_MAP, overlay.id)) {
    const axisIndex = OVERLAY_AXIS_MAP[overlay.id];
    return {
      type: 'Axis',
      index: axisIndex,
      windowsIndex: null,
      xmlToken: `js1_axis${axisIndex}`,
    };
  }

  if (Object.prototype.hasOwnProperty.call(OVERLAY_POV_MAP, overlay.id)) {
    const povDir = OVERLAY_POV_MAP[overlay.id];
    return {
      type: 'POV',
      index: povDir,
      windowsIndex: null,
      xmlToken: `js1_pov_${povDir}`,
    };
  }

  const buttonIndex = resolveOverlayButtonIndex(overlay);
  if (buttonIndex !== null) {
    const buttonMeta = X52_BUTTONS[buttonIndex] || {};
    const windowsIndex = buttonMeta.windowsIndex ?? buttonIndex + 1;
    return {
      type: 'Button',
      index: buttonIndex,
      windowsIndex,
      xmlToken: `js1_button${windowsIndex}`,
    };
  }

  return null;
}

function extractPovDirection(hotasVal) {
  const value = String(hotasVal || '').toLowerCase();
  if (!value) return null;

  const xmlMatch = value.match(/\bjs\d+_pov_([nsew])\b/);
  if (xmlMatch?.[1]) return xmlMatch[1];

  const shortPovMatch = value.match(/\bpov[_\s-]?([nsew])\b/);
  if (shortPovMatch?.[1]) return shortPovMatch[1];

  if (/\b(hat|pov)[_\s-]?(up|north)\b/.test(value)) return 'n';
  if (/\b(hat|pov)[_\s-]?(down|south)\b/.test(value)) return 's';
  if (/\b(hat|pov)[_\s-]?(left|west)\b/.test(value)) return 'w';
  if (/\b(hat|pov)[_\s-]?(right|east)\b/.test(value)) return 'e';

  return null;
}

function findAssignedFeature(input, bindings, hotasOverrides, modeKey = null) {
  if (!input || !bindings?.length) return null;
  const token = input.xmlToken.toLowerCase();
  const buttonNum = input.type === 'Button' ? input.windowsIndex : null;

  for (const binding of bindings) {
    const modeValue = modeKey ? String(binding.modeHotasBindings?.[modeKey] || '') : '';
    const greenFallbackValue = modeKey && modeKey !== 'green'
      ? String(binding.modeHotasBindings?.green || '')
      : '';
    const singleValue = String(hotasOverrides[binding.id] || binding.hotasBinding || '');
    const hotasVal = String(modeValue || greenFallbackValue || singleValue || '').toLowerCase();
    if (!hotasVal) continue;
    if (hotasVal === token) return binding;
    if (input.type === 'Button' && buttonNum !== null) {
      if (hotasVal === `button ${buttonNum}`) return binding;
      if (hotasVal.includes(`button ${buttonNum}`) && !hotasVal.includes(`button ${buttonNum}0`)) return binding;
    }
    if (input.type === 'Axis') {
      const axisName = (X52_AXES[input.index]?.name || '').toLowerCase();
      if (axisName && hotasVal.includes(axisName.split('(')[0].trim())) return binding;
    }
    if (input.type === 'POV') {
      const povDirection = extractPovDirection(hotasVal);
      if (povDirection === input.index) return binding;
    }
  }

  return null;
}

function buildOverlayTooltip(overlay, bindings, hotasOverrides, modeKey = null) {
  const inputMeta = buildOverlayInputMeta(overlay);
  const assignedBinding = findAssignedFeature(inputMeta, bindings, hotasOverrides, modeKey);
  const featureLine = assignedBinding?.feature ? `Assigned Feature: ${assignedBinding.feature}` : 'Assigned Feature: Unassigned';

  if (!inputMeta) {
    return `${overlay.label}\nInput: Unknown\n${featureLine}`;
  }

  if (inputMeta.type === 'Button') {
    const buttonMeta = X52_BUTTONS[inputMeta.index] || {};
    const buttonName = buttonMeta.name || overlay.label || `Button ${inputMeta.windowsIndex}`;
    const lines = [
      overlay.label,
      `Physical Label: ${buttonName}`,
      `Windows Input: Button ${inputMeta.windowsIndex}`,
      `XML Token: ${inputMeta.xmlToken}`,
      `Gamepad Index: ${inputMeta.index}`,
    ];

    if (inputMeta.windowsIndex >= 9 && inputMeta.windowsIndex <= 14) {
      lines.push(`Toggle Alias: T${inputMeta.windowsIndex - 8} (physical T-toggle)`);
    } else if (inputMeta.windowsIndex >= 15 && inputMeta.windowsIndex <= 20) {
      lines.push(`Legacy Alias: T${inputMeta.windowsIndex - 8} (TARGET-style naming; not a physical T-toggle)`);
    }

    lines.push(featureLine);
    return lines.join('\n');
  }

  if (inputMeta.type === 'Axis') {
    const axisName = X52_AXES[inputMeta.index]?.name || `Axis ${inputMeta.index}`;
    return [
      overlay.label,
      `Axis: ${axisName}`,
      `XML Token: ${inputMeta.xmlToken}`,
      `Gamepad Index: ${inputMeta.index}`,
      featureLine,
    ].join('\n');
  }

  return [
    overlay.label,
    `POV Direction: ${String(inputMeta.index).toUpperCase()}`,
    `XML Token: ${inputMeta.xmlToken}`,
    featureLine,
  ].join('\n');
}

function readAxisValue(axisValues, axisIndex) {
  if (Array.isArray(axisValues)) return Number(axisValues[axisIndex]);
  if (axisValues && typeof axisValues === 'object') return Number(axisValues[axisIndex]);
  return NaN;
}

function isOverlayInputActive(overlay, activeInputs, axisValues, lastHotasInput) {
  const inputMeta = buildOverlayInputMeta(overlay);
  if (!inputMeta) return false;

  if (inputMeta.type === 'Button') {
    if (activeInputs?.has?.(`button-${inputMeta.index}`)) return true;
    if (Number.isInteger(lastHotasInput?.index) && lastHotasInput.index === inputMeta.index) return true;
    if (Number.isInteger(lastHotasInput?.displayIndex) && lastHotasInput.displayIndex === inputMeta.windowsIndex) return true;
    return false;
  }

  if (inputMeta.type === 'Axis') {
    const axisValue = readAxisValue(axisValues, inputMeta.index);
    if (Number.isFinite(axisValue) && Math.abs(axisValue) >= 0.12) return true;
    if (Number.isInteger(lastHotasInput?.index) && lastHotasInput.index === inputMeta.index) {
      const liveValue = Number(lastHotasInput?.value);
      return Number.isFinite(liveValue) && Math.abs(liveValue) >= 0.12;
    }
    return false;
  }

  if (typeof lastHotasInput?.index === 'string') {
    return lastHotasInput.index.includes(`hat-${inputMeta.index}`);
  }

  return false;
}

export default function HC05LiveInputContainer({ overlays, onOverlayChange, keybindings, allKeybindings = [], hotasOverrides = {}, bindingLayout = 'single', activeInputs, axisValues, lastHotasInput, currentMode, deviceMap, onAssignFeature, onClearFeature, devEditMode = true, setDevEditMode, isDevMode = true, dragged, setDragged, disableAssignmentMenuFiltering = false }) {
  // Overlay refs for Moveable
  const overlayRefs = useRef([]);
  const latestOverlaysRef = useRef(overlays);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const containerWidth = 700;
  const containerHeight = 700;

  useEffect(() => {
    latestOverlaysRef.current = overlays;
  }, [overlays]);
  // Convert percent to px for draggable default position
  const percentToPx = (percent, base) => (parseFloat(percent) / 100) * base;
  const pxToPercent = (px, base) => `${((px / base) * 100).toFixed(2)}%`;
  const overlaySaveEndpoints = useMemo(() => [
    '/api/hotas-overlay-positions',
  ], []);

  const triggerOverlayBackupDownload = useCallback((overlaysSnapshot) => {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const data = JSON.stringify(overlaysSnapshot, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotas-x52-overlay-positions-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const saveOverlaysToFile = useCallback(async (overlaysToSave, timeoutMs = 5000) => {
    const saveErrors = [];

    for (const endpoint of overlaySaveEndpoints) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(overlaysToSave),
          signal: controller.signal,
        });

        if (response.ok) {
          return;
        }

        let detail = '';
        try {
          const payload = await response.json();
          detail = payload?.detail || payload?.error || '';
        } catch {
          // Ignore parse failure and use generic fallback below.
        }

        const message = detail || `Failed to save overlay positions (${response.status})`;
        saveErrors.push(`${endpoint}: ${message}`);

        // Retry on route-not-found to handle conflicting local API on 3001.
        // Also continue retry chain for other transient HTTP failures.
        continue;
      } catch (error) {
        saveErrors.push(`${endpoint}: ${error?.message || 'Unknown request error'}`);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw new Error(saveErrors.join(' | '));
  }, [overlaySaveEndpoints]);


  // Auto-save overlays to backend every minute in dev edit mode
  useEffect(() => {
    if (isDevMode && devEditMode) {
      const save = () => {
        saveOverlaysToFile(latestOverlaysRef.current)
          .then(() => {
            setLastSavedAt(new Date());
            setSaveErrorMessage('');
          })
          .catch(e => console.error('Overlay auto-save error:', e));
      };
      save(); // Save immediately on enable
      const interval = setInterval(save, 60000);
      return () => clearInterval(interval);
    }
  }, [isDevMode, devEditMode, saveOverlaysToFile]);

  const handleToggleEditMode = async () => {
    if (!setDevEditMode) return;

    if (devEditMode) {
      const overlaysSnapshot = overlays;
      setDevEditMode(false);
      setSaveStatus('saving');
      setSaveErrorMessage('');

      try {
        await saveOverlaysToFile(overlaysSnapshot);
        setLastSavedAt(new Date());
        setSaveStatus('saved');
      } catch (error) {
        console.error('Overlay save error:', error);
        triggerOverlayBackupDownload(overlaysSnapshot);
        setSaveErrorMessage(error?.message || 'Unknown save error');
        setSaveStatus('error');
      }

      return;
    }

    setSaveStatus('idle');
    setDevEditMode((value) => !value);
  };

  // Export overlays to JSON (manual download)
  const handleExport = () => {
    const data = JSON.stringify(overlays, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hotas-x52-overlay-positions.jsonc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', width: '100%' }}>
      {/* HOTAS Overlay Demo (from /hotas-overlay) */}
      <div style={{ flex: '0 0 740px', position: 'relative' }}>
        <Box p="lg">
          <Title order={3} mb="md">X52 HOTAS Overlay Demo</Title>
          <Text mb="md">This demo uses your HOTAS photo as a background with clickable overlay regions. All overlays are now resizable circles.</Text>
          <div
            style={{
              position: 'relative',
              width: 700,
              height: 700,
              background: `url(${HOTAS_IMAGE}) center/contain no-repeat`,
              margin: '0 auto',
              borderRadius: 16,
              boxShadow: '0 4px 32px #0004',
              overflow: 'hidden',
            }}
          >
            {overlays.map((overlay, idx) => {
              const leftPx = percentToPx(overlay.style.left, containerWidth);
              const topPx = percentToPx(overlay.style.top, containerHeight);
              const sizePx = percentToPx(overlay.style.size, containerWidth);
              const isActive = isOverlayInputActive(overlay, activeInputs, axisValues, lastHotasInput);
              const activeModeKey = bindingLayout === 'modes' ? MODE_INDEX_TO_KEY[Number(currentMode)] : null;
              const tooltipLabel = buildOverlayTooltip(overlay, keybindings, hotasOverrides, activeModeKey);

              const tooltipContent = (
                <Box>
                  {tooltipLabel.split('\n').map((line) => (
                    <Text key={`${overlay.id}-${line}`} size="xs" c="#e8f7ff" style={{ lineHeight: 1.35 }}>
                      {line}
                    </Text>
                  ))}
                </Box>
              );

              return (
                <React.Fragment key={overlay.id}>
                  <Tooltip
                    label={tooltipContent}
                    multiline
                    withArrow
                    openDelay={100}
                    closeDelay={80}
                    transitionProps={{ duration: 120 }}
                    bg="rgba(8, 22, 33, 0.96)"
                    color="#e8f7ff"
                    styles={{
                      tooltip: {
                        border: '1px solid rgba(0, 217, 255, 0.5)',
                        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.45)',
                        borderRadius: 8,
                        padding: '8px 10px',
                        maxWidth: 280,
                      },
                    }}
                  >
                    <div
                      ref={el => overlayRefs.current[idx] = el}
                      style={{
                        position: 'absolute',
                        left: leftPx,
                        top: topPx,
                        width: sizePx,
                        height: sizePx,
                        background: isActive ? 'rgba(255, 149, 0, 0.30)' : 'rgba(0,200,255,0.18)',
                        border: isActive ? '2px solid #ff9500' : '2px solid #00d9ff',
                        cursor: isDevMode && devEditMode ? 'move' : 'pointer',
                        transition: 'background 0.2s',
                        borderRadius: '50%',
                        zIndex: dragged === overlay.id ? 2 : 1,
                        boxSizing: 'border-box',
                      }}
                    />
                  </Tooltip>
                  {isDevMode && devEditMode && (
                    <Moveable
                      target={overlayRefs.current[idx]}
                      draggable={true}
                      resizable={true}
                      keepRatio={true}
                      throttleResize={1}
                      onDrag={({ left, top }) => {
                        const newLeft = pxToPercent(left, containerWidth);
                        const newTop = pxToPercent(top, containerHeight);
                        onOverlayChange(prev => prev.map((o, i) => i === idx ? {
                          ...o,
                          style: {
                            ...o.style,
                            left: newLeft,
                            top: newTop,
                          },
                        } : o));
                      }}
                      onResize={({ width, height, drag }) => {
                        const newSize = pxToPercent(width, containerWidth);
                        const newLeft = pxToPercent(drag.left, containerWidth);
                        const newTop = pxToPercent(drag.top, containerHeight);
                        onOverlayChange(prev => prev.map((o, i) => i === idx ? {
                          ...o,
                          style: {
                            ...o.style,
                            left: newLeft,
                            top: newTop,
                            size: newSize,
                          },
                        } : o));
                      }}
                      renderDirections={["nw", "ne", "sw", "se"]}
                      edge={false}
                      origin={false}
                      padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Export and Resize/Drag toggle buttons in dev mode */}
          {isDevMode && (
            <Box mt="md" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  padding: '6px 18px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #00d9ff',
                  background: '#00d9ff',
                  color: '#222',
                  cursor: 'pointer',
                  marginBottom: 8,
                }}
                onClick={handleExport}
              >
                Export Overlay Positions to JSON
              </button>
              <button
                type="button"
                style={{
                  padding: '6px 18px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #00d9ff',
                  background: devEditMode ? '#00d9ff' : '#222',
                  color: devEditMode ? '#222' : '#00d9ff',
                  cursor: 'pointer',
                  marginBottom: 8,
                }}
                onClick={handleToggleEditMode}
              >
                {devEditMode ? 'Disable Resize/Drag + Save' : 'Enable Resize/Drag'}
              </button>
              {saveStatus === 'saving' && <Text size="sm" c="dimmed">Saving overlay positions...</Text>}
              {saveStatus === 'saved' && <Text size="sm" c="green">Overlay positions saved.</Text>}
              {saveStatus === 'error' && (
                <Text size="sm" c="red">
                  Save failed. Local backup downloaded. {saveErrorMessage ? `Reason: ${saveErrorMessage}` : 'Check backend/API and try again.'}
                </Text>
              )}
              {lastSavedAt && (
                <Text size="sm" c="cyan">
                  Last saved: {lastSavedAt.toLocaleTimeString()}
                </Text>
              )}
            </Box>
          )}
        </Box>
      </div>
      {/* Live Input Table/Mapping */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Title order={4} mb={4}>X52 Input Assignment Table</Title>
        <Text size="sm" c="dimmed" mb="sm">
          Physical X52 inputs mapped to assigned Star Citizen features for the selected mode view.
        </Text>
        <HOTASInputView
          bindings={keybindings}
          allBindings={allKeybindings}
          hotasOverrides={hotasOverrides}
          activeInputs={activeInputs}
          axisValues={axisValues}
          lastHotasInput={lastHotasInput}
          currentMode={currentMode}
          disableAssignmentMenuFiltering={disableAssignmentMenuFiltering}
          onAssign={onAssignFeature}
          onClear={onClearFeature}
        />
      </div>
    </div>
  );
}
