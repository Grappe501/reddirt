# REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0 — report

**Lane:** `RedDirt/` only · **Generated:** 2026-05-06T23:21:26.567Z

## Slice summary

**REDDIRT-PRODUCTION-DB-BASELINE-PLAN-1.0** builds an **offline** preservation-first baseline story by comparing **read-only audit** metadata to **every** `prisma/migrations/*/migration.sql` file. **No** database connection, **no** `DATABASE_URL`, **no** Prisma CLI execution, **no** SQL intended to run. This is the correct next step after the **database transfer** fixed the wrong-target problem: we now plan the baseline carefully, then can unblock Netlify and return focus to email proof, calendar proof, county dashboard audit, and path-to-victory mapping.

## Files created

- `data/production-db-baseline-plan.json` — structured plan (`schemaVersion` **1.0**).
- `docs/production-db-baseline-plan.md` — operator markdown (required sections).
- `develop_notes/REDDIRT_PRODUCTION_DB_BASELINE_PLAN_1_0_REPORT.md` — this report.

## Inputs inspected

- `data/production-db-baseline-audit.json` — latest production baseline audit (must be regenerated when the DB target changes).
- `prisma/schema.prisma` — Prisma model → default table mapping and `@@map` overrides.
- `prisma/migrations/**/migration.sql` — **70** migration files in lexical folder order.

## Migration analysis summary

- **Fully present / vacuous:** 6
- **Missing footprint:** 64
- **Mixed footprint:** 0
- **High-value touching:** 54
- **Prisma tables with migration `CREATE TABLE` chain entry:** 148 / 148
- **Prisma-mapped tables also seen in observed public:** 0

## Baseline recommendation

- **Strategy:** `unsafe_to_baseline`
- **Reason:** Almost no Prisma-mapped public tables match observed names while production already holds many public tables — likely a parallel legacy lineage. Blind Prisma baseline or migrate-resolve would misrepresent reality.
- **Next slice:** `REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0`

## Governance status

- **`safeToExecuteAutomatically`:** false (planner default).
- **`requiresHumanApproval`:** true — **must** stay true until an explicit execution packet is approved.
- **Forbidden until approved:** `migrate deploy`, `migrate resolve`, `db push`, `migrate reset` on production (see plan markdown **Absolute forbidden commands**).
- **Row / voter export:** not performed by this slice.

## Checks

- `node scripts/plan-production-db-baseline.mjs` — regenerates JSON + markdown + this report.
- `npm run typecheck` — lane TypeScript.
- `npm run check` — lint + typecheck + production build.
- `npm run email:no-send-scan` — Comms no-send governance scan.

## Risks / limitations

- Regex-based DDL parse can miss uncommon syntax or nested PL/pgSQL.
- **Naming lineage:** legacy snake_case public tables will not match Prisma PascalCase `CREATE TABLE` names in heuristics — reconciliation is semantic.
- **Auth schema:** audit includes `auth.*`; this plan’s footprint checks focus on **public** observed tables.

## Next recommended slice

**REDDIRT-PRODUCTION-DB-SCHEMA-RECONCILIATION-1.0**
