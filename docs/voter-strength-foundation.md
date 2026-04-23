# Voter strength foundation (DATA-2) (RedDirt)

**Packet DATA-2 (Part B).** **Conceptual** framework for **voter strength** tiers aligned to **field-program practice**, grounded in **what the repo can store today**. **Does not** claim computability without named data sources.

**Cross-ref:** [`targeting-data-inventory.md`](./targeting-data-inventory.md) · [`data-targeting-foundation.md`](./data-targeting-foundation.md) (DATA-1) · **DATA-3:** [`voter-strength-model.md`](./voter-strength-model.md) · [`voter-signal-combination.md`](./voter-signal-combination.md)

---

## 1. What the schema supports today

| Signal | Present on `VoterRecord` or related? |
|--------|--------------------------------------|
| On active roll (latest file) | **`inLatestCompletedFile`**, snapshot FKs |
| County | **`countyId`**, FIPS, slug |
| Precinct (optional) | **`precinct`** string if import provided |
| Registration date | **`registrationDate`** |
| Name / phone for matching | **`firstName`**, **`lastName`**, **`phone10`** |
| Party affiliation | **No** |
| Vote history / turnout score | **No** |
| Persuasion / support score | **No** |
| Universe tag (base / pers / GOTV) | **No** first-class enum |

**Tier-2 / segment JSON** (`AudienceSegment.definitionJson`, etc.) **could** encode lists or rules, but there is **no** documented, enforced mapping to **voter strength** in Prisma—DATA-1 states this honestly.

---

## 2. Conceptual tiers (for future modeling)

These labels describe **campaign cognition**, not DB columns:

| Tier | Meaning (conceptual) |
|------|----------------------|
| **Solid base** | Voters **likely** to support the Democratic nominee **without** persuasion—definition depends on **data** (e.g. modeled scores, primary history, **if** ingested). |
| **Leaning support** | Likely supportive but **need** reminder / light touch. |
| **Persuadable** | Uncertain; worth **conversation** if capacity allows. |
| **Low-propensity base** | Aligned but **unlikely to vote** without extra mobilization. |
| **Unlikely support / ignore** | Oppposition or **do not spend** scarce resources. |
| **Unknown** | **Insufficient data** to classify. |

---

## 3. What “35% solid base” means in *this* system

**Conceptually:** a **statewide or jurisdiction-level** assertion that ~35% of the **relevant electorate** is **solid D** (or solid campaign base) **without** additional persuasion.

**In RedDirt today:** that percentage is **not** computable from **`VoterRecord`** alone because **support** is **not** a column and **election results** are **not** in a results table (see [`targeting-data-inventory.md`](./targeting-data-inventory.md)).

**Honest use:** treat “35%” as a **planning assumption** sourced **outside** this DB (polling, vendor model, strategist spreadsheet) until **DATA-3+** ingests **evidence** into structured rows.

---

## 4. Dense-base areas (future)

**Definition (conceptual):** geographic units (precinct, ZIP, county) where **modeled or observed** base support **exceeds** a threshold—suitable for **mobilization-first** tactics.

**Repo today:**

- **County-level:** can compare counties using **registration** metrics + **optional** `CountyPublicDemographics` — **not** base density without vote/model data.
- **Precinct-level:** only if **`VoterRecord.precinct`** is populated **and** **per-precinct** strength data exists **elsewhere** and is joined in app or warehouse—**not** automatic today.

---

## 5. Signals that would be needed (no implementation here)

To **compute** strength tiers **inside** the product, the campaign would need **one or more** of:

- **Per-voter** or **per-precinct** **scores** or **labels** in new columns/tables, **or**
- **Join** to an external warehouse with modeled universes, **or**
- **Canvass/disposition** outcomes stored per voter (not in current schema as disposition fields on `VoterRecord`).

Any such work is **DATA-3+** with **governance** review (PII, consent, legal use of file).

---

*Last updated: Packet DATA-2 (Part B).*
