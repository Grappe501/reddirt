# Decision Simulator V2 — Decision Intelligence OS master plan

**Status:** Shadow architecture only. Do not implement this file as a build slice.  
**Parent:** `DEC_SIM_V1_V2_ROADMAP_1_0.md`  
**Live V1:** https://dec-sim.netlify.app

V2 should feel like a war room of strategists, researchers, editors, behavioral analysts, historians, red-teamers, and scenario planners working at once. Every conclusion stays traceable to evidence and prior outcomes.

Do NOT implement all of V2 now.

## What V1 must finish first

If these are missing, V2 will require a rewrite:

1. Alternative Futures branches (expected / hostile / opportunity / unusual / escalation)
2. Copyright-safe source contracts and first-party ingest (this slice)
3. Compact prompt packets instead of dumping source documents
4. Observed / inferred / hypothesis tags on every trait
5. Temporal windows and versioned models
6. Outcome attach (prediction vs reality) before calibration
7. Advisory-only / no-send boundary

## V2 holding architecture

### 1. Personal Voice Engine
Ingest approved first-party writing. Fingerprints for vocabulary, rhythm, structure, channel. Controls such as Natural Steve / Sharper / More Diplomatic. Generated language labeled generated.

**V1 today:** Jones/Hill fingerprints and similarity contract.

### 2. Deep Actor Digital Twins
Versioned behavioral models from speeches, votes, debates, reactions under pressure. Confidence decays as evidence ages.

**V1 today:** research personalities + writing intelligence. Not twins.

### 3. Multi-Actor Game Theory
Opponent, allies, press, donors, party, validators, activists, institutions.

**V1 today:** us vs them.

### 4. Massive Ensemble Intelligence
Clustering, entropy, tail risk, “what assumption changes the answer?”

**V1 today:** 100/1,000 queued runs and aggregate frames. Alternative Futures is the next prerequisite.

### 5. Counterfactual Laboratory
Same population, many openings: original, revised, silence, delay, private, attack, validator.

**V1 today:** one opening per job.

### 6. Strategic Red Team
Dedicated adversarial agents: screenshot risk, headline risk, contradiction, escalation trap, leak-if-public.

**V1 today:** hypothesis attack lanes only.

### 7. Evidence Intelligence Graph
Click a recommendation: support, contradiction, freshness, guess.

**V1 today:** source URLs and evidence ids on traits.

### 8. Outcome Calibration
After something is actually sent or said, compare prediction vs reality and recalibrate with operator approval.

**V1 today:** not started (Phase 10).

### 9. Temporal Personality Drift
Voice, issue, rhetoric, partisanship, message-priority drift.

**V1 today:** four windows and drift strings. Sparse 90-day dates.

### 10. Multi-channel Voice Models
Email Steve vs Speech Steve vs Newsletter Hill vs Substack Jones.

**V1 today:** sourceType field only.

### 11. Narrative / Message Genome
Reusable frames, transitions, phrases-to-avoid, without storing copyrighted passages.

**V1 today:** motif counts.

### 12. Relationship / Coalition Simulation
Second-order coalition shifts.

**V1 today:** none.

### 13. Media Reaction Simulation
Headline and screenshot risk as first-class branches.

**V1 today:** none.

### 14. Issue Battlefield Mapping
Coverage and confidence by issue: “73 writings, Pattern A 48% on housing, 39% coverage on direct attacks.”

**V1 today:** issue-voice shares. This is the extraordinary target.

### 15. Strategic Memory
Prior simulations and observed outcomes as recall, not silent prompt rewrite.

**V1 today:** job snapshots only.

### 16. Writing Similarity Scoring
voice / lexical / rhythm / structural / rhetorical / issue / channel similarity.

**V1 today:** contract and tests exist. No generator yet.

### 17. Source Ingestion / RAG
Runtime retrieval + cache outside git. Query by actor, issue, window.

**V1 today:** ingest script, derived JSON, H: cache path.

### 18. Decision Recommendation Ranking
Rank openings by robustness across futures, not average charm.

**Depends on:** Alternative Futures + counterfactual lab.

### 19. Assumption Sensitivity
Which assumption flips the recommendation.

**Depends on:** ensemble decision science.

### 20. Surprise / Black-Swan Exploration
Unusual-but-plausible and escalation as dedicated search, not leftover variance.

**Depends on:** Phase 5 Alternative Futures.

## Dependency rule

A V2 item may be specified here at any time. It may be built only when Steve names an explicit V2 packet. Default next work remains V1 Alternative Futures.
