# County / precinct strategy foundation (DATA-2) (RedDirt)

**Packet DATA-2 (Part C).** How the **system should reason** about counties and precincts for **target vote** and **registration** planning using **existing** structures—**without** inventing formulas or electoral math.

**Cross-ref:** [`targeting-data-inventory.md`](./targeting-data-inventory.md) · [`data-targeting-foundation.md`](./data-targeting-foundation.md) · [`geographic-unification-foundation.md`](./geographic-unification-foundation.md) · [`goals-system-status.md`](./goals-system-status.md)

---

## 1. County: what exists now

| Dimension | DB / code evidence |
|-----------|-------------------|
| **Canonical county** | **`County`** row (`id`, `slug`, `fips`, `displayName`) |
| **Registration goal** | **`CountyCampaignStats.registrationGoal`** |
| **Registered roll size (file)** | **`CountyVoterMetrics.totalRegisteredCount`** for a given **`VoterFileSnapshot`** |
| **New regs / churn** | **`CountyVoterMetrics`** new/dropped/net fields; **`CountyCampaignStats.newRegistrationsSinceBaseline`** |
| **Volunteer capacity (coarse)** | **`CountyCampaignStats.volunteerTarget`**, **`volunteerCount`** |
| **Population / voting-age context** | **`CountyPublicDemographics`** (`population`, `votingAgePopulation`, SES fields) **if** populated |
| **Operational field tree** | **`FieldUnit`** / **`FieldAssignment`** — **parallel** to `County`; **no** Prisma FK |

**Registration rate narrative:** comparing “how full” a county’s roll is vs **CVAP** or **population** requires **`CountyPublicDemographics.votingAgePopulation`** (or similar) **and** **`totalRegisteredCount`**—the **ratio** is a **product decision** on whether to use total reg vs active-in-latest-file; **this doc does not define the formula**.

---

## 2. County strategic *concepts* (non-computed)

These are **planning lenses**—labels staff might apply **after** analysis; **no** automatic classification in schema:

| Concept | Meaning |
|---------|---------|
| **Dense-base county** | High **known or modeled** base support **relative to** benchmarks—**requires** data not in `VoterRecord` today. |
| **Ceiling county** | High **persuasion** or **growth** upside (swingy or undermobilized)—**requires** history or modeling. |
| **Persuasion vs base-mobilization** | Tactic choice: **convince** vs **turn out**—depends on strength distribution **not** stored in DB. |
| **Low-D county with upside** | Political narrative; **Dem vote share** must come from **ingested results** or external analysis. |

---

## 3. Precinct: what exists now

| Item | Fact |
|------|------|
| **Storage** | **`VoterRecord.precinct`** optional **string** from SOS import when column present. |
| **Master table** | **None** — no FK to precinct entity. |
| **Geometry** | **None** in schema. |
| **Precinct results** | **No** `PrecinctResult` model. |
| **Precinct goals** | **No** columns on `CountyCampaignStats` / metrics for sub-county targets. |

**Feasibility today:**

- **Aggregate by precinct string** within a county (SQL `GROUP BY precinct`) **only where** `precinct` **IS NOT NULL** and **strings are consistent**—ops must validate **dirty** precinct labels.
- **True precinct strategy** (targets, ceilings, turf maps) **requires** either **clean precinct keys** + **results or scores** ingested—**future** work.

---

## 4. Historical vote performance

**Not** available as structured county/precinct **vote totals** in the inspected schema. Strategy docs that say “compare to past election” **assume** **future ingest** or **manual** analyst tables.

---

## 5. Link to registration goals

**`registrationGoal`** is **county-scoped** and **independent** of `FieldUnit`. Decomposing a county goal to **precinct** or **volunteer** quotas is **not** in Prisma—see [`path-to-45-foundation.md`](./path-to-45-foundation.md).

---

*Last updated: Packet DATA-2 (Part C).*
