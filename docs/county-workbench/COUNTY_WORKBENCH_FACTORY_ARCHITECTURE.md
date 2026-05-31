# County Workbench Factory Architecture

## Layers

1. **County Registry** — `arkansas-county-registry.ts` (75 slugs, FIPS, regions)
2. **Global Source Tables** — `data/county-workbench/source-catalog/county-source-catalog.json`
3. **County Fact Store** — `data/county-workbench/facts/county-facts.json` with provenance
4. **County Intelligence Compiler** — `countyProfileCompiler.ts` → `compiled-profiles/`
5. **County Brief Generator** — `countyBriefFactory.ts` → `briefs/`
6. **AI County Builder Agent** — `aiCountyBuilderAgent.ts` (gaps, queues — no fabrication)
7. **Dashboard** — `/admin/county-intelligence` + `CountyFactoryRollupPanel`

## Cross-county tables

`countyCrossTableBuilder.ts` → `data/county-workbench/tables/*.json` (12 table types × 75 rows)

## Ingestion

Modular adapters in `factory/ingestion/countyIngestionAdapters.ts` orchestrated by `countyIngestionOrchestrator.ts`. Deferred when API env not set.

## Governance

All outputs: INTERNAL_DRAFT · NON_PUBLISHABLE · HUMAN_REVIEW_REQUIRED · NO_GOAL_MUTATION

## Postgres-ready boundary

`countyFactStore.ts` isolates load/save — swap JSON for Prisma later without changing compilers.
