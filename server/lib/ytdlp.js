/**
 * yt-dlp wrapper — spawns yt-dlp as a child process to download YouTube videos.
 *
 * SECURITY: All video IDs are validated against a strict pattern before use.
 * Arguments are passed as an array to spawn() — never via shell interpolation.
 * The output directory is read from env and never from user input.
 *
 * Requires:
 *   - yt-dlp installed and on PATH (pip install yt-dlp  or  winget install yt-dlp)
 *   - ffmpeg installed and on PATH (for merging video+audio streams)
 *   - YT_DOWNLOAD_DIR env var pointing at your Google Drive folder
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('ytdlp');

// Strict YouTube video ID format: exactly 11 chars, alphanumeric + - _
const VALID_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;

// yt-dlp format selector:
// Prefer MP4 video ≤1080p + best audio, merge to MP4.
// Falls back to best single-file format ≤1080p.
// This covers 1920×824 cinema crops which fit within 1080p height.
const FORMAT_SELECTOR =
  'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';

const MERGE_FORMAT = 'mp4';

// Output template: %(title)s [%(id)s].%(ext)s
// Bracket-wrapped ID lets you find the file by ID later.
const OUTPUT_TEMPLATE = '%(title)s [%(id)s].%(ext)s';

function getYtDlpBin() {
  return String(process.env.YT_DLP_BIN || 'yt-dlp').trim();
}

function getFfmpegBin() {
  return String(process.env.FFMPEG_BIN || 'ffmpeg').trim();
}

function getFfmpegLocation() {
  const configured = String(process.env.FFMPEG_BIN || '').trim();
  if (configured) {
    return configured;
  }

  const fallback = getFfmpegBin();
  if (fallback.toLowerCase().endsWith('.exe')) {
    return dirname(fallback);
  }

  return fallback;
}

/** Returns the configured download directory, or throws if missing. */
function getDownloadDir() {
  const dir = process.env.YT_DOWNLOAD_DIR || '';
  if (!dir) {
    throw new Error(
      'YT_DOWNLOAD_DIR environment variable is not set. ' +
      'Set it to the absolute path of your Google Drive video folder.'
    );
  }
  return dir;
}

/**
 * Check that yt-dlp is available on PATH.
 * Returns { available: true } or { available: false, reason: string }
 */
export async function checkYtDlpAvailable() {
  return new Promise((resolve) => {
    const proc = spawn(getYtDlpBin(), ['--version'], { shell: false });
    let version = '';
    proc.stdout?.on('data', (d) => {
      version += d.toString();
    });
    proc.on('error', () => resolve({ available: false, reason: 'yt-dlp not found (set YT_DLP_BIN or add to PATH)' }));
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ available: true, version: version.trim() });
      } else {
        resolve({ available: false, reason: `yt-dlp exited with code ${code}` });
      }
    });
  });
}

/**
 * Check that ffmpeg is available on PATH.
 */
export async function checkFfmpegAvailable() {
  return new Promise((resolve) => {
    const proc = spawn(getFfmpegBin(), ['-version'], { shell: false });
    proc.on('error', () => resolve({ available: false, reason: 'ffmpeg not found (set FFMPEG_BIN or add to PATH)' }));
    proc.on('close', (code) => {
      resolve({ available: code === 0, reason: code === 0 ? undefined : `ffmpeg exited with code ${code}` });
    });
  });
}

/**
 * Download a single YouTube video by ID.
 *
 * @param {object} opts
 * @param {string} opts.videoId  - 11-char YouTube video ID (validated)
 * @param {string} [opts.subDir] - Optional subdirectory under YT_DOWNLOAD_DIR
 * @param {(line: string) => void} [opts.onProgress] - Called with each stdout/stderr line
 * @returns {Promise<void>} Resolves when yt-dlp exits 0, rejects on failure.
 */
export function downloadVideo({ videoId, subDir = '', onProgress }) {
  return new Promise((resolve, reject) => {
    // SECURITY: Validate video ID before passing to child process
    if (!VALID_VIDEO_ID.test(videoId)) {
      return reject(new Error(`Invalid YouTube video ID: ${videoId}`));
    }

    const baseDir = getDownloadDir();
    const outputDir = subDir
      ? join(baseDir, subDir.replace(/[^a-zA-Z0-9 _-]/g, '')) // strip dangerous path chars
      : baseDir;

    const outputPath = join(outputDir, OUTPUT_TEMPLATE);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const args = [
      '--format', FORMAT_SELECTOR,
      '--merge-output-format', MERGE_FORMAT,
      '--ffmpeg-location', getFfmpegLocation(),
      '--output', outputPath,
      '--no-playlist',          // never accidentally grab a whole playlist
      '--no-overwrites',        // skip if file already exists
      '--restrict-filenames',   // safe filename characters only
      '--no-part',              // no .part temp files left behind
      '--retries', '3',
      '--fragment-retries', '3',
      videoUrl,
    ];

    logger.info(`Starting download: ${videoId}`);
    const proc = spawn(getYtDlpBin(), args, { shell: false });

    function handleLine(data) {
      const line = data.toString().trim();
      if (line && onProgress) {
        onProgress(line);
      }
      if (line) {
        logger.debug(`[yt-dlp ${videoId}] ${line}`);
      }
    }

    proc.stdout?.on('data', handleLine);
    proc.stderr?.on('data', handleLine);

    proc.on('error', (err) => {
      logger.error(`yt-dlp spawn failed for ${videoId}:`, err.message);
      reject(new Error(`yt-dlp spawn failed: ${err.message}`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        logger.info(`Download complete: ${videoId}`);
        resolve();
      } else {
        logger.warn(`yt-dlp exited ${code} for ${videoId}`);
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });
}
