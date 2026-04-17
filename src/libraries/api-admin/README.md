# API Admin Tools

Administrative interfaces for managing the API SDK: cache inspection, key management, usage monitoring, and diagnostics.

## Overview

The API Admin library provides tools for developers and operators to:

- **Inspect cache** — See what's stored, sizes, expiration times
- **Manage API keys** — Add, rotate, revoke keys
- **Monitor usage** — Track costs, rate limits, response times
- **Diagnose issues** — Error logs, performance metrics, health checks

## Phase 1: Foundation (Current) ✅

**Planned**:
- [ ] Cache viewer component
- [ ] API key manager backend
- [ ] Usage monitor dashboard
- [ ] Error log viewer
- [ ] Health check endpoint

## Phase 2: Advanced (Future) ⏳

- [ ] Cost analytics
- [ ] Rate limit coordination
- [ ] Request replay tool
- [ ] Performance profiling
- [ ] Webhook integration

## Components (Planned)

### Cache Viewer (`cache-viewer.jsx`)

**Purpose**: Visualize cached data

```jsx
<CacheViewer />
```

**Features**:
- List all cached items
- Show size, TTL, creation time
- Search/filter cache
- Clear individual items
- Export cache data
- Cache statistics

**Route**: `/admin/cache`

### API Key Manager (`keys-manager.js`)

**Purpose**: Manage API credentials securely

**Features**:
- Add new keys
- Rotate existing keys
- Set per-key rate limits
- Revoke compromised keys
- Audit trail
- Key expiration dates

**Storage**: Encrypted in database (not in .env long-term)

### Usage Monitor (`usage-monitor.js`)

**Purpose**: Track API consumption

**Metrics**:
- Requests per endpoint
- Cost per endpoint (if available)
- Error rates
- Response time distribution
- Cache hit rate
- Rate limit status

**Export**: CSV, JSON reports

---

## Quick Start

Not yet implemented - planning phase.

---

## Design Decisions

### Security

- Admin tools require authentication
- API keys shown only at creation
- Audit trail for all changes
- Rate limiting on admin endpoints

### Scalability

- Metrics stored in persistent cache
- Aggregated, not raw request logs
- Configurable retention period
- Automatic cleanup

### Extensibility

- Plugin architecture for custom tools
- Webhook support for alerts
- Custom dashboards possible
- Export to external monitoring

---

## Integration Points

### With API SDK

```javascript
import { getUsageMetrics } from './usage-monitor.js'

// Query API SDK usage
const metrics = await getUsageMetrics({
  timeRange: 'last24h',
  aggregateBy: 'endpoint'
})
```

### With Backend

```javascript
app.get('/admin/cache', requireAuth, (req, res) => {
  const items = cache.list()
  res.json(items)
})

app.delete('/admin/cache/:key', requireAuth, async (req, res) => {
  await cache.delete(req.params.key)
  res.json({ success: true })
})
```

### With Frontend

React components in `/admin/` routes.

---

## Features Roadmap

### v0.1 (Current)
- Basic cache viewer
- Simple metrics

### v0.2
- API key management
- Usage analytics

### v0.3
- Cost tracking
- Alerts and notifications

### v0.4
- Advanced diagnostics
- Custom dashboards

---

**Last Updated**: April 17, 2026  
**Version**: 0.1.0 (Planning Phase)
