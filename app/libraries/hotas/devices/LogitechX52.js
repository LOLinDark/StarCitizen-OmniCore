/**
 * Logitech X52 HOTAS Device Definition
 * Complete button, axis, and HAT switch mapping for the X52 (non-Pro)
 * Based on empirical testing with Gamepad API browser mapping
 *
 * Physical layout:
 *   Stick: Hair trigger, Safe, A, B, C, Pinkie (modifier), POV HAT, Trigger Full
 *   Throttle: D, Fire-D, E, T1-T6 toggles, Mouse btn, HAT 2, HAT 3
 *   Axes: X (yaw), Y (pitch), Z-Rot (roll), Throttle, Rotary1, Rotary2, Slider
 *   POV HAT: Reported as axis 9 with analogue values (–1 → +1)
 */

export const X52_DEVICE_ID = 'logitech-x52';
export const X52_NAME = 'Logitech X52 HOTAS';
export const X52_VENDOR_ID = '0x06A3'; // Logitech
export const X52_PRODUCT_ID = '0x0255';

// ─────────────────────────────────────────────
// Button Index Map (Gamepad API index → metadata)
// ─────────────────────────────────────────────
export const X52_BUTTONS = {
  // ── Joystick / Stick ───────────────────────
  0:  { name: 'Hair Trigger',           group: 'Stick',      type: 'button', code: 'BTN_STICK_TRIG',      note: 'Light pull' },
  1:  { name: 'Safe Button',            group: 'Stick',      type: 'button', code: 'BTN_STICK_SAFE' },
  2:  { name: 'Button A',               group: 'Stick',      type: 'button', code: 'BTN_STICK_A' },
  3:  { name: 'Button B',               group: 'Stick',      type: 'button', code: 'BTN_STICK_B' },
  4:  { name: 'Button C',               group: 'Stick',      type: 'button', code: 'BTN_STICK_C' },
  5:  { name: 'Pinkie Switch',          group: 'Stick',      type: 'button', code: 'BTN_PINKIE',          note: 'Modifier – doubles all other buttons' },
  14: { name: 'Trigger Full Press',     group: 'Stick',      type: 'button', code: 'BTN_STICK_TRIG_FULL', note: 'Full squeeze' },

  // ── Throttle / Grip ─────────────────────────
  6:  { name: 'D',                      group: 'Throttle',   type: 'button', code: 'BTN_THR_D' },
  7:  { name: 'Fire D',                 group: 'Throttle',   type: 'button', code: 'BTN_THR_FIRED' },
  8:  { name: 'Button E',               group: 'Throttle',   type: 'button', code: 'BTN_THR_E' },
  16: { name: 'Mouse Button',           group: 'Throttle',   type: 'button', code: 'BTN_THR_MOUSE' },

  // ── Toggle Switches (T1–T6) ─────────────────
  9:  { name: 'Toggle T1',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T1' },
  10: { name: 'Toggle T2',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T2' },
  11: { name: 'Toggle T3',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T3' },
  12: { name: 'Toggle T4',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T4' },
  13: { name: 'Toggle T5',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T5' },
  15: { name: 'Toggle T6',              group: 'Toggles',    type: 'button', code: 'BTN_TOG_T6' },

  // ── Stick HAT 1 (8-way, reported as 4 discrete buttons by some drivers) ──
  17: { name: 'HAT 1 North',            group: 'Stick HAT',  type: 'button', code: 'HAT_1_N' },
  18: { name: 'HAT 1 Northeast',        group: 'Stick HAT',  type: 'button', code: 'HAT_1_NE' },
  19: { name: 'HAT 1 East',             group: 'Stick HAT',  type: 'button', code: 'HAT_1_E' },
  20: { name: 'HAT 1 Southeast',        group: 'Stick HAT',  type: 'button', code: 'HAT_1_SE' },

  // ── Throttle HAT 2 (8-way) ──────────────────
  21: { name: 'HAT 2 North',            group: 'Throttle HAT', type: 'button', code: 'HAT_2_N' },
  22: { name: 'HAT 2 Northeast',        group: 'Throttle HAT', type: 'button', code: 'HAT_2_NE' },
  23: { name: 'HAT 2 East',             group: 'Throttle HAT', type: 'button', code: 'HAT_2_E' },
  24: { name: 'HAT 2 Southeast',        group: 'Throttle HAT', type: 'button', code: 'HAT_2_SE' },

  // ── Extended / Mode-shifted ─────────────────
  25: { name: 'Button 25 (Extended)',   group: 'Extended',   type: 'button', code: 'BTN_EXT_25' },
  26: { name: 'Button 26 (Extended)',   group: 'Extended',   type: 'button', code: 'BTN_EXT_26' },
  27: { name: 'Button 27 (Extended)',   group: 'Extended',   type: 'button', code: 'BTN_EXT_27' },
  28: { name: 'Button 28 (Extended)',   group: 'Extended',   type: 'button', code: 'BTN_EXT_28' },
  // Observed in Windows game controller panel: this reports as Button 31.
  29: { name: 'Button 29 (Extended)',   group: 'Extended',   type: 'button', code: 'BTN_EXT_29', windowsIndex: 31 },
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
  0: { name: 'Red Mode',    color: 'red',    indicator: 'M1' },
  1: { name: 'Purple Mode', color: 'violet', indicator: 'M2' },
  2: { name: 'Blue Mode',   color: 'blue',   indicator: 'M3' },
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
  /** True if the gamepad name string suggests this is an X52 */
  matches: (gamepadId = '') =>
    /x52/i.test(gamepadId) || gamepadId.includes('0255') || gamepadId.includes('06A3'),
};

export default LogitechX52Device;
