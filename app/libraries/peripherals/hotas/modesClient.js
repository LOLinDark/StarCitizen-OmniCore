export async function fetchProfileModeOverrides(profileName) {
  const safeProfile = encodeURIComponent(String(profileName || ''));
  const response = await fetch(`/api/hotas/profile/${safeProfile}/mode-overrides`);
  if (!response.ok) {
    throw new Error(`Failed to fetch profile mode overrides (${response.status})`);
  }
  return response.json();
}

export async function saveProfileModeOverrides(profileName, modeHotasOverrides = {}) {
  const safeProfile = encodeURIComponent(String(profileName || ''));
  const response = await fetch(`/api/hotas/profile/${safeProfile}/mode-overrides`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ modeHotasOverrides }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to save profile mode overrides (${response.status})`);
  }

  return response.json();
}
