// Mock Star Citizen Keybinding Data
// Structure for HOTAS Configuration system

export const playerStates = [
  {
    id: 'character',
    label: 'Character (Ground)',
    color: '#00ff88',
    description: 'Walking, interaction, inventory, on-foot actions',
  },
  {
    id: 'spaceFlight',
    label: 'Space Flight',
    color: '#00d9ff',
    description: 'Piloting ship, flight controls, throttle, pitch/yaw/roll',
  },
  {
    id: 'vehicleGround',
    label: 'Vehicle (Ground)',
    color: '#ff6b00',
    description: 'Rovers, bikes, ground vehicle controls',
  },
  {
    id: 'vehicleWeapons',
    label: 'Vehicle Weapons',
    color: '#ff0055',
    description: 'Targeting, firing, weapon selection (vehicle mounted)',
  },
  {
    id: 'footCombat',
    label: 'Foot Combat',
    color: '#b300ff',
    description: 'Melee, ranged weapons, grenades, on-foot combat',
  },
  {
    id: 'fps',
    label: 'FPS Turrets',
    color: '#ffa500',
    description: 'Turret controls, scanning, targeting systems',
  },
];

// Mock keybinding data (what you'd get from parsing XML)
export const mockKeybindings = [
  // CHARACTER/GROUND
  {
    id: 'char_move_forward',
    feature: 'Move Forward',
    states: ['character'],
    primaryKey: 'W',
    secondaryKey: null,
    description: 'Move character forward',
    category: 'Movement',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'char_move_backward',
    feature: 'Move Backward',
    states: ['character'],
    primaryKey: 'S',
    secondaryKey: null,
    description: 'Move character backward',
    category: 'Movement',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'char_strafe_left',
    feature: 'Strafe Left',
    states: ['character'],
    primaryKey: 'A',
    secondaryKey: null,
    description: 'Strafe/sidestep left',
    category: 'Movement',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'char_strafe_right',
    feature: 'Strafe Right',
    states: ['character'],
    primaryKey: 'D',
    secondaryKey: null,
    description: 'Strafe/sidestep right',
    category: 'Movement',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'char_jump',
    feature: 'Jump',
    states: ['character'],
    primaryKey: 'Space',
    secondaryKey: null,
    description: 'Jump or climb',
    category: 'Movement',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'char_interact',
    feature: 'Interact',
    states: ['character'],
    primaryKey: 'F',
    secondaryKey: null,
    description: 'Interact with objects, NPCs, doors',
    category: 'Interaction',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'char_inventory',
    feature: 'Open Inventory',
    states: ['character'],
    primaryKey: 'I',
    secondaryKey: null,
    description: 'Open inventory screen',
    category: 'UI',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },

  // SPACE FLIGHT
  {
    id: 'flight_pitch_up',
    feature: 'Pitch Up',
    states: ['spaceFlight'],
    primaryKey: 'Mouse Y',
    secondaryKey: 'W',
    description: 'Pitch ship nose up (mouse Y-axis or W key)',
    category: 'Flight Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_pitch_down',
    feature: 'Pitch Down',
    states: ['spaceFlight'],
    primaryKey: 'Mouse Y',
    secondaryKey: 'S',
    description: 'Pitch ship nose down',
    category: 'Flight Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_yaw_left',
    feature: 'Yaw Left',
    states: ['spaceFlight'],
    primaryKey: 'Mouse X',
    secondaryKey: 'A',
    description: 'Rotate ship left (yaw)',
    category: 'Flight Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_yaw_right',
    feature: 'Yaw Right',
    states: ['spaceFlight'],
    primaryKey: 'Mouse X',
    secondaryKey: 'D',
    description: 'Rotate ship right (yaw)',
    category: 'Flight Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_roll_left',
    feature: 'Roll Left',
    states: ['spaceFlight'],
    primaryKey: 'Q',
    secondaryKey: null,
    description: 'Roll ship left (barrel roll)',
    category: 'Flight Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_roll_right',
    feature: 'Roll Right',
    states: ['spaceFlight'],
    primaryKey: 'E',
    secondaryKey: null,
    description: 'Roll ship right (barrel roll)',
    category: 'Flight Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_throttle_up',
    feature: 'Throttle Up',
    states: ['spaceFlight'],
    primaryKey: 'Shift+W',
    secondaryKey: 'Throttle Slider',
    description: 'Increase ship throttle/speed',
    category: 'Throttle',
    hasModifier: true,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_throttle_down',
    feature: 'Throttle Down',
    states: ['spaceFlight'],
    primaryKey: 'Shift+S',
    secondaryKey: 'Throttle Slider',
    description: 'Decrease ship throttle/speed',
    category: 'Throttle',
    hasModifier: true,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'flight_target_cycle',
    feature: 'Cycle Targets',
    states: ['spaceFlight'],
    primaryKey: 'T',
    secondaryKey: null,
    description: 'Cycle through nearest targets',
    category: 'Targeting',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },

  // VEHICLE WEAPONS
  {
    id: 'weapons_fire_primary',
    feature: 'Fire Primary Weapon',
    states: ['vehicleWeapons', 'footCombat'],
    primaryKey: 'Mouse Button 1',
    secondaryKey: 'Space',
    description: 'Fire primary weapon/attack',
    category: 'Weapons',
    hasModifier: false,
    changed: true, // Example of a changed binding
    pendingApply: false,
  },
  {
    id: 'weapons_fire_secondary',
    feature: 'Fire Secondary Weapon',
    states: ['vehicleWeapons', 'footCombat'],
    primaryKey: 'Mouse Button 2',
    secondaryKey: 'Alt',
    description: 'Fire secondary weapon/ability',
    category: 'Weapons',
    hasModifier: true,
    changed: false,
    pendingApply: true, // Example of pending apply
  },
  {
    id: 'weapons_cycle_ammo',
    feature: 'Cycle Ammo Type',
    states: ['vehicleWeapons', 'footCombat'],
    primaryKey: 'R',
    secondaryKey: null,
    description: 'Cycle between ammunition types',
    category: 'Weapons',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },

  // FPS TURRETS
  {
    id: 'turret_yaw',
    feature: 'Turret Yaw',
    states: ['fps'],
    primaryKey: 'Mouse X',
    secondaryKey: null,
    description: 'Rotate turret left/right',
    category: 'Turret Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'turret_pitch',
    feature: 'Turret Pitch',
    states: ['fps'],
    primaryKey: 'Mouse Y',
    secondaryKey: null,
    description: 'Rotate turret up/down',
    category: 'Turret Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
  {
    id: 'turret_fire',
    feature: 'Fire Turret',
    states: ['fps'],
    primaryKey: 'Mouse Button 1',
    secondaryKey: null,
    description: 'Fire turret weapon system',
    category: 'Turret Control',
    hasModifier: false,
    changed: false,
    pendingApply: false,
  },
];

// Helper function to get bindings by state
export const getBindingsByState = (state) => {
  return mockKeybindings.filter((kb) => kb.states.includes(state));
};

// Helper function to get all unique categories
export const getAllCategories = () => {
  const categories = new Set(mockKeybindings.map((kb) => kb.category));
  return Array.from(categories).sort();
};

// Helper function to search keybindings
export const searchKeybindings = (keybindings, query) => {
  const lowerQuery = query.toLowerCase();
  return keybindings.filter(
    (kb) =>
      kb.feature.toLowerCase().includes(lowerQuery) ||
      kb.description.toLowerCase().includes(lowerQuery) ||
      kb.primaryKey.toLowerCase().includes(lowerQuery) ||
      kb.category.toLowerCase().includes(lowerQuery)
  );
};
