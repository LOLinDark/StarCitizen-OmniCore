# Content Markers Guide

A visual system for tracking placeholder content, work-in-progress items, and missing assets during OmniCore development.

---

## Marker Types

### 🟠 `[PLACEHOLDER]` - Orange Badge
**Meaning**: Temporary mockup or demo content. Not final.  
**Action**: Replace with real content before production.  
**Examples**:
- Logo placeholders
- Sample descriptions or copy
- Demo numbers or data
- Gradient backgrounds instead of real video

**In Code**:
```jsx
<ContentMarker status="placeholder" type="VIDEO" />
// or
<div style={{ color: '#ff6b00' }}>[PLACEHOLDER]</div>
```

---

### 🟣 `[WIP]` - Purple Badge  
**Meaning**: Work-in-progress, partially built, actively being developed.  
**Action**: Check the code comments for what's being worked on.  
**Examples**:
- Social media integration skeleton
- Gallery functionality being built
- Feature that's half-implemented

**In Code**:
```jsx
<ContentMarker status="wip" type="SOCIAL INTEGRATION" />
// or use inline comments: // TODO: Finish carousel
```

---

### 🔴 `[NEEDED]` - Red Badge  
**Meaning**: Critical blocker. Needs external content or creation.  
**Action**: High priority. Cannot proceed without this.  
**Examples**:
- **Video Background** → Need gameplay/promotional video
- **Embedded Video Clip** → Need YouTube URL or video file
- **Hero Video** → Need cinematic intro footage
- **Screenshot** → Need gameplay or UI screenshot
- **Blog Thumbnail** → Need blog post image

**In Code**:
```jsx
<ContentMarker status="needed" type="HERO VIDEO" />
// or
<Box style={{ border: '2px dashed var(--oc-cyan)' }}>
  [HERO VIDEO NEEDED]
</Box>
```

---

## Visual Appearance

Each marker is color-coded and styled to stand out on page:

| Status | Color | Hex | Priority |
|--------|-------|-----|----------|
| PLACEHOLDER | Orange | `#ff6b00` | Low → Medium |
| WIP | Purple | `#b300ff` | Medium |
| NEEDED | Red | `#ff0055` | High → Critical |

---

## Content Markers by Location

### WelcomeOnline.jsx

- **Hero Containers**: 
  - `[PLACEHOLDER] VIDEO + CONTENT` — Gradient backgrounds need actual videos
  - `[NEEDED] IMAGE` — Blog thumbnails need real blog post images

### StarCitizenDetail.jsx

- **Hero Section**: `[NEEDED] HERO VIDEO`
- **Story Section**: `[NEEDED] EMBEDDED VIDEO (YouTube clip)`
- **Features**: `[PLACEHOLDER] DESCRIPTION` — Copy might need refinement
- **Gameplay Showcase**: `[NEEDED] IMAGE CAROUSEL` — Screenshots needed
- **Community**: `[WIP] SOCIAL INTEGRATION` — Discord/forum links being added

### Squadron42Detail.jsx

- **Hero Section**: `[NEEDED] HERO VIDEO`
- **Story Section**: `[NEEDED] STORY VIDEO` — Campaign trailer or lore video
- **Campaign Chapters**: `[PLACEHOLDER] CHAPTER COUNT` — Actual chapter count TBD
- **Military Life**: `[NEEDED] FEATURE VIDEO` — Feature demonstrations
- **Gameplay**: `[NEEDED] IMAGE CAROUSEL` — Screenshots needed

---

## How to Use Markers in New Code

### 1. Creating a Placeholder Section

```jsx
import { Badge, Box, Text } from '@mantine/core';

const ContentMarker = ({ status, type }) => (
  <Badge color={statusColors[status]} variant="outline">
    [{status}] {type}
  </Badge>
);

// In your component:
<div>
  <ContentMarker status="placeholder" type="DESCRIPTION" />
  <p>This is sample text that needs to be rewritten...</p>
</div>
```

### 2. Marking Video Backgrounds

```jsx
<Box
  style={{
    background: 'linear-gradient(135deg, var(--oc-space-mid), var(--oc-space-light))',
    border: '2px dashed var(--oc-cyan)',
    padding: '2rem',
    textAlign: 'center',
  }}
>
  <ContentMarker status="needed" type="VIDEO BACKGROUND" />
  <Text c="dimmed">[GAMEPLAY VIDEO OR PROMOTIONAL CLIP NEEDED HERE]</Text>
</Box>
```

### 3. Marking Images/Screenshots

```jsx
<Box
  style={{
    aspectRatio: '16/9',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <ContentMarker status="needed" type="SCREENSHOT" />
  <Text c="dimmed">[GAMEPLAY SCREENSHOT]</Text>
</Box>
```

---

## Workflow

### Phase 1: Theme Lab Development (NOW)
- Build layouts with markers
- Use gradients, icons, placeholders for visual structure
- **Goal**: Test responsive design and user flow

### Phase 2: Content Creation (NEXT)
1. Find/create videos (game capture, YouTube clips, promotions)
2. Find/create screenshots (in-game, promotional material)
3. Write copy (test messaging, refine descriptions)
4. Replace `[NEEDED]` markers with real content

### Phase 3: Production (POLISH)
1. Compress images/videos for web
2. Remove all `[PLACEHOLDER]` and `[WIP]` markers
3. Final QA and user testing
4. Deploy

---

## Content Sources

### Videos
- **Hero/Background Videos**: Gameplay captures, promotional content
- **Embedded Clips**: YouTube (with no external links visible)
- **Trailers**: Official CIG content or community-made

### Images
- **Screenshots**: In-game screenshots or promotional images
- **Blog Thumbnails**: Official CIG blog or community content
- **Backgrounds**: Gemini-generated images (see GEMINI-IMAGE-PROMPTS.md)

### Copy
- **Descriptions**: Original writing or adapted from official sources
- **CTAs**: Branded messaging with referral code integration

---

## Checking Your Progress

### Quick Audit
Search your components for these strings:

```bash
# Terminal: Find all markers in use
grep -r "\[PLACEHOLDER\]" src/
grep -r "\[WIP\]" src/
grep -r "\[NEEDED\]" src/
```

### Before Production
✅ All `[NEEDED]` markers replaced with real content  
✅ All `[PLACEHOLDER]` markers reviewed and finalized  
✅ All `[WIP]` markers completed  
✅ No dev badges visible in production build  
✅ All videos optimized and loading properly  
✅ All images optimized (<150KB each)  

---

## Example: Complete Marker Lifecycle

```jsx
// Phase 1: Planning (Marker Added)
<Section marker={{ status: 'needed', type: 'HERO VIDEO' }}>
  <Box style={{border: '2px dashed var(--oc-cyan)'}}>
    [VIDEO HERO NEEDED HERE]
  </Box>
</Section>

// Phase 2: Content Creation (Content Added)
// → You find/create a video background
// → Video path: /assets/videos/star-citizen-hero.mp4

// Phase 3: Implementation (Marker Removed)
<Section videoBackground="/assets/videos/star-citizen-hero.mp4">
  <VideoBackground src="/assets/videos/star-citizen-hero.mp4" />
</Section>

// Production: READY ✅
```

---

## Remember

- 🎨 **Markers are development aids** — Remove before launch
- 📌 **They track progress** — Use them to stay organized
- 🚀 **They save time** — Don't forget what needs doing
- 💡 **They communicate** — Team knows what's missing at a glance

---

**Created**: April 16, 2026  
**Theme Lab Status**: In Development  
**Next Steps**: Generate content and replace markers
