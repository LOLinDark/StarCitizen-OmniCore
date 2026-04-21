# Documentation Structure - Consolidated

**Last Updated**: April 21, 2026

This document explains how OmniCore documentation is organized and where to find specific information.

---

## 📋 Public Docs (docs/ folder) - Reference Only

All files in `/docs` are **reference and guides** — no roadmap, planning, or strategy.

### Current Public Docs

| File | Purpose |
|------|---------|
| `DEVELOPER-REFERENCE.md` | **Unified developer reference** - combines page registry (tags), architecture, tech stack, and running instructions |
| `API-INTEGRATION.md` | API surfaces, endpoints, SDK setup, environment config |
| `AEROBOOK-GUIDE.md` | Aerobook feature implementation details, component structure, data models |
| `HOTAS-CONFIG-GUIDE.md` | HOTAS/keybinding system, UI usage, data organization, adding new bindings |
| `CONTENT-MARKERS-GUIDE.md` | Development process - placeholder/WIP/needed content markers for tracking |
| `MEDIA-LIBRARY-GUIDE.md` | Media organization, hero containers, dashboard images |
| `SECURITY.md` | Security standards, OWASP compliance, input validation |

---

## 🗂️ Private Docs (OmniCore-Documentation folder)

Internal planning, strategy, and session notes. **Not public**. Organized by function:

### Planning & Roadmaps
- `OmniCore-ROADMAP.md` — Main project roadmap
- `AEROBOOK-FEATURE-PLANNING.md` — Aerobook phases, YouTube API setup, version roadmap
- `HOTAS-FEATURE-PLANNING.md` — HOTAS phases, device integration timeline, Gamepad API notes
- `Active-Sprint.md` — Current sprint tracking
- `LIVE-BUILD-STATUS.md` — Build status and deployment tracking

### Strategy & Design
- `00-Star-Citizen-Dashboard-Overview.md` — Project vision
- `01-Pre-Development-Roadmap.md` — Early stage planning
- `02-OMNI-CORE-Marketing-Brand.md` — Brand/positioning docs
- `MOBILE-ARCHITECTURE.md` — Mobile-specific design
- `VERSE-OPS-HUB-DEFINITION.md` — Verse Ops Hub concept

### Sessions & Summaries
- `THEME-LAB-SESSION-SUMMARY.md` — Past session notes
- `PHASE-2-INTERACTIVITY-COMPLETE.md` — Milestone summary
- `GEMINI-DISCUSSION-NOTES.md` — AI/Gemini research

---

## 🔄 Consolidation Summary

### What Changed

**Before**: Two separate developer docs
- `DEVELOPER-MAP.md` — Page IDs and tag system (in docs/)
- `DEVELOPER-REFERENCE.md` — Tech stack and architecture (in docs/)

**After**: One unified reference
- `DEVELOPER-REFERENCE.md` — Combines tag system + architecture + tech stack + API reference (in docs/)

**Feature guides**:
- `AEROBOOK-GUIDE.md` — Removed roadmap sections → kept in `AEROBOOK-FEATURE-PLANNING.md` (private)
- `HOTAS-CONFIG-GUIDE.md` — Removed Phase 1/2/3 timeline → kept in `HOTAS-FEATURE-PLANNING.md` (private)

---

## ✅ How to Use This Structure

### As a contributor
1. Need to understand the codebase? → Read `/docs/DEVELOPER-REFERENCE.md`
2. Need to know what a page does? → See the **Dev Tag System** section
3. Need to integrate an API? → Read `/docs/API-INTEGRATION.md`
4. Adding a new feature? → Check related guide in `/docs/` for implementation patterns

### As the maintainer/planner
1. Planning new features? → Add to `/OmniCore-Documentation/ROADMAP.md` or `*-FEATURE-PLANNING.md`
2. Tracking sprint progress? → Update `/OmniCore-Documentation/Active-Sprint.md`
3. Testing features? → Reference the private planning docs for Phase details

### As a user/external developer (if shared)
- You see only `/docs/` — clean reference material
- No internal planning/strategy leaks out
- Easy onboarding without noise

---

## 🎯 Principle

**Public docs** = How to use and understand the code  
**Private docs** = Why, when, and what's planned

This keeps the public documentation clean and reference-focused.
