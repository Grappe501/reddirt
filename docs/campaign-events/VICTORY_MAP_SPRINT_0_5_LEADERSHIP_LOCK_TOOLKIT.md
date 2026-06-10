# Victory Map — Sprint 0.5 Leadership Lock Toolkit

**Lane:** `RedDirt/` · **Audience:** Kelly, Steve, Campaign Manager, field leadership  
**Status:** Governance only — **no scoring, no deployment engine, no dashboards**  
**Prerequisite:** [`VICTORY_MAP_SPRINT_0_REVIEW.md`](./VICTORY_MAP_SPRINT_0_REVIEW.md) (75-county draft map)  
**Blocks:** Priority 2 (Deployment Priority Engine) until all locks below are **Locked**

---

## Why Sprint 0.5 exists

Sprint 0 produced a **draft** map to force a leadership conversation.

Sprint 0.5 captures **what leadership decides** before any assumptions become code.

> Once the Deployment Priority Engine exists, changing assumptions is much harder than locking them now.

---

## The problem Sprint 0 surfaced

| Issue | Signal | Risk if uncorrected |
|-------|--------|---------------------|
| Critical tier too large | 16 critical counties | Everything is urgent → nothing is |
| Readiness defaults to weak | 66 weak / 2 strong | Engine multiplies **unknown**, not weakness |
| Opportunity under-discussed | 46 high opportunity | Kelly time may go to saturated counties |
| Kelly supply undefined | No capacity rules | Engine cannot allocate what it cannot count |

---

## Leadership review agenda (90–120 minutes)

Work through four questions in order. Use the lock sheets in [`sprint-0-5/`](./sprint-0-5/).

### Question 1 — Which counties are truly Critical?

**Bar:** *If we fail here, our path to victory is seriously damaged.*

- Doctrine six (start locked): Benton, Washington, Pulaski, Faulkner, Saline, Craighead  
- Review ten heuristic critical counties — reclassify to **Important** where appropriate  
- **Lock sheet:** [`01-CRITICAL_COUNTY_LIST.md`](./sprint-0-5/01-CRITICAL_COUNTY_LIST.md)

### Question 2 — What does Weak Readiness really mean?

Separate **unknown** from **organizationally weak** before any math runs.

- Define Strong / Moderate / Weak with observable criteria (chair, captain, activity, pipeline)  
- **Lock sheet:** [`02-READINESS_DEFINITIONS.md`](./sprint-0-5/02-READINESS_DEFINITIONS.md)

### Question 3 — Which counties can actually move?

Opportunity is the long-term win variable — critical + strong + saturated may yield little; important + high opportunity + moderate may yield more.

- Define high / medium / low with persuasion vs turnout vs saturation language  
- **Lock sheet:** [`03-OPPORTUNITY_DEFINITIONS.md`](./sprint-0-5/03-OPPORTUNITY_DEFINITIONS.md)

### Question 4 — What is Kelly's maximum deployment capacity?

The engine needs supply constraints by season.

- Season 2: max travel days per week  
- Season 3: max debate/media days  
- Season 4: max GOTV deployment days  
- **Lock sheet:** [`04-KELLY_CAPACITY_RULES.md`](./sprint-0-5/04-KELLY_CAPACITY_RULES.md)

### Close — Assumption sign-off

- **Lock sheet:** [`05-ASSUMPTION_SIGN_OFF.md`](./sprint-0-5/05-ASSUMPTION_SIGN_OFF.md)  
- Tracker: [`data/strategy-doctrine/leadership-lock-v1.json`](../data/strategy-doctrine/leadership-lock-v1.json)

---

## Sprint 0.5 deliverables (lock when ready)

| # | Artifact | File | Lock status |
|---|----------|------|-------------|
| 1 | Critical county list | `sprint-0-5/01-CRITICAL_COUNTY_LIST.md` | Draft |
| 2 | Readiness definitions | `sprint-0-5/02-READINESS_DEFINITIONS.md` | Draft |
| 3 | Opportunity definitions | `sprint-0-5/03-OPPORTUNITY_DEFINITIONS.md` | Draft |
| 4 | Kelly capacity rules | `sprint-0-5/04-KELLY_CAPACITY_RULES.md` | Draft |
| 5 | Assumption sign-off | `sprint-0-5/05-ASSUMPTION_SIGN_OFF.md` | Draft |
| 6 | Assumption change policy | `ASSUMPTION_CHANGE_LOG.md` | Draft |
| 7 | Pre-read packet | `LEADERSHIP_LOCK_SESSION_PRE_READ.md` | Ready |
| 8 | Leadership summary one-pager | `VICTORY_MAP_LEADERSHIP_SUMMARY.md` | Ready |
| 9 | Winning theory lock sheet | `sprint-0-5/06-WINNING_THEORY.md` | Draft |

**Meeting packet:** [`LEADERSHIP_DECISION_PACKET.md`](./LEADERSHIP_DECISION_PACKET.md)  
**Print for the room:** [`VICTORY_MAP_LEADERSHIP_SUMMARY.md`](./VICTORY_MAP_LEADERSHIP_SUMMARY.md)  
**Phase 1 declaration:** [`VICTORY_OS_PHASE_1_COMPLETE.md`](./VICTORY_OS_PHASE_1_COMPLETE.md)

After locks: re-run `npm run victory:map:seed` only when leadership approves updated overrides in `leadership-county-overrides.ts` — **not before sign-off**.

---

## Success criteria (Sprint 0.5 exit)

Leadership can answer:

1. **What counties matter most?** → Locked critical list (target: ~6–10, not 16)  
2. **What counties can grow most?** → Locked opportunity definitions + growth county set  
3. **What does readiness mean?** → Locked definitions; unknown ≠ weak  
4. **How much Kelly time exists?** → Locked capacity rules by season  
5. **How do we win?** → Locked winning theory (one sentence)

Only then: **Priority 2 — Deployment Priority Engine** (deterministic math, no UI).

---

## What NOT to do in Sprint 0.5

- Do not build Deployment Priority Engine  
- Do not build Decision Engine  
- Do not build Mission Brief UI or Path to Victory dashboard  
- Do not change public website architecture  
- Do not treat draft `victory-map-v1.json` as final

---

## Related docs

- [`VICTORY_OS_DOCTRINE.md`](./VICTORY_OS_DOCTRINE.md)  
- [`VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md`](./VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md)  
- [`VICTORY_MAP_SPRINT_0_REVIEW.md`](./VICTORY_MAP_SPRINT_0_REVIEW.md)  
- [`VICTORY_OS_PHASE_1_COMPLETE.md`](./VICTORY_OS_PHASE_1_COMPLETE.md)  
- [`PUBLIC_SITE_ARCHITECTURE.md`](../website/PUBLIC_SITE_ARCHITECTURE.md)
