# Production DB shadow / clone proof plan (REDDIRT-PRISMA-SCHEMA-MAP-PATCH-PLAN-AND-SHADOW-PROOF-1.0)

**Do not run on production.** This document is a procedure only.

## Warnings

- Do not run prisma migrate deploy, db push, migrate resolve, or migrate reset against production.
- Do not use production credentials for destructive experiments.

## Procedure

1. Create or designate a Supabase shadow project, database branch, or restored clone without live campaign/voter write traffic.
2. Load schema from production backup or logical dump into shadow; confirm auth and public catalogs match expectations.
3. Apply the same prisma/schema.prisma mapping changes as main branch (no secrets in repo).
4. Run `npx prisma validate` against shadow DATABASE_URL.
5. Run `npx prisma migrate status` on shadow (expect drift until baseline strategy is chosen).
6. Run `npx prisma migrate diff` (from migrations to shadow DB) and archive output for human review.
7. Run `npx prisma migrate deploy` **only** on shadow/clone — never production in this slice.
8. Verify no voter warehouse tables are dropped or renamed by generated SQL.
9. Run `npm run build` / `npm run check` against shadow-connected env in CI or local.
10. Verify hosted DB diagnostic route against shadow if applicable.

## Success criteria

- Shadow validates and deploy produces no destructive DDL against preserved tables.
- Operator signs off column-level compatibility for any @@map applied.

---

Artifact: `data/production-db-shadow-proof-plan.json`
