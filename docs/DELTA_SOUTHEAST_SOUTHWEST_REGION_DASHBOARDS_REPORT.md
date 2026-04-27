# Delta, Southeast & Southwest Arkansas — region dashboards (REGION-DASHBOARD-2)

**Lane:** `RedDirt/` only. **Date:** 2026-04-27. **Routes:** `/organizing-intelligence/regions/delta-eastern-arkansas`, `.../southeast-arkansas`, `.../southwest-arkansas`. **State back-link:** `RegionDashboardView` → `/organizing-intelligence` (unchanged). **No new dependencies; no voter PII.**

---

## Protocol read (abbrev.)

- `README.md` — `npm run check` quality gate.
- `docs/CENTRAL_AND_NORTHEAST_REGION_DASHBOARDS_REPORT.md` — pattern: dedicated builder + `RegionDashboardView` + `buildRegionDashboard` core.
- **Taxonomy (CANON-REGION-1):** `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` — `COMMAND_REGION_ID_TO_DEFAULT_CAMPAIGN_SLUG` maps `southeast` → `delta-eastern-arkansas`, `south` → `southeast-arkansas`, `southwest` → `southwest-arkansas`.
- **Shell:** `RegionDashboardShell` / `RegionDashboardView` in `src/components/regions/dashboard/`.

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/campaign-engine/regions/build-region-dashboard.ts` | Added `buildDeltaEasternArkansasRegionDashboard()`, `buildSoutheastArkansasRegionDashboard()`, `buildSouthwestArkansasRegionDashboard()` — each wraps `buildRegionDashboard(slug)` with region-specific `countyGridDescription`, `dataDisclaimer`, `strategy` block, and `comparison.description`. |
| `src/app/organizing-intelligence/regions/delta-eastern-arkansas/page.tsx` | **New** — Delta / Eastern region dashboard. |
| `src/app/organizing-intelligence/regions/southeast-arkansas/page.tsx` | **New** — Southeast region dashboard. |
| `src/app/organizing-intelligence/regions/southwest-arkansas/page.tsx` | **New** — Southwest region dashboard. |
| `docs/DELTA_SOUTHEAST_SOUTHWEST_REGION_DASHBOARDS_REPORT.md` | This file. |

---

## What each page includes (per mission)

1. **RegionDashboardShell** (via `RegionDashboardView` → `RegionDashboardShell`).
2. **Canonical region data** — `buildRegionDashboard("delta-eastern-arkansas" | "southeast-arkansas" | "southwest-arkansas")` → county list from `ARKANSAS_COUNTY_REGISTRY` + `getCampaignRegionSlugForCounty` (same derivation as NWA / River Valley / Central / NE).
3. **Demo/seed** — KPIs, Power of 5, peer table, per-county team/coverage on cards: inherited from the shared builder; all labeled in UI and disclaimers.
4. **Power of 5 roll-up** — `RegionPowerOf5Panel` from `data.powerOf5`.
5. **County cards** — `RegionCountyGrid` with `countyGridDescription` override per region.
6. **Strategy** — `RegionStrategyPanel` (operational, neutral, data-focused copy).
7. **Action panel** — `buildDemoActions` via base builder (`nextStep` on each item).
8. **Risk panel** — `buildDemoRisks`.
9. **State link** — `← State organizing intelligence` in `RegionDashboardView` to `/organizing-intelligence` (no change required).

**Note:** The dynamic placeholder `src/app/organizing-intelligence/regions/[slug]/page.tsx` still exists for any slug without a static page. These three static routes **take precedence** for their URLs, so the grid links from the state dashboard (`/organizing-intelligence/regions/{slug}`) now resolve to full region shells instead of the placeholder for Delta, Southeast, and Southwest.

---

## Taxonomy (registry → campaign slug)

| Campaign slug | Default registry mapping | Stakeholder note (from `arkansas-campaign-regions`) |
|-----------------|--------------------------|-----------------------------------------------------|
| `delta-eastern-arkansas` | `southeast` | Often aligns with registry `southeast` (Delta-leaning language in the old command list). |
| `southeast-arkansas` | `south` | Often aligns with registry `south` (timber / lower-south in the old list). |
| `southwest-arkansas` | `southwest` | (See region list; Texarkana / hill-country language in ARK list.) |

---

## Visual / UX

- Identical to other region dashboards: KPI strip, map placeholder, Power of 5, strategy, peer comparison table, action queue, risk matrix.
- Copy stays **neutral, operational, aggregate-first** (no candidate opposition claims; no individual voter data).

---

## Remaining placeholders

- Map: SVG/placeholder (no GeoJSON) — same as other region pages.
- Regional KPIs and peer cells: **demo/seed** until multi-county field pipelines exist.
- No county v2 intel routes for in-bucket counties in this pass (optional secondary links only where the base builder sets them, e.g. Pope in River Valley / NWA patterns).

---

## Next recommended script

- Run `npm run check` in `H:\SOSWebsite\RedDirt`.
- Optional: point `[slug]/page.tsx` to `buildRegionDashboard(slug) + RegionDashboardView` for the remaining campaign slugs that lack static pages, or add static pages for **North Central / Ozarks** to match the full eight-card grid.
- **Packet 12+:** one generic dynamic region route with `getCampaignRegionBySlug` validation to reduce duplicate page files (optional; static routes remain valid).
