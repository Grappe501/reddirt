# Post-additive migration history strategy

**Slice:** `REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0` · **Generated:** 2026-05-07T15:36:46.126Z

Machine JSON: [`data/post-additive-migration-history-strategy.json`](../data/post-additive-migration-history-strategy.json)

## Safest path (summary)

1. **Observe** hosted `prisma migrate status` (operator, no secrets in tickets).  
2. **Prove** on shadow / disposable DB that the migration chain matches post-additive production (no surprise DDL on legacy).  
3. **Align history** with governed `migrate resolve` / baseline tooling only after equivalence — not additive SQL alone.  
4. **Then** revisit Netlify retry in a dedicated Steve-gated slice.

## Next slice

`REDDIRT-MIGRATION-HISTORY-BASELINE-EXECUTION-PACKET-1.0` (packet not built in this slice).
