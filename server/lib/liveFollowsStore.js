import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'server', 'data');
const DATA_FILE = join(DATA_DIR, 'live-follows.json');

const EMPTY_STORE = {
  profiles: {
    default: [],
  },
};

function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(EMPTY_STORE, null, 2), 'utf8');
  }
}

function readStore() {
  ensureDataFile();
  try {
    const raw = readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.profiles || typeof parsed.profiles !== 'object') {
      return { ...EMPTY_STORE };
    }
    return parsed;
  } catch {
    return { ...EMPTY_STORE };
  }
}

function writeStore(store) {
  ensureDataFile();
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function normalizeProfileId(profileId) {
  const value = String(profileId || 'default').trim();
  return value && value.length <= 64 ? value : 'default';
}

function normalizePlatform(platform) {
  const value = String(platform || '').trim().toLowerCase();
  if (['twitch', 'youtube', 'kick', 'steam'].includes(value)) {
    return value;
  }
  return '';
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase().replace(/^@/, '');
}

export function getLiveFollows(profileId = 'default') {
  const store = readStore();
  const key = normalizeProfileId(profileId);
  return Array.isArray(store.profiles[key]) ? store.profiles[key] : [];
}

export function addLiveFollow({ profileId = 'default', platform, username }) {
  const safePlatform = normalizePlatform(platform);
  const safeUsername = normalizeUsername(username);

  if (!safePlatform) {
    throw new Error('Invalid platform');
  }
  if (!safeUsername || safeUsername.length > 64 || !/^[a-z0-9_.-]+$/i.test(safeUsername)) {
    throw new Error('Invalid username');
  }

  const store = readStore();
  const key = normalizeProfileId(profileId);
  const existing = Array.isArray(store.profiles[key]) ? store.profiles[key] : [];

  if (existing.some((item) => item.platform === safePlatform && item.username === safeUsername)) {
    return existing;
  }

  const follow = {
    id: `${safePlatform}:${safeUsername}`,
    platform: safePlatform,
    username: safeUsername,
    createdAt: new Date().toISOString(),
  };

  store.profiles[key] = [follow, ...existing];
  writeStore(store);
  return store.profiles[key];
}

export function removeLiveFollow({ profileId = 'default', followId }) {
  const id = String(followId || '').trim();
  if (!id) {
    throw new Error('followId is required');
  }

  const store = readStore();
  const key = normalizeProfileId(profileId);
  const existing = Array.isArray(store.profiles[key]) ? store.profiles[key] : [];
  store.profiles[key] = existing.filter((item) => item.id !== id);
  writeStore(store);
  return store.profiles[key];
}
