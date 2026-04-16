# OmniCore Tools - Image Assets

This directory contains images for the OmniCore dashboard tool containers.

## Current Status

- ✅ Directory structure created
- ⏳ Images to be generated using Gemini Image Creator
- 📋 Prompts available in `/GEMINI-IMAGE-PROMPTS.md`

## Expected Files

Each tool should have a corresponding image:

```
tools/
├── ship-database.jpg          (800x400px) - Holographic ship scanner
├── hotas-config.jpg           (800x400px) - Flight control setup
├── location-guide.jpg         (800x400px) - Star map/navigation
├── economy-tracker.jpg        (800x400px) - Trading dashboard
├── loadout-builder.jpg        (800x400px) - Weapon/equipment workshop
└── new-player-guide.jpg       (800x400px) - Tutorial/onboarding
```

## How to Add Images

1. **Generate**: Use the prompts in `/GEMINI-IMAGE-PROMPTS.md` with Google Gemini Image Creator
2. **Optimize**: Compress images to ~100-150KB each for web performance
3. **Place**: Save as `.jpg` in this directory with the exact filenames above
4. **Test**: Refresh the app to see images appear in the dashboard

## Fallback Behavior

If an image is missing or fails to load:
- The app displays a gradient placeholder with the tool's emoji
- Color matches the tool's theme color (cyan, orange, green, etc.)
- Responsive design ensures layout stays intact

## Image Specifications

- **Size**: 800x400px (landscape)
- **Format**: JPG or PNG
- **Max size**: 150KB per image for optimal loading
- **Style**: MobiGlass-inspired, dark theme, cyan accents
- **Subject**: Should fill 60-70% of the image for better mobile appearance

## Generated with Prompts

All images should be generated using the detailed prompts in the repository root:
- File: `/GEMINI-IMAGE-PROMPTS.md`
- Status: Ready for immediate use with Gemini Image Creator
- Date: April 16, 2026

---

Created as part of Phase 1 OmniCore MVP implementation.
