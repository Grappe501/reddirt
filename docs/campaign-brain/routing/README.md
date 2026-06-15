# Event Routing — FAIRS_AND_FESTIVALS_OPTIMIZER

> **Strategy scores the calendar.** Every fair, festival, chamber, faith, and civic event receives a Campaign Impact Score before it reaches Kelly's calendar.

---

## Outputs

| File | Purpose |
| ---- | ------- |
| [Master priority calendar](./master-priority-calendar.md) | Score-ranked events · date + assignment |
| [Kelly schedule](./kelly-schedule.md) | Kelly deployment recommendation |
| [Surrogate schedule](./surrogate-schedule.md) | Congressional + Senate routing |
| [County team schedule](./county-team-schedule.md) | Local visibility events |
| [County coverage index](./county-coverage-index.md) | 75-county visit tracking |
| [Uncovered county alerts](./uncovered-county-alerts.md) | Neglected counties |
| [Weekly opportunity ranking](./weekly-opportunity-ranking.md) | Top 25 this week |

---

## Field inputs

- [`data/campaign-brain/county-visit-log.json`](../../data/campaign-brain/county-visit-log.json) — manual visit log
- [`data/campaign-brain/event-outcomes.json`](../../data/campaign-brain/event-outcomes.json) — auto-merged attended events

```bash
npm run campaign-brain:optimizer:build
```
