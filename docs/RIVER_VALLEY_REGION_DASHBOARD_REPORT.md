# River Valley — region dashboard (first live region route)

**Lane:** `RedDirt/` only.  
**Date:** 2026-04-27.  
**Route:** [`/organizing-intelligence/regions/river-valley`](/organizing-intelligence/regions/river-valley)

This pass wires the **River Valley** stakeholder region to the shared **RegionDashboardShell** / region components, with **Pope County** as the anchor and **registry-based planning scaffolds** for peer counties (demo/placeholder). No new npm dependencies; no voter PII.

---

## Protocol read

- `README.md` — `npm run check` quality gate.
- `docs/REGION_DASHBOARD_SHARED_SHELL_REPORT.md` — REGION-DASHBOARD-1 builder + component list.
- `docs/POPE_COUNTY_DASHBOARD_POLISH_REPORT.md` — Pope v2 gold-standard reference and drill link targets.
- **Taxonomy:** `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` — FIPS `05115` → `river-valley` (Pope); default command mapping unchanged.
- **Data:** `buildRegionDashboard` / `buildRiverValleyRegionDashboard` in `build-region-dashboard.ts`.

---

## Files changed

| File | Change |
|------|--------|
| `src/app/organizing-intelligence/regions/river-valley/page.tsx` | **New** — `buildRiverValleyRegionDashboard()` + `RegionDashboardView` with `showPopeAnchorCta`. |
| `src/components/regions/dashboard/RegionDashboardView.tsx` | **New** — full region page layout: hero, KPI strip, map, Power of 5, strategy, county grid, comparison, actions, risks. |
| `src/components/regions/dashboard/index.ts` | Export `RegionDashboardView`. |
| `src/components/regions/dashboard/RegionCountyGrid.tsx` | **Anchor** + **Demo scaffold** pills on county cards. |
| `src/lib/campaign-engine/regions/types.ts` | `RegionDashboardCountyCard` flags: `isAnchorCounty`, `isPlanningScaffold`; `countyCount.source` allows `"demo"` + optional `note`. |
| `src/lib/campaign-engine/regions/build-region-dashboard.ts` | River Valley: **7-county** ordered list (Pope first, then FIPS order); Faulkner, Conway, Johnson, Perry, Saline, Yell as scaffolds; strategy copy tuned for RV; `buildRiverValleyRegionDashboard()`. |
| `docs/RIVER_VALLEY_REGION_DASHBOARD_REPORT.md` | This file. |

**Unchanged (by design):** `src/app/organizing-intelligence/regions/[slug]/page.tsx` — still a short placeholder; wire to `RegionDashboardView` in a follow-up to avoid two patterns long-term.

---

## What the page includes

1. **RegionDashboardShell** (via `RegionDashboardView` → `RegionDashboardShell`).
2. **Pope anchor CTA** — primary button to [`/county-briefings/pope/v2`](/county-briefings/pope/v2) (`showPopeAnchorCta`).
3. **Executive strip** — count row explains **FIPS-map vs scaffold**; rollups still **demo/seed** where noted.
4. **Power of 5** — same regional block as builder (`powerOf5` in payload).
5. **Strategy** — River Valley–specific *what this means* / *where to press* / *backfill* / *next* (Pope v2, CANON-REGION-1, statewide OIS).
6. **County cards** — Pope: **Anchor** + link to Pope v2; others: **Demo scaffold** + `/counties/[slug]` only; team/coverage **demo** with notes.
7. **Comparison table** — existing NWA peer column (demo) from builder.
8. **Actions & risks** — `RegionActionPanel` / `RegionRiskPanel` (from builder).

---

## Real vs placeholder

| Item | Type |
|------|------|
| County names, FIPS, slugs, `/counties/...` | **Registry-derived** |
| FIPS in `river-valley` **campaign** map | **1** (Pope `05115` override only) |
| “Scaffold” counties on this page | **Planning list** (registry rows) — **not** in override map; cards **demo**-labeled |
| Power of 5, population estimate, coverage %, table cells, map SVG | **Demo/seed** (labeled in UI) |

---

## Remaining placeholders

- Region and county map panels are still **SVG placeholders** (no Mapbox/GeoJSON).
- Scaffolds will **disappear** from “Demo scaffold” if/when FIPS are added to `CAMPAIGN_REGION_FIPS_OVERRIDES` or the campaign map logic changes.
- `dynamic = "force-dynamic"` on the page so builder timestamps stay fresh; add caching later if needed.

---

## Next recommended script

- **Unify region routing:** In `src/app/organizing-intelligence/regions/[slug]/page.tsx`, validate `slug` with `getCampaignRegionBySlug`, `notFound()` on miss, and render `RegionDashboardView` with `buildRegionDashboard(slug)` (hide Pope CTA unless `slug === "river-valley"`). **Or** add an explicit `redirect` from generic slug to dedicated pages only where you want SEO/canonical URLs.
- **State index link:** Add a “River Valley” card on `StateOrganizingIntelligenceView` pointing to `/organizing-intelligence/regions/river-valley` when you want discoverability.
- **Packet 2 (taxonomy):** When stakeholders approve a full FIPS set for River Valley, extend `CAMPAIGN_REGION_FIPS_OVERRIDES` and **remove** manual scaffold list in the builder to avoid double-counts.

---

## Build / check

Re-run: `Set-Location H:\SOSWebsite\RedDirt; npm run check`.
