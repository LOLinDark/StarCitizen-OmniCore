import { createLogger } from '../../../lib/logger.js';

const logger = createLogger('api.twitch');

const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';
const TWITCH_PUBLIC_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
const DEFAULT_CHANNEL_LOGIN = 'starcitizen';

const TWITCH_VIDEOS_QUERY = `
  query OmniCoreChannelVideos($login: String!, $limit: Int!) {
    user(login: $login) {
      videos(first: $limit, type: ARCHIVE, sort: TIME) {
        edges {
          node {
            id
            title
            publishedAt
            createdAt
            lengthSeconds
            previewThumbnailURL
            viewCount
            owner {
              displayName
              profileImageURL(width: 70)
            }
          }
        }
      }
    }
  }
`;

const TWITCH_LIVE_QUERY = `
  query OmniCoreChannelLive($login: String!) {
    user(login: $login) {
      id
      login
      displayName
      profileImageURL(width: 70)
      stream {
        id
        title
        viewersCount
        game {
          name
        }
        previewImageURL(width: 640, height: 360)
      }
    }
  }
`;

function normalizeThumbnail(url) {
  return String(url || '')
    .replace('{width}', '640')
    .replace('{height}', '360');
}

export async function fetchChannelVideos({ channelLogin = DEFAULT_CHANNEL_LOGIN, limit = 20 } = {}) {
  const body = {
    query: TWITCH_VIDEOS_QUERY,
    variables: {
      login: channelLogin,
      limit: Number(limit) || 20,
    },
  };

  const response = await fetch(TWITCH_GQL_URL, {
    method: 'POST',
    headers: {
      'Client-Id': TWITCH_PUBLIC_CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Twitch request failed (${response.status})`);
  }

  const payload = await response.json();
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(`Twitch GraphQL error: ${payload.errors[0].message}`);
  }

  const edges = payload?.data?.user?.videos?.edges || [];
  const videos = edges
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map((node) => ({
      source: 'twitch',
      sourceLabel: 'twitch-channel',
      externalId: String(node.id),
      title: node.title || 'Untitled Twitch Video',
      publishedAt: node.publishedAt || node.createdAt,
      creatorName: node.owner?.displayName || 'Star Citizen',
      creatorHandle: `@${(node.owner?.displayName || 'StarCitizen').replace(/\s+/g, '')}`,
      creatorAvatar: node.owner?.profileImageURL || null,
      thumbnailUrl: normalizeThumbnail(node.previewThumbnailURL),
      url: `https://www.twitch.tv/videos/${node.id}`,
      viewCount: Number(node.viewCount || 0),
      lengthSeconds: Number(node.lengthSeconds || 0),
    }));

  logger.debug('Fetched Twitch videos', { channelLogin, count: videos.length });
  return videos;
}

export async function fetchChannelLiveStatus({ channelLogin = DEFAULT_CHANNEL_LOGIN } = {}) {
  const login = String(channelLogin || '').trim().toLowerCase();
  if (!login) {
    throw new Error('channelLogin is required');
  }

  const response = await fetch(TWITCH_GQL_URL, {
    method: 'POST',
    headers: {
      'Client-Id': TWITCH_PUBLIC_CLIENT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: TWITCH_LIVE_QUERY,
      variables: { login },
    }),
  });

  if (!response.ok) {
    throw new Error(`Twitch request failed (${response.status})`);
  }

  const payload = await response.json();
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(`Twitch GraphQL error: ${payload.errors[0].message}`);
  }

  const user = payload?.data?.user;
  if (!user) {
    return {
      source: 'twitch',
      channelLogin: login,
      found: false,
      isLive: false,
    };
  }

  const stream = user.stream;
  return {
    source: 'twitch',
    channelLogin: user.login || login,
    found: true,
    isLive: Boolean(stream),
    stream: stream
      ? {
          id: String(stream.id),
          title: stream.title || 'Live on Twitch',
          viewersCount: Number(stream.viewersCount || 0),
          gameName: stream.game?.name || null,
          thumbnailUrl: normalizeThumbnail(stream.previewImageURL),
          url: `https://www.twitch.tv/${encodeURIComponent(user.login || login)}`,
        }
      : null,
    creatorName: user.displayName || user.login || login,
    creatorAvatar: user.profileImageURL || null,
  };
}

export const TWITCH_DEFAULTS = {
  channelLogin: DEFAULT_CHANNEL_LOGIN,
};
