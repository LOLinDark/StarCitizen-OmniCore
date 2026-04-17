/**
 * Star Citizen Profile Parser Utility
 * Parses and manages Star Citizen HOTAS profile XML files
 * 
 * Usage:
 * const profile = await StarCitizenProfileParser.loadProfile(xmlString);
 * const profileName = profile.getProfileName();
 * const binding = profile.getBinding('spaceship_movement', 'v_strafe_left');
 */

export class StarCitizenProfileParser {
  constructor(xmlString) {
    this.xmlString = xmlString;
    this.profileData = this.parseXML();
  }

  /**
   * Parse XML string into profile data structure
   * NOW: Captures multiple rebind entries per action (keyboard AND HOTAS)
   * @returns {Object} Parsed profile data
   */
  parseXML() {
    try {
      // Create a simple parser for XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(this.xmlString, 'text/xml');

      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid XML format');
      }

      // Extract profile name from root ActionMaps element
      const actionMapsElement = xmlDoc.documentElement;
      const profileName = actionMapsElement.getAttribute('profileName');

      // Extract all action mappings - NOW WITH DUAL DEVICE SUPPORT
      const actionMaps = {};
      const actionmapElements = xmlDoc.getElementsByTagName('actionmap');

      for (let i = 0; i < actionmapElements.length; i++) {
        const actionmapEl = actionmapElements[i];
        const mapName = actionmapEl.getAttribute('name');
        
        if (!actionMaps[mapName]) {
          actionMaps[mapName] = {};
        }

        const actions = actionmapEl.getElementsByTagName('action');
        for (let j = 0; j < actions.length; j++) {
          const actionEl = actions[j];
          const actionName = actionEl.getAttribute('name');
          
          // Get ALL rebind entries for this action (not just the first)
          const rebinds = actionEl.getElementsByTagName('rebind');
          const bindings = {};

          for (let k = 0; k < rebinds.length; k++) {
            const rebind = rebinds[k];
            const input = rebind.getAttribute('input');
            
            // Detect device type and store separately
            if (input.startsWith('kb1_')) {
              bindings.keyboard = input;
            } else if (input.startsWith('js1_')) {
              bindings.joystick = input;
            } else if (input.startsWith('mouse')) {
              bindings.mouse = input;
            }
          }

          // Store both device bindings if any exist
          if (Object.keys(bindings).length > 0) {
            actionMaps[mapName][actionName] = bindings;
          }
        }
      }

      return {
        profileName,
        actionMaps,
        rawXml: this.xmlString,
      };
    } catch (error) {
      console.error('[ProfileParser] Error parsing XML:', error);
      throw error;
    }
  }

  /**
   * Get profile name
   */
  getProfileName() {
    return this.profileData.profileName;
  }

  /**
   * Get all actionmaps
   */
  getActionMaps() {
    return this.profileData.actionMaps;
  }

  /**
   * Get binding for specific action
   * NEW: Can specify device type (keyboard, joystick, mouse, or 'any')
   * @param {string} actionMapName - e.g., 'spaceship_movement'
   * @param {string} actionName - e.g., 'v_strafe_left'
   * @param {string} device - 'keyboard', 'joystick', 'mouse', or undefined for first available
   * @returns {string|null} The input binding or null if not bound
   */
  getBinding(actionMapName, actionName, device = null) {
    const bindings = this.profileData.actionMaps?.[actionMapName]?.[actionName];
    
    if (!bindings) return null;
    
    // If bindings is a string (old format), return it
    if (typeof bindings === 'string') {
      return bindings;
    }
    
    // If bindings is an object (new format with device types)
    if (device) {
      return bindings[device] || null;
    }
    
    // Return first available device binding
    return bindings.keyboard || bindings.joystick || bindings.mouse || null;
  }

  /**
   * Get ALL device bindings for a specific action
   * @param {string} actionMapName - e.g., 'spaceship_movement'
   * @param {string} actionName - e.g., 'v_strafe_left'
   * @returns {Object|string} { keyboard?, joystick?, mouse? } or single string if old format
   */
  getBindingsByDevice(actionMapName, actionName) {
    return this.profileData.actionMaps?.[actionMapName]?.[actionName] || null;
  }

  /**
   * Get all bindings for an actionmap
   */
  getActionMapBindings(actionMapName) {
    return this.profileData.actionMaps[actionMapName] || {};
  }

  /**
   * Check if action has a binding
   * @param {string} actionMapName
   * @param {string} actionName
   * @param {string} device - Optional: 'keyboard', 'joystick', 'mouse'
   */
  hasBinding(actionMapName, actionName, device = null) {
    const binding = this.getBinding(actionMapName, actionName, device);
    return binding !== null && binding !== '' && binding !== 'js1_ ';
  }

  /**
   * Get bindings filtered by device type across all actionmaps
   * @param {string} device - 'keyboard', 'joystick', or 'mouse'
   * @returns {Object} Object with structure: { [actionMapName]: { [actionName]: input } }
   */
  getBindingsByDeviceType(device) {
    const filtered = {};
    
    for (const [mapName, actions] of Object.entries(this.profileData.actionMaps)) {
      filtered[mapName] = {};
      
      for (const [actionName, bindings] of Object.entries(actions)) {
        if (typeof bindings === 'string') {
          // Old format
          const bindDevice = bindings.startsWith('kb1_') ? 'keyboard' : 
                            bindings.startsWith('js1_') ? 'joystick' : 
                            bindings.startsWith('mouse') ? 'mouse' : null;
          if (bindDevice === device) {
            filtered[mapName][actionName] = bindings;
          }
        } else {
          // New format
          if (bindings[device]) {
            filtered[mapName][actionName] = bindings[device];
          }
        }
      }
    }
    
    return filtered;
  }

  /**
   * Get all actions across all maps with their bindings
   * Useful for merging with default keybindings
   * NEW: Includes device type information
   * @param {string} device - Optional filter by device ('keyboard', 'joystick', 'mouse')
   * @returns {Array} Bindings with device context: { actionMapName, actionName, input, device }
   */
  getAllBindings(device = null) {
    const allBindings = [];
    
    for (const [mapName, actions] of Object.entries(this.profileData.actionMaps)) {
      for (const [actionName, bindings] of Object.entries(actions)) {
        // Handle both old format (string) and new format (object)
        if (typeof bindings === 'string') {
          // Old format - single string binding
          if (bindings && bindings !== '' && bindings !== 'js1_ ') {
            allBindings.push({
              actionMapName: mapName,
              actionName,
              input: bindings,
              device: bindings.startsWith('kb1_') ? 'keyboard' : 
                      bindings.startsWith('js1_') ? 'joystick' : 
                      bindings.startsWith('mouse') ? 'mouse' : 'unknown',
            });
          }
        } else {
          // New format - object with device keys
          for (const [deviceType, input] of Object.entries(bindings)) {
            if (input && input !== '' && input !== 'js1_ ') {
              if (!device || device === deviceType) {
                allBindings.push({
                  actionMapName: mapName,
                  actionName,
                  input,
                  device: deviceType,
                });
              }
            }
          }
        }
      }
    }
    
    return allBindings;
  }

  /**
   * Export to JSON for API transmission
   */
  toJSON() {
    return {
      profileName: this.profileData.profileName,
      actionMaps: this.profileData.actionMaps,
    };
  }

  /**
   * Static method to load from file (for backend)
   */
  static async loadFromFile(filePath) {
    try {
      const response = await fetch(`/api/hotas/load-profile?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error(`Failed to load profile: ${response.statusText}`);
      
      const xmlString = await response.text();
      return new StarCitizenProfileParser(xmlString);
    } catch (error) {
      console.error('[ProfileParser] Error loading from file:', error);
      throw error;
    }
  }

  /**
   * Parse keyboard/mouse/joystick input format
   * @param {string} input - e.g., 'js1_button22', 'kb1_w', 'mouse1_button1'
   * @returns {Object} Parsed input { device, identifier, button }
   */
  static parseInput(input) {
    if (!input) return null;

    const match = input.match(/^(js|kb|mouse)(\d+)_(.+)$/);
    if (!match) return null;

    const [, device, instance, identifier] = match;
    
    return {
      device: device === 'js' ? 'joystick' : device === 'kb' ? 'keyboard' : 'mouse',
      instance: parseInt(instance, 10),
      identifier,
      rawInput: input,
    };
  }

  /**
   * Get human-readable name for device input
   */
  static getInputDisplayName(input) {
    const parsed = this.parseInput(input);
    if (!parsed) return input;

    const { device, identifier } = parsed;

    // Map common button/axis names
    const buttonMap = {
      button1: 'Button 1',
      button2: 'Button 2',
      button3: 'Button 3',
      button4: 'Button 4',
      button5: 'Button 5',
      button6: 'Button 6',
      button7: 'Button 7',
      button8: 'Button 8',
      button9: 'Button 9',
      button10: 'Button 10',
      button11: 'Button 11',
      button12: 'Button 12',
      button13: 'Button 13',
      button14: 'Button 14',
      button15: 'Button 15',
      button16: 'Button 16',
      button17: 'Button 17',
      button18: 'Button 18',
      button19: 'Button 19',
      button20: 'Button 20',
      button21: 'Button 21',
      button22: 'Button 22',
      button23: 'Button 23',
      button24: 'Button 24',
      button25: 'Button 25',
      button26: 'Button 26',
      button27: 'Button 27',
      button28: 'Button 28',
      button29: 'Button 29',
      button30: 'Button 30',
      x: 'X Axis',
      y: 'Y Axis',
      z: 'Z Axis (Throttle)',
      rx: 'Rotate X',
      ry: 'Rotate Y',
      rz: 'Rotate Z',
      slider: 'Slider',
      pov: 'POV Hat',
      pov_up: 'POV Hat Up',
      pov_down: 'POV Hat Down',
      pov_left: 'POV Hat Left',
      pov_right: 'POV Hat Right',
    };

    return buttonMap[identifier] || identifier;
  }
}

export default StarCitizenProfileParser;
