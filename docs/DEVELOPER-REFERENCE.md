# OMNI-CORE Developer Reference

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 + Vite | SPA foundation |
| Component Library | Mantine 8 | Layout, forms, navigation, data display |
| Sci-Fi Visual Layer | Arwes 1.0.0-next | Animated frames, text effects, backgrounds |
| Backend | Express 5 | API server, AI proxy, rate limiting |
| AI | Google Gemini + AWS Bedrock | Content generation, chat |
| PWA | manifest.json + sw.js | Installable web app |

## Project Structure

```
src/
├── components/
│   ├── ui/                  # Arwes wrapper layer (isolation pattern)
│   │   ├── index.js         # Barrel export
│   │   ├── SciFiFrame.jsx   # Wraps @arwes/react-frames
│   │   ├── SciFiText.jsx    # Wraps @arwes/react-text
│   │   └── SciFiBackground.jsx  # Wraps @arwes/react-bgs
│   ├── DevFooter.jsx        # Dev mode activity monitor
│   └── LayoutNew.jsx        # Main app shell (header, nav, aside)
├── contexts/
│   └── DevContext.jsx        # Dev mode state
├── pages/                    # One file per route/view
│   ├── DashboardPage.jsx     # Main landing — feature cards
│   ├── WelcomePage.jsx       # Splash/loading screen
│   ├── AboutPage.jsx         # Project info, credits, disclaimer
│   ├── AmazonQPage.jsx       # Claude chat (admin)
│   ├── GeminiPage.jsx        # Gemini chat (admin)
│   ├── AIRulesPage.jsx       # AI system prompt config
│   ├── AnalyticsPage.jsx     # Usage/cost analytics
│   ├── RateLimitPage.jsx     # Rate limit monitor
│   ├── HistoryPage.jsx       # Field change history
│   ├── SettingsPage.jsx      # App settings, cost alerts
│   ├── ThemePage.jsx         # Theme customizer
│   ├── DeveloperPage.jsx     # Dev tools hub
│   ├── ChangesPage.jsx       # Changelog
│   └── ErrorLogPage.jsx      # Error log viewer
├── styles/
│   └── scifi-theme.css       # CSS variables, Arwes overrides
├── utils/
│   ├── dataStorage.js
│   ├── historyManager.js
│   └── writingStyles.js
├── App.jsx                   # Route mapping
├── main.jsx                  # Mantine provider, theme config
└── index.css                 # Base reset
```

## Arwes Integration Pattern

### Why a wrapper layer?

Arwes is in alpha (`1.0.0-next`). To protect against API changes:

1. **Pages never import from `@arwes/*` directly**
2. Pages import from `src/components/ui/` wrappers
3. If Arwes changes or dies, only the wrapper files need updating

### Pinned version

Arwes is pinned to an exact version in `package.json` (no `^` prefix). Updates are deliberate — run `npm outdated` to check, test in a branch before bumping.

### Current wrappers

#### SciFiFrame
Wraps `@arwes/react-frames` (FrameCorners, FrameLines, FrameNefrex, FrameOctagon, FrameHeader).

```jsx
import { SciFiFrame } from '../components/ui';

<SciFiFrame variant="corners" cornerLength={16} strokeWidth={1} padding={4}>
  <p>Content inside a sci-fi bordered panel</p>
</SciFiFrame>
```

**Variants**: `corners`, `lines`, `nefrex`, `octagon`, `header`

#### SciFiText
Wraps `@arwes/react-text` (animated typewriter/glitch text).

```jsx
import { SciFiText } from '../components/ui';

<SciFiText as="h1" blink>OMNI-CORE</SciFiText>
```

**Props**: `as`, `blink`, `fixed`, `manager`

#### SciFiBackground
Wraps `@arwes/react-bgs` (animated dot/grid backgrounds).

```jsx
import { SciFiBackground } from '../components/ui';

<div style={{ position: 'relative' }}>
  <SciFiBackground variant="dots" color="hsla(180,75%,50%,0.12)" distance={30} />
  <div style={{ position: 'relative', zIndex: 1 }}>Content</div>
</div>
```

**Variants**: `dots`, `gridLines`

## Color Palette

Defined as CSS variables in `src/styles/scifi-theme.css`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--oc-space-deep` | `#0a1428` | Page backgrounds |
| `--oc-space-mid` | `#0f1b2e` | Card/panel backgrounds |
| `--oc-space-light` | `#1a2a3e` | Elevated surfaces |
| `--oc-cyan` | `#00d9ff` | Primary accent, borders, headings |
| `--oc-cyan-dim` | `hsla(190,100%,50%,0.3)` | Subtle borders |
| `--oc-cyan-glow` | `hsla(190,100%,50%,0.15)` | Hover glows |
| `--oc-purple` | `#b300ff` | Secondary accent |
| `--oc-green` | `#00ff88` | Success states |
| `--oc-orange` | `#ff6b00` | Warning states |
| `--oc-red` | `#ff0055` | Error states |
| `--oc-text` | `#c1d0e0` | Body text |
| `--oc-text-dim` | `#6b7f96` | Muted text |

## CSS Utility Classes

| Class | Effect |
|-------|--------|
| `.scifi-card` | Dark background, cyan border, hover glow |
| `.scifi-heading` | Cyan, uppercase, letter-spaced, text shadow |
| `.scifi-frame` | Container class applied by SciFiFrame wrapper |

## Backend API

Base URL: `http://localhost:3001`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/version` | GET | Server version + project hours |
| `/api/usage` | GET | Token/cost usage stats |
| `/api/rate-limits` | GET | Current rate limit status |
| `/api/pricing` | GET | Model pricing table |
| `/api/pricing/calculate` | POST | Estimate cost for token count |
| `/api/model` | POST | Switch active Bedrock model |
| `/api/gemini` | POST | Send message to Gemini |
| `/api/gemini/models` | GET | List available Gemini models |
| `/api/chat` | POST | General chat (Gemini or Bedrock) |
| `/api/log-error` | POST | Log frontend error to file |
| `/api/server/restart` | POST | Graceful server shutdown |

## Environment Variables

```
GEMINI_API_KEY=<your-key>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>       # uncomment to enable Bedrock
AWS_SECRET_ACCESS_KEY=<your-key>   # uncomment to enable Bedrock
PORT=3001
MAX_DAILY_REQUESTS=20
MAX_HOURLY_REQUESTS=5
```

## Running

```bash
npm run dev      # Frontend on :5173
npm run server   # Backend on :3001
npm run build    # Production build
```

## Adding a New Page

1. Create `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`: `{section === 'your-page' && <YourPage />}`
3. Add nav link in `src/components/LayoutNew.jsx`
4. Use `SciFiFrame` / `SciFiText` from `../components/ui` for sci-fi styling
5. Use Mantine components for layout and forms

## Open Source Dependencies

See the About page in-app or `package.json` for the full list. Key credits:

- **Arwes** by Romel Pérez — [github.com/arwes/arwes](https://github.com/arwes/arwes) (MIT)
- **Mantine** by Vitaly Rtishchev — [github.com/mantinedev/mantine](https://github.com/mantinedev/mantine) (MIT)
