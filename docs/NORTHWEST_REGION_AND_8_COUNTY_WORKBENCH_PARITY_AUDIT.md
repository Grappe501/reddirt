# Northwest / central region — eight-county workbench parity audit

**Lane:** RedDirt · **Date:** 2026-04-28 · **Compared to:** Pope County public briefing shell (`/county-briefings/pope`, `/county-briefings/pope/v2`) and admin county intel (`/admin/county-intelligence`).

**Audit rule:** No fabricated registration numbers, turnout targets, “pathway to victory” math, or rival claims. This document records **what exists in repo routes and content**, not field projections.

---

## Executive summary

| County | Public route under `/county-briefings/[slug]` | Parity vs Pope |
|--------|-----------------------------------------------|----------------|
| **Pope** | Yes (`/pope`, `/pope/v2`) | Baseline (pilot) |
| Pulaski | **`/pulaski/v2` v2 shell live** (`/county-briefings/pulaski/v2`); no classic `/pulaski` narrative page yet | **Partial** — template + intake-honest scaffolding; **no** city drilldown parity with Pope until place data ingests |
| Faulkner | **No** | Not at Pope parity |
| Saline | **No** | Not at Pope parity |
| White | **No** | Not at Pope parity |
| Perry | **No** | Not at Pope parity |
| Cleburne | **No** | Not at Pope parity |
| Conway | **No** | Not at Pope parity |
| Van Buren | **No** | Not at Pope parity |

**Pope** and **Pulaski v2** ship under `src/app/county-briefings/` (Pulaski: `/pulaski/v2` dashboard template; city cards explicitly deferred). The hub lists available briefings; the other seven parity-target counties still lack `county-briefings` routes until built.

---

## Pope County (reference)

| Dimension | Status |
|-----------|--------|
| **Route exists** | Yes: `page.tsx` under `county-briefings/pope` and `pope/v2`. |
| **Public content** | Yes — narrative hub + v2 dashboard shell with **explicit demo/seed labeling** where applicable. |
| **Strategy / PV / targets in UI** | **Demo placeholders only** where shown — training math, not asserted live field truth. Verify any future “live” labels against approved data ingestion. |
| **Real sourced data** | Any “real” linkage is **deployment- and ingestion-dependent** — not asserted here. |

---

## Eight listed counties — per dimension

**Pulaski — exception:** `src/app/county-briefings/pulaski/v2` publishes a **v2 briefing dashboard shell** (`/county-briefings/pulaski/v2`) with ingest-honest aggregates and explicit **city/precinct data needed** scaffolding—**not** full Pope parity on municipal drilldowns until place data imports.

For **each** of **Faulkner, Saline, White, Perry, Cleburne, Conway, Van Buren** — and for dimensions where Pulaski is still incomplete:

| Question | Answer |
|----------|--------|
| **Route exists (`/county-briefings/{slug}` or `{slug}/v2`)?** | **Seven counties:** **No** — no matching route folders yet. **Pulaski:** **v2 route only** (see exception above); no standalone `/pulaski` narrative page unless added separately. |
| **County-specific briefing content exists?** | **Seven counties:** **Not** as first-class public pages. **Pulaski:** v2 shell only—classic hub card narrative optional later. Regional staff materials may appear under admin or docs separately. |
| **Strategy narrative on public site** | **Seven counties:** none analogous to Pope. **Pulaski:** strategy strip is **aggregate / ingest-gap** keyed—verify before external reuse. |
| **Real aggregate data surfaced** | **Only** when ingestion provides rows; Pulaski pulls from **`buildCountyPoliticalProfile`** outputs—zeros where telemetry absent. |
| **Target numbers on public UI** | **None** invented—do not add turnout or pathway targets without sources. |
| **Pathway to victory** | **Out of scope** unless published as sourced editorial. |
| **Missing assets** | County briefing parity (place cards, precinct maps), editorial approval, data pipeline parity with COUNTY-* guardrails. |

---

## Conway note

Arkansas has a **Conway County** — do not confuse with the city of Conway (often discussed in Pulaski/Faulkner context). Routing and content slugs must use the **official county name** whenever a briefing is built.

---

## Recommendations (planning — no implementation commitment)

1. **Template:** Export Pope v2 layout as a **parameterized** county shell with empty-state copy until data is approved.  
2. **Slug map:** Align with `arkansas-county-registry` (or existing county slug table) for stable URLs.  
3. **Data:** Only show registration/turnout/KPI figures when **source + date** metadata is present in admin.  
4. **Hub:** Extend `/county-briefings` index as each county goes **live**, with status badges: `planned` | `pilot` | `live`.

---

## Related docs

- `docs/DEMO_LOCAL_READINESS.md` — how to demo public + admin locally.  
- Public hub copy: `src/app/county-briefings/page.tsx`.  
- Internal rollout reference (if present in repo): `docs/briefs/COUNTY_CANDIDATE_BRIEF_75_COUNTY_ROLLOUT.md`.
