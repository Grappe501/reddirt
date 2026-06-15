# Monday Leadership Rhythm

> Use the Brain to **focus discussion** — not generate more reports.

---

## Monday morning (60 minutes)

### Review (20 min)

Open these seven artifacts in order:

| # | Artifact | Question |
| - | -------- | -------- |
| 1 | [Four Lanes Dashboard](../strategic-plan/plurality-victory-plan/command-center/four-lanes-dashboard.md) | Are lanes on pace? |
| 1b | [Relationship Capital](../relational-organizing/relationship-capital-dashboard.md) | Are relationship assets building? |
| 2 | [Coverage Completion](../measurement/county-coverage-completion.md) | Planned vs completed contacts? |
| 3 | [Guardrail Alerts](../routing/no-county-left-behind-alerts.md) | Who is past 45 days? |
| 4 | [Top 25 Opportunities](../routing/weekly-opportunity-ranking.md) | Best effective scores this week? |
| 5 | [Verification Progress](../operations/calendar-truth-metrics.md) | Calendar Truth advancing? |
| 6 | [Captured Opportunity](../measurement/captured-opportunity.md) | Potential vs captured vs remaining? |
| 7 | [Scenario Movement](../scenario-engine/README.md) | Conservative / expected / aggressive shift? |

Also scan: [Brain Health Dashboard](./brain-health-dashboard.md)

---

### Discuss (25 min)

Answer three questions:

1. **What did we learn?** — Review [event learning](../feedback-loops/event-learning.md) if outcomes were logged
2. **What changed?** — Verification · coverage · capture since last Monday
3. **What are the three most important deployments this week?** — From [week candidates](../phase-8/week-candidates/LATEST.md)

---

### Decide (15 min)

- Approve or adjust week candidate (do not auto-lock)
- Assign verification war room tasks if Calendar Truth metrics are stale
- Assign outcome reporting for last week's events
- Confirm `npm run campaign-brain:build` will run by Friday

---

## Friday closeout (15 min)

| Action | File |
| ------ | ---- |
| Log event outcomes | `data/campaign-brain/event-outcomes.json` |
| Log visits | `data/campaign-brain/county-visit-log.json` |
| Update verification | `data/campaign-brain/event-verification-overrides.json` |
| Update capture | `data/campaign-brain/captured-progress.json` |
| Rebuild Brain | `npm run campaign-brain:build` |

---

## What Monday is not

- Not a strategy session
- Not a new dashboard build
- Not a 20-week calendar lock (until [exit criteria](../operations/OPERATION-CALENDAR-TRUTH.md#exit-criteria) are met)

The Brain narrows the conversation to **three deployments** and **verified reality**.
