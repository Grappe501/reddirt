# Lock Sheet 4 — Kelly Capacity Rules

**Sprint 0.5 · Status:** Draft — pending leadership lock  
**Why this matters:** The Deployment Priority Engine cannot allocate Kelly without a **supply constraint**.

Reference seasons: [`data/strategy-doctrine/victory-os-seasons-v1.json`](../../data/strategy-doctrine/victory-os-seasons-v1.json)

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
