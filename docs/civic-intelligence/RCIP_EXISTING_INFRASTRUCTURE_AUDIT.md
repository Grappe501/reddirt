# RCIP Existing Infrastructure Audit

**Mission:** `RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0`  
**Repository:** `H:\SOSWebsite\RedDirt`  
**Audit date:** 2026-08-05  
**Auditor:** Cursor agent (pre-implementation; audit-before-architecture)  
**Git branch at audit:** `fix/netlify-handler-250mb-volunteer-presentation`  
**HEAD (short):** `e8eeb10b`

---

## Verdict

RedDirt has **county demographics models and deferred Census/BLS adapter stubs**, plus CSV import for aggregate county demographics. It does **not** yet have a production-grade Census/BLS connector layer, public-statistics warehouse, provenance store, cross-check engine, or CC export pipeline.

**Do not claim live API ingestion exists.** Building RCIP requires creating the warehouse and real connectors — while reusing the county FIPS registry, Prisma multi-schema capability, H:-drive bootstrap, and the intentional “no fake census data” stub posture.

---

## Environment & database

| Item | Finding |
|---|---|
| Bootstrap | `scripts/run-with-h-drive-env.cjs` wraps Next/tooling for H:-only |
| `DATABASE_URL` | SET — hosted Supabase host; **pooler=true** |
| `DIRECT_URL` | SET — hosted Supabase host; pooler-classified |
| Local Docker DB | Not confirmed running at audit time |
| Prisma | `provider = postgresql`, `previewFeatures = ["multiSchema"]`, `schemas = ["public", "auth"]` |
| `CENSUS_API_KEY` | **MISSING** in `.env` / `.env.local` |
| `BLS_API_KEY` | **MISSING** in `.env` / `.env.local` |
| Key verifier | `scripts/verify-env-api-keys.mjs` exists but does **not** currently check Census/BLS |

Classification: **hosted Postgres (Supabase)** is the configured target. Migrations against production require the existing approved diagnostic + migration workflow and must not use `db push` as a shortcut.

---

## What exists (reusable)

### 1. County public demographics snapshot (campaign-adjacent)

`CountyPublicDemographics` in `prisma/schema.prisma` (`@@schema("public")`):

- Aggregate fields: population, VAP, median income, poverty, education, unemployment, employment JSON, BLS industry mix JSON
- Source enum: `CENSUS_ACS`, `CENSUS_DECENNIAL`, `MANUAL`, `OTHER`
- Review status + `asOfYear` + `fetchedAt`
- Related: `County`, FIPS on counties, campaign stats (separate model — must stay isolated)

**Reuse:** County FIPS / slug registry and field naming intuition.  
**Do not reuse as the RCIP warehouse:** lives in `public` alongside campaign county models; demo seed values are placeholders.

### 2. CSV import script

`scripts/import-county-public-demographics.ts`

- Imports aggregate CSV into `CountyPublicDemographics`
- Explicitly no PII / individual voters
- Not a live Census/BLS API client

### 3. County Workbench factory adapters (stubs)

`src/lib/county-workbench/factory/ingestion/countyIngestionAdapters.ts`

- `censusAdapter` — checks `CENSUS_API_KEY`; **does not pull data** (“Census pull not implemented”)
- `blsAdapter` — checks `BLS_API_KEY`; **does not pull data** (“BLS pull not implemented”)
- Correctly refuses to invent fake census data when unconfigured
- Orchestration references Pass C1 / C3 in `aiCountyBuilderAgent.ts`

### 4. County factory npm scripts

```text
county:factory:audit
county:ingest / county:ingest:dry-run
county:factory:all
…
```

Useful operational patterns; not an RCIP warehouse.

### 5. Seed data (demo)

`prisma/seed.ts` upserts `CountyPublicDemographics` with **placeholder** population/income figures labeled `"ACS 5-year (demo) — not verified"`.

**Must not** be exported to Constitutional Capitalism as sourced evidence.

### 6. Platform capabilities to leverage

- H:-drive env runner
- Prisma multi-schema (can add `public_statistics`)
- Existing `check` / migrate scripts
- Supabase hosted DB experience / diagnostics elsewhere in repo

---

## What is incomplete / missing (must build)

| Capability | Status |
|---|---|
| Live Census API client | Missing (stub only) |
| Live BLS API client | Missing (stub only) |
| API keys in env | Missing |
| `public_statistics` schema / tables | Missing |
| Series / observations / releases | Missing |
| Source-query + raw response archive | Missing |
| Cross-check engine | Missing |
| Confidence model | Missing |
| Metric mappings to CC baseline | Missing (design exists in CC repo only) |
| Export contract + privacy scanner | Missing in RedDirt |
| `publicdata:*` operator commands | Missing |
| Provenance documentation set | Missing (this folder created by mission) |
| Scheduled production ingestion | Not found for Census/BLS |

---

## Duplication / retirement guidance

| Asset | Action |
|---|---|
| `censusAdapter` / `blsAdapter` stubs | Keep as county-factory gap markers **or** thin wrappers calling new RCIP connectors — do not leave two divergent live clients |
| `CountyPublicDemographics` | Retain for county campaign UX; **do not** dump into CC exports; optionally backfill from RCIP later under review |
| Demo seed demographics | Leave for local demo; never mark `verified` for CC |
| CSV import | Keep as offline fallback; not the primary RCIP path |

---

## What must remain untouched

- Campaign contacts, voters, donors, volunteers, relationship graphs
- Gmail / calendar / auth tables (`auth` schema)
- Email command center / compliance financial pipelines (except shared bootstrap patterns)
- Arbitrary widening of DB roles to CC
- Netlify handler / volunteer presentation work on current branch (unrelated)

---

## Architecture decision (from audit)

1. **Canonical data layer:** existing Prisma + Postgres (hosted Supabase).  
2. **Isolation:** add PostgreSQL schema `public_statistics` via Prisma `multiSchema` (already enabled). Prefer real schema over only prefixed tables in `public`.  
3. **Phase 1 delivery to CC:** validated snapshot exports (not live DB credentials).  
4. **Connectors:** new `src/lib/civic-intelligence/` — do not pretend county stubs are production.  
5. **Branch caution:** current working branch is **not** `main`. RCIP commits should land on an intentional RCIP branch or `main` after operator confirmation — do not assume `main`.

---

## Risk register (audit)

| Risk | Severity | Mitigation |
|---|---|---|
| Missing API keys | High | Operator must supply `CENSUS_API_KEY` / `BLS_API_KEY` server-side only |
| Hosted DB migrate without local proof | High | Diagnose; prefer local Docker proof; document if production migrate deferred |
| Exporting demo demographics as proof | Critical | Privacy + validation scanners; never export seed placeholders |
| Branch ≠ main | Medium | Explicit git target in return report |
| CountyPublicDemographics confusion | Medium | Separate RCIP models; document boundary |

---

## Safe reuse checklist

- [x] County FIPS / slug registry concepts  
- [x] Prisma multi-schema  
- [x] H:-only runner  
- [x] “No fake census data” discipline from stubs  
- [ ] Live Census client (build)  
- [ ] Live BLS client (build)  
- [ ] Warehouse tables (build)  
- [ ] Export → CC import (build; CC stubs already exist)

---

## Next implementation steps (post-audit)

1. Create RCIP governance docs (charter, boundary, provenance, cross-validation, export, revision, roadmap, runbook, rollback).  
2. Add `public_statistics` to Prisma `schemas` + models + migration (apply only after DB diagnose).  
3. Implement Census/BLS connectors behind keys; fail closed if missing.  
4. Seed limited indicator manifest (10–15).  
5. Cross-check + export + privacy scan.  
6. CC import when a real export exists — **do not inflate baseline** on empty stubs.

---

## Honesty statement

At audit time, RedDirt is **not** yet a functioning Public Data Engine for Constitutional Capitalism. It is a campaign platform with deferred public-data adapter hooks and aggregate county demographic storage. RCIP Phase 1 must build the spine, not re-label the stubs.
