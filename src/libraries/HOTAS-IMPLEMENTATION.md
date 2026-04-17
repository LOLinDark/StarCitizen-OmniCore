# HOTAS Profile Loading Implementation

## Overview

This document describes the infrastructure for loading, parsing, and managing Star Citizen HOTAS profiles.

## Components Created

### 1. **StarCitizenProfileParser** (`src/utils/starCitizenProfileParser.js`)

Utility class for parsing Star Citizen HOTAS profile XML files.

**Key Methods:**
- `getProfileName()` - Get the profile name from XML header
- `getBinding(actionMapName, actionName)` - Get specific key binding
- `getActionMapBindings(actionMapName)` - Get all bindings for an action map
- `hasBinding(actionMapName, actionName)` - Check if action is bound
- `getAllBindings()` - Get all user bindings (for merging with defaults)
- `parseInput(input)` - Parse input format (js1_button22, kb1_w, etc.)
- `getInputDisplayName(input)` - Get human-readable key name

**Usage:**
```javascript
import StarCitizenProfileParser from './utils/starCitizenProfileParser';

const xmlString = `<ActionMaps ...>...</ActionMaps>`;
const profile = new StarCitizenProfileParser(xmlString);

console.log(profile.getProfileName()); // "Logitech-X52-2026"
const binding = profile.getBinding('spaceship_movement', 'v_strafe_left');
```

### 2. **KeyPressIndicator** (`src/components/KeyPressIndicator.jsx`)

React component displaying currently pressed keys in a sticky indicator.

**Features:**
- Listens to keyboard events (window.onkeydown/onkeyup)
- Shows only active/pressed keys
- Appears as fixed sticky box on right side of screen (fixed on-screen)
- Includes key label mapping for friendly names
- Auto-hides when no keys pressed

**Usage:**
```jsx
import KeyPressIndicator from './components/KeyPressIndicator';

export function MyPage() {
  return (
    <>
      <KeyPressIndicator position="right" />
      {/* rest of page */}
    </>
  );
}
```

**Props:**
- `position` - "left" or "right" (default: "right")
- `onKeysChange` - Optional callback when keys change

### 3. **HC05 Updates** (`src/pages/HOTASConfigMainPage.jsx`)

Enhanced HOTAS Config page:

**New Features:**
- ✅ Displays profileName in title (e.g., "HOTAS Config - Logitech-X52-2026")
- ✅ Shows KeyPressIndicator in sticky position
- ✅ Unbound Only toggle to filter unbound features
- Ready for: XML profile loading and merging with defaults

**State Added:**
- `profileName` - Extracted from loaded XML profile

## Backend Requirements

To fully support this, the backend needs to implement:

### Endpoint 1: Load Profile XML
```
GET /api/hotas/profile/:profileName?path=/path/to/xml
Response: { profileName, actionMaps, xmlContent }
```

Responsible for:
1. Reading XML file from Star Citizen user directory
2. Parsing with StarCitizenProfileParser
3. Returning profile data + raw XML

### Endpoint 2: Get Available Profiles
```
GET /api/hotas/profiles
Response: { profiles: [ { name: "...", path: "..." } ] }
```

Endpoint already exists but needs updating to:
- List all .xml files in controls/mappings folder
- Extract profileName from each XML header

## Workflow: Loading & Merging Profiles

### Current State (Phase 1)
- User selects profile from dropdown
- Profile name is extracted from XML header
- Title updates to show "HOTAS Config - ProfileName"
- KeyPressIndicator shows when testing

### Next Phase (When spreadsheet arrives)
1. **Import Full Feature List**
   - Add comprehensive Star Citizen action list to `starcitizen-keybindings.js`
   - Structure: All possible actions with defaults (most unbound)

2. **Load & Merge**
   ```javascript
   // Get defaults
   const defaults = shipKeybindings;
   
   // Get user profile
   const parser = new StarCitizenProfileParser(xmlString);
   const userBindings = parser.getAllBindings();
   
   // Merge: user bindings override defaults
   const merged = defaults.map(feature => {
     const userBinding = userBindings.find(
       b => b.actionName === feature.id
     );
     return userBinding 
       ? { ...feature, primaryKey: userBinding.input }
       : feature;
   });
   ```

3. **Display**
   - Show all features in table
   - Toggle "Unbound Only" filters
   - Display user's custom bindings in primary column

## Test Page: hotas-test

Location: `/settings/hotas` (legacy redirect from `/theme/hotas-test`)

Purpose: Testing and refining key detection plus HOTAS configuration workflows used by HC05.

Suggested improvements:
- Compare keyboard-only detection vs joystick events
- Test sticky indicator positioning with large tables
- Verify performance with many simultaneous key presses
- Refine key label display/formatting

## XML File Format

Star Citizen stores profiles as:
```xml
<ActionMaps version="1" profileName="ProfileName">
  <CustomisationUIHeader label="ProfileName" ...>
    <devices>
      <keyboard instance="1"/>
      <mouse instance="1"/>
      <joystick instance="1"/>
    </devices>
  </CustomisationUIHeader>
  
  <actionmap name="spaceship_movement">
    <action name="v_strafe_left">
      <rebind input="js1_button23"/>
    </action>
    <!-- ... more actions ... -->
  </actionmap>
  <!-- ... more actionmaps ... -->
</ActionMaps>
```

**Key points:**
- `profileName` in root element
- Multiple `actionmap` elements (spaceship_movement, spaceship_radar, etc.)
- Each action can have multiple rebinds (primary, secondary)
- Input format: `{device}{instance}_{control}`
  - Devices: `js` (joystick), `kb` (keyboard), `mouse`
  - Controls: `buttonN`, `x`, `y`, `z` (axes), `slider`, `pov` (hat)

## Input Format Parsing

Examples:
- `js1_button22` - Joystick 1, Button 22
- `js1_z` - Joystick 1, Z-axis (throttle)
- `kb1_w` - Keyboard 1, W key
- `kb1_space` - Keyboard 1, Space bar
- `mouse1_button1` - Mouse 1, Button 1

Display names are mapped in `StarCitizenProfileParser.getInputDisplayName()`.

## Next Steps

1. ✅ Infrastructure complete (parser, indicator, HC05 updates)
2. ⏳ **Get spreadsheet** with full Star Citizen feature list
3. ⏳ Import features into keybindings data
4. ⏳ Implement merge logic in HC05
5. ⏳ Test comprehensive workflow
6. ⏳ Enhance hotas-test for better key detection testing

## Files Changed/Created

**Created:**
- `src/utils/starCitizenProfileParser.js` (350+ lines)
- `src/components/KeyPressIndicator.jsx` (170+ lines)

**Updated:**
- `src/pages/HOTASConfigMainPage.jsx`:
  - Added profileName state
  - Added KeyPressIndicator component
  - Title now displays profile name
  - Enhanced handleLoadProfile to extract profile name

**Ready for updates when you have the spreadsheet:**
- `src/data/starcitizen-keybindings.js` (add full feature list)
