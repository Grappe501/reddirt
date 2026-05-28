# API and Feed Key Inventory (NSI-7)

**Purpose:** Inventory expected or known keys/sources for campaign intelligence.  
**Rule:** No secret values in this document. Env var names only where known.

---

## Census API

| Field | Value |
|-------|-------|
| Purpose | Demographic / economic context for county operational intelligence |
| Status | PLANNED (NSI-6 adapter registry) |
| Env var | `CENSUS_API_KEY` (if used) |
| Risk level | LOW — public aggregate data |
| Data sensitivity | Public aggregate |
| Allowed access mode | Official Census API only |
| Future use | County briefing demographic context |
| Must never | Store individual household data; microtarget |

---

## Bureau of Labor Statistics API

| Field | Value |
|-------|-------|
| Purpose | Economic indicators for county operational sections |
| Status | PLANNED |
| Env var | `BLS_API_KEY` (if used) |
| Risk level | LOW |
| Data sensitivity | Public aggregate |
| Allowed access mode | Official BLS API |
| Future use | NSI-6 demographic/economic context |
| Must never | Infer individual employment status for targeting |

---

## Election results feeds

| Field | Value |
|-------|-------|
| Purpose | Baseline votes, turnout history, win-target scenario inputs |
| Status | PARTIAL — `arkansas-county-election-history.normalized.json` (synthetic/augmented) |
| Env var | N/A (file-based) |
| Risk level | MEDIUM — accuracy depends on source |
| Data sensitivity | Public aggregate election results |
| Allowed access mode | SOS / county official results ingestion |
| Future use | Win-target scenario refresh, county rollup validation |
| Must never | Precinct-level voter targeting without governance review |

---

## Voter file aggregate sources

| Field | Value |
|-------|-------|
| Purpose | Aggregate registration/turnout headroom (not individual records) |
| Status | PLANNED |
| Env var | Campaign-specific — not documented here |
| Risk level | HIGH |
| Data sensitivity | PII if misused |
| Allowed access mode | Aggregate exports only; governed adapters |
| Future use | Registration goal validation, turnout headroom |
| Must never | Individual voter scoring, microtargeting, export to field without compliance review |

---

## Volunteer systems

| Field | Value |
|-------|-------|
| Purpose | Capacity model, GOTV commitment tracking |
| Status | PARTIAL — static JSON artifacts |
| Env var | N/A |
| Risk level | LOW–MEDIUM |
| Data sensitivity | Volunteer contact info if integrated |
| Allowed access mode | Aggregate capacity metrics |
| Future use | Field ops adapter (NSI-6+) |
| Must never | Autonomous volunteer assignment without human approval |

---

## Media RSS feeds

| Field | Value |
|-------|-------|
| Purpose | Public political news monitoring |
| Status | PLANNED — registry placeholders only (NSI-7) |
| Env var | N/A |
| Risk level | LOW |
| Data sensitivity | Public |
| Allowed access mode | RSS/API; robots.txt compliant |
| Future use | NSI-8 live intake |
| Must never | Paywall bypass, credential scraping, auto-claim creation |

---

## YouTube Data API

| Field | Value |
|-------|-------|
| Purpose | Public channel monitoring (if needed) |
| Status | FUTURE |
| Env var | `YOUTUBE_API_KEY` |
| Risk level | LOW |
| Data sensitivity | Public metadata |
| Allowed access mode | Official API with quota limits |
| Future use | Media monitor for public candidate channels |
| Must never | Scrape private or unlisted content |

---

## Podcast RSS

| Field | Value |
|-------|-------|
| Purpose | Arkansas political podcast monitoring |
| Status | PLANNED |
| Env var | N/A |
| Risk level | LOW |
| Data sensitivity | Public |
| Allowed access mode | Public podcast RSS feeds |
| Future use | NSI-8 intake |
| Must never | Transcribe paywalled or private episodes without license |

---

## Court / public records sources

| Field | Value |
|-------|-------|
| Purpose | Administrative and legal public updates |
| Status | MANUAL + PLANNED |
| Env var | N/A |
| Risk level | MEDIUM — legal accuracy |
| Data sensitivity | Public records |
| Allowed access mode | Official court/agency public pages |
| Future use | Opposition research retrieval tasks |
| Must never | Assert legal conclusions without human review |

---

## Legislative APIs / pages

| Field | Value |
|-------|-------|
| Purpose | Bill tracking (Kim Hammer packet already indexed) |
| Status | PRESENT — workbench bill index |
| Env var | N/A |
| Risk level | LOW |
| Data sensitivity | Public |
| Allowed access mode | arkleg.state.ar.us public pages |
| Future use | Media monitor cross-reference |
| Must never | Auto-generate motive claims from bill sponsorship |

---

## Archive / Wayback access

| Field | Value |
|-------|-------|
| Purpose | Source durability for citation locker |
| Status | PARTIAL — citation locker archive flags |
| Env var | N/A |
| Risk level | LOW |
| Data sensitivity | Public archived web |
| Allowed access mode | Internet Archive API / manual capture |
| Future use | Citation revalidation |
| Must never | Archive private or paywalled content improperly |

---

## Geocoding / GIS

| Field | Value |
|-------|-------|
| Purpose | County boundaries, regional clusters |
| Status | PRESENT — county registry |
| Env var | N/A (or map provider key if added) |
| Risk level | LOW |
| Data sensitivity | Public geographic |
| Allowed access mode | County registry + FIPS |
| Future use | County briefing maps |
| Must never | Precinct-level voter maps for persuasion |

---

## Kelly win-target scenario (file)

| Field | Value |
|-------|-------|
| Purpose | Statewide + county vote targets |
| Status | PRESENT |
| Env var | N/A |
| Risk level | MEDIUM — planning accuracy |
| Data sensitivity | Strategic aggregate |
| Allowed access mode | Repo file `data/election/kelly-win-target-scenario-v1.json` |
| Future use | NSI-7 pathway dashboard |
| Must never | Present as forecast without model note |

---

## Registration assumptions (file)

| Field | Value |
|-------|-------|
| Purpose | Anecdotal registration-to-vote model |
| Status | PRESENT (NSI-7) |
| Env var | N/A |
| Risk level | MEDIUM — unvalidated |
| Data sensitivity | Strategic aggregate |
| Allowed access mode | `data/intelligence/campaign-voter-registration-assumptions.json` |
| Future use | Pathway dashboard illustrative yield |
| Must never | Treat as validated forecast |

---

## Governance reminder

- Never commit `.env` files or API keys
- All new media findings: `NEEDS_REVIEW`, `NON_PUBLISHABLE`
- Export-ready claims gate: **2** — do not regress in tests
