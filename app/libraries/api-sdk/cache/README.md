# Cache System

The cache system is the heart of the API SDK. It provides a pluggable abstraction for persistent and temporary storage of API responses.

## Overview

**Purpose**: Prevent redundant API calls, handle failures gracefully, and survive application restarts.

**Adapters Available**:
- `memory.js` - Fast, non-persistent (Phase 1) ✅
- `sqlite.js` - Persistent on disk (Phase 3) ⏳
- `indexeddb.js` - Browser persistent storage (Phase 3) ⏳
- Custom adapters possible

## Architecture

```
CacheManager (manager.js)
    ↓ chooses adapter based on environment
    │
    ├─→ MemoryCacheStore (memory.js)
    │   └─ In-memory map, session lifetime
    │
    ├─→ SQLiteCacheStore (sqlite.js) [Future]
    │   └─ Persistent database on disk
    │
    ├─→ IndexedDBCacheStore (indexeddb.js) [Future]
    │   └─ Browser IndexedDB storage
    │
    └─→ CustomCacheStore (user-defined)
        └─ Your custom backend
```

## API (CacheStore Interface)

All adapters implement this interface:

### `get(key) → Promise<data | null>`

Retrieve value from cache.

```javascript
const data = await cache.get('star-citizen:user:lolindark')
// Returns: { profile: {...} } or null if expired/missing
```

### `set(key, value, ttl) → Promise<void>`

Store value in cache with TTL (seconds).

```javascript
await cache.set('star-citizen:user:lolindark', citizenData, 3600)
// Expires in 1 hour (3600 seconds)
```

### `has(key) → Promise<boolean>`

Check if key exists and is not expired.

```javascript
if (await cache.has('star-citizen:user:lolindark')) {
  // Key exists
}
```

### `delete(key) → Promise<void>`

Remove specific key(s) from cache.

```javascript
await cache.delete('star-citizen:user:lolindark')

// Wildcards supported in future
await cache.delete('star-citizen:user:*')
```

### `clear() → Promise<void>`

Remove all cached data.

```javascript
await cache.clear()
```

### `list() → Promise<Array>`

List all cached items (for inspection/admin tools).

```javascript
const items = await cache.list()
// Returns: [
//   {
//     key: 'star-citizen:user:lolindark',
//     size: 2048,  // bytes
//     createdAt: 1713360000,
//     expiresAt: 1713363600,
//     compressed: false
//   },
//   ...
// ]
```

## Usage

### Basic Setup

```javascript
import { createCacheManager } from './cache/manager.js'

// Phase 1: Memory cache
const cache = createCacheManager('memory')

// Phase 3: Persistent
const cache = createCacheManager('sqlite', { path: './data/cache.db' })
```

### In API Client

```javascript
import { StarCitizenClient } from './endpoints/star-citizen.js'
import { createCacheManager } from './cache/manager.js'

const cache = createCacheManager('memory')
const client = new StarCitizenClient({
  apiKey: process.env.RSI_API_KEY,
  cache: cache
})

// Cache is automatic
const user = await client.getUser('LOLinDark')
// 1st call: HTTP request → cache store
// 2nd call: cache hit (instant)
```

### Cache Control Options

Fine-tune caching per request:

```javascript
// Use cache (default)
const user = await client.getUser('LOLinDark')

// Force bypass cache, get fresh data
const user = await client.getUser('LOLinDark', { noCache: true })

// Expire cache for this user after use
const user = await client.getUser('LOLinDark', { invalidate: true })
```

---

## Cache Key Strategy

Keys are built hierarchically to avoid collisions and enable bulk operations:

```
{adapter}:{endpoint}:{method}:{hash(params)}:{version}

Examples:
- memory:star-citizen:user:lolindark:1
- memory:star-citizen:org:bayne:1
- memory:gemini:chat:a7f3d2c:1
- sqlite:uex:commodities:filters123:1
```

### Key Components

- **adapter**: Which storage backend (for migration)
- **endpoint**: Service name (star-citizen, gemini, uex)
- **method**: Function/operation (user, org, commodities)
- **params**: Unique params hash (or direct value if simple)
- **version**: Cache schema version (for invalidation)

### Building Keys Programmatically

```javascript
buildCacheKey(endpoint, method, params, version = 1) {
  const paramHash = JSON.stringify(params)
    .split('')
    .reduce((a, b) => a + b.charCodeAt(0), 0)
    .toString(16)
  
  return `${endpoint}:${method}:${paramHash}:${version}`
}
```

---

## Cache Lifetime Management

### TTL (Time-To-Live)

Each cached item has an expiration time:

```javascript
const ttl = 3600 // seconds
const expiresAt = Date.now() + (ttl * 1000)

// After expiresAt, item is considered stale and not returned
```

### Recommended TTLs by Data Type

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Citizen profiles | 3600s (1h) | Changes rarely |
| Organizations | 86400s (24h) | Very stable |
| Ship specs | 86400s (24h) | Updated with patches |
| Commodities | 900s (15min) | Changes frequently |
| Chat responses | 0s | Don't cache (session-only) |
| Stats/counts | 600s (10min) | Updated regularly |

### Manual Expiration

```javascript
// Invalidate specific item
await cache.delete('star-citizen:user:lolindark')

// Invalidate category (when API format changes)
await cache.delete('star-citizen:user:*')

// Clear everything
await cache.clear()

// Selective cleanup (future)
await cache.cleanup({ olderThan: Date.now() - 86400000 })
```

---

## Phase Implementation Details

### Phase 1: Memory Adapter ✅

**File**: `memory.js`

```javascript
export class MemoryCacheStore {
  constructor() {
    this.data = new Map()
    this.size = 0
    this.maxSize = 50 * 1024 * 1024 // 50MB
  }

  async get(key) {
    const item = this.data.get(key)
    
    // Miss
    if (!item) return null
    
    // Expired
    if (Date.now() > item.expiresAt) {
      this.data.delete(key)
      this.size -= item.size
      return null
    }
    
    // Hit
    return item.value
  }

  async set(key, value, ttl) {
    const size = JSON.stringify(value).length
    
    // Evict if needed
    if (this.size + size > this.maxSize) {
      this.evictLRU()
    }
    
    this.data.set(key, {
      value,
      expiresAt: Date.now() + (ttl * 1000),
      createdAt: Date.now(),
      size,
      lastAccessed: Date.now()
    })
    
    this.size += size
  }

  evictLRU() {
    // Remove least recently used item
    let oldest = null
    let oldestTime = Date.now()
    
    for (const [key, item] of this.data) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldest = key
      }
    }
    
    if (oldest) {
      const item = this.data.get(oldest)
      this.size -= item.size
      this.data.delete(oldest)
    }
  }
}
```

**Characteristics**:
- ✅ Fast (in-memory operations)
- ✅ Simple (no dependencies)
- ✗ Non-persistent (lost on restart)
- ✗ Single process only

---

### Phase 3: SQLite Adapter ⏳

**File**: `sqlite.js` (to be implemented)

```javascript
import Database from 'better-sqlite3'

export class SQLiteCacheStore {
  constructor(dbPath = './cache.db') {
    this.db = new Database(dbPath)
    this.initTable()
  }

  initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value BLOB NOT NULL,
        expiresAt INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        compressed BOOLEAN DEFAULT 0,
        size INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_expires ON cache(expiresAt);
    `)
  }

  async get(key) {
    const row = this.db.prepare(`
      SELECT value, compressed FROM cache 
      WHERE key = ? AND expiresAt > ?
    `).get(key, Date.now())
    
    if (!row) return null
    
    const value = row.compressed 
      ? decompress(Buffer.from(row.value))
      : JSON.parse(row.value)
    
    return value
  }

  async set(key, value, ttl) {
    const data = JSON.stringify(value)
    this.db.prepare(`
      INSERT OR REPLACE INTO cache 
      (key, value, expiresAt, createdAt, size)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      key,
      data,
      Date.now() + (ttl * 1000),
      Date.now(),
      Buffer.byteLength(data)
    )
  }

  async cleanup() {
    // Remove expired entries
    this.db.prepare(
      'DELETE FROM cache WHERE expiresAt < ?'
    ).run(Date.now())
    
    // Optimize database
    this.db.exec('VACUUM')
  }
}
```

**Characteristics**:
- ✅ Persistent (survives restarts)
- ✅ Scalable (file-based)
- ✅ Queryable (can inspect data)
- ✗ Slower than memory (I/O overhead)
- ⚠️ Node.js only

---

### Phase 3: IndexedDB Adapter ⏳

**File**: `indexeddb.js` (to be implemented)

For browser-based apps that need persistence.

```javascript
export class IndexedDBCacheStore {
  constructor(dbName = 'omnicore-cache') {
    this.dbName = dbName
    this.db = null
    this.ready = this.init()
  }

  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1)
      
      req.onupgradeneeded = (e) => {
        const db = e.target.result
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' })
        }
      }
      
      req.onsuccess = () => {
        this.db = req.result
        resolve()
      }
      
      req.onerror = () => reject(req.error)
    })
  }

  async get(key) {
    await this.ready
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['cache'], 'readonly')
      const store = tx.objectStore('cache')
      const req = store.get(key)
      
      req.onsuccess = () => {
        const item = req.result
        if (!item || Date.now() > item.expiresAt) {
          resolve(null)
        } else {
          resolve(item.value)
        }
      }
      
      req.onerror = () => reject(req.error)
    })
  }
}
```

**Characteristics**:
- ✅ Browser-native persistence
- ✅ Asynchronous (non-blocking)
- ✅ Can store large objects
- ✗ Quota limits (~50MB typical)
- ✗ Cross-domain restrictions

---

## Custom Adapter

To implement your own cache adapter:

```javascript
export class MyCustomCacheStore {
  // Required: implement all these methods
  
  async get(key) {
    // Fetch from your backend
    // Return value or null
  }

  async set(key, value, ttl) {
    // Store in your backend with expiration
  }

  async has(key) {
    // Check existence
    return await this.get(key) !== null
  }

  async delete(key) {
    // Remove key
  }

  async clear() {
    // Remove everything
  }

  async list() {
    // Return array of {key, size, createdAt, expiresAt}
    return [
      { key: '...', size: 0, createdAt: 0, expiresAt: 0 }
    ]
  }
}
```

Then register in manager:

```javascript
// cache/manager.js
import { MyCustomCacheStore } from './custom.js'

export function createCacheManager(type = 'memory', config = {}) {
  switch (type) {
    case 'my-custom':
      return new MyCustomCacheStore(config)
    // ... other cases
  }
}
```

---

## Admin Tools Integration

Cache data should be inspectable via admin dashboard:

```javascript
// Future: api-admin/cache-viewer.jsx
import { useCacheData } from '../hooks/useCacheData'

export function CacheViewer() {
  const { items, totalSize, hitRate } = useCacheData()
  
  return (
    <div>
      <h2>Cache Statistics</h2>
      <p>Items: {items.length}</p>
      <p>Total Size: {formatBytes(totalSize)}</p>
      <p>Hit Rate: {hitRate.toFixed(2)}%</p>
      
      <h3>Cached Items</h3>
      {items.map(item => (
        <div key={item.key}>
          <strong>{item.key}</strong>
          <p>Size: {formatBytes(item.size)}</p>
          <p>Expires: {new Date(item.expiresAt).toLocaleString()}</p>
          <button onClick={() => deleteItem(item.key)}>Clear</button>
        </div>
      ))}
    </div>
  )
}
```

---

## Performance Tips

1. **Cache Hit Rate**
   - Aim for > 80% hit rate
   - If lower, increase TTL or add more queries to cache

2. **Memory Management**
   - Monitor size with `cache.list()`
   - Adjust TTL if size grows too large

3. **Warming**
   - Pre-populate critical data on startup
   - Prevents cold start delays

4. **Compression** (Phase 3)
   - Enable for large responses (> 100KB)
   - Trade CPU for storage

5. **Batching**
   - Fetch multiple items at once
   - More efficient than individual requests

---

## Troubleshooting

### Cache Not Working?

1. Check adapter is initialized
2. Verify `set()` is being called
3. Check TTL hasn't expired
4. List cache contents: `await cache.list()`

### Memory Usage Too High?

1. Lower TTL for large items
2. Add size checks in `set()`
3. Implement cleanup job
4. Switch to SQLite adapter

### Cache Inconsistency?

1. Add versioning to cache keys
2. Clear cache on API format change
3. Implement cache invalidation events
4. Monitor hit/miss rates

---

## Next Steps

- [ ] Implement Phase 1 memory adapter
- [ ] Add list() method for inspection
- [ ] Create admin cache viewer
- [ ] Build SQLite adapter (Phase 3)
- [ ] Add compression support
- [ ] Document troubleshooting guide

---

**Last Updated**: April 17, 2026  
**Version**: 0.1.0 (Memory Adapter Phase)
