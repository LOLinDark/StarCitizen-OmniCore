/**
 * Download Queue — Persistent JSON-backed queue for YouTube video downloads.
 *
 * The queue file is stored alongside downloaded videos so it survives server restarts.
 * Each item tracks: videoId, title, url, playlistId, status, timestamps, and error info.
 *
 * Statuses:
 *   queued      – waiting to be downloaded
 *   downloading – currently being processed by yt-dlp
 *   done        – successfully downloaded
 *   failed      – yt-dlp exited with an error (retryable)
 *   skipped     – manually removed or already exists on disk
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('downloadQueue');

function getQueueDir() {
  return String(process.env.YT_DOWNLOAD_DIR || '').trim();
}

function resolveQueueFilePath() {
  const queueDir = getQueueDir();
  if (!queueDir) return null;
  return join(queueDir, 'download-queue.json');
}

function requireQueueDir() {
  const queueDir = getQueueDir();
  if (!queueDir) {
    throw new Error(
      'YT_DOWNLOAD_DIR environment variable is not set. ' +
      'Set it to the absolute path of your Google Drive video folder.'
    );
  }
  return queueDir;
}

function ensureDir(queueDir) {
  if (queueDir && !existsSync(queueDir)) {
    mkdirSync(queueDir, { recursive: true });
  }
}

function readQueue() {
  try {
    const path = resolveQueueFilePath();
    if (!path) return [];
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeQueue(items) {
  const queueDir = requireQueueDir();
  ensureDir(queueDir);
  writeFileSync(resolveQueueFilePath(), JSON.stringify(items, null, 2), 'utf8');
}

// ── Public API ─────────────────────────────────────────────────────────────

export function getQueue() {
  return readQueue();
}

export function getQueueStats() {
  const items = readQueue();
  return {
    total: items.length,
    queued: items.filter((i) => i.status === 'queued').length,
    downloading: items.filter((i) => i.status === 'downloading').length,
    done: items.filter((i) => i.status === 'done').length,
    failed: items.filter((i) => i.status === 'failed').length,
    skipped: items.filter((i) => i.status === 'skipped').length,
  };
}

/**
 * Add videos to the queue, skipping any already present by videoId.
 * @param {Array<{videoId:string, title:string, url:string, playlistId:string, playlistLabel:string}>} videos
 * @returns {{ added: number, skipped: number }}
 */
export function enqueueVideos(videos) {
  requireQueueDir();
  const items = readQueue();
  const existing = new Set(items.map((i) => i.videoId));
  let added = 0;

  for (const v of videos) {
    if (existing.has(v.videoId)) continue;
    items.push({
      videoId: v.videoId,
      title: v.title || '',
      url: v.url || `https://www.youtube.com/watch?v=${v.videoId}`,
      playlistId: v.playlistId || '',
      playlistLabel: v.playlistLabel || '',
      status: 'queued',
      addedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
    });
    existing.add(v.videoId);
    added++;
  }

  writeQueue(items);
  logger.info(`Enqueued ${added} videos (${videos.length - added} already present)`);
  return { added, skipped: videos.length - added };
}

/** Get the next queued item (oldest first). */
export function peekNext() {
  const items = readQueue();
  return items.find((i) => i.status === 'queued') || null;
}

/** Mark an item as downloading. */
export function markDownloading(videoId) {
  const items = readQueue();
  const item = items.find((i) => i.videoId === videoId);
  if (item) {
    item.status = 'downloading';
    item.startedAt = new Date().toISOString();
    item.error = null;
    writeQueue(items);
  }
}

/** Mark an item as done. */
export function markDone(videoId) {
  const items = readQueue();
  const item = items.find((i) => i.videoId === videoId);
  if (item) {
    item.status = 'done';
    item.completedAt = new Date().toISOString();
    writeQueue(items);
  }
}

/** Mark an item as failed with an error message. */
export function markFailed(videoId, errorMessage) {
  const items = readQueue();
  const item = items.find((i) => i.videoId === videoId);
  if (item) {
    item.status = 'failed';
    item.completedAt = new Date().toISOString();
    item.error = String(errorMessage || '').slice(0, 500);
    writeQueue(items);
  }
}

/** Reset a failed item back to queued so it will be retried. */
export function retryFailed(videoId) {
  const items = readQueue();
  const item = items.find((i) => i.videoId === videoId && i.status === 'failed');
  if (item) {
    item.status = 'queued';
    item.startedAt = null;
    item.completedAt = null;
    item.error = null;
    writeQueue(items);
    return true;
  }
  return false;
}

/** Remove an item from the queue entirely. */
export function removeFromQueue(videoId) {
  const items = readQueue();
  const filtered = items.filter((i) => i.videoId !== videoId);
  writeQueue(filtered);
  return filtered.length < items.length;
}

/**
 * Fix any items stuck in "downloading" state after a server restart.
 * They should be reset to "queued" so the worker will pick them up again.
 */
export function resetStuckDownloading() {
  const items = readQueue();
  let count = 0;
  for (const item of items) {
    if (item.status === 'downloading') {
      item.status = 'queued';
      item.startedAt = null;
      count++;
    }
  }
  if (count > 0) {
    writeQueue(items);
    logger.warn(`Reset ${count} stuck "downloading" items to "queued"`);
  }
}
