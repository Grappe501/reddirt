# Northwest Arkansas (NWA) — region dashboard

**Lane:** `RedDirt/` only.  
**Date:** 2026-04-28.  
**Route:** [`/organizing-intelligence/regions/northwest-arkansas`](/organizing-intelligence/regions/northwest-arkansas)

Wires the **Northwest Arkansas** campaign region (`northwest-arkansas`) to the shared `RegionDashboardShell` / `RegionDashboardView`, with **Benton** and **Washington** as **primary** counties, **Carroll** and **Madison** as **in-bucket nearby** (registry `regionId: northwest`), and **Pope** as a **cross-bucket OIS prototype** card (not a fifth NWA registry row). No new dependencies; no voter PII; rollups and per-card numbers are **demo/seed** where noted.

---

## Protocol read

- `README.md` — `npm run check` quality gate.
- `docs/RIVER_VALLEY_REGION_DASHBOARD_REPORT.md` — River Valley pattern, `showPopeAnchorCta`, scaffolds.
- `docs/REGION_TAXONOMY_BUILD_REPORT.md` (CANON-REGION-1) — campaign slugs; registry `northwest` → `northwest-arkansas`.
- `docs/briefs/KELLY_NWA_BENTON_WASHINGTON_CANDIDATE_BRIEF.md` — internal positioning for Benton vs Washington; **not** copied into public UI beyond generic “primary basin” language.

---

## Files changed

| File | Change |
|------|--------|
| `src/app/organizing-intelligence/regions/northwest-arkansas/page.tsx` | **New** — `buildNorthwestArkansasRegionDashboard()` + `RegionDashboardView`. |
| `src/lib/campaign-engine/regions/build-region-dashboard.ts` | **New** `buildNorthwestArkansasRegionDashboard()`: reorders counties (Benton, Washington, Carroll, Madison); NWA strategy + disclaimer; `primaryComparisonRow` + `nextCountiesToBuild`. |
| `src/lib/campaign-engine/regions/types.ts` | `isPrimaryNwa` on county cards; `RegionDashboardHighlightCard`, `RegionNextCountyBuildItem`; optional `primaryComparisonRow` + `nextCountiesToBuild` on `RegionDashboard`. |
| `src/components/regions/dashboard/RegionPrimaryComparisonCards.tsx` | **New** — 3-up comparison (Benton, Washington, Pope). |
| `src/components/regions/dashboard/RegionNextCountiesToBuildPanel.tsx` | **New** — “Planned” Benton + Washington v2 roadmap (no v2 routes in this build). |
| `src/components/regions/dashboard/RegionDashboardView.tsx` | Renders optional blocks; NWA-specific county grid copy when `slug === "northwest-arkansas"`. |
| `src/components/regions/dashboard/RegionCountyGrid.tsx` | `Primary` pill when `isPrimaryNwa`. |
| `src/components/regions/dashboard/index.ts` | Exports for new components. |
| `docs/NWA_REGION_DASHBOARD_REPORT.md` | This file. |

---

## What the page includes

1. `RegionDashboardShell` (unchanged).
2. **No** `showPopeAnchorCta` (that remains River Valley). Pope appears in the **primary comparison** row and via strategy copy.
3. **Primary + reference row** — Benton, Washington, Pope (sample / [`/county-briefings/pope/v2`](/county-briefings/pope/v2)).
4. **Registry counties** — four in-bucket, ordered: Benton, Washington, Carroll, Madison. **Primary** badge on Benton and Washington.
5. **Next county dashboards to build** — Benton and Washington; links to public **county command** only; v2 TBD.
6. Shared **KPI / map / Power of 5 / strategy / peer table / actions / risks** from base `buildRegionDashboard("northwest-arkansas")` with NWA strategy + comparison description overrides.

---

## Real vs placeholder

| Item | Type |
|------|------|
| County names, FIPS, slugs, `regionId: northwest` | **Registry-derived** (`arkansas-county-registry`) |
| In-bucket list | **4 counties** in `getCampaignRegionSlugForCounty` = `northwest-arkansas` (Pope excluded: override = `river-valley`) |
| Power of 5, population rollup, team/coverage on cards, table cells, map | **Demo/seed** (labeled) |
| Pope on comparison row | **Not** NWA in-bucket; **OIS** reference only |

---

## Remaining placeholders

- County and region maps remain **SVG placeholders** (no tile server / GeoJSON).
- Benton and Washington **county intelligence v2** routes **not** created (per mission).
- Multi-county file-backed rollups not wired; peer table is layout validation.

---

## Next recommended script

- **State index / navigation:** add an “Northwest Arkansas” card on [`/organizing-intelligence`](./) pointing to this route (same pattern as when River Valley is linked).
- **Optional:** add `buildNorthwestArkansasRegionDashboard` to a generic `regions/[slug]` resolver once slugs are validated with `getCampaignRegionBySlug` and `notFound()`.
- **County v2:** when Packet allows, add `benton-county` and `washington-county` under the shared county shell (mirror Pope v2) and replace “Planned” with live links.

---

## Build / check

Re-run: `Set-Location H:\SOSWebsite\RedDirt; npm run check`.
