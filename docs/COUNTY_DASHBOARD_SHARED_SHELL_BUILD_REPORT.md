# County Dashboard v2 — shared shell (extract from Pope prototype)

**Lane:** `RedDirt/` only.  
**Date:** 2026-04-27.  
**Constraint:** **Additive refactor** — `src/app/county-briefings/pope/v2/page.tsx` is unchanged; route **`/county-briefings/pope/v2`** is preserved. No new county dashboards in this pass.

---

## Files read (protocol + sources)

- `README.md` — `npm run check` as quality gate.
- `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md` (OIS-1) — shared hierarchy, map placeholder posture, reuse vs one-off.
- `docs/COUNTY_INTELLIGENCE_SYSTEM_PLAN.md` — county intelligence scope, Pope as prototype.
- `docs/POPE_COUNTY_DASHBOARD_V2_BUILD_REPORT.md` — prior Pope v2 build baseline.
- `src/app/county-briefings/pope/v2/page.tsx` — wire-only page (verified unchanged pattern).
- `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts` — data builder; refactored to consume shared `types`.
- `src/components/county/pope/PopeCountyDashboardV2View.tsx` — decomposed into shell components.
- `src/components/county/pope/PopeBattlefieldTabs.tsx` — superseded by `CountyBattlefieldPanel` (re-export left for stability).

---

## Files changed (summary)

| Area | File |
|------|------|
| **Types** | `src/lib/campaign-engine/county-dashboards/types.ts` (new) — `CountyDashboardV2`, `CountyDashboard*`, `CountyDashboardKpiItem`. |
| **Pope data** | `pope-county-dashboard.ts` — types moved to `types.ts`; `PopeCountyDashboardV2` = `CountyDashboardV2 & { profile }`; re-exports `Pope*` aliases. |
| **Shell** | `src/components/county/dashboard/*` — shared UI (see “Extracted” below). |
| **Pope view** | `PopeCountyDashboardV2View.tsx` — composes shared shell; Pope-only `buildPopeExecutiveKpis` / `buildPopePowerOf5Items`. |
| **Battlefield** | `PopeBattlefieldTabs.tsx` — re-exports `CountyBattlefieldPanel` as `PopeBattlefieldTabs`. |
| **Report** | `docs/COUNTY_DASHBOARD_SHARED_SHELL_BUILD_REPORT.md` (this file). |

---

## Route tested

- **Preserved URL:** `https://<host>/county-briefings/pope/v2` — same `page.tsx` → `PopeCountyDashboardV2View` with `buildPopeCountyDashboardV2()`.
- **Manual verification recommended:** open v2, confirm sections render and links to `/county-briefings/pope`, `/county-briefings`, `/counties/pope-county` work.

---

## What was extracted (reusable)

- **`types.ts`:** Canonical payload for any county: executive strip, power-of-5, strategy, cities, charts, actions, risks, visual labels, warnings, `priorityVoterOnRoll` (no Prisma in base type).
- **`CountyDashboardShell`:** `max-w-6xl` page wrapper.
- **`CountyKpiStrip` + `countyDashboardFormat`:** KPI cards, source badges, `formatCountyDashboardNumber`, shared card class.
- **`CountyBattlefieldPanel`:** Client tabs + SVG placeholders; props `countyNameHint`, `primaryCityLabel` (Pope sets `Pope` / `Russellville`).
- **`CountyStrategyPanel`:** Strongest / weakest / next move + optional footnote.
- **`CountyDrilldownGrid`:** City cards + precinct placeholder chips.
- **`CountyPowerOf5Panel`:** Intro + list of `CountyDashboardKpiItem[]`.
- **`CountyChartPanel`:** Line-bar and horizontal-bar blocks from `CountyDashboardChartBundle` (no new dependencies).
- **`CountyActionPanel` / `CountyRiskPanel` / `CountyRegionalContextPanel` / `CountyDataGapsPanel`:** Standard sections.
- **`src/components/county/dashboard/index.ts`:** Barrel export.

---

## What stayed Pope-specific

- **`pope-county-dashboard.ts`:** `buildPopeCountyDashboardV2`, `POPE_DASHBOARD_V2_DATA_NOTE`, FIPS/seed/demo content, `profile: CountyPoliticalProfileResult` on the extended type, Pope city list and placeholder chips, visual label strings (“Pope County outline…”), integration with `buildPopeCountyPoliticalProfile` and `getPopeCountyPriorityPlanMeta`.
- **`PopeCountyDashboardV2View.tsx`:** Breadcrumb copy, “Pope County · prototype” eyebrow, `buildPopeExecutiveKpis` and `buildPopePowerOf5Items` (labeling and action hints for this county only), `CountyBattlefieldPanel` name hints, drilldown `description` that references Packet 8/9.

---

## Next recommended script (implementation)

**Packet 8 preview — city route pattern under county (read-only or stub only if approved):**  
- Add a single `types`-driven `CityDashboardShell` reuse test behind a **feature flag** or **admin-only** route first; **or** run **Packet 1** audit file `docs/audits/POPE_COUNTY_INTELLIGENCE_PACKET1_AUDIT.md` if it still does not exist, to lock route inventory before new URLs.

(Aligns with OIS-1: Packet 1 audit → Packet 2 region taxonomy → shared schema already partly satisfied by `types.ts` + this shell.)

---

## Build / lint

- **IDE lints** on new/edited dashboard + pope + types: **clean**.
- Re-run full gate locally: `Set-Location H:\SOSWebsite\RedDirt; npm run check`.

---

## Risks / notes

- **Backward import:** `PopeBattlefieldTabs` is a thin re-export; prefer `CountyBattlefieldPanel` for new code.
- **Chart copy:** Titles in `CountyChartPanel` are generic defaults aligned with the former Pope page; counties can add props later for overrides without forking layout.
