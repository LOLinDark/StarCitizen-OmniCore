/**
 * GamepadPoller – core Gamepad API polling engine
 *
 * Completely decoupled from React. Runs a requestAnimationFrame loop and emits
 * events via callbacks. Consumers (React hooks, plain JS) subscribe to events.
 *
 * Events emitted:
 *   'connected'       – { gamepad }
 *   'disconnected'    – { gamepadIndex }
 *   'buttonPressed'   – { index, name, gamepadIndex }
 *   'buttonReleased'  – { index, name, gamepadIndex }
 *   'axisChanged'     – { index, name, value, previousValue, gamepadIndex }
 *   'hatChanged'      – { index, dir, label, gamepadIndex }          ← POV HAT axis
 *   'modeChanged'     – { mode, gamepadIndex }
 *
 * Usage:
 *   const poller = new GamepadPoller({ device: LogitechX52Device });
 *   poller.on('buttonPressed', ({ index, name }) => console.log(name));
 *   poller.start();
 *   // ...
 *   poller.stop();
 */

import { decodePovHat, getButtonMeta, getAxisMeta } from '../devices/LogitechX52.js';

// Default options
const DEFAULTS = {
  /** Index of the POV HAT axis (axis 9 on X52) */
  povAxisIndex: 9,
  /** Dead zone for primary stick/throttle axes */
  stickDeadzone: 0.15,
  /** Minimum change threshold for continuous axes (rotary, slider) */
  continuousAxisThreshold: 0.05,
  /** Axis indices treated as continuous (rotary/slider) vs binary edge-detect */
  continuousAxes: [3, 4, 6],
  /** History ring buffer length */
  historyLimit: 50,
};

export class GamepadPoller {
  /**
   * @param {object} options
   * @param {object} [options.device]            – Device descriptor (LogitechX52Device etc.)
   * @param {number} [options.povAxisIndex]      – Axis index used for POV HAT
   * @param {number} [options.stickDeadzone]     – Dead zone for binary axes
   * @param {number} [options.continuousAxisThreshold] – Min change for continuous axes
   * @param {number[]} [options.continuousAxes]  – Axis indices to treat as continuous
   * @param {number} [options.historyLimit]      – Max events kept in history
   */
  constructor(options = {}) {
    this._opts = { ...DEFAULTS, ...options };
    this._device = options.device ?? null;

    // Per-gamepad state maps (keyed by gamepad.index)
    this._buttonState = {};   // { [gpIdx]: { [btnIdx]: boolean } }
    this._axisState   = {};   // { [gpIdx]: { [axIdx]: number } }
    this._povState    = {};   // { [gpIdx]: { [dir]: boolean, rawValue: number|null } }

    this._listeners = {};
    this._rafId = null;
    this._running = false;

    this._history = []; // flat event history ring-buffer

    // Bind so we can cleanly remove the exact same function reference
    this._onGamepadConnected    = this._onGamepadConnected.bind(this);
    this._onGamepadDisconnected = this._onGamepadDisconnected.bind(this);
    this._poll = this._poll.bind(this);
  }

  // ─────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────

  /** Register an event listener. Returns `this` for chaining. */
  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
    return this;
  }

  /** Remove a previously registered listener. */
  off(event, handler) {
    if (!this._listeners[event]) return this;
    this._listeners[event] = this._listeners[event].filter((h) => h !== handler);
    return this;
  }

  /** Start polling. Safe to call multiple times. */
  start() {
    if (this._running) return;
    this._running = true;
    window.addEventListener('gamepadconnected',    this._onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected);
    // Trigger initial detection for already-connected gamepads
    navigator.getGamepads?.();
    this._rafId = requestAnimationFrame(this._poll);
  }

  /** Stop polling and clean up all listeners. */
  stop() {
    this._running = false;
    window.removeEventListener('gamepadconnected',    this._onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this._onGamepadDisconnected);
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /** Snapshot of the last N events */
  get history() {
    return [...this._history];
  }

  /** True while the RAF loop is running */
  get isRunning() {
    return this._running;
  }

  // ─────────────────────────────────────────
  // Internal – gamepad connection events
  // ─────────────────────────────────────────

  _onGamepadConnected(e) {
    this._emit('connected', { gamepad: e.gamepad });
  }

  _onGamepadDisconnected(e) {
    const idx = e.gamepad.index;
    delete this._buttonState[idx];
    delete this._axisState[idx];
    delete this._povState[idx];
    this._emit('disconnected', { gamepadIndex: idx });
  }

  // ─────────────────────────────────────────
  // Internal – RAF polling loop
  // ─────────────────────────────────────────

  _poll() {
    if (!this._running) return;

    const gamepads = navigator.getGamepads?.() ?? [];
    for (const gamepad of gamepads) {
      if (!gamepad) continue;
      this._processGamepad(gamepad);
    }

    this._rafId = requestAnimationFrame(this._poll);
  }

  _processGamepad(gamepad) {
    const gIdx = gamepad.index;

    // Ensure per-gamepad state objects exist
    if (!this._buttonState[gIdx]) this._buttonState[gIdx] = {};
    if (!this._axisState[gIdx])   this._axisState[gIdx]   = {};
    if (!this._povState[gIdx]) {
      this._povState[gIdx] = {
        n: false, ne: false, e: false, se: false,
        s: false, sw: false, w: false, nw: false,
        rawValue: null,
      };
    }

    this._processButtons(gamepad, gIdx);
    this._processAxes(gamepad, gIdx);
  }

  // ─────────────────────────────────────────
  // Buttons
  // ─────────────────────────────────────────

  _processButtons(gamepad, gIdx) {
    gamepad.buttons.forEach((btn, index) => {
      const isPressed  = btn.pressed;
      const wasPressed = this._buttonState[gIdx][index] ?? false;
      this._buttonState[gIdx][index] = isPressed;

      const meta = this._device ? this._device.getButtonMeta(index) : getButtonMeta(index);
      const displayIndex = Number.isInteger(meta?.windowsIndex) ? meta.windowsIndex : index + 1;

      if (isPressed && !wasPressed) {
        this._record({ type: 'Button', action: 'Pressed', index, displayIndex, name: meta.name, gamepadIndex: gIdx });
        this._emit('buttonPressed', { index, displayIndex, name: meta.name, meta, gamepadIndex: gIdx });
      } else if (!isPressed && wasPressed) {
        this._record({ type: 'Button', action: 'Released', index, displayIndex, name: meta.name, gamepadIndex: gIdx });
        this._emit('buttonReleased', { index, displayIndex, name: meta.name, meta, gamepadIndex: gIdx });
      }
    });
  }

  // ─────────────────────────────────────────
  // Axes
  // ─────────────────────────────────────────

  _processAxes(gamepad, gIdx) {
    const { povAxisIndex, continuousAxes, continuousAxisThreshold, stickDeadzone } = this._opts;

    gamepad.axes.forEach((value, index) => {
      // Reject garbage values outside valid range
      if (typeof value !== 'number' || value < -1 || value > 1) return;

      // POV HAT gets its own handler
      if (index === povAxisIndex) {
        this._processPovHat(value, gIdx);
        return;
      }

      const previousValue = this._axisState[gIdx][index] ?? 0;
      this._axisState[gIdx][index] = value;

      const meta = this._device ? this._device.getAxisMeta(index) : getAxisMeta(index);

      if (continuousAxes.includes(index)) {
        // Rotary / slider: emit on significant value change
        if (Math.abs(value - previousValue) >= continuousAxisThreshold) {
          const event = { index, name: meta.name, meta, value, previousValue, gamepadIndex: gIdx };
          this._record({ type: 'Axis', action: 'Value Changed', ...event });
          this._emit('axisChanged', event);
        }
      } else {
        // Stick / throttle: edge detection crossing dead zone
        const isActive      = Math.abs(value) > stickDeadzone;
        const wasActive     = Math.abs(previousValue) > stickDeadzone;
        if (isActive !== wasActive) {
          const event = { index, name: meta.name, meta, value, previousValue, gamepadIndex: gIdx };
          this._record({ type: 'Axis', action: isActive ? 'Engaged' : 'Released', ...event });
          this._emit('axisChanged', event);
        }
      }
    });
  }

  // ─────────────────────────────────────────
  // POV HAT (axis 9 analogue → 8-way)
  // ─────────────────────────────────────────

  _processPovHat(value, gIdx) {
    const decodeDir = this._device?.decodePovHat ?? decodePovHat;
    const current = decodeDir(value);

    const DIRS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    const newState = Object.fromEntries(DIRS.map((d) => [d, d === current]));
    const prev     = this._povState[gIdx];

    DIRS.forEach((dir) => {
      const label = dir.toUpperCase();
      if (newState[dir] && !prev[dir]) {
        const event = { index: `9-hat-${dir}`, dir, label: `POV HAT ${label}`, gamepadIndex: gIdx };
        this._record({ type: 'Button', action: 'Pressed',  name: `POV HAT ${label}`, ...event });
        this._emit('hatChanged', { ...event, action: 'Pressed' });
      } else if (!newState[dir] && prev[dir]) {
        const event = { index: `9-hat-${dir}`, dir, label: `POV HAT ${label}`, gamepadIndex: gIdx };
        this._record({ type: 'Button', action: 'Released', name: `POV HAT ${label}`, ...event });
        this._emit('hatChanged', { ...event, action: 'Released' });
      }
    });

    this._povState[gIdx] = { ...newState, rawValue: value };
  }

  // ─────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────

  _emit(event, payload = {}) {
    const handlers = this._listeners[event] ?? [];
    handlers.forEach((h) => h({ ...payload, timestamp: new Date().toLocaleTimeString() }));
  }

  _record(entry) {
    const event = { id: Date.now() + Math.random(), ...entry, timestamp: new Date().toLocaleTimeString() };
    this._history.unshift(event);
    if (this._history.length > this._opts.historyLimit) {
      this._history.length = this._opts.historyLimit;
    }
  }
}

export default GamepadPoller;
