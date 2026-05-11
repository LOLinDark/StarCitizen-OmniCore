/**
 * Logitech X52 HOTAS Device Definition
 * Complete button, axis, and HAT switch mapping for the X52 (non-Pro)
 * Based on empirical testing with Gamepad API browser mapping
 *
 * INDEXING CONVENTION (CRITICAL):
 * ──────────────────────────────
 * This is the single source of truth. All three systems are related:
 *
 * 1. Browser Gamepad API: 0-based indexing
 *    └─ navigator.getGamepads()[0].buttons[INDEX] where INDEX ∈ [0, 1, 2, ..., 31]
 *    └─ Used in: X52_BUTTONS keys, gamepadPoller events, useHotasInput activeInputs
 *
 * 2. Windows Game Controller: 1-based numbering  
 *    └─ Device Manager shows "Button 1", "Button 2", ..., "Button 32"
 *    └─ Usually Windows number = Gamepad index + 1, but the X52 browser mapping has a gap
 *       before the mode switch positions, so some controls need explicit windowsIndex metadata.
 *    └─ Used in: Windows settings, Game Controller test utility, xml tokens
 *
 * 3. UI Display (Bxx badges): Windows 1-based format
 *    └─ Bxx should align with Windows button numbers in UI and hover tooltips
 *    └─ Use explicit windowsIndex overrides when browser and Windows differ
 *
 * STORE EVERYTHING IN GAMEPAD 0-BASED, CONVERT ONLY AT DISPLAY TIME.
 *
 * Physical layout:
 *   Stick: Hair trigger, Safe, A, B, C, Pinkie (modifier), POV HAT, Trigger Full
 *   Throttle: D, E, T1-T6 toggles, HAT 1/2/3, Mouse btn
 *   Axes: X (yaw), Y (pitch), Z-Rot (roll), Throttle, Rotary1, Rotary2, Slider
 *   POV HAT: Reported as axis 9 with analogue values (–1 → +1)
 */

export const X52_DEVICE_ID = 'logitech-x52';
export const X52_NAME = 'Logitech X52 HOTAS';
export const X52_VENDOR_ID = '0x06A3'; // Logitech
export const X52_PRODUCT_ID = '0x0255';

// ─────────────────────────────────────────────
// Button Index Map (Gamepad API 0-based index → metadata)
// Keys are Gamepad API indices (0–31). Never use Windows 1-based here.
// ─────────────────────────────────────────────
export const X52_BUTTONS = {
  // ── Joystick / Stick ───────────────────────
  0:  { name: 'Hair Trigger',           group: 'Stick',      type: 'button', code: 'BTN_STICK_TRIG', windowsIndex: 1,      note: 'Light pull' },
  1:  { name: 'Safe Button',            group: 'Stick',      type: 'button', code: 'BTN_STICK_SAFE', windowsIndex: 2 },
  2:  { name: 'Button A',               group: 'Stick',      type: 'button', code: 'BTN_STICK_A', windowsIndex: 3 },
  3:  { name: 'Button B',               group: 'Stick',      type: 'button', code: 'BTN_STICK_B', windowsIndex: 4 },
  4:  { name: 'Button C',               group: 'Stick',      type: 'button', code: 'BTN_STICK_C', windowsIndex: 5 },
  5:  { name: 'Pinkie Switch',          group: 'Stick',      type: 'button', code: 'BTN_PINKIE', windowsIndex: 6,          note: 'Modifier – doubles all other buttons' },
  14: { name: 'Trigger Full Press',     group: 'Stick',      type: 'button', code: 'BTN_STICK_TRIG_FULL', windowsIndex: 15, note: 'Full squeeze' },

  // ── Throttle / Grip ─────────────────────────
  6:  { name: 'D',                      group: 'Throttle',   type: 'button', code: 'BTN_THR_D', windowsIndex: 7,         note: 'Also labelled Fire D in manufacturer documentation' },
  7:  { name: 'Button E',               group: 'Throttle',   type: 'button', code: 'BTN_THR_E', windowsIndex: 8 },

  // ── Toggle Switches (T1–T6) ─────────────────
  8:  { name: 'Toggle T1',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T1', windowsIndex: 9 },
  9:  { name: 'Toggle T2',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T2', windowsIndex: 10 },
  10: { name: 'Toggle T3',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T3', windowsIndex: 11 },
  11: { name: 'Toggle T4',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T4', windowsIndex: 12 },
  12: { name: 'Toggle T5',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T5', windowsIndex: 13 },
  13: { name: 'Toggle T6',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T6', windowsIndex: 14 },

  // ── Stick HAT 1 (4-way buttons in this browser mapping) ────────────────
  15: { name: 'HAT 1 North',            group: 'Stick HAT',  type: 'button', code: 'HAT_1_N', windowsIndex: 16 },
  16: { name: 'HAT 1 East',             group: 'Stick HAT',  type: 'button', code: 'HAT_1_E', windowsIndex: 17 },
  17: { name: 'HAT 1 South',            group: 'Stick HAT',  type: 'button', code: 'HAT_1_S', windowsIndex: 18 },
  18: { name: 'HAT 1 West',             group: 'Stick HAT',  type: 'button', code: 'HAT_1_W', windowsIndex: 19 },

  // ── HAT 2 is the POV HAT (axis 9) — no discrete button indices ───────────

  // ── Throttle HAT 3 (4-way discrete buttons) ────────────────────────────
  19: { name: 'HAT 3 North',            group: 'Throttle HAT', type: 'button', code: 'HAT_3_N', windowsIndex: 20 },
  20: { name: 'HAT 3 East',             group: 'Throttle HAT', type: 'button', code: 'HAT_3_E', windowsIndex: 21 },
  21: { name: 'HAT 3 South',            group: 'Throttle HAT', type: 'button', code: 'HAT_3_S', windowsIndex: 22 },
  22: { name: 'HAT 3 West',             group: 'Throttle HAT', type: 'button', code: 'HAT_3_W', windowsIndex: 23 },

  // ── Mode Switches (3-position) ────────────────
  // Explicit, fixed mapping from raw gamepad indices to Windows button numbers.
  23: { name: 'Mode 1 Switch',          group: 'Mode',       type: 'button', code: 'BTN_MODE_1', windowsIndex: 24, aliases: ['Button 24'], note: 'Green mode – primary keyset' },
  24: { name: 'Mode 2 Switch',          group: 'Mode',       type: 'button', code: 'BTN_MODE_2', windowsIndex: 25, aliases: ['Button 25'], note: 'Orange mode – secondary keyset' },
  25: { name: 'Mode 3 Switch',          group: 'Mode',       type: 'button', code: 'BTN_MODE_3', windowsIndex: 26, aliases: ['Button 26'], note: 'Red mode – tertiary keyset' },
  26: { name: 'Function',               group: 'MFD',        type: 'button', code: 'BTN_MFD_FUNCTION', windowsIndex: 27, aliases: ['Button 27'], note: 'MFD Function button' },

  // ── Extended / Mode-shifted ─────────────────
  27: { name: 'Start/Stop Timer',       group: 'MFD',        type: 'button', code: 'BTN_MFD_TIMER_TOGGLE', windowsIndex: 28, aliases: ['Button 28'], note: 'MFD timer start/stop control' },
  28: { name: 'Reset Timer',            group: 'MFD',        type: 'button', code: 'BTN_MFD_TIMER_RESET', windowsIndex: 29, aliases: ['Button 29'], note: 'MFD timer reset control' },
  29: { name: 'Information (i) / Clutch', group: 'MFD',      type: 'button', code: 'BTN_MFD_INFO_CLUTCH', windowsIndex: 30, aliases: ['Button 30', 'Clutch', 'Information'] , note: 'MFD info/clutch button' },
  30: { name: 'Mouse Button',           group: 'Throttle',   type: 'button', code: 'BTN_THR_MOUSE', windowsIndex: 31 },
  31: { name: 'Button 32 (Extended)',   group: 'Extended',   type: 'button', code: 'BTN_EXT_32', windowsIndex: 32 },
};

// ─────────────────────────────────────────────
// Axis Map (Gamepad API index → metadata)
// ─────────────────────────────────────────────
export const X52_AXES = {
  0: { name: 'X Axis (Yaw/Roll)',   group: 'Stick',    type: 'axis',   code: 'AX_X',    range: [-1, 1], deadzone: 0.05 },
  1: { name: 'Y Axis (Pitch)',      group: 'Stick',    type: 'axis',   code: 'AX_Y',    range: [-1, 1], deadzone: 0.05 },
  // Empirical browser mapping from hardware tests:
  // 2 = throttle, 3 = small rotary, 5 = stick twist (Z rotation)
  2: { name: 'Z Axis (Throttle)',   group: 'Throttle', type: 'axis',   code: 'AX_THR',  range: [-1, 1], deadzone: 0.02, note: '-1=idle, 1=full' },
  3: { name: 'Rotary 2 (Small)',    group: 'Throttle', type: 'slider', code: 'AX_ROT2', range: [-1, 1], deadzone: 0.02 },
  4: { name: 'Rotary 1 (Large)',    group: 'Throttle', type: 'slider', code: 'AX_ROT1', range: [-1, 1], deadzone: 0.02 },
  5: { name: 'Z Rotation (Twist)',  group: 'Stick',    type: 'axis',   code: 'AX_Z',    range: [-1, 1], deadzone: 0.05 },
  6: { name: 'Slider',              group: 'Throttle', type: 'slider', code: 'AX_SLD',  range: [-1, 1], deadzone: 0.02 },
  // Axis 9 is the POV HAT reported as an analogue axis
  9: { name: 'POV HAT (Look)',      group: 'Look Around', type: 'hat', code: 'AX_POV', range: [-1, 1], note: 'Analogue-encoded 8-way HAT' },
};

// ─────────────────────────────────────────────
// POV HAT Axis-9 Value → Direction Map
// Empirical values from hardware testing
// ─────────────────────────────────────────────
export const X52_POV_DIRECTIONS = [
  { dir: 'n',  label: 'North',     min: -1.000, max: -0.857 },
  { dir: 'ne', label: 'Northeast', min: -0.857, max: -0.571 },
  { dir: 'e',  label: 'East',      min: -0.571, max: -0.286 },
  { dir: 'se', label: 'Southeast', min: -0.286, max: -0.050 },
  { dir: 's',  label: 'South',     min:  0.050, max:  0.286 },
  { dir: 'sw', label: 'Southwest', min:  0.286, max:  0.571 },
  { dir: 'w',  label: 'West',      min:  0.571, max:  0.857 },
  { dir: 'nw', label: 'Northwest', min:  0.857, max:  1.000 },
];

// ─────────────────────────────────────────────
// Mode System
// Activated by the 3-position Mode switch on throttle
// ─────────────────────────────────────────────
export const X52_MODES = {
  0: { name: 'Green Mode',  color: 'green',  indicator: 'M1' },
  1: { name: 'Orange Mode', color: 'orange', indicator: 'M2' },
  2: { name: 'Red Mode',    color: 'red',    indicator: 'M3' },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Get button metadata by index, returns fallback if unknown */
export const getButtonMeta = (index) =>
  X52_BUTTONS[index] ?? { name: `Button ${index}`, group: 'Unknown', type: 'button', code: `BTN_${index}` };

/** Get axis metadata by index, returns fallback if unknown */
export const getAxisMeta = (index) =>
  X52_AXES[index] ?? { name: `Axis ${index}`, group: 'Unknown', type: 'axis', code: `AX_${index}`, range: [-1, 1], deadzone: 0.1 };

/** Decode an axis-9 analogue value to a POV direction string, or null if centred */
export const decodePovHat = (value) => {
  if (typeof value !== 'number' || Math.abs(value) < 0.05) return null;
  return X52_POV_DIRECTIONS.find((d) => value >= d.min && value <= d.max)?.dir ?? null;
};

// ─────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH: Complete Input Lookup
// These functions convert between all three indexing systems
// ─────────────────────────────────────────────────────────

/**
 * Get complete metadata for a button by Gamepad API index (0-based).
 * Returns all info needed for display: name, Windows index (1-based), code, etc.
 * @param {number} gamepadIndex - 0-based Gamepad API index (0–31)
 * @returns {Object|null} Button metadata with displayIndex, or null if not found
 */
export const getButtonInfo = (gamepadIndex) => {
  const meta = X52_BUTTONS[gamepadIndex];
  if (!meta) return null;

  const windowsIndex = Number.isInteger(meta.windowsIndex) ? meta.windowsIndex : gamepadIndex + 1;
  const windowsLabel = Number.isInteger(windowsIndex) ? `Button ${windowsIndex}` : null;
  const aliases = Array.from(new Set([
    meta.name,
    ...(Array.isArray(meta.aliases) ? meta.aliases : []),
    windowsLabel,
  ].filter(Boolean)));

  return {
    ...meta,
    gamepadIndex,           // 0-based index used in Gamepad API
    displayIndex: windowsIndex,
    displayLabel: `B${windowsIndex}`,
    windowsIndex,
    windowsLabel,
    aliases,
    key: `button-${gamepadIndex}`, // Key used in activeInputs Set and storage
  };
};

/**
 * Get button by Windows index (1-based) → convert to Gamepad index and return full info.
 * @param {number} windowsIndex - 1-based Windows button number (1–32)
 * @returns {Object|null} Button metadata or null
 */
export const getButtonByWindowsIndex = (windowsIndex) => {
  const match = Object.keys(X52_BUTTONS).find((key) => {
    const info = getButtonInfo(Number(key));
    return info?.windowsIndex === windowsIndex;
  });

  return match === undefined ? null : getButtonInfo(Number(match));
};

/**
 * Get button by display label → convert and return full info.
 * @param {string} displayLabel - "B1", "B24", "B25", etc.
 * @returns {Object|null} Button metadata or null
 */
export const getButtonByDisplayLabel = (displayLabel) => {
  const match = displayLabel.match(/^B(\d+)$/);
  if (!match) return null;

  return getButtonByWindowsIndex(Number(match[1]));
};

/**
 * Get axis by Gamepad API index (0-based).
 * Returns metadata with displayIndex for consistency.
 * @param {number} gamepadIndex - 0-based Gamepad API index
 * @returns {Object|null} Axis metadata, or null if not found
 */
export const getAxisInfo = (gamepadIndex) => {
  const meta = X52_AXES[gamepadIndex];
  if (!meta) return null;
  return {
    ...meta,
    gamepadIndex,
    displayIndex: gamepadIndex + 1,
    key: `axis-${gamepadIndex}`,
  };
};

/**
 * Resolve any input identifier (Gamepad key, Windows index, display label) to full metadata.
 * Handles: "button-24", "axis-2", "B24", 25, "pov-hat-2-n", etc.
 * @param {string|number} identifier - Various formats
 * @returns {Object|null} Complete metadata with gamepadIndex, displayIndex, name, etc.
 */
export const resolveInputIdentifier = (identifier) => {
  // Already a button metadata key like "button-24"
  if (typeof identifier === 'string' && identifier.startsWith('button-')) {
    const idx = Number(identifier.split('-')[1]);
    return getButtonInfo(idx);
  }

  // Already an axis metadata key like "axis-2"
  if (typeof identifier === 'string' && identifier.startsWith('axis-')) {
    const idx = Number(identifier.split('-')[1]);
    return getAxisInfo(idx);
  }

  // Display label like "B24"
  if (typeof identifier === 'string' && identifier.match(/^B\d+$/)) {
    return getButtonByDisplayLabel(identifier);
  }

  // Windows 1-based number like 24 or 25
  if (typeof identifier === 'number') {
    return getButtonByWindowsIndex(identifier);
  }

  // HAT direction like "pov-hat-2-n" — return axis info for POV HAT (axis 9)
  if (typeof identifier === 'string' && identifier.includes('pov-hat')) {
    return getAxisInfo(9);
  }

  return null;
};

/**
 * Build a canonical array of ALL inputs in order (buttons 0–31, then axes).
 * Useful for building UI grids that need to map every possible index.
 * @returns {Array} Array of input metadata in order
 */
export const getAllInputsInOrder = () => {
  const result = [];

  // All button indices 0–31
  for (let i = 0; i <= 31; i++) {
    const buttonInfo = getButtonInfo(i);
    if (buttonInfo) {
      result.push(buttonInfo);
    }
  }

  // Axes in order
  [0, 1, 2, 3, 4, 5, 6, 9].forEach((axisIdx) => {
    const axisInfo = getAxisInfo(axisIdx);
    if (axisInfo) {
      result.push(axisInfo);
    }
  });

  return result;
};

/** Device descriptor exported for use in DeviceRegistry */
export const LogitechX52Device = {
  id: X52_DEVICE_ID,
  name: X52_NAME,
  vendorId: X52_VENDOR_ID,
  productId: X52_PRODUCT_ID,
  buttons: X52_BUTTONS,
  axes: X52_AXES,
  modes: X52_MODES,
  povDirections: X52_POV_DIRECTIONS,
  getButtonMeta,
  getAxisMeta,
  decodePovHat,
  // New single-source-of-truth lookups
  getButtonInfo,
  getButtonByWindowsIndex,
  getButtonByDisplayLabel,
  getAxisInfo,
  resolveInputIdentifier,
  getAllInputsInOrder,
  /** True if the gamepad name string suggests this is an X52 */
  matches: (gamepadId = '') =>
    /x52/i.test(gamepadId) || gamepadId.includes('0255') || gamepadId.includes('06A3'),
};

export default LogitechX52Device;

