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

## YouTube API Integration (TODO)

### Phase 1: Manual Setup

**Objective**: Pull real YouTube metadata and embed real videos

#### Prerequisites

1. **YouTube API Key**
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create new project: "OmniCore-Aerobook"
   - Enable YouTube Data API v3
   - Create API Key (or OAuth 2.0 credentials for authenticated requests)
   - Add to `.env.local`: `VITE_YOUTUBE_API_KEY=your_key_here`

2. **Creator Channel IDs**
   - Find Star Citizen creators on YouTube
   - Get their channel IDs (e.g., `UCg3QjaMcKCDfxPqzljxPIbw`)
   - Store in database or config file

#### Implementation Steps

1. **Create YouTube service** (`src/core/api/youtubeService.js`)
   ```javascript
   // Fetch videos from creator channels
   // Extract thumbnail, title, channel name, view/like counts
   // Build clip metadata
   ```

2. **Video Selection Process**
   - Search for videos by category tags (#StarCitizen, #Squadron42, etc.)
   - Manually review and curate 3-5 videos per category
   - Test time windows (find best 15-second segments)
   - Add to aeroBookContent.js with real YouTube IDs

3. **Caching Strategy**
   - Cache API responses in `localStorage` with 24-hour TTL
   - Graceful degradation: Fall back to hardcoded defaults if API fails
   - Update cache daily via background sync

4. **Rate Limiting**
   - YouTube API has quota limits (10,000 units/day default)
   - Monitor usage in admin dashboard
   - Consider quota upgrade if scaling

### Phase 2: Automation (Future)

- Scheduled job to fetch latest videos daily
- AI-powered best-moment detection (auto-find good 15sec segments)
- Trending detection (show most-liked clips first)
- Creator submission form (for community participation)

---

## Roadmap

### v1.1 - Live Streamers
- [ ] New page: `/live-streamers`
- [ ] Display active streamers with live status badges
- [ ] Integrate Twitch API for live channel data
- [ ] Prerequisite: HOTAS/keybinding features (mentioned by user)
- [ ] Link to creators' streams from Aerobook

### v1.2 - Bookmark Customization
- [ ] User-configured bookmarks bar
- [ ] Add/remove bookmarks for frequently visited pages
- [ ] Drag-to-reorder bookmarks
- [ ] Persistent storage in user preferences store

### v1.3 - Creator Profiles
- [ ] Creator profile pages (expanded from card click)
- [ ] Full video library by creator
- [ ] Creator bio and social links
- [ ] Subscriber/fan count

### v1.4 - Content Submission
- [ ] Creator-facing dashboard to submit videos
- [ ] Admin queue for content approval
- [ ] Featured badge system
- [ ] Revenue sharing metrics (if applicable)

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

## Next Steps

1. **Find Real Content**: Search YouTube for #StarCitizen and #Squadron42 videos
2. **Curate Time Windows**: Watch videos, identify best 15-second segments
3. **Get Creator Handles**: Fetch channel info from YouTube API
4. **Populate Data**: Add real video IDs and metadata
5. **Test Rotation**: Verify different videos appear on refresh
6. **Deploy**: Push to production when ready

---

*Last Updated: April 16, 2026*
*Feature Lead: User*
*Dev Status: MVP Complete, API Integration Pending*
