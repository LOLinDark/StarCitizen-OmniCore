# API Endpoints

This folder contains client implementations for external APIs. Each endpoint is a standalone module that can be used independently or as part of the SDK.

## Overview

Each endpoint:
- Extends `BaseEndpoint` for common functionality
- Defines domain-specific methods
- Handles API-specific quirks and transformations
- Includes caching and retry configuration
- Provides a clean interface to consumers

## Available Endpoints

### Star Citizen API

**File**: `star-citizen.js`  
**Status**: ✅ Phase 1 - Complete  
**Base URL**: `https://api.starcitizen-api.com`  
**Cache TTL**: 3600s (1 hour)

#### Methods

```javascript
// Get citizen profile by handle
getUser(handle) → Promise<{profile, organization, affiliation[]}>

// Get organization details
getOrganization(sid) → Promise<{...}>

// Get API statistics
getStats() → Promise<{current_live, fans, fleet, funds}>
```

#### Usage

```javascript
import { StarCitizenClient } from './star-citizen.js'

const client = new StarCitizenClient({
  apiKey: process.env.RSI_API_KEY,
  cache: cacheManager
})

const citizen = await client.getUser('LOLinDark')
console.log(citizen.profile.handle) // "LOLinDark"
console.log(citizen.affiliation[0].name) // "Bayne Enterprise"
```

#### Response Format

```json
{
  "profile": {
    "handle": "LOLinDark",
    "display": "LOLinDark",
    "enlisted": "2013-03-19T00:00:00",
    "bio": "Creator of a WordPress plugin named TwitchPress.",
    "location": {
      "country": "United Kingdom",
      "region": "Fife"
    },
    "image": "https://robertsspaceindustries.com/media/...",
    "page": {
      "url": "https://robertsspaceindustries.com/citizens/LOLinDark"
    }
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

---

### Gemini AI API

**File**: `gemini.js`  
**Status**: ✅ Phase 1 - Complete  
**Base URL**: `https://generativelanguage.googleapis.com`  
**Cache TTL**: 0s (no cache - unique conversations)

#### Methods

```javascript
// Send a message and get AI response
chat(message, context = '') → Promise<{response, tokens}>

// Generate content from prompt
generate(prompt, options = {}) → Promise<{content}>
```

#### Usage

```javascript
import { GeminiClient } from './gemini.js'

const client = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY
})

const response = await client.chat(
  'What are the best ships for bounty hunting?',
  'Star Citizen universe context'
)
console.log(response.response)
```

---

### Future Endpoints

#### UEX Commodity API

**File**: `uex.js` (to be implemented)  
**Status**: ⏳ Phase 2  
**Base URL**: `https://uexcorp.space/api/v2`  
**Cache TTL**: 900s (15 minutes)

```javascript
// Get commodity prices
getCommodities(filters) → Promise<Commodity[]>

// Get profitable trading routes
getTradingRoutes(filters) → Promise<Route[]>

// Get commodity history
getCommodityHistory(symbol) → Promise<PriceHistory>
```

#### Star Citizen Roadmap API

**File**: `roadmap.js` (to be implemented)  
**Status**: ⏳ Phase 2  
**Base URL**: `https://api.starcitizen-api.com`  
**Cache TTL**: 86400s (24 hours)

```javascript
// Get roadmap items
getRoadmap(board = 'starcitizen') → Promise<Item[]>

// Get specific feature
getFeature(id) → Promise<Feature>

// Get roadmap statistics
getStats() → Promise<Stats>
```

---

## Creating a New Endpoint

### 1. Create the File

Create `src/libraries/api-sdk/endpoints/{api-name}.js`:

```javascript
import { BaseEndpoint } from './base-endpoint.js'

export class MyAPIClient extends BaseEndpoint {
  constructor(config = {}) {
    super({
      name: 'MyAPI',
      baseUrl: 'https://api.example.com',
      timeout: 10000,
      retries: 3,
      cacheConfig: {
        ttl: 3600, // 1 hour
        key: 'myapi'
      },
      ...config
    })
  }

  async getResource(id) {
    return this.fetch(`/resource/${id}`)
  }

  async listResources(filters = {}) {
    return this.fetch('/resources', { params: filters })
  }

  async createResource(data) {
    return this.fetch('/resources', {
      method: 'POST',
      body: data
    })
  }
}

export default MyAPIClient
```

### 2. Add Documentation

Update this file with your endpoint:

```markdown
### My API

**File**: `myapi.js`
**Status**: ✅ Phase X - Complete
**Base URL**: `https://api.example.com`
**Cache TTL**: 3600s (1 hour)
**Rate Limit**: 100/hour

#### Methods

- `getResource(id)` - Fetch single resource
- `listResources(filters)` - List all resources
- `createResource(data)` - Create new resource

#### Usage

```javascript
import { MyAPIClient } from './myapi.js'

const client = new MyAPIClient({
  apiKey: process.env.MYAPI_KEY,
  cache: cacheManager
})

const resource = await client.getResource(123)
```

#### Cache Strategy

- Resources cached for 1 hour
- Invalidate on create/update
- See `cache/README.md` for manual invalidation
```

### 3. Register in Backend

Update `server/index.js`:

```javascript
import { MyAPIClient } from './src/libraries/api-sdk/endpoints/myapi.js'

const myapi = new MyAPIClient({
  apiKey: process.env.MYAPI_KEY,
  cache: cacheManager
})
```

### 4. Add Server Routes

```javascript
app.get('/api/resources/:id', async (req, res) => {
  try {
    const resource = await myapi.getResource(req.params.id)
    res.json(resource)
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.code,
      message: error.userMessage
    })
  }
})

app.get('/api/resources', async (req, res) => {
  try {
    const resources = await myapi.listResources(req.query)
    res.json(resources)
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.code,
      message: error.userMessage
    })
  }
})
```

### 5. Test It

```javascript
// From browser/frontend
const response = await fetch('/api/resources/123')
const resource = await response.json()
console.log(resource)
```

---

## BaseEndpoint: Common Functionality

All endpoints inherit these capabilities:

### Caching (Automatic)

```javascript
// First call: hits API
const data = await client.getUser('LOLinDark')

// Second call: returns cached data (fast)
const data = await client.getUser('LOLinDark')

// Force fresh data
const data = await client.getUser('LOLinDark', { noCache: true })
```

### Retry with Backoff

```javascript
// Automatic retry on transient failures
// Retries: 1s, 2s, 4s (with jitter)
const data = await client.getUser('LOLinDark')
```

### Error Normalization

```javascript
try {
  const data = await client.getUser('InvalidHandle')
} catch (error) {
  console.log(error.code) // 'CITIZEN_NOT_FOUND'
  console.log(error.statusCode) // 404
  console.log(error.userMessage) // Safe for UI
  console.log(error.retryable) // false
}
```

### Request Timing

```javascript
const startTime = Date.now()
const data = await client.getUser('LOLinDark')
const duration = Date.now() - startTime
console.log(`Request took ${duration}ms`)
```

---

## Configuration Options

Each endpoint accepts configuration:

```javascript
const client = new StarCitizenClient({
  // Required
  apiKey: 'your_api_key',
  
  // Optional
  cache: cacheManager, // Default: memory cache
  timeout: 10000, // ms, default: 10000
  retries: 3, // attempts, default: 3
  
  // Endpoint-specific
  mode: 'live', // 'live', 'cache', 'auto', 'eager'
  
  // Request customization
  headers: {
    'Custom-Header': 'value'
  },
  
  // Response transformation
  transform: (data) => data.result // Extract specific field
})
```

---

## Error Codes by Endpoint

### Star Citizen API

| Code | Meaning | Retryable |
|------|---------|-----------|
| CITIZEN_NOT_FOUND | Handle doesn't exist | No |
| RATE_LIMITED | Too many requests | Yes |
| SERVICE_UNAVAILABLE | API down | Yes |
| UNAUTHORIZED | Invalid API key | No |

### Gemini API

| Code | Meaning | Retryable |
|------|---------|-----------|
| INVALID_MESSAGE | Message too long | No |
| RATE_LIMIT | Quota exceeded | Yes |
| UNSAFE_CONTENT | Content blocked | No |
| SERVICE_ERROR | API error | Yes |

---

## Performance Recommendations

### Caching Strategy

- **Frequently accessed**: Longer TTL (24h+)
- **Dynamic data**: Shorter TTL (5-15min)
- **Real-time data**: No cache (TTL=0)

### Retry Strategy

- **Critical operations**: More retries (5)
- **Background tasks**: Standard retries (3)
- **Real-time requests**: Fewer retries (1)

### Timeout Strategy

- **Quick endpoints**: 5s timeout
- **Complex endpoints**: 15s timeout
- **File uploads**: 60s timeout

---

## Batch Operations

Fetch multiple items efficiently:

```javascript
// Sequential (slower)
const user1 = await client.getUser('User1')
const user2 = await client.getUser('User2')

// Parallel (faster)
const [user1, user2] = await Promise.all([
  client.getUser('User1'),
  client.getUser('User2')
])
```

---

## Testing Endpoints

### Mock Data

```javascript
// test/star-citizen.test.js
import { StarCitizenClient } from '../star-citizen.js'

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  list: jest.fn()
}

const client = new StarCitizenClient({
  apiKey: 'test-key',
  cache: mockCache
})
```

### Mocking HTTP Responses

```javascript
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({
    profile: { handle: 'LOLinDark' }
  })
}))
```

---

## Debugging

Enable logging:

```javascript
// Check cache behavior
console.log(await cache.list())

// Check request details
client.on('request', (details) => {
  console.log(`${details.method} ${details.url}`)
})

// Check response time
const start = Date.now()
const data = await client.getUser('LOLinDark')
console.log(`Took ${Date.now() - start}ms`)
```

---

## Migration Guide

### From Old Direct API Calls

**Before**:
```javascript
const response = await fetch(
  'https://api.starcitizen-api.com/key/v1/live/user/LOLinDark'
)
const data = await response.json()
```

**After**:
```javascript
const client = new StarCitizenClient({ apiKey: 'key' })
const data = await client.getUser('LOLinDark')
```

### From Mixed Cache Implementation

**Before**:
```javascript
if (localStorage.hasKey('user_LOLinDark')) {
  data = JSON.parse(localStorage.getItem('user_LOLinDark'))
} else {
  const response = await fetch(...)
  data = await response.json()
  localStorage.setItem('user_LOLinDark', JSON.stringify(data))
}
```

**After**:
```javascript
const data = await client.getUser('LOLinDark')
// Caching is automatic and configurable
```

---

## Next Steps

- [ ] Implement Phase 1 endpoints (Star Citizen, Gemini)
- [ ] Add error handling tests
- [ ] Build admin endpoint browser
- [ ] Implement UEX endpoint (Phase 2)
- [ ] Add batch operations
- [ ] Performance profiling

---

**Last Updated**: April 17, 2026  
**Version**: 0.1.0 (Star Citizen + Gemini Phase)
