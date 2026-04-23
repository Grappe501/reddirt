# Path to statewide vote goal — system planning framework (DATA-2) (RedDirt)

**Packet DATA-2 (Part D).** **Planning document** for how the **system could later** support a campaign vote-share target (e.g. **45%** in a three-way or fragmented race)—using **county goals, voter file, demographics, capacity**, and **future** electoral data. **Not** campaign rhetoric. **No** vote-share formulas or guaranteed math.

**Cross-ref:** [`targeting-data-inventory.md`](./targeting-data-inventory.md) · [`voter-strength-foundation.md`](./voter-strength-foundation.md) · [`county-precinct-strategy-foundation.md`](./county-precinct-strategy-foundation.md) · [`volunteer-county-integration.md`](./volunteer-county-integration.md)

---

## 1. County baseline

**Meaning:** where each county **starts** from in terms of **known data**.

**Available now (DB):** registration roll size and deltas (**`CountyVoterMetrics`**), campaign **registration** goal (**`CountyCampaignStats.registrationGoal`**), optional **population / voting-age** (**`CountyPublicDemographics`**), volunteer target/count.

**Not available now (DB):** county **D vote share**, **turnout rate**, or **partisan baseline** from **past elections** in structured tables.

**System behavior (future):** when election data exists, **baseline** should be **stored** with **provenance** (source, year, race)—**DATA-3** schema design.

---

## 2. County ceiling / opportunity

**Meaning:** how much **additional** vote share or **margins** might be **theoretically** available—**requires** modeling or historical comparison **not** in current Prisma.

**Planning rule:** do not conflate **registration goal progress** with **vote share** progress; they are **different** rails until explicitly linked in product.

---

## 3. Registration lift opportunity

**Meaning:** voters **not yet registered** who could be brought onto the roll before deadlines.

**Available now:** `totalRegisteredCount`, new registration counters, **`registrationGoal`** as **campaign** target for **registration organizing** narrative.

**Gap:** goal is **not** automatically “votes”—it is **roll-building** unless ops redefine `registrationGoal` semantics in governance.

---

## 4. Persuasion opportunity

**Meaning:** voters who could be **moved** to support the candidate.

**Not computable** in-app without **support** data (see voter-strength doc).

---

## 5. Volunteer / field capacity overlay

**Meaning:** where organizers and volunteers can **execute**.

**Available now (partial):** **`CountyCampaignStats.volunteerTarget` / `volunteerCount`**, **`FieldAssignment`**, VOL-CORE role docs—**not** tied to vote math.

---

## 6. Future precinct decomposition

**Meaning:** sub-county **vote** and **registration** plans.

**Requires:** reliable **`precinct`** (or other turf key), optional **precinct baselines**, and **governance** on PII—see county-precinct doc.

---

## 7. What is missing today (summary)

| Missing | Blocks |
|---------|--------|
| **Structured election results** (county/precinct) | Baseline, ceiling, “low-D upside” **in product** |
| **Voter strength / party / model** | Persuasion vs mobilization **classification** |
| **Statewide vote goal row** | Single “45%” **object** in DB—**may** remain **external** |
| **Precinct master + normalization** | Clean **precinct strategy** |
| **Join FieldUnit ↔ County** | Aligning **field capacity** to **county stats** without folklore |

---

## 8. DATA-3 / DATA-4 suggestion (non-binding)

1. **DATA-3 (shipped as docs):** [`election-results-foundation.md`](./election-results-foundation.md), [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md), [`targeting-signals-foundation.md`](./targeting-signals-foundation.md), [`targeting-integration-foundation.md`](./targeting-integration-foundation.md).
2. **DATA-4:** Prisma migration + idempotent ingest + validation UI/report — **then** admin read views that **join** goals + metrics + demographics + **approved** results—still **no** auto “path to 45%” calculator unless explicitly scoped.
3. **Optional** `VoterUniverse` or **score** table **or** warehouse contract—**legal/compliance** gate (later packet).

---

*Last updated: Packet DATA-2 (Part D).*
