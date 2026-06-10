# Lock Sheet 4 — Kelly Capacity & Candidate Deployment

**Sprint 0.5 · Status:** Draft — pending leadership lock  
**Why this matters:** The Deployment Priority Engine cannot allocate Kelly without a **supply constraint**.

**This sheet is candidate deployment** — how often Kelly physically appears. It is **not** the same as electoral Critical or Opportunity. See [`00-STRATEGIC_FRAME.md`](./00-STRATEGIC_FRAME.md).

Reference seasons: [`data/strategy-doctrine/victory-os-seasons-v1.json`](../../data/strategy-doctrine/victory-os-seasons-v1.json)

---

## Visit cadence tiers (draft — lock numerically)

Separate from Critical/Important electoral tiers. Example combinations:

| County | Electoral (draft) | Deployment (draft visits) |
|--------|-------------------|---------------------------|
| Pulaski | Critical | Fewer Kelly visits if field/surrogate covers |
| Searcy | Important | **3 visits** — immersion + GOTV kickoff |
| White | Important | **1 visit** — high opportunity, deployment constrained |

| Tier | Minimum Kelly visits | Notes |
|------|---------------------:|-------|
| Urban critical (6) | Continuous presence + events | Run score up; volunteer density |
| Rural Tier 1 | **3** | Initial → immersion → GOTV kickoff |
| Rural Tier 2 | **2** | At least one county meeting |
| All others | **1** | Baseline; move counties after review |

Source list: [`LEADERSHIP_DRAFT_INPUT_KELLY.md`](../LEADERSHIP_DRAFT_INPUT_KELLY.md)

---

## Global rules (lock)

| Rule | Locked value |
|------|--------------|
| Kelly is a **finite** resource — engine must not exceed weekly caps | ☐ Acknowledged |
| Surrogate / video / volunteer-first substitutes when readiness is Strong | ☐ Yes ☐ No |
| Maintenance counties: Kelly only for Tier 1 events (define Tier 1) | |
| Multi-county trip max counties per day | |
| Minimum rest / travel buffer between counties | |

**Tier 1 event definition (for Kelly deployment):**

```text
[ LEADERSHIP: e.g. county fair keynote, debate, major forum, clerk meeting — not every house party ]
```

---

## Season 2 — Build Familiarity (2026-07-05 → 2026-08-31)

*Doctrine question: Have they seen her?*

| Constraint | Draft from seasons file | **Locked value** |
|------------|-------------------------|------------------|
| Max Kelly travel days per week | _TBD_ | |
| Max counties visited per week | _TBD_ | |
| Season target counties visited (min–max) | 30–40 (planning) | |
| Regional swing rule | NW + Central + E/S per week where possible | ☐ Lock ☐ Revise |
| Max overnight trips per week | _TBD_ | |
| House parties vs public events mix | _TBD_ | |

---

## Season 3 — Build Confidence (2026-09-01 → 2026-09-30)

*Doctrine question: Do they know why to vote for Kelly?*

| Constraint | **Locked value** |
|------------|------------------|
| Max debate / forum days | |
| Max media days (TV, radio, podcast blocks) | |
| Max combined public appearance days per week | |
| County travel days (if any) during persuasion season | |
| Kelly % time on message vs infrastructure (doctrine mix: 40% visibility) | |

---

## Season 4 — Build Turnout (2026-10-01 → 2026-10-20)

*Doctrine question: Will they vote?*

| Constraint | **Locked value** |
|------------|------------------|
| Max GOTV deployment days (Kelly on ground) | |
| Max county stops per GOTV day | |
| Early vote vs Election Day emphasis | |
| Low-priority county threshold (doctrine: 40) — confirm or change | |

---

## Season 5 — Final 14 days (2026-10-21 → 2026-11-02)

| Constraint | **Locked value** |
|------------|------------------|
| Daily decision cadence (doctrine: daily) | ☐ Lock |
| Dynamic scheduling enabled | ☐ Yes ☐ No |
| Low-priority threshold (doctrine: 60) | |

---

## Election Day (2026-11-03)

Separate system — [`/admin/election-day`](../../src/app/admin/(board)/election-day) — **not** part of Deployment Priority Engine.

---

## Lock record

| Field | Value |
|-------|-------|
| Locked by | |
| Locked date | |
| Kelly sign-off | |
