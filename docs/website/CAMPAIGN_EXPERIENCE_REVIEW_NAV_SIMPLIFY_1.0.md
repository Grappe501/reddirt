# CAMPAIGN EXPERIENCE REVIEW — Nav Simplify

**Pass:** `KELLY-PUBLIC-NAV-SIMPLIFY-1.0` (Final Pass 4 / Forensic Pathway Pass D)  
**Lane:** RedDirt public marketing  
**Date:** 2026-07-30  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Authority:** [`CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md)

---

## Executive Summary

Each primary nav group now lands on one owned home. Campaign Videos, Invite Kelly, and Explainers appear once. News first-click reading is From the Road + Press (Substack in footer). County command and site dashboards are soft-gated (redirect + noindex). Public “Campaign Calendar” labels read as Events.

---

## What changed

1. **Office** `groupLandingHref` → `/understand`; **News** → `/from-the-road`
2. **Dedupe** — Videos under Meet Kelly only; Invite under Events only; Explainers under Office only
3. **News menu** — From the Road + Press Coverage (Blog/Stories/Editorial off first-click weight)
4. **Footer** — “News & events” slim reading + events; Get involved without Invite duplicate
5. **Events rename** — public titles/CTAs say Events (admin OS calendar labels unchanged)
6. **Message map** — deeper detail `/from-the-road` only; CTA Stay connected → Volunteer → Priorities
7. **Soft-gate** — `/counties` → `/arkansas`; `counties` + `(site)/dashboard` layouts `robots: noindex`

---

## Hesitations removed

1. Clicking “The Office” or “News” with nowhere clear to land  
2. Same destination listed under multiple menus  
3. Marketing visitors treated county command as a public product door  

## Hesitations remaining

1. Trust temperature / empty endorsements (Pass E)  
2. Live URL parity (Pass F)  
3. Deep `/counties/:slug` still reachable for field tools (intentional)

---

## Next

**Pass E — Trust Temperature**
