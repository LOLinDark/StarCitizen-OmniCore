# OmniCore Toolkit - Image Generation Prompts

**Status**: Ready for Gemini Image Creator

These prompts are optimized for Google Gemini's image generation. Each image should match the OmniCore aesthetic:
- **Color scheme**: Cyan (#00d9ff), dark blues, sci-fi elements
- **Style**: MobiGlass-inspired, futuristic, touchscreen UI elements, monospace text overlays
- **Dimensions**: 800x400px for dashboard cards

---

## Prompts by Tool

### 1. Ship Database
**Primary Prompt**:
```
A sleek Star Citizen spacecraft displayed in a holographic scanner interface. 
The ship is centered with cyan gridlines, HUD elements showing specifications (speed, mass, crew). 
Dark blue gradient background with glowing cyan accents. 
Monospace text labels for "SHIP DATABASE" in the corner. 
Futuristic MobiGlass aesthetic, highly detailed starship.
```

**Alternative** (if you want a different style):
```
Grid of 4 different Star Citizen ships arranged in a 2x2 holographic display.
Each ship shown from the side profile. Cyan outlines and glowing edges.
Semi-transparent scanlines overlay. Dark space background.
UI elements showing ship names, roles (Starter, Combat, Exploration).
```

---

### 2. HOTAS Config
**Primary Prompt**:
```
Professional flight stick joystick and throttle controls viewed from above.
Rendered with glowing cyan accents on the buttons and handles.
Circuit board patterns and digital overlays beneath the equipment.
HUD display elements showing button mapping and control settings.
Dark metallic background, futuristic lighting.
Text overlay "HOTAS CONFIGURATION" in monospace font.
```

**Alternative** (if you want a different style):
```
Hands positioned on a flight control setup with glowing cyan highlights.
Joystick, throttle, and buttons illuminated with neon-cyan light.
Digital readouts showing axis values and control profiles.
Immersive first-person perspective looking down at the controls.
```

---

### 3. Location Guide
**Primary Prompt**:
```
A holographic star map or space station interior view with navigation waypoints.
Multiple locations marked with cyan glowing dots and connection lines.
Orbital paths around planets or stations shown with cyan neon trails.
3D depth effect showing multiple location layers.
Monospace text labels for location names (Stanton, Pyro, etc).
Dark blue space background with subtle nebula clouds.
UI grid overlay, futuristic sci-fi aesthetic.
```

**Alternative** (if you want a different style):
```
Panoramic view of a bustling space station with multiple docking bays.
Cyan neon signage and navigation lights illuminating the structure.
Ships approaching from different angles. Cargo containers and infrastructure.
Star field visible beyond the station.
```

---

### 4. Economy Tracker
**Primary Prompt**:
```
Financial trading terminal interface with glowing cyan line graphs and data charts.
Commodity price tickers scrolling down the right side.
Bar graphs showing profit margins for different trade routes.
Monospace numerical data and green/red price indicators.
Circuit board pattern background with cyan gridlines.
Dark theme with neon accents, professional trader aesthetic.
Text "ECONOMY TRACKER" in corner.
```

**Alternative** (if you want a different style):
```
Holographic trading floor with stacked data visualizations.
Multiple glowing cyan graphs floating in 3D space.
Connected nodes representing trade routes with glowing cyan lines.
Commodity icons (ore, minerals, electronics) arranged in a circular pattern.
```

---

### 5. Loadout Builder
**Primary Prompt**:
```
High-tech weapon and equipment workshop interface showing assembled combat gear.
Displayed items: plasma rifle, armor plating, power pack, cooling system.
Each item glowing with cyan energy effects.
Floating 3D item previews with rotate/inspect annotations.
Equipment stats and compatibility indicators shown in monospace text.
Dark industrial workshop background with cyan tool highlights.
"LOADOUT BUILDER" label in futuristic font.
```

**Alternative** (if you want a different style):
```
Loadout customization screen showing a full combat suit from multiple angles.
Weapon mounted on right arm, armor plates highlighted in cyan.
Component interconnection visualization with cyan light trails.
HUD-style interface elements surrounding the figure.
```

---

### 6. New Player Guide
**Primary Prompt**:
```
A beginner-friendly tutorial interface with step-by-step progression indicators.
Illustrated path showing progression from recruit to experienced pilot.
Glowing cyan waypoints marking tutorial milestones and achievements.
Icons representing different skill categories: piloting, combat, trading, exploration.
Encouraging onboarding screen with "Path to Prosperity" theme.
Warm cyan and green accent colors. Monospace instructional text.
Futuristic learning interface, welcoming aesthetic.
```

**Alternative** (if you want a different style):
```
Mentorship scene: experienced pilot in a starship cockpit teaching a recruit.
Both figures illuminated by cyan cockpit lighting.
Interactive tutorial overlay showing control explanations.
Galaxy visible through the viewport behind them.
```

---

## Usage Instructions

1. **Copy the primary prompt** for each tool
2. **Paste into Google Gemini Image Creator** (or Gemini Pro)
3. **Recommended settings**:
   - Size: 800x400px (landscape)
   - Quality: High
   - Style: "Photorealistic" or "Cinematic"

4. **Iterate**: If the result doesn't match the OmniCore aesthetic:
   - Try the alternative prompt
   - Adjust color mentions (e.g., "brighter cyan", "darker blue")
   - Add specificity: "8K quality", "high contrast"

5. **Save images** to `/public/assets/tools/` with these names:
   - `ship-database.jpg`
   - `hotas-config.jpg`
   - `location-guide.jpg`
   - `economy-tracker.jpg`
   - `loadout-builder.jpg`
   - `new-player-guide.jpg`

---

## Design Notes

- **Aspect Ratio**: 800x400 landscape recommended for the card layout
- **Subject Dominance**: Main subject should occupy 60-70% of the image
- **Color Balance**: Dark backgrounds with cyan/neon highlights
- **Legibility**: Avoid putting too much fine detail in lower regions (cards get cropped on mobile)
- **Loading**: Each card has a placeholder with the tool's emoji while real images load

---

## Next Steps

1. Generate images using these prompts
2. Optimize for web (compress to ~100-150KB each)
3. Place in `public/assets/tools/` directory
4. Test on mobile devices for responsive behavior

**Generated**: April 16, 2026
