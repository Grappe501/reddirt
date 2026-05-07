# Post–migration-history Netlify deploy checklist

**Slice:** `REDDIRT-POST-MIGRATION-HISTORY-NETLIFY-RETRY-1.0`  
**Generated:** 2026-05-07T17:27:31.920Z  
**Machine JSON:** [`../data/post-migration-history-deploy-checklist.json`](../data/post-migration-history-deploy-checklist.json)

Use this checklist **immediately before** triggering a production Netlify deploy. Do not paste secrets into tickets or chat.

1. Verify [`data/post-migration-history-netlify-retry-packet.json`](../data/post-migration-history-netlify-retry-packet.json) shows `eligibility.readyForOperatorNetlifyRetry: true`.
2. In Netlify → Environment, confirm **DATABASE_URL** targets production ref **giozeoqulfojhxpywjil** (pooler username `postgres.giozeoqulfojhxpywjil` when using Supabase pooler). No localhost, no clone DB URL.
3. Confirm **DIRECT_URL** if your team uses split URIs.
4. Understand the build runs **`npx prisma migrate deploy`** (`scripts/netlify-build.sh`); with zero pending migrations it should not apply DDL.
5. Trigger deploy only via operator-controlled Netlify UI or approved pipeline — **not** from this script.
6. After success, run hosted proof steps per [`hosted-db-proof-after-baseline.md`](./hosted-db-proof-after-baseline.md) and [`../data/hosted-db-proof-readiness.json`](../data/hosted-db-proof-readiness.json).
7. **Live send** stays blocked until a separate execution packet.
