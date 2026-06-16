# County Workbench v3 — Election Plan Integration

**Status:** Phase 1 structural · **Lane:** `RedDirt/` · **Priority:** #1 county intelligence surface  
**Updated:** 2026-06-16  
**Related:** [`ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md`](./ELECTION_PLAN_DATA_INTEGRITY_DOCTRINE.md), [`county-workbench/COUNTY_WORKBENCH_FACTORY_ARCHITECTURE.md`](./county-workbench/COUNTY_WORKBENCH_FACTORY_ARCHITECTURE.md)

---

## Problem

County playbooks pointed operators to **antiquated external systems**:

```text
/county-briefings/{slug}/v2   (3 counties only)
/counties/{slug}-county       (legacy public command)
countyWorkbench portal        (sister app)
```

Election Plan had operational panels (VCI, field log, calendar) but **not** the dense county intelligence layer — census, BLS, elected officials, official locations, history, and explicit campaign reasoning.

---

## Target

**County Workbench v3** lives at:

```text
/election-plan/counties/{slug}
```

One page per county (all 75). No external dashboard required for daily work.

```text
County Workbench v3
├── Why we are working this county (VCI, tier, missions, path to victory)
├── Identity & official location (FIPS, region, county seat)
├── Census & demographics (CountyPublicDemographics + ACS)
├── BLS & economy (unemployment, industry mix)
├── Election history & turnout (ElectionCountyResult ingest)
├── Elected officials (CountyElectedOfficial)
├── History reference (Wikipedia ingest — internal, verify before public)
├── Data gaps & research queue (honest — no fake numbers)
└── Field ops (existing playbook: field log, cities, calendar, contacts)
```

---

## Data sources (reuse, do not re-integrate legacy UI)

| Layer | Source |
|-------|--------|
| Campaign reasoning | Election plan snapshot county row + `buildCountyPoliticalProfile` |
| Census / ACS | `CountyPublicDemographics` + profile engine ACS block |
| BLS | Demographics row unemployment + industry JSON |
| Election history | `ElectionCountyResult` via profile engine |
| Elected officials | `CountyElectedOfficial` Prisma table |
| Civic facts | `data/county-workbench/facts/county-facts.json` |
| Factory brief | `data/county-workbench/briefs/{slug}.json` |
| History excerpt | `docs/ingested/county-wikipedia/{slug}.md` |
| County seat | Wikipedia ingest metadata line |

Legacy `/counties/` and countyWorkbench portal remain **reference only** (collapsed link) — not primary navigation.

---

## Data integrity

- Missing data shows **—** or explicit gap cards — never placeholder statistics.
- Wikipedia is **internal reference** (CC BY-SA) — not government or census data.
- Planning targets (VCI, registration goals) are labeled as campaign planning; census/BLS rows show source when present.

---

## Code map

| File | Role |
|------|------|
| `load-county-workbench-v3.ts` | Aggregates all sources for one county |
| `load-county-wikipedia-reference.ts` | Parses ingested Wikipedia markdown |
| `CountyWorkbenchV3IntelPanel.tsx` | Dense intel UI sections |
| `CountyPlaybookPanel.tsx` | v3 intel + existing field ops |
| `battlefield-links.ts` | `countyDashboardHref` → election-plan counties |

---

## v4 evolution

See [`COUNTY_WORKBENCH_V4_DOCTRINE.md`](./COUNTY_WORKBENCH_V4_DOCTRINE.md) — v4 adds leadership, volunteer pipeline, PPEN rollups, and operating-center nav on the same route.

---

## Next passes (Burt)

1. **ACS/BLS pilot** — Faulkner or Saline first (not Pulaski); validate pipeline then scale to 75
2. **Elected officials import** — fill `CountyElectedOfficial` (county clerk, sheriff, quorum court, state/federal where relevant)
3. **Civic infrastructure facts** — county factory Pass C7+ for courthouses, election offices, official addresses
4. **Community workbench link** — city workbenches drill to parent county v3 via `countyPlaybookHref`
5. **Optional `county_hub` kind** in Community Workbench registry — 75 county hub entries pointing to same v3 page

---

## Verification

- `/election-plan?tab=countyPlaybooks` → card links say **Open county workbench v3**
- `/election-plan/counties/pulaski` → intel sections render; gaps honest if DB empty
- Battlefield cluster county links → `/election-plan/counties/{slug}` not `/counties/`
