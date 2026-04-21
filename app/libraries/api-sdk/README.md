# API SDK Library

The API SDK is a reusable, well-structured library for consuming external APIs with built-in caching, error handling, and retry logic. It's designed to be extracted as an npm package and shared across OmniCore projects and other ventures (FifeCIC, etc.).

## Overview

This library provides:
- **Unified API consumption** — Clean interface for all external API calls
- **Persistent caching** — Prevents redundant calls and handles API failures gracefully
- **Error handling** — Consistent error format and recovery strategies
- **Extensibility** — Easy to add new API endpoints
- **Admin tooling** — Cache inspection, key management, usage monitoring
- **Developer features** — Mock APIs for testing, documentation generation

## Architecture

```
api-sdk/
├── README.md                 # This file
├── ARCHITECTURE.md           # Detailed design patterns and decisions
├── client.js                 # Base API client (core logic)
├── errors.js                 # Error handling and custom exceptions
├── retry.js                  # Retry logic with exponential backoff
│
├── cache/                    # Persistent storage abstraction
│   ├── README.md             # Cache system design
│   ├── manager.js            # Cache orchestration (choose adapter)
│   ├── store.js              # Abstract interface all adapters implement
│   ├── memory.js             # In-memory adapter (fast, session-only)
│   └── [TODO] sqlite.js      # SQLite adapter (persistent, Node.js)
│   └── [TODO] indexeddb.js   # IndexedDB adapter (persistent, browser)
│
├── endpoints/                # API client implementations
│   ├── README.md             # How to add new endpoints
│   ├── base-endpoint.js      # Template/base class for new endpoints
│   ├── star-citizen.js       # Star Citizen API client
│   ├── gemini.js             # Gemini AI API client
│   └── [FUTURE] uex.js       # UEX Economy API
│   └── [FUTURE] roadmap.js   # Star Citizen Roadmap API
│
└── utils/                    # Shared utilities
    ├── validators.js         # Input validation helpers
    ├── formatters.js         # Response formatting
    └── constants.js          # API endpoints, timeouts, defaults
```

## Quick Start

### Basic Usage (Frontend or Backend)

```javascript
import { createStarCitizenClient } from './endpoints/star-citizen.js';
import { createCacheManager } from './cache/manager.js';

// Initialize client with cache
const cache = createCacheManager('memory'); // or 'sqlite' in Node.js
const starCitizen = createStarCitizenClient({
  apiKey: process.env.RSI_API_KEY,
  cache: cache,
  mode: 'live' // or 'cache', 'auto', 'eager'
});

// Fetch citizen data (will cache automatically)
try {
  const citizen = await starCitizen.getUser('LOLinDark');
  console.log(citizen.profile.handle);
} catch (error) {
  console.error(error.message); // Consistent error format
}
```

### Backend Server Integration

See [Backend Integration Guide](#backend-integration) below.

## Phase Implementation Plan

### Phase 1: Foundation (Current Sprint) ✅ In Progress

**Goal**: Create the base library structure with Star Citizen API as first implementation.

**Deliverables**:
- ✅ Folder structure created
- ✅ Base client architecture
- ✅ Star Citizen endpoint refactored into library
- ⏳ Memory cache adapter
- ⏳ Error handling standardization
- ⏳ README documentation (this file)
- ⏳ ARCHITECTURE.md with detailed patterns

**Tasks**:
```
- [ ] Create client.js base client class
- [ ] Refactor server/index.js citizen endpoint into library
- [ ] Create cache/manager.js (choose adapter logic)
- [ ] Create cache/memory.js (fast adapter for Phase 1)
- [ ] Standardize errors.js error classes
- [ ] Create retry.js retry logic
- [ ] Add validators.js and constants.js utilities
- [ ] Write detailed ARCHITECTURE.md
- [ ] Update existing docs to reference new library
- [ ] Test with existing APITestPage.jsx
```

**Outcome**: Existing OmniCore functionality works exactly the same, but now built on top of the reusable library.

---

### Phase 2: Admin Tools (Next Sprint)

**Goal**: Build admin/developer interfaces for cache and key management.

**Deliverables**:
- Admin cache viewer UI (inspect stored data, clear selectively)
- API key management dashboard (add/rotate/revoke keys)
- Usage monitor (costs, rate limits, timing)
- Documentation on extending the library

**Tasks**:
```
- [ ] Create src/libraries/api-admin/keys-manager.js
- [ ] Create src/libraries/api-admin/cache-viewer.jsx
- [ ] Create src/libraries/api-admin/usage-monitor.js
- [ ] Build UI routes in /admin/api-*
- [ ] Wire up to developer context system
- [ ] Write admin tool documentation
```

---

### Phase 3: Persistent Storage (Phase 3)

**Goal**: Move beyond session-only caching to real persistence.

**Deliverables**:
- SQLite adapter for Node.js backend persistence
- IndexedDB adapter for browser-based apps
- Cache versioning and expiration management
- Automatic cleanup and optimization

**Tasks**:
```
- [ ] Create cache/sqlite.js adapter
- [ ] Create cache/indexeddb.js adapter
- [ ] Add cache versioning system
- [ ] Cache expiration/TTL logic
- [ ] Cache compression for large datasets
- [ ] Migration guides for other projects
```

---

### Phase 4: Extraction & Distribution

**Goal**: Extract as standalone npm package for FifeCIC and other projects.

**Deliverables**:
- Standalone npm package: `@omnicore/api-sdk`
- Full TypeScript types (optional but recommended)
- Comprehensive API documentation
- Example projects
- Integration guides for new projects

**Tasks**:
```
- [ ] Create package.json for distribution
- [ ] Add TypeScript definitions
- [ ] Generate API docs from source
- [ ] Create example projects
- [ ] Publish to npm registry
- [ ] Version management strategy
```

---

## Backend Integration

The backend (`server/index.js`) acts as a proxy for the API SDK:

### Current Architecture

```
Frontend (APITestPage.jsx)
    ↓ fetch('/api/citizen/LOLinDark')
Backend Proxy (server/index.js)
    ↓ calls Star Citizen API
External API (api.starcitizen-api.com)
    ↓ returns data
Backend Cache (localStorage or memory)
    ↓ stores for 1 hour
Frontend Display
```

### With Library

```
Frontend (APITestPage.jsx)
    ↓ fetch('/api/citizen/LOLinDark')
Backend Proxy (server/index.js)
    ↓ uses api-sdk/endpoints/star-citizen.js
    ↓ checks cache (persistent, shared, versioned)
Backend Cache (SQLite or memory)
    ↓ stores for 1 hour (configurable per endpoint)
External API (api.starcitizen-api.com)
    ↓ returns data (only on cache miss)
Frontend Display
```

**Benefits**:
- Consistent caching across all API calls
- Survives server restarts
- Can be inspected/cleared via admin tools
- Easy to add new APIs using same pattern

### Server Integration Example

See `server/index.js` (will be updated with library):

```javascript
import { createStarCitizenClient } from './src/libraries/api-sdk/endpoints/star-citizen.js';

const starCitizen = createStarCitizenClient({
  apiKey: process.env.RSI_API_KEY,
  cache: cacheManager,
  mode: 'live'
});

app.get('/api/citizen/:handle', async (req, res) => {
  try {
    const data = await starCitizen.getUser(req.params.handle);
    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});
```

---

## Adding a New API (Walkthrough)

### Step 1: Create Endpoint File

```javascript
// src/libraries/api-sdk/endpoints/uex.js
import { BaseEndpoint } from './base-endpoint.js';

export class UEXEndpoint extends BaseEndpoint {
  constructor(config) {
    super({
      name: 'UEX',
      baseUrl: 'https://uexcorp.space/api/v2',
      timeout: 15000, // ms
      retries: 3,
      cacheConfig: {
        ttl: 900, // 15 minutes - commodities change frequently
        key: 'uex'
      },
      ...config
    });
  }

  async getCommodities(filters = {}) {
    return this.fetch('/commodities', {
      params: filters
    });
  }

  async getTradingRoutes() {
    return this.fetch('/trading-routes');
  }
}
```

### Step 2: Register in Dependencies

Update `server/index.js`:

```javascript
import { UEXEndpoint } from './src/libraries/api-sdk/endpoints/uex.js';

const uex = new UEXEndpoint({
  cache: cacheManager
});
```

### Step 3: Add Backend Route

```javascript
app.get('/api/commodities', async (req, res) => {
  try {
    const data = await uex.getCommodities(req.query);
    res.json(data);
  } catch (error) {
    handleAPIError(error, res);
  }
});
```

### Step 4: Update Documentation

Add to the `endpoints/README.md`:

```
## UEX Commodity API

**Status**: Phase X  
**Last Updated**: 2026-04-17  
**Cache TTL**: 15 minutes  
**Rate Limit**: 100/hour

### Methods

- `getCommodities(filters)` - Get commodity prices
- `getTradingRoutes()` - Get profitable trade routes

### Usage

[code example]
```

---

## Key Design Decisions

### Why This Structure?

1. **Separation of Concerns**
   - Each API client is isolated
   - Cache is abstracted (can swap implementations)
   - Admin tools are separate from core logic

2. **Extensibility**
   - New endpoints = copy template + fill in methods
   - New cache adapters = implement Store interface
   - New admin tools = hook into cache manager

3. **Reusability**
   - Zero dependencies on React, Vue, or framework
   - Works in Node.js, browser, Electron, React Native
   - Can be versioned independently

4. **Phase-based Growth**
   - Phase 1: Works, documented, testable
   - Phase 2: More convenience (admin UI)
   - Phase 3: Performance (persistent storage)
   - Phase 4: Portable (npm package)

### Error Handling Strategy

All API errors are normalized to a consistent format:

```javascript
{
  code: 'CITIZEN_NOT_FOUND', // Machine-readable code
  message: 'User not found', // Human-readable message
  statusCode: 404,
  statusText: 'Not Found',
  source: 'star-citizen-api', // Which API failed
  originalError: {...}, // Stack trace for debugging
  retryable: false, // Should client retry?
  userMessage: 'The RSI handle you entered was not found.' // Safe for UI
}
```

### Cache Strategy

Each API endpoint defines its own caching strategy:

```javascript
{
  ttl: 3600, // Time to live (seconds)
  key: 'citizen', // Cache key prefix
  version: 1, // Cache version (invalidate old data)
  compressed: false, // Compress large responses
}
```

---

## Documentation Files

- **ARCHITECTURE.md** - Deep dive into design patterns and decisions
- **cache/README.md** - Cache system internals and adapter creation
- **endpoints/README.md** - How to create new API endpoints
- **[API-INTEGRATION.md](../../docs/API-INTEGRATION.md)** - Updated user docs in /docs

---

## Testing Strategy

**Phase 1**: Manual testing via APITestPage.jsx

**Phase 2**: Unit tests for each endpoint using mock data

**Phase 3**: Integration tests with real APIs (cached)

**Phase 4**: E2E tests in example projects

---

## Future Considerations

- TypeScript definitions (Phase 4)
- WebSocket support for real-time endpoints
- GraphQL adapter
- Rate limit coordination (multiple endpoints)
- Offline mode with sync queue
- Analytics on API usage
- A/B testing different APIs

---

## Contributing

When adding a new API endpoint:

1. Create file in `endpoints/`
2. Extend `BaseEndpoint` class
3. Implement methods matching the API
4. Add cache TTL configuration
5. Write method documentation
6. Add to endpoints/README.md
7. Test via APITestPage or admin tools

---

## Support & Questions

- Architecture questions → See ARCHITECTURE.md
- Cache system → See cache/README.md
- Adding endpoints → See endpoints/README.md
- Integration problems → Check server/index.js example

---

**Last Updated**: April 17, 2026  
**Library Version**: 0.1.0 (Foundation Phase)  
**Maintained By**: OmniCore Team
