# Build Order — Plurality Victory Plan → Campaign OS

> **Document:** Arkansas Plurality Victory Plan
> **Last updated:** 2026-06-14

---

## Completed — Campaign Operating System Foundation

| Phase | Deliverable | Status |
| ----- | ----------- | ------ |
| 1 | Ch. 4 Drop-Off (75 counties) | ✅ 102,070 raw drop-off |
| 2 | Ch. 5 Registration dashboards | ✅ 50,000 allocated |
| 3 | Ch. 7–8 Top 40 / Top 10 cities | ✅ 207,507 / 131,694 targets |
| — | Opportunity Scorecard (Tier A–D) | ✅ |
| **4** | **Ch. 9 County Playbooks (75 missions)** | ✅ **VCI + auto missions** |
| **5** | **Event Intelligence Layer** | ✅ **317 events indexed** |
| **6** | **Four Lanes Command Center** | ✅ **Victory projections** |
| **7** | **Opportunity Clusters (9 regions)** | ✅ **Routing backbone** |

**One command:** `npm run strategic-plan:operational:build`

---

## Phase 8 — 20-Week Plan (IN PROGRESS)

**Weeks 1–4:** Operational direction populated (2026-06-15).  
**Weeks 5–20:** Framework skeleton assigned by cluster.  
**Full calendar lock:** Still gated on Calendar Truth — but Kelly executes from Week 1 now.

See: `part-iv-twenty-week-execution/chapter-10-twenty-weeks-to-victory/weeks/` · `/election-plan`

---

## Key metrics

### Victory Contribution Index (VCI)

```
VCI = Lane 2 @ 50% + Registration Goal + GOP Conversion @ 12% + City Influence Votes
```

Top county: **Pulaski (97,376)**

### Four engines (statewide)

| Engine | Potential |
| ------ | --------: |
| Lane 2 | 51,051 @ 50% recovery |
| Lane 3 | 50,000 registrations |
| Lane 4 | 12% GOP peel (by county) |

**Expected victory projection:** ~410,197 (plurality range 390K–420K)

---

## Command center

[`command-center/README.md`](./command-center/README.md)

---

## DB note

Registration goals use Lane 2-weighted allocation until `CountyCampaignStats.registrationGoal` is backfilled.
