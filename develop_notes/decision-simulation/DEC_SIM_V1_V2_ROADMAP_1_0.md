# Decision Simulator — V1 / V2 Roadmap 1.0

**Status:** Canonical from 2026-09-09  
**Live product:** https://dec-sim.netlify.app  
**Parent plan:** `DECISION_SIMULATION_MASTER_BUILD_PLAN_1_0.md`  
**Doctrine unchanged:** advisory only; no send; no post; evidence separated from inference; generated language labeled generated.

V1 is no longer a theoretical sequence. We are learning from a live product while we finish the dependable operating system.

Capture V2 requirements in this file as they appear. Do not implement V2 surfaces that steal a remaining V1 phase.

## Two products, one spine

| Horizon | Job | Feel |
|---|---|---|
| **V1** | Finish the dependable operating system | One operator can ingest a real move, simulate six moves across researched actors, branch futures, attach what actually happened, and trust the machine not to invent, send, or silently rewrite itself |
| **V2** | Decision-intelligence machine | A war room of strategists, researchers, editors, behavioral analysts, historians, red-teamers, and scenario planners working at once, every conclusion traceable to evidence and prior outcomes |

V2 is not “Decision Simulator with more buttons.”

## Canonical V1 phase status

We are still in **Phase 5**. Burt pulled forward pieces of Phases 7, 9, and 12 because the product had to be real. That is useful. It does not close those phases.

| Phase | Original job | Status now | What is actually live |
|---|---|---|---|
| 1 Architecture / Doctrine | Sequence, no-send, contracts | **Essentially complete** | Doctrine, typed contracts, sequence validator |
| 2 Persistence | Auditable simulation records | **Largely complete** | Sessions, ensembles, chunks, job state. Branch / outcome / evaluation tables exist ahead of the loops that fill them |
| 3 OpenAI intelligence | Structured six-move generation | **Functional** | Server-side OpenAI, structured output, retries, token accounting |
| 4 Actor / personality | Versioned researched models | **Substantially built** | Research models for Jones / Hill, open catalog, custom hypothesis personalities, OBSERVED / INFERRED / HYPOTHESIS tags |
| 5 Ensemble / six-move execution | Primary line + ensemble | **Current phase** | Live 1–10, queued 100 / 1,000, cost gates, seeded personality variation, cancel / retry, Netlify worker, NASA dashboard |
| 6 Correspondence intake | Rich paste-first channels | **Started, thin** | Channel enum and paste box. No connectors, no attachment intelligence |
| 7 Decision dashboard | Operator command surface | **Preview pulled forward** | Mission-lab UI, depth, cost, progress, aggregate command center. Missing branch explorer, scorecard, compare-openings, outcome capture |
| 8 Alternative Futures | Branching scenario lanes | **Next V1 intelligence jump** | Representative cards exist as labels. Runs are still mostly linear variations of one path |
| 9 Memory & evidence | Provenance-backed recall | **Scaffold only** | Source links on researched personalities. No evidence graph, no stale-evidence decay, no prior-sim retrieval |
| 10 Outcome learning | Prediction vs reality | **Not started** | Custom notes can be attached locally. No observed-outcome writeback |
| 11 Cross-channel command | Same engine, many surfaces | **Not started** | Isolated `dec-sim` product. Must stay separate from Kelly send workflows |
| 12 Hardening & launch | Production OS | **Partial, pulled forward** | Admin gate, rate limit, cost budget, isolation tests, hosted deploy. Remaining: RBAC, audit, privacy review, injection defenses, runbook, closed-tab worker continuity |

## What Phase 5 still owes

Phase 5 is more sophisticated than originally planned. It is not finished until a 1,000-run job is **informative**, not merely 1,000 slightly different linear conversations.

**Next V1 slice (pulled-forward Phase 8, still charged to Phase 5 close):** Alternative Futures.

Required lanes:

1. Expected / median
2. Hostile
3. Opportunity / best-case
4. Unusual but plausible
5. Escalation

Each lane must be a first-class branch type with its own assumptions, confidence, and evidence tags. The command center then reports consensus **and** disagreement across lanes. That is the gate that makes 100 / 1,000 runs worth the spend.

Do not start V2 clustering, entropy dashboards, or multi-actor game trees in that slice.

## Remaining V1 spine (after Alternative Futures)

Execute in this order. Do not reorder to chase V2.

1. **Phase 6 — richer correspondence intake.** Paste-first remains the rule. Add structure per channel (email headers, speech excerpt, debate line, memo). No mailbox connectors until the core simulator is stable.
2. **Phase 7 — dashboard intelligence.** Six-move visual sequence, branch explorer, scorecard, recommended opening revision, save / duplicate / rerun, actual-outcome capture. Keep the NASA lab. Do not turn it into a campaign site.
3. **Phase 9 — evidence / memory.** Provenance on every evidence-backed claim. Prior correspondence and public statements as operator-attached sources. Missing evidence stays missing.
4. **Phase 10 — observed-outcome learning.** After something is actually sent or said by a human, attach the real response. Compare to predicted branch. Version actor models only with operator approval. No silent prompt drift.
5. **Phase 11 — cross-channel command center.** Same engine on email, text, social, press, debate, fundraising, and internal strategy. Simulation never sends.
6. **Phase 12 — production hardening.** Closed-tab worker continuity, RBAC, audit log, privacy review, prompt-injection defenses, operator runbook, production readiness review.

Phase 4 remains open for additional researched personalities. Adding a personality is a catalog update, not a V2 digital twin.

## V1 done when

An operator can:

- paste a real opening move
- select researched Party and Counterparty models
- run expected / hostile / opportunity / unusual / escalation futures
- see why the system prefers one counter
- attach what actually happened
- export or rerun without the system sending anything
- trust that unknown evidence was not invented

Until that is true, we are still in V1.

## V2 shadow roadmap

Design against these requirements. File new V2 ideas under the matching number. Do not build them during a V1 slice unless Steve names an explicit V2 packet.

### V2-1 Personal Voice Engine

Ingest previous emails, speeches, social posts, memos, long-form writing, interviews, transcripts, and approved correspondence.

Separate fingerprints for vocabulary, sentence rhythm, paragraph length, humor, aggression, empathy, formality, rhetorical structures, favorite transitions, framing habits, phrases to avoid, and channel-specific differences.

The question is not only “what should Steve write?” It is “what would Steve plausibly write at his best?”

Controls: `Natural Steve`, `Sharper`, `More Diplomatic`, `More Concise`, `Speech Steve`, `Email Steve`.

Original writing remains source material. Generated language is clearly identified as generated.

### V2-2 Deep Actor Digital Twins

Move past static personality cards into versioned behavioral models built from speeches, interviews, votes, posts, press releases, debates, reactions under pressure, allies, incentives, constraints, recurring frames, contradictions, and observed behavior after past attacks.

Every weight stays OBSERVED / INFERRED / HYPOTHESIS. Confidence decays as evidence gets stale.

V1 Jones / Hill research models are the seed, not the twin.

### V2-3 Multi-Actor Game Theory

V1 is us versus them. V2 is an ecosystem: opponent, allies, press, donors, party leadership, validators, activists, institutions, and broader audiences can all react to the same move.

One action triggers simultaneous response trees, second-order consequences, coalition shifts, and indirect effects.

### V2-4 Massive Ensemble Intelligence

Do not display 1,000 transcripts. Turn them into decision science: clustering, consensus, minority scenarios, entropy / uncertainty, branch convergence, sensitivity analysis, tail risks, modal outcomes, inflection points, and “what assumption changes the answer?”

V1 Alternative Futures is the prerequisite, not this layer.

### V2-5 Counterfactual Laboratory

Compare opening strategies side by side on the same simulation population: original draft vs AI revision vs silence vs delayed response vs private outreach vs aggressive attack vs third-party validation.

Rank robustness, not just average performance.

V1 compare-three-openings (original / revised / alternative) is the thin predecessor.

### V2-6 Strategic Red Team

Dedicated adversarial agents try to destroy every proposed move: strongest attack, misinterpretation risk, screenshot risk, opposition-research vulnerability, headline risk, contradiction with prior statements, escalation trap, unintended constituency reaction, and what happens if private correspondence becomes public.

### V2-7 Evidence-Grounded Intelligence Graph

Every actor, claim, issue, vote, quote, message, relationship, event, response, simulation, and outcome is connected.

Clicking a recommendation reveals why the system believes it, what evidence supports it, what contradicts it, how fresh that evidence is, and where the system is guessing.

### V2-8 Outcome Learning and Calibration

After something is actually sent or said, attach the real response. Compare prediction versus reality. Learn which actor models and frames were accurate. Recalibrate probabilities. Identify systematic misses. Decay stale evidence. Promote only operator-approved model versions.

V1 Phase 10 is the attach-and-compare loop. V2-8 is the calibration machine.

## Boundary rules (agents)

1. If a request improves Alternative Futures, intake, dashboard intelligence, evidence, outcome attach, or hardening — it is V1.
2. If a request needs voice fingerprints, digital twins, multi-actor trees, clustering/entropy, counterfactual ranking, dedicated red-team agents, or a clickable evidence graph — write it here as V2 and keep building V1.
3. Do not import Kelly voter-file, send workflows, or campaign homepage chrome into `dec-sim`.
4. Do not treat ensemble output as new evidence about a real person.
5. No unsourced opponent claims. Campaign-arm characterizations are not an actor’s voice.
6. When Steve or Burt names a new V2 requirement, append it under the matching V2 number or add `V2-9+` here. Do not open a second roadmap file.

## Next operator click

Stay on Phase 5. Next named slice: **Alternative Futures**.
