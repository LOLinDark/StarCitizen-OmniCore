# HOTAS Advanced User Mode Scope

**Created**: May 30, 2026  
**Status**: Draft (design constraints documented, implementation optional)

---

## Why This Exists

OmniCore currently presents short/long input rows in the HOTAS input views. Star Citizen behavior suggests press-duration handling may be feature-driven at runtime, not universally assignable per bind.

This document keeps UX and implementation aligned so standard users are not confused by advanced timing concepts.

---

## Terminology

- **Tap / Short Press**: Brief press and release.
- **Hold / Long Press**: Press held past a feature-specific timing threshold.
- **Bind-time**: What input identity is captured while assigning controls.
- **Run-time**: How Star Citizen executes the bound feature during play.

---

## Current Assumptions (to be validated in-game)

1. Bind-time capture usually records only the input identity (for example, joystick button index).
2. Long/hold semantics are often interpreted by Star Citizen feature logic at run-time.
3. Not every feature supports a distinct hold behavior.
4. Some features that reference long press may still serialize to generic button IDs in XML.

---

## Standard Mode Scope (Default UX)

These behaviors are safe for default users and should remain the baseline:

1. Show short/long rows as guidance where useful.
2. Match rows to features that explicitly indicate long/hold intent.
3. Keep conflict detection across all bindings visible and consistent.
4. Avoid promising universal custom hold assignment on arbitrary features.
5. Prefer plain language in tooltips: feature behavior is game-defined unless explicitly confirmed.

---

## Advanced User Mode Candidate Scope

Only expose these in an opt-in advanced mode:

1. Explicit HOTAS mode controls and mode matrix workflows.
2. Experimental timing diagnostics (for example, measured press duration display).
3. Expert warnings when assigning likely-incompatible long/hold combinations.
4. Optional test-lab workflows for validating feature-specific hold behavior.

---

## Explicitly Out of Scope (for now)

1. Universal "force long press" for any game feature.
2. Input interception/remapping middleware that transforms a single physical press into synthetic alternate game inputs.
3. Automatic macro synthesis to emulate hold-only semantics globally.

These require an additional input-processing layer and carry high UX and reliability risk.

---

## Validation Checklist Before Expanding Scope

1. Verify if Star Citizen ever stores hold/long metadata distinctly in exported XML.
2. Confirm whether non-long-labeled features can be reliably configured as hold-only.
3. Test same-button short-vs-long split assignments for coexistence and conflict behavior.
4. Document edge cases where run-time behavior differs from bind-time display.

---

## Product Guidance

1. Keep standard mode optimized for clarity, speed, and low error rate.
2. Gate complexity behind an Advanced User Mode toggle.
3. Treat hold/long behavior as feature-specific until hard evidence proves universal support.

---

## Related Docs

- `documentation/developers/HOTAS-CONFIG-GUIDE.md`
- `app/components/HOTASInputView.jsx`
- `app/pages/HOTASConfigMainPage.jsx`
- `app/data/starcitizen-keybindings.js`
