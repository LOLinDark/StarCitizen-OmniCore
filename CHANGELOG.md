# Changelog

All notable changes to OmniCore will be documented in this file.

---

## [Alpha 0.1.0] - 2026-04-22

### Added

**Core App**
- MobiGlass-inspired dark UI with cyan accent theming
- Sticky header with game branding (Star Citizen / Squadron 42)
- Status indicators: IN-DEV, ONLINE/OFFLINE, BACKUP status
- Bookmarks bar with Aerobook, Live, VerseMail, and official RSI links
- App-wide footer with creator attribution and CIG disclaimer
- "Made By The Community" badge
- Admin panel access for LOLinDark via user menu
- PWA manifest and service worker for installability

**HC05 — Peripheral Configuration (HOTAS/KBM)**
- Load and parse Star Citizen XML profile files directly
- Profile card scroller with colour-coded cards and game mode icons
- Sidecar `.omnicore.json` metadata for profiles (label, description, colour, game mode)
- Two table views: "Features → Inputs" and "HOTAS Inputs → Features"
- Live HOTAS input detection via Gamepad API (Logitech X52 device mapping)
- Live Input panel with minimise, detach, and pop-out-to-window modes
- Search by Live Input toggle (filter table by pressing HOTAS buttons)
- Right-click to capture HOTAS or keyboard/mouse bindings
- Captured bindings persist directly to the game's XML profile
- Conflict detection when assigning duplicate bindings
- Unified profile filter: All, HOTAS Assigned, HOTAS Empty, KB/M Assigned, KB/M Empty, Fully Unbound
- Category filter with description display
- View switcher with binding count
- X52 mode switch support (3 modes × all inputs)
- Clickable "Assigned Feature" column in HOTAS Inputs view for inline assignment
- AI-generated X52 Optimal profile (built-in)
- Session state persistence to localStorage

**GT05 — Ship Database**
- Full ship roster from RSI API with server-side caching
- Sortable columns, search, manufacturer/size/role filters
- Column visibility picker
- Expandable row with quick specs and thumbnail
- Full dossier modal with YouTube embed, image gallery, specifications, and lore
- Ship artwork backgrounds on row selection
- Pagination
- Curated YouTube video mapping for ship commercials

**APP01 — Game Settings**
- Reads Star Citizen `attributes.xml` directly
- Searchable table of all in-game settings
- Auto-categorisation (Audio, Graphics, Display, Flight, Head Tracking, etc.)
- Modified/Default filter to highlight player changes

**Aerobook — Media Feed**
- YouTube channel feed (RSI official)
- Twitch VOD feed (Star Citizen channel)
- Squadron 42 playlist feed
- Featured video with inline playback
- Hover-to-preview on video cards
- Category tabs (Star Citizen / Squadron 42 / LIVE)
- New video indicator on bookmarks bar
- Live stream monitoring with transition alerts
- Follow streamers across Twitch/YouTube/Kick/Steam

**VerseMail**
- Contact form with email delivery via SMTP
- Bug report form with GitHub Issues integration

**Backup System**
- Configure a local backup folder (Google Drive / OneDrive / Dropbox sync folder)
- Syncs HOTAS profiles + game settings on demand
- Header status pill shows backup readiness
- Incremental sync (only copies changed files)

**Developer Tools**
- Developer Panel (draggable, minimisable, route navigator)
- API test page
- Nav Charts lab
- HOTAS modes lab and profile matrix lab
- Error log viewer
- Changes tracker
- Analytics dashboard
- Rate limit monitor
- Gemini AI chat interface
- Context index page

**Infrastructure**
- React 18 + Vite frontend
- Express 5 backend with Helmet, CORS, rate limiting
- YouTube RSS feed parser (no API key required)
- Twitch scraper for VODs and live status
- Ship data aggregation with image cache warming
- Google Gemini integration (free tier)
- AWS Bedrock integration (optional)
- Bundle splitting (Mantine, Arwes, vendor, query)

---

## [Unreleased]

### Planned
- Feature explanation column (hideable, with YouTube tutorial links)
- Keyboard usage counter (top 5 most-pressed keys)
- Game settings editor (write back to attributes.xml)
- GitHub Gist backup option
- Profile version history
- StreamerOps integration
