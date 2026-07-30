# CAMPAIGN EXPERIENCE REVIEW

**Pass:** `KELLY-PUBLIC-HARDENING-1.0`  
**Authority:** [`PUBLIC_SITE_EDITORIAL_DOCTRINE.md`](./PUBLIC_SITE_EDITORIAL_DOCTRINE.md) · [`PUBLIC_SITE_MEDIA_SLOT_MAP.md`](./PUBLIC_SITE_MEDIA_SLOT_MAP.md) · [`PUBLIC_SITE_MASTER_MAP.md`](./PUBLIC_SITE_MASTER_MAP.md)  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Date:** 2026-07-30

---

## Executive Summary

This pass expanded public media slots beyond the homepage and put proof frames on every ★-nav marketing surface. Inner pages no longer open as empty paper + title. Operators can assign Owned Media per typed slot at `/admin/owned-media/public-placements`. Homepage trust-funnel spine stayed frozen; a single media bridge softens the cliff from primary video into Meet Kelly.

Doctrine held: prove more, say less. No memoir expansion. Unknown geography stays Unknown. Empty endorsements stay honestly empty (labeled slot).

---

## What shipped

| Layer | Change |
| --- | --- |
| Registry | Multi-page `PUBLIC_MEDIA_PAGE_KEYS` + inner slots in `slot-registry.ts` |
| UI | `PublicMediaSlotFrame` · `MediaPageHero` (split / bleed) |
| Admin | Public placements lists all page groups |
| Docs | `PUBLIC_SITE_MEDIA_SLOT_MAP.md` story + slot inventory |
| Meet Kelly arc | Media heroes on about / journey / community / why / priorities / speaks / photos / endorsements |
| Office + DD | Understand, why-this-race-matters, office layers, direct democracy + ballot process |
| News + Events | From the Road, press, events, schedule, listening, arkansas; EventPathwayPage |
| Action | get-involved, volunteer, host, local team, donate, contact, voter-reg |
| Legal | Spacing/typography only (no media slots) |
| Home | Media bridge via `home.personality.primary` between primary video and Meet Kelly |

---

## Visitor journey notes

- Inner first viewports now carry a person/place/process still (or a calm labeled empty frame when only placeholders exist).
- Endorsements prefer labeled empty until confirmed placements — trust-positive.
- `/updates` remains out of primary News nav (redirect-only).
- Footer Legal includes Contact.

---

## Hesitations removed

1. Text-only heroes that felt like an unfinished brochure  
2. Homepage “watch → homework” cliff with no visual glue  
3. Home-only placement admin that could not feed inner pages  

## Hesitations remaining

1. Many inner slots still resolve to static/placeholder until operators assign trail media  
2. Netlify live URL may lag this branch until a production publish  
3. Video slots on Kelly Speaks need owned/featured video placements for full dominance  

---

## Verification

- Slot map + components in lane  
- Typecheck recommended via H: wrapper after quiet window (`npm run typecheck`)  
- Smoke: `/about`, `/priorities`, `/from-the-road`, `/get-involved`, `/` Meet Kelly bridge  

---

## Out of path (documented)

- `HomeHeroSection` / admin homepage merge — not driving live `/`  
- `sos-public/` — not the active production public surface  
- Counties intelligence / campaign-calendar merge — deferred per master map  
