/**
 * Developer Download API — REST endpoints for the YouTube download queue.
 *
 * All endpoints are under /api/dev/download/ and are intentionally only
 * registered in development mode. They control yt-dlp on the host machine.
 *
 * Endpoints:
 *   GET  /api/dev/download/status      — queue stats + full item list
 *   GET  /api/dev/download/env         — check yt-dlp/ffmpeg availability
 *   POST /api/dev/download/enqueue     — add videos to queue
 *   POST /api/dev/download/start       — start the queue worker
 *   POST /api/dev/download/stop        — stop the queue worker (after current item)
 *   POST /api/dev/download/retry/:id   — reset a failed item to queued
 *   DELETE /api/dev/download/item/:id  — remove an item from the queue
 */

import { createLogger } from '../../../lib/logger.js';
import {
  getQueue,
  getQueueStats,
  enqueueVideos,
  peekNext,
  markDownloading,
  markDone,
  markFailed,
  retryFailed,
  removeFromQueue,
  resetStuckDownloading,
} from '../../../lib/downloadQueue.js';
import { downloadVideo, checkYtDlpAvailable, checkFfmpegAvailable } from '../../../lib/ytdlp.js';

const logger = createLogger('api.dev.download');

// SECURITY: Strict YouTube video ID validation
const VALID_VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;

// ── Worker state (in-memory, single Node process) ────────────────────────
let workerRunning = false;
let workerStopping = false;
let currentVideoId = null;

/** Random integer between min and max (inclusive). */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pause for a random duration (ms). */
function randomDelay(minMs, maxMs) {
  const ms = randomBetween(minMs, maxMs);
  logger.info(`Waiting ${Math.round(ms / 1000)}s before next download…`);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The queue worker loop.
 * Picks one video at a time, downloads it, waits a random delay, repeats.
 * Stops when workerStopping is set or the queue is empty.
 */
async function runWorker() {
  workerRunning = true;
  workerStopping = false;
  logger.info('Download worker started');

  try {
    while (!workerStopping) {
      const next = peekNext();
      if (!next) {
        logger.info('Queue empty — worker stopping');
        break;
      }

      currentVideoId = next.videoId;
      markDownloading(next.videoId);

      try {
        await downloadVideo({
          videoId: next.videoId,
          onProgress: (line) => logger.debug(line),
        });
        markDone(next.videoId);
        logger.info(`Done: ${next.title || next.videoId}`);
      } catch (err) {
        markFailed(next.videoId, err.message);
        logger.warn(`Failed: ${next.videoId} — ${err.message}`);
      }

      currentVideoId = null;

      if (!workerStopping) {
        // Random delay: 60–300 seconds to avoid hammering YouTube
        await randomDelay(60_000, 300_000);
      }
    }
  } finally {
    workerRunning = false;
    workerStopping = false;
    currentVideoId = null;
    logger.info('Download worker stopped');
  }
}

// ── Route registration ───────────────────────────────────────────────────

export function registerDownloadRoutes(app) {
  // Reset any items that were mid-download when server last restarted
  resetStuckDownloading();

  // GET /api/dev/download/status
  app.get('/api/dev/download/status', (_req, res) => {
    try {
      const stats = getQueueStats();
      const items = getQueue();
      res.json({
        workerRunning,
        workerStopping,
        currentVideoId,
        downloadDir: process.env.YT_DOWNLOAD_DIR || null,
        stats,
        items,
      });
    } catch (err) {
      logger.error('status error', err.message);
      res.status(500).json({ error: 'Failed to read queue' });
    }
  });

  // GET /api/dev/download/env
  app.get('/api/dev/download/env', async (_req, res) => {
    try {
      const [ytdlp, ffmpeg] = await Promise.all([
        checkYtDlpAvailable(),
        checkFfmpegAvailable(),
      ]);
      res.json({
        ytdlp,
        ffmpeg,
        downloadDir: process.env.YT_DOWNLOAD_DIR || null,
        downloadDirSet: !!process.env.YT_DOWNLOAD_DIR,
      });
    } catch (err) {
      logger.error('env check error', err.message);
      res.status(500).json({ error: 'Failed to check environment' });
    }
  });

  // POST /api/dev/download/enqueue
  // Body: { videos: [{ videoId, title, url, playlistId, playlistLabel }] }
  app.post('/api/dev/download/enqueue', (req, res) => {
    if (!process.env.YT_DOWNLOAD_DIR) {
      return res.status(400).json({ error: 'YT_DOWNLOAD_DIR is not set in .env — configure it before queueing downloads' });
    }
    try {
      const videos = req.body?.videos;
      if (!Array.isArray(videos) || videos.length === 0) {
        return res.status(400).json({ error: 'videos array is required' });
      }
      if (videos.length > 500) {
        return res.status(400).json({ error: 'Cannot enqueue more than 500 videos at once' });
      }

      // SECURITY: validate every video ID before touching the queue
      const sanitised = [];
      for (const v of videos) {
        const id = String(v.videoId || '').trim();
        if (!VALID_VIDEO_ID.test(id)) {
          return res.status(400).json({ error: `Invalid video ID: ${id}` });
        }
        sanitised.push({
          videoId: id,
          title: String(v.title || '').slice(0, 300),
          url: `https://www.youtube.com/watch?v=${id}`, // always build URL ourselves
          playlistId: String(v.playlistId || '').slice(0, 100),
          playlistLabel: String(v.playlistLabel || '').slice(0, 100),
        });
      }

      const result = enqueueVideos(sanitised);
      res.json({ success: true, ...result });
    } catch (err) {
      logger.error('enqueue error', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/dev/download/start
  app.post('/api/dev/download/start', (_req, res) => {
    if (workerRunning) {
      return res.json({ success: true, message: 'Worker already running' });
    }
    if (!process.env.YT_DOWNLOAD_DIR) {
      return res.status(400).json({ error: 'YT_DOWNLOAD_DIR is not set in .env' });
    }
    // Fire and forget — the worker manages itself
    runWorker().catch((err) => logger.error('Worker crashed:', err.message));
    res.json({ success: true, message: 'Download worker started' });
  });

  // POST /api/dev/download/stop
  app.post('/api/dev/download/stop', (_req, res) => {
    if (!workerRunning) {
      return res.json({ success: true, message: 'Worker not running' });
    }
    workerStopping = true;
    res.json({ success: true, message: 'Stop signal sent — will finish current video then stop' });
  });

  // POST /api/dev/download/retry/:videoId
  app.post('/api/dev/download/retry/:videoId', (req, res) => {
    const { videoId } = req.params;
    if (!VALID_VIDEO_ID.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }
    const ok = retryFailed(videoId);
    if (!ok) {
      return res.status(404).json({ error: 'Item not found or not in failed state' });
    }
    res.json({ success: true });
  });

  // POST /api/dev/download/remove/:videoId
  app.post('/api/dev/download/remove/:videoId', (req, res) => {
    const { videoId } = req.params;
    if (!VALID_VIDEO_ID.test(videoId)) {
      return res.status(400).json({ error: 'Invalid video ID' });
    }
    if (videoId === currentVideoId) {
      return res.status(409).json({ error: 'Cannot remove item currently being downloaded' });
    }
    const ok = removeFromQueue(videoId);
    res.json({ success: ok });
  });
}
