# RedDirt Decision Simulation Engine — Master Build Plan 1.0

**Status:** Canonical architecture / active build. Live-product status and V1/V2 split: `DEC_SIM_V1_V2_ROADMAP_1_0.md`.  
**Repository:** `Grappe501/reddirt`  
**Product boundary:** Internal RedDirt strategic-analysis capability  
**AI provider:** OpenAI through server-side credentials only  
**Execution posture:** Advisory only; never autonomously sends correspondence

## Product North Star

The Decision Simulation Engine turns a proposed communication or strategic move into a six-move adversarial simulation. It is designed to help an operator think beyond the immediate message by modeling plausible responses, counters, escalations, reframes, risks, and opportunities before acting.

The core question is not merely **“Is this a good message?”** It is:

> **“If I make this move, what are the most plausible next six moves, what assumptions drive those predictions, where is the risk, and what alternative opening move produces a better decision path?”**

The engine is a decision-support system, not a claim that the future can be predicted with certainty.

## Canonical Move Sequence

Every primary simulation contains seven nodes: the operator opening move plus six forecast/counter moves.

0. **My Move** — operator-proposed communication or decision.
1. **Their Response** — most plausible response to My Move.
2. **My Response** — recommended response to Move 1.
3. **Their Response** — most plausible response to Move 2.
4. **My Response** — recommended response to Move 3.
5. **Their Response** — most plausible response to Move 4.
6. **My Response** — recommended response to Move 5.

The UI should call this a **Six-Move Simulation** even though the opening move is also displayed.

## Required Simulation Doctrine

1. **No false certainty.** Forecasts are scenarios, not facts.
2. **Multiple plausible futures.** The primary line may be accompanied by alternate branches.
3. **Assumptions visible.** Every meaningful forecast exposes the assumptions supporting it.
4. **Evidence separated from inference.** Known facts, historical behavior, operator doctrine, and AI inference must remain distinguishable.
5. **Confidence is calibrated language, not manufactured precision.** Numeric probability is optional and must be labeled as model-estimated when used.
6. **Opponent modeling is versioned.** Actor profiles change as real-world responses are observed.
7. **Outcome learning is explicit.** Predicted responses can later be compared with actual responses.
8. **No autonomous communication.** The engine drafts and analyzes; it does not send email, SMS, social posts, press statements, or other outbound communication.
9. **No hidden chain-of-thought storage.** Persist structured rationale, assumptions, evidence references, scores, and concise explanations only.
10. **Human operator remains final authority.** Recommendations are advisory.

## Twelve Master Phases

### Phase 1 — Architecture & Doctrine

- Lock canonical six-move sequence.
- Define simulation terminology and confidence rules.
- Define advisory-only/no-send boundary.
- Reuse RedDirt agent, intelligence, evidence, and communications infrastructure where possible.
- Establish a dedicated `decision-simulation` code and documentation domain.

**Acceptance gate:** master plan, doctrine, typed contracts, and deterministic sequence validator exist in GitHub.

### Phase 2 — Database & Simulation Schema

Create durable records for:

- simulation sessions
- opening moves
- simulated moves
- alternate branches
- actors / actor snapshots
- assumptions
- evidence references
- scoring / confidence
- model + prompt versions
- actual observed outcomes
- prediction-vs-outcome evaluations

Database truth should be append-friendly and auditable. Historical simulations must remain reproducible even after actor profiles or prompts evolve.

### Phase 3 — OpenAI Intelligence Layer

- Server-side OpenAI client abstraction.
- Versioned prompt registry.
- Strict structured-output schema.
- Retry and malformed-output handling.
- Token/cost accounting.
- Model configuration.
- Uncertainty requirements.
- Evidence-grounding hooks.
- Explicit no-send controls.

### Phase 4 — Actor / Counterparty Modeling

Actor profiles should support:

- person, campaign, organization, media outlet, stakeholder group, generic audience
- known public positions
- recurring frames and vocabulary
- prior responses
- escalation tendencies
- vulnerabilities and sensitivities
- likely goals
- communication channels
- source/evidence references
- model-generated hypotheses clearly labeled as hypotheses

### Phase 5 — Six-Move Chess Engine

Build the recursive/orchestrated core that produces the primary seven-node line and validates:

- correct side alternation
- dependency on prior move
- no skipped turns
- move-specific objective
- predicted frame
- response text
- rationale summary
- risks
- opportunities
- assumptions
- confidence
- evidence references

### Phase 6 — Correspondence Intake

Support operator input for:

- email
- social media
- text / SMS
- press statement
- public statement
- fundraising copy
- debate answer
- speech excerpt
- memo
- strategic decision
- custom freeform move

Initial implementation is paste-first. Connector ingestion can follow after the core simulator is stable.

### Phase 7 — Decision Dashboard

Primary dashboard surfaces:

- opening move editor
- actor selector
- objective selector
- stakes / urgency
- six-move visual sequence
- branch explorer
- risk score
- opportunity score
- confidence / uncertainty
- assumptions
- evidence drawer
- recommended opening revision
- compare scenarios
- save / duplicate / rerun
- actual-outcome capture

### Phase 8 — Alternative Futures Engine

Generate scenario lanes instead of a single deterministic future:

- expected response
- hostile response
- conciliatory / low-conflict response
- unexpected reframe
- silence / no-response when plausible

The operator can compare which opening move is robust across several futures.

### Phase 9 — Memory & Evidence System

Use approved RedDirt knowledge sources such as:

- prior correspondence
- public statements
- opposition research
- voting records
- campaign doctrine
- issue research
- historical media coverage
- previous simulations
- observed outcomes

Every evidence-backed claim should preserve provenance. Missing evidence remains missing.

### Phase 10 — Outcome Learning Loop

After a real response occurs:

- record observed response
- map it to predicted branch if applicable
- score direction/frame/content similarity
- record important misses
- update actor-model evidence
- track model/prompt accuracy over time

Do not silently self-modify prompts or doctrine. Learning signals inform versioned operator-approved changes.

### Phase 11 — Cross-Channel Command Center

Integrate the simulator into RedDirt correspondence and strategy surfaces so the same engine can analyze email, text, social, press, debate, fundraising, coalition, stakeholder, and internal strategic moves.

The simulator remains separate from send execution. A future operator may move approved copy into a send workflow, but simulation itself never sends.

### Phase 12 — Hardening, Audit & Production Launch

- RBAC
- audit logging
- privacy review
- prompt-injection defenses
- rate limits
- cost controls
- model fallback behavior
- database migration gates
- typecheck/build/test suite
- operator runbook
- analytics
- production readiness review

## Core Output Contract

Every simulated move should ultimately include:

- `moveNumber`
- `side` (`OPERATOR` or `COUNTERPARTY`)
- `kind` (`OPENING`, `PREDICTED_RESPONSE`, `RECOMMENDED_RESPONSE`)
- `actorId` / actor snapshot where relevant
- `message`
- `objective`
- `predictedFrame`
- `rationaleSummary`
- `risks[]`
- `opportunities[]`
- `assumptions[]`
- `evidenceRefs[]`
- `confidence`
- `modelVersion`
- `promptVersion`

## Primary Simulation Scorecard

A completed run should eventually score:

- objective advancement
- vulnerability created
- escalation risk
- credibility risk
- message clarity
- strategic optionality
- robustness across alternate futures
- evidence quality
- uncertainty

Scores are decision aids, not facts.

## Recommended Opening-Move Comparison

A flagship feature will allow the operator to compare:

1. **Original opening move**
2. **AI-revised opening move**
3. **Alternative strategic opening**

Each receives its own six-move simulation. The system then compares which opening is more robust across expected and hostile response lanes.

## RedDirt Integration Rules

- Reuse existing RedDirt campaign-intelligence, orchestration, evidence, agent-runtime, and communications primitives instead of duplicating them.
- Keep the new domain modular under `src/lib/agents/decision-simulation/` initially.
- UI routes are added only after engine contracts are stable.
- Database migrations require a dedicated Phase 2 migration pass.
- OpenAI credentials remain server-side and are never exposed to browser code.
- No autonomous send or public-post behavior is introduced.

## Phase 1 Build Slice

`DECISION-SIM-PHASE-1-FOUNDATION-1.0`

Deliverables:

1. Master plan.
2. Type-safe canonical move model.
3. Six-move sequence builder.
4. Sequence validation.
5. Doctrine constants / system boundaries.
6. Test harness in a follow-up implementation pass after repository test patterns are inspected.

## Overall Build Progress

Updated 2026-09-09 from the live `dec-sim` product. Detail: `DEC_SIM_V1_V2_ROADMAP_1_0.md`.

- Phase 1 Architecture & Doctrine: **essentially complete**
- Phase 2 Database & Schema: **largely complete**
- Phase 3 OpenAI Intelligence: **functional**
- Phase 4 Actor Modeling: **substantially built** (research catalog live; not V2 digital twins)
- Phase 5 Six-Move Engine: **open / current** (queued ensembles and writing packets are capabilities; Alternative Futures still missing; phase not closed)
- Phase 6 Correspondence Intake: **started, thin**
- Phase 7 Decision Dashboard: **preview capability pulled forward** (not closed)
- Phase 8 Alternative Futures: **next V1 slice `DEC-SIM-ALTERNATIVE-FUTURES-1.0`**
- Phase 9 Memory & Evidence: **scaffold only**
- Phase 10 Outcome Learning: **not started**
- Phase 11 Cross-Channel Command Center: **not started**
- Phase 12 Hardening & Launch: **partial, pulled forward**

V2 (voice engine, digital twins, multi-actor game theory, ensemble decision science, counterfactual lab, strategic red team, evidence graph, calibration machine) is a shadow roadmap only. Do not derail remaining V1 phases.

## Next Build

Phase 5 remains open. Next named slice: `DEC-SIM-ALTERNATIVE-FUTURES-1.0` — expected, hostile, opportunity, escalation, surprise, and silence/non-response. Measure robustness across futures, not likelihood inside one linear path. Then resume the V1 spine.
