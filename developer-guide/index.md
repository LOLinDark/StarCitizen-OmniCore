---
layout: default
title: "Developer Guide"
url: /developer-guide/
---

<div class="page-header">
  <h1>Developer Guide</h1>
  <p>Architecture, APIs, and internal documentation for contributors</p>
</div>

## Documentation

<ul class="doc-list">
  <li>
    <a href="{{ '/developer-guide/developer-reference' | relative_url }}">Developer Reference</a>
    <div class="doc-desc">Dev tag system, tech stack, project structure, Arwes integration, color palette, backend API</div>
  </li>
  <li>
    <a href="{{ '/developer-guide/hotas-config-guide' | relative_url }}">HOTAS Configuration Guide</a>
    <div class="doc-desc">Keybinding system architecture, data model, device integration, and usage instructions</div>
  </li>
  <li>
    <a href="{{ '/developer-guide/aerobook-guide' | relative_url }}">Aerobook Guide</a>
    <div class="doc-desc">Verse media gallery implementation, video player, rotation system, and content curation</div>
  </li>
  <li>
    <a href="{{ '/developer-guide/api-integration' | relative_url }}">API Integration</a>
    <div class="doc-desc">Star Citizen API, Gemini, AWS Bedrock, media providers, API SDK library ecosystem</div>
  </li>
  <li>
    <a href="{{ '/developer-guide/media-library-guide' | relative_url }}">Media Library Guide</a>
    <div class="doc-desc">Centralized asset management, hero containers, dashboard images, YouTube integration</div>
  </li>
  <li>
    <a href="{{ '/developer-guide/content-markers-guide' | relative_url }}">Content Markers Guide</a>
    <div class="doc-desc">Visual system for tracking placeholder content, WIP items, and missing assets</div>
  </li>
  <li>
    <a href="{{ '/developer-guide/security' | relative_url }}">Security Standards</a>
    <div class="doc-desc">OWASP compliance, security rules, audit history</div>
  </li>
</ul>

## Quick Start

```bash
npm install        # install dependencies
npm run dev        # frontend on :4242
npm run server     # backend on :3001
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + Vite |
| Component Library | Mantine 8 |
| Sci-Fi Visual Layer | Arwes 1.0.0-next |
| Backend | Express 5 |
| AI | Google Gemini + AWS Bedrock |
| PWA | manifest.json + sw.js |
