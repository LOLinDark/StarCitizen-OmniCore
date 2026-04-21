const MAX_QUEUE_SIZE = 200;
const MAX_PROPERTIES = 24;
const MAX_VALUE_LENGTH = 200;
const EVENT_NAME_PATTERN = /^[a-z0-9][a-z0-9._:-]{2,63}$/;
const SENSITIVE_KEY_PATTERN = /(email|password|token|secret|phone|address|auth|apikey|api-key|key)/i;

function createSessionId() {
  return `s_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return String(value).slice(0, MAX_VALUE_LENGTH);
}

export function sanitizeProperties(properties = {}) {
  if (!isObject(properties)) {
    return {};
  }

  const output = {};

  Object.entries(properties)
    .slice(0, MAX_PROPERTIES)
    .forEach(([key, value]) => {
      if (!key || typeof key !== 'string') {
        return;
      }

      if (SENSITIVE_KEY_PATTERN.test(key)) {
        return;
      }

      output[key.slice(0, 48)] = sanitizeValue(value);
    });

  return output;
}

function createStorage(storageKey) {
  return {
    read() {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
          return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    write(events) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(events));
      } catch {
        // Ignore storage failures to avoid breaking the app.
      }
    }
  };
}

function canSendToEndpoint(endpoint) {
  if (!endpoint) {
    return false;
  }

  try {
    const url = new URL(endpoint);
    const isLocalhost = ['localhost', '127.0.0.1'].includes(url.hostname);
    return url.protocol === 'https:' || isLocalhost;
  } catch {
    return false;
  }
}

export function createAnalyticsClient({
  appId,
  endpoint,
  enabled,
  flushIntervalMs,
  storageKey = 'omnicore.analytics.queue.v1'
}) {
  const storage = createStorage(storageKey);
  const sessionId = createSessionId();
  const safeEndpoint = canSendToEndpoint(endpoint) ? endpoint : '';
  let queue = storage.read().slice(-MAX_QUEUE_SIZE);
  let sentCount = 0;
  let droppedCount = 0;
  let flushTimer = null;

  function persist() {
    storage.write(queue);
  }

  function buildEvent(name, properties) {
    if (!EVENT_NAME_PATTERN.test(name)) {
      droppedCount += 1;
      return null;
    }

    return {
      id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      appId,
      sessionId,
      timestamp: new Date().toISOString(),
      properties: sanitizeProperties(properties)
    };
  }

  async function flush() {
    if (!enabled || !safeEndpoint || queue.length === 0) {
      return;
    }

    const batch = queue.slice(0, 20);
    const payload = JSON.stringify({
      appId,
      sessionId,
      sentAt: new Date().toISOString(),
      events: batch
    });

    let sent = false;

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        sent = navigator.sendBeacon(safeEndpoint, blob);
      } catch {
        sent = false;
      }
    }

    if (!sent) {
      try {
        const response = await fetch(safeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: payload,
          keepalive: true
        });
        sent = response.ok;
      } catch {
        sent = false;
      }
    }

    if (sent) {
      queue = queue.slice(batch.length);
      sentCount += batch.length;
      persist();
    }
  }

  function start() {
    if (!enabled || !safeEndpoint || flushTimer) {
      return;
    }

    flushTimer = window.setInterval(() => {
      flush();
    }, flushIntervalMs);
  }

  function stop() {
    if (!flushTimer) {
      return;
    }

    window.clearInterval(flushTimer);
    flushTimer = null;
  }

  function track(name, properties = {}) {
    if (!enabled) {
      return;
    }

    const event = buildEvent(name, properties);
    if (!event) {
      return;
    }

    queue.push(event);

    if (queue.length > MAX_QUEUE_SIZE) {
      const removed = queue.length - MAX_QUEUE_SIZE;
      droppedCount += removed;
      queue = queue.slice(-MAX_QUEUE_SIZE);
    }

    persist();
  }

  function getSnapshot() {
    return {
      enabled,
      appId,
      queueLength: queue.length,
      sentCount,
      droppedCount,
      endpointConfigured: Boolean(safeEndpoint),
      sessionId
    };
  }

  return {
    track,
    flush,
    start,
    stop,
    getSnapshot
  };
}