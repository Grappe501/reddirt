# REDDIRT-MIGRATION-HISTORY-PREFLIGHT-POOLER-REF-PARSE-FIX-1.0

## Active lane

RedDirt only.

## Problem

`run-migration-history-production-preflight.mjs` treated the Supabase project ref as unparsed when production used a **Supavisor / pooler** URL: host `*.pooler.supabase.com`, database `postgres`, username `postgres.<projectRef>`. Only `db.<ref>.supabase.co` in the string was matched.

## Fix

- Parse **userinfo** (segment before `@`): after optional `user:password`, if the user matches `postgres.<ref>` (ref length 15–25, alphanumeric), use that ref.
- Keep **host** match `db.<ref>.supabase.co` as fallback when the username is plain `postgres` or another form.
- Userinfo is split on the **first** colon only so passwords are never interpreted as part of the username.
- Artifact field `supabaseProjectRefParseHint` records `username_postgres_dot_ref` or `host_db_dot_ref` without exposing URLs or secrets.

## Files changed

- `scripts/run-migration-history-production-preflight.mjs`
- `docs/production-db-test-readiness.md`
- `docs/netlify-production-retry-readiness.md`
- `develop_notes/REDDIRT_MIGRATION_HISTORY_PREFLIGHT_POOLER_REF_PARSE_FIX_1_0_REPORT.md`

## Commands run and results

From `H:\SOSWebsite\RedDirt` (this workspace had no `DATABASE_URL` in the agent shell, so preflight wrote the missing-URL artifact and exited 0 with a WARN console line):

| Command | Result |
|--------|--------|
| `node scripts/run-migration-history-production-preflight.mjs` | WARN — `DATABASE_URL` missing; artifact written |
| `node scripts/validate-migration-history-baseline-execution-packet.mjs` | PASS |
| `npx prisma validate` | Schema valid |
| `npm run typecheck` | Pass (`tsc --noEmit`) |
| `npm run email:no-send-scan` | WARN (expected baseline integration/comms findings only) |

## Safety

No `migrate deploy`, `migrate resolve`, `db push`, `migrate reset`, guarded `--execute`, `git push`, or Netlify retry was run as part of this fix.
