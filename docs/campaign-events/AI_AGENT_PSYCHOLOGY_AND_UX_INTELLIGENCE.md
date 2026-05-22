# AI Agent Psychology & UX Intelligence

**Path:** `src/lib/agents/campaign-intelligence/agent-psychology-intelligence.ts`

Studies observation patterns:

- Overwhelm, hesitation (`user_returned_to_same_page`, `no_results_search`)
- Abandonment (`abandoned_flow`)
- Fatigue (`operator_fatigue_detected`, cognitive load score)

**Outputs:** confidence level, UX adjustment list (collapse panels, executive mode, reentry links)

Coupled with Sprint 9 `operator-cognitive-load-analyzer` and Sprint 10 `operator-intelligence-v2` (`explanationDepth`: executive | standard | detailed).

**Goal:** Operator feels understood — stress reduction without removing human control.
