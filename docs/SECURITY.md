# OMNI-CORE Security Standards

## Applicable Standards

| Standard | Scope | Status |
|----------|-------|--------|
| OWASP Top 10 (2021) | Web application security | Implemented |
| WCAG 2.1 AAA | Accessibility | Planned |
| Core Web Vitals | Performance | Planned |
| Google PWA Checklist | Progressive Web App | Partial |

## OWASP Top 10 Compliance

### A01: Broken Access Control ✅ Fixed
- CORS restricted to `localhost:5173` and `127.0.0.1:5173` only
- Server shutdown endpoint removed entirely (was unauthenticated)
- No admin routes exposed without intent

### A02: Cryptographic Failures
- API keys stored in `.env` (gitignored, never committed)
- `.env` uses placeholder values in repo
- HTTPS should be enforced in production (not applicable for localhost dev)

### A03: Injection ✅ Fixed
- All user input to AI endpoints validated and length-limited (10,000 char max)
- Error log endpoint sanitizes all fields before writing to disk
- Control characters stripped from log input
- No user input ever reaches file paths, shell commands, or eval()

### A04: Insecure Design ✅ Fixed
- Request body size limited to 1MB via `express.json({ limit: '1mb' })`
- Rate limiting: 5 requests/hour, 20 requests/day (AI endpoints)
- Rate limiting: 100 requests/15min (all API routes via express-rate-limit)

### A05: Security Misconfiguration ✅ Fixed
- Helmet middleware sets all recommended security headers
- Vite dev server bound to `localhost` only (not `0.0.0.0`)
- Error responses don't leak internal details to clients

### A06: Vulnerable Components
- All dependencies pinned to exact versions (no `^` prefix for Arwes)
- Run `npm audit` regularly to check for known vulnerabilities
- Arwes `eval()` usage in formatFrameDimension.js is a known upstream issue

### A07: Authentication & Identification
- No user authentication currently (local-only tool)
- When auth is added: use secure session management, not localStorage tokens
- API keys are server-side only, never exposed to frontend

### A08: Software & Data Integrity
- `.gitignore` excludes `.env`, `node_modules`, `dist`, `*.log`
- Package-lock.json committed for reproducible builds

### A09: Logging & Monitoring ✅ Fixed
- Server logs all AI requests with timestamps
- Error log endpoint sanitizes input before writing
- Rate limit history tracked (last 100 requests)
- Cost tracking with configurable alert threshold

### A10: Server-Side Request Forgery (SSRF)
- Server only makes outbound requests to known APIs (Google Gemini, AWS Bedrock)
- No user-supplied URLs are fetched server-side

## Security Rules for Developers

### Never Do
- ❌ Use `dangerouslySetInnerHTML` with AI responses or user content
- ❌ Pass user input to file paths, shell commands, or `eval()`
- ❌ Commit `.env` files or API keys to git
- ❌ Log full AI responses in production (token cost + privacy)
- ❌ Trust AI responses as safe HTML — always treat as untrusted text
- ❌ Use `cors()` with no origin restriction
- ❌ Create unauthenticated endpoints that modify server state

### Always Do
- ✅ Validate and length-limit all user input on the server
- ✅ Sanitize content before writing to files
- ✅ Use Helmet for security headers
- ✅ Pin dependency versions for reproducible builds
- ✅ Run `npm audit` before releases
- ✅ Add `// SECURITY:` comments explaining security-sensitive code
- ✅ Use React JSX text rendering (auto-escapes) for displaying untrusted content
- ✅ Revoke `URL.createObjectURL()` references when no longer needed

## Audit History

| Date | Scope | Findings | Fixed |
|------|-------|----------|-------|
| v0.1.0 | Full OWASP review | 12 (1 critical, 3 high, 6 medium, 2 low) | 12/12 |
