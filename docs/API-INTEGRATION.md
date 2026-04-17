# OmniCore API Integration Guide

## Overview

OmniCore integrates with multiple external APIs to enhance the user experience with real Star Citizen universe data, character information, and community resources.

All APIs are consumed through the **API SDK Library** (`src/libraries/api-sdk/`), a reusable, well-structured system designed to be shared across OmniCore, FifeCIC, and future projects.

## 📚 API SDK Library (Recommended Reading)

The API SDK provides:

- **Unified API consumption** with consistent error handling
- **Built-in caching** (persistent and temporary) to prevent redundant calls
- **Automatic retry logic** with exponential backoff
- **Extensibility** - easy to add new API endpoints
- **Admin tools** - cache inspection, key management, usage monitoring (Phase 2)

**→ Start here**: [API SDK README](../src/libraries/api-sdk/README.md)

**Architecture**:
- [ARCHITECTURE.md](../src/libraries/api-sdk/ARCHITECTURE.md) - Deep dive into design patterns
- [Cache System](../src/libraries/api-sdk/cache/README.md) - How persistence works
- [Endpoints](../src/libraries/api-sdk/endpoints/README.md) - Adding new APIs
- [Admin Tools](../src/libraries/api-admin/README.md) - Monitoring & management (Phase 2)
- [Dev Tools](../src/libraries/api-dev/README.md) - Testing & debugging (Phase 2)

## APIs & Services

### 1. Star Citizen API (starcitizen-api.com)

**Purpose**: Fetch RSI citizen profile data

**Base URL**: `https://api.starcitizen-api.com`

**Authentication**: API Key (in URL path, obtained from Discord)

**SDK Status**: ✅ Phase 1 - Library Endpoint Complete

**Library Location**: `src/libraries/api-sdk/endpoints/star-citizen.js`

#### Available Endpoints (Library Methods)

| Method | Purpose |
|--------|---------|
| `getUser(handle)` | Get citizen profile by handle |
| `getOrganization(sid)` | Get organization details |
| `getStats()` | Get API statistics |

#### Raw API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/{apikey}/v1/{mode}/user/{handle}` | GET | Get citizen profile by handle | Required |
| `/{apikey}/v1/{mode}/organization/{sid}` | GET | Get organization details | Required |
| `/{apikey}/v1/{mode}/stats` | GET | Get API statistics | Required |

**Parameters**:
- `apikey`: Your Star Citizen API key (from Discord: `/api key`)
- `mode`: `live`, `cache`, `auto`, or `eager` (recommend `live` for current data)
- `handle`: RSI citizen handle (URL-encoded)

#### Example: Get Citizen Profile

**Using the Library** (Recommended):

```javascript
import { StarCitizenClient } from '../src/libraries/api-sdk/endpoints/star-citizen.js'
import { createCacheManager } from '../src/libraries/api-sdk/cache/manager.js'

const cache = createCacheManager('memory') // or 'sqlite' in backend
const client = new StarCitizenClient({
  apiKey: process.env.RSI_API_KEY,
  cache: cache
})

// Caching is automatic
const citizen = await client.getUser('LOLinDark')
console.log(citizen.profile.handle) // "LOLinDark"
console.log(citizen.affiliation[0].name) // "Bayne Enterprise"
```

**Raw API Call** (Not recommended - use library instead):

```bash
curl -X GET "https://api.starcitizen-api.com/{apikey}/v1/live/user/LOLinDark"
```

**Response Fields**:
```json
{
  "profile": {
    "handle": "LOLinDark",
    "display": "LOLinDark",
    "enlisted": "2013-03-19T00:00:00",
    "location": {
      "country": "United Kingdom",
      "region": "Fife"
    },
    "bio": "Creator of a WordPress plugin named TwitchPress.",
    "website": "http://www.twitch.tv/LOLinDark1",
    "image": "https://robertsspaceindustries.com/media/...",
    "page": {
      "url": "https://robertsspaceindustries.com/citizens/LOLinDark"
    }
  },
  "organization": {
    "stars": 0
  },
  "affiliation": [
    {
      "name": "Bayne Enterprise",
      "rank": "Director",
      "sid": "BAYNE",
      "stars": 4
    }
  ]
}
```

#### Backend Integration

**Backend Endpoint** (`server/index.js`):
```javascript
import { StarCitizenClient } from './src/libraries/api-sdk/endpoints/star-citizen.js'
import { createCacheManager } from './src/libraries/api-sdk/cache/manager.js'

// Initialize once on server startup
const cache = createCacheManager('memory')
const starCitizen = new StarCitizenClient({
  apiKey: process.env.RSI_API_KEY,
  cache: cache
})

// Use in your routes
app.get('/api/citizen/:handle', async (req, res) => {
  try {
    const data = await starCitizen.getUser(req.params.handle)
    res.json(data)
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.code,
      message: error.userMessage
    })
  }
})
```

**Frontend Request** (via backend proxy):
```javascript
const response = await fetch('/api/citizen/LOLinDark')
const data = await response.json()
console.log(data.profile.handle)
```

#### Environment Setup

```env
# .env
RSI_API_KEY=your_api_key_here
RSI_API_BASE=https://api.starcitizen-api.com
```

**Get your API key**:
1. Join Star Citizen API Discord
2. Run `/api key` command
3. Add to `.env` (never commit to git)

#### Caching Strategy

The library handles caching automatically:

- **Citizen profiles**: Cache for 1 hour (profiles change rarely)
- **Rate limit**: ~100 requests/15 min per IP
- **Storage**: In-memory (Phase 1) → SQLite (Phase 3)
- **Expiration**: Automatic removal of stale data
- **Invalidation**: Manual via admin tools (Phase 2)

**Cache behavior**:
```javascript
// First call: hits API, stores in cache
const user1 = await client.getUser('LOLinDark') // ~500ms

// Second call: instant cache hit
const user2 = await client.getUser('LOLinDark') // ~5ms

// Force fresh data (bypass cache)
const user3 = await client.getUser('LOLinDark', { noCache: true })
```

#### Error Handling

All errors are normalized:

```javascript
try {
  const user = await client.getUser('InvalidHandle123')
} catch (error) {
  console.log(error.code) // 'CITIZEN_NOT_FOUND'
  console.log(error.statusCode) // 404
  console.log(error.userMessage) // Safe for UI
  console.log(error.retryable) // false
}
```

---

### 2. Google Gemini API

**Purpose**: AI-powered content generation and chat

**Status**: ✅ Currently implemented

**Configuration**: 
- Backend endpoint: `POST /api/gemini`
- Model: `gemini-2.0-flash`
- Key stored in `.env` as `GOOGLE_API_KEY`

**Usage Example**:
```javascript
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What are the best ships for bounty hunting?'
  })
});
```

---

### 3. AWS Bedrock (Claude AI)

**Purpose**: Alternative AI for content generation

**Status**: Currently disabled (free tier uses Gemini only)

**Configuration**:
- Region: `us-east-1`
- Model: Claude 3 Sonnet
- Requires AWS credentials

---

### 4. YouTube Data API (TODO)

**Purpose**: Fetch Star Citizen tutorial videos for Aerobook integration

**Status**: Not yet implemented

**Setup Required**:
1. Create Google Cloud project
2. Enable YouTube Data API v3
3. Generate API key
4. Add to `.env.local`: `VITE_YOUTUBE_API_KEY=...`
5. Implement caching (24-hour TTL)

---

### 5. UEX Commodity API (TODO)

**Purpose**: Real-time trading commodity prices

**Base URL**: `https://api.uexcorp.space`

**Status**: Researched, not implemented

**Rate Limits**: 172,800 requests/day (120/min)

---

## Environment Variables

Create `.env` in project root:

```env
# AI APIs
GOOGLE_API_KEY=your_gemini_key_here
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# RSI/Star Citizen APIs
RSI_API_KEY=3z53rRXaw5a8nKUirs1mvwWE5bzdisle
RSI_API_BASE=https://starcitizen-api.com/api/v1

# Rate Limiting
MAX_DAILY_REQUESTS=20
MAX_HOURLY_REQUESTS=5

# Port Config
PORT=3001
```

**⚠️ SECURITY**: Never commit `.env` to git. Use `.env.example` for documentation.

---

## Testing APIs

### 1. Backend API Test Endpoint

**Endpoint**: `GET /api/citizen/:handle`

**Test with cURL**:
```bash
curl -X GET "http://localhost:3001/api/citizen/LOLinDark"
```

**Test with Postman**:
1. POST to `http://localhost:3001/api/citizen/LOLinDark`
2. Headers: None required (proxy passes API key server-side)
3. Body: None

### 2. Frontend Test Page

**Route**: `/developer/api-test`

**Available Tests**:
- ✅ Star Citizen API (citizen profile lookup)
- ✅ Gemini AI (chat/content generation)
- ✅ Rate limits & analytics
- ✅ Cache validation
- ✅ Error handling

---

## Error Handling

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/invalid API key | Verify `RSI_API_KEY` in `.env` |
| 404 Not Found | Invalid citizen handle | Use valid RSI citizen handle |
| 429 Too Many Requests | Rate limit exceeded | Implement caching, add delay |
| 500 Server Error | External API down | Check starcitizen-api.com status |

### Retry Logic

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      if (response.status === 429) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Caching Strategy

### Implementation

```javascript
const cache = new Map();

function getCached(key, ttl = 3600000) { // 1 hour default
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > ttl) {
    cache.delete(key);
    return null;
  }
  return cached.data;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
```

### Where to Cache

- **Citizen profiles**: 1 hour (unlikely to change frequently)
- **Organization data**: 24 hours (rarely changes)
- **Commodity prices**: 15 minutes (highly volatile)
- **AI responses**: Don't cache (user-specific)

---

## Rate Limiting

### Backend Limits

- **Global**: 100 requests per 15 minutes
- **AI endpoints**: 5 requests/hour, 20 requests/day
- **Citizen lookup**: 10 requests/hour (no daily limit)

### Monitoring

**Endpoint**: `GET /api/rate-limits`

```javascript
{
  "hourly": { "current": 3, "limit": 5, "percent": 60 },
  "daily": { "current": 8, "limit": 20, "percent": 40 }
}
```

---

## Best Practices

✅ **DO**:
- Store API keys server-side only (`.env`)
- Implement request caching
- Add retry logic with exponential backoff
- Log API errors for debugging
- Set reasonable TTLs for cached data
- Monitor rate limit usage
- Test with real handles/data

❌ **DON'T**:
- Expose API keys in frontend code or git
- Make frontend requests directly to external APIs
- Cache sensitive data (passwords, tokens)
- Ignore rate limit headers
- Retry indefinitely without backoff
- Log full API responses in production

---

## Integration Roadmap

| Phase | Target | Tasks |
|-------|--------|-------|
| **Phase 1** (Now) | RSI Citizen Data | ✅ Backend proxy, ✅ Login integration, ⏳ Profile display |
| **Phase 2** | YouTube Aerobook | ⏳ Video feed, ⏳ Caching, ⏳ Error handling |
| **Phase 3** | Trading Data | ⏳ Commodity prices, ⏳ Route optimization, ⏳ Alerts |
| **Phase 4** | Advanced Analytics | ⏳ Organization stats, ⏳ Player metrics, ⏳ Market trends |

---

## 🏗️ API SDK Library Ecosystem

To support the vision of a **shared, versioned core** for OmniCore and future projects (FifeCIC, etc.), all API consumption is built through a reusable library system.

### Why a Library?

✅ **Reusability** — Use same API clients across projects  
✅ **Consistency** — All APIs follow same patterns  
✅ **Maintainability** — Fix bugs once, update everywhere  
✅ **Extensibility** — Easy to add new endpoints  
✅ **Distribution** — Can be published as npm package  
✅ **Ecosystem** — Builds shared infrastructure

### Library Structure

```
src/libraries/
├── api-sdk/                    # Core API consumption
│   ├── README.md              # Start here
│   ├── ARCHITECTURE.md        # Design patterns & decisions
│   ├── client.js              # Base HTTP client
│   ├── errors.js              # Error normalization
│   ├── retry.js               # Retry logic
│   ├── cache/                 # Pluggable storage
│   │   ├── manager.js         # Choose adapter
│   │   ├── store.js           # Interface
│   │   ├── memory.js          # Phase 1 ✅
│   │   ├── sqlite.js          # Phase 3 ⏳
│   │   └── indexeddb.js       # Phase 3 ⏳
│   └── endpoints/             # API implementations
│       ├── base-endpoint.js   # Template
│       ├── star-citizen.js    # Phase 1 ✅
│       └── gemini.js          # Phase 1 ✅
│
├── api-admin/                 # Admin & monitoring
│   ├── cache-viewer.jsx       # Inspect cache (Phase 2)
│   ├── keys-manager.js        # Manage API keys (Phase 2)
│   └── usage-monitor.js       # Track costs/usage (Phase 2)
│
└── api-dev/                   # Developer tools
    ├── mock-server.js         # Mock APIs for testing (Phase 2)
    ├── test-scenarios.js      # Test cases (Phase 2)
    └── examples/              # Usage examples
```

### Phase Breakdown

#### Phase 1: Foundation ✅ (Current)

**Goal**: Create base library with Star Citizen API

**What's included**:
- ✅ Base client with retry logic
- ✅ Memory cache adapter (fast, session-only)
- ✅ Star Citizen API endpoint implementation
- ✅ Gemini AI endpoint
- ✅ Error normalization
- ✅ Comprehensive documentation

**How it works**:
```javascript
import { StarCitizenClient } from './src/libraries/api-sdk/endpoints/star-citizen.js'
import { createCacheManager } from './src/libraries/api-sdk/cache/manager.js'

const cache = createCacheManager('memory')
const client = new StarCitizenClient({ apiKey: '...', cache })
const citizen = await client.getUser('LOLinDark')
```

#### Phase 2: Admin & Dev Tools ⏳ (Next)

**Goal**: Add operational tools + mock testing

**Deliverables**:
- Admin cache viewer UI
- API key management dashboard
- Usage monitoring & cost tracking
- Mock API server for testing
- Developer examples and patterns

**Routes added**:
- `/admin/cache` - Inspect cache data
- `/admin/keys` - Manage API credentials
- `/admin/usage` - View usage metrics

#### Phase 3: Persistent Storage ⏳ (Phase 3)

**Goal**: Move from memory to real persistence

**Deliverables**:
- SQLite adapter (Node.js backend)
- IndexedDB adapter (browser apps)
- Cache versioning & expiration
- Automatic cleanup & optimization

**Benefits**:
- Survives server restarts
- Better performance (avoid re-fetching)
- Shared cache across processes
- Inspectable via admin tools

#### Phase 4: Distribution ⏳ (Phase 4)

**Goal**: Extract as standalone npm package

**Deliverables**:
- Published: `@omnicore/api-sdk` on npm
- TypeScript definitions
- Full API documentation
- Example projects
- Integration guides for new projects

**Usage in future projects**:
```javascript
import { createStarCitizenClient } from '@omnicore/api-sdk/star-citizen'

const client = createStarCitizenClient({ apiKey: '...' })
```

### Adding a New API Endpoint

The process is straightforward:

**1. Create endpoint file** (`src/libraries/api-sdk/endpoints/your-api.js`):
```javascript
import { BaseEndpoint } from './base-endpoint.js'

export class YourAPIClient extends BaseEndpoint {
  constructor(config) {
    super({
      name: 'YourAPI',
      baseUrl: 'https://api.yourservice.com',
      cacheConfig: { ttl: 3600 },
      ...config
    })
  }

  async getResource(id) {
    return this.fetch(`/resource/${id}`)
  }
}
```

**2. Register in backend** (`server/index.js`):
```javascript
const yourAPI = new YourAPIClient({ apiKey: process.env.YOUR_API_KEY, cache })
```

**3. Add route**:
```javascript
app.get('/api/resource/:id', async (req, res) => {
  const data = await yourAPI.getResource(req.params.id)
  res.json(data)
})
```

**4. Update docs** (`src/libraries/api-sdk/endpoints/README.md`):
```markdown
### Your API

**Status**: Phase X
**Cache TTL**: 3600s
**Methods**: getResource(id)
```

For complete details, see: [Adding Endpoints Guide](../src/libraries/api-sdk/endpoints/README.md)

### Migration Path

```
Current state (monolithic)
    ↓
    Extract API logic into library
    ↓
    Use library in OmniCore
    ↓
    Add admin tools (Phase 2)
    ↓
    Add persistent storage (Phase 3)
    ↓
    Publish as npm package (Phase 4)
    ↓
    Use in FifeCIC and other projects
```

### For Future Projects (FifeCIC, etc.)

Once published as npm package, integrating becomes trivial:

```bash
npm install @omnicore/api-sdk
```

```javascript
import { createStarCitizenClient, createGeminiClient } from '@omnicore/api-sdk'

const sc = createStarCitizenClient({ apiKey: '...' })
const gemini = createGeminiClient({ apiKey: '...' })

// Use exactly same way as in OmniCore
const citizen = await sc.getUser('LOLinDark')
```

### Documentation Map

Start here based on your role:

| Role | Start With |
|------|-----------|
| **Using an API** | [Endpoints README](../src/libraries/api-sdk/endpoints/README.md) |
| **Adding new API** | [ARCHITECTURE.md](../src/libraries/api-sdk/ARCHITECTURE.md) + Endpoints guide |
| **Understanding cache** | [Cache System](../src/libraries/api-sdk/cache/README.md) |
| **Admin/monitoring** | [Admin Tools](../src/libraries/api-admin/README.md) |
| **Testing** | [Dev Tools](../src/libraries/api-dev/README.md) |
| **Full deep dive** | [API SDK README](../src/libraries/api-sdk/README.md) |

---

## Support & Debugging

**Test Page**: http://localhost:4242/developer/api-test

**Logs**: Check browser console + server output

**Issues**: Create issue with:
- API endpoint tested
- Request/response headers
- Error message
- Handle/data used for testing
