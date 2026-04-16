# Media Library Guide

## Overview

OmniCore uses a centralized **Media Library** (`src/data/mediaLibrary.js`) to manage all videos, images, and assets used throughout the application. This keeps content organized, reusable, and easy to update.

---

## Current Implementation

### File Structure

```
src/
├── data/
│   └── mediaLibrary.js           # Central media registry
├── components/
│   └── HeroContainerWithVideo.jsx # Hover video component
└── pages/
    └── theme/
        └── WelcomeOnline.jsx     # Uses media library
```

### How It Works

1. **Media stored in `mediaLibrary.js`** with metadata
2. **Components import helper functions** to fetch media
3. **HeroContainerWithVideo renders** image + hover video
4. **YouTubePlayer handles time windows** (same 15-sec clip system as Aerobook)

---

## Theme Hero Containers (Landing Page)

### Current State

**Location**: `mediaLibrary.themeHeroContainers`

Each hero container has:
- `heroImage` - Static background image (always visible)
- `hoverVideo` - YouTube video that plays on hover (15-sec clip)
- `fallbackImage` - Placeholder if video unavailable

### Star Citizen Container Example

```javascript
starCitizen: {
  id: 'hero-sc',
  title: 'Star Citizen',
  description: 'The Universe Awaits',
  heroImage: {
    url: 'https://via.placeholder.com/1920x1080?text=Star+Citizen+Hero',
    alt: 'Star Citizen universe...',
    credit: 'Roberts Space Industries',
  },
  hoverVideo: {
    youtubeId: 'dQw4w9WgXcQ',  // ← Replace with real ID
    startSec: 0,               // ← Clip starts at 0 seconds
    endSec: 15,                // ← Clip ends at 15 seconds
    title: 'Star Citizen - Welcome to the Verse',
    autoplay: true,
  },
}
```

### Adding Real YouTube Videos

**Step 1: Find YouTube Video**
- Search for "Star Citizen trailer" on YouTube
- Copy the video ID from URL (e.g., `dQw4w9WgXcQ` from `youtube.com/watch?v=dQw4w9WgXcQ`)

**Step 2: Find Best Clip**
- Watch the video
- Identify the best 15-second segment
- Note start time (seconds) and end time (seconds)
- Example: If the epic scene starts at 45 seconds and lasts 15 seconds, use `startSec: 45, endSec: 60`

**Step 3: Update mediaLibrary.js**
```javascript
starCitizen: {
  // ... other fields ...
  hoverVideo: {
    youtubeId: 'YOUR_REAL_VIDEO_ID',  // ← Paste here
    startSec: 45,                       // ← Your start time
    endSec: 60,                         // ← Your end time
    title: 'Your Custom Title',
    autoplay: true,
  },
}
```

**Step 4: Find Static Hero Image**
- Screenshot a good frame from the video, or
- Use official Star Citizen artwork
- Upload to `/public/assets/` or external CDN
- Update `heroImage.url` with the image URL

---

## Dashboard Tool Images

**Location**: `mediaLibrary.dashboardTools`

Each tool has a path to a JPG image:

```javascript
newPlayerGuide: {
  id: 'tool-npg',
  image: '/assets/tools/new-player-guide.jpg',  // ← Local file
  alt: 'New Player Guide - Learn the basics...',
},
```

### Adding Dashboard Images

1. Save JPG to `/public/assets/tools/`
2. Name it: `{tool-name}.jpg`
3. Update the `image` path in `mediaLibrary.js`

**Recommended Specs**:
- Dimensions: 800x400px (landscape)
- Format: JPG
- File size: <150KB
- Content: Tool icon/example + semi-transparent overlay with text

---

## Helper Functions

### Get Hero Container Media

```javascript
import { getHeroContainer } from '@/data/mediaLibrary';

const starCitizenData = getHeroContainer('starCitizen');
// Returns: { id, title, heroImage, hoverVideo, fallbackImage }
```

### Get Tool Image URL

```javascript
import { getToolImage } from '@/data/mediaLibrary';

const imageUrl = getToolImage('newPlayerGuide');
// Returns: '/assets/tools/new-player-guide.jpg'
```

### Preload Images

```javascript
import { preloadImage, preloadImages } from '@/data/mediaLibrary';

// Single image
preloadImage('https://example.com/image.jpg');

// Multiple images
preloadImages([
  'https://example.com/1.jpg',
  'https://example.com/2.jpg',
]);
```

---

## HeroContainerWithVideo Component

### Usage

```jsx
import HeroContainerWithVideo from '@/components/HeroContainerWithVideo';
import { getHeroContainer } from '@/data/mediaLibrary';

<HeroContainerWithVideo
  heroData={getHeroContainer('starCitizen')}
  title="Star Citizen"
  description="Explore the universe"
  onClick={() => navigate('/star-citizen')}
/>
```

### Features

- ✅ Static image on default state
- ✅ YouTube player on hover
- ✅ 15-second time-windowed clips (no full video)
- ✅ Smooth border glow on hover
- ✅ "Hover to explore" hint text
- ✅ Fallback if video unavailable

---

## Roadmap: Content Organization

### Phase 1: Current (MVP)
- [x] Theme hero containers (2x videos)
- [x] Dashboard tool images (6x)
- [x] Aerobook gallery (15x videos)

### Phase 2: Screenshots & Gameplay
- [ ] In-game screenshots (4K gameplay clips)
- [ ] Mining operation screenshots
- [ ] Combat scenarios
- [ ] Trading routes
- [ ] Social spaces

### Phase 3: Creator Content
- [ ] Creator playlists
- [ ] Community highlights
- [ ] Streamer integration
- [ ] User-generated content submissions

### Phase 4: Advanced Features
- [ ] Dynamic rotation (change content on refresh)
- [ ] A/B testing (test different hero videos)
- [ ] Analytics (track which videos perform best)
- [ ] Seasonal content rotation

---

## Best Practices

### Naming Convention

```
mediaLibrary.{category}.{item}

Examples:
- mediaLibrary.themeHeroContainers.starCitizen
- mediaLibrary.dashboardTools.hotasConfig
- mediaLibrary.screenshots.combat[0]
```

### URL Structure

**Local assets** (in /public):
```
/assets/tools/tool-name.jpg
/assets/screenshots/category/name.jpg
/assets/videos/category/name.mp4
```

**External assets** (CDN or external URLs):
```
https://cdn.example.com/image.jpg
https://youtube.com/...
```

### Video Specifications

- **Format**: YouTube links only (via YouTube IDs)
- **Duration**: 15 seconds (optimized for hover)
- **Quality**: 720p minimum, 1080p preferred
- **Format**: MP4 codec (H.264 video, AAC audio)

### Image Specifications

- **Format**: JPG or PNG
- **Dimensions**: 
  - Hero: 1920x1080 (full width)
  - Tool: 800x400 (landscape)
  - Gallery: 1200x800 (flexible)
- **File Size**: <200KB (JPG compression)
- **Quality**: 72 DPI web optimization

---

## YouTube Video Selection Guide

### Finding Good Star Citizen Content

1. **Official Channels**:
   - Cloud Imperium Games (official)
   - Star Citizen (official channel)
   - Squadron 42 (official)

2. **Creator Channels** (with permission):
   - MoxyJingles
   - Project Restoration Crew
   - HangarGames
   - VerseTales
   - PilotSandwich

3. **Search Terms**:
   - "Star Citizen gameplay"
   - "Star Citizen cinematic"
   - "Star Citizen first look"
   - "Squadron 42 trailer"
   - "Star Citizen combat"

### Best Practices

- ✅ **Use clips from beginning/middle** (tends to be better quality)
- ✅ **Look for 4K content** when available
- ✅ **Prefer cinematic moments** (landings, takeoffs, combat)
- ✅ **Check for smooth framerate** (60fps ideal)
- ❌ **Avoid**: Glitches, bugs, or unfinished sequences
- ❌ **Avoid**: Lengthy intro/outro sequences
- ❌ **Avoid**: Copyrighted music (use trailer music only)

---

## Troubleshooting

### Video Not Playing

**Cause**: YouTube video is private, age-restricted, or unavailable

**Fix**: 
- Check video is public
- Verify video ID is correct
- Test in incognito window
- Check browser CORS settings

### Image Not Loading

**Cause**: 404 error (file not found) or CORS issue

**Fix**:
- Verify file path is correct
- Check file exists in `/public/assets/`
- Ensure filename matches exactly (case-sensitive)
- Use absolute URL if external CDN

### Hover Video Freezes

**Cause**: YouTube iframe loading timeout

**Fix**:
- Preload images on page load (use `preloadImages()`)
- Check internet connection
- Verify YouTube API is loaded
- Check browser console for errors

---

## Adding to React Boilerplate

To copy this system to your boilerplate:

1. **Copy Files**:
   ```
   src/data/mediaLibrary.js
   src/components/HeroContainerWithVideo.jsx
   ```

2. **Update paths** for your project structure

3. **Customize categories** (add your own sections to `mediaLibrary`)

4. **Create `/public/assets/` directory** structure:
   ```
   /public/
   ├── /assets/
   │   ├── /tools/
   │   ├── /screenshots/
   │   ├── /videos/
   │   └── /images/
   ```

---

## Next Steps

1. **Find YouTube videos** for Star Citizen and Squadron 42
2. **Test time windows** (find best 15-sec clips)
3. **Update mediaLibrary.js** with real video IDs
4. **Create/source hero images** (1920x1080)
5. **Test hover effect** at `localhost:4242/theme`

---

*Last Updated: April 16, 2026*
*Status: MVP Complete, Ready for Content Population*
