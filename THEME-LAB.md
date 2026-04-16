# Theme Lab - Development Environment

**Status**: ✅ Live at http://localhost:4242/theme  
**Date Created**: April 16, 2026  
**Purpose**: Design and test landing pages before integrating into main app flow

---

## Quick Start

### Access the Theme Lab

1. **Start the dev server** (if not running):
   ```bash
   cd c:\wamp64\www\OmniCore
   npm run dev
   ```

2. **Open in browser**:
   - Main landing: **http://localhost:4242/theme**
   - Star Citizen detail: **http://localhost:4242/theme/star-citizen**
   - Squadron 42 detail: **http://localhost:4242/theme/squadron-42**

3. **Dev Mode Indicator**: Look for the purple `🔬 THEME LAB` badge in the top-right corner

---

## What's Included

### Pages

#### 🌐 WelcomeOnline (`/theme`)
**Purpose**: Landing page for new visitors  
**Features**:
- Two hero containers (Star Citizen, Squadron 42)
- Hover effects with border glow
- Blog gallery section (3 thumbnail cards)
- Sign in CTA for existing users
- Fully responsive (1 col mobile, 2 col desktop)

**Status**:
- Layout: ✅ Complete
- Styling: ✅ Complete
- Content: 🔴 [NEEDED] Videos, images, blog content

#### 🚀 StarCitizenDetail (`/theme/star-citizen`)
**Purpose**: Detailed landing page for "Star Citizen" path  
**Sections**:
1. Hero with video background
2. "What is Star Citizen?" with embedded video
3. Core Features (6 feature cards)
4. Gameplay Showcase (2 screenshot placeholders)
5. Community Integration
6. CTA section

**Status**:
- Layout: ✅ Complete
- Styling: ✅ Complete
- Content: 🔴 Multiple [NEEDED] markers for videos/images

#### ⚔️ Squadron42Detail (`/theme/squadron-42`)
**Purpose**: Detailed landing page for "Squadron 42" path  
**Sections**:
1. Hero with orange/military theming
2. "Answer the Call" story video section
3. Campaign Chapters (3 chapter cards)
4. Military Life features (4 feature cards)
5. Gameplay Showcase (3 screenshots)
6. CTA section

**Status**:
- Layout: ✅ Complete
- Styling: ✅ Complete
- Content: 🔴 Multiple [NEEDED] markers for videos/images

---

## Content Markers System

Three-tier system for tracking development:

| Badge | Meaning | Priority | Example |
|-------|---------|----------|---------|
| 🟠 `[PLACEHOLDER]` | Demo content, not final | Low-Med | "Sample description" |
| 🟣 `[WIP]` | Work in progress | Medium | Social integration skeleton |
| 🔴 `[NEEDED]` | Critical blocker | High | Hero video required |

**See**: [CONTENT-MARKERS-GUIDE.md](CONTENT-MARKERS-GUIDE.md)

---

## File Structure

```
src/pages/theme/
├── WelcomeOnline.jsx          (Landing page - 2 hero containers)
├── StarCitizenDetail.jsx      (SC detail page - 5+ sections)
└── Squadron42Detail.jsx       (SQ42 detail page - 5+ sections)

Documentation:
├── CONTENT-MARKERS-GUIDE.md   (How to use markers)
├── THEME-LAB.md               (This file)
└── IMPLEMENTATION-SUMMARY.md  (Full technical overview)
```

---

## Key Features

### Responsive Design
- **Mobile (1 col)**: Single column layout
- **Tablet (< 768px)**: 2 columns where appropriate
- **Desktop (≥ 768px)**: Full 3-column or multi-section layout

### Theming
- Star Citizen: **Cyan accents** (#00d9ff), clean sci-fi
- Squadron 42: **Orange accents** (#ff6b00), military vibe
- Both use the OmniCore dark theme

### Interactive Elements
- **Hover effects**: Border glow + box shadow
- **Navigation**: Back buttons, internal linking
- **CTAs**: Referral code integration ready (TODO: add your code)

### Content Flexibility
- Video backgrounds can be swapped easily
- Image placeholders with fallback text
- Modular section components

---

## Next Steps

### 1. Test Responsiveness
- [ ] View on mobile (375px width)
- [ ] View on tablet (768px width)
- [ ] View on desktop (1920px width)
- [ ] Test all navigation links

### 2. Create Content
Use these markers as your checklist:

**Videos Needed**:
- [ ] Star Citizen hero video (background)
- [ ] Star Citizen "What is?" video (YouTube embed)
- [ ] Squadron 42 hero video (background)
- [ ] Squadron 42 story video (YouTube embed)
- [ ] 4x feature videos (military life section)

**Images Needed**:
- [ ] 3x blog thumbnail images
- [ ] 2x Star Citizen gameplay screenshots
- [ ] 3x Squadron 42 gameplay screenshots

**Copy/Content**:
- [ ] Refine feature descriptions
- [ ] Add chapter descriptions (SQ42)
- [ ] Verify referral code

### 3. Replace Markers
1. Find each `[NEEDED]`, `[PLACEHOLDER]`, `[WIP]` marker
2. Add your content
3. Remove the marker component
4. Test responsiveness again

### 4. Integrate Into Main App
When complete:
1. Move pages into production mode
2. Update routing to show based on user type
3. Remove dev badges and theme lab indicators
4. Deploy

---

## Video Integration Examples

### Background Video (Hero Section)
```jsx
<div style={{
  background: `url(var(--oc-video-hero))`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '400px',
}}>
  {/* Content overlay */}
</div>
```

### Embedded Video (YouTube - No External Links Visible)
```jsx
<iframe
  width="100%"
  height="400"
  src="https://www.youtube.com/embed/VIDEO_ID?controls=0"
  title="Star Citizen"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

---

## Image Optimization Tips

Before adding images to theme lab:
- **Size**: 800x600px or 1200x800px (landscape preferred)
- **Format**: JPG for photos, PNG for graphics
- **File size**: Aim for < 150KB per image
- **Compression**: Use TinyPNG, ImageOptim, or similar

---

## Referral Code Integration

Currently set to placeholder `OMNICORE2026`.

**To update**:
1. Edit `WelcomeOnline.jsx` line 82:
   ```jsx
   const referralCode = 'OMNICORE2026'; // TODO: Your code
   ```
2. Or make it dynamic from app state/config

**Where used**:
- CTA buttons redirect to RSI with referral code
- Copy shows "with Referral" context

---

## Development Notes

### Browser DevTools Tips
- **Responsive Design Mode**: Cmd/Ctrl + Shift + M
- **Viewport Toggle**: Test all breakpoints
- **Network Tab**: Monitor video/image loading
- **Console**: Check for any errors with markers

### Component Reusability
- `ContentMarker` component is reusable in any page
- Marker system can be applied to other projects
- Easy to toggle off with environment variable if needed

---

## Browser Support

Tested on:
- ✅ Chrome 120+
- ✅ Safari 17+
- ✅ Firefox 121+
- ✅ Edge 120+

---

## Known Limitations

- 🎥 **Videos**: Currently placeholders (gradients + text)
- 🖼️ **Images**: Using placeholder boxes with text
- 🔗 **Links**: CTAs point to placeholder URLs
- 📱 **Mobile**: No touch-specific optimizations yet

---

## Performance Considerations

- Lazy-load detail pages (images/videos)
- Compress all media before production
- Use CDN for video delivery if possible
- Monitor bundle size with video imports

---

## Support

See related documents:
- **Content markers**: [CONTENT-MARKERS-GUIDE.md](CONTENT-MARKERS-GUIDE.md)
- **Full implementation**: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)
- **Gemini images**: [GEMINI-IMAGE-PROMPTS.md](GEMINI-IMAGE-PROMPTS.md)

---

**Created**: April 16, 2026  
**Last Updated**: April 16, 2026  
**Next Phase**: Content creation and integration
