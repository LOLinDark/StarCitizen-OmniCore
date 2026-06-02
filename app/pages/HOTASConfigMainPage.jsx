import HOTASViewSwitcher from '../components/HOTASViewSwitcher';
import HOTASInfoBar from '../components/HOTASInfoBar';
import HOTASErrorDisplay from '../components/HOTASErrorDisplay';
import HOTASNotesSection from '../components/HOTASNotesSection';
import HOTASFilterControls from '../components/HOTASFilterControls';
import { useHotasOverlayState } from '../hooks/useHotasOverlayState';
import { formatKeyboardInputForXml, formatMouseInputForXml } from '../utils/hotasKeyboardMouseFormatters';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Stack,
  Group,
  Title,
  Select,
  TextInput,
  Text,
  Box,
  Badge,
  Switch,
  SegmentedControl,
  MultiSelect,
  Button,
} from '@mantine/core';
import { IconRefresh, IconSearch } from '@tabler/icons-react';

import { HOTASTable } from '../components/HOTASTable';
import HOTASInputView from '../components/HOTASInputView';
import ProfileCardScroller from '../components/ProfileCardScroller';
import { KeyPressIndicator } from '../components/KeyPressIndicator';
import {
  shipKeybindings,
  shipControlsCategories,
  HOTAS_ACTIVITY_OPTIONS,
  getBindingsByActivity,
} from '../data/starcitizen-keybindings';
import {
  DEFAULT_MODE_PLAY_GROUP_VALUES,
  getModePlayGroupOptions,
  getModePlayGroupsForBinding,
} from '../data/hotas-mode-groups';
import { StarCitizenProfileParser } from '../utils/starCitizenProfileParser';
import { featureTrainingNotes } from '../data/trainingAcademyFeatureNotes';

import { featureToStarCitizenAction, parseInputString, formatInputForDisplay } from '../utils/starCitizenActionMap';
import { useHotasInput, LogitechX52Device } from '../libraries/hotas';
import { fetchProfileModeOverrides, saveProfileModeOverrides } from '../libraries/peripherals/hotas';
import DevTag from '../components/DevTag';
import HC05LiveInputContainer from '../containers/HC05LiveInputContainer';
import { normalizeText, getInputKind, getInputAction } from '../utils/hotasUtils';
import { formatHotasBindingFromInput, formatHotasInputForXml } from '../utils/hotasInputFormatters';
import ServerRequiredOverlay from '../components/ServerRequiredOverlay';
import { useServerStatus } from '../hooks/useServerStatus';

const HOTAS_MODE_KEYS = ['green', 'orange', 'red'];
const HOTAS_BAR_EVENT = 'omnicore:hotas-bookmark-status';
const PAGE_DEV_TAG = 'HC05';
const PAGE_LOG_SCOPE = `[${PAGE_DEV_TAG}]`;
const PAGE_STORAGE_KEY = 'omnicore.hc05.state';
const TEMP_ACTIVITY_FILTER_BYPASS = false;
const TEMP_MODE_GROUP_FILTER_BYPASS = false;
const TEMP_ASSIGNMENT_MENU_FILTER_BYPASS = false;

const createEmptyModeMap = () => ({
  green: {},
  orange: {},
  red: {},
});

const coerceModeMap = (input) => ({
  green: input?.green && typeof input.green === 'object' ? input.green : {},
  orange: input?.orange && typeof input.orange === 'object' ? input.orange : {},
  red: input?.red && typeof input.red === 'object' ? input.red : {},
});

export default function HOTASConfigMainPage() {
      // Overlay state for HOTAS overlay demo (persisted in localStorage)
      // Always load overlays from the overlays JSONC file for X52
      // Use custom hook for overlays and devEditMode state
      const { overlays, setOverlays, devEditMode, setDevEditMode } = useHotasOverlayState([]);
      const { isChecking: serverChecking, serverAvailable } = useServerStatus();
      const [dragged, setDragged] = React.useState(null);
      // Load overlays from JSONC file on mount
      useEffect(() => {
        async function loadOverlays() {
          try {
            const overlayUrl = `/data/hotas/overlays/hotas-x52-overlay-positions.jsonc?t=${Date.now()}`;
            const res = await fetch(overlayUrl, { cache: 'no-store' });
            const text = await res.text();
            const { parse } = await import('jsonc-parser');
            setOverlays(parse(text));
          } catch (e) {
            console.error('Failed to load overlays JSONC:', e);
          }
        }
        loadOverlays();
      }, [setOverlays]);
      const CAPTURE_WINDOW_MS = 3000;

      const [selectedProfile, setSelectedProfile] = useState('');
      const [selectedCategory, setSelectedCategory] = useState('');
      const [selectedActivity, setSelectedActivity] = useState('');
      const [searchQuery, setSearchQuery] = useState('');
      const [sortBy, setSortBy] = useState('feature');
      const [sortOrder, setSortOrder] = useState('asc');
      const [tableView, setTableView] = useState('features');
      const [bindingLayout, setBindingLayout] = useState('single');
      const [activeBindingMode, setActiveBindingMode] = useState('green');
      const [profiles, setProfiles] = useState([]);
      const [profilesLoading, setProfilesLoading] = useState(true);
      const [profilesError, setProfilesError] = useState(null);
      const [profileFilter, setProfileFilter] = useState('all');
      const [hc05View, setHc05View] = useState('bindings');
      const [searchByLiveInput, setSearchByLiveInput] = useState(false);
      const [hideStickFeatures, setHideStickFeatures] = useState(true);
      const [selectedModeGroups, setSelectedModeGroups] = useState([...DEFAULT_MODE_PLAY_GROUP_VALUES]);
      const [profileName, setProfileName] = useState('');
      const [mergedBindings, setMergedBindings] = useState(null);
      const [hotasOverrides, setHotasOverrides] = useState({});
      const [modeHotasOverrides, setModeHotasOverrides] = useState(createEmptyModeMap);
      const [keyboardOverrides, setKeyboardOverrides] = useState({});
      const [captureBindingId, setCaptureBindingId] = useState(null);
      const [captureModeKey, setCaptureModeKey] = useState(null);
      const [captureProgress, setCaptureProgress] = useState(0);
      const [captureKeyboardBindingId, setCaptureKeyboardBindingId] = useState(null);
      const [captureKeyboardProgress, setCaptureKeyboardProgress] = useState(0);
      const [xmlSaveStatus, setXmlSaveStatus] = useState('idle');
      const [xmlSaveMessage, setXmlSaveMessage] = useState('');
      const [modeOverridesSaveStatus, setModeOverridesSaveStatus] = useState('idle');
      const [modeOverridesSaveMessage, setModeOverridesSaveMessage] = useState('');
      const [captureWarning, setCaptureWarning] = useState('');
      const isDevRuntime = import.meta.env.DEVELOPMENT_MODE === 'true'
        || import.meta.env.MODE === 'development'
        || import.meta.env.NODE_ENV === 'development';
      const modeGroupOptions = useMemo(() => getModePlayGroupOptions(), []);
      const captureStartedAtRef = useRef(0);
      const keyboardCaptureStartedAtRef = useRef(0);
      const captureInitialSignatureRef = useRef('');
      const isInitializedRef = useRef(false);
      const savedHotasOverridesRef = useRef(null);
      const savedKeyboardOverridesRef = useRef(null);
      const modeOverridesHydratingRef = useRef(false);
      const modeOverridesSaveTimerRef = useRef(null);
      const previousBindingLayoutRef = useRef('single');
      const { lastInput: lastHotasInput, gamepadConnected, activeInputs, axisValues, gamepadInfo, currentMode } = useHotasInput({
        enabled: true,
        trackKeyboard: false,
        device: LogitechX52Device,
      });


      // normalizeText, getInputKind, getInputAction are now imported from utils/hotasUtils.js

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

  // formatHotasBindingFromInput and formatHotasInputForXml are now imported from utils/hotasInputFormatters.js

  // formatKeyboardInputForXml and formatMouseInputForXml are now imported from utils/hotasKeyboardMouseFormatters.js

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
  }, [selectedProfile]);

  const startHotasCapture = useCallback((bindingId, modeKey = null) => {
    captureStartedAtRef.current = Date.now();
    captureInitialSignatureRef.current = getInputSignature(lastHotasInput);
    setCaptureBindingId(bindingId);
    setCaptureModeKey(HOTAS_MODE_KEYS.includes(modeKey) ? modeKey : null);
    setCaptureProgress(1);
  }, [getInputSignature, lastHotasInput]);

  const startKeyboardCapture = useCallback((bindingId) => {
    keyboardCaptureStartedAtRef.current = Date.now();
    setCaptureKeyboardBindingId(bindingId);
    setCaptureKeyboardProgress(1);
  }, []);

  const handleAssignHotasFeature = useCallback((bindingId, xmlToken, modeKey = null) => {
    if (bindingLayout === 'modes') {
      const targetMode = HOTAS_MODE_KEYS.includes(modeKey) ? modeKey : activeBindingMode;
      setModeHotasOverrides((prev) => ({
        ...prev,
        [targetMode]: {
          ...(prev[targetMode] || {}),
          [bindingId]: xmlToken,
        },
      }));
      return;
    }

    const baseBindings = (Array.isArray(mergedBindings) && mergedBindings.length > 0)
      ? mergedBindings
      : shipKeybindings;

    setHotasOverrides((prev) => {
      const next = { ...prev };
      // When assigning a button to a new feature, explicitly suppress any other
      // feature whose XML binding resolves to the same button token.  Without
      // this, stale XML bindings shadow the new assignment until the XML file
      // itself is updated.
      const normNew = String(xmlToken || '').toLowerCase();
      const btnMatchNew = normNew.match(/^js\d+_button(\d+)$/);
      baseBindings.forEach((b) => {
        if (b.id === bindingId) return;
        // Only suppress features that have no explicit override already set.
        if (next[b.id] !== undefined) return;
        const xmlVal = String(b.hotasBinding || '').toLowerCase();
        if (!xmlVal) return;
        const isConflict = xmlVal === normNew
          || (btnMatchNew && xmlVal === `button ${btnMatchNew[1]}`)
          || (btnMatchNew && xmlVal.includes(`js1_button${btnMatchNew[1]}`));
        if (isConflict) {
          // Setting to '' explicitly clears the XML fallback for this feature.
          next[b.id] = '';
        }
      });
      next[bindingId] = xmlToken;
      return next;
    });
    void persistCapturedBindingToXml(bindingId, xmlToken);
  }, [activeBindingMode, bindingLayout, mergedBindings, persistCapturedBindingToXml]);

  const persistClearedBindingFromXml = useCallback(async (inputToken) => {
    if (!selectedProfile || selectedProfile.startsWith('__ai_')) return;

    if (!inputToken) {
      setXmlSaveStatus('error');
      setXmlSaveMessage('Clear requested without a valid XML token');
      return;
    }

    try {
      setXmlSaveStatus('saving');
      setXmlSaveMessage('Removing binding from XML...');

      const response = await fetch(`/api/hotas/profile/${encodeURIComponent(selectedProfile)}/bindings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputToken,
          clearBinding: true,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Failed to clear XML (${response.status})`);
      }

      setXmlSaveStatus('saved');
      setXmlSaveMessage(`Cleared from XML: ${inputToken}`);
    } catch (error) {
      setXmlSaveStatus('error');
      setXmlSaveMessage(error.message || 'Failed to clear profile XML binding');
    }
  }, [selectedProfile]);

  const handleClearHotasFeature = useCallback((bindingId, xmlToken, modeKey = null) => {
    if (bindingLayout === 'modes') {
      const targetMode = HOTAS_MODE_KEYS.includes(modeKey) ? modeKey : activeBindingMode;
      setModeHotasOverrides((prev) => {
        const currentModeBindings = prev[targetMode] || {};
        if (!currentModeBindings[bindingId]) return prev;

        const nextModeBindings = { ...currentModeBindings };
        delete nextModeBindings[bindingId];

        return {
          ...prev,
          [targetMode]: nextModeBindings,
        };
      });
      return;
    }

    setHotasOverrides((prev) => {
      if (!prev[bindingId]) return prev;
      const next = { ...prev };
      delete next[bindingId];
      return next;
    });

    void persistClearedBindingFromXml(xmlToken);
  }, [activeBindingMode, bindingLayout, persistClearedBindingFromXml]);

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

  const applyHydratedModeOverrides = useCallback((nextValue) => {
    modeOverridesHydratingRef.current = true;
    setModeHotasOverrides(coerceModeMap(nextValue));
    Promise.resolve().then(() => {
      modeOverridesHydratingRef.current = false;
    });
  }, []);

  const loadModeOverridesForProfile = useCallback(async (profileName) => {
    if (!profileName) {
      applyHydratedModeOverrides(createEmptyModeMap());
      return;
    }

    try {
      const payload = await fetchProfileModeOverrides(profileName);
      applyHydratedModeOverrides(payload?.modeHotasOverrides || createEmptyModeMap());
    } catch (error) {
      console.error(`${PAGE_LOG_SCOPE} Failed to load mode overrides:`, error);
      applyHydratedModeOverrides(createEmptyModeMap());
    }
  }, [applyHydratedModeOverrides]);

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

    if (captureModeKey) {
      setModeHotasOverrides((prev) => ({
        ...prev,
        [captureModeKey]: {
          ...(prev[captureModeKey] || {}),
          [bindingId]: formatted,
        },
      }));
      setCaptureWarning('Mode-column HOTAS bindings are stored in OmniCore and not yet written to XML profiles.');
    } else {
      setHotasOverrides((prev) => ({
        ...prev,
        [bindingId]: formatted,
      }));

      const hotasToken = formatHotasInputForXml(lastHotasInput);
      if (hotasToken) {
        const conflictMessage = getBindingConflictSummary(bindingId, formatted, 'hotas');
        setCaptureWarning(conflictMessage);
        void persistCapturedBindingToXml(bindingId, hotasToken);
      }
    }

    setCaptureBindingId(null);
    setCaptureModeKey(null);
    setCaptureProgress(0);
  }, [
    captureModeKey,
    captureBindingId,
    lastHotasInput,
    getInputSignature,
    isInputCapturable,
    formatHotasBindingFromInput,
    formatHotasInputForXml,
    getBindingConflictSummary,
    persistCapturedBindingToXml,
  ]);

  useEffect(() => {
    if (!captureKeyboardBindingId) return undefined;

    const applyCapturedInput = (xmlToken) => {
      if (!xmlToken) return;
      const bindingId = captureKeyboardBindingId;
      const formatted = formatInputForDisplay(parseInputString(xmlToken));
      const bindingType = xmlToken.startsWith('js') ? 'hotas' : 'keyboard';

      setKeyboardOverrides((prev) => ({
        ...prev,
        [bindingId]: formatted,
      }));

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

  const loadProfiles = useCallback(async () => {
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
  }, []);

  // Load profiles from backend
  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  // Restore persisted state from localStorage on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      const savedState = localStorage.getItem(PAGE_STORAGE_KEY);
      if (!savedState) return;

      const {
        selectedProfile: savedProfile,
        selectedCategory: savedCategory,
        selectedActivity: savedActivity,
        hc05View: savedHc05View,
        selectedModeGroups: savedModeGroups,
        bindingLayout: savedBindingLayout,
        activeBindingMode: savedActiveBindingMode,
        hotasOverrides: savedHotasOverrides,
        modeHotasOverrides: savedModeHotas,
        keyboardOverrides: savedKeyboardOverrides,
      } = JSON.parse(savedState);

      if (savedBindingLayout === 'single' || savedBindingLayout === 'modes') {
        setBindingLayout(savedBindingLayout);
      }

      if (HOTAS_MODE_KEYS.includes(savedActiveBindingMode)) {
        setActiveBindingMode(savedActiveBindingMode);
      }
      
      if (savedCategory) {
        setSelectedCategory(savedCategory);
      }

      if (typeof savedActivity === 'string') {
        setSelectedActivity(savedActivity);
      }

      if (savedHc05View === 'bindings' || savedHc05View === 'live') {
        setHc05View(savedHc05View);
      }

      if (Array.isArray(savedModeGroups)) {
        setSelectedModeGroups(savedModeGroups);
      }

      // Store overrides in ref to be restored after profile loads
      if (savedHotasOverrides && typeof savedHotasOverrides === 'object') {
        savedHotasOverridesRef.current = savedHotasOverrides;
      }

      if (savedModeHotas && typeof savedModeHotas === 'object') {
        applyHydratedModeOverrides(savedModeHotas);
      }

      if (savedKeyboardOverrides && typeof savedKeyboardOverrides === 'object') {
        savedKeyboardOverridesRef.current = savedKeyboardOverrides;
      }

      // Load profile - this will temporarily clear hotasOverrides
      if (savedProfile) {
        console.log(`${PAGE_LOG_SCOPE} Restoring profile from localStorage:`, savedProfile);
        handleLoadProfile(savedProfile);
      }
    } catch (error) {
      console.error(`${PAGE_LOG_SCOPE} Error restoring state from localStorage:`, error);
    }
  }, [applyHydratedModeOverrides]);

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
  }, [mergedBindings]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    try {
      const stateToSave = {
        selectedProfile,
        selectedCategory,
        selectedActivity,
        hc05View,
        selectedModeGroups,
        bindingLayout,
        activeBindingMode,
        hotasOverrides,
        modeHotasOverrides,
        keyboardOverrides,
      };
      localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(stateToSave));
      console.log(`${PAGE_LOG_SCOPE} State saved to localStorage`);
    } catch (error) {
      console.error(`${PAGE_LOG_SCOPE} Error saving state to localStorage:`, error);
    }
  }, [selectedProfile, selectedCategory, selectedActivity, hc05View, selectedModeGroups, bindingLayout, activeBindingMode, hotasOverrides, modeHotasOverrides, keyboardOverrides]);

  useEffect(() => {
    const previousLayout = previousBindingLayoutRef.current;

    if (bindingLayout === 'modes' && previousLayout !== 'modes') {
      const allBaseBindings = (Array.isArray(mergedBindings) && mergedBindings.length > 0)
        ? mergedBindings
        : shipKeybindings;

      setModeHotasOverrides((prev) => {
        const next = coerceModeMap(prev);
        const nextGreen = { ...(next.green || {}) };
        let changed = false;

        allBaseBindings.forEach((binding) => {
          const bindingId = binding?.id;
          if (!bindingId) return;

          const hasGreenValue = String(nextGreen[bindingId] || '').trim().length > 0;
          if (hasGreenValue) return;

          const singleHotasValue = String(hotasOverrides[bindingId] || binding.hotasBinding || '').trim();
          if (!singleHotasValue) return;

          nextGreen[bindingId] = singleHotasValue;
          changed = true;
        });

        if (!changed) return prev;

        return {
          ...next,
          green: nextGreen,
        };
      });
    }

    previousBindingLayoutRef.current = bindingLayout;
  }, [bindingLayout, hotasOverrides, mergedBindings]);

  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (!selectedProfile) return;
    if (modeOverridesHydratingRef.current) return;
    if (bindingLayout !== 'modes') {
      setModeOverridesSaveStatus('idle');
      setModeOverridesSaveMessage('');
      return;
    }

    if (modeOverridesSaveTimerRef.current) {
      clearTimeout(modeOverridesSaveTimerRef.current);
    }

    setModeOverridesSaveStatus('saving');
    setModeOverridesSaveMessage('Saving mode overrides...');

    modeOverridesSaveTimerRef.current = setTimeout(() => {
      saveProfileModeOverrides(selectedProfile, modeHotasOverrides)
        .then(() => {
          setModeOverridesSaveStatus('saved');
          setModeOverridesSaveMessage('Mode overrides saved');
        })
        .catch((error) => {
          console.error(`${PAGE_LOG_SCOPE} Failed to save mode overrides:`, error);
          setModeOverridesSaveStatus('error');
          setModeOverridesSaveMessage(error.message || 'Failed to save mode overrides');
        });
    }, 300);

    return () => {
      if (modeOverridesSaveTimerRef.current) {
        clearTimeout(modeOverridesSaveTimerRef.current);
      }
    };
  }, [selectedProfile, modeHotasOverrides, bindingLayout]);

  useEffect(() => {
    const hasProfile = Boolean(selectedProfile);
    const hasConflict = Boolean(captureWarning);
    const activeSaveState = xmlSaveStatus !== 'idle'
      ? {
          tone: xmlSaveStatus === 'saving' ? 'blue' : (xmlSaveStatus === 'saved' ? 'green' : 'red'),
          icon: xmlSaveStatus === 'saving' ? '💾' : (xmlSaveStatus === 'saved' ? '✅' : '⛔'),
          label: xmlSaveStatus === 'saving' ? 'Saving profile' : (xmlSaveStatus === 'saved' ? 'Profile saved' : 'Save failed'),
          message: xmlSaveMessage || 'Profile XML status',
        }
      : (bindingLayout === 'modes' && modeOverridesSaveStatus !== 'idle'
          ? {
              tone: modeOverridesSaveStatus === 'saving' ? 'blue' : (modeOverridesSaveStatus === 'saved' ? 'green' : 'red'),
              icon: modeOverridesSaveStatus === 'saving' ? '🎛' : (modeOverridesSaveStatus === 'saved' ? '✅' : '⛔'),
              label: modeOverridesSaveStatus === 'saving' ? 'Saving modes' : (modeOverridesSaveStatus === 'saved' ? 'Modes saved' : 'Modes failed'),
              message: modeOverridesSaveMessage || 'Mode override status',
            }
          : {
              tone: hasProfile ? 'cyan' : 'gray',
              icon: hasProfile ? '💾' : '📁',
              label: hasProfile ? 'Auto-save ready' : 'Load a profile',
              message: hasProfile
                ? 'Assignments save back to the selected profile automatically.'
                : 'Choose a Star Citizen profile before capturing or saving bindings.',
            });

    const contextDetail = bindingLayout === 'modes'
      ? {
          tone: 'violet',
          icon: '🎛',
          label: `${activeBindingMode[0].toUpperCase()}${activeBindingMode.slice(1)} mode`,
          message: 'Per-mode editing is active. New HOTAS captures apply to the selected color mode.',
        }
      : {
          tone: 'teal',
          icon: '🕹',
          label: 'Single HOTAS',
          message: 'Single HOTAS editing is active. Captures write the same binding across your base layout.',
        };

    window.dispatchEvent(new CustomEvent(HOTAS_BAR_EVENT, {
      detail: {
        saveTone: activeSaveState.tone,
        saveIcon: activeSaveState.icon,
        saveLabel: activeSaveState.label,
        saveMessage: activeSaveState.message,
        contextTone: contextDetail.tone,
        contextIcon: contextDetail.icon,
        contextLabel: contextDetail.label,
        contextMessage: contextDetail.message,
        warningIcon: hasConflict ? '⚠️' : '',
        warningLabel: hasConflict ? 'Conflict detected' : '',
        warningMessage: captureWarning || '',
        helperText: hasConflict
          ? 'Resolve the highlighted clash before trusting the current layout.'
          : (hasProfile ? 'Sticky status lives here while you scroll the table.' : 'Select a profile to start editing.'),
      },
    }));
  }, [
    selectedProfile,
    xmlSaveStatus,
    xmlSaveMessage,
    modeOverridesSaveStatus,
    modeOverridesSaveMessage,
    captureWarning,
    bindingLayout,
    activeBindingMode,
  ]);

  useEffect(() => () => {
    window.dispatchEvent(new CustomEvent(HOTAS_BAR_EVENT, {
      detail: null,
    }));
  }, []);

  const filterPerfRef = useRef({ baseMs: 0, finalMs: 0 });

  const { sortedBindings: unfilteredBindings, currentCategory, categoryList } = useMemo(() => {
    const started = performance.now();
    const sourceBindings = mergedBindings || shipKeybindings;
    let results = sourceBindings;

    if (selectedCategory) {
      results = results.filter((b) => b.category === selectedCategory);
    }

    if (!TEMP_ACTIVITY_FILTER_BYPASS) {
      results = getBindingsByActivity(results, selectedActivity);
    }

    if (searchQuery) {
      const normalizedSearch = searchQuery.toLowerCase();
      results = results.filter((b) =>
        b.feature.toLowerCase().includes(normalizedSearch)
        || (b.primaryKey && b.primaryKey.toLowerCase().includes(normalizedSearch))
        || (b.description && b.description.toLowerCase().includes(normalizedSearch))
      );
    }

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

    filterPerfRef.current.baseMs = performance.now() - started;

    return {
      sortedBindings: sorted,
      currentCategory: shipControlsCategories[selectedCategory],
      categoryList: Object.entries(shipControlsCategories),
    };
  }, [mergedBindings, selectedCategory, selectedActivity, searchQuery, sortBy, sortOrder]);

  const applyBindingOverrides = useCallback((bindings = []) => {
    if (!Array.isArray(bindings) || bindings.length === 0) return [];
    return bindings.map((binding) => {
      const singleHotasValue = String(hotasOverrides[binding.id] || binding.hotasBinding || '').trim();
      const savedGreen = String(modeHotasOverrides.green?.[binding.id] || '').trim();
      const savedOrange = String(modeHotasOverrides.orange?.[binding.id] || '').trim();
      const savedRed = String(modeHotasOverrides.red?.[binding.id] || '').trim();

      // In per-mode layout, keep Green usable even when mode override maps are empty
      // by falling back to the profile's single HOTAS binding.
      const modeBindings = {
        green: savedGreen || (bindingLayout === 'modes' ? singleHotasValue : ''),
        orange: savedOrange,
        red: savedRed,
      };
      const selectedModeBinding = modeBindings[activeBindingMode] || '';
      const greenFallbackBinding = modeBindings.green || '';
      const hotasOverride = bindingLayout === 'modes'
        ? (selectedModeBinding || greenFallbackBinding || singleHotasValue)
        : hotasOverrides[binding.id];
      const keyboardOverride = keyboardOverrides[binding.id];

      if (!hotasOverride && !keyboardOverride && !modeBindings.green && !modeBindings.orange && !modeBindings.red) return binding;

      return {
        ...binding,
        hotasBinding: hotasOverride || binding.hotasBinding,
        keyboardBinding: keyboardOverride || binding.keyboardBinding,
        modeHotasBindings: modeBindings,
      };
    });
  }, [activeBindingMode, bindingLayout, hotasOverrides, keyboardOverrides, modeHotasOverrides]);

  const effectiveBindings = useMemo(() => applyBindingOverrides(unfilteredBindings), [unfilteredBindings, applyBindingOverrides]);

  const allEffectiveBindings = useMemo(() => {
    const allBaseBindings = Array.isArray(mergedBindings) && mergedBindings.length > 0
      ? mergedBindings
      : shipKeybindings;
    return applyBindingOverrides(allBaseBindings);
  }, [mergedBindings, applyBindingOverrides]);

  const hasVisibleBindingValue = useCallback((binding) => {
    if (!binding) return false;

    const hotasValue = String(binding.hotasBinding || '').trim();
    const keyboardValue = String(binding.keyboardBinding || '').trim();
    const modeBindings = binding.modeHotasBindings || {};
    const modeValues = [modeBindings.green, modeBindings.orange, modeBindings.red]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    return Boolean(hotasValue || keyboardValue || modeValues.length > 0);
  }, []);

  const modeGroupFilteredAllBindings = useMemo(() => {
    let results = allEffectiveBindings;

    if (!TEMP_ACTIVITY_FILTER_BYPASS && selectedActivity) {
      results = getBindingsByActivity(results, selectedActivity);
    }

    if (TEMP_MODE_GROUP_FILTER_BYPASS) {
      return results;
    }

    return results.filter((binding) => {
      const bindingGroups = getModePlayGroupsForBinding(binding);
      const inSelectedGroup = bindingGroups.some((group) => selectedModeGroups.includes(group));
      return inSelectedGroup || hasVisibleBindingValue(binding);
    });
  }, [allEffectiveBindings, selectedActivity, selectedModeGroups, hasVisibleBindingValue]);

  const modeGroupFilteredEffectiveBindings = useMemo(() => {
    if (TEMP_MODE_GROUP_FILTER_BYPASS) {
      return effectiveBindings;
    }

    return effectiveBindings.filter((binding) => {
      const bindingGroups = getModePlayGroupsForBinding(binding);
      const inSelectedGroup = bindingGroups.some((group) => selectedModeGroups.includes(group));
      return inSelectedGroup || hasVisibleBindingValue(binding);
    });
  }, [effectiveBindings, selectedModeGroups, hasVisibleBindingValue]);

  // Filter by bound/unbound status
  const sortedBindings = useMemo(() => {
    const started = performance.now();
    let results = modeGroupFilteredEffectiveBindings;

    if (searchByLiveInput) {
      results = lastHotasInput ? results.filter((binding) => isBindingLive(binding)) : [];
    }

    if (profileFilter === 'hotas-assigned') {
      results = results.filter(binding => binding.hotasBinding);
    } else if (profileFilter === 'hotas-empty') {
      results = results.filter(binding => !binding.hotasBinding);
    } else if (profileFilter === 'kb-assigned') {
      results = results.filter(binding => binding.keyboardBinding);
    } else if (profileFilter === 'kb-empty') {
      results = results.filter(binding => !binding.keyboardBinding);
    } else if (profileFilter === 'fully-unbound') {
      results = results.filter(binding => !binding.hotasBinding && !binding.keyboardBinding);
    }

    filterPerfRef.current.finalMs = performance.now() - started;
    return results;
  }, [modeGroupFilteredEffectiveBindings, profileFilter, searchByLiveInput, lastHotasInput, isBindingLive]);

  const liveMatchedBindings = useMemo(() => {
    if (!lastHotasInput) return [];
    return modeGroupFilteredEffectiveBindings.filter((binding) => isBindingLive(binding));
  }, [lastHotasInput, modeGroupFilteredEffectiveBindings, isBindingLive]);

  const inputAssignmentLabel = useMemo(() => {
    if (!lastHotasInput) return 'Unassigned';
    if (liveMatchedBindings.length === 0) return 'Unassigned';
    if (liveMatchedBindings.length === 1) return `Assigned: ${liveMatchedBindings[0].feature}`;
    return `Assigned to ${liveMatchedBindings.length} features`;
  }, [lastHotasInput, liveMatchedBindings]);

  // HOTAS-specific colors (dark theme)
  const colors = {
    headerBg: 'rgba(0, 217, 255, 0.08)',
    headerBorder: 'rgba(0, 217, 255, 0.2)',
    headerText: '#6a8898',
    headerTextShadow: undefined,
    featureText: '#e0eaf4',
    featureTextShadow: undefined,
    tableBg: 'rgba(0, 0, 0, 0.4)',
    tableBoxShadow: '0 0 15px rgba(0, 217, 255, 0.05)',
    primaryKeyHeaderColor: '#6a8898',
    primaryKeyBorder: '1px solid rgba(0, 217, 255, 0.2)',
    primaryKeyHeaderShadow: undefined,
    primaryKeyBadgeBg: 'rgba(0, 217, 255, 0.1)',
    primaryKeyBadgeColor: '#00d9ff',
    primaryKeyBadgeBorder: '1px solid rgba(0, 217, 255, 0.3)',
    alternativeHeaderColor: '#6a8898',
    alternativeBorder: undefined,
    alternativeHeaderShadow: undefined,
    alternativeBadgeBg: 'rgba(156, 39, 176, 0.1)',
    alternativeBadgeColor: '#ce93d8',
    alternativeBadgeBorder: '1px solid rgba(156, 39, 176, 0.3)',
    categoryText: '#6a8898',
    categoryTextShadow: undefined,
    statusHeaderColor: '#6a8898',
    statusBorder: undefined,
    statusHeaderShadow: undefined,
    rowBg: 'transparent',
    rowBorderColor: 'rgba(255, 255, 255, 0.04)',
    alternateRowBg: 'rgba(0, 217, 255, 0.02)',
    emptyKeyColor: '#3a5060',
  };

  const getRowBackground = (binding) => {
    if (binding.changed) return '#fff3cd';
    if (binding.pendingApply) return '#d1ecf1';
    return undefined;
  };

  const handleLoadProfile = async (newProfileName) => {
    if (!newProfileName) {
      setSelectedProfile('');
      setProfileName('');
      setMergedBindings(null);
      setHotasOverrides({});
      applyHydratedModeOverrides(createEmptyModeMap());
      setKeyboardOverrides({});
      setXmlSaveStatus('idle');
      setXmlSaveMessage('');
      setModeOverridesSaveStatus('idle');
      setModeOverridesSaveMessage('');
      setCaptureWarning('');
      return;
    }

    try {
      console.log(`${PAGE_LOG_SCOPE} Loading profile: ${newProfileName}`);
      setSelectedProfile(newProfileName);
      setXmlSaveStatus('idle');
      setXmlSaveMessage('');
      setModeOverridesSaveStatus('idle');
      setModeOverridesSaveMessage('');
      setCaptureWarning('');
      savedHotasOverridesRef.current = null;
      savedKeyboardOverridesRef.current = null;
      const response = await fetch(`/api/hotas/profile/${newProfileName}`);
      if (!response.ok) throw new Error('Failed to load profile');
      const data = await response.json();
      console.log(`${PAGE_LOG_SCOPE} Profile loaded:`, data.profile);
      console.log(`${PAGE_LOG_SCOPE} Profile content length:`, data.xmlContent?.length);
      
      // Extract and set profile name from XML if available
      if (data.profileName) {
        setProfileName(data.profileName);
      } else if (newProfileName) {
        setProfileName(newProfileName);
      }
      setHotasOverrides({});
      setKeyboardOverrides({});
      
      // Parse XML and merge keybindings
      if (data.xmlContent) {
        try {
          const parser = new StarCitizenProfileParser(data.xmlContent);
          console.log(`${PAGE_LOG_SCOPE} XML parsed successfully`);
          
          // Get all bindings from profile (both keyboard and joystick)
          const allBindings = parser.getAllBindings();
          console.log(`${PAGE_LOG_SCOPE} Found bindings in profile:`, allBindings.length);
          
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
          
          console.log(`${PAGE_LOG_SCOPE} Profile bindings map created:`, Object.keys(profileBindingsMap).length, 'actions');
          
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
              console.log(`${PAGE_LOG_SCOPE} Merged profile binding for ${binding.id}:`, {
                keyboardBinding: mergedBinding.keyboardBinding,
                hotasBinding: mergedBinding.hotasBinding,
              });
              return mergedBinding;
            }

            return binding;
          });
          
          console.log(`${PAGE_LOG_SCOPE} Profile merged into keybindings`);
          setMergedBindings(merged);
          await loadModeOverridesForProfile(newProfileName);
        } catch (parseError) {
          console.error(`${PAGE_LOG_SCOPE} Error parsing profile XML:`, parseError);
          alert(`Could not parse profile: ${parseError.message}`);
          setSelectedProfile('');
          setProfileName('');
          setMergedBindings(null);
          applyHydratedModeOverrides(createEmptyModeMap());
        }
      }

      if (!data.xmlContent) {
        await loadModeOverridesForProfile(newProfileName);
      }
    } catch (error) {
      console.error(`${PAGE_LOG_SCOPE} Error loading profile:`, error);
      alert(`Could not load profile: ${error.message}`);
      setSelectedProfile('');
      setProfileName('');
      setMergedBindings(null);
      applyHydratedModeOverrides(createEmptyModeMap());
    }
  };


  // Render filter controls using extracted component
  const filterControls = (
    <HOTASFilterControls
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      profileFilter={profileFilter}
      setProfileFilter={setProfileFilter}
      searchByLiveInput={searchByLiveInput}
      setSearchByLiveInput={setSearchByLiveInput}
    />
  );

  return (
    <Stack gap="xl">
        {/* Server required guard — shown on GitHub Pages / any static host */}
        {!serverChecking && !serverAvailable && (
          <ServerRequiredOverlay featureName="Peripheral Configuration" />
        )}
        {/* Header + Profiles + Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
              <DevTag tag={PAGE_DEV_TAG} />
              Peripheral Config{profileName ? ` - ${profileName}` : ''}
            </h1>
            <Text c="dimmed" mb="md">Configure your flight stick, mouse, and keyboard for precision control</Text>
            <Group mb="xs" gap="sm" align="stretch" wrap="wrap">
              {/* Active profile card with click-to-select menu */}
              <div>
                <Text size="xs" c="dimmed" mb={4}>Select profile</Text>
                <ProfileCardScroller
                  profiles={profiles}
                  selectedProfile={selectedProfile}
                  onSelect={handleLoadProfile}
                />
              </div>

              <div>
                <Text size="xs" c="dimmed" mb={4}>{isDevRuntime ? 'View' : 'Select view'}</Text>
                <Box
                  style={{
                    width: 320,
                    maxWidth: '100%',
                    minHeight: 92,
                    borderRadius: 10,
                    border: '1px solid rgba(0, 217, 255, 0.25)',
                    background: 'rgba(0, 12, 20, 0.45)',
                    boxShadow: '0 0 14px rgba(0, 217, 255, 0.12)',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <SegmentedControl
                    value={hc05View}
                    onChange={setHc05View}
                    size="xs"
                    fullWidth
                    data={[
                      { value: 'bindings', label: 'Bindings Table' },
                      { value: 'live', label: 'HOTAS Live Input' },
                    ]}
                  />
                </Box>
              </div>

              {/* Reload profiles card */}
              <div>
                <Text size="xs" c="dimmed" mb={4}>Reload profiles from game files</Text>
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => void loadProfiles()}
                  loading={profilesLoading}
                  style={{
                    width: 320,
                    maxWidth: '100%',
                    minHeight: 92,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(0, 40, 56, 0.78) 0%, rgba(28, 44, 54, 0.76) 70%, rgba(163, 89, 24, 0.44) 100%)',
                    border: '1px solid rgba(0, 217, 255, 0.32)',
                    boxShadow: '0 0 12px rgba(0, 217, 255, 0.18)',
                    color: '#d7edf7',
                    justifyContent: 'flex-start',
                    paddingLeft: '0.85rem',
                  }}
                >
                  Reload profiles
                </Button>
              </div>

              <div>
                <Text size="xs" c="dimmed" mb={4}>Select Activity</Text>
                <Box
                  style={{
                    width: 320,
                    maxWidth: '100%',
                    minHeight: 92,
                    borderRadius: 10,
                    border: '1px solid rgba(0, 217, 255, 0.25)',
                    background: 'rgba(0, 12, 20, 0.45)',
                    boxShadow: '0 0 14px rgba(0, 217, 255, 0.12)',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Select
                    value={selectedActivity}
                    onChange={(value) => setSelectedActivity(value || '')}
                    data={HOTAS_ACTIVITY_OPTIONS}
                    style={{ width: '100%' }}
                    size="md"
                  />
                </Box>
              </div>
            </Group>
            <Text size="xs" c="dimmed">
              {profiles.length} profile{profiles.length === 1 ? '' : 's'} detected
            </Text>
          </div>
          <Box
            style={{
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 107, 0, 0.45)',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.22)',
              width: 360,
              maxWidth: '40vw',
            }}
          >
            <img
              src="/assets/tools/hotas-config.png"
              alt="Peripheral Configuration themed HOTAS setup"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </div>

        {/* Error Display (extracted) */}
        <HOTASErrorDisplay error={profilesError} />

        <Box
          p="sm"
          style={{
            borderRadius: 8,
            border: '1px solid rgba(0, 217, 255, 0.2)',
            background: 'rgba(0, 217, 255, 0.04)',
          }}
        >
          <Text size="sm" fw={700} mb={8}>Groups</Text>
          <Group align="flex-end" gap="sm" wrap="wrap">
            <MultiSelect
              label="Play Mode Groups"
              description="Global filter applied to feature table, input table, and HOTAS overlay assignment menu"
              placeholder="Show gameplay-specific groups"
              data={modeGroupOptions}
              value={selectedModeGroups}
              onChange={setSelectedModeGroups}
              searchable
              clearable
              style={{ minWidth: 360, flex: 1 }}
            />
            <Select
              label="Category"
              placeholder="All Categories"
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value || '')}
              data={[
                { value: '', label: 'All Categories' },
                ...categoryList.map(([key, category]) => ({ value: key, label: category.label })),
              ]}
              searchable
              style={{ minWidth: 240 }}
            />
            <Switch
              label="Groups"
              checked={hideStickFeatures}
              onChange={(event) => setHideStickFeatures(event.currentTarget.checked)}
              size="sm"
              title="Hide Yaw/Pitch/Roll in Assigned Feature menus for non-axis rows"
            />
            <Button
              variant="light"
              size="xs"
              onClick={() => setSelectedModeGroups(modeGroupOptions.map((option) => option.value))}
            >
              Select all
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSelectedModeGroups([])}
            >
              Hide all
            </Button>
            <Badge color="cyan" variant="light" size="sm">
              {modeGroupFilteredAllBindings.length} visible bindings
            </Badge>
          </Group>
        </Box>

        {hc05View === 'live' ? (
          <Box mb="xl">
            <KeyPressIndicator
              title="Live Input"
              inputLabel={liveInputLabel}
              assignmentLabel={inputAssignmentLabel}
              connected={gamepadConnected}
            >
              <Box mt="md">
                <HC05LiveInputContainer
                  overlays={overlays}
                  onOverlayChange={setOverlays}
                  keybindings={modeGroupFilteredAllBindings}
                  allKeybindings={allEffectiveBindings}
                  hotasOverrides={hotasOverrides}
                  bindingLayout={bindingLayout}
                  onAssignFeature={handleAssignHotasFeature}
                  onClearFeature={handleClearHotasFeature}
                  activeInputs={activeInputs}
                  axisValues={axisValues}
                  lastHotasInput={lastHotasInput}
                  currentMode={currentMode}
                  deviceMap={LogitechX52Device}
                  devEditMode={devEditMode}
                  setDevEditMode={setDevEditMode}
                  isDevMode={import.meta.env.DEVELOPMENT_MODE === 'true' || import.meta.env.MODE === 'development' || import.meta.env.NODE_ENV === 'development'}
                  dragged={dragged}
                  setDragged={setDragged}
                  disableAssignmentMenuFiltering={TEMP_ASSIGNMENT_MENU_FILTER_BYPASS}
                />
              </Box>
            </KeyPressIndicator>
          </Box>
        ) : (
          <>
            <Box>
              <Title order={3} mb={4}>Profile Bindings Table</Title>
              <Text size="sm" c="dimmed">
                Feature-to-input bindings from the selected Star Citizen profile, local edits, and OmniCore per-mode HOTAS overrides.
              </Text>
            </Box>

            <Stack gap="xs">
              <Box
                p="sm"
                style={{
                  borderRadius: 8,
                  border: '1px solid rgba(0, 217, 255, 0.2)',
                  background: 'rgba(0, 217, 255, 0.04)',
                }}
              >
                <Text size="sm" fw={700} mb={8}>Filters</Text>
                <Stack gap="xs">
                  {filterControls}
                  <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                    <Group gap="sm" align="center" wrap="wrap">
                      <SegmentedControl
                        value={bindingLayout}
                        onChange={setBindingLayout}
                        size="xs"
                        data={[
                          { label: 'Single HOTAS', value: 'single' },
                          { label: 'Per-Mode', value: 'modes' },
                        ]}
                      />
                      {bindingLayout === 'modes' && (
                        <SegmentedControl
                          value={activeBindingMode}
                          onChange={setActiveBindingMode}
                          size="xs"
                          data={[
                            { label: 'Green', value: 'green' },
                            { label: 'Orange', value: 'orange' },
                            { label: 'Red', value: 'red' },
                          ]}
                        />
                      )}
                      <SegmentedControl
                        value={tableView}
                        onChange={setTableView}
                        size="xs"
                        data={[
                          { value: 'features', label: 'Features \u2192 Inputs' },
                          { value: 'inputs', label: 'Inputs \u2192 Features' },
                        ]}
                      />
                    </Group>
                    <Group gap="sm" align="center">
                      <Text size="xs" c="dimmed" fw={600}>
                        {sortedBindings.length} binding{sortedBindings.length !== 1 ? 's' : ''}
                      </Text>
                      {isDevRuntime && (
                        <Text size="xs" c="dimmed">
                          filter {filterPerfRef.current.baseMs.toFixed(1)}ms + final {filterPerfRef.current.finalMs.toFixed(1)}ms
                        </Text>
                      )}
                    </Group>
                  </Group>
                </Stack>
              </Box>
            </Stack>

            {tableView === 'features' ? (
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
                activeModeCaptureKey={captureBindingId && captureModeKey ? `${captureBindingId}:${captureModeKey}` : ''}
                captureProgress={captureProgress}
                showModeColumns={bindingLayout === 'modes'}
                onStartKeyboardCapture={startKeyboardCapture}
                onStartModeHotasCapture={startHotasCapture}
                activeKeyboardCaptureBindingId={captureKeyboardBindingId}
                keyboardCaptureProgress={captureKeyboardProgress}
                trainingNotes={featureTrainingNotes}
              />
            ) : (
              <HOTASInputView
                bindings={modeGroupFilteredEffectiveBindings}
                allBindings={allEffectiveBindings}
                hotasOverrides={hotasOverrides}
                bindingFilter={profileFilter}
                deviceFilter={profileFilter}
                searchQuery={searchQuery}
                hideStickFeatures={hideStickFeatures}
                showHideStickToggle={false}
                disableAssignmentMenuFiltering={TEMP_ASSIGNMENT_MENU_FILTER_BYPASS}
                onAssign={handleAssignHotasFeature}
                onClear={handleClearHotasFeature}
              />
            )}

            <HOTASNotesSection />
          </>
        )}
      </Stack>
  );
}
