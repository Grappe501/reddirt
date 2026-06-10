# Victory OS — Leadership Assumptions

**Lane:** `RedDirt/` only · **Audience:** Kelly, Steve, Campaign Manager, field leadership  
**Status:** **Draft — leadership must complete before Sprint 0 algorithms lock**  
**Canonical doctrine:** [`VICTORY_OS_DOCTRINE.md`](./VICTORY_OS_DOCTRINE.md)  
**Data target:** `data/strategy-doctrine/victory-map-v1.json`

---

## Why this document exists

Victory OS fails when **hidden assumptions become code**.

Sprint 0 classifies all 75 counties. The Deployment Priority Engine, Decision Generator, and County Mission stack will **encode whatever leadership believes** about win paths, turnout, and Kelly’s time — unless those beliefs are written here first.

This is the record of **leadership decisions before they become algorithms**.

**Rule:** No dimension value in `victory-map-v1.json` should contradict an assumption marked **Locked** below without an explicit amendment dated and signed here.

---

## How to use this doc

1. Leadership fills each section in working sessions (not in code).
2. Mark each block **Draft** → **Under review** → **Locked**.
3. Sprint 0 seeds `victory-map-v1.json` only from **Locked** assumptions + per-county review.
4. When assumptions change, amend this file **before** changing scoring scripts.

---

## Sprint 0.5 gate (before Priority 2)

**Do not build Deployment Priority Engine until Sprint 0.5 locks are signed.**

Toolkit: [`VICTORY_MAP_SPRINT_0_5_LEADERSHIP_LOCK_TOOLKIT.md`](./VICTORY_MAP_SPRINT_0_5_LEADERSHIP_LOCK_TOOLKIT.md)  
Tracker: [`data/strategy-doctrine/leadership-lock-v1.json`](../data/strategy-doctrine/leadership-lock-v1.json)

---

## 1. Win target assumptions

| Assumption | Value | Status | Owner | Notes |
|------------|-------|--------|-------|-------|
| North star | 50% + 1 statewide | Locked (doctrine) | — | From `VICTORY_OS_DOCTRINE.md` |
| Target vote share (working) | _TBD_ | Draft | Campaign Manager | Not for public site |
| Expected turnout vs 2022 / 2024 baseline | _TBD_ | Draft | Campaign Manager | Source: _cite primary data_ |
| Margin-of-error counties (must-win band) | _TBD_ | Draft | Kelly + CM | List FIPS or names |
| Acceptable underperformance in Maintenance counties | _TBD_ | Draft | Field director | Define “maintain presence” operationally |

---

## 2. Critical counties (electoral importance)

**Definition (doctrine):** Counties where failure breaks the path to 50% + 1.

Leadership must lock the **Critical** set before Sprint 0 completes. Doctrine examples (verify — do not treat as locked until signed):

| County | Proposed tier | Locked? | Rationale |
|--------|---------------|---------|-----------|
| Pulaski | Critical | Draft | Largest vote pool |
| Washington | Critical | Draft | NW growth + persuasion |
| Benton | Critical | Draft | Suburban + growth |
| Faulkner | Critical | Draft | Central AR suburban |
| Saline | Critical | Draft | Central AR suburban |
| Craighead | Critical | Draft | NE anchor |
| _Add/remove rows_ | | | |

**Full Critical list (names only, 75-county review):**

```text
[ LEADERSHIP: paste final Critical county list before Sprint 0 sign-off ]
```

---

## 3. Growth counties (opportunity)

**Definition (doctrine):** Counties with meaningful persuasion or turnout headroom — may differ from Critical.

| County | Opportunity (H/M/L) | Locked? | Rationale |
|--------|---------------------|---------|-----------|
| Benton | High (example) | Draft | Doctrine example |
| Pulaski | Medium (example) | Draft | Doctrine example |
| Montgomery | Low (example) | Draft | Doctrine example |
| _Add rows for all counties in Sprint 0_ | | | |

**Growth priority hypothesis (narrative):**

```text
[ LEADERSHIP: where do we believe marginal votes are cheapest — persuasion vs turnout? ]
```

---

## 4. Turnout assumptions

| Segment | Assumption | Status | Source |
|---------|------------|--------|--------|
| Base D turnout vs prior SOS cycle | _TBD_ | Draft | |
| Suburban / exurban persuasion targets | _TBD_ | Draft | |
| Rural maintenance counties | _TBD_ | Draft | |
| Youth / first-time registrants | _TBD_ | Draft | |
| Black / Latino / AAPI community targets (if used) | _TBD_ | Draft | Must be respectful + sourced |

**Counties where turnout is the primary lever (not persuasion):**

```text
[ LEADERSHIP list ]
```

---

## 5. Kelly deployment assumptions

How Kelly’s **candidate time** should be allocated — feeds deployment priority, not public calendar.

| Assumption | Value | Status | Notes |
|------------|-------|--------|-------|
| Max counties visited per month (candidate) | _TBD_ | Draft | Public site shows verified events only |
| Minimum visits to Critical counties before _date_ | _TBD_ | Draft | |
| Counties where Kelly surrogate / video replaces in-person | _TBD_ | Draft | |
| Travel radius / multi-county trip rules | _TBD_ | Draft | |
| Fair / forum / clerk-meeting priority vs house parties | _TBD_ | Draft | |

**Kelly should not spend candidate time in (except maintenance):**

```text
[ LEADERSHIP list — e.g. Maintenance-tier counties unless chair request + CM approval ]
```

---

## 6. Volunteer & field assumptions

| Assumption | Value | Status | Notes |
|------------|-------|--------|-------|
| Target active volunteers statewide | _TBD_ | Draft | Internal only — never public |
| Volunteers per “Strong” readiness county | _TBD_ | Draft | |
| Minimum bench to classify Moderate vs Weak | _TBD_ | Draft | |
| Power of 5 / relational target | _TBD_ | Draft | |
| County chair coverage goal by _date_ | _TBD_ | Draft | |

**Readiness definitions (operational):**

| Readiness | Leadership definition (must match doctrine) |
|-----------|---------------------------------------------|
| **Strong** | _TBD — chair + captain + pipeline + recent activity_ |
| **Moderate** | _TBD_ |
| **Weak** | _TBD — shell county_ |

---

## 7. Resource allocation assumptions

| Resource | Assumption | Status |
|----------|------------|--------|
| Paid media markets vs field-first counties | _TBD_ | Draft |
| Phone bank / text prioritization | _TBD_ | Draft |
| Budget caps per region | _TBD_ | Draft |

---

## 8. Deployment Priority formula (leadership sign-off)

Doctrine proposes:

```text
Deployment Priority =
  Victory Importance × Opportunity × Readiness Gap × Urgency
```

| Factor | How leadership defines it | Locked? |
|--------|---------------------------|---------|
| Victory Importance | Derived from electoral importance + win path | Draft |
| Opportunity | High / Medium / Low → numeric map in `score-maps.ts` | Draft |
| Readiness Gap | Inverse of readiness — how far from Strong? | Draft |
| Urgency | Season phase, days to election, hot-wash signals | Draft |

**Numeric weights (must match `src/lib/victory-os/score-maps.ts` after lock):**

```text
[ LEADERSHIP + Steve: approve weights before Deployment Priority Engine ships ]
```

---

## 9. Decision Engine assumptions

Top 10 Decisions are **not** calendar items.

| Assumption | Value | Status |
|------------|-------|--------|
| Decision horizon | Weekly (Monday brief) | Locked (doctrine) |
| Max decisions surfaced | 10 | Locked (doctrine) |
| Who approves decision list before field sees it | _TBD_ | Draft |
| What counts as a “decision” vs a “task” | _TBD_ | Draft |

**Example decision types leadership expects:**

- Deploy Kelly to _county_ for _reason_
- Stand up chair + captain in _county_
- Shift phone bank hours to _region_
- _Add campaign-specific examples_

---

## 10. Explicit non-assumptions (do not encode)

- Public county visit counts from internal travel logs (use published events only on website)
- Opponent attack lines without legal/source review
- Voter-file fields or SSN claims
- “One of the first” or unverified rank claims
- Victory OS scores on any public route

---

## Amendment log

| Date | Section | Change | Approved by |
|------|---------|--------|-------------|
| 2026-06-10 | All | Initial template — Sprint 0 prep | _Pending leadership session_ |

---

## Sprint 0 exit criteria (Victory Map)

Before Priority 2 (Deployment Priority Engine) begins:

- [ ] All 75 counties have **electoral_importance**, **opportunity**, **readiness**, **victory_importance** in `victory-map-v1.json`
- [ ] Values trace to **Locked** rows in this document
- [ ] Kelly + Campaign Manager sign Sprint 0 review (date in amendment log)
- [ ] No public site changes required for Sprint 0
