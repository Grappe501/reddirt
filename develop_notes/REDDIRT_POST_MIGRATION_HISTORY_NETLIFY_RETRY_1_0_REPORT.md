# REDDIRT_POST_MIGRATION_HISTORY_NETLIFY_RETRY_1_0_REPORT

## Slice

REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0

## Generated

2026-05-07T17:27:31.920Z

## Outcomes

- **Packet build:** all preflight gates satisfied


## Preflight source

Machine gates are derived only from `data/migration-history-production-preflight.json` (ref, legacy + app tables, `auth.users`, `_prisma_migrations` count **71**, `prisma migrate status` exit **0**, summary contains “Database schema is up to date”, pending **0**). Regenerate this packet after re-running `node scripts/run-migration-history-production-preflight.mjs` if production truth changes.

## Netlify build

`scripts/netlify-build.sh` runs `npx prisma migrate deploy` after `prisma generate`. When `eligibility.migrateDeployExpectedNoOp` is **true**, deploy should apply **no** pending migrations — operator must still confirm Netlify `DATABASE_URL` is production (ref **giozeoqulfojhxpywjil**, pooler user `postgres.<ref>` when using Supabase pooler).

## Repo commands (offline / planning)

- `node scripts/build-post-migration-history-netlify-retry-packet.mjs`
- `node scripts/validate-post-migration-history-netlify-retry-packet.mjs`
- `node scripts/run-hosted-db-proof-readiness.mjs`

## Artifacts written

- `data/post-migration-history-netlify-retry-packet.json`
- `data/post-migration-history-netlify-retry-validation.json` (from validate script, not overwritten by build)
- `data/post-migration-history-deploy-checklist.json`
- `data/communication-command-center-next-unlock.json`
- `data/hosted-db-proof-readiness.json` (from `run-hosted-db-proof-readiness.mjs`, not overwritten by build)
- `docs/post-migration-history-netlify-retry-packet.md`
- `docs/post-migration-history-deploy-checklist.md`

## Safety

No production mutation, no Netlify trigger, no live send approval, no `db push` / `migrate reset`, no migration-history baseline re-execution from this packet builder.

## Next

Operator slice **REDDIRT-NETLIFY-OPERATOR-RETRY-1.0** — controlled Netlify production retry (UI or approved pipeline only).
