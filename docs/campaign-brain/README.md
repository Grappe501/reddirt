# Kelly Grappe Campaign Brain

> Decision-support platform for the final 20 weeks — not a document archive.

---

## Layers

| Layer | Contents |
| ----- | -------- |
| **Strategic** | [Plurality Victory Plan](../strategic-plan/plurality-victory-plan/README.md) — theory, math, playbooks, cities |
| **Operational** | Event intelligence, VCI, registration, drop-off, deployment priority |
| **Command** | Four lanes dashboard, clusters, victory projection |
| **Decision Intelligence** | [Recommendations](./decision-intelligence/) — answers *what next* |

---

## Decision outputs

| Output | Question |
| ------ | -------- |
| [Weekly Brief](./weekly-brief/LATEST.md) | Leadership meeting packet |
| [Next week recommendation](./decision-intelligence/next-week-recommendation.md) | What should Kelly do next week? |
| [Captured opportunity](./measurement/captured-opportunity.md) | Potential vs captured vs remaining |
| [Event learning](./feedback-loops/event-learning.md) | Was the recommendation correct? |
| [Campaign impact scores](./decision-intelligence/campaign-impact-scores.json) | Strategy-first event ranking |
| [Master priority calendar](./routing/master-priority-calendar.md) | Kelly calendar — score × verification |
| [Event verification](./calendar-intelligence/event-verification-index.md) | Verified / Tentative / Historical / Missing |
| [County coverage completion](./measurement/county-coverage-completion.md) | Planned vs completed contacts |
| [No county left behind](./routing/no-county-left-behind-alerts.md) | 45-day guardrail alerts |
| [Week candidates](./phase-8/week-candidates/LATEST.md) | Phase 8 — approve before lock |
| [Scenario engine](./scenario-engine/README.md) | Conservative / expected / aggressive paths |
| [Clerk relationships](./layers/clerk-relationships/index.json) | SOS race clerk scheduling factor |
| [Faith engagement](./layers/faith-engagement/index.json) | County faith routing index |

---

## Build

```bash
npm run strategic-plan:operational:build   # once — data foundation
npm run campaign-brain:build               # decision intelligence
```

Update [`data/campaign-brain/captured-progress.json`](../../data/campaign-brain/captured-progress.json) as field work captures opportunity.

---

## Executive narrative

- [The Story of How We Win](./executive-narrative/THE-STORY-OF-HOW-WE-WIN.md)
- [Candidate](./executive-narrative/candidate-version.md) · [Donor](./executive-narrative/donor-version.md) · [County chair](./executive-narrative/county-chair-version.md) · [Volunteer](./executive-narrative/volunteer-version.md)

## Execution phase

- [Governance checkpoint](./governance/GOVERNANCE-CHECKPOINT.md) — is the org feeding the Brain?
- [Brain health dashboard](./governance/brain-health-dashboard.md) — five accountability metrics
- [Monday leadership rhythm](./governance/MONDAY-LEADERSHIP-RHYTHM.md)
- [Operation Calendar Truth](./operations/OPERATION-CALENDAR-TRUTH.md)
- [Relational Organizing Engine](./relational-organizing/OPERATING-DOCTRINE.md) · [Relationship Capital](./relational-organizing/relationship-capital-dashboard.md)

## Field feedback

Update [`data/campaign-brain/captured-progress.json`](../../data/campaign-brain/captured-progress.json) and [`event-outcomes.json`](../../data/campaign-brain/event-outcomes.json) after each event.
