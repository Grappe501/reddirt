# Route verification ledger

**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`  
**Base URL:** `http://127.0.0.1:3457` (`next start` against quiet production build)  
**Final verify:** after county slug alias + schema degrade stabilization

## Primary public routes

| Route | Status | Notes |
| --- | ---: | --- |
| `/` | 200 | Government That Works; Meet Kelly; endorsements; photo band |
| `/about` | 200 | OK |
| `/about/journey` | 200 | OK |
| `/priorities` | 200 | OK |
| `/get-involved` | 200 | Primary join path (no `/join` orphan CTA on homepage) |
| `/campaign-photos` | 200 | OK |
| `/endorsements` | 200 | Four confirmed + policy block |
| `/kelly-speaks` | 200 | OK |
| `/contact` | 200 | Thin access page |
| `/updates` | 200 | OK |
| `/donate` | 200 | OK |
| `/privacy` | 200 | OK |
| `/accessibility` | 200 | OK |
| `/voter-registration` | 200 | Degrades if DB schema lags |
| `/from-the-road` | 200 | OK |
| `/events` | 200 | OK |
| `/campaign-calendar` | 200 | OK |

**Routes OK:** 17/17  
**Launch crawl companion:** 16/16 + 40 homepage outbound links, **0 broken**

## Homepage content smoke

| Check | Result |
| --- | --- |
| Government That Works | ✅ |
| Meet Kelly | ✅ |
| Endorsements (named) | ✅ |
| Campaign photos band | ✅ |
| Accidental draft badge near Meet Kelly | ✅ absent |
| Join CTA → `/get-involved` (not `/join`) | ✅ `/join` not linked from homepage |

## County CTAs (homepage photo geography)

| Probe | Status | Notes |
| --- | ---: | --- |
| `/counties/polk` | 200 | Short-slug **alias** (stabilization) |
| `/counties/polk-county` | 200 | Canonical registry slug |
| `/counties/faulkner` | 200 | Alias |
| `/counties/faulkner-county` | 200 | Canonical |
| `/counties/johnson-county` | 200 | Canonical |
| `/counties/pulaski-county` | 200 | Canonical |
| `/counties/sharp-county` | 200 | Canonical |

Homepage HTML after fix: uses `*-county` hrefs; short orphans (`href="/counties/polk"`) = **0**.

### Finding trail (how we got here)

1. First probe: `/counties/polk` → **500** (Prisma `counties.createdAt` missing locally).  
2. After schema degrade to registry stub: `/counties/polk` → **404** (registry slug is `polk-county`).  
3. After alias + `homepagePhotoCountyHref` → registry: short and canonical → **200**.

## Office / volunteer sample

| Route | Status |
| --- | ---: |
| `/office/elections` | 200 |
| `/office/business` | 200 |
| `/volunteer` | 200 |
| `/join` | 404 — **not** a homepage CTA (documented, not orphan) |
