/**
 * Device Registry
 *
 * Maps gamepad ID strings (as reported by the Gamepad API) to device descriptors.
 * When a new gamepad connects, call `resolveDevice(gamepad.id)` to get the
 * matching device descriptor with its button/axis metadata.
 *
 * Built-in devices:
 *   Logitech X52 HOTAS
 *
 * Adding a custom device:
 *   import { registerDevice } from './deviceRegistry.js';
 *   registerDevice(MyCustomDevice);  // device must have a `matches(id)` function
 */

import LogitechX52Device from './LogitechX52.js';

// ─── Registry ────────────────────────────────────────────────────────────────

/** @type {object[]} Ordered list of registered device descriptors */
const _registry = [LogitechX52Device];

/**
 * Register a custom device descriptor.
 * Custom devices are checked BEFORE built-ins, so they take priority.
 * @param {object} deviceDescriptor – Must implement `matches(gamepadId: string): boolean`
 */
export function registerDevice(deviceDescriptor) {
  if (typeof deviceDescriptor.matches !== 'function') {
    throw new Error(`Device descriptor must implement matches(gamepadId): boolean`);
  }
  _registry.unshift(deviceDescriptor);
}

/**
 * Resolve a Gamepad API `gamepad.id` string to a device descriptor.
 * Returns `null` if no registered device matches.
 * @param {string} gamepadId – e.g. "Logitech X52 H.O.T.A.S. (Vendor: 06a3 Product: 0255)"
 * @returns {object|null}
 */
export function resolveDevice(gamepadId = '') {
  return _registry.find((d) => d.matches(gamepadId)) ?? null;
}

/**
 * List all registered devices.
 * @returns {object[]}
 */
export function listDevices() {
  return [..._registry];
}

export default { registerDevice, resolveDevice, listDevices };
