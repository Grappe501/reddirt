# Campaign Strategic Intelligence Engine

**Path:** `src/lib/agents/campaign-intelligence/strategic-intelligence-engine.ts`

Deterministic V1 strategic assessment from ledger snapshot + tenant priorities:

- Momentum score (0–100)
- Pacing health, schedule sustainability, candidate overload risk
- County engagement gaps
- Strategic opportunities and gaps (persuasion, coalition, field, schedule)
- Executive narrative for command center

**Human-safe:** advisory only; no opponent claims; no autonomous scheduling changes.

**Observations:** `campaign_momentum_changed`, `candidate_overload_detected`, `strategic_gap_detected`, `county_under_engaged`
