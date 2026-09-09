# Decision Simulation Engine — Phase 4 Actor/Opponent Modeling Report

**Status:** Foundation built and committed  
**Repository:** `Grappe501/reddirt`  
**Scope:** Versioned actor models + ensemble variation layer  
**Execution posture:** Advisory-only; no autonomous send/post capability

## What Phase 4 Adds

The simulator can now model a counterparty as a versioned strategic actor instead of treating every opponent, reporter, organization, audience, or stakeholder as interchangeable.

An actor model separates:

- primary incentives;
- strategic constraints;
- preferred frames;
- attack lanes;
- defensive frames;
- escalation tendencies;
- de-escalation tendencies;
- communication style;
- likely audiences;
- uncertainty notes.

Every weighted signal is tagged as `OBSERVED`, `INFERRED`, or `HYPOTHESIS` and carries a confidence level. The runtime explicitly treats observed evidence as stronger than inference and inference as stronger than hypothesis.

## Ensemble-Aware Variation

A 1,000-run ensemble must not be 1,000 copies of one deterministic personality assumption. `actor-model.ts` and `actor-ensemble.ts` generate deterministic seeded variations across the same evidence-backed actor model.

Per-run variation can select different:

- primary response frame;
- attack lane;
- escalation tendency;
- aggressiveness;
- novelty;
- confidence modifier.

The same actor model + ensemble seed + run ordinal reproduces the same variation. This makes ensemble results auditable and allows an individual run to be reconstructed later.

The million-run architecture remains chunked/queued/distributed. Actor variation generation is deterministic and inexpensive, so it can occur inside workers without requiring an LLM call merely to decide which actor tendencies a run should emphasize.

## Persistence

Migration `20260908214500_decision_simulation_actor_models` adds:

1. `decision_simulation_actor_model_version`
2. `decision_simulation_actor_signal`
3. `decision_simulation_actor_variation`

Actor-model versions are immutable historical snapshots. Signals may link to governed evidence. Per-run variations may link to a simulation and ensemble job. No existing campaign table is altered.

## OpenAI Integration

`runDecisionSimulationOpenAi()` now accepts optional actor context. The prompt includes the actor model and, for ensemble execution, the selected per-run variation.

The model is told that actor tendencies are probabilistic guidance, not facts. The evidence-integrity boundary from Phase 3 remains unchanged: the model cannot invent citations or unsupported factual history.

## Verification

`scripts/test-decision-simulation-actor-model.ts` checks:

- model validation;
- 1,000 actor variations;
- deterministic seed reproducibility;
- multi-frame diversity;
- multi-attack-lane diversity;
- bounded variation controls;
- observed/inferred/hypothesis hierarchy;
- uncertainty-note propagation.

Run locally from the RedDirt root:

`npx tsx scripts/test-decision-simulation-actor-model.ts`

Then run RedDirt typecheck/build gates before migration deployment.

## Data Ethics Boundary

Actor profiles should model public strategic behavior and supplied campaign knowledge. They must not become private psychological dossiers or infer sensitive traits. Facts, observed public behavior, strategic inference, and hypotheses remain separate.

## Next Phase

**Phase 5 — Six-Move Engine / Ensemble Orchestration**

Connect actor variation, OpenAI execution, run-count planning, alternative futures, aggregation, cancellation/resume semantics, and the first complete request-to-result vertical slice. Phase 5 is the target gate before the first Netlify preview launch.
