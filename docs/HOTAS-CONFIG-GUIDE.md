# HOTAS Configuration System Guide

**Created**: April 16, 2026  
**Status**: Active Development (HC05 Baseline Live)  
**Last Updated**: April 19, 2026

---

## Overview

The HOTAS Configuration System is OmniCore's comprehensive keybinding manager for Star Citizen. It enables players to:

1. **Browse keybindings** organized by control category (Flight, Weapons, Shields, Power, etc.)
2. **Search and filter** to reduce noise and find specific controls quickly
3. **Track binding state** - know if changes are applied, pending, or custom
4. **Manage profiles** - load pre-configured profiles or create custom ones
5. **Export/Import XML** - backup and share keybinding configurations
6. **[Phase 2] Detect HOTAS devices** - real-time input detection from Logitech X52 and other joysticks
7. **[Phase 2] Visual feedback** - highlight controls when keys are pressed, diagram overlays

---

## Current Source of Truth (April 2026)

The active implementation is now centered on **HC05** (`/hotas-config`) and not only the older theme-lab variants.

- **Primary page**: `src/pages/HOTASConfigMainPage.jsx`
- **Primary data model**: `src/data/starcitizen-keybindings.js`
- **XML parser**: `src/utils/starCitizenProfileParser.js`
- **Action mapping bridge**: `src/utils/starCitizenActionMap.js`
- **Live input hook**: `src/libraries/hotas/core/useHotasInput.js`
- **UI table**: `src/components/HOTASTable.jsx`
- **Live panel**: `src/components/KeyPressIndicator.jsx`
- **Backend endpoints**: `server/index.js` (`/api/hotas/profiles`, `/api/hotas/profile/:profileName`, `/api/hotas/profile/:profileName/bindings`, `/api/hotas/open-folder`)

Legacy theme pages remain useful for design/testing, but HC05 is the baseline for usability work.

---

## Architecture

### File Structure

```
src/
├── data/
│   └── starcitizen-keybindings.js     # Central keybinding registry
├── pages/
│   └── HOTASConfigMainPage.jsx        # HC05 main configuration page
├── pages/settings/
│   └── HOTASTestPage.jsx              # Input testing lab (HC-TEST)
├── libraries/hotas/core/
│   └── useHotasInput.js               # Gamepad/HOTAS input polling hook
├── utils/
│   ├── starCitizenProfileParser.js    # Profile XML parser
│   └── starCitizenActionMap.js        # Action name normalization/mapping
└── components/
  ├── HOTASTable.jsx                 # Binding table + capture affordance
  └── KeyPressIndicator.jsx          # Dockable live input monitor
server/
└── index.js                           # HOTAS profile APIs
├── config/
│   └── routes.js                      # Routes configuration (already includes /theme/hotas-config)
└── docs/
    └── HOTAS-CONFIG-GUIDE.md          # This file
```

### Data Organization

The keybindings are organized hierarchically:

**Ship Controls** (Main Context)
- **Flight** — Throttle, strafe, roll, quantum travel, landing
- **Ship Weapons** — Fire, gimbal, missiles, targeting assist
- **Shields & Countermeasures** — Defense, power distribution to shields
- **Power Distribution** — Manage power to engines, weapons, shields
- **Targeting** — Lock, cycle targets, pin management
- **Mining** — Mining laser, consumables, cargo jettison
- **Salvage** — Salvage beam, gimbal, modifiers
- **Scanning** — Scan activation, angle adjustment, ping

Future contexts:
- **Ground Vehicles** — Rover/bike controls
- **On Foot** — Walking, combat, utilities, EVA

### Keybinding Data Structure

Each keybinding has this shape:

```javascript
{
  id: 'flight_throttle_up',              // Unique identifier
  feature: 'Throttle Up',                // User-friendly name
  category: 'flight',                    // Category ID (matches shipControlsCategories key)
  primaryKey: 'W',                       // Main keybind
  secondaryKey: null,                    // Alternative keybind
  description: 'Increase ship throttle', // What it does
  hasModifier: false,                    // Uses SHIFT/ALT/CTRL
  changed: false,                        // User modified from default
  pendingApply: false,                   // Waiting for game restart to apply
}
```

### Category Metadata

Categories contain color coding and descriptions:

```javascript
export const shipControlsCategories = {
  flight: {
    id: 'flight',
    label: 'Flight',
    color: '#00d9ff',                     // Cyan for flight
    description: 'Main flight controls...',
  },
  // ... more categories
};
```

---

## Feature Status

### ✅ Phase 1 - Currently Implemented

- [x] **Hierarchical Tabs** — Switch between control categories
- [x] **Search & Sort** — Find bindings by name, key, or description
- [x] **State Indicators** — Visual badges showing applied/changed/pending status
- [x] **Profile Selector** — Choose which profile to view (UI placeholder)
- [x] **Export/Import Buttons** — UI ready (backend not yet implemented)
- [x] **Responsive Table** — Sortable columns, hover effects, tooltips
- [x] **Real Star Citizen Keybindings** — 60+ bindings from official wiki
- [x] **Tooltips** — Hover feature names to see full descriptions

### 🚧 Phase 2 - Planned

- [ ] **HOTAS Device Detection** — Gamepad API integration for X52, HOSAS, joystick detection
- [ ] **Real-Time Input Monitoring** — Detect keypresses and display current action
- [ ] **Binding Editor Modal** — Click a row to edit individual keybindings
- [ ] **Profile Management** — Create, edit, delete custom profiles
- [ ] **X52 Three-Mode Switch** — Detect mode dial position for multi-binding support
- [ ] **Key Press Display** — Optional header showing all recent key presses (streaming feature)
- [ ] **HOTAS Diagram Overlay** — Visual diagram of X52 with light-up effect on key press
- [ ] **XML Parsing/Export** — Read Star Citizen keybinds.xml, export custom profiles
- [ ] **Binding Conflict Detection** — Warn if two actions mapped to same key

### 📋 Phase 3 - Future

- [ ] **Profile Sharing** — Export profiles for community sharing
- [ ] **Preset Templates** — Combat, mining, exploration, trading templates
- [ ] **Video Tutorials** — Embedded guides for common setups
- [ ] **Analytics** — Track most-changed bindings, popular profiles
- [ ] **Mobile Companion** — Mobile app to view/edit bindings on phone
- [ ] **Voice Control Integration** — VoiceAttack support

---

## How to Use the UI

### Navigate Categories

1. Visit `http://localhost:4242/hotas-config` (HC05)
2. See tabs for each category: Flight, Weapons, Shields, Power, Targeting, Mining, Salvage, Scanning
3. Click a tab to filter the table to that category's keybindings

### Search Keybindings

1. Enter text in the **Search** box at the top
2. Results filter by:
   - Feature name (e.g., "Throttle")
   - Key name (e.g., "Alt+W")
   - Description (e.g., "quantum")

### Sort Results

1. Click any column header to sort:
   - **Feature** — Alphabetical
   - **Primary Key** — By key name
   - **Category** — By control category
2. Click again to reverse sort order (↑ ascending, ↓ descending)

### Understand Status Indicators

| Badge | Meaning | Color |
|-------|---------|-------|
| ✓ Applied | Matches game default | Green |
| ◆ Changed | You modified this binding | Orange |
| ⧗ Pending | Will apply when game exits | Yellow |

### Load Profiles

**Currently UI only** — Backend support coming Phase 2

1. Click **"Load Profile"** dropdown
2. Choose from:
   - Default (Star Citizen built-in)
   - Dogfighting Combat
   - Mining Operation
   - Trading Route
   - Deep Space Exploration

---

## Data Sources

### Official Star Citizen Keybindings

Source: [starcitizen.tools/Guide:Controls](https://starcitizen.tools/Guide:Controls) (March 2025 update)

The keybindings database is maintained from the official community wiki and includes:

- **20 Flight controls**
- **5 Weapon system controls**
- **9 Shield & power controls**
- **8 Power distribution controls**
- **7 Targeting controls**
- **7 Mining controls**
- **4 Salvage controls**
- **5 Scanning controls**

**Total: 65+ keybindings** across 8 categories

### Accuracy Notes

- Keybindings are current as of Star Citizen version 4.0
- Updates may be needed if CIG changes the keybinding schema
- Player customizations are tracked separately (changed/pending/applied states)

---

## Phase 2 Integration: HOTAS Device Detection

### Gamepad API Overview

The Gamepad API allows browsers to detect connected gamepad/HOTAS devices:

```javascript
const gamepads = navigator.getGamepads();
gamepads.forEach((gp) => {
  if (gp && gp.id.includes('X52')) {
    console.log('Logitech X52 detected!');
    // Process X52-specific input
  }
});
```

### Logitech X52 Support

The X52 is a HOTAS with:

- **Joystick** — Primary flight control (pitch, yaw, roll)
- **Throttle** — Separate throttle axis
- **Mode Dial** — 3-position switch for mode switching
- **30+ Buttons** — Programmable macro buttons

**Planned mapping:**
- Joystick X/Y axes → Pitch/Yaw
- Throttle axis → Throttle up/down
- Mode dial → Modifier key combination (Shift, Alt, Ctrl combinations)
- Buttons 1-30 → Hardcoded mappings with mode awareness

### Real-Time Key Press Detection

Example implementation (pseudocode):

```javascript
const handleGamepadInput = (gamepad) => {
  // Detect button presses
  gamepad.buttons.forEach((button, index) => {
    if (button.pressed) {
      // Find keybinding with this button
      const binding = findBindingByButton(index, currentMode);
      console.log(`Pressed: ${binding.feature}`);
      // Highlight in UI
      highlightBinding(binding.id);
    }
  });

  // Detect axis movements
  gamepad.axes.forEach((value, index) => {
    if (Math.abs(value) > 0.5) {
      const binding = findBindingByAxis(index);
      console.log(`Moved: ${binding.feature}`);
    }
  });
};
```

### X52 Three-Mode Switch Logic

The X52 mode dial provides 3 modes. Implementation strategy:

```javascript
const detectX52Mode = (gamepad) => {
  // X52 driver sends different button patterns per mode
  // Mode 1: Buttons 0-29
  // Mode 2: Buttons 30-59
  // Mode 3: Buttons 60-89
  // We can infer mode from which button range is active
  
  for (let i = 0; i < 30; i++) {
    if (gamepad.buttons[i].pressed) return 1;
  }
  for (let i = 30; i < 60; i++) {
    if (gamepad.buttons[i].pressed) return 2;
  }
  for (let i = 60; i < 89; i++) {
    if (gamepad.buttons[i].pressed) return 3;
  }
  return 1; // Default
};
```

---

## Implementation Roadmap

### Week 1-2: Foundation (Current ✅)
- [x] Data structure for keybindings
- [x] UI with category tabs
- [x] Search and sort functionality
- [x] Status indicators

### Week 3-4: Device Integration
- [ ] Gamepad API setup
- [ ] X52 detection
- [ ] Real-time input monitoring
- [ ] Key press display in header

### Week 5-6: Binding Editor
- [ ] Modal editor for individual bindings
- [ ] Profile creation/editing
- [ ] Conflict detection

### Week 7-8: XML Integration
- [ ] Parse Star Citizen keybinds.xml
- [ ] Export custom profiles to XML
- [ ] Backup/restore functionality

### Week 9-10: Visual Enhancements
- [ ] X52 diagram overlay
- [ ] Light-up effect on key press
- [ ] Streaming-friendly key display

---

## How to Add New Keybindings

### 1. Update Data File

Edit [src/data/starcitizen-keybindings.js](src/data/starcitizen-keybindings.js):

```javascript
export const shipKeybindings = [
  // ... existing bindings ...
  {
    id: 'unique_id_here',
    feature: 'Your Feature Name',
    category: 'flight',           // Use existing category ID
    primaryKey: 'Your Key',
    secondaryKey: null,           // If alternative exists
    description: 'What this does',
    hasModifier: false,           // true if uses Shift/Alt/Ctrl
    changed: false,
    pendingApply: false,
  },
];
```

### 2. Categories Reference

Use these category IDs from `shipControlsCategories`:

- `flight` — Flight controls
- `weapons` — Ship weapons
- `shields` — Shield & countermeasures
- `power` — Power distribution
- `targeting` — Target management
- `mining` — Mining operations
- `salvage` — Salvage operations
- `scanning` — Scanning systems

### 3. Test in Browser

1. Save the file
2. Vite hot-reload triggers
3. Navigate to `/theme/hotas-config`
4. New binding appears in the table

---

## Configuration Examples

### Accessing Keybindings Programmatically

```javascript
import {
  shipKeybindings,
  shipControlsCategories,
  getKeybindingsByCategory,
  searchKeybindings,
  getCategoryMetadata,
} from '@/data/starcitizen-keybindings';

// Get all flight bindings
const flightBindings = getKeybindingsByCategory('flight');

// Search for specific binding
const throttleBindings = searchKeybindings(shipKeybindings, 'throttle');

// Get category info
const categoryMeta = getCategoryMetadata('flight');
console.log(categoryMeta.label);  // "Flight"
console.log(categoryMeta.color);  // "#00d9ff"
```

### Using in Components

```jsx
import { getKeybindingsByCategory } from '@/data/starcitizen-keybindings';

export function MyComponent() {
  const flightBindings = getKeybindingsByCategory('flight');
  
  return (
    <div>
      {flightBindings.map((binding) => (
        <div key={binding.id}>{binding.feature}: {binding.primaryKey}</div>
      ))}
    </div>
  );
}
```

---

## Design Principles

This system was designed with these principles:

1. **Reduce Noise** — Show only relevant bindings by category
2. **Clear State** — Always know if a change is saved or pending
3. **Discoverable** — Search and sort without overwhelming the player
4. **Flexible** — Support multiple profiles and input devices
5. **Reusable** — Template designed for other games/tools
6. **Real-Time** — Live device detection and visual feedback
7. **Accessible** — Tooltips, descriptions, clear color coding

---

## Troubleshooting

### Keybindings don't appear
- Check category filter is correct
- Try clearing search box
- Verify binding is in correct category in keybindings.js

### X52 not detected
- Browser may need permission (Chrome may require gamepad interaction first)
- Check browser console for errors
- Verify X52 driver is installed and device is connected

### Can't edit bindings
- Binding editor is Phase 2 (not yet implemented)
- For now, this is a viewer only
- Come back in 1-2 weeks for editor

---

## Contributing

To improve the HOTAS Config system:

1. **Add Keybindings** — Update [src/data/starcitizen-keybindings.js](src/data/starcitizen-keybindings.js)
2. **Fix Issues** — Report bugs or inconsistencies
3. **Suggest Categories** — If a binding doesn't fit, suggest a new category
4. **Test Devices** — Help verify X52 and other HOTAS device support

---

## References

- [Star Citizen Controls Guide](https://starcitizen.tools/Guide:Controls)
- [Gamepad API Spec](https://w3c.github.io/gamepad/)
- [Logitech X52 Pro Documentation](https://www.logitechg.com/en-us/products/flight/x52-pro-flight-control-system.943-000058.html)
- [OmniCore DEVELOPER-REFERENCE.md](docs/DEVELOPER-REFERENCE.md)

---

**Last Updated**: April 16, 2026  
**Maintained By**: OmniCore Development Team  
**License**: Project license (see LICENSE file)
