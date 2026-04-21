import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_BUTTON_MODE_BINDINGS, DEFAULT_MODE_STATE, HOTAS_MODES } from './constants.js';

const DATA_DIR = join(process.cwd(), 'server', 'data');
const DATA_FILE = join(DATA_DIR, 'hotas-mode-state.json');

function ensureFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    const initial = {
      modeState: DEFAULT_MODE_STATE,
      bindings: DEFAULT_BUTTON_MODE_BINDINGS,
    };
    writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function normalizeMode(value) {
  const mode = String(value || '').toLowerCase().trim();
  return HOTAS_MODES.includes(mode) ? mode : 'green';
}

function readStore() {
  ensureFile();
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const modeState = {
      enabled: Boolean(parsed?.modeState?.enabled),
      activeMode: normalizeMode(parsed?.modeState?.activeMode),
      updatedAt: parsed?.modeState?.updatedAt || null,
    };
    const bindings = parsed?.bindings && typeof parsed.bindings === 'object'
      ? parsed.bindings
      : DEFAULT_BUTTON_MODE_BINDINGS;

    return { modeState, bindings };
  } catch {
    return {
      modeState: { ...DEFAULT_MODE_STATE },
      bindings: { ...DEFAULT_BUTTON_MODE_BINDINGS },
    };
  }
}

function writeStore(store) {
  ensureFile();
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function getHotasModeState() {
  return readStore();
}

export function setHotasModeState(nextState = {}) {
  const current = readStore();
  const merged = {
    ...current.modeState,
    enabled: typeof nextState.enabled === 'boolean' ? nextState.enabled : current.modeState.enabled,
    activeMode: normalizeMode(nextState.activeMode || current.modeState.activeMode),
    updatedAt: new Date().toISOString(),
  };

  const updated = {
    ...current,
    modeState: merged,
  };

  writeStore(updated);
  return updated;
}

function normalizeToken(value) {
  const token = String(value || '').trim();
  if (!token) return '';
  if (token.length > 24) return '';
  return token;
}

function normalizeButtonBindings(modeTokenMap = {}) {
  return {
    green: normalizeToken(modeTokenMap.green),
    orange: normalizeToken(modeTokenMap.orange),
    red: normalizeToken(modeTokenMap.red),
  };
}

export function setButtonModeBindings(buttonId, modeTokenMap = {}) {
  const buttonKey = String(buttonId || '').trim().toLowerCase();
  if (!/^button\d+$/i.test(buttonKey)) {
    throw new Error('Invalid button identifier');
  }

  const current = readStore();
  const existing = current.bindings?.[buttonKey] || {};

  const nextButtonBindings = {
    green: normalizeToken(modeTokenMap.green) || existing.green || '',
    orange: normalizeToken(modeTokenMap.orange) || existing.orange || '',
    red: normalizeToken(modeTokenMap.red) || existing.red || '',
  };

  const updated = {
    ...current,
    bindings: {
      ...(current.bindings || {}),
      [buttonKey]: nextButtonBindings,
    },
  };

  writeStore(updated);
  return updated;
}

export function resolveOutputTokenForButton(buttonId, activeMode) {
  const store = readStore();
  const buttonKey = String(buttonId || '').trim().toLowerCase();
  const mode = normalizeMode(activeMode || store.modeState.activeMode);
  const modeBindings = store.bindings?.[buttonKey] || {};
  return {
    activeMode: mode,
    token: String(modeBindings?.[mode] || '').trim(),
    bindings: modeBindings,
  };
}

export function replaceAllButtonModeBindings(nextBindings = {}) {
  if (!nextBindings || typeof nextBindings !== 'object') {
    throw new Error('Invalid bindings payload');
  }

  const normalized = {};
  Object.entries(nextBindings).forEach(([buttonKey, values]) => {
    const id = String(buttonKey || '').trim().toLowerCase();
    if (!/^button\d+$/i.test(id)) {
      return;
    }
    normalized[id] = normalizeButtonBindings(values);
  });

  const current = readStore();
  const updated = {
    ...current,
    bindings: normalized,
    modeState: {
      ...current.modeState,
      updatedAt: new Date().toISOString(),
    },
  };

  writeStore(updated);
  return updated;
}
