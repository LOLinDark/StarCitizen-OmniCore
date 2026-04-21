import { apiGet } from '../../client';

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
