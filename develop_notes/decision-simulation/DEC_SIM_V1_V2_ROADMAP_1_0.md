# Decision Simulator — V1 / V2 Roadmap 1.0

**Status:** Canonical from 2026-09-09. This is the **only** V2 shadow roadmap.  
**Live product:** https://dec-sim.netlify.app  
**Parent plan:** `DECISION_SIMULATION_MASTER_BUILD_PLAN_1_0.md`  
**Next V1 slice:** Phase 12 closed-tab worker continuity / hosted 100/1,000 proof. Phase 10 observed-outcome compare is a started capability, not a phase close.  
**Doctrine unchanged:** advisory only; no send; no post; evidence separated from inference; generated language labeled generated.

V1 is no longer a theoretical sequence. We are learning from a live product while we finish the dependable operating system.

Pulled-forward work is a **capability**, not a phase closure. A later-phase component existing early does not close that phase.

V2 discoveries are appended here only. They do not become implementation unless they directly prevent a V1 architectural dead end.

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
| 4 Actor / personality | Versioned researched models | **Substantially built** | Research models for Jones / Hill, open catalog, custom hypothesis personalities, OBSERVED / INFERRED / HYPOTHESIS tags. Writing-intelligence packets are a Phase 5 capability, not a Phase 4 or 9 close |
| 5 Ensemble / six-move execution | Primary line + ensemble | **Open / current** | Live 1–10, queued 100 / 1,000, cost gates, seeded personality variation, cancel / retry, Netlify worker, NASA dashboard, first-party writing packets, Alternative Futures lane assignment, Hill vote adapter (corpus not yet located), `DEC-SIM-ENSEMBLE-LANE-INTELLIGENCE-1.0` (within-lane n, modal share, typical sample). Not a phase close |
| 6 Correspondence intake | Rich paste-first channels | **Capability started** | `DEC-SIM-CORRESPONDENCE-INTAKE-1.0`: channel-specific paste parse (email headers, debate question, memo Re, speech venue). No connectors. No attachment intelligence |
| 7 Decision dashboard | Operator command surface | **Capability started** | `DEC-SIM-DASHBOARD-INTELLIGENCE-1.0`: six-move sequence, branch explorer, scorecard, hypothesis revision, local save/compare, outcome attach. Not a phase close |
| 8 Alternative Futures | Branching scenario lanes | **Capability started; not closed** | `DEC-SIM-ALTERNATIVE-FUTURES-1.0` assigns six named futures per run. Robustness is measured across futures. Hill legislative evidence attaches when the vote corpus is found |
| 9 Memory & evidence | Provenance-backed recall | **Capability started** | `DEC-SIM-CAMPAIGN-PRIORITIES-1.0`, `DEC-SIM-MEDIA-RESEARCH-1.0`, and `DEC-SIM-EVIDENCE-PROVENANCE-1.0` (tagged claims + operator-attached prior letters). Still no evidence graph, stale-evidence decay, paid-archive completeness, or prior-sim retrieval |
| 10 Outcome learning | Prediction vs reality | **Capability started** | `DEC-SIM-OBSERVED-OUTCOME-1.0`: attach a public reply, compare frame/future/lexical overlap, store an unapplied model-change proposal. No prompt rewrite. No DB outcome row yet |
| 11 Cross-channel command | Same engine, many surfaces | **Not started** | Isolated `dec-sim` product. Must stay separate from Kelly send workflows |
| 12 Hardening & launch | Production OS | **Partial, pulled forward** | Admin gate, rate limit, cost budget, isolation tests, hosted deploy. Remaining: RBAC, audit, privacy review, injection defenses, runbook, closed-tab worker continuity |

## What Phase 5 still owes

Phase 5 is more sophisticated than originally planned. It is not finished until a 1,000-run job is **informative**, not merely 1,000 slightly different linear conversations.

**Named futures are assigned.** `DEC-SIM-ENSEMBLE-LANE-INTELLIGENCE-1.0` now reports within-lane n, modal share, and a typical sample. Remaining Phase 5 work is proving a hosted 100/1,000-run job is informative in production, plus closed-tab worker continuity (Phase 12). Dashboard intelligence is a Phase 7 capability started (`DEC-SIM-DASHBOARD-INTELLIGENCE-1.0`), not a Phase 5 close.

Required futures:

1. Expected / median
2. Hostile
3. Opportunity / best-case
4. Escalation
5. Surprise / unusual-but-plausible
6. Silence / non-response

Each future is a first-class branch type with its own assumptions, confidence, and evidence tags. The product question is **robustness across futures**, not likelihood inside one linear conversation.

Do not start V2 clustering, entropy dashboards, voice cloning, or multi-actor game trees in that slice.

## Remaining V1 spine (after Alternative Futures)

Execute in this order. Do not reorder to chase V2.

1. **Phase 6 — richer correspondence intake.** Paste-first remains the rule. Add structure per channel (email headers, speech excerpt, debate line, memo). No mailbox connectors until the core simulator is stable.
2. **Phase 7 — dashboard intelligence.** Capability started (`DEC-SIM-DASHBOARD-INTELLIGENCE-1.0`). Sequence, branches, scorecard, hypothesis revision, local save/compare, and outcome attach are live. Keep the NASA lab. Do not turn it into a campaign site.
3. **Phase 9 — evidence / memory.** Campaign-site priorities, media research, provenance-tagged claims, and operator-attached prior correspondence are started. Still no clickable graph, stale-evidence decay, or prior-sim retrieval. Missing stays missing.
4. **Phase 10 — observed-outcome learning.** Capability started (`DEC-SIM-OBSERVED-OUTCOME-1.0`). Compare and unapplied proposal are live. Remaining: persist to the ensemble job, operator-approved personality versioning. No silent prompt drift.
5. **Phase 11 — cross-channel command center.** Same engine on email, text, social, press, debate, fundraising, and internal strategy. Simulation never sends.
6. **Phase 12 — production hardening. Current named remainder.** Closed-tab worker continuity so a 100/1,000 job keeps moving after the tab closes. Then RBAC, audit log, privacy review, prompt-injection defenses, operator runbook, production readiness review.

Phase 4 remains open for additional researched personalities. Adding a personality is a catalog update, not a V2 digital twin.

## V1 done when

An operator can:

- paste a real opening move
- select researched Party and Counterparty models
- run expected / hostile / opportunity / escalation / surprise / silence futures
- see why the system prefers one counter
- attach what actually happened
- export or rerun without the system sending anything
- trust that unknown evidence was not invented

Until that is true, we are still in V1.

## Public-writing intelligence — what is V1 vs banked V2

Jones/Hill first-party ingest is a **Phase 5 capability**. Compact writing packets may strengthen actor simulations now.

Banked for V2, not this next slice:

- voice cloning / “write like Jones or Steve”
- temporal digital twins
- similarity scoring as a generator-grade authorship meter

Do not treat the 20/60 document corpus as Phase 9 memory/evidence closed.

## Burt pass report format

Every Burt / Cursor Decision Simulator pass ends with two separate sections:

### V1 advancement
What moved the dependable OS forward. Phase still open or closed. Named next V1 slice.

### V2 discoveries filed
New V2 requirements appended below. Not implemented unless they prevent a V1 dead end.

## V2 shadow roadmap

This file is the single canonical list. File new ideas under the matching number or add `V2-21+`. Do not open a second roadmap file. `DEC_SIM_V2_DECISION_INTELLIGENCE_OS_MASTER_PLAN.md` is a pointer only.

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

### V2-9 Temporal Personality Drift

Voice, issue, rhetoric, partisanship, and message-priority drift across time windows. V1 already stores four windows. Calibration-grade drift is V2.

### V2-10 Multi-channel Voice Models

Email vs speech vs newsletter vs Substack as separate models.

### V2-11 Narrative / Message Genome

Reusable frames, transitions, and phrases-to-avoid without storing copyrighted passages.

### V2-12 Relationship / Coalition Simulation

Second-order coalition shifts.

### V2-13 Media Reaction Simulation

Headline and screenshot risk as first-class branches.

### V2-14 Issue Battlefield Mapping

Coverage and confidence by issue: writings N, Pattern A 48% on housing, 39% coverage on direct attacks.

### V2-15 Strategic Memory

Prior simulations and observed outcomes as recall. No silent prompt rewrite.

### V2-16 Writing Similarity Scoring

Generator-grade voice / lexical / rhythm / structure / rhetoric / issue / channel scores. V1 has the contract only.

### V2-17 Source Ingestion / RAG

Query by actor, issue, and window against a runtime cache. V1 has ingest + derived JSON.

### V2-18 Decision Recommendation Ranking

Rank openings by robustness across futures, not average charm. Depends on Alternative Futures.

### V2-19 Assumption Sensitivity

Which assumption flips the recommendation.

### V2-20 Surprise / Black-Swan Exploration

Dedicated search for unusual and escalation futures, not leftover ensemble variance. Alternative Futures is the V1 prerequisite.

### V2-21 Voting-pattern embeddings

Vector embeddings over roll-call sequences. Not required for V1 Alternative Futures.

### V2-22 Issue-specific behavioral twins

Separate Hill twins per issue family. V1 keeps one compact legislative packet.

### V2-23 Legislative anomaly detection

Automatic rare-vote / coalition-break alerts. V1 outlier views are explicit filtered lists with roll-call ids.

### V2-24 Coalition network modeling

Who votes with Hill, against him, and when. Filed only.

### V2-25 Historical counterfactual voting

“If this bill were recast, how would the loaded record shift?” Not V1.

### V2-26 Predictive legislative behavior

Forecasting future floor votes. Forbidden as a V1 claim. Vote history remains non-deterministic evidence.

### V2-27 Clickable evidence graph

ACTOR → VOTE → BILL → ISSUE → PARTY/ADMIN POSITION → STATEMENT → NEWSLETTER → SIMULATION → OUTCOME. V1 only prepares typed edges. Do not implement the graph UI now.

### V2-28 Attachment and thread intelligence

OCR, forwarded chains, and multi-message thread graphs. Phase 6 stays paste-first text. Do not add mailbox connectors here.

### V2-29 Ranked opening compare-lab

Side-by-side robustness of two saved openings is V1. Ranking three or more openings, counterfactual “which opening wins,” and an interactive ply tree are V2. Do not implement here.

### V2-30 Clickable dashboard evidence graph

The Phase 7 drawer lists missing evidence in prose. A clickable ACTOR → VOTE → STATEMENT → SIMULATION → OUTCOME graph remains V2-27 / V2-30. Do not implement the graph UI now.

### V2-31 Continuous campaign-site crawler

A one-pass 2026-09-09 ingest of chrisjonesforcongress.com and electfrench.com is V1. Live change detection, full-site crawl, or automatic prompt rewrite when a page moves is V2. Do not implement a standing scraper here.

### V2-32 Paid archive and broadcast-transcript ingest

Lexis/Nexis, Democrat-Gazette full text, and television/radio transcripts are the rest of historic media. V1 keeps a first named-outlet pass with short excerpts. Do not buy or dump a copyrighted archive here.

### V2-33 Stale-evidence decay and prior-simulation retrieval

V1 tags each claim and lets an operator attach a prior letter. Automatic recency decay, retrieval of earlier simulation jobs as evidence, and a clickable graph remain V2. Do not implement a memory crawler here.

### V2-34 Full-tree clustering and entropy

V1 reports first-response modal share inside each named future. Clustering full six-move transcripts, entropy dashboards, minority-scenario maps, and “what assumption flips the tree” remain V2-4 / V2-34. Do not implement clustering here.

### V2-35 Outcome calibration machine

V1 attaches one public reply and compares it to the predicted branch. Multi-outcome calibration, embeddings, accuracy-over-time charts, and automatic personality promotion remain V2-8 / V2-35. Do not auto-apply a model change here.

## Boundary rules (agents)

1. If a request improves Alternative Futures, intake, dashboard intelligence, evidence, outcome attach, or hardening — it is V1.
2. If a request needs voice fingerprints, digital twins, multi-actor trees, clustering/entropy, counterfactual ranking, dedicated red-team agents, or a clickable evidence graph — write it here as V2 and keep building V1.
3. Do not import Kelly voter-file, send workflows, or campaign homepage chrome into `dec-sim`.
4. Do not treat ensemble output as new evidence about a real person.
5. No unsourced opponent claims. Campaign-arm characterizations are not an actor’s voice.
6. When Steve or Burt names a new V2 requirement, append it under the matching V2 number or add `V2-21+` here. Do not open a second roadmap file.
7. End every pass with **V1 advancement** and **V2 discoveries filed**.

## Next operator click

Phase 5 remains open. Alternative Futures, intake, dashboard intelligence, campaign-site priorities, media research, evidence provenance, ensemble-lane intelligence, and observed-outcome compare are capabilities, not phase closes. Named next V1 work is Phase 12 closed-tab worker continuity. Do not start V2-21+.
