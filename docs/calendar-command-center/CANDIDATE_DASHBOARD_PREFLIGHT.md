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
- Persistence: DB-backed warning state, staged JSON actions, no send / no Google writes from this slice
- Kelly usability: schedule readiness, decisions needed tonight, route risks, staff calls, staged vs ready features

## Result Meaning

- **Green:** ready for Kelly decisions.
- **Yellow:** usable as a Kelly preview, with staff narration of staged/blocked features.
- **Red:** do not send yet; resolve blockers first.

The preflight does **not** send SMS/email, write Google Calendar, publish public content, or build voter-level targeting lists.
