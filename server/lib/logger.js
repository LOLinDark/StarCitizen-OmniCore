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

function parseDebugScopes(value = '') {
  return String(value)
    .split(',')
    .map((scope) => scope.trim().toLowerCase())
    .filter(Boolean);
}

const configuredLevel = normalizeLevel(process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'));
const debugScopes = parseDebugScopes(process.env.DEBUG || process.env.DEBUG_SCOPES);

function shouldLog(level, scope) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[configuredLevel]) {
    return false;
  }

  if (level !== 'debug') {
    return true;
  }

  if (debugScopes.length === 0) {
    return process.env.NODE_ENV !== 'production';
  }

  const normalizedScope = String(scope || '').toLowerCase();
  return debugScopes.includes('*') || debugScopes.includes(normalizedScope);
}

function write(level, scope, args) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${scope}] [${level.toUpperCase()}]`;
  const method = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  method(prefix, ...args);
}

export function createLogger(scope = 'app') {
  const normalizedScope = String(scope || 'app');

  return {
    debug: (...args) => {
      if (shouldLog('debug', normalizedScope)) {
        write('debug', normalizedScope, args);
      }
    },
    info: (...args) => {
      if (shouldLog('info', normalizedScope)) {
        write('info', normalizedScope, args);
      }
    },
    warn: (...args) => {
      if (shouldLog('warn', normalizedScope)) {
        write('warn', normalizedScope, args);
      }
    },
    error: (...args) => {
      if (shouldLog('error', normalizedScope)) {
        write('error', normalizedScope, args);
      }
    },
  };
}
