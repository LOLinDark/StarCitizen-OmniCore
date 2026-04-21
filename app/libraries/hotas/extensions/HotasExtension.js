/**
 * Extension Interface – Base class / contract for HOTAS extensions
 *
 * Extensions are optional progressive enhancements that add capabilities
 * beyond core Gamepad API polling. All extensions share this interface.
 *
 * Built-in extensions:
 *   FileSystemAccessExtension  – Read/write Star Citizen XML profiles from disk
 *   GameProcessMonitorExtension – Detect if Star Citizen is running (native helper)
 *   NativeHelperExtension      – Full desktop integration via OmniCore Helper
 *
 * Usage:
 *   const ext = new FileSystemAccessExtension();
 *   if (ext.isAvailable()) {
 *     await ext.init();
 *     const xml = await ext.readProfileFile();
 *   }
 */

export class HotasExtension {
  /** @type {string} Unique identifier for this extension */
  get name() { return 'base-extension'; }

  /** @type {string} Human-readable display name */
  get displayName() { return 'HOTAS Extension'; }

  /**
   * Check synchronously whether the required browser API / environment is present.
   * This must NOT trigger any permission prompts.
   * @returns {boolean}
   */
  isAvailable() { return false; }

  /**
   * Initialise the extension (may prompt for permissions, open connections, etc.).
   * Should be called only after `isAvailable()` returns true.
   * @returns {Promise<void>}
   */
  async init() {}

  /**
   * Clean up resources (close connections, release file handles, etc.).
   * Safe to call even if `init()` was never called.
   * @returns {Promise<void>}
   */
  async teardown() {}
}
