# Operator Cognitive Load System

**Sprint 9** — advisory overload detection for Campaign OS dashboards.

## Signals

| Signal | Detection |
|--------|-----------|
| Panel overload | ≥10 visible panels |
| Warning flood | ≥5 concurrent warnings |
| Route bounce | ≥3 `user_returned_to_same_page` observations |
| Abandoned flow | ≥2 `abandoned_flow` / `flow_abandoned` |
| Overwhelm | `operator_overwhelm_detected` observations |
| Search friction | ≥2 `no_results_search` |

## Response (V1)

- `calmModeRecommended` when score ≥ 55
- Adaptive dashboard collapses `automation_scaffolds` and de-emphasizes calendar health
- Executive summary recommends progressive disclosure

## Implementation

`src/lib/dashboard-orchestration/operator-cognitive-load-analyzer.ts`

## Observations

`operator_overwhelm_detected`, `dashboard_card_collapsed`, `operator_focus_mode_entered`
