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
  Select,
  TextInput,
  Text,
  Box,
  Badge,
  Switch,
  SegmentedControl,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import { HOTASTable } from '../components/HOTASTable';
import HOTASInputView from '../components/HOTASInputView';
import ProfileCardScroller from '../components/ProfileCardScroller';
import { KeyPressIndicator } from '../components/KeyPressIndicator';
import { useHOTASFiltering } from '../hooks/useHOTASFiltering';
import { shipKeybindings, shipControlsCategories } from '../data/starcitizen-keybindings';
import { logitechX52ProOptimal } from '../utils/defaultProfiles';
import { StarCitizenProfileParser } from '../utils/starCitizenProfileParser';

import { featureToStarCitizenAction, parseInputString, formatInputForDisplay } from '../utils/starCitizenActionMap';
import { useHotasInput, LogitechX52Device } from '../libraries/hotas';
import { fetchProfileModeOverrides, saveProfileModeOverrides } from '../libraries/peripherals/hotas';
import DevTag from '../components/DevTag';
import HC05LiveInputContainer from '../containers/HC05LiveInputContainer';
import { normalizeText, getInputKind, getInputAction } from '../utils/hotasUtils';
import { formatHotasBindingFromInput, formatHotasInputForXml } from '../utils/hotasInputFormatters';

const HOTAS_MODE_KEYS = ['green', 'orange', 'red'];

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
      const [searchByLiveInput, setSearchByLiveInput] = useState(false);
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

  const handleAssignHotasFeature = useCallback((bindingId, xmlToken) => {
    if (bindingLayout === 'modes') {
      setModeHotasOverrides((prev) => ({
        ...prev,
        [activeBindingMode]: {
          ...(prev[activeBindingMode] || {}),
          [bindingId]: xmlToken,
        },
      }));
      return;
    }

    setHotasOverrides((prev) => ({ ...prev, [bindingId]: xmlToken }));
    void persistCapturedBindingToXml(bindingId, xmlToken);
  }, [activeBindingMode, bindingLayout, persistCapturedBindingToXml]);

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
      console.error('[HC05] Failed to load mode overrides:', error);
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
      const savedState = localStorage.getItem('omnicore.hc05.state');
      if (!savedState) return;

      const {
        selectedProfile: savedProfile,
        selectedCategory: savedCategory,
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
        console.log('[HC05] Restoring profile from localStorage:', savedProfile);
        handleLoadProfile(savedProfile);
      }
    } catch (error) {
      console.error('[HC05] Error restoring state from localStorage:', error);
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
        bindingLayout,
        activeBindingMode,
        hotasOverrides,
        modeHotasOverrides,
        keyboardOverrides,
      };
      localStorage.setItem('omnicore.hc05.state', JSON.stringify(stateToSave));
      console.log('[HC05] State saved to localStorage');
    } catch (error) {
      console.error('[HC05] Error saving state to localStorage:', error);
    }
  }, [selectedProfile, selectedCategory, bindingLayout, activeBindingMode, hotasOverrides, modeHotasOverrides, keyboardOverrides]);

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
          console.error('[HC05] Failed to save mode overrides:', error);
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

  const applyBindingOverrides = useCallback((bindings = []) => {
    if (!Array.isArray(bindings) || bindings.length === 0) return [];
    return bindings.map((binding) => {
      const selectedModeBinding = modeHotasOverrides[activeBindingMode]?.[binding.id] || '';
      const hotasOverride = (bindingLayout === 'modes' ? selectedModeBinding : hotasOverrides[binding.id]) || hotasOverrides[binding.id];
      const keyboardOverride = keyboardOverrides[binding.id];
      const modeBindings = {
        green: modeHotasOverrides.green?.[binding.id] || '',
        orange: modeHotasOverrides.orange?.[binding.id] || '',
        red: modeHotasOverrides.red?.[binding.id] || '',
      };

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

  // Filter by bound/unbound status
  const sortedBindings = useMemo(() => {
    let results = effectiveBindings;

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

    return results;
  }, [effectiveBindings, profileFilter, searchByLiveInput, lastHotasInput, isBindingLive]);

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
    if (newProfileName === '__ai_x52_optimal') {
      console.log('[HC05] Loading AI-generated X52 Optimal profile');
      setSelectedProfile(newProfileName);
      setProfileName(logitechX52ProOptimal.profileName);
      setHotasOverrides({});
      await loadModeOverridesForProfile(newProfileName);
      setKeyboardOverrides({});
      savedHotasOverridesRef.current = null;
      savedKeyboardOverridesRef.current = null;
      setXmlSaveStatus('idle');
      setXmlSaveMessage('');
      setModeOverridesSaveStatus('idle');
      setModeOverridesSaveMessage('');
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
      console.log(`[HC05] Loading profile: ${newProfileName}`);
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
      console.log(`[HC05] Profile loaded:`, data.profile);
      console.log('[HC05] Profile content length:', data.xmlContent?.length);
      
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
          await loadModeOverridesForProfile(newProfileName);
        } catch (parseError) {
          console.error('[HC05] Error parsing profile XML:', parseError);
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
      console.error(`[HC05] Error loading profile:`, error);
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
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      categoryList={categoryList}
      profileFilter={profileFilter}
      setProfileFilter={setProfileFilter}
      searchByLiveInput={searchByLiveInput}
      setSearchByLiveInput={setSearchByLiveInput}
    />
  );

  return (
    <Stack gap="xl">
        {/* Header + Profiles + Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}><DevTag tag="HC05" />Peripheral Config</h1>
            {profileName && (
              <Text size="lg" fw={600} style={{ marginBottom: '0.5rem', color: '#1e90ff' }}>
                {profileName}
              </Text>
            )}
            <Text c="dimmed" mb="md">Configure your flight stick, mouse, and keyboard for precision control</Text>
            {/* Profile Card Scroller — between header and banner */}
            <ProfileCardScroller
              profiles={profiles}
              selectedProfile={selectedProfile}
              onSelect={handleLoadProfile}
              aiProfiles={[
                { value: '__ai_x52_optimal', name: '__ai_x52_optimal', label: logitechX52ProOptimal.profileName, meta: { color: '#b300ff', gameMode: 'default', description: 'AI-generated optimal X52 layout' } },
              ]}
            />
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
              alt="Technology Config themed HOTAS setup"
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


        {/* Live Input Panel (restored) */}
        <Box mb="xl">
          <KeyPressIndicator
            title="HC05 Live Input"
            inputLabel={liveInputLabel}
            assignmentLabel={inputAssignmentLabel}
            connected={gamepadConnected}
            rawInput={lastHotasInput}
            activeInputs={activeInputs}
            axisValues={axisValues}
            gamepadInfo={gamepadInfo}
          >
            <Box mt="md">
              <HC05LiveInputContainer
                overlays={overlays}
                onOverlayChange={setOverlays}
                keybindings={allEffectiveBindings}
                hotasOverrides={hotasOverrides}
                bindingLayout={bindingLayout}
                onAssignFeature={handleAssignHotasFeature}
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
              />
              {/* Dev-only toggle for overlay edit mode moved to HC05LiveInputContainer */}
            </Box>
          </KeyPressIndicator>
        </Box>

        {/* Filters — above table, below live input */}
        {filterControls}

        {/* Info Bar (extracted) */}
        <HOTASInfoBar
          selectedProfile={selectedProfile}
          xmlSaveStatus={xmlSaveStatus}
          xmlSaveMessage={xmlSaveMessage}
          modeOverridesSaveStatus={modeOverridesSaveStatus}
          modeOverridesSaveMessage={modeOverridesSaveMessage}
          showModeOverridesStatus={bindingLayout === 'modes'}
          captureWarning={captureWarning}
          sortedBindings={sortedBindings}
        />

        <Group justify="space-between" align="end" wrap="wrap" mt="sm" mb="xs">
          <Box>
            <Text size="xs" c="dimmed" mb={4}>HOTAS Column Layout</Text>
            <SegmentedControl
              value={bindingLayout}
              onChange={setBindingLayout}
              data={[
                { label: 'Single HOTAS', value: 'single' },
                { label: 'Per-Mode HOTAS', value: 'modes' },
              ]}
            />
          </Box>

          {bindingLayout === 'modes' && (
            <Box>
              <Text size="xs" c="dimmed" mb={4}>Active Mode Column</Text>
              <SegmentedControl
                value={activeBindingMode}
                onChange={setActiveBindingMode}
                data={[
                  { label: 'Green', value: 'green' },
                  { label: 'Orange', value: 'orange' },
                  { label: 'Red', value: 'red' },
                ]}
              />
            </Box>
          )}
        </Group>

        {/* View Switcher (extracted) */}
        <HOTASViewSwitcher tableView={tableView} setTableView={setTableView} />

        {/* Table */}
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
          />
        ) : (
          <HOTASInputView
            bindings={effectiveBindings}
            hotasOverrides={hotasOverrides}
            bindingFilter={profileFilter}
            deviceFilter={profileFilter}
            searchQuery={searchQuery}
            onAssign={handleAssignHotasFeature}
          />
        )}

        {/* Notes Section (extracted) */}
        <HOTASNotesSection />
      </Stack>
  );
}
