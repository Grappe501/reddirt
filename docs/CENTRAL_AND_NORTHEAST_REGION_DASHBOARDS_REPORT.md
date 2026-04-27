# Central & Northeast Arkansas — region dashboards (REGION-DASHBOARD-1)

**Lane:** `RedDirt/` only. **Date:** 2026-04-27. **Routes:** public under `/organizing-intelligence` (same chrome as other OIS pages). **No new npm dependencies; no real voter PII.**

---

## Protocol read (abbrev.)

- `README.md` — `npm run check` quality gate.
- `docs/REGION_DASHBOARD_SHARED_SHELL_REPORT.md` — `RegionDashboardShell` / `RegionDashboardView` pattern, `buildRegionDashboard(slug)`.
- **Region taxonomy** — `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` (CANON-REGION-1: `getCampaignRegionSlugForCounty`, FIPS override Pope → `river-valley`, `central` + `west_central` → `central-arkansas`, `northeast` → `northeast-arkansas`).
- **State route** — `src/app/organizing-intelligence/page.tsx` + `build-state-oi-dashboard.ts`: region cards already link to `/organizing-intelligence/regions/{slug}` for all eight campaign slugs.

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/campaign-engine/regions/types.ts` | Optional `countyGridDescription?: string` on `RegionDashboard` for per-region copy in the county grid. |
| `src/lib/campaign-engine/regions/build-region-dashboard.ts` | **New** `buildCentralArkansasRegionDashboard()` and `buildNortheastArkansasRegionDashboard()` (strategy, disclaimer, comparison blurb, county grid description). NWA JSDoc moved next to `buildNorthwestArkansasRegionDashboard`. |
| `src/components/regions/dashboard/RegionDashboardView.tsx` | County grid description: `countyGridDescription` override; **river-valley** and **northwest-arkansas** keep explicit text; other regions (including new pages) get a **generic** default instead of the old Pope-only string. |
| `src/app/organizing-intelligence/regions/central-arkansas/page.tsx` | **New** — `buildCentralArkansasRegionDashboard()` + `RegionDashboardView`. |
| `src/app/organizing-intelligence/regions/northeast-arkansas/page.tsx` | **New** — `buildNortheastArkansasRegionDashboard()` + `RegionDashboardView`. |
| `docs/CENTRAL_AND_NORTHEAST_REGION_DASHBOARDS_REPORT.md` | This file. |

---

## What each page includes (per mission)

1. **RegionDashboardShell** (via `RegionDashboardView` → `RegionDashboardShell`).
2. **County lists** from **derived** `ARKANSAS_COUNTY_REGISTRY` + `getCampaignRegionSlugForCounty` inside `buildRegionDashboard("central-arkansas" | "northeast-arkansas")` — same core as NWA / River Valley.
3. **Demo/seed** where the base builder already does (KPIs, P5, peer table cells, per-county team/coverage on cards) — all labeled in UI / disclaimers.
4. **Power of 5 region rollup** — `data.powerOf5` block (`RegionPowerOf5Panel`).
5. **County comparison table** — `data.comparison` (`RegionComparisonTable`); NWA + River Valley as **planning** peer column labels (not certified).
6. **Action panel** — `buildDemoActions` (includes `nextStep` on `CountyDashboardNextAction`).
7. **Risk panel** — `buildDemoRisks`.
8. **Back link** — `RegionDashboardView` “← State organizing intelligence” → `/organizing-intelligence` (unchanged).
9. **Taxonomy notes** from `getCampaignRegionBySlug` (Central has stakeholder notes; Northeast uses default list entry).

---

## Central vs Northeast (taxonomy)

| Campaign slug | Registry mapping (default) | Notes on this build |
|---------------|---------------------------|----------------------|
| `central-arkansas` | `central` and `west_central` `ArCommandRegionId` → one campaign bucket | **Pope (05115)** is **excluded** from the Central **list** (FIPS override to River Valley). Copy explains that. |
| `northeast-arkansas` | `northeast` command bucket | All counties in that bucket that resolve to this slug. |

---

## Remaining placeholders

- Map panel: same SVG **placeholder** as other region pages (no tile server / GeoJSON).
- Peer table and regional KPIs: **demo/seed** until multi-county field pipelines exist.
- No county v2 routes for Central/Northeast counties in this pass — tiles link to `/counties/[slug]` only.

---

## Next recommended script

- Run **`npm run check`** in `H:\SOSWebsite\RedDirt`.
- Optional: add explicit cards on the **state** OI page highlighting Central / Northeast the same way NWA and River Valley are called out in docs (pure nav polish).
- **Packet 12-style** follow-up: one dynamic `buildRegionDashboard(slug)` path for `/organizing-intelligence/regions/[slug]` with `getCampaignRegionBySlug` validation and shared `countyGridDescription` map — reduces duplicate per-slug page files (optional refactor; not required for this deliverable).
