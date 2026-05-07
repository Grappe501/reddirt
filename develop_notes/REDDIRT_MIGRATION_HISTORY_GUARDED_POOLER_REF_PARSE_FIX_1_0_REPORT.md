# REDDIRT-MIGRATION-HISTORY-GUARDED-POOLER-REF-PARSE-FIX-1.0

## Active lane

RedDirt only.

## Problem

`run-migration-history-baseline-guarded.mjs` compared `extractSupabaseRef(DATABASE_URL)` to the required production ref using logic that only matched `db.<ref>.supabase.co`. Pooler URLs (`*.pooler.supabase.com` with user `postgres.<ref>`) failed the execute gate even when correct.

## Fix

Replaced `extractSupabaseRef` with the same rules as `run-migration-history-production-preflight.mjs`: parse userinfo before `@` (user before first `:`, optional `decodeURIComponent`), match `postgres.<ref>`; else match `db.<ref>.supabase.co`. Execute gate uses `extractSupabaseRef(du).ref === REQUIRED_REF`. No URLs or passwords are printed.

## Files changed

- `scripts/run-migration-history-baseline-guarded.mjs`
- `docs/production-db-test-readiness.md`
- `docs/netlify-production-retry-readiness.md`
- `develop_notes/REDDIRT_MIGRATION_HISTORY_GUARDED_POOLER_REF_PARSE_FIX_1_0_REPORT.md`

## Commands run (agent)

| Command | Result |
|--------|--------|
| `node scripts/run-migration-history-baseline-guarded.mjs --dry-run` | Exit 0; dry-run JSON written; no Prisma spawned |
| `node scripts/validate-migration-history-baseline-execution-packet.mjs` | PASS |
| `npx prisma validate` | Schema valid |
| `npm run typecheck` | Pass |
| `npm run email:no-send-scan` | WARN (expected baseline integration/comms scan) |

## Safety

`--execute`, `migrate deploy` / `resolve` / `db push` / `reset`, `git push`, and Netlify retry were **not** run for this hotfix.
