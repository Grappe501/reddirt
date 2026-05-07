# Migration history postcheck plan

**Slice:** `REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0`  
**Machine JSON:** [`data/migration-history-postcheck-plan.json`](../data/migration-history-postcheck-plan.json)

After production baseline execution, operators verify `_prisma_migrations`, migration counts, `prisma migrate status`, and table preservation **without** using this repo script to run `migrate deploy`.

Netlify retry is a **separate** Steve-gated step after this plan passes.
