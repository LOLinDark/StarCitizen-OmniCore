import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Container,
  Stack,
  Group,
  Select,
  Button,
  TextInput,
  Text,
  Textarea,
  SimpleGrid,
  Box,
  Badge,
  Switch,
} from '@mantine/core';
import { IconSearch, IconFolderOpen } from '@tabler/icons-react';
import { HOTASTable } from '../components/HOTASTable';
import { KeyPressIndicator } from '../components/KeyPressIndicator';
import { useHOTASFiltering } from '../hooks/useHOTASFiltering';
import { shipKeybindings, shipControlsCategories } from '../data/starcitizen-keybindings';
import { logitechX52ProOptimal } from '../utils/defaultProfiles';
import { StarCitizenProfileParser } from '../utils/starCitizenProfileParser';
import { featureToStarCitizenAction, parseInputString, formatInputForDisplay } from '../utils/starCitizenActionMap';
import {
  useHotasInput,
  LogitechX52Device,
  X52_BUTTONS,
  fetchModeState,
  fetchModeBindings,
  saveModeState,
  saveModeBindings,
  importModeBindings,
  testFireModeBinding,
  sendModeButtonEvent,
} from '../libraries/peripherals/hotas';
import DevTag from '../components/DevTag';

const MODE_KEYS = ['green', 'orange', 'red'];

const MODE_LABELS = {
  green: 'Green (safe/landing)',
  orange: 'Orange (combat)',
  red: 'Red (emergency)',
};

const createEmptyModeMap = () => ({
  green: {},
  orange: {},
  red: {},
});

const HC06_STORAGE_KEY = 'omnicore.hc06.modes.state';

export default function HOTASConfigModesLabPage() {
  const CAPTURE_WINDOW_MS = 3000;

  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('feature');
  const [sortOrder, setSortOrder] = useState('asc');
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [profilesError, setProfilesError] = useState(null);
  const [showUnboundOnly, setShowUnboundOnly] = useState(false);
  const [searchByLiveInput, setSearchByLiveInput] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [mergedBindings, setMergedBindings] = useState(null);
  const [hotasOverrides, setHotasOverrides] = useState({});
  const [keyboardOverrides, setKeyboardOverrides] = useState({});
  const [enableModesLab, setEnableModesLab] = useState(false);
  const [activeMode, setActiveMode] = useState('green');
  const [modeHotasOverrides, setModeHotasOverrides] = useState(createEmptyModeMap);
  const [modeKeyboardOverrides, setModeKeyboardOverrides] = useState(createEmptyModeMap);
  const [modeSyncState, setModeSyncState] = useState('idle');
  const [modeSyncMessage, setModeSyncMessage] = useState('Not synced yet');
  const [modeButtonId, setModeButtonId] = useState('button4');
  const [modeOutputTokens, setModeOutputTokens] = useState({ green: 'z', orange: 'x', red: 'c' });
  const [modeBindingsMap, setModeBindingsMap] = useState({});
  const [batchBindings, setBatchBindings] = useState({});
  const [modeBindingsJson, setModeBindingsJson] = useState('');
  const [importExportStatus, setImportExportStatus] = useState('idle');
  const [importExportMessage, setImportExportMessage] = useState('');
  const [liveBridgeEnabled, setLiveBridgeEnabled] = useState(false);
  const [liveBridgeDryRun, setLiveBridgeDryRun] = useState(true);
  const [liveBridgeStatus, setLiveBridgeStatus] = useState('idle');
  const [liveBridgeMessage, setLiveBridgeMessage] = useState('Live bridge idle');
  const [modeBindingSaveState, setModeBindingSaveState] = useState('idle');
  const [testFireState, setTestFireState] = useState('idle');
  const [testFireMessage, setTestFireMessage] = useState('No test fired yet');
  const [captureBindingId, setCaptureBindingId] = useState(null);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureKeyboardBindingId, setCaptureKeyboardBindingId] = useState(null);
  const [captureKeyboardProgress, setCaptureKeyboardProgress] = useState(0);
  const [xmlSaveStatus, setXmlSaveStatus] = useState('idle');
  const [xmlSaveMessage, setXmlSaveMessage] = useState('');
  const [captureWarning, setCaptureWarning] = useState('');
  const captureStartedAtRef = useRef(0);
  const keyboardCaptureStartedAtRef = useRef(0);
  const captureInitialSignatureRef = useRef('');
  const isInitializedRef = useRef(false);
  const savedHotasOverridesRef = useRef(null);
  const savedKeyboardOverridesRef = useRef(null);
  const savedModeHotasOverridesRef = useRef(null);
  const savedModeKeyboardOverridesRef = useRef(null);
  const liveBridgeSentRef = useRef({ signature: '', at: 0 });
  const { lastInput: lastHotasInput, gamepadConnected, activeInputs, axisValues, gamepadInfo } = useHotasInput({
    enabled: true,
    trackKeyboard: false,
    device: LogitechX52Device,
  });

  const normalizeText = (value) => String(value || '').toLowerCase();

  const x52ButtonOptions = useMemo(() => {
    return Object.entries(X52_BUTTONS)
      .map(([idx, meta]) => ({
        index: Number(idx),
        value: `button${Number(idx) + 1}`,
        label: `Button ${Number(idx) + 1} - ${meta.name}`,
      }))
      .filter((row) => Number.isFinite(row.index))
      .sort((a, b) => a.index - b.index);
  }, []);

  const getInputKind = useCallback((input) => {
    if (!input) return '';
    if (input.type === 'Button' || input.type === 'Axis') return input.type;

    if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
      return 'Button';
    }

    const metaType = normalizeText(input.meta?.type);
    if (metaType === 'button' || metaType === 'hat') return 'Button';
    if (metaType === 'axis' || metaType === 'slider') return 'Axis';

    if (typeof input.value === 'number') return 'Axis';
    if (Number.isInteger(input.displayIndex) || Number.isInteger(input.index)) return 'Button';

    return '';
  }, []);

  const getInputAction = useCallback((input) => {
    if (!input) return '';
    if (input.action) return input.action;

    const kind = getInputKind(input);
    if (kind === 'Axis') {
      const numeric = Number(input.value);
      return Number.isFinite(numeric) && Math.abs(numeric) >= 0.12 ? 'Engaged' : 'Released';
    }

    return '';
  }, [getInputKind]);

  const getInputSignature = useCallback((input) => {
    if (!input) return '';
    return [
      getInputKind(input),
      getInputAction(input),
      input.index,
      input.displayIndex,
      input.name,
      input.value,
    ]
      .map((v) => String(v ?? ''))
      .join('|');
  }, [getInputAction, getInputKind]);

  const formatHotasBindingFromInput = useCallback((input) => {
    if (!input) return '';

    const kind = getInputKind(input);

    if (kind === 'Button') {
      if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
        const dir = input.index.replace('9-hat-', '').toUpperCase();
        return `POV HAT ${dir}`;
      }
      const displayNumber = Number.isInteger(input.displayIndex)
        ? input.displayIndex
        : (Number.isInteger(input.index) ? input.index + 1 : '?');
      return `Button ${displayNumber}`;
    }

    if (kind === 'Axis') {
      const axisIndex = Number.isInteger(input.index) ? input.index : '?';
      const axisName = input.name || `Axis ${axisIndex}`;
      return `Axis ${axisIndex} (${axisName})`;
    }

    return input.name || '';
  }, [getInputKind]);

  const getButtonIdFromInput = useCallback((input) => {
    if (!input || getInputKind(input) !== 'Button') return '';

    if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
      return '';
    }

    const displayNumber = Number.isInteger(input.displayIndex)
      ? input.displayIndex
      : (Number.isInteger(input.index) ? input.index + 1 : null);

    return Number.isInteger(displayNumber) ? `button${displayNumber}` : '';
  }, [getInputKind]);

  const formatHotasInputForXml = useCallback((input) => {
    if (!input) return '';

    const kind = getInputKind(input);
    if (kind === 'Button') {
      if (typeof input.index === 'string' && input.index.startsWith('9-hat-')) {
        const dir = input.index.replace('9-hat-', '').toLowerCase();
        return `js1_pov_${dir}`;
      }

      const buttonNumber = Number.isInteger(input.displayIndex)
        ? input.displayIndex
        : (Number.isInteger(input.index) ? input.index + 1 : null);

      return Number.isInteger(buttonNumber) ? `js1_button${buttonNumber}` : '';
    }

    if (kind === 'Axis') {
      const axisTokenByIndex = {
        0: 'js1_x',
        1: 'js1_y',
        2: 'js1_z',
        5: 'js1_rz',
      };

      if (Number.isInteger(input.index) && axisTokenByIndex[input.index]) {
        return axisTokenByIndex[input.index];
      }

      const axisName = normalizeText(input.name);
      if (axisName.includes('x axis')) return 'js1_x';
      if (axisName.includes('y axis')) return 'js1_y';
      if (axisName.includes('z axis')) return 'js1_z';
      if (axisName.includes('z rotation')) return 'js1_rz';
      if (axisName.includes('slider')) return 'js1_slider1';
    }

    return '';
  }, [getInputKind]);

  const formatKeyboardInputForXml = useCallback((event) => {
    if (!event) return '';

    const modifierOnlyCodes = new Set([
      'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight',
    ]);
    if (modifierOnlyCodes.has(event.code)) return '';

    const simpleCodeMap = {
      Space: 'space',
      Tab: 'tab',
      Enter: 'enter',
      Backspace: 'backspace',
      Escape: 'escape',
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      Comma: 'comma',
      Period: 'period',
      Slash: 'slash',
      Semicolon: 'semicolon',
      Quote: 'apostrophe',
      BracketLeft: 'lbracket',
      BracketRight: 'rbracket',
      Backslash: 'backslash',
      Minus: 'minus',
      Equal: 'equals',
      Backquote: 'tilde',
      Home: 'home',
      End: 'end',
      Insert: 'insert',
      Delete: 'delete',
      PageUp: 'pgup',
      PageDown: 'pgdn',
      CapsLock: 'capslock',
      NumpadAdd: 'np_plus',
      NumpadSubtract: 'np_minus',
      NumpadMultiply: 'np_mul',
      NumpadDivide: 'np_div',
      NumpadDecimal: 'np_decimal',
      NumpadEnter: 'np_enter',
    };

    let baseToken = '';
    if (event.code?.startsWith('Key')) {
      baseToken = event.code.slice(3).toLowerCase();
    } else if (event.code?.startsWith('Digit')) {
      baseToken = event.code.slice(5);
    } else if (event.code?.startsWith('Numpad') && /^Numpad\d$/.test(event.code)) {
      baseToken = `np_${event.code.slice(6)}`;
    } else if (/^F\d{1,2}$/.test(event.code || '')) {
      baseToken = event.code.toLowerCase();
    } else {
      baseToken = simpleCodeMap[event.code] || '';
    }

    if (!baseToken) return '';

    const modifiers = [];
    if (event.ctrlKey) modifiers.push('lctrl');
    if (event.altKey) modifiers.push('lalt');
    if (event.shiftKey) modifiers.push('lshift');

    return `kb1_${[...modifiers, baseToken].join('+')}`;
  }, []);

  const formatMouseInputForXml = useCallback((button) => {
    const map = {
      0: 'mouse1',
      1: 'mouse3',
      2: 'mouse2',
      3: 'mouse4',
      4: 'mouse5',
    };
    return map[button] || '';
  }, []);

  const isInputCapturable = useCallback((input) => {
    if (!input) return false;

    const kind = getInputKind(input);

    if (kind === 'Button') {
      // Button events from GamepadPoller omit `action`; use active input state
      // so we only capture currently pressed buttons and ignore releases.
      const inputKey = `button-${input.index}`;
      return activeInputs.has(inputKey);
    }

    if (kind === 'Axis') {
      const numeric = Number(input.value);
      return Number.isFinite(numeric) && Math.abs(numeric) >= 0.12;
    }

    return false;
  }, [activeInputs, getInputKind]);

  const persistCapturedBindingToXml = useCallback(async (bindingId, inputToken) => {
    if (enableModesLab) {
      setXmlSaveStatus('idle');
      setXmlSaveMessage('Mode lab capture saved locally only (Phase 3 agent required for live mode switching)');
      return;
    }

    if (!selectedProfile || selectedProfile.startsWith('__ai_')) return;

    const actionNames = featureToStarCitizenAction[bindingId] || [];
    if (actionNames.length === 0) {
      setXmlSaveStatus('error');
      setXmlSaveMessage('No Star Citizen action mapping for this feature');
      return;
    }

    if (!inputToken) {
      setXmlSaveStatus('error');
      setXmlSaveMessage('Captured input cannot be converted to XML token');
      return;
    }

    try {
      setXmlSaveStatus('saving');
      setXmlSaveMessage('Writing profile XML...');

      const response = await fetch(`/api/hotas/profile/${encodeURIComponent(selectedProfile)}/bindings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionNames,
          inputToken,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Failed to save XML (${response.status})`);
      }

      setXmlSaveStatus('saved');
      setXmlSaveMessage(`Saved to XML: ${inputToken}`);
    } catch (error) {
      setXmlSaveStatus('error');
      setXmlSaveMessage(error.message || 'Failed to save profile XML');
    }
  }, [enableModesLab, selectedProfile]);

  const setHotasBindingForActiveMode = useCallback((bindingId, formattedValue) => {
    if (enableModesLab) {
      setModeHotasOverrides((prev) => ({
        ...prev,
        [activeMode]: {
          ...(prev[activeMode] || {}),
          [bindingId]: formattedValue,
        },
      }));
      return;
    }

    setHotasOverrides((prev) => ({
      ...prev,
      [bindingId]: formattedValue,
    }));
  }, [activeMode, enableModesLab]);

  const setKeyboardBindingForActiveMode = useCallback((bindingId, formattedValue) => {
    if (enableModesLab) {
      setModeKeyboardOverrides((prev) => ({
        ...prev,
        [activeMode]: {
          ...(prev[activeMode] || {}),
          [bindingId]: formattedValue,
        },
      }));
      return;
    }

    setKeyboardOverrides((prev) => ({
      ...prev,
      [bindingId]: formattedValue,
    }));
  }, [activeMode, enableModesLab]);

  const startHotasCapture = useCallback((bindingId) => {
    captureStartedAtRef.current = Date.now();
    captureInitialSignatureRef.current = getInputSignature(lastHotasInput);
    setCaptureBindingId(bindingId);
    setCaptureProgress(1);
  }, [getInputSignature, lastHotasInput]);

  const startKeyboardCapture = useCallback((bindingId) => {
    keyboardCaptureStartedAtRef.current = Date.now();
    setCaptureKeyboardBindingId(bindingId);
    setCaptureKeyboardProgress(1);
  }, []);

  const getBindingConflictSummary = useCallback((bindingId, displayToken, bindingType) => {
    const normToken = String(displayToken || '').toLowerCase();
    if (!normToken) return '';

    const baseBindings = (Array.isArray(mergedBindings) && mergedBindings.length > 0)
      ? mergedBindings
      : shipKeybindings;

    const conflictFeatures = baseBindings
      .filter((b) => b.id !== bindingId)
      .map((b) => ({
        ...b,
        hotasBinding: hotasOverrides[b.id] || b.hotasBinding,
        keyboardBinding: keyboardOverrides[b.id] || b.keyboardBinding,
      }))
      .filter((b) => String(bindingType === 'hotas' ? b.hotasBinding : b.keyboardBinding || '').toLowerCase() === normToken)
      .map((b) => b.feature);

    if (conflictFeatures.length === 0) return '';

    const preview = conflictFeatures.slice(0, 3).join(', ');
    const suffix = conflictFeatures.length > 3 ? ` +${conflictFeatures.length - 3} more` : '';
    return `Potential conflict: ${displayToken} is already used by ${preview}${suffix}`;
  }, [mergedBindings, hotasOverrides, keyboardOverrides]);

  useEffect(() => {
    if (!captureBindingId) return;

    let rafId;
    const animate = () => {
      const elapsed = Date.now() - captureStartedAtRef.current;
      const remaining = Math.max(0, 1 - (elapsed / CAPTURE_WINDOW_MS));
      setCaptureProgress(remaining);

      if (remaining <= 0) {
        setCaptureBindingId(null);
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [captureBindingId]);

  useEffect(() => {
    if (!captureKeyboardBindingId) return;

    let rafId;
    const animate = () => {
      const elapsed = Date.now() - keyboardCaptureStartedAtRef.current;
      const remaining = Math.max(0, 1 - (elapsed / CAPTURE_WINDOW_MS));
      setCaptureKeyboardProgress(remaining);

      if (remaining <= 0) {
        setCaptureKeyboardBindingId(null);
        return;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [captureKeyboardBindingId]);

  useEffect(() => {
    if (!captureBindingId || !lastHotasInput) return;

    const elapsed = Date.now() - captureStartedAtRef.current;
    if (elapsed > CAPTURE_WINDOW_MS || elapsed < 120) return;

    const signature = getInputSignature(lastHotasInput);
    if (!signature || signature === captureInitialSignatureRef.current) return;
    if (!isInputCapturable(lastHotasInput)) return;

    const formatted = formatHotasBindingFromInput(lastHotasInput);
    if (!formatted) return;

    const bindingId = captureBindingId;

    setHotasBindingForActiveMode(bindingId, formatted);

    const hotasToken = formatHotasInputForXml(lastHotasInput);
    if (hotasToken) {
      const conflictMessage = getBindingConflictSummary(bindingId, formatted, 'hotas');
      setCaptureWarning(conflictMessage);
      void persistCapturedBindingToXml(bindingId, hotasToken);
    }

    setCaptureBindingId(null);
    setCaptureProgress(0);
  }, [
    captureBindingId,
    lastHotasInput,
    getInputSignature,
    isInputCapturable,
    formatHotasBindingFromInput,
    formatHotasInputForXml,
    getBindingConflictSummary,
    persistCapturedBindingToXml,
    setHotasBindingForActiveMode,
  ]);

  useEffect(() => {
    if (!captureKeyboardBindingId) return undefined;

    const applyCapturedInput = (xmlToken) => {
      if (!xmlToken) return;
      const bindingId = captureKeyboardBindingId;
      const formatted = formatInputForDisplay(parseInputString(xmlToken));
      const bindingType = xmlToken.startsWith('js') ? 'hotas' : 'keyboard';

      setKeyboardBindingForActiveMode(bindingId, formatted);

      const conflictMessage = getBindingConflictSummary(bindingId, formatted, bindingType);
      setCaptureWarning(conflictMessage);

      void persistCapturedBindingToXml(bindingId, xmlToken);

      setCaptureKeyboardBindingId(null);
      setCaptureKeyboardProgress(0);
    };

    const handleKeyDown = (event) => {
      const elapsed = Date.now() - keyboardCaptureStartedAtRef.current;
      if (elapsed > CAPTURE_WINDOW_MS || elapsed < 120 || event.repeat) return;

      const token = formatKeyboardInputForXml(event);
      if (!token) return;

      event.preventDefault();
      event.stopPropagation();
      applyCapturedInput(token);
    };

    const handleMouseDown = (event) => {
      const elapsed = Date.now() - keyboardCaptureStartedAtRef.current;
      if (elapsed > CAPTURE_WINDOW_MS || elapsed < 120) return;

      const token = formatMouseInputForXml(event.button);
      if (!token) return;

      event.preventDefault();
      event.stopPropagation();
      applyCapturedInput(token);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('mousedown', handleMouseDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [
    captureKeyboardBindingId,
    formatKeyboardInputForXml,
    formatMouseInputForXml,
    getBindingConflictSummary,
    persistCapturedBindingToXml,
    setKeyboardBindingForActiveMode,
  ]);

  const isBindingLive = useCallback((binding) => {
    if (!binding?.hotasBinding || !lastHotasInput) return false;

    const hotasText = normalizeText(binding.hotasBinding);
    const inputKind = getInputKind(lastHotasInput);

    if (inputKind === 'Button') {
      // POV HAT directions come through as string indices like "9-hat-ne".
      if (typeof lastHotasInput.index === 'string' && lastHotasInput.index.startsWith('9-hat-')) {
        const direction = lastHotasInput.index.replace('9-hat-', '');
        return hotasText.includes('hat') && hotasText.includes(direction);
      }

      const candidates = [];
      if (Number.isInteger(lastHotasInput.displayIndex)) candidates.push(lastHotasInput.displayIndex);
      if (Number.isInteger(lastHotasInput.index)) {
        candidates.push(lastHotasInput.index);
        candidates.push(lastHotasInput.index + 1);
      }

      return candidates.some((num) => new RegExp(`\\b(button|btn)\\s*${num}\\b`, 'i').test(hotasText));
    }

    if (inputKind === 'Axis') {
      if (Number.isInteger(lastHotasInput.index) && /axis/i.test(hotasText)) {
        if (new RegExp(`\\baxis\\s*${lastHotasInput.index}\\b`, 'i').test(hotasText)) return true;
      }

      const axisNamePrefix = normalizeText(lastHotasInput.name).split('(')[0].trim();
      return axisNamePrefix ? hotasText.includes(axisNamePrefix) : false;
    }

    return false;
  }, [getInputKind, lastHotasInput]);

  const liveInputLabel = useMemo(() => {
    if (!lastHotasInput) return 'No live HOTAS input yet';

    const inputKind = getInputKind(lastHotasInput);

    if (inputKind === 'Button') {
      if (typeof lastHotasInput.index === 'string') return lastHotasInput.name || lastHotasInput.index;
      const displayNumber = Number.isInteger(lastHotasInput.displayIndex)
        ? lastHotasInput.displayIndex
        : (Number.isInteger(lastHotasInput.index) ? lastHotasInput.index + 1 : '?');
      return `Button ${displayNumber}`;
    }

    if (inputKind === 'Axis') {
      const numericValue = Number(lastHotasInput.value);
      return Number.isFinite(numericValue)
        ? `${lastHotasInput.name || 'Axis'} (${numericValue.toFixed(2)})`
        : (lastHotasInput.name || 'Axis movement');
    }

    return lastHotasInput.name || 'Input detected';
  }, [getInputKind, lastHotasInput]);

  // Load profiles from backend
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setProfilesLoading(true);
        console.log('[HC01] Attempting to load profiles from /api/hotas/profiles');
        const response = await fetch('/api/hotas/profiles');
        console.log('[HC01] Response status:', response.status);
        if (!response.ok) {
          const error = await response.text();
          console.error('[HC01] Response error:', error);
          throw new Error(`Failed to load profiles (${response.status})`);
        }
        const data = await response.json();
        console.log('[HC01] Profiles loaded:', data.profiles?.length);
        setProfiles(data.profiles || []);
        setProfilesError(null);
      } catch (error) {
        console.error('[HC01] Error loading profiles:', error);
        setProfilesError(`Could not load profiles: ${error.message}`);
        setProfiles([]);
      } finally {
        setProfilesLoading(false);
      }
    };
    loadProfiles();
  }, []);

  // Restore persisted state from localStorage on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      const savedState = localStorage.getItem(HC06_STORAGE_KEY);
      if (!savedState) return;

      const {
        selectedProfile: savedProfile,
        selectedCategory: savedCategory,
        hotasOverrides: savedHotasOverrides,
        keyboardOverrides: savedKeyboardOverrides,
        enableModesLab: savedEnableModesLab,
        activeMode: savedActiveMode,
        modeHotasOverrides: savedModeHotasOverrides,
        modeKeyboardOverrides: savedModeKeyboardOverrides,
      } = JSON.parse(savedState);
      
      if (savedCategory) {
        setSelectedCategory(savedCategory);
      }

      // Store overrides in ref to be restored after profile loads
      if (savedHotasOverrides && typeof savedHotasOverrides === 'object') {
        savedHotasOverridesRef.current = savedHotasOverrides;
      }

      if (savedKeyboardOverrides && typeof savedKeyboardOverrides === 'object') {
        savedKeyboardOverridesRef.current = savedKeyboardOverrides;
      }

      if (typeof savedEnableModesLab === 'boolean') {
        setEnableModesLab(savedEnableModesLab);
      }

      if (savedActiveMode && MODE_KEYS.includes(savedActiveMode)) {
        setActiveMode(savedActiveMode);
      }

      if (savedModeHotasOverrides && typeof savedModeHotasOverrides === 'object') {
        savedModeHotasOverridesRef.current = {
          ...createEmptyModeMap(),
          ...savedModeHotasOverrides,
        };
      }

      if (savedModeKeyboardOverrides && typeof savedModeKeyboardOverrides === 'object') {
        savedModeKeyboardOverridesRef.current = {
          ...createEmptyModeMap(),
          ...savedModeKeyboardOverrides,
        };
      }

      // Load profile - this will temporarily clear hotasOverrides
      if (savedProfile) {
        console.log('[HC05] Restoring profile from localStorage:', savedProfile);
        handleLoadProfile(savedProfile);
      }
    } catch (error) {
      console.error('[HC05] Error restoring state from localStorage:', error);
    }
  }, []);

  // Restore local overrides after profile has been loaded (mergedBindings changes)
  useEffect(() => {
    if (!isInitializedRef.current || !mergedBindings) return;

    if (savedHotasOverridesRef.current) {
      setHotasOverrides(savedHotasOverridesRef.current);
      savedHotasOverridesRef.current = null;
    }

    if (savedKeyboardOverridesRef.current) {
      setKeyboardOverrides(savedKeyboardOverridesRef.current);
      savedKeyboardOverridesRef.current = null;
    }

    if (savedModeHotasOverridesRef.current) {
      setModeHotasOverrides(savedModeHotasOverridesRef.current);
      savedModeHotasOverridesRef.current = null;
    }

    if (savedModeKeyboardOverridesRef.current) {
      setModeKeyboardOverrides(savedModeKeyboardOverridesRef.current);
      savedModeKeyboardOverridesRef.current = null;
    }
  }, [mergedBindings]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    try {
      const stateToSave = {
        selectedProfile,
        selectedCategory,
        hotasOverrides,
        keyboardOverrides,
        enableModesLab,
        activeMode,
        modeHotasOverrides,
        modeKeyboardOverrides,
      };
      localStorage.setItem(HC06_STORAGE_KEY, JSON.stringify(stateToSave));
      console.log('[HC05] State saved to localStorage');
    } catch (error) {
      console.error('[HC05] Error saving state to localStorage:', error);
    }
  }, [
    selectedProfile,
    selectedCategory,
    hotasOverrides,
    keyboardOverrides,
    enableModesLab,
    activeMode,
    modeHotasOverrides,
    modeKeyboardOverrides,
  ]);

  // Load Phase 3 mode state from backend on mount.
  useEffect(() => {
    let active = true;

    const loadModeState = async () => {
      try {
        const data = await fetchModeState();
        if (!active) return;

        setEnableModesLab(Boolean(data?.modeState?.enabled));
        setActiveMode(String(data?.modeState?.activeMode || 'green'));

        const bindings = data?.bindings && typeof data.bindings === 'object' ? data.bindings : {};
        setModeBindingsMap(bindings);
        setBatchBindings(bindings);
        setModeBindingsJson(JSON.stringify({ bindings }, null, 2));

        setModeSyncState('saved');
        setModeSyncMessage('Mode state loaded from backend');
      } catch (error) {
        if (!active) return;
        setModeSyncState('error');
        setModeSyncMessage(error.message || 'Failed to load mode state');
      }
    };

    void loadModeState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const selected = modeBindingsMap?.[modeButtonId];
    if (!selected) return;
    setModeOutputTokens({
      green: String(selected.green || ''),
      orange: String(selected.orange || ''),
      red: String(selected.red || ''),
    });
  }, [modeBindingsMap, modeButtonId]);

  // Sync enable/active mode to backend to support Phase 3 companion flow.
  useEffect(() => {
    if (!isInitializedRef.current) return;

    let cancelled = false;
    const syncModeState = async () => {
      try {
        setModeSyncState('saving');
        setModeSyncMessage('Syncing mode state...');
        await saveModeState({
          enabled: enableModesLab,
          activeMode,
        });
        if (cancelled) return;
        setModeSyncState('saved');
        setModeSyncMessage('Mode state synced');
      } catch (error) {
        if (cancelled) return;
        setModeSyncState('error');
        setModeSyncMessage(error.message || 'Failed to sync mode state');
      }
    };

    void syncModeState();
    return () => {
      cancelled = true;
    };
  }, [enableModesLab, activeMode]);

  const handleSaveModeBindings = async () => {
    try {
      setModeBindingSaveState('saving');
      const updated = await saveModeBindings({
        buttonId: modeButtonId,
        green: modeOutputTokens.green,
        orange: modeOutputTokens.orange,
        red: modeOutputTokens.red,
      });
      const bindings = updated?.bindings && typeof updated.bindings === 'object' ? updated.bindings : modeBindingsMap;
      setModeBindingsMap(bindings);
      setBatchBindings(bindings);
      setModeBindingsJson(JSON.stringify({ bindings }, null, 2));
      setModeBindingSaveState('saved');
    } catch (error) {
      setModeBindingSaveState('error');
      setTestFireMessage(error.message || 'Failed to save mode bindings');
    }
  };

  const handleExportModeBindings = async () => {
    try {
      setImportExportStatus('saving');
      const data = await fetchModeBindings();
      const bindings = data?.bindings || {};
      const nextJson = JSON.stringify({ bindings }, null, 2);
      setModeBindingsMap(bindings);
      setBatchBindings(bindings);
      setModeBindingsJson(nextJson);
      setImportExportStatus('saved');
      setImportExportMessage('Bindings exported to editor below');
    } catch (error) {
      setImportExportStatus('error');
      setImportExportMessage(error.message || 'Failed to export bindings');
    }
  };

  const handleImportModeBindings = async () => {
    try {
      const parsed = JSON.parse(modeBindingsJson || '{}');
      const bindings = parsed?.bindings && typeof parsed.bindings === 'object' ? parsed.bindings : parsed;

      setImportExportStatus('saving');
      const result = await importModeBindings({ bindings });
      const nextBindings = result?.bindings || {};
      setModeBindingsMap(nextBindings);
      setBatchBindings(nextBindings);
      setModeBindingsJson(JSON.stringify({ bindings: nextBindings }, null, 2));
      setImportExportStatus('saved');
      setImportExportMessage(`Imported ${result?.importedCount || 0} button bindings`);
    } catch (error) {
      setImportExportStatus('error');
      setImportExportMessage(error.message || 'Failed to import bindings');
    }
  };

  const handleSaveBatchBindings = async () => {
    try {
      setImportExportStatus('saving');
      const result = await importModeBindings({ bindings: batchBindings });
      const nextBindings = result?.bindings || {};
      setModeBindingsMap(nextBindings);
      setBatchBindings(nextBindings);
      setModeBindingsJson(JSON.stringify({ bindings: nextBindings }, null, 2));
      setImportExportStatus('saved');
      setImportExportMessage(`Batch saved (${result?.importedCount || 0} buttons)`);
    } catch (error) {
      setImportExportStatus('error');
      setImportExportMessage(error.message || 'Failed to save batch bindings');
    }
  };

  const handleTestFire = async (dryRun) => {
    try {
      setTestFireState('saving');
      const result = await testFireModeBinding({
        buttonId: modeButtonId,
        mode: activeMode,
        dryRun,
      });
      setTestFireState('saved');
      setTestFireMessage(`Fired ${result.outputToken} for ${result.activeMode} on ${result.buttonId}`);
    } catch (error) {
      setTestFireState('error');
      setTestFireMessage(error.message || 'Test fire failed');
    }
  };

  useEffect(() => {
    if (!enableModesLab || !liveBridgeEnabled || !lastHotasInput) return;

    const buttonId = getButtonIdFromInput(lastHotasInput);
    if (!buttonId) return;

    const signature = `${buttonId}:${activeMode}:${getInputSignature(lastHotasInput)}`;
    const now = Date.now();
    if (
      liveBridgeSentRef.current.signature === signature
      && now - liveBridgeSentRef.current.at < 180
    ) {
      return;
    }

    liveBridgeSentRef.current = { signature, at: now };

    let cancelled = false;
    const sendEvent = async () => {
      try {
        setLiveBridgeStatus('saving');
        const response = await sendModeButtonEvent({
          buttonId,
          mode: activeMode,
          dryRun: liveBridgeDryRun,
        });
        if (cancelled) return;
        setLiveBridgeStatus('saved');
        setLiveBridgeMessage(`Bridged ${buttonId} -> ${response.outputToken} (${response.activeMode})`);
      } catch (error) {
        if (cancelled) return;
        setLiveBridgeStatus('error');
        setLiveBridgeMessage(error.message || 'Live bridge event failed');
      }
    };

    void sendEvent();
    return () => {
      cancelled = true;
    };
  }, [
    enableModesLab,
    liveBridgeEnabled,
    liveBridgeDryRun,
    lastHotasInput,
    activeMode,
    getButtonIdFromInput,
    getInputSignature,
  ]);

  // Use shared filtering hook for defaults
  const hookResult = useHOTASFiltering(
    selectedCategory,
    searchQuery,
    sortBy,
    sortOrder
  );

  // Use merged bindings if profile loaded, otherwise use defaults
  const { sortedBindings: unfilteredBindings, currentCategory, categoryList } = useMemo(() => {
    if (mergedBindings) {
      // Filter merged bindings by category and search
      let results = mergedBindings;
      if (selectedCategory) {
        results = results.filter(b => b.category === selectedCategory);
      }
      if (searchQuery) {
        results = results.filter(b => 
          b.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.primaryKey && b.primaryKey.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Sort
      const sorted = [...results].sort((a, b) => {
        const aRaw = a?.[sortBy];
        const bRaw = b?.[sortBy];

        // Normalize null/undefined to empty string and compare as lowercase text.
        // This avoids runtime errors when sorting columns like hotasBinding where
        // many rows are intentionally unbound.
        const aVal = String(aRaw ?? '').toLowerCase();
        const bVal = String(bRaw ?? '').toLowerCase();

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
      
      return {
        sortedBindings: sorted,
        currentCategory: shipControlsCategories[selectedCategory],
        categoryList: Object.entries(shipControlsCategories),
      };
    }
    
    return {
      sortedBindings: hookResult.sortedBindings,
      currentCategory: hookResult.currentCategory,
      categoryList: hookResult.categoryList,
    };
  }, [mergedBindings, selectedCategory, searchQuery, sortBy, sortOrder, hookResult]);

  const effectiveBindings = useMemo(() => {
    if (!unfilteredBindings?.length) return [];

    const activeModeHotas = enableModesLab ? (modeHotasOverrides[activeMode] || {}) : {};
    const activeModeKeyboard = enableModesLab ? (modeKeyboardOverrides[activeMode] || {}) : {};

    return unfilteredBindings.map((binding) => {
      const hotasOverride = activeModeHotas[binding.id] || hotasOverrides[binding.id];
      const keyboardOverride = activeModeKeyboard[binding.id] || keyboardOverrides[binding.id];
      if (!hotasOverride && !keyboardOverride) return binding;

      return {
        ...binding,
        hotasBinding: hotasOverride || binding.hotasBinding,
        keyboardBinding: keyboardOverride || binding.keyboardBinding,
      };
    });
  }, [
    unfilteredBindings,
    enableModesLab,
    activeMode,
    modeHotasOverrides,
    modeKeyboardOverrides,
    hotasOverrides,
    keyboardOverrides,
  ]);

  // Filter by bound/unbound status
  const sortedBindings = useMemo(() => {
    let results = effectiveBindings;

    if (searchByLiveInput) {
      results = lastHotasInput ? results.filter((binding) => isBindingLive(binding)) : [];
    }

    if (showUnboundOnly) {
      results = results.filter(binding => !binding.primaryKey && !binding.secondaryKey);
    }

    return results;
  }, [effectiveBindings, showUnboundOnly, searchByLiveInput, lastHotasInput, isBindingLive]);

  const liveMatchedBindings = useMemo(() => {
    if (!lastHotasInput) return [];
    return effectiveBindings.filter((binding) => isBindingLive(binding));
  }, [lastHotasInput, effectiveBindings, isBindingLive]);

  const inputAssignmentLabel = useMemo(() => {
    if (!lastHotasInput) return 'Unassigned';
    if (liveMatchedBindings.length === 0) return 'Unassigned';
    if (liveMatchedBindings.length === 1) return `Assigned: ${liveMatchedBindings[0].feature}`;
    return `Assigned to ${liveMatchedBindings.length} features`;
  }, [lastHotasInput, liveMatchedBindings]);

  // HOTAS-specific colors
  const colors = {
    headerBg: '#e8f4fd',
    headerBorder: '#1e90ff',
    headerText: '#0052cc',
    headerTextShadow: undefined,
    featureText: '#0052cc',
    featureTextShadow: undefined,
    tableBg: '#f0f8ff',
    tableBoxShadow: '0 0 15px rgba(30, 144, 255, 0.1)',
    primaryKeyHeaderColor: '#1e90ff',
    primaryKeyBorder: undefined,
    primaryKeyHeaderShadow: undefined,
    primaryKeyBadgeBg: '#e3f2fd',
    primaryKeyBadgeColor: 'blue',
    primaryKeyBadgeBorder: undefined,
    alternativeHeaderColor: '#1e90ff',
    alternativeBorder: undefined,
    alternativeHeaderShadow: undefined,
    alternativeBadgeBg: '#f3e5f5',
    alternativeBadgeColor: 'grape',
    alternativeBadgeBorder: undefined,
    categoryText: '#333333',
    categoryTextShadow: undefined,
    statusHeaderColor: '#1e90ff',
    statusBorder: undefined,
    statusHeaderShadow: undefined,
    rowBg: '#ffffff',
    rowBorderColor: '#d4e6f1',
    alternateRowBg: '#f8fbff',
    emptyKeyColor: '#999999',
  };

  const getRowBackground = (binding) => {
    if (binding.changed) return '#fff3cd';
    if (binding.pendingApply) return '#d1ecf1';
    return undefined;
  };

  const handleOpenFolder = async () => {
    try {
      const response = await fetch('/api/hotas/open-folder', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to open folder');
      console.log('[HC01] Profiles folder opened');
    } catch (error) {
      console.error('[HC01] Error opening folder:', error);
      alert('Could not open profiles folder');
    }
  };

  const handleLoadProfile = async (profileName) => {
    if (!profileName) {
      setSelectedProfile('');
      setProfileName('');
      setMergedBindings(null);
      setHotasOverrides({});
      setKeyboardOverrides({});
      setModeHotasOverrides(createEmptyModeMap());
      setModeKeyboardOverrides(createEmptyModeMap());
      setXmlSaveStatus('idle');
      setXmlSaveMessage('');
      setCaptureWarning('');
      return;
    }

    // Helper: Parse AI profile string and extract device type
    const parseAIBindingString = (bindingStr) => {
      if (!bindingStr) return { keyboard: null, hotas: null };
      
      // Check for device hints in the string
      const isKeyboardBinding = bindingStr.toLowerCase().includes('keyboard') || 
                                bindingStr.toLowerCase().includes('mouse');
      const isHotasBinding = bindingStr.toLowerCase().includes('joystick');
      
      // If both types are mentioned or only partial info, classify smartly
      if (bindingStr.includes('(keyboard)') || bindingStr.includes('(keyboard)')) {
        return { keyboard: bindingStr, hotas: null };
      }
      if (bindingStr.includes('(joystick)') || bindingStr.includes('(HOTAS)')) {
        return { keyboard: null, hotas: bindingStr };
      }
      
      // Default heuristic: F-keys, mouse wheel, modifiers = keyboard; axis/buttons = HOTAS
      if (/^[FfMm]\d+|Mouse|keyboard|Spacebar|Shift|Ctrl|Alt|Backspace|Tab|Return|Enter|Comma|Numpad/.test(bindingStr)) {
        return { keyboard: bindingStr, hotas: null };
      }
      if (/Joystick|axis|button|Hat|Throttle/.test(bindingStr)) {
        return { keyboard: null, hotas: bindingStr };
      }
      
      // If contains both, try to split
      if (bindingStr.includes(' | ') || bindingStr.includes(' & ')) {
        const parts = bindingStr.split(/\s*[|&]\s*/);
        return {
          keyboard: parts[0]?.includes('keyboard') ? parts[0] : (parts.length > 0 && /keyboard|Mouse|Ctrl|Shift/.test(parts[0]) ? parts[0] : null),
          hotas: parts[1]?.includes('joystick') ? parts[1] : (parts.length > 1 && /joystick|axis|button/.test(parts[1]) ? parts[1] : null),
        };
      }
      
      // Default: treat as keyboard binding
      return { keyboard: bindingStr, hotas: null };
    };

    // Handle AI-generated profile
    if (profileName === '__ai_x52_optimal') {
      console.log('[HC05] Loading AI-generated X52 Optimal profile');
      setSelectedProfile(profileName);
      setProfileName(logitechX52ProOptimal.profileName);
      setHotasOverrides({});
      setKeyboardOverrides({});
      setModeHotasOverrides(createEmptyModeMap());
      setModeKeyboardOverrides(createEmptyModeMap());
      setXmlSaveStatus('idle');
      setXmlSaveMessage('');
      setCaptureWarning('');
      
      // Merge AI profile bindings with defaults
      const merged = shipKeybindings.map(binding => {
        const aiBinding = logitechX52ProOptimal.bindings[binding.id];
        if (!aiBinding) return binding;
        
        // Parse the AI binding string to separate keyboard and HOTAS
        const { keyboard, hotas } = parseAIBindingString(aiBinding);
        
        return {
          ...binding,
          primaryKey: binding.primaryKey, // Keep original default
          keyboardBinding: keyboard,
          hotasBinding: hotas,
          _aiBinding: aiBinding, // For reference
        };
      });
      setMergedBindings(merged);
      return;
    }

    try {
      console.log(`[HC05] Loading profile: ${profileName}`);
      setSelectedProfile(profileName);
      setXmlSaveStatus('idle');
      setXmlSaveMessage('');
      setCaptureWarning('');
      setModeHotasOverrides(createEmptyModeMap());
      setModeKeyboardOverrides(createEmptyModeMap());
      const response = await fetch(`/api/hotas/profile/${profileName}`);
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      console.log(`[HC05] Profile loaded:`, data.profile);
      console.log('[HC05] Profile content length:', data.xmlContent?.length);
      
      // Extract and set profile name from XML if available
      if (data.profileName) {
        setProfileName(data.profileName);
      } else if (profileName) {
        setProfileName(profileName);
      }
      setHotasOverrides({});
      setKeyboardOverrides({});
      
      // Parse XML and merge keybindings
      if (data.xmlContent) {
        try {
          const parser = new StarCitizenProfileParser(data.xmlContent);
          console.log('[HC05] XML parsed successfully');
          
          // Get all bindings from profile (both keyboard and joystick)
          const allBindings = parser.getAllBindings();
          console.log('[HC05] Found bindings in profile:', allBindings.length);
          
          // Create a map of actionName -> { keyboard, hotas }.
          // We intentionally key by action name (not action map) because feature
          // mappings are action-centric and profile exports can vary by map names.
          const profileBindingsMap = {};
          allBindings.forEach(binding => {
            const actionName = String(binding.actionName || '').toLowerCase();
            if (!actionName) return;

            const formatted = formatInputForDisplay(parseInputString(binding.input));
            const existing = profileBindingsMap[actionName] || {};

            if (binding.device === 'keyboard' || binding.device === 'mouse') {
              existing.keyboard = formatted;
            } else if (binding.device === 'joystick') {
              existing.hotas = formatted;
            }

            profileBindingsMap[actionName] = existing;
          });
          
          console.log('[HC05] Profile bindings map created:', Object.keys(profileBindingsMap).length, 'actions');
          
          // Merge profile bindings into our keybindings
          const merged = shipKeybindings.map(binding => {
            const candidateActions = featureToStarCitizenAction[binding.id] || [];
            if (candidateActions.length === 0) return binding;

            let mergedBinding = { ...binding };
            let matched = false;

            candidateActions.forEach((actionName) => {
              const profileBinding = profileBindingsMap[String(actionName).toLowerCase()];
              if (!profileBinding) return;

              if (profileBinding.keyboard) {
                mergedBinding.keyboardBinding = profileBinding.keyboard;
                matched = true;
              }

              if (profileBinding.hotas) {
                mergedBinding.hotasBinding = profileBinding.hotas;
                matched = true;
              }
            });

            if (matched) {
              console.log(`[HC05] Merged profile binding for ${binding.id}:`, {
                keyboardBinding: mergedBinding.keyboardBinding,
                hotasBinding: mergedBinding.hotasBinding,
              });
              return mergedBinding;
            }

            return binding;
          });
          
          console.log('[HC05] Profile merged into keybindings');
          setMergedBindings(merged);
        } catch (parseError) {
          console.error('[HC05] Error parsing profile XML:', parseError);
          alert(`Could not parse profile: ${parseError.message}`);
          setSelectedProfile('');
          setProfileName('');
          setMergedBindings(null);
        }
      }
    } catch (error) {
      console.error(`[HC05] Error loading profile:`, error);
      alert(`Could not load profile: ${error.message}`);
      setSelectedProfile('');
      setProfileName('');
      setMergedBindings(null);
    }
  };

  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}><DevTag tag="HC06" />Technology Config - Modes Lab</h1>
            {profileName && (
              <Text size="lg" fw={600} style={{ marginBottom: '0.5rem', color: '#1e90ff' }}>
                {profileName}
              </Text>
            )}
            <Text c="dimmed">Experimental branch for Green/Orange/Red mode-aware binding workflows and rapid Phase 3 validation.</Text>
            <Box
              mt="md"
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 107, 0, 0.45)',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.22)',
              }}
            >
              <img
                src="/assets/tools/hotas-config.png"
                alt="Technology Config modes lab themed HOTAS setup"
                style={{
                  display: 'block',
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </div>

        <Box
          p="md"
          style={{
            background: 'rgba(30, 144, 255, 0.08)',
            border: '1px solid rgba(30, 144, 255, 0.25)',
            borderRadius: '8px',
          }}
        >
          <Group justify="space-between" align="flex-end" wrap="wrap">
            <Group gap="md" align="flex-end">
              <Switch
                label="Enable 3-mode lab"
                checked={enableModesLab}
                onChange={(event) => setEnableModesLab(event.currentTarget.checked)}
              />
              <Select
                label="Active mode"
                value={activeMode}
                onChange={(value) => setActiveMode(value || 'green')}
                disabled={!enableModesLab}
                data={MODE_KEYS.map((key) => ({ value: key, label: MODE_LABELS[key] }))}
              />
            </Group>
            <Badge color={enableModesLab ? 'orange' : 'gray'} variant="light" size="lg">
              {enableModesLab ? `Mode Lab Active: ${MODE_LABELS[activeMode]}` : 'Mode Lab Disabled (HC05 behavior)'}
            </Badge>
          </Group>
          <Text size="xs" mt="sm" c="dimmed">
            Mode captures are local in HC06 while mode state syncs to backend for Phase 3 testing.
          </Text>
          <Group mt="sm" gap="xs" align="flex-end" wrap="wrap">
            <Select
              label="Button ID"
              value={modeButtonId}
              onChange={(value) => setModeButtonId(value || 'button4')}
              data={x52ButtonOptions.map((row) => ({ value: row.value, label: row.label }))}
              searchable
              style={{ minWidth: 280 }}
            />
            <TextInput
              label="Green token"
              value={modeOutputTokens.green}
              onChange={(event) => setModeOutputTokens((prev) => ({ ...prev, green: event.currentTarget.value }))}
              placeholder="z"
            />
            <TextInput
              label="Orange token"
              value={modeOutputTokens.orange}
              onChange={(event) => setModeOutputTokens((prev) => ({ ...prev, orange: event.currentTarget.value }))}
              placeholder="x"
            />
            <TextInput
              label="Red token"
              value={modeOutputTokens.red}
              onChange={(event) => setModeOutputTokens((prev) => ({ ...prev, red: event.currentTarget.value }))}
              placeholder="c"
            />
            <Button
              variant="light"
              color="orange"
              loading={modeBindingSaveState === 'saving'}
              onClick={handleSaveModeBindings}
            >
              Save Mode Tokens
            </Button>
            <Button
              variant="filled"
              color="red"
              loading={testFireState === 'saving'}
              onClick={() => {
                void handleTestFire(false);
              }}
            >
              Test Fire Live
            </Button>
            <Button
              variant="outline"
              color="gray"
              loading={testFireState === 'saving'}
              onClick={() => {
                void handleTestFire(true);
              }}
            >
              Test Fire Dry Run
            </Button>
          </Group>

          <Group mt="sm" gap="md" align="flex-end" wrap="wrap">
            <Switch
              label="Live Bridge"
              checked={liveBridgeEnabled}
              onChange={(event) => setLiveBridgeEnabled(event.currentTarget.checked)}
              disabled={!enableModesLab}
            />
            <Switch
              label="Bridge Dry Run"
              checked={liveBridgeDryRun}
              onChange={(event) => setLiveBridgeDryRun(event.currentTarget.checked)}
              disabled={!liveBridgeEnabled}
            />
          </Group>

          <Text size="xs" mt="xs" c={liveBridgeStatus === 'error' ? 'red' : 'dimmed'}>
            Live bridge: {liveBridgeMessage}
          </Text>

          <Box
            mt="sm"
            p="sm"
            style={{
              border: '1px solid rgba(30, 144, 255, 0.2)',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.08)',
            }}
          >
            <Group justify="space-between" align="center" mb="xs">
              <Text size="sm" fw={600}>Batch Button Tokens</Text>
              <Button variant="outline" size="xs" onClick={() => { void handleSaveBatchBindings(); }}>
                Save Batch
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
              {x52ButtonOptions.slice(0, 12).map((row) => {
                const rowBindings = batchBindings[row.value] || {};
                return (
                  <Group key={row.value} gap="xs" align="flex-end" wrap="nowrap">
                    <Text size="xs" style={{ minWidth: '90px' }}>{row.value}</Text>
                    <TextInput
                      placeholder="G"
                      value={String(rowBindings.green || '')}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setBatchBindings((prev) => ({
                          ...prev,
                          [row.value]: {
                            ...(prev[row.value] || {}),
                            green: value,
                          },
                        }));
                      }}
                    />
                    <TextInput
                      placeholder="O"
                      value={String(rowBindings.orange || '')}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setBatchBindings((prev) => ({
                          ...prev,
                          [row.value]: {
                            ...(prev[row.value] || {}),
                            orange: value,
                          },
                        }));
                      }}
                    />
                    <TextInput
                      placeholder="R"
                      value={String(rowBindings.red || '')}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setBatchBindings((prev) => ({
                          ...prev,
                          [row.value]: {
                            ...(prev[row.value] || {}),
                            red: value,
                          },
                        }));
                      }}
                    />
                  </Group>
                );
              })}
            </SimpleGrid>
          </Box>

          <Textarea
            mt="sm"
            label="Bindings JSON"
            value={modeBindingsJson}
            onChange={(event) => setModeBindingsJson(event.currentTarget.value)}
            autosize
            minRows={6}
            maxRows={14}
            styles={{ input: { fontFamily: 'monospace' } }}
          />

          <Group mt="xs" gap="xs" wrap="wrap">
            <Button variant="outline" size="xs" onClick={() => { void handleExportModeBindings(); }}>
              Export JSON
            </Button>
            <Button variant="outline" color="orange" size="xs" onClick={() => { void handleImportModeBindings(); }}>
              Import JSON
            </Button>
          </Group>

          <Text size="xs" mt="xs" c={importExportStatus === 'error' ? 'red' : 'dimmed'}>
            Import/Export: {importExportMessage || 'Idle'}
          </Text>
          <Text size="xs" mt="sm" c="dimmed">
            Mode sync: {modeSyncMessage}
          </Text>
          <Text size="xs" mt="xs" c={testFireState === 'error' ? 'red' : 'dimmed'}>
            Test status: {testFireMessage}
          </Text>
        </Box>

        {/* Error Display */}
        {profilesError && (
          <Box
            p="md"
            style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              borderRadius: '8px',
            }}
          >
            <Text size="sm" style={{ color: '#ff6b6b' }}>
              ⚠️ {profilesError}
            </Text>
          </Box>
        )}

        {/* Profile & State Controls */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {/* Profile Selector */}
          <Select
            label="Load Game Profile"
            placeholder={profilesLoading ? 'Loading profiles...' : 'Select a profile'}
            value={selectedProfile}
            onChange={handleLoadProfile}
            data={[
              {
                group: '🤖 OmniCore AI Profiles',
                items: [
                  {
                    value: '__ai_x52_optimal',
                    label: logitechX52ProOptimal.profileName,
                  },
                ],
              },
              {
                group: '🎮 Your Game Profiles',
                items: profiles.map(p => ({ value: p.name, label: p.name })),
              },
            ]}
            searchable
            clearable
            disabled={profilesLoading && profiles.length === 0}
          />

          {/* Controls Group */}
          <Group gap="xs" align="flex-end">
            <Button
              variant="outline"
              size="sm"
              leftSection={<IconFolderOpen size={16} />}
              onClick={handleOpenFolder}
            >
              Open Folder
            </Button>
          </Group>
        </SimpleGrid>

        {/* Search & Category Filter & Toggle on Same Row */}
        <Group grow align="flex-end" gap="md">
          <TextInput
            placeholder={searchByLiveInput ? 'Live input search enabled - press HOTAS input' : 'Search keybindings...'}
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            disabled={searchByLiveInput}
          />
          <Select
            label="Category"
            placeholder="Select category"
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || '')}
            data={[
              { value: '', label: 'All Categories' },
              ...categoryList.map(([key, category]) => ({
                value: key,
                label: category.label,
              })),
            ]}
            searchable
          />
          <Switch
            label="Unbound Only"
            checked={showUnboundOnly}
            onChange={(e) => setShowUnboundOnly(e.currentTarget.checked)}
            size="sm"
          />
          <Switch
            label="Search by Live Input"
            checked={searchByLiveInput}
            onChange={(e) => setSearchByLiveInput(e.currentTarget.checked)}
            size="sm"
          />
        </Group>

        {/* Live Input Panel – dockable */}
        <KeyPressIndicator
          title="HC05 Live Input"
          inputLabel={liveInputLabel}
          assignmentLabel={inputAssignmentLabel}
          connected={gamepadConnected}
          rawInput={lastHotasInput}
          activeInputs={activeInputs}
          axisValues={axisValues}
          gamepadInfo={gamepadInfo}
        />

        {/* Info Bar */}
        <Group justify="space-between" style={{ color: '#666' }}>
          <Group gap="sm" align="center">
            <Text size="sm">
              {selectedCategory && currentCategory ? (
                <>
                  <strong>{currentCategory.label}</strong> — {currentCategory.description}
                </>
              ) : (
                'All Categories'
              )}
            </Text>
            <Badge color={gamepadConnected ? 'green' : 'gray'} variant="light" size="sm">
              {gamepadConnected ? `Live: ${liveInputLabel}` : 'HOTAS disconnected'}
            </Badge>
            {selectedProfile && !selectedProfile.startsWith('__ai_') && xmlSaveStatus !== 'idle' && (
              <Badge
                color={xmlSaveStatus === 'saving' ? 'blue' : (xmlSaveStatus === 'saved' ? 'green' : 'red')}
                variant="light"
                size="sm"
                title={xmlSaveMessage}
              >
                {xmlSaveStatus === 'saving'
                  ? 'XML saving...'
                  : (xmlSaveStatus === 'saved' ? 'XML saved' : 'XML save failed')}
              </Badge>
            )}
            {enableModesLab && (
              <Badge color="orange" variant="filled" size="sm" title="Mode captures are local-only during lab phase">
                Mode lab local-only write
              </Badge>
            )}
            {captureWarning && (
              <Badge color="orange" variant="light" size="sm" title={captureWarning}>
                Binding conflict warning
              </Badge>
            )}
          </Group>
          <Text size="sm" fw={600}>
            {sortedBindings.length} binding{sortedBindings.length !== 1 ? 's' : ''}
          </Text>
        </Group>

        {/* Table */}
        <HOTASTable
          sortedBindings={sortedBindings}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          colors={colors}
          getRowBackground={getRowBackground}
          isBindingLive={isBindingLive}
          showStatusColumn={false}
          onStartHotasCapture={startHotasCapture}
          activeCaptureBindingId={captureBindingId}
          captureProgress={captureProgress}
          onStartKeyboardCapture={startKeyboardCapture}
          activeKeyboardCaptureBindingId={captureKeyboardBindingId}
          keyboardCaptureProgress={captureKeyboardProgress}
        />

        {/* Notes Section */}
        <Box
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '1rem',
          }}
        >
          <Text size="xs" fw={600} style={{ marginBottom: '0.5rem' }}>
            ℹ️ Notes
          </Text>
          <Stack gap="xs">
            <Text size="xs">
              • <strong>Profiles</strong>: Load pre-made profiles or create your own. Export to XML for backup.
            </Text>
            <Text size="xs">
              • <strong>States</strong>: Filter by context (ground, space flight, weapons, etc.) to reduce noise.
            </Text>
            <Text size="xs">
              • <strong>Modifiers</strong>: SHIFT, CTRL, ALT can be combined with any key.
            </Text>
            <Text size="xs">
              • <strong>Binding capture</strong>: Right-click the Keyboard/Mouse or HOTAS column for any row, then press the desired input.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Container>
    </>
  );
}
