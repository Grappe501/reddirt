# Event OS intake AI workflow (deterministic)

Sprint 2 inference is **not** a second LLM call at bridge time. It composes:

1. Public form fields
2. `runPublicSchedulingAssistant` output (already ran at submit)
3. `classifyCampaignEvent` on synthetic calendar item
4. Route miles estimate
5. Peer scan for duplicate/conflict (`assessIntakeDuplicateAndConflict`)

## Stored suggestions (`factCard._intake.inferred`)

| Field | Source |
|-------|--------|
| city, county, zipCode | form, assistant, address regex |
| eventTypeLabel | classifier |
| likelyTravel / likelyReimbursable | staff flag `travel_heavy`, miles ≥ 25, address |
| likelyHost | localHostAvailable + org/name |
| likelyVolunteersNeeded | audience size / event type |
| candidateSpeakingSlot | `speakingRequested` |
| missingFields | deterministic checklist |
| confidenceNotes | flexibility, assistant intakeStatus |

## Risk flags (non-blocking)

- `duplicateRisk` + `duplicateReasons`: title/date, city/date, host/date, similar notes
- `scheduleConflict` + `conflictReasons`: `detectEventConflicts` vs normalized + ledger peers

Intake is **never** auto-rejected.

## UI

- `IntakeAiSummaryCard` on `EventReviewModal` when `websiteIntake` meta present
- Workbench flags column
- Progressive disclosure: summary → details → inference list

## Catalog tools (see AI_AGENT_TOOL_BUILD_MAP)

- intake-to-ledger-bridge
- intake-duplicate-detector
- intake-conflict-detector
- tentative-event-router
- intake-summary-builder
- tentative-review-assistant
- website-intake-normalizer
- schedule-risk-scanner

Maturity: **functional** for bridge + inference + warnings; **scaffold** for full agent automation and GCal promotion.
