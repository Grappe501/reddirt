# Post-additive schema Netlify readiness

**Machine JSON:** [`data/post-additive-schema-netlify-readiness.json`](../data/post-additive-schema-netlify-readiness.json)

**Netlify production retry** remains **out of scope** for this packet. This doc only records prerequisites so a **future** Steve-approved Netlify slice can proceed without conflating DB DDL with deploy retries.

## Prerequisites before any Netlify retry touching production

- Additive candidate applied and postcheck phase 1–2 satisfied.  
- Hosted read-only proof documented.  
- Separate approval for `migrate deploy` / build pipeline if applicable.

## After postcheck PASS (migration history)

Additive SQL alone does **not** align `_prisma_migrations`. See **[`post-additive-netlify-readiness-decision.md`](./post-additive-netlify-readiness-decision.md)** and **[`post-additive-migration-history-strategy.md`](./post-additive-migration-history-strategy.md)** (`REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0`) before treating Netlify as safe to retry.
