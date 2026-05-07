# Production DB test readiness (additive schema context)

After additive install, **hosted** verification (`DATABASE_URL` / `DIRECT_URL`) remains **operator-owned**. Automated agents should not assume connectivity.

## Suggested order

1. Read-only `SELECT 1` and table presence probes (no PII export).  
2. **Hosted hardened proof:** bearer **`GET /api/admin/production-readiness/hosted-db`** returns **`productionSchemaContract`** (canonical ref **`giozeoqulfojhxpywjil`**, legacy + new public tables, **`auth.users`**, **`_prisma_migrations`** row count **71**) plus **`env.supabaseProjectRefConfirmed`** — **no** full URIs in JSON (**REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0**).  
3. Application smoke against staging or production UI per separate runbook — **no** live sends.  
4. Align with [`docs/email-command-center-launch-hardening.md`](./email-command-center-launch-hardening.md) for comms lane gates.


## Migration history baseline (post-additive)

After additive SQL, use [`migration-history-baseline-execution-packet.md`](./migration-history-baseline-execution-packet.md) and [`data/migration-history-production-preflight.json`](../data/migration-history-production-preflight.json) before any hosted `migrate deploy` / Netlify retry.

**Supabase project ref in preflight:** `scripts/run-migration-history-production-preflight.mjs` confirms the canonical project ref from `DATABASE_URL` **without** printing the URL or password. It accepts the direct host form `db.<projectRef>.supabase.co` and the **pooler** form where the username is `postgres.<projectRef>` (for example `*.pooler.supabase.com` with database `postgres`). The JSON artifact may include `supabaseProjectRefParseHint` (`username_postgres_dot_ref` or `host_db_dot_ref`) for audit only.

**Guarded baseline runner:** On `--execute`, `scripts/run-migration-history-baseline-guarded.mjs` uses the **same** ref extraction rules as the preflight script (pooler username and `db.*` host); it does not print connection strings or passwords.


## Post–migration-history Netlify retry (operator)

When `data/migration-history-production-preflight.json` shows migration history aligned (71 rows, pending **0**, migrate status clean), regenerate readiness with **`node scripts/build-post-migration-history-netlify-retry-packet.mjs`**, then **`node scripts/validate-post-migration-history-netlify-retry-packet.mjs`**. Human docs: [`post-migration-history-netlify-retry-packet.md`](./post-migration-history-netlify-retry-packet.md), [`post-migration-history-deploy-checklist.md`](./post-migration-history-deploy-checklist.md). This packet **does not** trigger Netlify or approve live send.
