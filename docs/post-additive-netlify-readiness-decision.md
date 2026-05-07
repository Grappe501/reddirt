# Post-additive Netlify readiness decision

**Slice:** `REDDIRT-POST-ADDITIVE-SCHEMA-MIGRATION-HISTORY-STRATEGY-1.0` · **Generated:** 2026-05-07T15:36:46.126Z

Machine JSON: [`data/post-additive-netlify-readiness-decision.json`](../data/post-additive-netlify-readiness-decision.json)

## Decision

**Do not** retry Netlify production builds against production **now**. `migrate deploy` is still in the build path and migration history is not yet aligned with post-additive reality.

## Related

- [`docs/post-additive-schema-netlify-readiness.md`](./post-additive-schema-netlify-readiness.md) (additive-era prerequisites)  
- [`data/netlify-production-retry-readiness.json`](../data/netlify-production-retry-readiness.json)
