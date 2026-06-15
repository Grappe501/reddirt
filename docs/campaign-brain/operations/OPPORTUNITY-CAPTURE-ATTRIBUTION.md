# Opportunity Capture Attribution (post-verification)

> **Build after Operation Calendar Truth.** One enhancement only — not a new architecture layer.

---

## Purpose

Connect field outcomes to the four-lane victory model so the Brain learns which events **advance the model** — not just which events score high.

---

## Per-event capture (already scaffolded)

Log in [`data/campaign-brain/event-outcomes.json`](../../data/campaign-brain/event-outcomes.json):

| Field | Lane impact |
| ----- | ----------- |
| New contacts | Lane 2 (reactivation pipeline) |
| Volunteer signups | Lane 1 / infrastructure |
| Registration forms completed | Lane 3 |
| Faith leaders engaged | Lane 4 / faith layer |
| Clerk relationship advanced | Lane 4 / SOS factor |
| Earned media generated | Lane 1 / visibility |
| Donations *(future)* | Lane 1 / fundraising |

Roll up to [`captured-progress.json`](../../data/campaign-brain/captured-progress.json) by county and cluster.

---

## Learning loop (operational)

1. Brain recommends event (predicted score)
2. Field executes
3. Log outcome
4. `npm run campaign-brain:build`
5. Review [`feedback-loops/event-learning.md`](../feedback-loops/event-learning.md)

---

## When to activate

Activate disciplined weekly logging when:

- Verified events ≥ 300
- Week candidates are being locked after leadership approval
- Guardrail violations trending toward 0

Until then: **Calendar Truth first.**
