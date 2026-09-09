# Decision Simulation Engine — Phase 5 Ensemble Orchestration Report

**Status:** Built and committed  
**Repository:** `Grappe501/reddirt`  
**Scope:** Ensemble execution, aggregation, representative paths, distributed chunk planning, resumable job state  
**Execution posture:** Advisory-only; no send/post automation

## What Phase 5 Adds

Phase 5 connects the previously separate scale, actor-model, and OpenAI layers into one ensemble execution domain.

The operator can request 1, 10, 100, 1,000, or any custom supported run count up to the design ceiling of 1,000,000. Each run receives a deterministic actor variation generated from the selected actor model and ensemble seed. The variation is injected into the OpenAI six-ply simulation context before execution.

For inline and queued-local sizes, `runDecisionSimulationEnsemble` executes runs with bounded concurrency and aggregates the results. For distributed sizes, the engine refuses to pretend a single synchronous process is appropriate and instead emits a deterministic chunk plan for external workers.

## Aggregates Produced

The ensemble result package includes:

- completed and failed run counts;
- dominant first-response frames;
- dominant final operator recommendations;
- average confidence / scenario probability;
- total input, output, and overall token usage;
- representative runs for median confidence, highest confidence, lowest confidence, and the most common first-response frame;
- individual run payloads when the retention policy permits.

## Million-Run Architecture

A 1,000,000-run request is planned as distributed chunks instead of one monolithic request. With the current default chunk size of 1,000, the plan produces 1,000 independently resumable chunks. Worker count, provider rate limits, token throughput, database capacity, and cost budgets can then scale independently.

The current orchestration intentionally throws if a caller tries to execute a distributed plan synchronously. A Phase 7+/production worker adapter must own actual distributed execution.

## Resumability

`job-state.ts` provides pure checkpoint and resume primitives for:

- PENDING / RUNNING / COMPLETE / FAILED chunks;
- aggregate job state;
- next-runnable chunk selection;
- attempts;
- completed/failed run totals;
- PARTIAL state after partial completion;
- cancellation preservation.

This keeps distributed execution restartable after a worker crash, provider error, or deployment restart.

## Verification

`scripts/test-decision-simulation-phase5-orchestration.ts` verifies without spending OpenAI tokens:

- 1 run plans as INLINE;
- 1,000 runs plan as QUEUED;
- 1,000,000 runs plan as DISTRIBUTED;
- one million runs produce 1,000 deterministic 1,000-run chunks;
- chunk boundaries cover run 1 through run 1,000,000;
- runnable chunk selection works;
- job state moves QUEUED → RUNNING → PARTIAL → COMPLETE.

Run locally:

`npx tsx scripts/test-decision-simulation-phase5-orchestration.ts`

Then execute RedDirt's standard typecheck/build gates.

## Netlify Preview Boundary

The engine is now at the agreed first-preview boundary. The next build should create a thin authenticated/admin dashboard and server API surface that exposes:

1. opening correspondence;
2. channel and objective;
3. operator and counterpart actor selection;
4. run-count presets 1 / 10 / 100 / 1,000 plus custom count;
5. execution mode and estimated workload preview;
6. Run Simulation action;
7. progress state;
8. aggregate result cards;
9. representative six-move paths;
10. explicit advisory-only / scenario-not-fact language.

Before the first Netlify preview is considered operational, configure `OPENAI_API_KEY` in Netlify server environment and prove the RedDirt database migration state. Do not put the key in NEXT_PUBLIC variables.

## Remaining Phase 5 Production Work

Phase 5 is functionally complete at the application-contract level. Production distributed execution still requires worker infrastructure, persisted queue claiming/leases, rate-limit backoff, cost-budget enforcement, and durable aggregate writes. Those are hardening/production tasks rather than blockers for the 1–1,000 run Netlify preview.
