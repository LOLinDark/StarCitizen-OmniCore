# OmniCore Documentation Hub

Welcome! This directory contains all documentation for the OmniCore project—from API integration guides to architectural decisions and user guides.

---

## Quick Navigation

### 🚀 **Getting Started**
- **New to OmniCore?** Start with [User Guide](guides/user-guide.md)
- **Developer?** Check [Developer Reference](developers/DEVELOPER-REFERENCE.md)
- **Want to contribute?** See [About](guides/about.md)

### 📚 **Documentation by Type**

#### **Guides** (`/guides/`)
User-facing documentation and getting started materials:
- [User Guide](guides/user-guide.md) — How to use OmniCore features
- [About OmniCore](guides/about.md) — Project overview and philosophy
- [Support Resources](guides/support.md) — Troubleshooting and help

#### **Developer Docs** (`/developers/`)
Technical reference for developers and architects:
- [Developer Reference](developers/DEVELOPER-REFERENCE.md) — Core architecture and codebase structure
- [Developer Map](developers/DEVELOPER-MAP.md) — Codebase visual guide
- [Security Guide](developers/SECURITY.md) — Security policies and best practices
- [API Integration Guide](developers/API-INTEGRATION.md) — Backend API reference and integration patterns

#### **Feature Planning** (`/guides/`)
Feature-specific implementation guides:
- [Aerobook Guide](developers/AEROBOOK-GUIDE.md) — Aerobook feature design and usage
- [HOTAS Configuration Guide](developers/HOTAS-CONFIG-GUIDE.md) — HOTAS setup and calibration
- [Media Library Guide](developers/MEDIA-LIBRARY-GUIDE.md) — Managing and organizing media assets
- [Content Markers Guide](developers/CONTENT-MARKERS-GUIDE.md) — Using content markers in documentation

#### **Architecture** (`/architecture/`)
High-level system design and decisions:
*(Coming soon as architecture documentation is formalized)*

#### **API Reference** (`/api/`)
Detailed API endpoint documentation:
*(Coming soon as API docs are generated)*

---

## Project Structure

```
OmniCore/
├── /app                      ← React PWA (Vite)
│   ├── /src                  ← React components, pages, utilities
│   ├── /public               ← Static assets (manifest, service worker)
│   └── index.html            ← App entry point
├── /server                   ← Express.js backend API
├── /documentation            ← All documentation (this folder)
│   ├── /guides               ← User guides and getting started
│   ├── /developers           ← Technical reference and architecture
│   ├── /architecture         ← System design decisions
│   ├── /api                  ← API endpoint documentation
│   └── README.md             ← This file
├── package.json              ← Project dependencies and scripts
├── vite.config.js            ← Vite configuration
└── README.md                 ← Root project overview
```

---

## Common Tasks

### 📖 I want to understand how OmniCore works
→ Read [Developer Reference](developers/DEVELOPER-REFERENCE.md)

### 🔌 I need to integrate with the API
→ Check [API Integration Guide](developers/API-INTEGRATION.md)

### 🛠️ I want to contribute to development
→ Start with [Developer Reference](developers/DEVELOPER-REFERENCE.md) then [Security Guide](developers/SECURITY.md)

### 🎮 I need help using the app
→ See [User Guide](guides/user-guide.md)

### 🤔 Something doesn't work
→ Check [Support Resources](guides/support.md)

### 🎨 I'm working on features
→ Read feature-specific guides (AEROBOOK-GUIDE.md, HOTAS-CONFIG-GUIDE.md, etc.)

---

## For First-Time Contributors

1. **Read** [Developer Reference](developers/DEVELOPER-REFERENCE.md) to understand the codebase
2. **Review** [Security Guide](developers/SECURITY.md) for security policies
3. **Check** [API Integration Guide](developers/API-INTEGRATION.md) if working with backend
4. **Find an issue** to work on in GitHub
5. **Submit a PR** and mention the issue

---

## Documentation Standards

- **Markdown formatting**: Use standard Markdown with code blocks for syntax highlighting
- **Code examples**: Always include working examples
- **Links**: Use relative links within documentation (e.g., `[Guide](./guides/example.md)`)
- **Sections**: Use H2 (##) and H3 (###) for clear hierarchy
- **Clarity**: Write for someone unfamiliar with the feature

---

## Keeping Docs Updated

Documentation is part of the codebase. When you:
- **Add a feature** → Update relevant docs
- **Fix a bug** → Update docs if behavior changes
- **Change the API** → Update API Integration Guide
- **Restructure code** → Update Developer Reference

This keeps docs accurate and saves time for future developers.

---

## Questions or Suggestions?

See [Support Resources](guides/support.md) for contact options.

---

**Last Updated**: April 21, 2026  
**Version**: Alpha V0.1.0
