# OmniCore Theme Lab — Quick Reference

**Status**: ✅ Live at http://localhost:4242/theme  
**Build Date**: April 16, 2026

---

## 🚀 Get Started Immediately

### Access the Theme Lab
```
http://localhost:4242/theme
```

### Three Pages to Test
1. **Landing Page** → http://localhost:4242/theme
   - Two hero containers (SC + SQ42)
   - Blog gallery
   - Sign-in CTA

2. **Star Citizen Detail** → http://localhost:4242/theme/star-citizen
   - 5+ scrolling sections
   - Cyan theme (#00d9ff)
   - Features, gameplay, community

3. **Squadron 42 Detail** → http://localhost:4242/theme/squadron-42
   - 5+ scrolling sections
   - Orange theme (#ff6b00)
   - Military campaign focus

---

## 🎨 Content Markers

Look for colored badges in the UI:

| Badge | Color | Meaning | Action |
|-------|-------|---------|--------|
| 🟠 PLACEHOLDER | Orange | Sample/demo content | Replace with real content |
| 🟣 WIP | Purple | Under development | Check comments |
| 🔴 NEEDED | Red | Critical blocker | HIGH PRIORITY |

---

## 📋 What's Needed (Checklist)

### Videos (🔴 HIGH PRIORITY)
- [ ] Star Citizen hero background
- [ ] Star Citizen story clip (YouTube-style)
- [ ] Squadron 42 hero background
- [ ] Squadron 42 campaign video
- [ ] 4x military feature videos

### Images (🔴 HIGH PRIORITY)
- [ ] 3x blog thumbnails
- [ ] 2x Star Citizen screenshots
- [ ] 3x Squadron 42 screenshots

### Text/Copy (🟠 MEDIUM PRIORITY)
- [ ] Feature descriptions (check if placeholders need editing)
- [ ] Campaign chapter descriptions
- [ ] Your referral code

---

## 📚 Documentation

| File | What | Read This For |
|------|------|---------------|
| `THEME-LAB.md` | Environment guide | How the lab works |
| `CONTENT-MARKERS-GUIDE.md` | Marker system | Understanding [NEEDED] etc. |
| `THEME-LAB-SESSION-SUMMARY.md` | Build summary | What was built today |
| `GEMINI-IMAGE-PROMPTS.md` | AI image prompts | Generating dashboard images |

---

## 🔧 How to Replace a Marker

### Step 1: Find the Content
Create or source your video/image

### Step 2: Add to Project
Place file in appropriate directory:
- Videos: `/public/videos/`
- Images: `/public/images/` or `/public/assets/`

### Step 3: Update Component
Replace placeholder with your content:
```jsx
// BEFORE (with marker)
<ContentMarker status="needed" type="HERO VIDEO" />
<Box style={{border: '2px dashed cyan'}}>[VIDEO NEEDED]</Box>

// AFTER (with content)
<video src="/videos/hero.mp4" autoPlay muted loop />
```

### Step 4: Remove Marker
Delete the `<ContentMarker />` component

### Step 5: Test
Refresh browser, verify content displays

---

## 🎯 Development Path

### Week 1 (NOW)
- ✅ Build theme lab structure
- ⏳ Source/create videos
- ⏳ Source/create images
- ⏳ Write or refine copy

### Week 2
- [ ] Replace all [NEEDED] markers
- [ ] Remove all dev badges
- [ ] Performance test
- [ ] Mobile device test

### Week 3
- [ ] A/B test with users
- [ ] Iterate based on feedback
- [ ] Production build
- [ ] Deploy

---

## 📱 Browser Testing Checklist

- [ ] Desktop (1920px) — Full layout
- [ ] Tablet (768px) — 2-column layout
- [ ] Mobile (375px) — 1-column layout
- [ ] Hero hovers work smoothly
- [ ] Videos load without errors
- [ ] Images are crisp and fast
- [ ] Links navigate correctly
- [ ] No console errors

---

## 🎬 Video Sources

### Where to Get Videos
- **Gameplay**: Record from game, use existing footage
- **Trailers**: CIG official site or community channels
- **YouTube Embeds**: Extract without visible external links
- **Generated**: Use Gemini video (if available) or similar

### Video Specs
- Format: MP4 or WebM
- Size: < 50MB for hero backgrounds
- Duration: 3-10 seconds for backgrounds, 1-3 min for embedded

---

## 🖼️ Image Sources

### Where to Get Images
- **Screenshots**: From game or promotional material
- **Generated**: Use Gemini (see GEMINI-IMAGE-PROMPTS.md)
- **Licensed**: Stock images if needed
- **Official**: CIG blog, official channels

### Image Specs
- Size: 800x600px or larger
- Format: JPG (photos), PNG (graphics)
- File size: < 150KB compressed
- Aspect ratio: 16:9 preferred

---

## 🔐 Referral Code

**Current placeholder**: `OMNICORE2026`

**To update**:
1. Find in `WelcomeOnline.jsx` (line ~82)
2. Replace with your actual code
3. Verify links work
4. Test checkout flow

---

## 🚨 Common Issues

### Videos Not Loading
- Check file path is correct
- Verify video format supported
- Check file size not too large
- Try opening URL directly in browser

### Images Not Displaying
- Check image path is correct
- Verify image exists in folder
- Try different format (JPG vs PNG)
- Check browser console for errors

### Layout Looks Weird
- Clear browser cache (Cmd/Ctrl + Shift + Delete)
- Hard refresh (Cmd/Ctrl + Shift + R)
- Try in incognito/private mode
- Check responsive breakpoints

---

## 📞 Questions?

See detailed docs:
- **Markers**: CONTENT-MARKERS-GUIDE.md
- **Environment**: THEME-LAB.md
- **Tech Details**: THEME-LAB-SESSION-SUMMARY.md
- **Images for Dashboard**: GEMINI-IMAGE-PROMPTS.md

---

## ⚡ Pro Tips

1. **Use Gemini** for dashboard tool images (6 prompts ready)
2. **Compress media** before adding (use TinyPNG, ImageOptim)
3. **Test mobile first** — Most users on phones
4. **Keep videos short** — < 10 seconds for backgrounds
5. **Monitor console** — Dev tools will show errors
6. **Use back buttons** — Test navigation thoroughly

---

**Theme Lab Live**: http://localhost:4242/theme 🚀

Start by visiting the landing page and exploring the three sections!
