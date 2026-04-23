# Geographic targeting model — county-first (DATA-3) (RedDirt)

**Packet DATA-3 (multi-signal).** How to **prioritize geography** using **existing county tables** and **aggregated** signals — **without** precinct election results and **without** invented vote-share math.

**Cross-ref:** [`county-precinct-strategy-foundation.md`](./county-precinct-strategy-foundation.md) · [`goals-system-status.md`](./goals-system-status.md) · [`path-to-45-foundation.md`](./path-to-45-foundation.md)

---

## 1. Inputs available today (DB)

| Source | Use |
|--------|-----|
| **`CountyVoterMetrics.totalRegisteredCount`** | Roll size **per snapshot** |
| **`CountyCampaignStats.registrationGoal`** | **Registration organizing** target |
| **`CountyPublicDemographics.population` / `votingAgePopulation`** | Denominator options for **registration rate** narratives — **only** where populated |
| **`CountyCampaignStats.volunteerTarget` / `volunteerCount`** | **Capacity** proxy |
| **Aggregated voter strength (future)** | Count of **`User`/`VoterRecord`** with tier ≥ X **after** DATA-4 materializes assignments |

---

## 2. County concepts (non-computed here)

| Concept | Definition |
|---------|------------|
| **Dense base county** | **High** share of people **classified** Strong/Likely **after** signal model runs — **requires** DATA-4 rollups. Until then: **proxy** = high **volunteerCount** + **donor** density **if** queryable — **weak** proxy, label honestly. |
| **High-ceiling county** | **Large** gap between **registration** penetration and **`votingAgePopulation`** **or** **high** `registrationGoal` headroom — **operational**, not partisan. **Partisan** ceiling needs **election results** ([`election-results-foundation.md`](./election-results-foundation.md)). |
| **Registration vs population** | Compare **`totalRegisteredCount`** to **`votingAgePopulation`** **only** when both **present**; **document** date alignment (snapshot `asOfDate` vs demographics `asOfYear`). |

---

## 3. Effort prioritization (framework)

**Order of operations (planning, not formula):**

1. **Data readiness** — counties with **fresh** `CountyVoterMetrics` + demographics + **known** field coverage (`FieldAssignment` / captain).
2. **Registration lift** — counties with **large** `registrationGoal` **or** low registration rate vs CVAP **if** measured.
3. **Organizing depth** — counties with **low** `volunteerCount` vs `volunteerTarget`.
4. **Signal density (later)** — counties where **Strong/Likely** counts justify **mobilization-first** tactics vs **Persuadable-heavy** counties for **persuasion-first** — **after** multi-signal assignments exist.

---

## 4. Precinct

**Today:** only **`VoterRecord.precinct`** string — geographic heatmaps of **strength** need **normalization** + optional **precinct results** (future). See [`targeting-future-layers.md`](./targeting-future-layers.md).

---

*Last updated: Packet DATA-3 (multi-signal, Part D).*
