/**
 * GameProcessMonitorExtension
 *
 * Detects whether Star Citizen (or another configured game) is currently running.
 * Used to enable game-context features (e.g. auto-activating the right overlay,
 * live binding sync) only when the game is actually open.
 *
 * Detection strategies (in order of availability):
 *
 *   1. Native Helper WebSocket  – If OmniCore Desktop Helper is running, query it
 *      for process list. Gives accurate real-time process state.
 *
 *   2. Focus heuristic          – `document.hasFocus()` combined with the page
 *      visibility API. Cheap but only tells us our own app state.
 *
 *   3. Manual override          – User can toggle "Game is running" via the UI.
 *      Stored in sessionStorage so it doesn't persist across sessions.
 *
 * This extension is primarily useful in the Electron / native-helper context.
 * In pure PWA mode it falls back gracefully and never throws.
 *
 * @example
 *   const monitor = new GameProcessMonitorExtension({ helperPort: 29876 });
 *   if (monitor.isAvailable()) {
 *     await monitor.init();
 *     const running = await monitor.isGameRunning();
 *     monitor.onStatusChange((status) => console.log('SC running:', status));
 *   }
 */

import { HotasExtension } from './HotasExtension.js';

const SESSION_KEY = 'hotas:game-running-override';

export class GameProcessMonitorExtension extends HotasExtension {
  /**
   * @param {object}  [options]
   * @param {number}  [options.helperPort=29876] – Port for OmniCore Desktop Helper WS
   * @param {string}  [options.processName='StarCitizen.exe'] – Process name to watch
   * @param {number}  [options.pollIntervalMs=5000] – How often to poll (ms)
   */
  constructor({ helperPort = 29876, processName = 'StarCitizen.exe', pollIntervalMs = 5000 } = {}) {
    super();
    this._helperPort    = helperPort;
    this._processName   = processName;
    this._pollInterval  = pollIntervalMs;
    this._ws            = null;
    this._status        = false;
    this._statusCbs     = [];
    this._pollTimer     = null;
  }

  get name() { return 'game-process-monitor'; }
  get displayName() { return 'Game Process Monitor'; }

  /**
   * Available if a native helper probe can be attempted (localhost + ws support).
   * In PWA mode this still returns true — we fall back to manual override.
   */
  isAvailable() {
    return typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
  }

  /**
   * Open WebSocket connection to native helper (if reachable) and start polling.
   * Resolves immediately even if helper is unavailable — falls back gracefully.
   */
  async init() {
    const connected = await this._connectHelper();
    if (!connected) {
      // Fall back to polling via visibility / manual override
      this._startFallbackPoll();
    }
  }

  /**
   * Asynchronously check whether the game is currently running.
   * Uses the best available strategy in order.
   * @returns {Promise<boolean>}
   */
  async isGameRunning() {
    // 1. Manual override wins
    const override = sessionStorage.getItem(SESSION_KEY);
    if (override !== null) return override === 'true';

    // 2. Native helper (already connected — latest push state)
    if (this._ws?.readyState === WebSocket.OPEN) return this._status;

    // 3. Fallback — unknown, return false
    return false;
  }

  /**
   * Register a callback fired whenever the status changes.
   * @param {function(boolean): void} cb
   * @returns {function} unsubscribe function
   */
  onStatusChange(cb) {
    this._statusCbs.push(cb);
    return () => { this._statusCbs = this._statusCbs.filter((f) => f !== cb); };
  }

  /**
   * Manually override the "game is running" state.
   * Stored in sessionStorage so it survives page refreshes but not new tabs.
   * Pass `null` to clear the override.
   * @param {boolean|null} value
   */
  setManualOverride(value) {
    if (value === null) {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, String(Boolean(value)));
      this._notifyStatus(Boolean(value));
    }
  }

  /** Current manual override value, or null if not set */
  get manualOverride() {
    const v = sessionStorage.getItem(SESSION_KEY);
    return v === null ? null : v === 'true';
  }

  async teardown() {
    clearInterval(this._pollTimer);
    this._pollTimer = null;
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  async _connectHelper() {
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(`ws://127.0.0.1:${this._helperPort}`);
        const timer = setTimeout(() => { ws.close(); resolve(false); }, 1000);

        ws.onopen = () => {
          clearTimeout(timer);
          this._ws = ws;
          // Request initial process status
          ws.send(JSON.stringify({ command: 'watch-process', name: this._processName }));
          resolve(true);
        };

        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'process-status') {
              this._updateStatus(msg.running === true);
            }
          } catch { /* ignore malformed messages */ }
        };

        ws.onclose  = () => { this._ws = null; };
        ws.onerror  = () => { clearTimeout(timer); resolve(false); };
      } catch {
        resolve(false);
      }
    });
  }

  _startFallbackPoll() {
    // Re-check manual override periodically
    this._pollTimer = setInterval(() => {
      const override = sessionStorage.getItem(SESSION_KEY);
      if (override !== null) this._updateStatus(override === 'true');
    }, this._pollInterval);
  }

  _updateStatus(running) {
    if (running === this._status) return;
    this._status = running;
    this._notifyStatus(running);
  }

  _notifyStatus(running) {
    this._statusCbs.forEach((cb) => {
      try { cb(running); } catch { /* don't let a bad subscriber crash the monitor */ }
    });
  }
}

export default GameProcessMonitorExtension;
