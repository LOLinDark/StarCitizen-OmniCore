# Aerobook - Verse Media Gallery

## Overview

**Aerobook** is an in-app social media gallery showcasing Star Citizen content from creators. It's positioned as "Verse Media" - content flowing through the Star Citizen universe's communication network.

### Design Philosophy

- **Immersive Aesthetic**: Instagram-like grid layout with realistic social engagement metrics
- **Creator Attribution**: Clear display of creator handles and avatars with engagement stats
- **Content Rotation**: Featured clips rotate on each page refresh, powered by seeded rotation
- **Time-Windowed Clips**: 15-second curated segments from full videos prevent viewer fatigue
- **Post-Login Feature**: Accessible via bookmarks bar after authentication (at `/aerobook` route)

---

## Current Implementation

### Features

✅ **Gallery Grid** (Instagram-like)
- Responsive 1x4 grid (base to lg breakpoints)
- Hover-to-play video preview
- Creator badges with avatars
- Like counts and view counts per post
- Category tabs: Star Citizen | Squadron 42 | Community Highlights

✅ **Featured Post Section**
- Prominently displays rotation-selected video for current category
- Full creator info and engagement stats
- Hint text explaining refresh rotation

✅ **Video Player**
- YouTube iframe with time-window support
- 15-second looping clips (configurable)
- Auto-play on modal open / manual play on hover
- Prevents full video from playing (shows specific segment only)

✅ **Rotation System**
- Seeded index stored in `sessionStorage`
- Same video persists during session
- Increments on page refresh
- Wraparound: `index % videos.length`

✅ **Bookmarks Bar (AerobookBar)**
- Fixed top navigation (under main header)
- Aerobook link active, with cyan styling
- Live Streamers placeholder (disabled, showing "Coming Soon")
- Bookmark customization placeholder (roadmap feature)

### File Structure

```
src/
├── components/
│   ├── AerobookBar.jsx          # Bookmarks navigation bar
│   ├── AerobookPost.jsx         # Individual gallery card
│   └── YouTubePlayer.jsx        # Time-window video player
├── pages/
│   └── AerobookPage.jsx         # Main gallery page
├── stores/
│   └── useAerobookStore.js      # Rotation state management
└── data/
    └── aeroBookContent.js       # Mock content + data structure
```

### Data Structure

```javascript
{
  id: 'unique-clip-id',
  youtubeId: 'xxxxxxx',              // YouTube video ID
  creatorHandle: '@CreatorName',     // Creator's handle
  creatorAvatar: 'url-to-avatar',    // Avatar image
  title: 'Clip Title',               // Post title
  category: 'star-citizen',          // Category key
  startSec: 30,                      // Clip start time (seconds)
  endSec: 45,                        // Clip end time (seconds)
  likeCount: 5000,                   // Engagement metric
  viewCount: 25000,                  // Engagement metric
  timestamp: '2d ago',               // Relative time
  duration: 15                       // Calculated duration
}
```

---

## YouTube API Integration

The Aerobook currently uses mock data but is structured for real YouTube API integration. For planning details and implementation phases, see the private planning document.

Currently supported:
- Time-windowed 15-second clips from YouTube videos
- Creator attribution and engagement metrics
- Category-based content organization (Star Citizen | Squadron 42 | Community Highlights)

For YouTube setup and caching strategy, refer to: [AEROBOOK-FEATURE-PLANNING.md](../../g:/My%20Drive/Project%20Management/Live/OmniCore-Documentation/AEROBOOK-FEATURE-PLANNING.md)

---

## Configuration

### Mock Data Location
`src/data/aeroBookContent.js`

**To Add New Content:**
1. Find YouTube video ID
2. Find best 15-second segment (watch full video, note timestamps)
3. Add object to appropriate category array
4. Populate all fields (creator, metrics, etc.)
5. Test in dev environment

### Styling Variables
- **Primary Color**: `#00d9ff` (Cyan)
- **Secondary Color**: `#ff6b00` (Orange)
- **Accent**: `#00ff88` (Green)
- **Background**: `rgba(11, 20, 40, 0.95)` (Dark Blue)
- **Border**: `rgba(0, 217, 255, 0.2)` (Cyan 20%)

---

## API Reference

### useAerobookStore
State management for rotation index

```javascript
import { useAerobookStore } from '@/stores';

const rotationIndex = useAerobookStore((s) => s.rotationIndex);
const getVideoIndex = useAerobookStore((s) => s.getVideoIndex);
```

### YouTubePlayer Props
```javascript
<YouTubePlayer
  youtubeId="abc123"        // Required: YouTube video ID
  startSec={30}             // Required: Clip start (seconds)
  endSec={45}               // Required: Clip end (seconds)
  title="Clip Title"        // Optional: Accessibility
  autoplay={false}          // Optional: Default false
/>
```

### AerobookPost Props
```javascript
<AerobookPost
  post={postObject}         // Required: Post data object
  onSelect={(post) => {}}   // Required: Selection callback
/>
```

---

## Troubleshooting

### Videos Not Playing
- Check YouTube video ID is valid
- Verify `startSec` < `endSec`
- Check browser console for CORS errors
- YouTube video might be age-gated or region-restricted

### Rotation Not Changing
- Clear `sessionStorage` in DevTools
- Hard refresh (Ctrl+Shift+R)
- Check `useAerobookStore` is using `sessionStorage` not `localStorage`

### Missing Creator Avatars
- Placeholder generates fallback with initial letter
- Ensure avatar URLs are CORS-accessible
- Test image URLs directly in browser

---

## Performance Considerations

- **Video Iframes**: Load on hover only (not on initial page load)
- **Lazy Loading**: Gallery grid images load as viewport scrolls
- **Session Storage**: Persists rotation index across navigation, resets on browser close
- **Cache**: YouTube metadata cached for 24 hours (when API integration added)

---

## Creator Acknowledgment

Content creators featured in Aerobook are credited with:
- Creator handle prominently displayed
- Avatar visible in gallery cards
- Engagement stats (view count)
- Link to full videos (future: link to creator profile)

**Removal Policy**: If a creator requests removal, their content can be deleted from `aeroBookContent.js` within 48 hours.

---

## Data Curation

To add new content to the gallery:

1. Find YouTube video ID from the URL (e.g., `dQw4w9WgXcQ` from `youtube.com/watch?v=dQw4w9WgXcQ`)
2. Identify the best 15-second segment by watching the video and noting start/end times
3. Add to the appropriate category array in `src/data/aeroBookContent.js`
4. Populate all fields: creator, title, metrics, timestamps

The data structure is defined in [Configuration](#configuration) above.

---

*Last Updated: April 21, 2026*
*Keep this document as a reference for the current implementation. See private planning doc for roadmap and phases.*
