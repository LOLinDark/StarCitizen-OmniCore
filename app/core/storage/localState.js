export function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures to keep the UI functional.
  }
}

export function readTextStorage(key, fallback = '') {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeTextStorage(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage failures to keep the UI functional.
  }
}

export function removeStorageKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures to keep the UI functional.
  }
}

export function getStorageKeysByPrefix(prefix) {
  try {
    const keys = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  } catch {
    return [];
  }
}

export function clearStorageKeys(keys = []) {
  keys.forEach((key) => {
    removeStorageKey(key);
  });
}

export function clearOmniCoreStorage() {
  clearStorageKeys([
    'omni-core-app',
    'omni-core-settings',
    'omnicore.analytics.queue.v1',
    'errorLog',
    'aiRules',
    'aiConfig',
    'aiPrompts'
  ]);

  clearStorageKeys(getStorageKeysByPrefix('history_'));
  clearStorageKeys(getStorageKeysByPrefix('data_'));
}