/**
 * OmniCore HOTAS Library – Main Entry Point
 *
 * A PWA-first HOTAS support library with optional game integration extensions.
 *
 * Architecture:
 *   core/       – Works in any modern browser. No external dependencies.
 *   devices/    – Device-specific button/axis data (X52, etc.)
 *   extensions/ – Optional progressive enhancements (File System, process detection)
 *   utils/      – Feature detection and helpers
 *
 * Basic usage:
 * ─────────────────────────────────────────────────────────────
 * // React component
 * import { useHotasInput } from '@/libraries/hotas';
 *
 * function MyComponent() {
 *   const { gamepadConnected, lastInput, startMonitoring } = useHotasInput();
 *   // ...
 * }
 *
 * // Vanilla JS
 * import { GamepadPoller, LogitechX52Device } from '@/libraries/hotas';
 *
 * const poller = new GamepadPoller({ device: LogitechX52Device });
 * poller.on('buttonPressed', ({ name }) => console.log(name));
 * poller.start();
 * ─────────────────────────────────────────────────────────────
 */

// ── Core ──────────────────────────────────────────────────────────────────────
export { GamepadPoller }          from './core/GamepadPoller.js';
export { useHotasInput }          from './core/useHotasInput.js';

// ── Devices ───────────────────────────────────────────────────────────────────
export {
  LogitechX52Device,
  X52_BUTTONS,
  X52_AXES,
  X52_MODES,
  X52_POV_DIRECTIONS,
  getButtonMeta,
  getAxisMeta,
  decodePovHat,
} from './devices/LogitechX52.js';

export {
  resolveDevice,
  registerDevice,
  listDevices,
} from './devices/deviceRegistry.js';

// ── Extensions ────────────────────────────────────────────────────────────────
export { HotasExtension }                from './extensions/HotasExtension.js';
export { FileSystemAccessExtension }     from './extensions/FileSystemAccessExtension.js';
export { GameProcessMonitorExtension }   from './extensions/GameProcessMonitorExtension.js';

// ── Utils ─────────────────────────────────────────────────────────────────────
export {
  detectCapabilities,
  detectCapabilitiesAsync,
  getCapabilities,
  describeCapabilities,
} from './utils/featureDetection.js';
