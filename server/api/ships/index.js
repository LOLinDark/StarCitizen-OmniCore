import { createLogger } from '../../lib/logger.js';
import { join } from 'path';
import { createRemoteImageCache } from '../../lib/remoteImageCache.js';
import { getShipYouTubeId } from '../../data/shipVideos.js';

const logger = createLogger('api.ships');

const RSI_SHIP_MATRIX_URL = 'https://robertsspaceindustries.com/ship-matrix/index';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const IMAGE_CACHE_DIR = join(process.cwd(), 'public', 'assets', 'ships-cache');
const SHIP_IMAGE_PROXY_PATH = '/api/ships/image';
const ALLOWED_IMAGE_HOSTS = ['robertsspaceindustries.com', 'media.robertsspaceindustries.com'];

let shipsCache = null;

const shipImageCache = createRemoteImageCache({
  logger,
  cacheDir: IMAGE_CACHE_DIR,
  proxyPath: SHIP_IMAGE_PROXY_PATH,
  allowedHosts: ALLOWED_IMAGE_HOSTS,
  timeoutMs: 20000,
});

function toAbsoluteImageUrl(url) {
  if (!url) {
    return '';
  }

  const raw = String(url);
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `https://robertsspaceindustries.com${raw}`;
  }

  return '';
}

function pickMediaUrl(mediaItem) {
  if (!mediaItem || typeof mediaItem !== 'object') {
    return '';
  }

  return (
    mediaItem?.images?.slideshow ||
    mediaItem?.images?.channel_item_full ||
    mediaItem?.images?.store_large ||
    mediaItem?.images?.wallpaper_1920x1080 ||
    mediaItem?.source_url ||
    ''
  );
}

function toProxyImageUrl(absoluteImageUrl) {
  if (!absoluteImageUrl) {
    return '';
  }

  return shipImageCache.getProxyUrl(absoluteImageUrl);
}

function normalizeShip(raw) {
  const media = Array.isArray(raw.media)
    ? raw.media
        .map((m) => pickMediaUrl(m))
        .filter(Boolean)
        .map((url) => toAbsoluteImageUrl(url))
        .map((url) => toProxyImageUrl(url))
        .filter(Boolean)
    : [];

  const videos = Array.isArray(raw.videos)
    ? raw.videos.filter((v) => v?.source_url || v?.youtube_url)
    : [];

  return {
    id: String(raw.id || ''),
    name: String(raw.name || ''),
    description: String(raw.description || ''),
    manufacturer: {
      code: String(raw.manufacturer?.code || ''),
      name: String(raw.manufacturer?.name || ''),
    },
    focus: String(raw.focus || ''),
    type: String(raw.type || ''),
    size: String(raw.size || '').toLowerCase(),
    flyable: String(raw.production_status || '') === 'flight-ready',
    productionStatus: String(raw.production_status || ''),
    crew: {
      min: Number(raw.min_crew || 0),
      max: Number(raw.max_crew || 0),
    },
    speed: {
      scm: Number(raw.scm_speed || 0),
      afterburner: Number(raw.afterburner_speed || 0),
    },
    dimensions: {
      length: Number(raw.length || 0),
      beam: Number(raw.beam || 0),
      height: Number(raw.height || 0),
    },
    mass: Number(raw.mass || 0),
    cargo: Number(raw.cargocapacity || 0),
    pledgeCost: String(raw.pledge_cost || ''),
    url: String(raw.url || ''),
    youtubeId: getShipYouTubeId(raw.name),
    media,
    videos: videos.map((v) => ({
      title: String(v.title || ''),
      source_url: String(v.source_url || v.youtube_url || ''),
    })),
  };
}

async function fetchShipMatrix() {
  const now = Date.now();

  if (shipsCache && now - shipsCache.fetchedAt < CACHE_TTL_MS) {
    logger.debug('Returning cached ship matrix');
    return shipsCache.data;
  }

  logger.info('Fetching RSI ship matrix...');

  const response = await fetch(RSI_SHIP_MATRIX_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 OmniCore/1.0',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`RSI ship matrix returned ${response.status}`);
  }

  const json = await response.json();

  if (!json?.data || !Array.isArray(json.data)) {
    throw new Error('Unexpected RSI ship matrix format');
  }

  const ships = json.data.map(normalizeShip).filter((s) => s.name);

  shipsCache = { data: ships, fetchedAt: now };
  logger.info(`Ship matrix cached: ${ships.length} flyable ships`);

  return ships;
}

export function registerShipRoutes(app) {
  // GET /api/ships/image?src=<remote-image-url> — fetch once and serve from local disk cache.
  app.get('/api/ships/image', async (req, res) => shipImageCache.serveExpressRequest(req, res));

  // POST /api/ships/cache/warm?limit=120&perShip=1&concurrency=4 — prefetch ship images in bulk.
  app.post('/api/ships/cache/warm', async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(Number(req.query.limit) || 120, 500));
      const perShip = Math.max(1, Math.min(Number(req.query.perShip) || 1, 5));
      const concurrency = Math.max(1, Math.min(Number(req.query.concurrency) || 4, 12));

      const ships = await fetchShipMatrix();
      const selectedShips = ships.slice(0, limit);

      const sourceUrls = selectedShips
        .flatMap((ship) => (ship.media || []).slice(0, perShip))
        .map((proxyUrl) => shipImageCache.extractSourceFromProxyUrl(proxyUrl))
        .filter(Boolean);

      const result = await shipImageCache.warm(sourceUrls, {
        limit: sourceUrls.length,
        concurrency,
      });

      return res.json({
        warmedShips: selectedShips.length,
        perShip,
        concurrency,
        ...result,
      });
    } catch (error) {
      logger.error('Ship cache warm failed', { error: error.message });
      return res.status(500).json({ error: 'Failed to warm ship image cache' });
    }
  });

  // GET /api/ships/meta/manufacturers — must be before /:id
  app.get('/api/ships/meta/manufacturers', async (_req, res) => {
    try {
      const ships = await fetchShipMatrix();
      const seen = new Map();

      for (const s of ships) {
        if (s.manufacturer.code && !seen.has(s.manufacturer.code)) {
          seen.set(s.manufacturer.code, s.manufacturer.name);
        }
      }

      const manufacturers = Array.from(seen.entries())
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

      res.json({ manufacturers });
    } catch (err) {
      logger.error('Failed to fetch manufacturers', { error: err.message });
      res.status(502).json({ error: 'Unable to reach ship database' });
    }
  });

  // GET /api/ships — all ships with optional ?search= &manufacturer= &size=
  app.get('/api/ships', async (req, res) => {
    try {
      let ships = await fetchShipMatrix();

      const { manufacturer, size, search } = req.query;

      if (manufacturer && typeof manufacturer === 'string' && manufacturer.length <= 10) {
        const code = manufacturer.toUpperCase().slice(0, 10);
        ships = ships.filter((s) => s.manufacturer.code === code);
      }

      if (size && typeof size === 'string' && size.length <= 20) {
        ships = ships.filter((s) => s.size === size.toLowerCase().slice(0, 20));
      }

      if (search && typeof search === 'string') {
        const term = search.toLowerCase().slice(0, 100);
        ships = ships.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.manufacturer.name.toLowerCase().includes(term) ||
            s.focus.toLowerCase().includes(term),
        );
      }

      res.json({ ships, total: ships.length });
    } catch (err) {
      logger.error('Failed to fetch ships', { error: err.message });
      res.status(502).json({ error: 'Unable to reach ship database' });
    }
  });

  // GET /api/ships/:id — single ship
  app.get('/api/ships/:id', async (req, res) => {
    const { id } = req.params;

    if (!/^\d+$/.test(id) || id.length > 10) {
      return res.status(400).json({ error: 'Invalid ship ID' });
    }

    try {
      const ships = await fetchShipMatrix();
      const ship = ships.find((s) => s.id === id);

      if (!ship) {
        return res.status(404).json({ error: 'Ship not found' });
      }

      res.json({ ship });
    } catch (err) {
      logger.error('Failed to fetch ship', { error: err.message });
      res.status(502).json({ error: 'Unable to reach ship database' });
    }
  });

  logger.info('Ship routes registered: /api/ships, /api/ships/image, /api/ships/cache/warm, /api/ships/meta/manufacturers, /api/ships/:id');
}
