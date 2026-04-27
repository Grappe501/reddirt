# Pope County Dashboard v2 — build report

**Lane:** `RedDirt/` only.  
**Date:** 2026-04-26.  
**Route:** `/county-briefings/pope/v2` (non-breaking; original `/county-briefings/pope` and `/counties/pope-county` unchanged).

---

## Files read (protocol + implementation context)

- `README.md` — quality gate `npm run check`; dev stack.
- `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md` — OIS-1 hierarchy, Power of 5, Pope prototype role, map placeholder posture.
- `docs/COUNTY_INTELLIGENCE_SYSTEM_PLAN.md` — existing Pope routes, engine references.
- `docs/data-targeting-foundation.md` (DATA-1) — skimming against guardrails: aggregates only, no public micro-maps in v1.
- `docs/field-structure-foundation.md` (FIELD-1) — no GIS in field product; consistent with placeholder maps.
- `docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md` — **not present** in repo at build time; Packet 1 still recommended as read-only follow-up.
- **Implementation reads:** `src/lib/campaign-engine/county-profiles/pope-county.ts`, `county-political-profile.ts` (types + turnout helpers), `src/lib/county/arkansas-county-registry.ts`, `county-briefings/pope/page.tsx`, `package.json` (no chart package added; Leaflet not used to avoid new surface area).

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts` | **New** — `buildPopeCountyDashboardV2()`, typed dashboard payload, real profile merge + labeled demo. |
| `src/components/county/pope/PopeBattlefieldTabs.tsx` | **New** — client tabs + SVG map placeholders. |
| `src/components/county/pope/PopeCountyDashboardV2View.tsx` | **New** — full v2 layout (KPIs, strategy, drilldowns, Power of 5, CSS/SVG charts, actions, risks, region). |
| `src/app/county-briefings/pope/v2/page.tsx` | **New** — async page wiring. |
| `src/app/county-briefings/pope/page.tsx` | Link to v2 (additive). |
| `src/app/county-briefings/page.tsx` | Second listing for Pope v2 (additive). |
| `docs/POPE_COUNTY_DASHBOARD_V2_BUILD_REPORT.md` | **This file.** |

---

## Route

- **Created:** `H:\SOSWebsite\RedDirt\src\app\county-briefings\pope\v2\page.tsx` → **`/county-briefings/pope/v2`**
- **Preserved:** `/county-briefings/pope`, `/counties/pope-county`, admin county pages — no refactors.

---

## Data sources

- **Real (when present):** `buildPopeCountyPoliticalProfile()` — county metadata, election history rows, turnout / registration snapshots from ingest, `talkingPoints`, `missingDataWarnings`, `precinctMapData` strings, `getPopeCountyPriorityPlanMeta()` for voter on-roll and outreach ceiling context.
- **Derived:** general-election turnout % from latest general row (`ballotsCast` / `registeredVoters` when available); organizing readiness **heuristic** from missing-warning count + precinct row presence + file roll presence (not a grade of field quality).
- **Demo/seed (labeled):** Power of 5 block, city drilldowns, most charts (historical 2020/2022 points, D-share series), volunteer/candidate pipeline, issue intensity, action list, risk matrix, map panel bodies, `candidatePipelineScore`, `priorityLevel`, default registered roll **38,200** if file returns null, default turnout strip **~51.2%** if general row cannot yield a %.

---

## What is real vs placeholder

- **Real:** Engine-backed narrative (strong/weak from profile where available), data warnings, optional DB-backed registration and turnout when rows exist, registry **region** label (Central / I-30 per `arkansas-county-registry`).
- **Placeholder / demo:** All Power of 5 counts, city cards (Russellville–Hector), precinct placeholder chips, map tabs, “battlefield” SVGs, several chart series, N-week team growth, pipeline scores, P1 sort label.

---

## Reuse for Benton / Washington (and 75 counties)

- Move **`buildPopeCountyDashboardV2`** pattern to `build{County}CountyDashboardV2` with shared types in e.g. `county-dashboards/types.ts` and one **`CountyDashboardShell`** component; swap `buildXxxCountyPoliticalProfile` + seed fixture per FIPS. Same **peer row** model as OIS-1: Benton and Washington = additional rows, not new CSS.
- **Do not** copy-paste the full `PopeCityDrilldown` array; drive from a config table keyed by `countySlug`.

---

## Build / lint

- **Local gate:** `read_lints` on edited TS/TSX — **no issues.**
- **Full `npm run check`:** attempted in this environment; **terminal output was not captured** (exit 0 with empty stream). Re-run in your shell: `cd H:\SOSWebsite\RedDirt` then `npm run check` before push.

---

## Next recommended implementation packet (roadmap alignment)

- **Packet 1 (still):** `docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md` — read-only route/component inventory, safe file list for Packet 2. No feature edits.
- **After audit:** **Packet 2** canonical region taxonomy (River Valley vs registry `central` / `north_central` display map) + geography keys for city routes.

---

## Risks / blockers

- **Taxonomy:** Pope is `central` in the registry; stakeholder “River Valley” copy must be reconciled in Packet 2 to avoid user confusion.
- **Demo data:** If staff mistakes demo rolls for file exports, messaging risk — mitigated with Demo badges and top banner.
- **No auth:** Public route by design; no PII. Future permission model per OIS-1 §11 before adding real rosters.
- **Performance:** `buildPopeCountyDashboardV2` returns full `profile` on the type — RSC only; if payload size matters later, split “strip-only” DTOs.

---

## No destructive changes

- No deletions, no auth edits, no new npm dependencies, no new county routes under `/counties/.../cities/...` (only shown as future path strings).
