# Candidate dashboard preflight

Run before sending the V3 cockpit to Kelly:

```bash
npm run agent:preflight
```

The script writes:

```text
data/agent/candidate-dashboard-preflight-latest.json
```

## What It Checks

- Candidate dashboard routes: Kelly cockpit, Week View, GOTV, Field Ops, Build Status, `/commit`
- Data presence: calendar items, weekend routes, win target scenario, GOTV allocation, volunteer capacity, capabilities ledger, automation queue
- AI readiness: OpenAI key presence, deterministic fallback posture, schedule settlement endpoint, Kelly tool files
- Persistence: DB-backed warning state, staged JSON actions, cockpit table availability, no send / no Google writes from this slice
- Kelly usability: schedule readiness, decisions needed tonight, route risks, staff calls, staged vs ready features

## Result Meaning

- **Green:** ready for Kelly decisions.
- **Yellow:** usable as a Kelly preview, with staff narration of staged/blocked features.
- **Red:** do not send yet; resolve blockers first.

The preflight does **not** send SMS/email, write Google Calendar, publish public content, or build voter-level targeting lists.

## Current DB Status

The previous Prisma migration blocker is cleared. The repaired migration `20260518210000_kelly_calendar_cockpit` has been applied, and the cockpit tables are live:

- `CalendarAlert`
- `KellyCalendarDecision`
- `KellyCalendarPromotion`
- `LocalCoverageRequest`

The Kelly Google calendar enum labels are also live:

- `KELLY_GOOGLE_TENTATIVE`
- `KELLY_GOOGLE_CONFIRMED`

## Current Remaining Warnings

Yellow preflight after the repair should mean operational readiness work remains, not that the cockpit migration is failed. Expected remaining warnings are:

- Current schedule conflicts that staff must settle.
- Staged calendar JSON still needs promotion to `CampaignEvent`.
- Google anchor/source setup is not yet verified.
- Google Tentative/Confirmed sync smoke is not yet complete.
- Duplicate row checks must pass after DB promotion and Google sync.
