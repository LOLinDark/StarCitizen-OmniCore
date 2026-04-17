# API Developer Tools

Tools for developers building on top of the API SDK: mock servers, test scenarios, documentation generation, and debugging utilities.

## Overview

The API Dev library provides:

- **Mock API server** — Simulate external APIs for testing
- **Test scenarios** — Common use cases and edge cases
- **Documentation** — Auto-generate from code
- **Debugging** — Request/response inspection, error replay
- **Performance** — Benchmarking, profiling, load testing

## Phase 1: Foundation (Current) ✅

**Planned**:
- [ ] Mock server for Star Citizen API
- [ ] Test data generator
- [ ] Example integration

## Phase 2: Advanced (Future) ⏳

- [ ] Full mock server with admin UI
- [ ] Test scenario framework
- [ ] Integration test helpers
- [ ] Performance benchmarks

## Components (Planned)

### Mock Server (`mock-server.js`)

**Purpose**: Simulate external APIs for testing without hitting real endpoints

```javascript
import { createMockServer } from './mock-server.js'

const mockAPI = createMockServer('star-citizen')

mockAPI.on('GET /user/LOLinDark', (req, res) => {
  res.json({
    profile: { handle: 'LOLinDark' },
    affiliation: []
  })
})

// Start listening
mockAPI.listen(3001)
```

**Features**:
- Mock all endpoints
- Configurable response delays
- Error injection
- Request logging
- Response validation

### Test Scenarios (`test-scenarios.js`)

**Purpose**: Define repeatable test cases

```javascript
const scenarios = {
  happyPath: {
    request: { handle: 'LOLinDark' },
    expectedResponse: { profile: { handle: 'LOLinDark' } }
  },
  
  notFound: {
    request: { handle: 'InvalidUser12345' },
    expectedStatus: 404,
    expectedError: 'CITIZEN_NOT_FOUND'
  },
  
  timeout: {
    request: { handle: 'LOLinDark' },
    simulateDelay: 15000,
    expectedError: 'TIMEOUT'
  },
  
  rateLimit: {
    request: { handle: 'LOLinDark' },
    simulateStatus: 429,
    expectedError: 'RATE_LIMIT'
  }
}
```

**Usage**:
```javascript
for (const [name, scenario] of Object.entries(scenarios)) {
  test(`Scenario: ${name}`, async () => {
    const result = await runScenario(scenario)
    expect(result).toMatch(scenario.expected)
  })
}
```

### Example Integration

Real-world usage examples:

```javascript
// examples/basic-citizen-lookup.js
import { createStarCitizenClient } from '../../api-sdk/endpoints/star-citizen.js'

async function main() {
  const client = new StarCitizenClient({
    apiKey: process.env.RSI_API_KEY
  })
  
  const citizen = await client.getUser('LOLinDark')
  console.log(`Found: ${citizen.profile.display}`)
}

main().catch(console.error)
```

---

## Quick Start (Planned)

```bash
# Run mock server
npm run mock:server

# Run tests with scenarios
npm run test:scenarios

# Run integration example
npm run example:citizen-lookup
```

---

## Testing Patterns

### Unit Testing

Test individual client methods in isolation.

### Integration Testing

Test with mock server simulating API behavior.

### End-to-End Testing

Test full request → cache → response flow.

### Performance Testing

Benchmark latency, throughput, memory usage.

---

## Mock Server API

**Endpoint Registration**:
```javascript
mockAPI.on('METHOD /path/:param', (req, res) => {
  res.json({ data: 'value' })
})
```

**Response Helpers**:
```javascript
res.json(data)           // JSON response
res.status(404)          // HTTP status
res.delay(1000)          // Add latency
res.error(500)           // Error response
res.stream(buffer)       // Large file
```

**Request Access**:
```javascript
req.params             // URL parameters
req.query              // Query string
req.headers            // HTTP headers
req.body               // Request body
```

---

## Debugging Utilities

### Request Inspector

```javascript
client.on('request', (req) => {
  console.log(`→ ${req.method} ${req.url}`)
  console.log(req.headers)
})
```

### Response Inspector

```javascript
client.on('response', (res) => {
  console.log(`← ${res.status} (${res.duration}ms)`)
  console.log(res.headers)
})
```

### Error Inspector

```javascript
client.on('error', (err) => {
  console.error(err.code)
  console.error(err.originalError)
})
```

---

## Performance Profiling

### Latency Distribution

```javascript
const results = await profileEndpoint('getUser', {
  iterations: 100,
  sample: 'LOLinDark'
})

console.log(`p50: ${results.p50}ms`)
console.log(`p95: ${results.p95}ms`)
console.log(`p99: ${results.p99}ms`)
```

### Memory Usage

```javascript
const memStart = process.memoryUsage()

// Run tests
await runTests()

const memEnd = process.memoryUsage()
console.log(`Memory delta: ${(memEnd.heapUsed - memStart.heapUsed) / 1024}KB`)
```

---

## Load Testing

### Generate Load

```javascript
const loadTest = createLoadTest({
  endpoint: 'getUser',
  concurrent: 10,
  duration: 60,
  rampUp: true
})

const results = await loadTest.run()
console.log(results.summary)
```

---

## Documentation Generation

Auto-generate docs from code:

```javascript
const docs = generateDocs({
  source: './endpoints/',
  format: 'markdown',
  output: './docs/generated/'
})
```

Generates:
- API reference
- Parameter documentation
- Response schemas
- Code examples
- Error codes

---

## Features Roadmap

### v0.1 (Current)
- Mock server template
- Test scenario framework
- Basic examples

### v0.2
- Full mock server implementation
- Automated testing framework
- Performance profiling tools

### v0.3
- Load testing tools
- Documentation generator
- CI/CD integration

### v0.4
- Advanced debugging UI
- Record/replay testing
- Regression test suite

---

## File Structure (Planned)

```
api-dev/
├── README.md                 # This file
├── mock-server.js            # Mock API server
├── test-scenarios.js         # Test case definitions
├── profiler.js               # Performance profiling
├── load-test.js              # Load testing
├── debug-utils.js            # Debugging utilities
├── doc-generator.js          # Documentation
└── examples/
    ├── basic-citizen-lookup.js
    ├── error-handling.js
    ├── batch-operations.js
    └── caching-strategies.js
```

---

**Last Updated**: April 17, 2026  
**Version**: 0.1.0 (Planning Phase)
