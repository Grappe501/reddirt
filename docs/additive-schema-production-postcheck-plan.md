# Additive schema production post-check plan

**Machine JSON:** [`data/additive-schema-production-postcheck-plan.json`](../data/additive-schema-production-postcheck-plan.json)

Read-only checks in Supabase SQL editor or operator-controlled `psql` **after** additive install. Repo verification script `scripts/verify-additive-schema-production-postcheck.mjs` validates **plan shape only** (offline).

## Phases

1. **Presence** — required public tables + `auth.users` still exist.  
2. **New tables** — spot-check Prisma-mapped tables that were missing in baseline audit.  
3. **Migration discipline** — additive SQL does not replace `_prisma_migrations` strategy; no blind `migrate deploy`.  
4. **Local lane checks** — `npm run email:no-send-scan`, `npm run check` in operator environment pointed at hosted DB only when approved separately.
