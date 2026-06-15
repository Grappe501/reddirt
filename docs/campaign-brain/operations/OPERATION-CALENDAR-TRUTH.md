# Operation Calendar Truth

> **Execution phase.** No new architecture. Verify reality. Feed the Brain.

The campaign brain can only optimize what it knows. The highest-return investment is no longer strategy documents — it is **verified event data**, expanded coverage, and weekly field feedback.

---

## The question shifts

| Before | Now |
| ------ | --- |
| How many votes can we model? | **How many verified opportunities do we have?** |

---

## Campaign goal tracker

Live metrics: [calendar-truth-metrics.md](./calendar-truth-metrics.md) (refreshes on `npm run campaign-brain:build`)

| Metric | Goal |
| ------ | ---: |
| Verified events | 300+ |
| Tentative events | <50 |
| Missing dates | 0 |
| Counties covered | 75 |
| Guardrail violations | 0 |

---

## Verification War Room

Four teams. One sprint. Sole purpose: **verify dates and contacts**.

### Team A — County Fairs (75 counties)

**Verify all 75 county fairs.**

Capture per fair:

- [ ] Date confirmed
- [ ] Location / address
- [ ] Contact person (name · phone · email)
- [ ] Estimated attendance
- [ ] Vendor / booth deadline
- [ ] Sponsorship opportunities

Checklist: [war-room/team-a-county-fairs.md](./war-room/team-a-county-fairs.md)

---

### Team B — Festivals

Verify:

- [ ] Dates
- [ ] Attendance estimate
- [ ] Political participation rules
- [ ] Booth costs

Checklist: [war-room/team-b-festivals.md](./war-room/team-b-festivals.md)

---

### Team C — Faith Events

Verify:

- [ ] Minister alliances
- [ ] Community gatherings
- [ ] Associational meetings
- [ ] Special events

Checklist: [war-room/team-c-faith.md](./war-room/team-c-faith.md)

---

### Team D — County Clerks

Verify:

- [ ] ACCA / clerk conferences
- [ ] Trainings
- [ ] Regional meetings
- [ ] Election-related events

Checklist: [war-room/team-d-clerks.md](./war-room/team-d-clerks.md)

---

## Field workflow (all teams)

1. Confirm information from official source (fair board · church office · ACCA · chamber)
2. Log in [`data/campaign-brain/event-verification-overrides.json`](../../data/campaign-brain/event-verification-overrides.json)
3. Run `npm run campaign-brain:build`
4. Brain re-ranks by **effective score** (impact × verification confidence)

**Priority order:** Tier A counties first · Missing-date fairs · Guardrail violation counties

---

## Weekly rhythm (after war room)

| Day | Action |
| --- | ------ |
| Monday | Review [weekly brief](../weekly-brief/LATEST.md) + [guardrail alerts](../routing/no-county-left-behind-alerts.md) |
| Field week | Execute approved [week candidates](../phase-8/week-candidates/LATEST.md) |
| After each event | Log [`event-outcomes.json`](../../data/campaign-brain/event-outcomes.json) |
| After travel | Update [`county-visit-log.json`](../../data/campaign-brain/county-visit-log.json) |
| Friday | `npm run campaign-brain:build` — refresh metrics |

---

## After verification (one enhancement only)

**Opportunity Capture Attribution** — connect field outcomes to Lane 1–4:

- Contacts · volunteer signups · registrations
- Faith leaders met · clerk relationships · earned media · donations

Infrastructure exists in [`event-outcomes.json`](../../data/campaign-brain/event-outcomes.json) and [`captured-progress.json`](../../data/campaign-brain/captured-progress.json). Build this layer **after** Calendar Truth — not before.

---

## Exit criteria (lock Weeks 1–20)

Operation Calendar Truth is complete when **all** are met:

| Criterion | Required |
| --------- | -------- |
| Verified events | 300+ |
| County fairs verified | 75/75 |
| Tier A events verified | 100% |
| Guardrail violations | <10 |
| County contact owners | 75/75 ([`county-contact-owners.json`](../../data/campaign-brain/county-contact-owners.json)) |
| Weekly Brain update cadence | ≤7 days |

Live tracker: [governance/brain-health-dashboard.md](../governance/brain-health-dashboard.md)

**Until exit criteria are met:** week candidates require approval — do not auto-lock the 20-week calendar.

---

## What not to do

- Do not add planning layers
- Do not add scoring models
- Do not lock Weeks 1–20 until verified events ≥ 300 and guardrail violations = 0
- Do not treat tentative inventory as executable calendar

---

## Leadership brief

See [LEADERSHIP-BRIEF-EXECUTION-PHASE.md](./LEADERSHIP-BRIEF-EXECUTION-PHASE.md)
