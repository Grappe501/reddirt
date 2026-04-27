# Region taxonomy — build report (CANON-REGION-1)

**Lane:** `RedDirt/`. **Date:** 2026-04-27. **Constraint:** **Additive** — `ArCommandRegionId` and every county’s `regionId` in `arkansas-county-registry` are **not** renamed or migrated in this pass.

---

## Files read (protocol + sources)

- `README.md` — `npm run check`, general repo hygiene.
- `docs/RED_DIRT_ORGANIZING_INTELLIGENCE_SYSTEM_PLAN.md` (skim) — OIS-1, River Valley vs registry `central` reconciliation.
- `docs/COUNTY_INTELLIGENCE_SYSTEM_PLAN.md` (skim) — county intelligence, region taxonomy as backlog.
- `src/lib/county/arkansas-county-registry.ts` — eight `ArCommandRegionId` values, `ARKANSAS_COMMAND_REGIONS`, 75 county `regionId` rows (Pope = `05115`, `regionId: "central"`).
- Grep: `regionId` / `regionLabel` in `src/` — county command hub, voter registration, `get-county-command-data`, county dashboard, `CountyCommandExperience`, admin counties, `pope-county-dashboard`, etc.

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` | **New** — eight campaign regions (display names + stable slugs), `COMMAND_REGION_ID_TO_DEFAULT_CAMPAIGN_SLUG`, `CAMPAIGN_REGION_FIPS_OVERRIDES` (Pope FIPS), `resolveRegionPresentationForCounty` + helpers. |
| `src/lib/campaign-engine/county-dashboards/types.ts` | Optional `registryCommandRegionLabel`, `campaignRegionSlug` on `CountyDashboardV2`. |
| `src/lib/campaign-engine/county-dashboards/pope-county-dashboard.ts` | Wires `resolveRegionPresentationForCounty`; sets `regionLabel` to campaign display; passes optional registry + slug. |
| `src/components/county/dashboard/CountyRegionalContextPanel.tsx` | Optional `registryCommandRegionLabel` prop; copy distinguishes campaign vs command registry. |
| `src/components/county/pope/PopeCountyDashboardV2View.tsx` | Passes new props; strategy footnote uses campaign + registry strings. |
| `docs/REGION_TAXONOMY_BUILD_REPORT.md` | This file. |

---

## Region conflicts found

| Tension | Resolution in CANON-REGION-1 |
|--------|---------------------------------|
| **8 registry `ArCommandRegionId` vs 8 stakeholder campaign names** | Campaign list uses stakeholder geography (NWA, Central, River Valley, N Central/Ozarks, etc.). The eight **command** IDs are reconciled to campaign **slugs** via `COMMAND_REGION_ID_TO_DEFAULT_CAMPAIGN_SLUG` — not a 1:1 name match, by design, until a full county-by-county pass. |
| **`west_central` has no separate stakeholder name** | Default display maps to **`central-arkansas`** (I-30 / Hot Springs / mixed “center” briefings). Documented in code comments. Override per FIPS in the future. |
| **Old `southeast` vs `south` (registry)** | Mapped to **`delta-eastern-arkansas`** and **`southeast-arkansas`** respectively to separate Delta story from “lower south / timber” story. |
| **Pope: `regionId: "central"` vs “River Valley” narrative** | **FIPS override** `05115` → `river-valley` for **display only**; registry row stays `central`. |

---

## Pope County mapping decision

- **Data truth (unchanged):** `pope-county` in `ARKANSAS_COUNTY_REGISTRY` remains **`regionId: "central"`** (FIPS `05115`).
- **Campaign display (additive):** `CAMPAIGN_REGION_FIPS_OVERRIDES["05115"] = "river-valley"` so `regionLabel` on the v2 county dashboard shows **“River Valley”** and `campaignRegionSlug` is `river-valley`, while `regionCode` on the payload remains `central` for any code that keys off the original ID.
- **Transparency:** `registryCommandRegionLabel` carries the long string from `regionLabelForId("central")` so UIs can show both **campaign** and **command** labels (see `CountyRegionalContextPanel` and strategy footnote on Pope v2).

---

## Next recommended script

- **Wire other consumers:** `CountyCommandHub`, `get-county-command-data` / DB `regionLabel`, and public hero copy can optionally import `getCampaignRegionDisplayNameForCounty(fips, regionId)` when product wants stakeholder names site-wide; do it packet-by-packet to avoid mixed strings on Netlify before QA.
- **Optional:** Expand `CAMPAIGN_REGION_FIPS_OVERRIDES` with explicit stakeholder review (Saline, Faulkner, etc.) — do not bulk-edit registry.

---

## Build / lint

- Run `npx tsc --noEmit` and `npm run check` in `H:\SOSWebsite\RedDirt` after pull.
