# CAMPAIGN EXPERIENCE REVIEW — Pathway Honesty

**Pass:** `KELLY-PUBLIC-PATHWAY-HONESTY-1.0` (Final Pass 1 / Forensic Pathway Pass A)  
**Lane:** RedDirt public marketing  
**Date:** 2026-07-30  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Authority:** [`CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md)

---

## Executive Summary

Buttons tell the truth again. Soft-redirects that dumped participation CTAs onto Meet Kelly are retargeted to real participation paths. Get Involved no longer claims the volunteer form is “coming soon” above a live form. Calendar detail bookmarks keep their slug. Watch bookmarks go to Kelly Speaks.

---

## What changed

### Redirects (`next.config.ts`)

| Source | Was | Now |
| --- | --- | --- |
| `/local-organizing` (+ `/:path*`) | `/about` | `/start-a-local-team` |
| `/onboarding/power-of-5` | `/about` | `/get-involved/bring-5` |
| `/volunteerPage` | `/about` | `/get-involved#volunteer` |
| `/watch` | `/from-the-road` | `/kelly-speaks` |
| `/campaign-calendar/:slug` | `/events` (slug lost) | `/events/:slug` |

### Public CTAs

- Get Involved, Events, Host, Stories, Resources, event detail, not-found, homepage content, pathways, explainers, toolkit — local-organizing links → `/start-a-local-team`
- Power of 5 public href canon → `/get-involved/bring-5`
- Removed “Walkthrough (demo)” bait; “How Bring 5 works” points at the live Bring 5 page
- Campaign calendar public hrefs → `/events`
- Deleted “Volunteer form coming soon” band; points to `#join` / `#volunteer`

---

## Hesitations removed

1. Participation CTAs soft-redirecting to About  
2. “Form coming soon” contradiction on Get Involved  
3. Calendar detail bookmarks collapsing to the events index  

## Hesitations remaining

1. Join vs Volunteer still need Pass B ladder clarity on Final Action  
2. `/volunteer` Field Team vs `/get-involved#volunteer` dual product (Pass B)  
3. Live URL parity still open (Pass F)

---

## Smoke checklist (code-path)

- [x] `/local-organizing` → start-a-local-team  
- [x] `/onboarding/power-of-5` → bring-5  
- [x] `/volunteerPage` → get-involved#volunteer  
- [x] `/watch` → kelly-speaks  
- [x] `/campaign-calendar/{slug}` → `/events/{slug}`  
- [x] No “coming soon” on get-involved volunteer band  
- [ ] Live HTTP crawl after Next restart (servers were down during pass)

---

## Next

**Pass B — Participation Ladder** (`KELLY-PUBLIC-PARTICIPATION-LADDER-1.0`)
