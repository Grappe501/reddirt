# Volunteer Training Layer

Registry: `src/lib/campaign-events/volunteers/volunteer-training-modules.ts` (17 modules).

Engine: `volunteer-training-engine.ts` builds per-volunteer paths from completed modules, skills, and `trainingNeeded`.

## Module categories

- **Onboarding:** campaign-basics, volunteer-code-of-conduct, data-privacy-rules
- **Message:** kelly-message
- **Event ops:** event-setup, check-in-table, literature-table, house-party-support, hot-wash-notes
- **Outreach:** canvassing-basics, phone-bank-basics, text-bank-basics (gated by comms readiness)
- **Organizing:** power-of-five, voter-registration-basics, county-organizing
- **Support:** social-media-sharing, receipt-upload-basics

## Completion

V1: operator marks complete in profile `trainingCompleted[]` (future: UI + observations `volunteer_training_completed`).

Prerequisites enforced in path builder — not blocking assignment in V1 (warning only when `trainedOnly`).
