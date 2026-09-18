# Wealth Builder Simulator — V2.5 Architecture Lock & V3 Handoff

**Status: V2.5 COMPLETE / V3 READY**  
**Architecture lock:** 2.5.0  
**Release proof:** `docs/V2_5_17_RELEASE_PROOF.md`

## What V2.5 established

Wealth Builder no longer depends on a single opaque stock-picking intelligence. The research organization is layered:

```
EVENT / RESEARCH REQUEST
        ↓
DATA & TRUTH (12)
        ↓
QUANT SPECIALISTS (14)
        ↓
OPPORTUNITY HUNTERS (12)
        ↓
BULL / BEAR / RED TEAM
        ↓
CONTROL: DATA QUALITY / OVERFITTING / COST / RISK
        ↓
STRATEGY DESKS (8 independent philosophies)
        ↓
COMMITTEE DIRECTORS (5)
        ↓
CHIEF STRATEGY (synthesis only)
        ↓
SIMULATION / OUTCOME
        ↓
AGENT ALPHA / CALIBRATION
        ↓
MARKET MEMORY / EVIDENCE GRAPH
```

The initial specialist registry contains 46 narrow agents. Strategy desks and directors are separate synthesis layers and are not counted as specialist agents.

## Locked invariants

V3 may extend these contracts but must not silently weaken them:

1. **Provenance first.** Conclusions must remain traceable to source evidence through immutable references.
2. **Point-in-time integrity.** Historical replay cannot consume evidence unavailable at the cutoff.
3. **Forward honesty.** Live Shadow research is frozen before outcomes and cannot be rewritten after the fact.
4. **Dissent survives.** Bull/Bear, desk and committee disagreement cannot be averaged away or hidden.
5. **Controls propagate.** A blocking control cannot be silently overridden by a desk, director or Chief Strategy.
6. **No fake certainty.** Evidence scores are not probabilities of profit. Statistical/calibrated probability requires an explicit valid calibration reference.
7. **Missing evidence is visible.** Degraded/unavailable evidence must not be replaced by invention.
8. **Agent Alpha does not self-promote.** Low-sample historical performance cannot automatically create authority.
9. **Compute is governed.** Expensive reasoning is escalation-triggered and budgeted.
10. **Chief Strategy is synthesis-only.** It has no independent factual research authority.
11. **Paper/research boundary.** V2.5 grants no real-money execution authority.
12. **Education remains inspectable.** Users must be able to drill from a conclusion into the reasoning, evidence, disagreement and invalidation conditions.

## Canonical V2.5 interfaces

- `agents/agent-registry.v1.json`
- `agents/schema/agent-research-packet.v1.schema.json`
- `agents/schema/evidence-graph.v1.json`
- `agents/data-truth-department.v1.json`
- `agents/quant-department.v1.json`
- `agents/opportunity-department.v1.json`
- `agents/adversarial-department.v1.json`
- `agents/control-department.v1.json`
- `agents/strategy-desks.v1.json`
- `agents/committee-directors.v1.json`
- `agents/chief-strategy.v1.json`
- `agents/agent-alpha.v1.json`
- `agents/orchestration.v1.json`
- `agents/historical-replay.v1.json`
- `agents/live-shadow.v1.json`

## V3 mission

Turn the proved architecture into a continuously operating, evidence-backed research laboratory.

V3 should emphasize **depth, real data adapters, durable storage, calibration, experiments and user comprehension** rather than adding agents merely to increase agent count.

## V3 proposed build sequence

### V3-01 — Durable Multi-Agent Research Store
Persist runs, snapshots, packets, graph nodes/edges, desk views, committee synthesis, Chief Strategy outputs, shadow observations and Agent Alpha outcomes.

### V3-02 — Real Source Adapter Layer
Connect production-grade market, filing, company, earnings, macro and event sources. Record source identity, retrieval timestamp, publication/as-of timestamp, version and freshness.

### V3-03 — Full Research Run Engine
Wire the existing isolated runtimes into one deterministic orchestration pipeline from event → frozen snapshot → specialists → controls → desks → committee → Chief Strategy.

### V3-04 — Evidence Graph Explorer
Make every conclusion visually traversable to its original evidence and every contradiction visible.

### V3-05 — Historical Replay Laboratory
Batch point-in-time experiments across symbols, regimes and horizons with leakage checks and reproducible experiment IDs.

### V3-06 — Forward Shadow Laboratory
Schedule paper-only research snapshots, freeze them, resolve outcomes later and build a growing forward-evidence corpus.

### V3-07 — Agent Alpha 2
Add calibrated scoring, baseline comparison, ablation experiments, regime stability, uncertainty intervals and minimum-evidence promotion gates.

### V3-08 — Strategy Tournament
Compare desks without collapsing them into one winner; measure which approaches contribute information under which conditions.

### V3-09 — Research Cost Intelligence
Measure API/model/data/compute cost per investigation and marginal information gained per dollar/compute unit.

### V3-10 — AI Provider Execution Layer
Introduce bounded reasoning-model calls only where interpretation/synthesis adds value. Require structured packets, citations/provenance, model/version metadata, timeouts, retries and deterministic fallbacks.

### V3-11 — Wealth Builder University Integration
Turn live research into inspectable lessons: explain indicators, disagreements, methods, math, evidence quality and uncertainty at GLANCE → EXPLAIN → LEARN → ADVANCED → RESEARCH → TRY depths.

### V3-12 — Production Research Command Center
Integrate Agent Intelligence, Market Memory, replay, shadow evidence, Agent Alpha and research-run controls into the primary user experience.

### V3-13 — V3 Hostile Audit
Attack provenance, leakage, model hallucination, prompt injection, stale feeds, calibration abuse, cost blindness, control bypass, persistence corruption and misleading UX.

### V3-14 — Production Proof & V4 Handoff
Clean CI, production deploy proof, live-source health proof, forward-shadow evidence proof, architecture lock and next-generation roadmap.

## Definition of V3 success

V3 is successful when a user can select a security, initiate or observe a research run, inspect exactly which agents participated and why, trace each material conclusion to point-in-time evidence, see disagreements and risk blocks, understand the explanation at their chosen educational depth, and later compare the frozen research against what actually happened.

That is a research and education system. It is not a guarantee of returns and it does not authorize automatic real-money trading.
