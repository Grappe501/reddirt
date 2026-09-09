# Decision Simulation Engine — Scale Architecture 1.0

**Status:** Canonical scale architecture  
**Dashboard launch target:** 1–1,000 runs per ensemble request  
**Design ceiling:** 1,000,000 runs per ensemble request  
**Execution posture:** Advisory-only; no autonomous send/post execution

## Product Requirement

The operator can choose how many independent simulations to run against the same strategic opening. The initial dashboard presents first-class presets:

- 1 run
- 10 runs
- 100 runs
- 1,000 runs

The backend accepts an explicit integer from 1 through 1,000,000 so future hardware, worker, API-rate, and budget increases do not require redesigning the decision-simulation domain.

## What Multiple Runs Mean

A 1,000-run request is not the same model answer repeated 1,000 times. Each member run is an independent scenario sample under a controlled seed/variation policy. The ensemble layer aggregates the resulting strategic futures so the dashboard can show distribution rather than false certainty.

Primary aggregate questions include:

- What first counterparty response/frame appeared most often?
- What hostile response appeared frequently enough to matter?
- Which recommended operator counter was most stable across runs?
- How wide is the response distribution?
- Where does model confidence concentrate or break down?
- What threat and opportunity patterns recur?
- Which outcomes are rare but strategically dangerous?

## Execution Tiers

### Inline — 1 to 10 runs

Small workloads may execute within an interactive request where platform/runtime limits permit. Default concurrency remains deliberately small.

### Queued — 11 to 1,000 runs

These become background-style server jobs from the application's perspective: the request creates an ensemble, work is chunked, workers claim members, progress is persisted, partial aggregates can update, failures can retry, and the browser polls/subscribes for progress. The application must not keep one HTTP request open for the entire ensemble.

### Distributed — above 1,000 through 1,000,000 runs

Large ensembles require independently executable chunks and horizontally scalable workers. More processors/worker instances increase throughput, but compute is only one limit. Model-provider rate limits, token throughput, API quotas, database write throughput, network limits, and monetary budget must all be governed independently.

A million-run design must therefore support:

- durable queue semantics;
- idempotent member execution;
- worker leases/claims;
- bounded concurrency;
- retry with attempt ceilings;
- cancellation;
- checkpointed progress;
- partial aggregation;
- compact aggregate storage;
- optional sampling/retention of individual runs;
- model/prompt/doctrine version pinning;
- cost/token budgets before execution;
- provider-rate backoff;
- resumability after worker or deploy interruption.

## Persistence

`decision_simulation_ensemble` owns the requested workload and immutable input snapshot.

`decision_simulation_ensemble_member` represents one independently executable sample and optionally links to its full `decision_simulation_run` record.

`decision_simulation_ensemble_aggregate` stores compact distribution summaries so dashboards do not need to scan hundreds of thousands or millions of raw runs on every page load.

The migration enforces a requested-run range of 1..1,000,000.

## Retention Strategy

For small and medium ensembles, individual runs may be retained in full. At very large scale, retaining one million full seven-move model outputs can become unnecessarily expensive in database storage and query cost.

Default planning therefore allows full retention through 10,000 runs, while larger jobs may retain aggregates plus a statistically useful sample and explicitly important outlier runs. This threshold is a product/configuration decision, not a hard architectural limit.

## Dashboard Contract

The dashboard run selector should contain preset buttons for 1, 10, 100, and 1,000 plus an Advanced control for a custom count. Counts above the currently enabled production ceiling should display an infrastructure/budget warning rather than silently failing.

While an ensemble runs, show:

- requested / completed / failed counts;
- percentage complete;
- elapsed progress state;
- execution mode;
- current concurrency ceiling;
- estimated/actual token and cost information when available;
- cancel action;
- partial dominant frames/recommendations once sample size is meaningful.

When complete, the primary interface should lead with aggregated strategic intelligence, with individual runs available as drill-down evidence rather than presenting 1,000 nearly identical cards.

## Statistical Guardrail

Run frequency is a model-sampling distribution, not an objective probability of what a real person will do. Dashboard copy must distinguish:

- percentage of simulation runs in which a response occurred;
- model-estimated confidence;
- evidence strength;
- observed real-world outcome frequency once outcome data exists.

These are not interchangeable.

## Cost and Throughput Guardrail

The design ceiling of one million does not imply that one million OpenAI calls should be launched casually. Before large execution, the system must estimate expected calls, tokens, cost, provider throughput, and completion capacity and require an explicit operator action.

Future optimization can reduce LLM calls through deterministic branching, batched inference where supported, caching of shared context, cheaper model tiers for exploration, selective high-capability adjudication, and hierarchical sampling.

## Verification

Run:

`npx tsx scripts/test-decision-simulation-scale.ts`

The scale gate verifies dashboard presets, the one-million design ceiling, tier selection, chunking, and run-count boundaries.

## Build Impact

This requirement expands the original roadmap. Phase 4 actor modeling and Phase 5 six-move execution should be ensemble-aware from their first production implementation. The first Netlify preview can still launch after Phase 5 with 1–1,000 enabled. Distributed >1,000 execution can remain feature-gated until queue workers, quotas, budgets, and deployment infrastructure are proven.
