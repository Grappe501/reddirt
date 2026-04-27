# Region Dashboard — shared shell (REGION-DASHBOARD-1)

**Lane:** `RedDirt/`. **Date:** 2026-04-27. **Constraint:** **Additive** — new types, builder, and `src/components/regions/dashboard/*` only; no new npm dependencies; no real voter PII. **Not all regions** are built as full routes in this pass (shell + data builder for reuse).

---

## Protocol read

- `README.md` — `npm run check` quality gate.
- `docs/STATE_ORGANIZING_INTELLIGENCE_DASHBOARD_REPORT.md` — state OI route, peer demo posture, `build-state-oi-dashboard` pattern.
- `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` — `ArkansasCampaignRegionSlug`, FIPS override (Pope → River Valley), `getCampaignRegionSlugForCounty`.
- Shared county dashboard primitives — `CountySectionHeader`, `CountyKpiCard`, `countyDashboardCardClass`, `CountyActionPanel`-style field grid, `CountyDashboardNextAction` / risk shapes.

---

## Files added

| Path | Role |
|------|------|
| `src/lib/campaign-engine/regions/types.ts` | `RegionDashboard`, county cards, Power-of-5 block, strategy block, comparison table model, reuses county labeled metrics / actions / risks. |
| `src/lib/campaign-engine/regions/build-region-dashboard.ts` | `buildRegionDashboard(slug)` — **derived** county list + count; **demo/seed** KPIs, P5, comparison rows, strategy, actions, risks. `buildSampleRegionDashboard()` → `river-valley`. |
| `src/components/regions/dashboard/RegionDashboardShell.tsx` | `max-w-6xl` page wrapper. |
| `src/components/regions/dashboard/RegionKpiStrip.tsx` | Regional executive KPI grid (uses `CountyKpiCard` + `CountySectionHeader`). |
| `src/components/regions/dashboard/RegionMapPanel.tsx` | SVG **placeholder** map + caption (no map deps). |
| `src/components/regions/dashboard/RegionCountyGrid.tsx` | In-region county tiles → `/counties/[slug]`, optional second link (e.g. Pope v2). |
| `src/components/regions/dashboard/RegionPowerOf5Panel.tsx` | P5 roll-up from `RegionPowerOf5Block`. |
| `src/components/regions/dashboard/RegionStrategyPanel.tsx` | Four-field strategy card (press / backfill / next). |
| `src/components/regions/dashboard/RegionComparisonTable.tsx` | Peer comparison table (demo columns + per-row `demo` / `derived` chip). |
| `src/components/regions/dashboard/RegionActionPanel.tsx` | Regional actions — same field pattern as `CountyActionPanel` (incl. `nextStep`). |
| `src/components/regions/dashboard/RegionRiskPanel.tsx` | Risk cards (severity, mitigation, owner). |
| `src/components/regions/dashboard/index.ts` | Barrel exports. |
| `docs/REGION_DASHBOARD_SHARED_SHELL_REPORT.md` | This file. |

---

## What is real vs demo

| Data | Type |
|------|------|
| Counties in region + FIPS, names, slugs, links to `/counties/[slug]` | **Derived** from `ARKANSAS_COUNTY_REGISTRY` + `getCampaignRegionSlugForCounty` (no voter file). |
| Region `displayName`, `taxonomyNote` from `ARKANSAS_CAMPAIGN_REGIONS` | **Config** (CANON-REGION-1). |
| Executive KPIs (population, teams, coverage %, etc.), P5 strip, peer table values, strategy tone, action/risk text | **Demo/seed** (labeled in UI and `dataDisclaimer`). |
| Map panel | **Placeholder** SVG. |

**River Valley sample:** With current FIPS map, **Pope (05115)** is often the only county in the `river-valley` campaign bucket—count **1** is expected and is **not** a bug.

---

## How to use (engineering)

```ts
import { buildRegionDashboard, buildSampleRegionDashboard } from "@/lib/campaign-engine/regions/build-region-dashboard";
import { RegionDashboardShell, RegionKpiStrip, /* … */ } from "@/components/regions/dashboard";

const data = buildSampleRegionDashboard(); // river-valley
// or: buildRegionDashboard("northwest-arkansas");
```

**Next wiring step (not in this pass):** hydrate `/organizing-intelligence/regions/[slug]` by calling `buildRegionDashboard(slug)` and rendering these components, replacing the current placeholder page described in OIS-STATE-1.

---

## Visual / UX alignment

- Matches **Pope v2** / county shell: Kelly palette, `CountySectionHeader` hierarchy, source pills on demo metrics, compact KPI cards, action DL grid, risk severity blocks.
- **Comparison table** includes a per-row `demo` | `derived` tag for honest labeling.

---

## Build / lint

- `npx tsc --noEmit` (local): **pass** for this pass.

---

## Next recommended script

- **Route integration:** In `src/app/organizing-intelligence/regions/[slug]/page.tsx`, validate `slug` against `ArkansasCampaignRegionSlug`, call `buildRegionDashboard(slug)`, and render the region shell; keep a 404 for unknown slugs.
- **Deduplicate** state OI + region builders later by sharing a small `kpi` helper (optional refactor; not required for this shell).

---

## Risks / blockers

- **Message discipline:** Do not treat **demo** peer cells or coverage as competitive intelligence in public comms.
- **Taxonomy:** As more FIPS join `river-valley` in `CAMPAIGN_REGION_FIPS_OVERRIDES`, **derived** county count will change with no code migration—update copy if stakeholders expect a fixed set.
