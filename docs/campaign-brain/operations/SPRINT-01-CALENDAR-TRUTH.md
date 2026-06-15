# CAMPAIGN PHASE SPRINT 01

## Operation Calendar Truth Acceleration

> **Mission:** Move verified events from 3 → 300+. No new strategy. No new scoring. Strengthen the verified-data supply chain.

---

## Current state → Goal

| Metric | Current | Goal |
| ------ | ------: | ---: |
| Verified events | 3 | 300+ |
| County fairs verified | 0/75 | 75/75 |
| County contact owners | 0/75 | 75/75 |
| Outcome reporting | 0% | 90%+ |
| Guardrail violations | 59 | <10 |

---

## Sprint deliverables

| Task | Artifact | Status |
| ---- | -------- | ------ |
| 1 — Verification workbench | [calendar-truth-workbench/](./calendar-truth-workbench/README.md) | Ready |
| 2 — County owner assignment | [county-contact-owners.json](../../data/campaign-brain/county-contact-owners.json) · [dashboard](../governance/county-owner-assignment-dashboard.md) | Ready |
| 3 — Field reporting forms | [field/](../field/README.md) | Ready |
| 4 — Relationship capital | [relationship-assets.json](../../data/campaign-brain/relationship-assets.json) · [scorecard](../measurement/relationship-capital-scorecard.md) | Ready |
| 5 — Big Table doctrine | [BIG-TABLE-DEMOCRAT-DOCTRINE.md](../relational-organizing/BIG-TABLE-DEMOCRAT-DOCTRINE.md) | Integrated |
| 6 — Opportunity capture inputs | [event-outcomes.json](../../data/campaign-brain/event-outcomes.json) | Expanded |
| 7 — Brain health hardening | [brain-health-dashboard.md](../governance/brain-health-dashboard.md) | Updated |

---

## Daily / weekly rhythm

1. **Teams A–D** work verification workbenches → update `event-verification-overrides.json`
2. **County leads** assign owners in `county-contact-owners.json`
3. **Field teams** submit 5-minute forms → update `event-outcomes.json`, `county-visit-log.json`, `relationship-assets.json`
4. **Friday:** `npm run campaign-brain:build`
5. **Monday:** review [brain-health-dashboard.md](../governance/brain-health-dashboard.md)

```bash
npm run campaign-brain:sprint:calendar-truth   # workbench + owners + velocity only
npm run campaign-brain:build                   # full Brain refresh
```

---

## What we are NOT doing in Sprint 01

- No new strategy models
- No new dashboards (except operational workbench / assignment views)
- No new scoring systems
- No Weeks 1–20 schedule generation
- No Phase 9 unlock

---

## Success criteria

Sprint infrastructure complete when all deliverables above exist and `campaign-brain:build` runs cleanly.

**Sprint outcome** is measured by verified-event count, owner coverage, and outcome reporting % — not by shipping more code.
