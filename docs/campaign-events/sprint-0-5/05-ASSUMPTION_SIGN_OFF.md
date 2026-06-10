# Lock Sheet 5 — Assumption Sign-Off

**Sprint 0.5 · Status:** Draft — pending signatures  
**Effect:** Unlocks Priority 2 (Deployment Priority Engine) when all items are **Locked**

---

## Assumption Change Policy (institutional memory — required before Priority 2)

Once the Deployment Priority Engine exists, **assumption drift becomes silent code behavior**. Every change to locked governance must be recorded.

### Changes that require a recorded amendment

| Category | Examples |
|----------|----------|
| Critical county status | Promote/demote Critical ↔ Important |
| Opportunity definitions | Thresholds, high/medium/low criteria |
| Readiness definitions | Strong/Moderate/Weak/Unknown criteria |
| Kelly capacity assumptions | Season caps, travel days, Tier 1 events |
| Victory assumptions | Win target, turnout, deployment mix |

### Amendment process (minimum)

1. **Who** requested the change and **why** (one paragraph).  
2. **What** changed — before/after text or county list diff.  
3. **Who approved** (Kelly / CM / field as applicable).  
4. **Date** and link to updated lock sheet or `leadership-lock-v1.json`.  
5. **Re-seed** `victory-map-v1.json` only after amendment is logged — never silent JSON edits.

### Where amendments live

| Record | Path |
|--------|------|
| Amendment log | [`ASSUMPTION_CHANGE_LOG.md`](./ASSUMPTION_CHANGE_LOG.md) |
| Lock tracker | [`data/strategy-doctrine/leadership-lock-v1.json`](../../data/strategy-doctrine/leadership-lock-v1.json) |
| County overrides (after lock) | `src/lib/victory-os/leadership-county-overrides.ts` |

**Rule:** No Priority 2 deployment math ships without this policy acknowledged in sign-off below.

---

## Attestation

We have reviewed:

- [`VICTORY_MAP_SPRINT_0_REVIEW.md`](../VICTORY_MAP_SPRINT_0_REVIEW.md) (75-county draft)
- Lock sheets 01–04 in [`sprint-0-5/`](./)
- [`VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md`](../VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md)

We understand:

1. Sprint 0 classifications are **draft**, not operational orders.  
2. **Critical** will be narrowed — target ~6–10 counties, not 16.  
3. **Readiness "weak"** will not mean "unknown data" in the engine.  
4. **Opportunity** drives marginal vote gain; Critical alone does not dictate Kelly time.  
5. **Kelly capacity** is capped by season before any allocation math runs.  
6. Vote math in win-target files is **planning scenario**, not forecast.

---

## Lock checklist

| # | Artifact | Status | Date | Owner |
|---|----------|--------|------|-------|
| 1 | Critical county list | ☐ Draft ☐ Locked | | |
| 2 | Readiness definitions | ☐ Draft ☐ Locked | | |
| 3 | Opportunity definitions | ☐ Draft ☐ Locked | | |
| 4 | Kelly capacity rules | ☐ Draft ☐ Locked | | |
| 5 | Win target / turnout assumptions (leadership assumptions doc §1–4) | ☐ Draft ☐ Locked | | |
| 6 | Assumption Change Policy acknowledged | ☐ Draft ☐ Locked | | |

---

## Success questions (must answer Yes before Priority 2)

| Question | Yes | No |
|----------|-----|-----|
| What counties matter most? (Critical list locked) | ☐ | ☐ |
| What counties can grow most? (Opportunity locked) | ☐ | ☐ |
| What does readiness mean? (Definitions locked; unknown ≠ weak) | ☐ | ☐ |
| How much Kelly time exists? (Capacity rules locked) | ☐ | ☐ |

---

## Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Candidate | Kelly Grappe | | |
| Campaign Manager | | | |
| Field / Strategy (Steve) | | | |

---

## After sign-off (engineering — not before)

1. Update `src/lib/victory-os/leadership-county-overrides.ts` with locked dimensions.  
2. Update readiness logic to respect **unknown** if adopted.  
3. Re-run `npm run victory:map:seed` and `npm run victory:map:review`.  
4. Set `leadership-lock-v1.json` artifact statuses to `locked`.  
5. **Then** begin Priority 2 — Deployment Priority Engine (deterministic, no UI).

---

## Explicitly deferred

- Decision Engine (Priority 3)  
- Mission Brief UI (Priority 5)  
- Path to Victory dashboard (Priority 6)  
- Public website changes
