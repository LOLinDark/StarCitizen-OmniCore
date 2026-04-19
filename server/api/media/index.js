import { createLogger } from '../../lib/logger.js';
import {
  fetchChannelVideos as fetchTwitchChannelVideos,
  fetchChannelLiveStatus as fetchTwitchChannelLiveStatus,
  TWITCH_DEFAULTS,
} from '../providers/twitch/index.js';
import {
  fetchChannelVideos as fetchYoutubeChannelVideos,
  fetchPlaylistVideos as fetchYoutubePlaylistVideos,
  YOUTUBE_DEFAULTS,
} from '../providers/youtube/index.js';
import { addLiveFollow, getLiveFollows, removeLiveFollow } from '../../lib/liveFollowsStore.js';

const logger = createLogger('api.media');

const CACHE_TTL_MS = 5 * 60 * 1000;
const LIVE_SOON_ACTIVITY_WINDOW_MS = 8 * 60 * 60 * 1000;
const OFFICIAL_LIVE_CHANNELS = [
  {
    id: 'official:twitch:starcitizen',
    label: 'Star Citizen Official',
    platform: 'twitch',
    username: TWITCH_DEFAULTS.channelLogin,
    url: `https://www.twitch.tv/${encodeURIComponent(TWITCH_DEFAULTS.channelLogin)}`,
  },
];

let aerobookCache = null;
const liveStatusMemory = new Map();

function toTimestamp(value) {
  const ts = Date.parse(String(value || ''));
  return Number.isFinite(ts) ? ts : 0;
}

function sortByNewest(items) {
  return [...items].sort((a, b) => toTimestamp(b.publishedAt) - toTimestamp(a.publishedAt));
}

function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function dedupeVideos(videos) {
  const seen = new Set();
  const output = [];

  videos.forEach((video) => {
    const strictKey = `${video.source}:${video.externalId}`;
    const softKey = `${normalizeTitle(video.title)}|${String(video.publishedAt || '').slice(0, 10)}`;

    if (seen.has(strictKey) || seen.has(softKey)) {
      return;
    }

    seen.add(strictKey);
    seen.add(softKey);
    output.push(video);
  });

  return output;
}

function mapToAerobookPost(video, category) {
  return {
    id: `${video.source}-${video.externalId}`,
    category,
    source: video.source,
    sourceLabel: video.sourceLabel,
    title: video.title,
    publishedAt: video.publishedAt,
    timestamp: video.publishedAt,
    creatorHandle: video.creatorHandle,
    creatorName: video.creatorName,
    creatorAvatar: video.creatorAvatar,
    thumbnailUrl: video.thumbnailUrl,
    viewCount: Number(video.viewCount || 0),
    likeCount: 0,
    youtubeId: video.source === 'youtube' ? video.externalId : null,
    twitchId: video.source === 'twitch' ? video.externalId : null,
    url: video.url,
  };
}

async function buildAerobookFeed({ limit = 24 } = {}) {
  const listLimit = Number(limit) || 24;

  const [youtubeVerse, twitchVerse, squadronPlaylist] = await Promise.all([
    fetchYoutubeChannelVideos({ handle: YOUTUBE_DEFAULTS.channelHandle, limit: listLimit }),
    fetchTwitchChannelVideos({ channelLogin: TWITCH_DEFAULTS.channelLogin, limit: listLimit }),
    fetchYoutubePlaylistVideos({ playlistId: YOUTUBE_DEFAULTS.squadronPlaylistId, limit: listLimit }),
  ]);

  const verseVideos = sortByNewest(dedupeVideos([...youtubeVerse, ...twitchVerse])).slice(0, listLimit);
  const squadronVideos = sortByNewest(dedupeVideos(squadronPlaylist)).slice(0, listLimit);

  const categories = {
    'star-citizen': verseVideos.map((video) => mapToAerobookPost(video, 'star-citizen')),
    'squadron-42': squadronVideos.map((video) => mapToAerobookPost(video, 'squadron-42')),
  };

  const allPosts = sortByNewest([...categories['star-citizen'], ...categories['squadron-42']]);
  const latestVideo = allPosts[0] || null;

  return {
    generatedAt: new Date().toISOString(),
    latestPublishedAt: latestVideo?.publishedAt || null,
    latestVideo,
    categories,
    sources: {
      verseYoutube: YOUTUBE_DEFAULTS.channelHandle,
      verseTwitch: TWITCH_DEFAULTS.channelLogin,
      squadronPlaylistId: YOUTUBE_DEFAULTS.squadronPlaylistId,
    },
  };
}

async function getAerobookFeedCached({ force = false, limit = 24 } = {}) {
  if (!force && aerobookCache && (Date.now() - aerobookCache.cachedAt) < CACHE_TTL_MS) {
    return aerobookCache.payload;
  }

  const payload = await buildAerobookFeed({ limit });
  aerobookCache = {
    cachedAt: Date.now(),
    payload,
  };

  return payload;
}

function getLiveMemoryKey({ platform, username }) {
  return `${String(platform || '').toLowerCase()}:${String(username || '').toLowerCase()}`;
}

function getLiveCapabilities(platform) {
  return {
    liveStatus: platform === 'twitch',
    upcomingSignal: true,
    officialAlerts: platform === 'twitch',
  };
}

function buildUnsupportedStatus({ platform, username, checkedAt }) {
  return {
    source: platform,
    provider: platform,
    channelLogin: username,
    checkedAt,
    state: 'unsupported',
    isLive: false,
    found: null,
    unsupported: true,
    message: `${platform} live status is not integrated yet`,
    stream: null,
    upcoming: null,
    capabilities: getLiveCapabilities(platform),
  };
}

function buildErrorStatus({ platform, username, checkedAt, message }) {
  return {
    source: platform,
    provider: platform,
    channelLogin: username,
    checkedAt,
    state: 'unknown',
    isLive: false,
    found: false,
    error: message,
    stream: null,
    upcoming: null,
    capabilities: getLiveCapabilities(platform),
  };
}

function buildLiveStatusEnvelope({ platform, username, rawStatus, checkedAt }) {
  const key = getLiveMemoryKey({ platform, username });
  const previous = liveStatusMemory.get(key) || {};
  const normalizedState = rawStatus?.isLive ? 'live' : 'offline';

  let lastSeenLiveAt = previous.lastSeenLiveAt || null;
  if (rawStatus?.isLive) {
    lastSeenLiveAt = checkedAt;
  }

  liveStatusMemory.set(key, {
    lastSeenLiveAt,
    isLive: Boolean(rawStatus?.isLive),
    checkedAt,
  });

  let upcoming = null;
  if (!rawStatus?.isLive && lastSeenLiveAt) {
    const lastLiveTs = toTimestamp(lastSeenLiveAt);
    const withinWindow = lastLiveTs > 0 && (Date.now() - lastLiveTs) <= LIVE_SOON_ACTIVITY_WINDOW_MS;
    if (withinWindow) {
      upcoming = {
        isSoon: true,
        signal: 'recent-activity',
        message: 'Channel was live recently. Monitoring for the next session.',
        lastSeenLiveAt,
      };
    }
  }

  return {
    ...rawStatus,
    source: platform,
    provider: platform,
    channelLogin: rawStatus?.channelLogin || username,
    checkedAt,
    state: normalizedState,
    upcoming,
    lastSeenLiveAt,
    capabilities: getLiveCapabilities(platform),
  };
}

async function resolveFollowLiveStatus({ platform, username }) {
  const checkedAt = new Date().toISOString();

  if (platform !== 'twitch') {
    return buildUnsupportedStatus({ platform, username, checkedAt });
  }

  try {
    const rawStatus = await fetchTwitchChannelLiveStatus({ channelLogin: username });
    return buildLiveStatusEnvelope({ platform, username, rawStatus, checkedAt });
  } catch (error) {
    return buildErrorStatus({
      platform,
      username,
      checkedAt,
      message: error.message,
    });
  }
}

export function registerMediaRoutes(app) {
  app.get('/api/media/youtube/channel', async (req, res) => {
    try {
      const handle = String(req.query.handle || YOUTUBE_DEFAULTS.channelHandle);
      const limit = Number(req.query.limit || 24);
      const videos = await fetchYoutubeChannelVideos({ handle, limit });
      res.json({ handle, videos });
    } catch (error) {
      logger.error('YouTube channel route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch YouTube channel videos' });
    }
  });

  app.get('/api/media/youtube/playlist', async (req, res) => {
    try {
      const playlistId = String(req.query.playlistId || YOUTUBE_DEFAULTS.squadronPlaylistId);
      const limit = Number(req.query.limit || 24);
      const videos = await fetchYoutubePlaylistVideos({ playlistId, limit });
      res.json({ playlistId, videos });
    } catch (error) {
      logger.error('YouTube playlist route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch YouTube playlist videos' });
    }
  });

  app.get('/api/media/twitch/videos', async (req, res) => {
    try {
      const channel = String(req.query.channel || TWITCH_DEFAULTS.channelLogin);
      const limit = Number(req.query.limit || 24);
      const videos = await fetchTwitchChannelVideos({ channelLogin: channel, limit });
      res.json({ channel, videos });
    } catch (error) {
      logger.error('Twitch videos route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch Twitch videos' });
    }
  });

  app.get('/api/media/twitch/live', async (req, res) => {
    try {
      const channel = String(req.query.channel || TWITCH_DEFAULTS.channelLogin);
      const live = await fetchTwitchChannelLiveStatus({ channelLogin: channel });
      res.json(live);
    } catch (error) {
      logger.error('Twitch live route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch Twitch live status' });
    }
  });

  app.get('/api/media/live/follows', async (req, res) => {
    try {
      const profileId = String(req.query.profileId || 'default');
      const follows = getLiveFollows(profileId);
      const checkedAt = new Date().toISOString();

      const liveStatuses = await Promise.all(
        follows.map(async (follow) => ({
          ...follow,
          status: await resolveFollowLiveStatus({
            platform: follow.platform,
            username: follow.username,
          }),
        }))
      );

      res.json({
        profileId,
        checkedAt,
        follows: liveStatuses,
        platforms: ['twitch', 'youtube', 'kick', 'steam'],
      });
    } catch (error) {
      logger.error('Live follows route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch followed live channels' });
    }
  });

  app.get('/api/media/live/official', async (_req, res) => {
    try {
      const checkedAt = new Date().toISOString();
      const official = await Promise.all(
        OFFICIAL_LIVE_CHANNELS.map(async (channel) => ({
          ...channel,
          status: await resolveFollowLiveStatus({
            platform: channel.platform,
            username: channel.username,
          }),
        }))
      );

      res.json({
        checkedAt,
        official,
        providers: ['twitch', 'youtube', 'kick', 'steam'],
      });
    } catch (error) {
      logger.error('Official live route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch official live channels' });
    }
  });

  app.post('/api/media/live/follows', async (req, res) => {
    try {
      const profileId = String(req.body?.profileId || 'default');
      const platform = String(req.body?.platform || '');
      const username = String(req.body?.username || '');

      const follows = addLiveFollow({ profileId, platform, username });
      res.status(201).json({ profileId, follows });
    } catch (error) {
      logger.error('Add live follow failed', error.message);
      res.status(400).json({ error: error.message || 'Failed to add followed channel' });
    }
  });

  app.delete('/api/media/live/follows/:followId', async (req, res) => {
    try {
      const profileId = String(req.query.profileId || 'default');
      const followId = String(req.params.followId || '');

      const follows = removeLiveFollow({ profileId, followId });
      res.json({ profileId, follows });
    } catch (error) {
      logger.error('Remove live follow failed', error.message);
      res.status(400).json({ error: error.message || 'Failed to remove followed channel' });
    }
  });

  app.get('/api/media/aerobook', async (req, res) => {
    try {
      const limit = Number(req.query.limit || 24);
      const force = String(req.query.force || 'false') === 'true';
      const payload = await getAerobookFeedCached({ force, limit });
      res.json(payload);
    } catch (error) {
      logger.error('Aerobook feed route failed', error.message);
      res.status(500).json({ error: 'Failed to build Aerobook feed' });
    }
  });

  app.get('/api/media/latest', async (req, res) => {
    try {
      const payload = await getAerobookFeedCached({ force: false, limit: 24 });
      res.json({
        latestPublishedAt: payload.latestPublishedAt,
        latestVideo: payload.latestVideo,
        generatedAt: payload.generatedAt,
      });
    } catch (error) {
      logger.error('Latest media route failed', error.message);
      res.status(500).json({ error: 'Failed to fetch latest media metadata' });
    }
  });
}
