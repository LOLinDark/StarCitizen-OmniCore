# OMNI-CORE: Citizen Operations & Intelligence Network

> "Take the helm. Own your success."

OmniCore is a Star Citizen companion hub — a PWA combining ship intelligence, peripheral configuration, and in-game tooling in one MobiGlass-inspired interface.

---

## Vision & Motivation

OmniCore was born from a simple observation: while Cloud Imperium Games has built an impressive scope of tools for Star Citizen, there's always room for innovation in how we play.

As a backer since 2013, I've watched the game evolve and wanted to be ready when Squadron 42 launches. After taking a break and returning to master flying mechanics, I found the HOTAS configuration process tedious. Most games struggle with this. Rather than accept the limitations, I built a tool to edit the game's XML configuration files directly, backup configurations to GitHub or Google Drive, and manage profiles effortlessly.

From there, the vision expanded: **What if OmniCore could become an operating system for how I play Star Citizen?**

### Where We're Heading

- **Fleet Management**: Track your hangar, manage loadouts per ship, visualize your collection
- **Career Tracking**: Monitor playtime, contract history, and progression across your account
- **Advanced HOTAS**: Full support for multi-mode controllers (like the Logitech/Saitek X52's 3-position switch)
  - Pre-built mode profiles (e.g., "Landing & Navigation", "Combat", "Mining")
  - Seamless XML sync with backups
  - Profile version control
- **Modular Design**: Extensible for future in-game data, Spectrum integration, and beyond
- **Mobile-First**: PWA today, native Android app tomorrow

We've moved beyond prototype — OmniCore is a working companion hub with real utility for players preparing for Squadron 42 and beyond.

---

## For Players

### What's Inside

| Tool | Description |
|------|-------------|
| **GT05 Ship Database** | Full ship roster with filters, sortable columns, expandable specs, and dossier modal with official video |
| **HC05 Technology Config** | Load your Star Citizen XML profile, visualize HOTAS/KBM bindings, right-click to reassign inputs, and export back to XML |
| **VerseMail** | Submit contact transmissions or bug reports directly from the app (email + GitHub issue) |
| **AeroBook** | Social feed surface with in-app communication tools |

### Getting Started (Player)

OmniCore runs in your browser and installs as a PWA. No account required for most features.

1. Navigate to the hosted site (see below when live)
2. For HOTAS config: place your Star Citizen XML profile in the expected folder, then open HC05 → Technology Config
3. Right-click any binding row in HC05 to capture a new keyboard, mouse, or HOTAS input
4. Use the Ship Database to research vessels, filter by role, manufacturer, or size, and view pledge/aUEC pricing

### Hosted Access

- **Dev site**: `omnicore.evolvewp.dev` *(when live)*
- **Domain target**: `omnicore.space` *(future)*

---

## For Contributors & Developers

### Tech Stack

- **Frontend**: React 18, Vite, Mantine 8, React Router, Zustand, TanStack Query
- **Visual systems**: Arwes + custom sci-fi UI components
- **Backend**: Express 5, Helmet, CORS, rate limiting
- **Integrations**: Google Gemini, AWS Bedrock, Nodemailer, GitHub Issues API

### Local Development

#### 1) Install

```bash
npm install
```

#### 2) Run Frontend

```bash
npm run dev
```

- Vite app: `http://localhost:4242`
- API proxy: `/api` → `http://localhost:3001`

#### 3) Run Backend

```bash
npm run server
```

- Express API: `http://localhost:3001`

### Build & Quality Commands

```bash
npm run build          # production frontend build
npm run check:bundle   # bundle budget check
npm run build:guard    # build + bundle budget (fails if over budget)
npm run lint           # eslint
npm run preview        # preview production build locally
```

### Environment Variables

Create a `.env` file in the project root.

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No | Backend port (default `3001`) |
| `MAX_DAILY_REQUESTS` | No | Override server rate limiter |
| `MAX_HOURLY_REQUESTS` | No | Override server rate limiter |
| `COST_ALERT_THRESHOLD` | No | AI spend alert threshold |
| `GEMINI_API_KEY` | AI features only | Google Gemini access |
| `AWS_REGION` | AI features only | AWS Bedrock region |
| `AWS_ACCESS_KEY_ID` | AI features only | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | AI features only | AWS credentials |
| `CONTACT_EMAIL` | VerseMail in prod | Delivery address for contact transmissions |
| `SMTP_HOST` | VerseMail in prod | SMTP server host |
| `SMTP_PORT` | VerseMail in prod | SMTP server port |
| `SMTP_USER` | VerseMail in prod | SMTP auth user |
| `SMTP_PASS` | VerseMail in prod | SMTP auth password |
| `GITHUB_TOKEN` | VerseMail in prod | GitHub Issues API token for bug reports |

### Key Routes

| Route | Page |
|-------|------|
| `/` | Dashboard |
| `/ship-database` | GT05 Ship Database |
| `/hotas-config` | HC05 Technology Config (HOTAS/KBM) |
| `/settings/hotas` | HOTAS input test lab |
| `/aerobook` | Social feed + VerseMail |

### API Surfaces

| Endpoint | Description |
|----------|-------------|
| `GET /api/ships/*` | Ship matrix aggregation, normalization, image caching, video metadata |
| `POST /api/versemail/contact` | Contact transmission (email delivery) |
| `POST /api/versemail/bug` | Bug report (GitHub issue creation) |
| `GET /api/hotas/profiles` | Enumerate XML profile files |
| `GET /api/hotas/profile/:name` | Load a profile XML |
| `POST /api/hotas/profile/:name/bindings` | Persist captured bindings to XML |
| `POST /api/hotas/open-folder` | Open mappings folder in Explorer (Windows) |

### Project Structure

```
OmniCore/
├── /app                      ← React PWA (Vite)
│   ├── /src                  ← React components, pages, stores, utils, styles
│   ├── /public               ← Static assets (manifest.json, service worker)
│   ├── index.html            ← App entry point
│   └── index.jsx             ← React root mount
├── /server                   ← Express.js backend API
│   ├── /routes               ← API endpoint handlers
│   ├── /middleware           ← Express middleware
│   └── index.js              ← Server entry point
├── /documentation            ← All project documentation
│   ├── /guides               ← User guides and getting started
│   ├── /developers           ← Technical reference and architecture
│   ├── /architecture         ← System design decisions
│   ├── /api                  ← API endpoint documentation
│   └── README.md             ← Documentation hub (START HERE for docs)
├── /scripts                  ← Build tooling and utilities
├── package.json              ← Project dependencies and npm scripts
├── vite.config.js            ← Vite configuration
├── eslint.config.js          ← Linting rules
└── README.md                 ← This file
```

**→ For documentation, see [documentation/README.md](documentation/README.md)**

### Implementation Notes

- Ship data (video mappings, role normalization, pricing) is curated to fill gaps in the upstream RSI API
- HOTAS XML writing uses a device-aware upsert — assigning a keyboard key won't clobber an existing HOTAS rebind for the same action
- Bundle is split into manual Vite chunks: `mantine`, `arwes`, `query-vendor`, `vendor`
- Security: Helmet headers, CORS allowlist, per-route rate limiting, input token validation on all HOTAS write endpoints

---

## Disclaimer

OmniCore is a fan-made project. Star Citizen® is a registered trademark of Cloud Imperium Rights LLC.
