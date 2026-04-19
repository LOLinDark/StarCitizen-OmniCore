import { createHash } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

function normalizeAllowedHosts(hosts = []) {
  return new Set(
    hosts
      .map((h) => String(h || '').trim().toLowerCase())
      .filter(Boolean),
  );
}

function getImageExtensionFromUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    const pathname = parsed.pathname.toLowerCase();

    if (pathname.endsWith('.png')) return '.png';
    if (pathname.endsWith('.webp')) return '.webp';
    if (pathname.endsWith('.jpeg')) return '.jpeg';
    if (pathname.endsWith('.jpg')) return '.jpg';
  } catch {
    // Ignore parse failures and fall back.
  }

  return '.jpg';
}

export function createRemoteImageCache({
  logger,
  cacheDir,
  proxyPath,
  queryParam = 'src',
  allowedHosts = [],
  userAgent = 'Mozilla/5.0 OmniCore/1.0',
  timeoutMs = 20000,
}) {
  if (!cacheDir || !proxyPath) {
    throw new Error('cacheDir and proxyPath are required for remote image cache');
  }

  const hostAllowList = normalizeAllowedHosts(allowedHosts);

  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  function getProxyUrl(sourceUrl) {
    const src = String(sourceUrl || '').trim();
    if (!src) return '';
    return `${proxyPath}?${queryParam}=${encodeURIComponent(src)}`;
  }

  function extractSourceFromProxyUrl(proxyUrl) {
    const value = String(proxyUrl || '').trim();
    if (!value) return '';

    try {
      const parsed = new URL(value, 'http://localhost');
      if (!parsed.pathname.startsWith(proxyPath)) {
        return '';
      }
      return String(parsed.searchParams.get(queryParam) || '').trim();
    } catch {
      return '';
    }
  }

  function validateSourceUrl(raw) {
    const src = String(raw || '').trim();
    if (!src || src.length > 2000) {
      return { error: 'Invalid image source URL' };
    }

    let parsed;
    try {
      parsed = new URL(src);
    } catch {
      return { error: 'Malformed image source URL' };
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { error: 'Invalid image protocol' };
    }

    if (hostAllowList.size > 0 && !hostAllowList.has(parsed.hostname.toLowerCase())) {
      return { error: 'Image host is not allowed' };
    }

    return { src, parsed };
  }

  function getCacheFilePath(sourceUrl) {
    const ext = getImageExtensionFromUrl(sourceUrl);
    const digest = createHash('sha1').update(sourceUrl).digest('hex');
    return join(cacheDir, `${digest}${ext}`);
  }

  async function fetchAndCache(sourceUrl) {
    const validated = validateSourceUrl(sourceUrl);
    if (validated.error) {
      throw new Error(validated.error);
    }

    const filePath = getCacheFilePath(validated.src);

    if (existsSync(filePath)) {
      return { filePath, fromCache: true };
    }

    const response = await fetch(validated.src, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Upstream image fetch failed with ${response.status}`);
    }

    const contentType = String(response.headers.get('content-type') || '');
    if (!contentType.startsWith('image/')) {
      throw new Error(`Unexpected image content-type: ${contentType}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(filePath, imageBuffer);
    return { filePath, fromCache: false };
  }

  async function serveExpressRequest(req, res) {
    const sourceUrl = String(req.query?.[queryParam] || '').trim();
    const validated = validateSourceUrl(sourceUrl);

    if (validated.error) {
      return res.status(400).json({ error: validated.error });
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    try {
      const { filePath } = await fetchAndCache(validated.src);
      return res.sendFile(filePath);
    } catch (error) {
      logger?.warn?.('Remote image cache fetch failed', { error: error.message, src: validated.src });
      return res.status(502).json({ error: 'Unable to fetch image' });
    }
  }

  async function warm(sourceUrls, { limit = 100, concurrency = 4 } = {}) {
    const maxItems = Math.max(1, Math.min(Number(limit) || 100, 1000));
    const workerCount = Math.max(1, Math.min(Number(concurrency) || 4, 16));

    const unique = Array.from(new Set((sourceUrls || []).map((v) => String(v || '').trim()).filter(Boolean))).slice(0, maxItems);

    let index = 0;
    let cached = 0;
    let downloaded = 0;
    let failed = 0;

    async function worker() {
      while (index < unique.length) {
        const current = unique[index++];
        try {
          const result = await fetchAndCache(current);
          if (result.fromCache) cached += 1;
          else downloaded += 1;
        } catch {
          failed += 1;
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(workerCount, unique.length || 1) }, () => worker()));

    return {
      requested: unique.length,
      cached,
      downloaded,
      failed,
    };
  }

  return {
    getProxyUrl,
    extractSourceFromProxyUrl,
    serveExpressRequest,
    warm,
  };
}
