# CAMPAIGN EXPERIENCE REVIEW — Live Parity QA

**Pass:** `KELLY-PUBLIC-LIVE-PARITY-QA-1.0` (Final Pass 6 / Forensic Pathway Pass F)  
**Lane:** RedDirt public marketing  
**Date:** 2026-07-30  
**Branch:** `feature/kelly-schedule-settlement-dashboard`  
**Authority:** [`CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md`](./CAMPAIGN_EXPERIENCE_REVIEW_FORENSIC_PATHWAY_2.0.md)

---

## Executive Summary

Local production binary built and crawled. All ★ marketing routes returned 200; primary CTA destinations matched labels; no admin/Owned Media leak strings in scanned public HTML; join/volunteer/invite contracts and a11y landmarks verified. Netlify production publish remains the operator step for live URL parity.

---

## What changed

1. **`scripts/public-live-parity-qa.cjs`** + npm `public:live-parity-qa` — repeatable Pass F crawl  
2. **Build unblockers** (eslint Errors that stopped `next build`): prefer-const ×3; replace `require("node:fs")` in evidence workbench actions  
3. **Evidence:** production `next build` exit 0; `next start` on `127.0.0.1:3456`; crawl **PASS** (`failures=0`)

---

## Crawl results (local production)

| Check | Result |
| --- | --- |
| ★ routes (42) | All **200** (incl. `/updates` redirect follow) |
| Primary CTAs (12) | All destinations **200** |
| Admin-leak scan | **OK** (home, get-involved, endorsements, events, about, understand) |
| Skip link + `#main-content` | **OK** |
| `#join` / `#volunteer` | **OK** on `/get-involved` |
| Contact | **OK** mailto + Get Involved / Invite routes (thin door by design) |
| Invite page + API | **OK** `/events/request` 200; empty POST **400** |
| `/api/forms` | Empty **400**; honeypot join_movement **400** (no PII persist) |
| Soft-gate sample | `/counties` → **307** `/arkansas` |

**Command:** `npm run public:live-parity-qa -- http://127.0.0.1:3456`

---

## Accessibility spot-check

| Item | Evidence |
| --- | --- |
| Skip to main content | Present on home HTML → `#main-content` |
| Main landmark | `main#main-content` in site layout |
| Reduced motion | `ScrollReveal` uses `prefers-reduced-motion` (code-path) |
| Focus-visible | Skip link + CTA classes use focus-visible rings (layout/chrome) |

---

## Hesitations removed

1. Deferred live HTTP crawl from Forensic Pathway 2.0 walk — **local production crawl complete**  
2. Unknown whether ★ doors 200 after Passes A–E — **verified locally**  

## Hesitations remaining

1. **Netlify (or alternate) production publish** of this binary — operator/deploy step; not executed in this pass  
2. Next FEATURE geography still for Across Arkansas (Steve) — carried from Pass E  
3. Build still emits many ESLint *warnings* (unused vars / img); only Errors blocked compile  

---

## Next

Pathway A–F complete for public craftsmanship. Remaining = publish + Steve geography confirmation.
