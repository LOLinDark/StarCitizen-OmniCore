const LEVEL_ORDER = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function normalizeLevel(value = '') {
  const level = String(value).toLowerCase();
  return LEVEL_ORDER[level] ? level : 'info';
}

function shouldEnableDebug(scope) {
  if (import.meta.env.DEV) {
    return true;
  }

  try {
    const raw = window.localStorage.getItem('omnicore.debug.scopes') || '';
    const scopes = raw.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
    const normalizedScope = String(scope || '').toLowerCase();
    return scopes.includes('*') || scopes.includes(normalizedScope);
  } catch {
    return false;
  }
}

function write(level, scope, args) {
  const prefix = `[${new Date().toISOString()}] [${scope}] [${level.toUpperCase()}]`;
  const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  method(prefix, ...args);
}

export function createLogger(scope = 'app', options = {}) {
  const configuredLevel = normalizeLevel(options.level || (import.meta.env.DEV ? 'debug' : 'info'));
  const minValue = LEVEL_ORDER[configuredLevel];
  const normalizedScope = String(scope || 'app');

  return {
    debug: (...args) => {
      if (LEVEL_ORDER.debug >= minValue && shouldEnableDebug(normalizedScope)) {
        write('debug', normalizedScope, args);
      }
    },
    info: (...args) => {
      if (LEVEL_ORDER.info >= minValue) {
        write('info', normalizedScope, args);
      }
    },
    warn: (...args) => {
      if (LEVEL_ORDER.warn >= minValue) {
        write('warn', normalizedScope, args);
      }
    },
    error: (...args) => {
      if (LEVEL_ORDER.error >= minValue) {
        write('error', normalizedScope, args);
      }
    },
  };
}
