import { apiGet } from '../../client';

export async function fetchYouTubeChannelVideos({ handle = '@RobertsSpaceInd', limit = 24 } = {}) {
  const params = new URLSearchParams({ handle: String(handle), limit: String(limit) });
  return apiGet(`/api/media/youtube/channel?${params.toString()}`);
}

export async function fetchYouTubePlaylistVideos({
  playlistId = 'PLVct2QDhDrB2-Edu0jm18lz0W9NRcXy3Y',
  limit = 24,
} = {}) {
  const params = new URLSearchParams({ playlistId: String(playlistId), limit: String(limit) });
  return apiGet(`/api/media/youtube/playlist?${params.toString()}`);
}
