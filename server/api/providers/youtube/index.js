import { createLogger } from '../../../lib/logger.js';

const logger = createLogger('api.youtube');

const CHANNEL_HANDLE = '@RobertsSpaceInd';
const CHANNEL_ID_FALLBACK = 'UCTeLqJq1mXUX5WWoNXLmOIA';
const PLAYLIST_ID = 'PLVct2QDhDrB2-Edu0jm18lz0W9NRcXy3Y';
const FEED_BASE = 'https://www.youtube.com/feeds/videos.xml';
const CHANNEL_RESOLVE_TTL_MS = 6 * 60 * 60 * 1000;

const channelIdCache = new Map();

function decodeEntities(input = '') {
  return String(input)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function readTag(block, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = String(block || '').match(pattern);
  return match ? decodeEntities(match[1]) : '';
}

function readAttr(block, tagName, attrName) {
  const pattern = new RegExp(`<${tagName}[^>]*\\s${attrName}="([^"]+)"[^>]*>`, 'i');
  const match = String(block || '').match(pattern);
  return match ? decodeEntities(match[1]) : '';
}

function parseFeed(xmlText, sourceLabel) {
  const entries = [...String(xmlText || '').matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]);

  return entries
    .map((entry) => {
      const videoId = readTag(entry, 'yt:videoId');
      if (!videoId) {
        return null;
      }

      const title = readTag(entry, 'title');
      const publishedAt = readTag(entry, 'published');
      const creatorName = readTag(entry, 'name') || 'Star Citizen';
      const thumbnailUrl = readAttr(entry, 'media:thumbnail', 'url');

      return {
        source: 'youtube',
        sourceLabel,
        externalId: videoId,
        title,
        publishedAt,
        creatorName,
        creatorHandle: `@${creatorName.replace(/\s+/g, '')}`,
        creatorAvatar: null,
        thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount: null,
      };
    })
    .filter(Boolean);
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'OmniCore/0.1.0 (+https://localhost:4242)'
    }
  });

  if (!response.ok) {
    throw new Error(`YouTube feed request failed (${response.status})`);
  }

  return response.text();
}

export async function resolveChannelIdByHandle(handle = CHANNEL_HANDLE) {
  const now = Date.now();
  const key = String(handle).toLowerCase();
  const cached = channelIdCache.get(key);

  if (cached && now - cached.cachedAt < CHANNEL_RESOLVE_TTL_MS) {
    return cached.channelId;
  }

  try {
    const response = await fetch(`https://www.youtube.com/${handle}`, {
      headers: {
        'User-Agent': 'OmniCore/0.1.0 (+https://localhost:4242)'
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube channel resolve failed (${response.status})`);
    }

    const html = await response.text();
    const patterns = [
      /"channelId":"(UC[^"]+)"/i,
      /"externalId":"(UC[^"]+)"/i,
      /https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)/i,
      /"browseId":"(UC[^"]+)"/i,
    ];

    const match = patterns
      .map((pattern) => html.match(pattern))
      .find(Boolean);

    if (match?.[1]) {
      const channelId = match[1];
      channelIdCache.set(key, { channelId, cachedAt: now });
      logger.debug('Resolved YouTube handle', handle, channelId);
      return channelId;
    }
  } catch (error) {
    logger.warn('YouTube handle resolution failed, using fallback channel id', handle, error.message);
  }

  channelIdCache.set(key, { channelId: CHANNEL_ID_FALLBACK, cachedAt: now });
  return CHANNEL_ID_FALLBACK;
}

export async function fetchChannelVideos({ handle = CHANNEL_HANDLE, limit = 20 } = {}) {
  const channelId = await resolveChannelIdByHandle(handle);
  const feedUrl = `${FEED_BASE}?channel_id=${encodeURIComponent(channelId)}`;
  const xml = await fetchFeed(feedUrl);
  return parseFeed(xml, 'youtube-channel').slice(0, Number(limit) || 20);
}

export async function fetchPlaylistVideos({ playlistId = PLAYLIST_ID, limit = 20 } = {}) {
  const feedUrl = `${FEED_BASE}?playlist_id=${encodeURIComponent(playlistId)}`;
  const xml = await fetchFeed(feedUrl);
  return parseFeed(xml, 'youtube-playlist').slice(0, Number(limit) || 20);
}

export const YOUTUBE_DEFAULTS = {
  channelHandle: CHANNEL_HANDLE,
  channelId: CHANNEL_ID_FALLBACK,
  squadronPlaylistId: PLAYLIST_ID,
};
