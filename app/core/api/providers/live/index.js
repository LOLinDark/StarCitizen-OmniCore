import { apiGet, apiPost, apiRequest } from '../../client';

const PROFILE_ID = 'default';

export async function fetchLiveFollows({ profileId = PROFILE_ID } = {}) {
  const params = new URLSearchParams({ profileId: String(profileId) });
  return apiGet(`/api/media/live/follows?${params.toString()}`);
}

export async function addLiveFollow({ profileId = PROFILE_ID, platform, username }) {
  return apiPost('/api/media/live/follows', {
    profileId,
    platform,
    username,
  });
}

export async function removeLiveFollow({ profileId = PROFILE_ID, followId }) {
  const params = new URLSearchParams({ profileId: String(profileId) });
  return apiRequest(`/api/media/live/follows/${encodeURIComponent(followId)}?${params.toString()}`, {
    method: 'DELETE',
  });
}

export async function fetchOfficialLive() {
  return apiGet('/api/media/live/official');
}
