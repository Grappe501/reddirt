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


## REDDIRT-ADDITIVE-SCHEMA-PRODUCTION-EXECUTION-PACKET-1.0 (cross-links)

Governed additive schema execution packet (automation does **not** apply production SQL from repo scripts in this slice):

- [`additive-schema-production-execution-packet.md`](./additive-schema-production-execution-packet.md) · [`data/additive-schema-production-execution-packet.json`](../data/additive-schema-production-execution-packet.json) · [`data/additive-schema-production-execution-packet-validation.json`](../data/additive-schema-production-execution-packet-validation.json)
- [`additive-schema-production-approval-gates.md`](./additive-schema-production-approval-gates.md) · [`data/additive-schema-production-approval-gates.json`](../data/additive-schema-production-approval-gates.json)
- [`additive-schema-production-runbook.md`](./additive-schema-production-runbook.md)
- [`additive-schema-production-postcheck-plan.md`](./additive-schema-production-postcheck-plan.md) · [`data/additive-schema-production-postcheck-plan.json`](../data/additive-schema-production-postcheck-plan.json)
- [`post-additive-schema-netlify-readiness.md`](./post-additive-schema-netlify-readiness.md) · [`data/post-additive-schema-netlify-readiness.json`](../data/post-additive-schema-netlify-readiness.json)
- [`../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md`](../develop_notes/REDDIRT_ADDITIVE_SCHEMA_PRODUCTION_EXECUTION_PACKET_1_0_REPORT.md)

Scripts: `node scripts/build-additive-schema-production-execution-packet.mjs` · `node scripts/validate-additive-schema-production-execution-packet.mjs` · `node scripts/run-additive-schema-production-preflight.mjs` · `node scripts/run-additive-schema-production-guarded.mjs` (**`--dry-run`** default) · `node scripts/verify-additive-schema-production-postcheck.mjs`.
