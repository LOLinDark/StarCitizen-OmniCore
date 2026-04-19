import { apiGet, apiPost } from '../../client';

const SHIPS_CACHE_KEY = 'omnicore.ships.cache.v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function readCache() {
  try {
    const raw = localStorage.getItem(SHIPS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ships || !Array.isArray(parsed.ships)) return null;
    if (Date.now() - (parsed.fetchedAt || 0) > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(SHIPS_CACHE_KEY, JSON.stringify({ ...payload, fetchedAt: Date.now() }));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Fetch all flyable ships from the API.
 * Optional filters: { manufacturer, size, search }
 * Falls back to localStorage cache if the backend is unreachable.
 */
export async function fetchShips({ manufacturer, size, search } = {}) {
  const params = new URLSearchParams();
  if (manufacturer) params.set('manufacturer', manufacturer);
  if (size) params.set('size', size);
  if (search) params.set('search', search);

  const query = params.toString();
  const url = `/api/ships${query ? `?${query}` : ''}`;

  try {
    const payload = await apiGet(url);
    // Only cache unfiltered full loads
    if (!manufacturer && !size && !search) {
      writeCache(payload);
    }
    return payload;
  } catch (err) {
    const cached = readCache();
    if (cached && !manufacturer && !size && !search) {
      return { ...cached, cacheSource: 'cache' };
    }
    throw err;
  }
}

/**
 * Returns the in-memory/localStorage ship cache immediately (no network).
 * Returns null if no valid cache exists.
 */
export function getCachedShips() {
  return readCache();
}

/**
 * Ask backend to pre-cache ship images on disk.
 * Use this to reduce first-view image latency for users.
 */
export async function warmShipsImageCache({ limit = 120, perShip = 1, concurrency = 4 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    perShip: String(perShip),
    concurrency: String(concurrency),
  });

  return apiPost(`/api/ships/cache/warm?${params.toString()}`);
}
