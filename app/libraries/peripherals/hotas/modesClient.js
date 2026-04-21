export const HOTAS_MODES = ['green', 'orange', 'red'];

export async function fetchModeState() {
  const response = await fetch('/api/hotas/modes/state');
  if (!response.ok) {
    throw new Error(`Failed to fetch mode state (${response.status})`);
  }
  return response.json();
}

export async function saveModeState(payload = {}) {
  const response = await fetch('/api/hotas/modes/state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to save mode state (${response.status})`);
  }

  return response.json();
}

export async function saveModeBindings({ buttonId, green, orange, red }) {
  const response = await fetch('/api/hotas/modes/bindings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ buttonId, green, orange, red }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to save mode bindings (${response.status})`);
  }

  return response.json();
}

export async function fetchModeBindings() {
  const response = await fetch('/api/hotas/modes/bindings');
  if (!response.ok) {
    throw new Error(`Failed to fetch mode bindings (${response.status})`);
  }
  return response.json();
}

export async function importModeBindings({ bindings }) {
  const response = await fetch('/api/hotas/modes/bindings/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bindings }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to import mode bindings (${response.status})`);
  }

  return response.json();
}

export async function testFireModeBinding({ buttonId = 'button4', mode, dryRun = false } = {}) {
  const response = await fetch('/api/hotas/modes/test-fire', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      buttonId,
      mode,
      dryRun,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to execute test fire (${response.status})`);
  }

  return response.json();
}

export async function sendModeButtonEvent({ buttonId, mode, dryRun = false } = {}) {
  const response = await fetch('/api/hotas/modes/button-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      buttonId,
      mode,
      dryRun,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to send mode button event (${response.status})`);
  }

  return response.json();
}
