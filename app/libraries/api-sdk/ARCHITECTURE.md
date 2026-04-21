# API SDK Architecture

This document provides an in-depth look at the design patterns, decision rationale, and implementation details of the API SDK library.

## Table of Contents

1. [Core Principles](#core-principles)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Error Handling](#error-handling)
5. [Caching Strategy](#caching-strategy)
6. [Retry & Resilience](#retry--resilience)
7. [Extension Points](#extension-points)
8. [Performance Considerations](#performance-considerations)
9. [Testing Strategy](#testing-strategy)

---

## Core Principles

### 1. Separation of Concerns

Each component has a single responsibility:

- **Client** → HTTP communication, retry logic
- **Cache Manager** → Choose which cache adapter to use
- **Cache Store** → Persist/retrieve data (implementation-specific)
- **Endpoints** → API-specific logic and methods
- **Errors** → Normalize and handle failures
- **Utils** → Shared helpers (validation, formatting)

**Why**: Easy to test, debug, and extend. Each component can be developed/deployed independently.

### 2. Adapter Pattern for Caching

The cache system uses the **Adapter Pattern** to support multiple storage backends without coupling to any one:

```javascript
// All adapters implement this interface
interface CacheStore {
  get(key) → Promise<data | null>
  set(key, data, ttl) → Promise<void>
  has(key) → Promise<boolean>
  delete(key) → Promise<void>
  clear() → Promise<void>
  list() → Promise<Array<{key, size, createdAt, expiresAt}>>
}
```

**Adapters**:
- `memory.js` - Fast, non-persistent (Phase 1)
- `sqlite.js` - Persistent on disk (Phase 3, backend)
- `indexeddb.js` - Persistent in browser (Phase 3, frontend)
- Future: Redis, MongoDB, etc.

**Why**: 
- Browser apps can use IndexedDB
- Node.js apps can use SQLite
- Can switch without changing API client code
- Testable with mock store

### 3. BaseEndpoint Class

All API endpoints inherit from a base class that provides:

```javascript
class BaseEndpoint {
  constructor(config) {
    this.name = config.name
    this.baseUrl = config.baseUrl
    this.timeout = config.timeout
    this.retries = config.retries
    this.cache = config.cache
    this.cacheConfig = config.cacheConfig
  }

  async fetch(path, options = {}) {
    // Handles:
    // 1. Cache lookup
    // 2. URL construction
    // 3. Request + retry logic
    // 4. Response parsing
    // 5. Cache store
    // 6. Error normalization
  }
}
```

**Why**: 
- DRY - retry, cache, error handling shared
- Consistency - all endpoints behave the same
- Testability - mock the base methods

### 4. Error Normalization

All errors, regardless of source, are converted to a standard format:

```javascript
class APIError extends Error {
  constructor(options) {
    super(options.message)
    this.code = options.code // 'CITIZEN_NOT_FOUND', 'RATE_LIMIT', etc.
    this.statusCode = options.statusCode
    this.source = options.source // 'star-citizen-api'
    this.retryable = options.retryable
    this.userMessage = options.userMessage // Safe for frontend display
    this.originalError = options.originalError // Stack trace
  }
}
```

**Why**: 
- Frontend can consistently handle errors
- Can distinguish retryable from fatal errors
- User-safe messages can be shown
- Original error preserved for debugging

---

## Component Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────┐
│         Application Layer                   │
│  (React components, backend routes)         │
└────────────┬────────────────────────────────┘
             │
┌────────────v────────────────────────────────┐
│      API Client (star-citizen.js, etc)      │
│  • Defines domain-specific methods           │
│  • Maps to endpoints                         │
│  • Application-facing interface              │
└────────────┬────────────────────────────────┘
             │
┌────────────v────────────────────────────────┐
│      BaseEndpoint (base-endpoint.js)         │
│  • fetch() with caching                      │
│  • Error normalization                       │
│  • Retry logic coordination                  │
└────────────┬────────────────────────────────┘
             │
    ┌────────┴──────────┬──────────┐
    │                   │          │
┌───v────┐  ┌──────────v──┐  ┌────v─────┐
│ Retry  │  │   Cache     │  │ Errors   │
│ Logic  │  │  Manager    │  │ Handler  │
└───┬────┘  └──────┬──────┘  └────┬─────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
    ┌──────────────v──────────────┐
    │   HTTP Client               │
    │  (fetch/axios/node-fetch)   │
    └──────────┬───────────────────┘
               │
    ┌──────────v──────────────┐
    │   External API          │
    │ (api.starcitizen-api... │
    └─────────────────────────┘
```

### Component Details

#### 1. API Client (star-citizen.js)

**Responsibility**: Provide domain-specific methods

```javascript
class StarCitizenClient extends BaseEndpoint {
  async getUser(handle) {
    return this.fetch(`/user/${handle}`)
  }

  async getOrganization(sid) {
    return this.fetch(`/organization/${sid}`)
  }
}
```

**Not responsible for**:
- HTTP details
- Caching logic
- Error formatting
- Retry logic

**Caller perspective**:
```javascript
const client = new StarCitizenClient({...})
const user = await client.getUser('LOLinDark')
```

#### 2. BaseEndpoint (base-endpoint.js)

**Responsibility**: Core logic that works for all endpoints

```javascript
async fetch(path, options = {}) {
  const cacheKey = this.buildCacheKey(path, options)

  // 1. Check cache
  if (options.useCache !== false) {
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached
  }

  // 2. Make request (with retry)
  let response = null
  let lastError = null
  
  for (let attempt = 0; attempt <= this.retries; attempt++) {
    try {
      response = await this.makeRequest(path, options)
      break
    } catch (error) {
      lastError = error
      if (!this.isRetryable(error) || attempt === this.retries) break
      await this.backoff(attempt)
    }
  }

  if (!response) throw lastError

  // 3. Cache result
  await this.cache.set(cacheKey, response, this.cacheConfig.ttl)

  return response
}
```

#### 3. Cache Manager (cache/manager.js)

**Responsibility**: Choose which adapter to use

```javascript
export function createCacheManager(type = 'memory', config = {}) {
  switch (type) {
    case 'memory':
      return new MemoryCacheStore(config)
    case 'sqlite':
      return new SQLiteCacheStore(config)
    case 'indexeddb':
      return new IndexedDBCacheStore(config)
    default:
      throw new Error(`Unknown cache type: ${type}`)
  }
}
```

**Why separate?**: Allows runtime selection based on environment (Node.js vs browser)

#### 4. Cache Adapters (cache/store.js, memory.js, sqlite.js, etc)

All implement the same interface but different backends:

**MemoryCacheStore**:
```javascript
class MemoryCacheStore {
  constructor() {
    this.data = new Map()
  }

  async get(key) {
    const item = this.data.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.data.delete(key)
      return null
    }
    return item.value
  }

  async set(key, value, ttl) {
    this.data.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000),
      createdAt: Date.now(),
      size: JSON.stringify(value).length
    })
  }
}
```

**SQLiteCacheStore** (future):
```javascript
class SQLiteCacheStore {
  constructor(dbPath) {
    this.db = new Database(dbPath)
    this.initTable()
  }

  async get(key) {
    const row = this.db.prepare(
      'SELECT value FROM cache WHERE key = ? AND expiresAt > ?'
    ).get(key, Date.now())
    
    return row ? JSON.parse(row.value) : null
  }

  async set(key, value, ttl) {
    this.db.prepare(
      'INSERT OR REPLACE INTO cache VALUES (?, ?, ?, ?)'
    ).run(key, JSON.stringify(value), Date.now() + (ttl * 1000), Date.now())
  }
}
```

**Why adapters?**:
- Same interface, different persistence
- Can benchmark which is faster for use case
- Can handle failures (SQLite down → fallback to memory)
- Testable with mock adapter

---

## Data Flow

### Typical Request Lifecycle

```
1. Frontend/Backend calls: client.getUser('LOLinDark')
                                    ↓
2. BaseEndpoint.fetch() called with path '/user/LOLinDark'
                                    ↓
3. Build cache key: 'star-citizen:user:LOLinDark'
                                    ↓
4. Check cache: cacheManager.get('star-citizen:user:LOLinDark')
   ✓ Found → Return cached data (DONE)
   ✗ Not found → Continue to step 5
                                    ↓
5. Make HTTP request to: https://api.starcitizen-api.com/{key}/v1/live/user/LOLinDark
   Include: User-Agent, Accept headers
   Timeout: 10000ms
                                    ↓
6. Response handling:
   ✓ 200-299 → Parse JSON, go to step 7
   ✗ 4xx/5xx → Create APIError, check if retryable
              If retryable & attempts < 3: Backoff & retry from step 5
              If not retryable or max attempts: Throw error
                                    ↓
7. Cache the result:
   cacheManager.set('star-citizen:user:LOLinDark', data, 3600)
                                    ↓
8. Return to caller
```

### With Cache Hit

```
Request → Cache lookup → Found → Return (instant) ✓
```

### With Cache Miss + Success

```
Request → Cache miss → HTTP call → Parse → Cache store → Return
```

### With Cache Miss + Failure + Retry

```
Request → Cache miss → HTTP 500 → Backoff 1s → Retry
                       ↓ (still 500)
                       Backoff 2s → Retry
                       ↓ (success 200)
                       Cache → Return
```

### With Cache Miss + Non-Retryable Failure

```
Request → Cache miss → HTTP 404 → APIError{retryable: false}
                       ↓
                       Don't retry, throw immediately
```

---

## Error Handling

### Error Classification

Errors are classified into three categories:

#### 1. Retryable Errors

These errors might resolve with retry:

```javascript
isRetryable(error) {
  // Network errors
  if (error.code === 'ECONNREFUSED') return true
  if (error.code === 'ETIMEDOUT') return true
  
  // HTTP 5xx (server errors)
  if (error.statusCode >= 500) return true
  
  // HTTP 429 (rate limit)
  if (error.statusCode === 429) return true
  
  return false
}
```

**Retry strategy**: Exponential backoff

```
Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds
Attempt 3: Wait 4 seconds
```

**Max retries**: Configurable per endpoint (default: 3)

#### 2. Non-Retryable Errors

These errors won't be fixed by retry:

```javascript
// HTTP 404 (not found) - won't come back with retry
// HTTP 400 (bad request) - request is invalid
// HTTP 403 (forbidden) - permissions won't change
// HTTP 401 (unauthorized) - need new key
```

**Response**: Throw immediately with error code

#### 3. Custom Errors

```javascript
class RateLimitError extends APIError {
  constructor(retryAfter) {
    super({
      code: 'RATE_LIMITED',
      message: 'Rate limit exceeded',
      statusCode: 429,
      retryable: true,
      retryAfter: retryAfter, // seconds
      userMessage: 'Server is busy. Please try again in a moment.'
    })
  }
}
```

### Error Recovery

**Frontend perspective**:

```javascript
try {
  const user = await client.getUser('LOLinDark')
} catch (error) {
  if (error.code === 'CITIZEN_NOT_FOUND') {
    // Show: "That citizen wasn't found"
    showNotification(error.userMessage)
  } else if (error.code === 'RATE_LIMIT') {
    // Show: "Please try again in 60 seconds"
    startCountdown(error.retryAfter)
  } else if (error.retryable) {
    // Automatic retry (shouldn't reach here - SDK already retried)
    retry()
  } else {
    // Show: "Something went wrong, please refresh"
    showError(error.userMessage)
  }
}
```

---

## Caching Strategy

### Cache Key Generation

Keys are structured to avoid collisions:

```
{endpoint}:{method}:{params}:{version}

Examples:
- star-citizen:user:lolindark:1
- gemini:chat:hash(message):1
- uex:commodities:filters={...}:1
```

### Cache Invalidation

Three strategies depending on endpoint:

#### 1. Time-Based (TTL) - Most common

```javascript
{
  ttl: 3600, // 1 hour
}
```

Uses for: Profile data, static info, ships, roadmap

#### 2. Event-Based - Manual invalidation

```javascript
// In admin tools or backend
await cache.delete('star-citizen:user:*')

// Or specific user
await cache.delete('star-citizen:user:lolindark')
```

Uses for: When user logs out, clears settings, etc.

#### 3. Version-Based - Data model changed

```javascript
// Version 1: Old format
// Version 2: New format with extra fields
// Both can exist in cache simultaneously

const cacheKey = buildKey('user', 'lolindark', version=2)
```

Uses for: API response format changes

### Cache Sizing

**Memory Cache**: Limited to ~50MB per browser/process
- Each Item: ~1-10KB (typical API response)
- Reasonable limit: 5000-10000 items

**SQLite Cache**: Limited by disk space
- More suitable for long-term storage
- Can compress data if needed

**Strategy**: 
- Keep frequently accessed data in memory
- Older/less frequent data in SQLite
- Use LRU (Least Recently Used) eviction

### Warming the Cache

For critical data, pre-populate cache on startup:

```javascript
// server.js
await cache.warmup([
  {
    endpoint: 'star-citizen',
    method: 'getUser',
    args: ['LOLinDark'],
    ttl: 3600
  }
])
```

---

## Retry & Resilience

### Exponential Backoff Algorithm

```javascript
function calculateBackoff(attempt) {
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds
  
  const delay = Math.min(
    baseDelay * Math.pow(2, attempt),
    maxDelay
  )
  
  // Add jitter to prevent thundering herd
  return delay + Math.random() * (delay * 0.1)
}

// Attempt 0: ~1000ms
// Attempt 1: ~2000ms
// Attempt 2: ~4000ms
// Attempt 3: ~8000ms (if configured)
```

**Why exponential backoff?**
- Gives server time to recover
- Prevents overloading with retries
- Jitter prevents multiple clients hitting same time

### Circuit Breaker (Future)

For Phase 2, implement circuit breaker to prevent cascading failures:

```javascript
class CircuitBreaker {
  constructor(failureThreshold = 5, timeout = 60000) {
    this.failureCount = 0
    this.failureThreshold = failureThreshold
    this.timeout = timeout
    this.state = 'CLOSED' // CLOSED → OPEN → HALF_OPEN → CLOSED
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.openedAt > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  onFailure() {
    this.failureCount++
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN'
      this.openedAt = Date.now()
    }
  }
}
```

---

## Extension Points

### Adding a New Endpoint

**Minimal implementation**:

```javascript
// src/libraries/api-sdk/endpoints/uex.js
import { BaseEndpoint } from './base-endpoint.js'

export class UEXClient extends BaseEndpoint {
  constructor(config = {}) {
    super({
      name: 'UEX',
      baseUrl: 'https://uexcorp.space/api/v2',
      timeout: 15000,
      retries: 2,
      cacheConfig: { ttl: 900 }, // 15 minutes
      ...config
    })
  }

  // Your methods here
  async getCommodities(filters) {
    return this.fetch('/commodities', { params: filters })
  }
}
```

**Register in server**:

```javascript
import { UEXClient } from './src/libraries/api-sdk/endpoints/uex.js'

const uex = new UEXClient({ cache: cacheManager })
```

**Use in route**:

```javascript
app.get('/api/commodities', async (req, res) => {
  try {
    const data = await uex.getCommodities(req.query)
    res.json(data)
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.code,
      message: error.userMessage
    })
  }
})
```

### Custom Cache Adapter

**Implement the interface**:

```javascript
export class CustomCacheStore {
  async get(key) { /* fetch */ }
  async set(key, value, ttl) { /* store */ }
  async has(key) { /* check */ }
  async delete(key) { /* remove */ }
  async clear() { /* clear all */ }
  async list() { /* return all items */ }
}
```

**Use in manager**:

```javascript
export function createCacheManager(type = 'memory', config = {}) {
  switch (type) {
    case 'custom':
      return new CustomCacheStore(config)
    // ... other cases
  }
}
```

---

## Performance Considerations

### Benchmarks (Target)

- **Cache hit response time**: < 5ms
- **API call (no cache)**: 200-500ms typical
- **Retry with backoff**: 1-10s total (depends on failures)
- **Cache store operation**: < 50ms

### Memory Usage

- **Memory adapter**: ~100 bytes per metadata + response size
- **Typical response**: 2-50KB
- **10000 cached items**: ~50-500MB

### Optimization Techniques

#### 1. Response Compression

```javascript
{
  cacheConfig: {
    ttl: 3600,
    compress: true // gzip responses
  }
}
```

Saves ~70% on large responses (500KB → 150KB)

#### 2. Selective Caching

```javascript
async fetch(path, options = {}) {
  if (options.noCache) {
    // Skip cache entirely
    return this.makeRequest(path, options)
  }
  // ... normal caching logic
}
```

#### 3. Batch Operations

```javascript
async batchGetUsers(handles) {
  return Promise.all(handles.map(h => this.getUser(h)))
}
```

---

## Testing Strategy

### Unit Tests (Phase 2)

```javascript
describe('StarCitizenClient', () => {
  it('returns cached data on subsequent calls', async () => {
    const client = new StarCitizenClient({
      cache: mockCache
    })
    
    const result1 = await client.getUser('LOLinDark')
    expect(mockCache.get).toHaveBeenCalledWith('star-citizen:user:lolindark')
    
    const result2 = await client.getUser('LOLinDark')
    expect(mockCache.get).toHaveBeenCalledTimes(2)
    expect(result2).toEqual(result1)
  })

  it('retries on network failure', async () => {
    // Mock HTTP layer
    let attemptCount = 0
    mockHTTP.mockImplementation(() => {
      attemptCount++
      if (attemptCount < 3) throw new Error('Network timeout')
      return { profile: {...} }
    })

    const result = await client.getUser('LOLinDark')
    expect(attemptCount).toBe(3)
    expect(result).toBeDefined()
  })
})
```

### Integration Tests

Test against real API (with caching enabled):

```javascript
describe('Star Citizen API Integration', () => {
  it('fetches real citizen data and caches it', async () => {
    const start = Date.now()
    const result1 = await client.getUser('LOLinDark')
    const duration1 = Date.now() - start

    const result2 = await client.getUser('LOLinDark')
    const duration2 = Date.now() - start

    expect(duration1).toBeGreaterThan(100) // HTTP call
    expect(duration2).toBeLessThan(50) // Cache hit
  })
})
```

---

## Migration Path: From Monolith to Library

### Current State (Before)

```
server/index.js
├── All API logic inline
├── No caching abstraction
├── Error handling mixed with business logic
└── Hard to test
```

### Intermediate State (Phase 1)

```
server/index.js
├── Uses star-citizen.js client
├── Client handles caching
├── Normalized errors
└── Business logic simplified

src/libraries/api-sdk/
├── endpoints/star-citizen.js (extracted from server)
├── cache/manager.js
└── errors.js
```

### Final State (Phase 4)

```
node_modules/@omnicore/api-sdk/
├── Full package with docs, types, tests
├── Used by multiple projects
└── Independently versioned

Projects using it:
├── OmniCore (v2.0.0)
├── FifeCIC (v2.0.0)
└── Future projects
```

---

## Future Enhancements

1. **Real-time Updates**
   - WebSocket endpoints
   - Server-Sent Events (SSE)
   - Polling with smart intervals

2. **Request Deduplication**
   - Multiple identical requests → single HTTP call
   - Critical for high-concurrency scenarios

3. **Response Streaming**
   - Large file downloads
   - Partial data requests

4. **Metrics & Observability**
   - Request timing distributions
   - Cache hit rate
   - Error rates by type
   - Cost tracking

5. **GraphQL Support**
   - GraphQL query normalization
   - Field-level caching

6. **Offline Queue**
   - Queue mutations when offline
   - Sync when connection restored

---

**Last Updated**: April 17, 2026  
**Version**: 0.1.0 (Foundation Phase)
