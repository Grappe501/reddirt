# Netlify production retry readiness (additive schema)

**This packet does not approve or perform Netlify retries.**

When Steve approves a **separate** Netlify slice, ensure additive schema postcheck is complete and migration strategy is explicit. Do not conflate RedDirt additive DDL with Netlify button retries.


## Post-additive: migration history before Netlify

Netlify remains blocked until `_prisma_migrations` alignment — see [`post-migration-history-netlify-readiness.md`](./post-migration-history-netlify-readiness.md) and [`migration-history-baseline-execution-packet.md`](./migration-history-baseline-execution-packet.md).

Operators running `node scripts/run-migration-history-production-preflight.mjs` with a **pooler** `DATABASE_URL` should expect ref confirmation from the `postgres.<projectRef>` username segment when the host is `*.pooler.supabase.com`, not only from `db.<projectRef>.supabase.co`. The script never logs full connection strings.

After deploy, the bearer **`GET /api/admin/production-readiness/hosted-db`** response (**`REDDIRT-HOSTED-DB-PROOF-HARDENING-1.0`**) uses the same ref rules plus read-only table and **`_prisma_migrations`** count checks — still **no** Netlify trigger from repo, **no** live send.

If an operator later uses `run-migration-history-baseline-guarded.mjs --execute` (per packet and env gates only), the **execute** ref gate uses the same pooler-aware parser as preflight.

## After migration-history alignment

When preflight confirms **`_prisma_migrations`** aligned and **`prisma migrate status`** is clean, use **REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0**: [`post-migration-history-netlify-retry-packet.md`](./post-migration-history-netlify-retry-packet.md) · [`data/post-migration-history-netlify-retry-packet.json`](../data/post-migration-history-netlify-retry-packet.json) · [`post-migration-history-deploy-checklist.md`](./post-migration-history-deploy-checklist.md). **`node scripts/build-post-migration-history-netlify-retry-packet.mjs`** refreshes machine JSON from preflight; it still **does not** deploy Netlify or approve sends. Next operator slice: **REDDIRT-NETLIFY-OPERATOR-RETRY-1.0**.
