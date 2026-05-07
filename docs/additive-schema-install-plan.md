# Additive schema install plan

**Slice:** `REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0`  
**Generated:** 2026-05-07T04:41:51.937Z

## Critical safety statement

**The raw Prisma diff is not safe to execute.** It can drop provider constraints, mutate legacy warehouse tables, and destroy production relationships. This plan derives a **strictly additive** candidate subset from that diff plus `production-db-baseline-audit.json`. **Do not run** the raw diff. **Do not run** the candidate on production until clone proof and Steve-governed execution.

## Artifacts

| Artifact | Path |
|----------|------|
| Unsafe diff (input) | [`data/sql/unsafe-production-to-current-schema-diff.sql`](../data/sql/unsafe-production-to-current-schema-diff.sql) |
| Candidate SQL | [`data/sql/additive-schema-install-candidate.sql`](../data/sql/additive-schema-install-candidate.sql) |
| Rejected SQL | [`data/sql/additive-schema-install-rejected-statements.sql`](../data/sql/additive-schema-install-rejected-statements.sql) |
| Review notes | [`data/sql/additive-schema-install-review-notes.sql`](../data/sql/additive-schema-install-review-notes.sql) |
| Plan JSON | [`data/additive-schema-install-plan.json`](../data/additive-schema-install-plan.json) |
| Manual allowlists (optional) | [`data/additive-schema-manual-allowlists.json`](../data/additive-schema-manual-allowlists.json) |
| Unsafe analysis | [`docs/unsafe-production-schema-diff-analysis.md`](./unsafe-production-schema-diff-analysis.md) · [`data/unsafe-production-schema-diff-analysis.json`](../data/unsafe-production-schema-diff-analysis.json) |

## Summary

| Metric | Value |
|--------|------:|
| Candidate statements | 704 |
| Rejected statements | 628 |
| CREATE TYPE / TABLE / INDEX / ALTER (included) | 171 / 134 / 399 / 0 |
| `requiresCloneProof` | **true** |
| `safeForProduction` | **false** |
| Next slice | `REDDIRT-ADDITIVE-SCHEMA-CLONE-PROOF-1.0` |

## Top rejection reasons

- **update:** 316
- **contains_drop:** 262
- **create_index_on_table_not_in_candidate_new_set:** 39
- **high_risk_voter_semantic_table:** 10
- **create_table_target_already_observed:** 1
