# City intelligence — 10 enrichment dimensions (Top 100)

Each priority city page includes a **place profile** built from `data/campaign-brain/city-intelligence-profiles.json`.

Regenerate: `npm run city-intelligence:build` (from `RedDirt/`).

Optional at build time: `GOOGLE_CIVIC_API_KEY` in `.env.local` caches state/federal representatives per city.

---

## The ten dimensions

| # | Dimension | What it contains | Primary source today |
|---|-----------|------------------|----------------------|
| 1 | **Geographic & cluster** | Census population, county share, deployment cluster, strategic role | `ARKANSAS_TOP_100_CITIES` + workbench snapshot |
| 2 | **Historical & cultural** | Influence tags, county Wikipedia excerpt, Top-10 flag | Registry + `docs/ingested/county-wikipedia` |
| 3 | **Socio-economic** | County issue clusters (cost of living, schools, jobs, etc.) | `data/public-narrative/county-issue-clusters.json` |
| 4 | **State House** | District + representative | Google Civic API (build-time) or Arkleg scaffold |
| 5 | **State Senate** | District + senator | Google Civic API (build-time) or Arkleg scaffold |
| 6 | **U.S. House** | Congressional district + representative | Google Civic API (build-time) or scaffold |
| 7 | **Chamber of Commerce** | Local chamber name (+ URL for verified seeds) | `scripts/city-intelligence/seeds.ts` + field verify |
| 8 | **Rotary / civic club** | Rotary Club of {City} | Naming convention — field verify |
| 9 | **Main high school & district** | Anchor campus + school district | Seeds for Top 40 anchors; default `{City} High School` |
| 10 | **Local government & validators** | Mayor/council (Civic API when available) + validator recruitment targets | Google Civic + influence-tag doctrine |

---

## Status labels on each row

- **Verified seed** — Curated in `scripts/city-intelligence/seeds.ts` (chambers, schools, DMAs)
- **API (build-time)** — Google Civic Information API result cached in JSON at build
- **Inherited** — Derived from county/cluster/influence tags (no separate lookup)
- **Field verify** — Scaffold name or role — **do not cite publicly until confirmed**

---

## What this pass added

- `city-intelligence-profiles.json` for all **100** priority cities
- `CityIntelligenceEnrichmentPanel` on every city location brief
- Build pipeline `scripts/build-city-intelligence-profiles.ts`
- Foundation for **per-city strategic plans** (next pass): verify scaffolds → lock briefs → numeric targets for cities 41–100

---

## Next pass — strategic plans per place

1. Field-verify scaffold rows (chamber exec, Rotary president, principal, mayor's office)
2. Extend `city-location-briefs.source.json` for cities 41–100 using profile narratives
3. Extend `city-location-numeric-targets.source.json` for cities 41–100
4. County/cluster strategic overlays from existing chapter-09 playbooks

---

## APIs not yet wired at runtime

| API | Env var | Status |
|-----|---------|--------|
| Google Civic | `GOOGLE_CIVIC_API_KEY` | Build-time cache only |
| Census ACS | `CENSUS_API_KEY` | County adapter stub |
| BLS | `BLS_API_KEY` | County adapter stub |

City pages **inherit** county Census/BLS when `CountyPublicDemographics` rows exist in DB.
