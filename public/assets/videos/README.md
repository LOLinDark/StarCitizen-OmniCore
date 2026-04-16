# Video Assets for OmniCore

Store MP4 video clips here. They will be served from `/assets/videos/` in the app.

## Files Needed

### Hero Containers (Theme Lab)
- **star-citizen-hero.mp4** - 15-30 second Star Citizen gameplay/trailer clip
  - Used on `/theme` page (Star Citizen container)
  - Recommended: High-quality official CIG footage
  - Format: 1920x1080 or 1280x720, MP4 format

- **squadron42-hero.mp4** - 15-30 second Squadron 42 campaign clip
  - Used on `/theme` page (Squadron 42 container)
  - Recommended: Official CIG campaign footage
  - Format: 1920x1080 or 1280x720, MP4 format

## How to Add Videos

1. **Find/create your MP4 file** (see guide below)
2. **Place it in this directory** with the exact name from above
3. **Restart dev server** if needed (`npm run dev`)
4. **Test on `/theme` page** - hover over container to play video

## Sources for CIG Content

### Official Video Resources
- **CIG YouTube Channel**: https://www.youtube.com/@StarCitizen
  - Trailers, gameplay, and promotional content
  
- **CIG Website**: https://robertsspaceindustries.com
  - Official media gallery and video library

### Extracting Videos from YouTube
Use **yt-dlp** (free, open-source):
```bash
# Install yt-dlp
pip install yt-dlp

# Download video (best quality MP4)
yt-dlp -f "best[ext=mp4]" "https://www.youtube.com/watch?v=VIDEO_ID" -o "video.mp4"
```

### Trimming Videos
Use **Adobe Express** (free online editor):
1. Go to https://www.adobe.com/express/tools/video-editor
2. Upload MP4
3. Trim to 15-30 seconds
4. Export as MP4
5. Save to this directory

Or use **FFmpeg** (free, CLI):
```bash
# Trim video from 30s to 45s (15 sec clip)
ffmpeg -i input.mp4 -ss 30 -to 45 -c copy output.mp4
```

## Video Requirements

- **Format**: MP4 (H.264 video codec, AAC audio)
- **Resolution**: 1920x1080 (HD) or 1280x720 (720p)
- **Duration**: 15-30 seconds recommended
- **File Size**: <50MB for smooth streaming (smaller is better)
- **Audio**: Include audio (muted by default on hover, but still good to have)

## Technical Notes

- Videos are served from `/public/assets/videos/` and referenced as `/assets/videos/filename.mp4`
- The app uses HTML5 `<video>` tag (no YouTube API needed)
- Videos autoplay when hovering but are muted by default (browser autoplay policy)
- Videos loop continuously while hovering over containers
- No YouTube UI/branding is shown

## Testing

After adding videos:
1. Hard refresh browser: `Ctrl+Shift+R`
2. Navigate to `/theme` page
3. Hover over Star Citizen container → should play star-citizen-hero.mp4
4. Hover over Squadron 42 container → should play squadron42-hero.mp4

Check browser console (F12) for any loading errors.
