# Decision Simulation Engine — Phase 2 Persistence Report

**Status:** Built and committed  
**Repository:** `Grappe501/reddirt`  
**Scope:** Persistence foundation only  
**Execution posture:** Advisory-only; no send/post automation introduced

## What Phase 2 Adds

The Decision Simulation Engine now has an isolated persistence domain in RedDirt Postgres. The schema is migration-first and intentionally does not modify existing campaign tables.

Canonical tables:

1. `decision_simulation_actor` — people, campaigns, organizations, media, audiences, allies, critics, and other modeled counterparts.
2. `decision_simulation_run` — one simulation request, its channel, initial move, objective, model metadata, prompt/doctrine version, and run status.
3. `decision_simulation_move` — the operator/counterpart move tree, bounded to ply 0 through 6.
4. `decision_simulation_branch` — expected, hostile, best-case, and alternative futures.
5. `decision_simulation_evidence` — source-backed evidence attached to a run, move, or actor.
6. `decision_simulation_assumption` — explicit assumptions with importance and verification status.
7. `decision_simulation_outcome` — actual real-world responses and future prediction-accuracy measurements.

## Core Data Rules

- Six-move horizon is enforced as `ply >= 0 AND ply <= 6`.
- Operator and counterpart are explicit sides.
- Predicted, recommended, initial, and actual responses are distinct move kinds.
- Probability, confidence, reliability, and accuracy scores are bounded to 0..1.
- Child simulation records cascade when their owning simulation is deleted.
- Actor references use `SET NULL` where historical simulation records should survive actor-profile deletion.
- Alternative-future branch types are first-class rather than being embedded in prose.
- Model name, provider, prompt version, doctrine version, token counts, and estimated cost have dedicated run fields for reproducibility and cost governance.
- No sending, posting, scheduling, or autonomous execution table is created.

## Application Contracts

`src/lib/agents/decision-simulation/persistence.ts` defines TypeScript contracts for channels, statuses, actor types, move kinds, branches, threat/opportunity labels, runs, moves, evidence, outcomes, and the repository boundary.

The persistence contract deliberately separates storage from the future OpenAI runtime so the AI provider can be swapped or upgraded without changing the database domain.

## Verification

`scripts/test-decision-simulation-persistence.ts` is the Phase 2 hostile gate. It verifies:

- all seven canonical tables exist in the migration;
- six-move bounds are present;
- probability/confidence/accuracy bounds are present;
- alternative branches are supported;
- evidence, assumptions, and outcomes are persisted;
- simulation-child cascade ownership exists;
- no send/post execution tables exist;
- no existing RedDirt campaign tables are altered by this migration.

Run locally from the RedDirt root with:

`npx tsx scripts/test-decision-simulation-persistence.ts`

Then run the normal RedDirt typecheck/build gates before migration deployment.

## Migration Safety

This commit adds the migration file but does **not** claim that it has been deployed to the live RedDirt database. Database deployment remains an explicit operator/environment step using RedDirt's existing Prisma migration process and `DIRECT_URL` conventions.

## Next Phase

**Phase 3 — OpenAI Intelligence Layer**

Build the structured AI runtime that accepts the initial move plus context/evidence and returns a validated seven-node expected path with alternative counterpart branches, probabilities/confidence, threat/opportunity labels, assumptions, and concise rationale summaries. The OpenAI API key must remain server-side, and the first runtime remains advisory-only with no send/post capability.
