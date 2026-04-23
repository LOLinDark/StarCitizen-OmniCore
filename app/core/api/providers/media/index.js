import { apiGet, apiPost } from '../../client';

const FEED_CACHE_KEY = 'omnicore.aerobook.feed-cache.v1';

function readCache() {
  try {
    const raw = localStorage.getItem(FEED_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.categories) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota and serialization errors.
  }
}

export function getCachedAerobookFeed() {
  return readCache();
}

export async function fetchAerobookFeed({ limit = 24, force = false } = {}) {
  const params = new URLSearchParams({ limit: String(limit), force: String(force) });

  try {
    const payload = await apiGet(`/api/media/aerobook?${params.toString()}`);
    writeCache(payload);
    return {
      ...payload,
      cacheSource: 'network',
    };
  } catch (error) {
    const cached = readCache();
    if (cached) {
      return {
        ...cached,
        cacheSource: 'cache',
      };
    }

    throw error;
  }
}

export async function fetchLatestMediaMeta() {
  try {
    const payload = await apiGet('/api/media/latest');
    return payload;
  } catch (error) {
    const cached = readCache();
    const latestVideo = cached?.latestVideo || null;

    if (latestVideo) {
      return {
        latestPublishedAt: latestVideo.publishedAt || cached.latestPublishedAt || null,
        latestVideo,
        generatedAt: cached.generatedAt || null,
        cacheSource: 'cache',
      };
    }

    throw error;
  }
}

// ── Playlist fetch ──────────────────────────────────────────────────────

/**
 * Fetch videos from a specific YouTube playlist via the server proxy.
 * @param {{ playlistId: string, limit?: number }} opts
 * @returns {Promise<Array>} Array of video objects
 */
export async function fetchYoutubePlaylist({ playlistId, limit = 50 } = {}) {
  const params = new URLSearchParams({ playlistId, limit: String(limit) });
  const data = await apiGet(`/api/media/youtube/playlist?${params.toString()}`);
  return data.videos || [];
}

// ── Download queue API ──────────────────────────────────────────────────

export async function fetchDownloadStatus() {
  return apiGet('/api/dev/download/status');
}

export async function fetchDownloadEnv() {
  return apiGet('/api/dev/download/env');
}

export async function enqueueForDownload(videos) {
  return apiPost('/api/dev/download/enqueue', { videos });
}

export async function startDownloadWorker() {
  return apiPost('/api/dev/download/start', {});
}

export async function stopDownloadWorker() {
  return apiPost('/api/dev/download/stop', {});
}

export async function retryDownload(videoId) {
  return apiPost(`/api/dev/download/retry/${videoId}`, {});
}

export async function removeDownloadItem(videoId) {
  return apiPost(`/api/dev/download/remove/${videoId}`, {});
}
