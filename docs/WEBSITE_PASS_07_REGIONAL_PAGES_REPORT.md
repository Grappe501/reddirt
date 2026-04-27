# Website Pass 07 — Regional organizing pages upgrade

**Lane:** `RedDirt/`  
**Date:** 2026-04-27  
**Depends on:** `docs/WEBSITE_PASS_06_CONVERSATIONS_STORIES_REPORT.md`; `src/lib/campaign-engine/regions/arkansas-campaign-regions.ts` (CANON-REGION-1); `src/lib/campaign-engine/regions/build-region-dashboard.ts`; `src/app/organizing-intelligence/regions/*/page.tsx`

---

## 1. Mission

Make each **public region dashboard** under `/organizing-intelligence/regions/*` a **useful organizing gateway**: explain the region, surface counties and drills, show **demo / preview** Power of 5 rollups, highlight priorities and roadmap, and wire **clear CTAs** to Power of 5 onboarding and the Conversations & Stories hub — without voter PII, new auth, or claiming file-backed competitive metrics.

---

## 2. What changed

### 2.1 Volunteer-facing region intro (`gateway`)

- **New** `src/lib/campaign-engine/regions/region-gateway-copy.ts` — eight slugs × `{ headline, body }` tuned to CANON-REGION-1 (e.g. Central vs west_central fold, River Valley vs Pope override, NWA primaries).
- **`RegionDashboard.gateway`** added in `src/lib/campaign-engine/regions/types.ts`; populated in `buildRegionDashboard()`.

### 2.2 Gateway band + CTAs (UI)

- **New** `src/components/regions/dashboard/RegionOrganizingGatewayBand.tsx` — “Public preview · demo / seed” badges, headline/body, primary **Start Power of 5** → `/onboarding/power-of-5`, secondary **Conversations & Stories** → `/messages` (canonical per Pass 6; not a duplicate `/conversations` route).
- **`RegionDashboardView`** renders the band after taxonomy / Pope anchor CTA (River Valley).

### 2.3 Counties, drills, and roadmap order

- **County grid** and **next county builds** move **up** (immediately after optional NWA primary comparison row) so volunteers see turf before deep KPIs.
- **`RegionCountyGrid`**: each county tile adds **OIS county** → `/organizing-intelligence/counties/[countySlug]` alongside county command and optional published dashboard link.
- **Default roadmap** for all regions **except** NWA: `buildDefaultNextCountyBuilds()` in `build-region-dashboard.ts` — River Valley prioritizes **planning scaffolds**; others take anchors + alphabetical depth (max four tiles). Each item links **county command** + **OIS county placeholder**.
- **NWA** keeps bespoke roadmap; items now include `hrefOrganizingIntelligence` for Benton and Washington.

### 2.4 Power of 5 and priorities (labeling)

- **Power of 5** block overline set to **“Power of 5 — status & roll-up (demo / preview)”** in the builder; KPI strip copy clarifies demo/derived-from-demo numerators.
- **`RegionStrategyBlock.panelDescription`** optional field; base + NWA strategy include public-gateway descriptions.
- **`RegionActionPanel`** on region pages: overline **“Top organizing priorities”**, title **“Regional next moves (demo queue)”**, with explicit note that items are examples, not live web tasks.

### 2.5 Files touched (summary)

| File | Role |
|------|------|
| `src/lib/campaign-engine/regions/region-gateway-copy.ts` | **New** per-slug gateway copy |
| `src/lib/campaign-engine/regions/types.ts` | `gateway`, `panelDescription`, `hrefOrganizingIntelligence` |
| `src/lib/campaign-engine/regions/build-region-dashboard.ts` | `gateway`, default `nextCountiesToBuild`, P5 overline, NWA roadmap links |
| `src/components/regions/dashboard/RegionOrganizingGatewayBand.tsx` | **New** CTA band |
| `src/components/regions/dashboard/RegionDashboardView.tsx` | Band, section order, copy tweaks |
| `src/components/regions/dashboard/RegionCountyGrid.tsx` | OIS county link |
| `src/components/regions/dashboard/RegionPrimaryComparisonCards.tsx` | OIS county link on NWA comparison cards |
| `src/components/regions/dashboard/RegionNextCountiesToBuildPanel.tsx` | OIS placeholder link |
| `src/components/regions/dashboard/RegionStrategyPanel.tsx` | `panelDescription` |
| `src/components/regions/dashboard/index.ts` | Export `RegionOrganizingGatewayBand` |

---

## 3. Public routes (unchanged paths, richer pages)

| Path | Behavior |
|------|----------|
| `/organizing-intelligence/regions/northwest-arkansas` | NWA builder + primary comparison + gateway |
| `/organizing-intelligence/regions/central-arkansas` | Central + west_central bucket copy |
| `/organizing-intelligence/regions/river-valley` | Pope anchor CTA + scaffolds + gateway |
| `/organizing-intelligence/regions/north-central-ozarks` | Ozarks / north_central narrative |
| `/organizing-intelligence/regions/northeast-arkansas` | Northeast bucket |
| `/organizing-intelligence/regions/delta-eastern-arkansas` | Delta / eastern (southeast registry default) |
| `/organizing-intelligence/regions/southeast-arkansas` | South registry bucket |
| `/organizing-intelligence/regions/southwest-arkansas` | Southwest bucket |
| `/organizing-intelligence/regions/[slug]` | Placeholder for unknown slug (existing) |

---

## 4. Guardrails

- **Demo / preview** language preserved on gateway band, KPI strip, Power of 5 panel, and county tiles (`CountySourceBadge` unchanged).
- **No** voter file, Prisma mutations, or new auth on these pages.
- **Conversations & Stories** URL remains **`/messages`** per Pass 6; nav label and CTA text match user-facing language.

---

## 5. Verification

From `RedDirt/`:

```bash
npm run check
```

(Lint + `tsc --noEmit` + `next build`.)

---

## 6. Follow-ups (not in this pass)

- Optional: shorten `dataDisclaimer` above the fold now that `gateway` carries the human intro.
- When county v2 routes multiply, consider auto-prioritizing roadmap tiles by population or staff assignments (still aggregate-safe).
- Geo: replace placeholder map panel with static art or public GeoJSON when ready.

---

**End of report.**
