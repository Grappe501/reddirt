# State Organizing Intelligence Dashboard — build report (OIS-STATE-1)

**Lane:** `RedDirt/`. **Date:** 2026-04-27. **Constraint:** **Additive** — new public route + placeholder region routes; no new npm dependencies; no real voter PII; demo/seed clearly labeled.

---

## Protocol read

- `README.md` — quality gate `npm run check`.
- `docs/REGION_TAXONOMY_BUILD_REPORT.md` (CANON-REGION-1) — campaign region slugs, FIPS display overrides, eight-region model.
- Shared county dashboard primitives — `countyDashboardCardClass`, `CountySourceBadge`, `formatCountyDashboardNumber` reused for visual alignment with Pope v2.
- `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` — `ARKANSAS_CAMPAIGN_REGIONS`, slugs, `getCampaignRegionSlugForCounty`.

---

## Route

| URL | Role |
|-----|------|
| `/organizing-intelligence` | **State** dashboard — main deliverable. |
| `/organizing-intelligence/regions/[slug]` | **Placeholder** for all eight `ArkansasCampaignRegionSlug` values (avoids 404s from the grid). |

**Sample county link:** ` /county-briefings/pope/v2` (Pope v2) from hero + table row for `pope-county`.

**Region slugs in grid (as requested):**  
`northwest-arkansas`, `central-arkansas`, `river-valley`, `north-central-ozarks`, `northeast-arkansas`, `delta-eastern-arkansas`, `southeast-arkansas`, `southwest-arkansas`.

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/campaign-engine/state-organizing-intelligence/build-state-oi-dashboard.ts` | **New** — `buildStateOrganizingIntelligenceDashboard()`; **derived** county count per campaign region from `ARKANSAS_COUNTY_REGISTRY` + `getCampaignRegionSlugForCounty`; **demo/seed** for statewide KPIs, rollups, Power of 5, county readiness table. |
| `src/components/organizing-intelligence/StateOrganizingIntelligenceView.tsx` | **New** — state UI: KPI strip, map placeholder, region grid, P5 summary, readiness table, strategy panel. |
| `src/app/organizing-intelligence/layout.tsx` | **New** — same public chrome as `county-briefings` (header, footer, main). |
| `src/app/organizing-intelligence/page.tsx` | **New** — state landing, metadata. |
| `src/app/organizing-intelligence/regions/[slug]/page.tsx` | **New** — placeholder region page (not full rollup UI). |
| `docs/STATE_ORGANIZING_INTELLIGENCE_DASHBOARD_REPORT.md` | This file. |

---

## What is real vs demo

| Data | Type |
|------|------|
| Counties per region (8 buckets) | **Derived** from 75 FIPS + campaign slug resolution (OIS/campaign taxonomy). |
| County names in sample table + `/counties/[slug]` links | **Public** registry (no vote history). |
| All statewide “file estimate” counts, team totals, model coverage, readiness index, regional rollup scores, P5 block | **Demo/seed** (labeled in UI and disclaimer). |
| State map | **Placeholder** SVG (no map library). |

---

## Visual / UX

- Tight **KPI grid** and **source pills** (Demo/seed vs Derived) aligned with county dashboard language.
- **Region cards** are link tiles with county count + demo rollup + “Open region view →”.
- **Power of 5** block is a six-tile row (all marked demo).
- **County readiness** table: demo scores; Pope row links to v2, others to county command.
- **Strategy** panel: “What this means” / “What to do next” in one card.

---

## Build / lint

- `npx tsc --noEmit` in `H:\SOSWebsite\RedDirt`: **pass** (local run as part of this pass).

---

## Next recommended script

- **Full region dashboard (Packet 12-style):** hydrate `/organizing-intelligence/regions/[slug]` with real rollups from the same `buildState…` + county aggregates (no PII), peer tables, and drill to counties using `getCampaignRegionSlugForCounty` filters.
- **Wire a real statewide reg total** when a safe, aggregate-only source is approved—replace the “1.89M” demo with DB or cited public file rollups.
- **Optional nav:** add a site-wide link to `/organizing-intelligence` from an appropriate hub (e.g. internal planning index) in a separate, low-risk PR.

---

## Risks / blockers

- **Messaging:** do not treat demo readiness/rollup as a competitive intelligence score in public comms.
- **Taxonomy:** `river-valley` has only the Pope FIPS override today; as more counties get overrides, the **derived** count for that region will change without a migration.
