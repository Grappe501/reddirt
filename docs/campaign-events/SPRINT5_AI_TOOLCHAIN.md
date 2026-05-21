# Sprint 5 AI toolchain — calendar promotion

**Lifecycle ID:** `sprint5_calendar_promotion`  
**Contracts:** `src/lib/campaign-events/calendar-promotion/sprint5-promotion-tools.ts`  
**Observations:** `record-promotion-observation.ts` → `factCard._aiObservations`

## V1 tools (15)

| ID | Status | Helper |
|----|--------|--------|
| promotion-readiness-checker | functional | `promotion-readiness.ts` |
| tentative-calendar-router | functional | `promotion-config.ts` + Kelly policy |
| official-calendar-router | functional | same |
| promotion-conflict-scanner | partial | readiness + row conflicts |
| google-payload-builder | functional | `build-google-payload.ts` |
| google-write-guard | functional | `promotion-config.ts` |
| promotion-audit-logger | functional | `promotion-audit.ts` |
| promotion-risk-summary-writer | partial | `sprint5-tool-helpers.ts` |
| promotion-retry-handler | partial | `promote-ledger-event.ts` |
| promotion-human-review-gate | functional | workbench UI + actions |
| duplicate-google-event-detector | partial | readiness heuristics |
| calendar-lane-health-checker | functional | `promotion-config.ts` |
| promotion-observation-recorder | functional | `record-promotion-observation.ts` |
| official-calendar-safety-blocker | functional | `sprint5-tool-helpers.ts` |
| google-write-status-summarizer | partial | workbench + dashboards |

## Observation events

`promotion_attempted`, `promotion_blocked`, `promotion_succeeded`, `promotion_failed`, `tentative_promoted`, `official_promoted`, `duplicate_detected`, `operator_overrode_warning`, `payload_edited`

## V2 path (not built)

- Live GCal overlap query for conflict scanner
- Signed operator attestations for official promote
- Auto-archive tentative copy on official promote
- Promotion funnel metrics dashboard

## UI

- AI command center → **Sprint 5 GCal** tab
- Promotion workbench payload AI summary line

See also [`AI_AGENT_TOOL_BUILD_MAP.md`](./AI_AGENT_TOOL_BUILD_MAP.md).
