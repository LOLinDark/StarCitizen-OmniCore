import { analytics } from '../analytics';
import { sanitizeProperties } from '../analytics/client';

const STORAGE_KEY = 'errorLog';
const MAX_ERRORS = 100;
let listenersInstalled = false;

function readErrors() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeErrors(errors) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(errors.slice(0, MAX_ERRORS)));
  } catch {
    // Ignore local storage failures.
  }
}

function normalizeErrorEntry(entry = {}) {
  const safe = sanitizeProperties(entry);

  return {
    timestamp: typeof safe.timestamp === 'string' ? safe.timestamp : new Date().toISOString(),
    page: typeof safe.page === 'string' ? safe.page : window.location.pathname || '/',
    button: typeof safe.button === 'string' ? safe.button : 'runtime',
    error: typeof safe.error === 'string' ? safe.error : 'Unknown error',
    stack: typeof safe.stack === 'string' ? safe.stack : null
  };
}

export function appendErrorLog(entry) {
  const nextEntry = normalizeErrorEntry(entry);
  const errors = [nextEntry, ...readErrors()].slice(0, MAX_ERRORS);

  writeErrors(errors);
  analytics.track('app.error.captured', {
    page: nextEntry.page,
    button: nextEntry.button
  });
}

export function getErrorLog() {
  return readErrors();
}

export function clearErrorLog() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore local storage failures.
  }
}

export function installGlobalErrorHandlers() {
  if (listenersInstalled) {
    return;
  }

  listenersInstalled = true;

  window.addEventListener('error', (event) => {
    appendErrorLog({
      page: window.location.pathname || '/',
      button: 'window.error',
      error: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString()
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    appendErrorLog({
      page: window.location.pathname || '/',
      button: 'window.unhandledrejection',
      error: event.reason?.message || String(event.reason || 'Unhandled rejection'),
      stack: event.reason?.stack,
      timestamp: new Date().toISOString()
    });
  });
}