# OMNI-CORE Security Standards

## Applicable Standards

| Standard | Scope | Status |
|----------|-------|--------|
| OWASP Top 10 (2021) | Web application security | Implemented |
| WCAG 2.1 AAA | Accessibility | Planned |
| Core Web Vitals | Performance | Planned |
| Google PWA Checklist | Progressive Web App | Partial |

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
