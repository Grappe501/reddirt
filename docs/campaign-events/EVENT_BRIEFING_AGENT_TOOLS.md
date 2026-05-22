# Event briefing agent tools (Sprint 6)

Lifecycle: `event_planning_sprint6` (15 contracts).

| Tool | Status | Writes |
|------|--------|--------|
| run-of-show-generator | functional | `_eventPlanning.runOfShow` |
| run-of-show-gap-detector | functional | — |
| materials-pack-list-generator | functional | `_eventPlanning.packList` |
| volunteer-need-estimator | functional | `_eventPlanning.volunteerPlan` |
| contact-gap-detector | functional | — |
| candidate-briefing-writer | functional | `_eventPlanning.candidateBrief` |
| campaign-manager-briefing-writer | functional | `_eventPlanning.cmBrief` |
| event-planning-readiness-scorer | functional | — |
| event-risk-scanner | functional | — |
| logistics-next-action-recommender | functional | — |
| house-meet-greet-planner | partial | — |
| speaking-event-planner | partial | — |
| fundraiser-event-planner | partial | — |
| outdoor-event-weather-risk-checker | functional | — |
| event-owner-assignment-helper | functional | — |

**Test:** `npm run campaign-events:test-planning-drilldown`
