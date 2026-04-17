/**
 * Star Citizen Action Names to OmniCore Feature ID Mapping
 * 
 * Maps Star Citizen's internal v_* action names found in XML exports
 * to our standardized feature IDs for keybinding display and management
 */

export const starCitizenActionMapping = {
  // ===== SEAT & OPERATOR MODES =====
  'v_toggle_mining_mode': 'seats_toggle_mining_mode',
  'v_toggle_salvage_mode': 'seats_toggle_salvage_mode',
  'v_toggle_scanning_mode': 'seats_toggle_scanning_mode',
  'v_toggle_quantum_mode': 'seats_toggle_quantum_mode',
  'v_toggle_missile_mode': 'seats_toggle_missile_mode',
  'v_toggle_flight_mode': 'seats_toggle_flight_mode',
  'v_enter_turret_1': 'seats_enter_remote_turret_1',
  'v_enter_turret_2': 'seats_enter_remote_turret_2',
  'v_enter_turret_3': 'seats_enter_remote_turret_3',
  'v_exit_seat': 'seats_emergency_exit',
  'v_look_behind': 'seats_look_behind',

  // ===== COCKPIT SYSTEMS =====
  'v_self_destruct': 'cockpit_self_destruct',
  'v_open_all_doors': 'cockpit_open_all_doors',
  'v_close_all_doors': 'cockpit_close_all_doors',
  'v_lock_all_doors': 'cockpit_lock_all_doors',
  'v_unlock_all_doors': 'cockpit_unlock_all_doors',
  'v_increase_cooler': 'cockpit_increase_cooler',
  'v_decrease_cooler': 'cockpit_decrease_cooler',

  // ===== FLIGHT MOVEMENT - AXES & PITCH/YAW =====
  'v_pitch': 'flight_pitch_axis',
  'v_yaw': 'flight_yaw_axis',
  'v_roll': 'flight_roll_axis',
  'v_pitch_up': 'flight_pitch_up',
  'v_pitch_down': 'flight_pitch_down',
  'v_yaw_left': 'flight_yaw_left',
  'v_yaw_right': 'flight_yaw_right',
  'v_roll_left': 'flight_roll_left',
  'v_roll_right': 'flight_roll_right',

  // ===== FLIGHT MOVEMENT - STRAFE & THROTTLE =====
  'v_strafe_up': 'flight_strafe_up',
  'v_strafe_down': 'flight_strafe_down',
  'v_strafe_left': 'flight_strafe_left',
  'v_strafe_right': 'flight_strafe_right',
  'v_strafe_longitudinal': 'flight_throttle_axis', // Z-axis (forward/back)
  'v_throttle_forward': 'flight_throttle_up',
  'v_throttle_backward': 'flight_throttle_down',

  // ===== FLIGHT MODES & SYSTEMS =====
  'v_toggle_decoupled': 'flight_decoupled_toggle',
  'v_toggle_landing_system': 'flight_landing_system_toggle',
  'v_toggle_vtol': 'flight_vtol_toggle',
  'v_toggle_coupled': 'flight_decoupled_toggle',
  'v_boost': 'flight_boost',
  'v_space_brake': 'flight_spacebrake',
  'v_cruise_mode': 'flight_cruise_mode_toggle',

  // ===== POWER DISTRIBUTION =====
  'v_power_toggle': 'power_toggle_all',
  'v_power_toggle_thrusters': 'power_toggle_thrusters',
  'v_power_toggle_shields': 'power_toggle_shields',
  'v_power_toggle_weapons': 'power_toggle_weapons',
  'v_power_increase_engines': 'power_engines_increase',
  'v_power_decrease_engines': 'power_engines_decrease',
  'v_power_increase_shields': 'power_shields_increase',
  'v_power_decrease_shields': 'power_shields_decrease',
  'v_power_increase_weapons': 'power_weapons_increase',
  'v_power_decrease_weapons': 'power_weapons_decrease',
  'v_power_reset': 'power_reset_assignments',

  // ===== SHIELDS & COUNTERMEASURES =====
  'v_deploy_decoy': 'shields_decoy_launch',
  'v_deploy_noise': 'shields_noise_deploy',
  'v_increase_decoy_burst': 'shields_decoy_increase_size',
  'v_decrease_decoy_burst': 'shields_decoy_decrease_size',
  'v_shield_level_front': 'shields_raise_front',
  'v_shield_level_back': 'shields_raise_back',
  'v_shield_level_left': 'shields_raise_left',
  'v_shield_level_right': 'shields_raise_right',
  'v_shield_level_top': 'shields_raise_top',
  'v_shield_level_bottom': 'shields_raise_bottom',
  'v_shield_reset': 'shields_reset_levels',

  // ===== WEAPONS & TARGETING =====
  'v_weapon_preset_guns0': 'weapons_preset_0', // Placeholder - may not exist in our data
  'v_weapon_preset_guns1': 'weapons_preset_1',
  'v_weapon_preset_guns2': 'weapons_preset_2',
  'v_weapon_preset_guns3': 'weapons_preset_3',
  'v_weapon_preset_next': 'weapons_preset_next',
  'v_weapon_preset_prev': 'weapons_preset_prev',
  'v_lock_target': 'targeting_lock',
  'v_cycle_attackers': 'targeting_cycle_attackers',
  'v_cycle_hostiles': 'targeting_cycle_hostiles',
  'v_cycle_friendlies': 'targeting_cycle_friendlies',

  // ===== SCANNING & RADAR =====
  'v_invoke_ping': 'radar_activate_ping',
  'v_activate_scanning': 'seats_toggle_scanning_mode',
  'v_scan_toggle': 'scanning_activate',
  'v_scan_increase_angle': 'scan_increase_angle',
  'v_scan_decrease_angle': 'scan_decrease_angle',

  // ===== VIEW & CAMERA =====
  'v_cycle_camera': 'view_cycle_camera',
  'v_freelook': 'view_freelook',
  'v_look_left': 'view_look_left',
  'v_look_right': 'view_look_right',
  'v_look_up': 'view_look_up',
  'v_look_down': 'view_look_down',
  'v_zoom_in': 'view_zoom_in_3p',
  'v_zoom_out': 'view_zoom_out_3p',

  // ===== HUD & INTERFACE =====
  'v_mobiglass': 'hud_mobiglass_toggle',
  'v_map': 'hud_map',
  'v_wipe_visor': 'hud_wipe_visor',

  // ===== DOCKING & LANDING =====
  'v_docking_mode': 'dock_toggle_mode',
  'v_autoland': 'flight_autoland',
  'v_request_landing': 'flight_request_landing',

  // ===== QUANTUM TRAVEL =====
  'v_engage_quantum': 'quantum_engage',
  'v_quantum_mode': 'seats_toggle_quantum_mode',

  // ===== LIGHTS =====
  'v_lights_toggle': 'lights_headlights_toggle',

  // ===== PLAYER (ON FOOT) =====
  'sprint': 'player_sprint',
  'walk': 'player_walk',
  'crouch': 'player_crouch',
  'prone': 'player_prone',
  'jump': 'player_jump',
};

/**
 * Reverse mapping: Feature ID → Star Citizen action names
 * (Some features may map to multiple actions)
 */
export const featureToStarCitizenAction = {};
Object.entries(starCitizenActionMapping).forEach(([action, featureId]) => {
  if (!featureToStarCitizenAction[featureId]) {
    featureToStarCitizenAction[featureId] = [];
  }
  featureToStarCitizenAction[featureId].push(action);
});

/**
 * Input device type detector
 * @param {string} input - Input string like "kb1_m" or "js1_button14" or "mouse5"
 * @returns {string} - 'keyboard', 'joystick', 'mouse', or 'unknown'
 */
export function detectInputDevice(input) {
  if (!input) return 'unknown';
  if (input.startsWith('kb1_')) return 'keyboard';
  if (input.startsWith('js1_')) return 'joystick';
  if (input.startsWith('mouse')) return 'mouse';
  return 'unknown';
}

/**
 * Parse input string to human-readable format
 * @param {string} input - Input string like "kb1_lctrl+m" or "js1_button14"
 * @returns {object} - { device, key, modifiers }
 */
export function parseInputString(input) {
  if (!input) return { device: 'unknown', key: '', modifiers: [] };

  const device = detectInputDevice(input);
  let key = input;
  const modifiers = [];

  if (device === 'keyboard') {
    key = input.replace('kb1_', '');
    if (key.includes('+')) {
      const parts = key.split('+');
      modifiers.push(...parts.slice(0, -1).map(m => m.toUpperCase()));
      key = parts[parts.length - 1].toUpperCase();
    }
  } else if (device === 'joystick') {
    key = input.replace('js1_', '');
    if (key.startsWith('button')) {
      const btnNum = parseInt(key.replace('button', ''));
      // T.A.R.G.E.T software button naming
      const targetNames = {
        9: 'T1', 10: 'T2', 11: 'T3', 12: 'T4', 13: 'T5', 14: 'T6',
        15: 'T7', 16: 'T8', 17: 'T9', 18: 'T10', 19: 'T11', 20: 'T12',
      };
      key = `Button ${btnNum}${targetNames[btnNum] ? ` (${targetNames[btnNum]})` : ''}`;
    } else if (key === 'x') key = 'X-axis (left/right)';
    else if (key === 'y') key = 'Y-axis (up/down)';
    else if (key === 'z') key = 'Z-axis (throttle)';
    else if (key === 'rx') key = 'RX-axis (twist)';
    else if (key === 'ry') key = 'RY-axis';
    else if (key === 'rz') key = 'RZ-axis';
    else if (key.startsWith('slider')) key = `Slider ${key.replace('slider', '')}`;
    else if (key.startsWith('pov')) key = `Hat ${key.replace('pov', '')}`;
  } else if (device === 'mouse') {
    const btnNum = parseInt(input.replace('mouse', ''));
    const mouseButtons = { 1: 'LMB (Left)', 2: 'RMB (Right)', 3: 'Middle', 4: 'Side 1', 5: 'Side 2' };
    key = `Mouse ${mouseButtons[btnNum] || `Button ${btnNum}`}`;
  }

  return { device, key, modifiers };
}

/**
 * Format parsed input for display
 * @param {object} parsed - Result from parseInputString()
 * @returns {string} - Display string like "Ctrl+M" or "Button 14 (T6)"
 */
export function formatInputForDisplay(parsed) {
  if (!parsed || !parsed.key) return 'Unbound';
  let display = parsed.key;
  if (parsed.modifiers.length > 0) {
    display = parsed.modifiers.join('+') + '+' + display;
  }
  return display;
}

export default {
  starCitizenActionMapping,
  featureToStarCitizenAction,
  detectInputDevice,
  parseInputString,
  formatInputForDisplay,
};
