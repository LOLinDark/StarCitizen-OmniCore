export const MODE_PLAY_GROUPS = {
  general: {
    id: 'general',
    label: 'General Flight',
    description: 'Core flight and cockpit actions used in most sessions.',
    color: 'gray',
  },
  combat: {
    id: 'combat',
    label: 'Combat',
    description: 'Weapons, targeting, missile, and combat operator controls.',
    color: 'red',
  },
  mining: {
    id: 'mining',
    label: 'Mining',
    description: 'Mining operator mode and mining-specific actions.',
    color: 'yellow',
  },
  salvage: {
    id: 'salvage',
    label: 'Salvage',
    description: 'Salvage operator mode and salvage-tool actions.',
    color: 'orange',
  },
  scanning: {
    id: 'scanning',
    label: 'Scanning',
    description: 'Radar, ping, and scan controls.',
    color: 'cyan',
  },
  viewLook: {
    id: 'viewLook',
    label: 'View and Look',
    description: 'Camera cycling, freelook, headlook, and zoom controls.',
    color: 'indigo',
  },
  navigation: {
    id: 'navigation',
    label: 'Navigation',
    description: 'Quantum travel and long-range navigation controls.',
    color: 'violet',
  },
  dockingLanding: {
    id: 'dockingLanding',
    label: 'Docking and Landing',
    description: 'Landing gear, docking mode, and autoland actions.',
    color: 'blue',
  },
  powerDefense: {
    id: 'powerDefense',
    label: 'Power and Defense',
    description: 'Power triangle, shields, and countermeasure management.',
    color: 'teal',
  },
  futureUnsupported: {
    id: 'futureUnsupported',
    label: 'Future / Unsupported',
    description: 'Not yet supported or non-ship mappings parked for future implementation.',
    color: 'dark',
  },
};

export const DEFAULT_MODE_PLAY_GROUP_VALUES = Object.keys(MODE_PLAY_GROUPS)
  .filter((groupId) => groupId !== 'futureUnsupported');

const includesAny = (text, parts) => parts.some((part) => text.includes(part));

export function getModePlayGroupsForActionName(actionName) {
  const text = String(actionName || '').toLowerCase();
  const groups = new Set();

  if (!text) return ['general'];

  if (includesAny(text, [
    'player_',
    'targeting_cycle_',
    'targeting_lock',
    'weapons_preset_',
    'future',
    'not-yet-supported',
    'unsupported',
  ])) {
    return ['futureUnsupported'];
  }

  if (includesAny(text, ['salvage', 'scrape', 'strip'])) groups.add('salvage');
  if (includesAny(text, ['mining', 'fracture', 'extract'])) groups.add('mining');
  if (includesAny(text, ['scan', 'radar', 'ping'])) groups.add('scanning');
  if (includesAny(text, ['view', 'look', 'freelook', 'headlook', 'camera', 'zoom', 'orbit'])) groups.add('viewLook');
  if (includesAny(text, ['quantum', 'qdrive', 'jump'])) groups.add('navigation');
  if (includesAny(text, ['dock', 'landing', 'autoland', 'vtol', 'gear'])) groups.add('dockingLanding');
  if (includesAny(text, ['weapon', 'missile', 'target', 'attack', 'gimbal', 'aim'])) groups.add('combat');
  if (includesAny(text, ['shield', 'decoy', 'noise', 'countermeasure', 'power', 'ifcs', 'cooler'])) groups.add('powerDefense');

  if (groups.size === 0) groups.add('general');
  return Array.from(groups);
}

export function getModePlayGroupsForBinding(binding) {
  const text = [binding?.id, binding?.feature, binding?.description, binding?.category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return getModePlayGroupsForActionName(text);
}

export function getModePlayGroupOptions() {
  return Object.values(MODE_PLAY_GROUPS).map((group) => ({
    value: group.id,
    label: group.label,
  }));
}
