const fs = require('fs');
const path = require('path');

const root = 'C:/wamp64/www/OmniCore';
const existingPath = path.join(root, 'app/data/starcitizen-keybindings.js');
const keybindsPath = path.join(root, 'tmp_sc_extract/keybinds.json');
const mappedActionsPath = path.join(root, 'tmp_sc_extract/MappedActions.js');
const outPath = path.join(root, 'app/data/starcitizen-keybindings.imported-supplement.js');

const existingText = fs.readFileSync(existingPath, 'utf8');
const keybinds = JSON.parse(fs.readFileSync(keybindsPath, 'utf8'));
const mappedActionsText = fs.readFileSync(mappedActionsPath, 'utf8');
const mappedActionsMatch = mappedActionsText.match(/mappedActionSource\s*=\s*(\[[\s\S]*\])\s*;\s*$/);
if (!mappedActionsMatch) {
  throw new Error('Unable to parse mappedActionSource from MappedActions.js');
}
const mappedActions = JSON.parse(mappedActionsMatch[1]);

const existingIds = new Set([...existingText.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]));

const toTitle = (value) => {
  if (!value) return '';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const normalizeKeyCombo = (value) => {
  if (!value) return null;
  const keyAlias = {
    lalt: 'L Alt', ralt: 'R Alt',
    lshift: 'L Shift', rshift: 'R Shift',
    lctrl: 'L Ctrl', rctrl: 'R Ctrl',
    comma: 'Comma',
    mwheel_up: 'Mouse Wheel Up', mwheel_down: 'Mouse Wheel Down',
    mouse1: 'Mouse 1', mouse2: 'Mouse 2', mouse3: 'Mouse 3',
    maxis_x: 'Mouse Axis X', maxis_y: 'Mouse Axis Y', maxis_z: 'Mouse Axis Z',
    pgup: 'Page Up', pgdn: 'Page Down',
    backspace: 'Backspace',
    tab: 'Tab',
    np_0: 'Numpad 0', np_1: 'Numpad 1', np_2: 'Numpad 2', np_3: 'Numpad 3', np_4: 'Numpad 4',
    np_5: 'Numpad 5', np_6: 'Numpad 6', np_7: 'Numpad 7', np_8: 'Numpad 8', np_9: 'Numpad 9',
    np_add: 'Numpad +', np_subtract: 'Numpad -', np_multiply: 'Numpad *', np_divide: 'Numpad /', np_period: 'Numpad .',
    left: 'Left Arrow', right: 'Right Arrow', up: 'Up Arrow', down: 'Down Arrow',
    dpad_up: 'D-Pad Up', dpad_down: 'D-Pad Down', dpad_left: 'D-Pad Left', dpad_right: 'D-Pad Right',
  };

  return value
    .split('+')
    .map((token) => {
      const raw = token.trim();
      if (!raw) return null;
      const mapped = keyAlias[raw.toLowerCase()];
      if (mapped) return mapped;
      if (/^f\d+$/i.test(raw)) return raw.toUpperCase();
      if (raw.length === 1) return raw.toUpperCase();
      return toTitle(raw);
    })
    .filter(Boolean)
    .join(' + ');
};

const isLocalisationToken = (value) =>
  typeof value === 'string' && value.trim().startsWith('@');

const firstMeaningfulText = (...values) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (isLocalisationToken(trimmed)) continue;
    return trimmed;
  }
  return '';
};

const sanitizeSourceText = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bstar\s*binder\b/gi, 'external data source')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const mapCategory = (keywords = []) => {
  const lower = keywords.map((k) => (k || '').toLowerCase());
  const has = (needle) => lower.some((k) => k.includes(needle));

  if (has('seats')) return 'seats';
  if (has('cockpit')) return 'cockpit';
  if (has('vehicles - view') || has('camera - advanced camera controls') || has('camera')) return 'view';
  if (has('flight - movement') || has('ground vehicle - movement')) return 'flight';
  if (has('quantum travel')) return 'quantum';
  if (has('docking')) return 'docking';
  if (has('target hailing')) return 'hailing';
  if (has('scanning')) return 'scanning';
  if (has('radar')) return 'radar';
  if (has('vehicles - shields') || has('countermeasures') || has('flare') || has('chaff')) return 'shields';
  if (has('vehicles - weapons') || has('vehicles - missiles') || has('weapons') || has('missiles') || has('torpedoes')) return 'weapons';
  if (has('flight - power') || has('engineering') || has('power')) return 'power';
  if (has('flight - hud') || has('mobiglas') || has('starmap') || has('hud')) return 'hud';
  if (has('lights')) return 'lights';
  if (has('stopwatch')) return 'stopwatch';

  return 'future';
};

const cleanIdPart = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

const actionSourceByName = new Map();
for (const sourceAction of mappedActions) {
  if (!sourceAction?.actionName) continue;
  const existing = actionSourceByName.get(sourceAction.actionName);
  if (!existing) {
    actionSourceByName.set(sourceAction.actionName, sourceAction);
    continue;
  }

  // Prefer records with an explicit keyboard bind.
  const existingHasKeyboard = Boolean(existing.keyboardBind);
  const candidateHasKeyboard = Boolean(sourceAction.keyboardBind);
  if (!existingHasKeyboard && candidateHasKeyboard) {
    actionSourceByName.set(sourceAction.actionName, sourceAction);
  }
}

const entries = [];
for (const [actionName, meta] of Object.entries(keybinds)) {
  const source = actionSourceByName.get(actionName);
  const category = mapCategory(meta.keywords || []);
  const featureLabel = sanitizeSourceText(firstMeaningfulText(meta.label, source?.label)) || toTitle(actionName);
  const feature = category === 'future' ? `[Future] ${featureLabel}` : featureLabel;

  let id = `${category}_${cleanIdPart(actionName)}`;
  if (existingIds.has(id)) {
    id = `${id}_sb`;
  }
  if (existingIds.has(id)) {
    continue;
  }

  const description = sanitizeSourceText(firstMeaningfulText(meta.description, source?.description)) ||
    (category === 'future'
      ? 'Imported mapping parked for future support.'
      : 'Imported supplemental mapping.');

  const primaryKey = normalizeKeyCombo(source?.keyboardBind || null);
  const hasModifier = Boolean(primaryKey && primaryKey.includes('+'));

  entries.push({
    id,
    sourceAction: actionName,
    feature,
    category,
    primaryKey,
    secondaryKey: null,
    description,
    hasModifier,
    changed: false,
    pendingApply: false,
  });
  existingIds.add(id);
}

entries.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  return a.feature.localeCompare(b.feature);
});

const header = `/**\n * Auto-generated imported supplemental keybindings.\n * Source: local extracted data in tmp_sc_extract.\n * Generated for append-only expansion of OmniCore feature coverage.\n */\n\n`;
const body = `export const importedSupplementalKeybindings = ${JSON.stringify(entries, null, 2)};\n`;
fs.writeFileSync(outPath, header + body + '\n', 'utf8');

console.log(`Generated ${entries.length} supplemental entries -> ${outPath}`);
