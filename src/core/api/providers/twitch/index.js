import { apiGet } from '../../client';

export async function fetchTwitchChannelVideos({ channel = 'starcitizen', limit = 24 } = {}) {
  const params = new URLSearchParams({ channel: String(channel), limit: String(limit) });
  return apiGet(`/api/media/twitch/videos?${params.toString()}`);
}
