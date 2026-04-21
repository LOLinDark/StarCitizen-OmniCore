import { env } from '../config/env';

const baseUrl = env.VITE_API_BASE_URL.replace(/\/$/, '');

function shouldRetrySameOrigin(path, error) {
  return (
    typeof path === 'string' &&
    path.startsWith('/api') &&
    baseUrl.includes('localhost:3001') &&
    error instanceof TypeError
  );
}

function normalizeBody(body, headers) {
  if (body === undefined || body === null) {
    return { body: undefined, headers };
  }

  if (body instanceof FormData || typeof body === 'string' || body instanceof Blob) {
    return { body, headers };
  }

  return {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

export function apiUrl(path = '') {
  if (!path) {
    return baseUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(path, init = {}) {
  const { headers = {}, body, ...rest } = init;
  const normalized = normalizeBody(body, headers);

  try {
    return await fetch(apiUrl(path), {
      ...rest,
      headers: normalized.headers,
      body: normalized.body
    });
  } catch (error) {
    // Fallback for setups where /api is reverse-proxied on the same origin.
    if (shouldRetrySameOrigin(path, error)) {
      return fetch(path, {
        ...rest,
        headers: normalized.headers,
        body: normalized.body
      });
    }

    throw error;
  }
}

export async function apiRequest(path, init = {}) {
  const response = await apiFetch(path, init);
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function apiGet(path) {
  return apiRequest(path);
}

export function apiPost(path, body, init = {}) {
  return apiRequest(path, {
    method: 'POST',
    body,
    ...init
  });
}