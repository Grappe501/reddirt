# Northwest / central region — eight-county workbench parity audit

**Lane:** RedDirt · **Date:** 2026-04-28 · **Compared to:** Pope County public briefing shell (`/county-briefings/pope`, `/county-briefings/pope/v2`) and admin county intel (`/admin/county-intelligence`).

**Audit rule:** No fabricated registration numbers, turnout targets, “pathway to victory” math, or rival claims. This document records **what exists in repo routes and content**, not field projections.

---

## Executive summary

| County | Public route under `/county-briefings/[slug]` | Parity vs Pope |
|--------|-----------------------------------------------|----------------|
| **Pope** | Yes (`/pope`, `/pope/v2`) | Baseline (pilot) |
| Pulaski | **No** dedicated app route | Not at Pope parity |
| Faulkner | **No** | Not at Pope parity |
| Saline | **No** | Not at Pope parity |
| White | **No** | Not at Pope parity |
| Perry | **No** | Not at Pope parity |
| Cleburne | **No** | Not at Pope parity |
| Conway | **No** | Not at Pope parity |
| Van Buren | **No** | Not at Pope parity |

Only **Pope** has implemented Next.js pages under `src/app/county-briefings/`. The hub page (`/county-briefings`) lists Pope only; it does not register the eight counties as separate briefing URLs.

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

For **each** of: Pulaski, Faulkner, Saline, White, Perry, Cleburne, Conway, Van Buren:

| Question | Answer (same for all eight today) |
|----------|-------------------------------------|
| **Route exists (`/county-briefings/{slug}`)?** | **No** — no matching folders under `src/app/county-briefings/`. |
| **County-specific briefing content exists?** | **Not as first-class public pages** in RedDirt. Regional staff material may appear under admin candidate briefs or docs; that is separate from parity with the Pope **public** pattern. |
| **Strategy narrative on public site** | **No** county-scoped strategy page analogous to Pope v2. |
| **Real aggregate data surfaced** | **N/A** at route level until a county briefing page exists and is wired to approved sources. |
| **Target numbers on public UI** | **None to verify** — do not invent. |
| **Pathway to victory** | **Out of scope** for this parity audit unless published as sourced editorial — **not fabricated here**. |
| **Missing assets** | County briefing **pages**, optional **admin intel** tie-ins (`/admin/county-intelligence` is global tooling, not eight clones), editorial approval, data pipeline parity with COUNTY-* guardrails. |

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
