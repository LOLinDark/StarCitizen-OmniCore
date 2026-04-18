/**
 * useHotasInput – React hook wrapping GamepadPoller
 *
 * Provides real-time HOTAS + keyboard input state to React components.
 * Starts/stops polling based on `enabled` flag (or call start/stop manually).
 *
 * @example
 * const {
 *   gamepadConnected, gamepadInfo,
 *   lastInput, inputHistory,
 *   axisValues, currentMode, activeInputs,
 *   isMonitoring, startMonitoring, stopMonitoring, clearHistory,
 * } = useHotasInput({ enabled: true, device: LogitechX52Device });
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GamepadPoller } from './GamepadPoller.js';
import LogitechX52Device from '../devices/LogitechX52.js';

/**
 * @typedef {object} HotasInputState
 * @property {boolean}         gamepadConnected
 * @property {Gamepad|null}    gamepadInfo
 * @property {object|null}     lastInput           – Most recent event object
 * @property {object[]}        inputHistory        – Ring buffer of last N events
 * @property {object}          axisValues          – Map of axis index → current value string
 * @property {number}          currentMode         – 0=Red, 1=Purple, 2=Blue
 * @property {Set<string>}     activeInputs        – Set of currently active input keys
 * @property {boolean}         isMonitoring
 * @property {function}        startMonitoring
 * @property {function}        stopMonitoring
 * @property {function}        clearHistory
 */

/**
 * @param {object}  options
 * @param {boolean} [options.enabled=false]     – Auto-start monitoring on mount
 * @param {boolean} [options.trackKeyboard=true] – Also capture keyboard events
 * @param {object}  [options.device]            – Device descriptor; defaults to LogitechX52Device
 * @param {number}  [options.historyLimit=50]   – Max events in history
 * @returns {HotasInputState}
 */
export function useHotasInput({
  enabled = false,
  trackKeyboard = true,
  device = LogitechX52Device,
  historyLimit = 50,
} = {}) {
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [gamepadInfo, setGamepadInfo]           = useState(null);
  const [lastInput, setLastInput]               = useState(null);
  const [inputHistory, setInputHistory]         = useState([]);
  const [axisValues, setAxisValues]             = useState({});
  const [currentMode, setCurrentMode]           = useState(0);
  const [activeInputs, setActiveInputs]         = useState(new Set());
  const [isMonitoring, setIsMonitoring]         = useState(false);

  // Keep a stable poller instance across renders
  const pollerRef = useRef(null);
  // Active inputs set — use ref to avoid stale closure in RAF
  const activeInputsRef = useRef(new Set());

  // ─── Poller event handlers ───────────────────────────────────────────────

  const attachPollerHandlers = useCallback((poller) => {
    poller.on('connected', ({ gamepad }) => {
      setGamepadConnected(true);
      setGamepadInfo(gamepad);
    });

    poller.on('disconnected', () => {
      setGamepadConnected(false);
      setGamepadInfo(null);
      activeInputsRef.current = new Set();
      setActiveInputs(new Set());
      setAxisValues({});
    });

    poller.on('buttonPressed', (e) => {
      const key = `button-${e.index}`;
      activeInputsRef.current = new Set([...activeInputsRef.current, key]);
      setActiveInputs(new Set(activeInputsRef.current));
      setLastInput(e);
      setInputHistory((prev) => [e, ...prev.slice(0, historyLimit - 1)]);
    });

    poller.on('buttonReleased', (e) => {
      const key = `button-${e.index}`;
      const next = new Set(activeInputsRef.current);
      next.delete(key);
      activeInputsRef.current = next;
      setActiveInputs(new Set(next));
      setLastInput(e);
      setInputHistory((prev) => [e, ...prev.slice(0, historyLimit - 1)]);
    });

    poller.on('axisChanged', (e) => {
      const key = `axis-${e.index}`;
      // Update axis display values
      setAxisValues((prev) => {
        if (e.action === 'Released') {
          const next = { ...prev };
          delete next[e.index];
          return next;
        }
        return { ...prev, [e.index]: parseFloat(e.value).toFixed(3) };
      });
      // Update active set
      const next = new Set(activeInputsRef.current);
      if (e.action === 'Released') {
        next.delete(key);
      } else {
        next.add(key);
      }
      activeInputsRef.current = next;
      setActiveInputs(new Set(next));
      setLastInput(e);
      setInputHistory((prev) => [e, ...prev.slice(0, historyLimit - 1)]);
    });

    poller.on('hatChanged', (e) => {
      const key = `button-${e.index}`;
      const next = new Set(activeInputsRef.current);
      if (e.action === 'Released') {
        next.delete(key);
      } else {
        next.add(key);
      }
      activeInputsRef.current = next;
      setActiveInputs(new Set(next));
      setLastInput(e);
      setInputHistory((prev) => [e, ...prev.slice(0, historyLimit - 1)]);
    });
  }, [historyLimit]);

  // ─── Keyboard listener ───────────────────────────────────────────────────

  useEffect(() => {
    if (!trackKeyboard) return;

    const handleKeyDown = (e) => {
      if (!isMonitoring) return;
      const event = {
        id: Date.now() + Math.random(),
        type: 'KeyDown',
        action: 'Pressed',
        key: e.key,
        code: e.code,
        name: e.key,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastInput(event);
      setInputHistory((prev) => [event, ...prev.slice(0, historyLimit - 1)]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMonitoring, trackKeyboard, historyLimit]);

  // ─── Poll gamepad info every RAF frame while monitoring ──────────────────
  // (for live axis display that isn't event-driven)

  useEffect(() => {
    if (!isMonitoring) return;
    let rafId;
    const syncInfo = () => {
      const gamepads = navigator.getGamepads?.() ?? [];
      const gp = gamepads[0];
      if (gp) {
        setGamepadConnected(true);
        setGamepadInfo(gp);
        // Update continuous axis display
        setAxisValues((prev) => {
          const next = { ...prev };
          gp.axes.forEach((v, i) => {
            if (i === 9) return; // HAT handled by events
            if (typeof v === 'number' && v >= -1 && v <= 1) {
              next[i] = v.toFixed(3);
            }
          });
          return next;
        });
      } else {
        setGamepadConnected(false);
        setGamepadInfo(null);
      }
      rafId = requestAnimationFrame(syncInfo);
    };
    rafId = requestAnimationFrame(syncInfo);
    return () => cancelAnimationFrame(rafId);
  }, [isMonitoring]);

  // ─── Monitoring controls ─────────────────────────────────────────────────

  const startMonitoring = useCallback(() => {
    if (pollerRef.current) return; // already running
    const poller = new GamepadPoller({ device, historyLimit });
    attachPollerHandlers(poller);
    pollerRef.current = poller;
    poller.start();
    setIsMonitoring(true);
    navigator.getGamepads?.(); // kick browser into noticing connected devices
  }, [device, historyLimit, attachPollerHandlers]);

  const stopMonitoring = useCallback(() => {
    pollerRef.current?.stop();
    pollerRef.current = null;
    setIsMonitoring(false);
    activeInputsRef.current = new Set();
    setActiveInputs(new Set());
    setAxisValues({});
  }, []);

  const clearHistory = useCallback(() => {
    setInputHistory([]);
    setLastInput(null);
  }, []);

  // Auto-start when `enabled` prop changes
  useEffect(() => {
    if (enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    return () => {
      pollerRef.current?.stop();
      pollerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    gamepadConnected,
    gamepadInfo,
    lastInput,
    inputHistory,
    axisValues,
    currentMode,
    setCurrentMode,
    activeInputs,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearHistory,
  };
}

export default useHotasInput;
