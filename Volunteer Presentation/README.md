# Volunteer Leadership Kickoff Presentation

Guided one-hour presentation + signup experience for the Statewide Volunteer Leadership Kickoff.

**Live route (RedDirt app):** `/volunteer-kickoff`

## Modes

- **Presenter** — full-screen friendly, Back/Next, arrow keys, swipe
- **Follow-along** — same pages for attendees on phones (`?mode=follow`)

## Sign-up pathways

- `/volunteer-kickoff/join/local`
- `/volunteer-kickoff/join/campaign`
- `/volunteer-kickoff/join/youth`
- `/volunteer-kickoff/join/match`

Submissions use `formType: volunteer_kickoff` via `/api/forms` → WorkflowIntake with `teamCategory` metadata for operator review/export.
