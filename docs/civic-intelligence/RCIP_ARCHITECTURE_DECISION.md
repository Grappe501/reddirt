# RCIP Architecture Decision — Phase 1

**Decision date:** 2026-08-05  
**Mission:** RCIP-PHASE-1-PUBLIC-STATISTICS-SPINE-1.0

## Warehouse isolation

**Selected:** PostgreSQL schema `public_statistics` (Prisma `multiSchema`) with matching models.

**Phase 1 operator path:** H:-drive file warehouse at `data/public-statistics/warehouse/` until the additive migration is applied to an approved database target.

## Rationale

1. Existing Prisma uses `multiSchema` with `public` + `auth` — adding `public_statistics` is the clean isolation path.
2. Hosted Supabase is the configured `DATABASE_URL` target; Docker local was not running at audit. Production `migrate deploy` is **not** claimed in Phase 1 without operator confirmation.
3. County `CountyPublicDemographics` remains untouched (campaign-adjacent; may contain demo placeholders).
4. County Census/BLS adapters remain stubs for County Workbench; RCIP connectors are the production-grade path.

## Untouched

- Campaign, people, auth, email, calendar models
- Demo seed demographics values (must never export as proof)
