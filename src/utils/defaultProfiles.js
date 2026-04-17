/**
 * Default HOTAS Profiles for Star Citizen
 * AI-generated optimal configurations for specific peripherals
 */

/**
 * Logitech X52 Pro comprehensive profile
 * Optimized for: Keyboard + Mouse (2 side buttons) + Logitech X52 HOTAS
 * Situation: All-purpose flight, combat, mining, scanning
 * 
 * Research-based configuration from community combat-tested setups:
 * - Button layout: Grip area (9-10) | Top grid (11-19) | Right panel (20-30)
 * - Primary flight: Main joystick (X/Y) + throttle slider (Z-axis)
 * - Combat actions: Buttons 11-13 (targeting), 16-19 (weapon presets)
 * - Strafe diamond: Buttons 20-23 (essential for flight control)
 * - Power/systems: Buttons 25-29 (power management, gimbal, quantum)
 */
export const logitechX52ProOptimal = {
  profileName: 'OmniCore AI - X52 Comprehensive (Keyboard+Mouse+HOTAS)',
  description: 'Combat-optimized X52 configuration with full button mapping. Based on community testing for dogfighting, mining, and exploration.',
  peripherals: ['Keyboard', 'Mouse (2 side buttons)', 'Logitech X52 HOTAS'],
  situationDescription: 'All-purpose: Flight | Combat | Mining | Scanning | Quantum Travel',
  bindings: {
    // ===== PRIMARY FLIGHT AXES (Joystick Main + Throttle Slider) =====
    'flight_pitch_axis': 'Joystick Y-axis (forward/back)',
    'flight_yaw_axis': 'Joystick X-axis (left/right)',
    'flight_roll_left': 'Joystick Button 5',
    'flight_roll_right': 'Joystick Button 6',
    'flight_throttle_axis': 'Throttle Z-axis (0-100% thrust)',
    'flight_throttle_up': 'Throttle Slider Up',
    'flight_throttle_down': 'Throttle Slider Down',

    // ===== BOOST & SPEED CONTROL (Throttle Wheels) =====
    'flight_boost': 'Button 9 (Throttle Grip Top)',
    'flight_spacebrake': 'Button 10 (Throttle Grip Bottom)',
    'flight_cruise_mode_toggle': 'X (keyboard)',
    'flight_speed_limiter_step_up': 'Throttle Dial Right (upper dial)',
    'flight_speed_limiter_step_down': 'Throttle Dial Left (upper dial)',

    // ===== TARGETING & COMBAT - ESSENTIAL (Buttons 11-13) =====
    'radar_target_next': 'Button 11 (Top Left)',
    'radar_target_previous': 'Button 12 (Top Center)',
    'radar_target_focus': 'Button 13 (Top Right)',
    'radar_target_hostile_next': 'Button 11 + L Shift (modifier)',
    'radar_target_hostile_previous': 'Button 12 + L Shift (modifier)',
    'radar_target_subsystem': 'Button 14 (Top Far Right)',

    // ===== WEAPON MANAGEMENT (Buttons 16-19) =====
    'weapons_preset_0': 'Button 16 (Right Panel Row 1, Pos 1)',
    'weapons_preset_1': 'Button 17 (Right Panel Row 1, Pos 2)',
    'weapons_preset_2': 'Button 18 (Right Panel Row 1, Pos 3)',
    'weapons_preset_3': 'Button 19 (Right Panel Row 1, Pos 4)',
    'shields_deploy_countermeasures': 'Joystick Button 1 (Trigger)',
    'flight_precision_targeting_toggle': 'Mouse Button 2 (RMB)',

    // ===== STRAFE DIAMOND (Buttons 20-23) - CRITICAL FOR FLIGHT =====
    'flight_strafe_up': 'Button 20 (Right Panel, Diamond Top)',
    'flight_strafe_down': 'Button 21 (Right Panel, Diamond Right)',
    'flight_strafe_left': 'Button 22 (Right Panel, Diamond Bottom)',
    'flight_strafe_right': 'Button 23 (Right Panel, Diamond Left)',

    // ===== SYSTEMS & POWER MANAGEMENT (Buttons 24-29) =====
    'power_toggle_all': 'Button 24 (Right Panel Row 2)',
    'power_toggle_shields': 'Button 25 (Right Panel Row 2)',
    'power_toggle_weapons': 'Button 26 (Right Panel Row 2)',
    'power_toggle_thrusters': 'Button 27 (Right Panel Row 2)',
    'flight_gimbal_lock': 'Button 28 (Right Panel Row 3)',
    'quantum_engage': 'Button 29 (Right Panel Row 3)',

    // ===== QUANTUM & JUMP DRIVE =====
    'quantum_throttle_increase': 'Button 30 (Right Panel Row 3)',
    'quantum_cancel': 'Button 9 + Button 29 (Combo)',

    // ===== SCANNING & DETECTION (Mouse + Hat Switch) =====
    'seats_toggle_scanning_mode': 'V (keyboard)',
    'scan_activate': 'Mouse Button 1 (LMB)',
    'scan_ping': 'Tab (keyboard)',
    'radar_activate_ping': 'Joystick Hat-Up',
    'scan_increase_angle': 'Joystick Hat-Right',
    'scan_decrease_angle': 'Joystick Hat-Left',

    // ===== SHIELDS & PROTECTION (Throttle Hat) =====
    'shields_raise_front': 'Throttle Hat-Up',
    'shields_raise_back': 'Throttle Hat-Down',
    'shields_raise_left': 'Throttle Hat-Left',
    'shields_raise_right': 'Throttle Hat-Right',
    'shields_deploy_noise': 'H (keyboard)',
    'shields_deploy_decoy': 'J (keyboard)',

    // ===== POWER DISTRIBUTION (F-Keys) =====
    'power_engines_increase': 'F6 (keyboard)',
    'power_engines_decrease': 'F6 + L Ctrl (keyboard)',
    'power_shields_increase': 'F7 (keyboard)',
    'power_shields_decrease': 'F7 + L Ctrl (keyboard)',
    'power_weapons_increase': 'F5 (keyboard)',
    'power_weapons_decrease': 'F5 + L Ctrl (keyboard)',
    'power_reset_assignments': 'F8 (keyboard)',

    // ===== FLIGHT MODES & TOGGLES =====
    'flight_decoupled_toggle': 'C (keyboard)',
    'flight_vtol_toggle': 'K (keyboard)',
    'flight_landing_system_toggle': 'N (keyboard)',
    'flight_autoland': 'N + L Shift (keyboard)',
    'dock_toggle_mode': 'R Alt+N (keyboard)',

    // ===== MINING & SPECIAL MODES =====
    'seats_toggle_mining_mode': 'M (keyboard)',
    'seats_emergency_exit': 'U + L Shift (keyboard)',
    'cockpit_self_destruct': 'L Ctrl+Del (keyboard)',

    // ===== VIEW & CAMERA =====
    'view_cycle_camera': 'F4 (keyboard)',
    'view_freelook': 'Z (keyboard) + Joystick Hat',
    'view_zoom_in_3p': 'Mouse Wheel Up',
    'view_zoom_out_3p': 'Mouse Wheel Down',
    'seats_look_behind': 'Comma (keyboard)',

    // ===== HUD & INTERFACE =====
    'hud_mobiglass_toggle': 'F1 (keyboard)',
    'hud_map': 'F2 (keyboard)',
    'hud_wipe_visor': 'L Alt + X (keyboard)',

    // ===== DOORS & COCKPIT SYSTEMS =====
    'cockpit_open_all_doors': 'R Ctrl+D (keyboard)',
    'cockpit_close_all_doors': 'L Ctrl+D (keyboard)',
    'lights_headlights_toggle': 'L (keyboard)',
    'lights_landing_lights_toggle': 'L + L Shift (keyboard)',

    // ===== UTILITY & DIAGNOSTICS =====
    'flight_reset_accel': 'R Alt + C (keyboard)',
    'radar_cycle_radar_mode': 'Mouse Wheel Click',
  },
  situationNotes: {
    'Flight': 'Use joystick for pitch/yaw, keyboard WASD for throttle/strafe. X52 throttle wheel for speed control.',
    'Combat': 'F5-F7 for power management. Mouse RMB for precision targeting. H/J for countermeasures.',
    'Mining': 'Toggle with M. Use mouse for beam control. Numpad for shield management.',
    'Scanning': 'Toggle scanning with V. Mouse wheel to adjust scan angle.',
    'Landing': 'N for landing mode. L Shift + Arrow keys available for precise docking.',
  },
  generatedBy: 'OmniCore AI Profile Generator',
  timestamp: new Date().toISOString(),
};

/**
 * Convert profile to IC data format for display in HC05
 */
export function profileToKeybindingsFormat(profileObj) {
  return Object.entries(profileObj.bindings).map(([featureId, binding]) => ({
    id: featureId,
    feature: featureId.replace(/_/g, ' '),
    primaryKey: binding,
    secondaryKey: null,
    hasModifier: binding.includes('+') || binding.includes('L ') || binding.includes('R '),
    changed: false,
    pendingApply: false,
  }));
}

export default {
  logitechX52ProOptimal,
  profileToKeybindingsFormat,
};
