/**
 * FileSystemAccessExtension
 *
 * Uses the browser's File System Access API to read and write
 * Star Citizen HOTAS profile XMLs directly from the local filesystem
 * without requiring a backend server.
 *
 * Availability: Chromium-based browsers (Chrome 86+, Edge 86+, Opera).
 *               NOT available in Firefox or Safari (as of 2024).
 *
 * Typical SC profile location (Windows):
 *   %LOCALAPPDATA%\Roberts Space Industries\StarCitizen\LIVE\USER\Client\0\Controls\Mappings\
 *
 * @example
 *   const fs = new FileSystemAccessExtension();
 *   if (fs.isAvailable()) {
 *     await fs.init();                    // triggers OS file picker
 *     const xml = await fs.readFile();    // returns XML string
 *     await fs.writeFile(modifiedXml);    // writes back
 *   }
 */

import { HotasExtension } from './HotasExtension.js';

export class FileSystemAccessExtension extends HotasExtension {
  constructor() {
    super();
    this._fileHandle = null;
    this._dirHandle  = null;
  }

  get name() { return 'file-system-access'; }
  get displayName() { return 'File System Access (SC Profiles)'; }

  isAvailable() {
    return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
  }

  /**
   * Prompt the user to pick a Star Citizen profile XML file.
   * Stores the file handle for subsequent read/write calls.
   * @returns {Promise<void>}
   * @throws if the user cancels the picker
   */
  async init() {
    if (!this.isAvailable()) throw new Error('File System Access API not supported in this browser.');

    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'Star Citizen Profile XML',
          accept: { 'application/xml': ['.xml'], 'text/xml': ['.xml'] },
        },
      ],
      multiple: false,
    });

    this._fileHandle = fileHandle;
  }

  /**
   * Read the selected file's contents as a string.
   * @returns {Promise<string>} XML content
   */
  async readFile() {
    if (!this._fileHandle) throw new Error('No file selected. Call init() first.');
    const file = await this._fileHandle.getFile();
    return file.text();
  }

  /**
   * Write new XML content back to the same file (requires write permission).
   * @param {string} xmlContent
   * @returns {Promise<void>}
   */
  async writeFile(xmlContent) {
    if (!this._fileHandle) throw new Error('No file selected. Call init() first.');

    let writable;
    try {
      writable = await this._fileHandle.createWritable();
      await writable.write(xmlContent);
    } finally {
      await writable?.close();
    }
  }

  /**
   * Prompt to pick an entire directory (for browsing multiple profiles).
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async pickDirectory() {
    if (!this.isAvailable()) throw new Error('File System Access API not supported.');
    this._dirHandle = await window.showDirectoryPicker({ mode: 'read' });
    return this._dirHandle;
  }

  /**
   * List all XML files in the previously picked directory.
   * @returns {Promise<string[]>} filenames
   */
  async listProfileFiles() {
    if (!this._dirHandle) throw new Error('No directory selected. Call pickDirectory() first.');
    const names = [];
    for await (const [name] of this._dirHandle.entries()) {
      if (name.endsWith('.xml')) names.push(name);
    }
    return names.sort();
  }

  /**
   * Read a specific XML file from the previously picked directory by filename.
   * @param {string} filename
   * @returns {Promise<string>} XML content
   */
  async readProfileFromDir(filename) {
    if (!this._dirHandle) throw new Error('No directory selected. Call pickDirectory() first.');
    const handle = await this._dirHandle.getFileHandle(filename);
    const file   = await handle.getFile();
    return file.text();
  }

  async teardown() {
    this._fileHandle = null;
    this._dirHandle  = null;
  }

  /** The currently selected file's name, or null */
  get selectedFileName() {
    return this._fileHandle?.name ?? null;
  }

  /** True when a file has been selected and is ready to read */
  get isReady() {
    return this._fileHandle !== null;
  }
}

export default FileSystemAccessExtension;
