# Lock Sheet 7 — Win Target Methodology

**Sprint 0.5 · Status:** Draft — pending leadership lock  
**Feeds:** Decision 5 — Victory Assumptions · `VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md` §1  
**Full spec:** [`WIN_TARGET_METHODOLOGY.md`](../WIN_TARGET_METHODOLOGY.md)

> Win targets are **planning scenarios**, not forecasts. Lock the **method** before treating `203,049` or any county target as operational.

---

## Principle (lock this wording)

> We derive targets from **historical vote totals**, **registration and turnout headroom**, and **explicit guardrails** — then allocate the statewide gap by **documented capacity weights**. Missing data reduces confidence; it does not silently become weakness or zero.

---

## Statewide parameters

| Parameter | V1 default | Locked value | Signed |
|-----------|------------|--------------|--------|
| Cushion above 50% + 1 (`cushionPct`) | 0.75% | ___ | ☐ |
| Midterm dropoff on presidential leg | 0.72 | ___ | ☐ |

**Locked statewide working target (after session):** _______________ votes  
**Locked statewide vote gap:** _______________ votes

---

## Turnout blend weights (must sum to 1.0 before dropoff)

| Race leg | V1 default | Locked |
|----------|------------|--------|
| SOS 2022 total | 0.45 | ___ |
| Treasurer 2022 total | 0.20 | ___ |
| Treasurer 2024 total | 0.20 | ___ |
| Presidential 2024 total (× dropoff) | 0.15 | ___ |

---

## Baseline Democratic blend weights

| Race leg | V1 default | Locked |
|----------|------------|--------|
| SOS 2022 D | 0.40 | ___ |
| Treasurer 2022 D | 0.20 | ___ |
| Treasurer 2024 D | 0.25 | ___ |
| Presidential 2024 D | 0.15 | ___ |

---

## Capacity allocation weights (must sum to 1.0)

| Component | V1 default | Locked |
|-----------|------------|--------|
| Baseline D share | 0.30 | ___ |
| Registration goal | 0.20 | ___ |
| Turnout headroom | 0.15 | ___ |
| Recent growth | 0.15 | ___ |
| County opportunity (heuristic) | 0.10 | ___ |
| Travel efficiency | 0.05 | ___ |
| Local infrastructure | 0.05 | ___ |

---

## Guardrails

| Rule | V1 default | Locked |
|------|------------|--------|
| Max share bump | +12 pp | ___ |
| Max share multiplier | ×1.25 | ___ |

---

## Data policy

| Policy | Y / N |
|--------|-------|
| Synthetic county history allowed for **statewide planning only** until SOS ingest | ☐ |
| Synthetic county targets **not** shown to county chairs / field | ☐ |
| Counties with `confidence: low` receive **zero** allocated gap until validated | ☐ |
| Official SOS results replace synthetic per county as ingested | ☐ |

---

## Minimum confidence for operational use

☐ **High only** · ☐ **Medium and above** · ☐ **All counties (not recommended)**

---

## Facilitator test

Ask for one county (e.g. Pulaski, White, Searcy):

> Walk through projected turnout, baseline D, capacity sub-scores, allocated gain, and guardrail cap in plain English.

If the room cannot, do not lock.

---

## Lock record

| Field | Value |
|-------|-------|
| Locked by | |
| Locked date | |
| Scenario rebuilt | ☐ `npm run election:targets:build` date: ___ |
| Recorded in | `VICTORY_OS_LEADERSHIP_ASSUMPTIONS.md` §1 |
