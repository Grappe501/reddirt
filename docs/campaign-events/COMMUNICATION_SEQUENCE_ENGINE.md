# Communication Sequence Engine

**Path:** `src/lib/communications/sequences/`

## Sequence types

Volunteer onboarding, host onboarding, event follow-up, county activation, Power of 5 recruitment, retention, leadership recruitment, team updates, candidate prep, hot wash follow-up, reimbursement reminders, training nudges, statewide briefing, communications escalation.

## APIs

- `buildCommunicationSequence(type, audience, countySlug?)`
- `getCadenceForSequence(type)`
- `detectSequenceRisks(seq)`
- `detectFollowupGaps(nodes)`
- `detectCommunicationFatigue(nodes)`

All steps have `humanReviewRequired: true`. No autonomous send.
