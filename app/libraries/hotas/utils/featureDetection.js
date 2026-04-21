/**
 * featureDetection.js
 *
 * Detects browser and platform capabilities relevant to HOTAS/peripheral support.
 * Call `detectCapabilities()` once and cache the result — these values don't
 * change at runtime (except `electron`, which is set on load).
 *
 * Progressive enhancement tiers:
 *
 *   Tier 1 – Core (all modern browsers, PWA)
 *     • Gamepad API
 *     • Keyboard events
 *
 *   Tier 2 – Enhanced (Chromium-based browsers + Edge)
 *     • File System Access API  → read/write SC profile XMLs without a server
 *     • Web HID                 → low-level HID access for custom device drivers
 *
 *   Tier 3 – Desktop only
 *     • Electron IPC            → detect if running inside Electron shell
 *     • Native helper socket    → detect if OmniCore Desktop Helper is running
 */

/**
 * @typedef {object} HotasCapabilities
 * @property {boolean} gamepadAPI          – navigator.getGamepads() available
 * @property {boolean} gamepadVibration    – Haptic feedback support
 * @property {boolean} fileSystemAccess   – File System Access API (showOpenFilePicker etc.)
 * @property {boolean} webHID             – WebHID API available
 * @property {boolean} webUSB             – WebUSB API available
 * @property {boolean} electron           – Running inside Electron shell
 * @property {boolean} nativeHelper       – OmniCore Desktop Helper detected (socket check)
 * @property {boolean} serviceWorker      – Service Worker / PWA support
 * @property {boolean} isSecureContext    – Running in HTTPS / localhost (required for many APIs)
 * @property {string}  tier              – 'core' | 'enhanced' | 'desktop'
 */

/**
 * Detect all HOTAS-relevant capabilities synchronously.
 * Some checks (nativeHelper) are async — use `detectCapabilitiesAsync()` for those.
 * @returns {HotasCapabilities}
 */
export function detectCapabilities() {
  const gamepadAPI        = typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function';
  const gamepadVibration  = gamepadAPI && 'vibrationActuator' in (navigator.getGamepads?.()[0] ?? {});
  const fileSystemAccess  = typeof window !== 'undefined' && 'showOpenFilePicker' in window;
  const webHID            = typeof navigator !== 'undefined' && 'hid' in navigator;
  const webUSB            = typeof navigator !== 'undefined' && 'usb' in navigator;
  const electron          = typeof window !== 'undefined' && (
    typeof window.electron !== 'undefined' ||
    typeof window.__ELECTRON__ !== 'undefined' ||
    navigator?.userAgent?.includes('Electron')
  );
  const serviceWorker     = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const isSecureContext   = typeof window !== 'undefined' && (window.isSecureContext ?? false);

  // Derive tier
  let tier = 'core';
  if (electron)                          tier = 'desktop';
  else if (fileSystemAccess || webHID)   tier = 'enhanced';

  return {
    gamepadAPI,
    gamepadVibration,
    fileSystemAccess,
    webHID,
    webUSB,
    electron,
    nativeHelper: false,  // async check — use detectCapabilitiesAsync()
    serviceWorker,
    isSecureContext,
    tier,
  };
}

/**
 * Full async detection including native helper probe.
 * The native helper check opens a short-lived WebSocket to the known helper port.
 * If nothing responds within the timeout it resolves as unavailable — never throws.
 *
 * @param {number} [helperPort=29876] – Port the OmniCore Desktop Helper listens on
 * @param {number} [timeout=500]      – ms before giving up on native helper probe
 * @returns {Promise<HotasCapabilities>}
 */
export async function detectCapabilitiesAsync(helperPort = 29876, timeout = 500) {
  const base = detectCapabilities();

  // Only check native helper when running in a secure context or localhost
  const nativeHelper = await probeNativeHelper(helperPort, timeout);

  return { ...base, nativeHelper };
}

/**
 * Probe for OmniCore Desktop Helper via WebSocket.
 * Resolves `true` if the socket opens, `false` on error/timeout.
 * @param {number} port
 * @param {number} timeout
 * @returns {Promise<boolean>}
 */
async function probeNativeHelper(port, timeout) {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      const timer = setTimeout(() => {
        ws.close();
        resolve(false);
      }, timeout);
      ws.onopen  = () => { clearTimeout(timer); ws.close(); resolve(true);  };
      ws.onerror = () => { clearTimeout(timer);              resolve(false); };
    } catch {
      resolve(false);
    }
  });
}

/**
 * Cached capabilities singleton.
 * Calling this multiple times returns the same object without re-running checks.
 */
let _cached = null;
export function getCapabilities() {
  if (!_cached) _cached = detectCapabilities();
  return _cached;
}

/**
 * Human-readable summary for debug panels.
 * @param {HotasCapabilities} caps
 * @returns {string}
 */
export function describeCapabilities(caps = getCapabilities()) {
  const lines = [
    `Tier: ${caps.tier.toUpperCase()}`,
    `Gamepad API:       ${caps.gamepadAPI       ? '✓' : '✗'}`,
    `File System Access:${caps.fileSystemAccess ? '✓' : '✗'} (read SC profiles from disk)`,
    `Web HID:           ${caps.webHID           ? '✓' : '✗'} (low-level device access)`,
    `Electron:          ${caps.electron         ? '✓' : '✗'}`,
    `Native Helper:     ${caps.nativeHelper     ? '✓' : '✗'}`,
    `Secure Context:    ${caps.isSecureContext  ? '✓' : '✗'}`,
  ];
  return lines.join('\n');
}

export default { detectCapabilities, detectCapabilitiesAsync, getCapabilities, describeCapabilities };
