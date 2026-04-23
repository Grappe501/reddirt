# Targeting signals foundation — after election ingest (DATA-3) (RedDirt)

**Packet DATA-3 (Part C).** What **becomes possible in the system** once **`CountyElectionResult`** (and optional precinct rows) exist—**without** defining numeric formulas here. Each bullet assumes **clean, approved** ingested data.

**Cross-ref:** [`election-results-foundation.md`](./election-results-foundation.md) · [`voter-strength-foundation.md`](./voter-strength-foundation.md) (pre-ingest limits) · [`path-to-45-foundation.md`](./path-to-45-foundation.md)

---

## 1. County-level signals (enabled by DATA-4+)

| Signal | Description | Still not automatic |
|--------|-------------|---------------------|
| **Base vote share by county** | **Observed** D (or chosen party) **share** = candidate votes ÷ defined total for **past contest** — **historical fact**, not prediction. | Does **not** label individual voters as “base.” |
| **Turnout comparison** | Compare **reported turnout** or **ballots cast** across counties **for the same contest** if denominators are **consistent**. | **Cross-contest** turnout compare needs aligned denominators. |
| **Ceiling identification** (heuristic) | Counties where **historical** performance is **far below** statewide or regional peers — **candidate** for **expansion** narrative **if** ops define benchmarks. | **Not** a built-in algorithm in DATA-3. |
| **Underperforming counties** | Counties where **target party** underperforms **expectation** from a **defined** benchmark table (external model or simple average). | Benchmark is **product/governance** choice. |
| **Dense base vs expansion** | **Dense base:** high **historical** vote share for target party; **expansion:** lower share but **high** registration lift or **demographic** upside per **`CountyPublicDemographics`**. | **Requires** results + optional demographics; **no** individual-level “persuasion” score from results alone. |

---

## 2. Precinct-level signals (enabled only if precinct ingest + QA)

| Signal | Description |
|--------|-------------|
| **Precinct vote share** | Same as county, **finer** geography. |
| **Precinct turnout** | If denominators exist at precinct grain (often **harder** than county). |
| **Join to volunteer turf** | After **`FieldUnit`↔`County`** alignment and precinct normalization, **optional** assignment of organizers to **high-leverage** precincts — **future** FIELD packet. |

---

## 3. What remains impossible from results alone

- **Individual voter strength** (base/persuasion) — **no** secret ballot linkage.
- **Future vote probability** — requires **models** or **polling**, not just past totals.
- **Guaranteed path to 45%** — requires **simulation** + **assumptions** beyond this foundation.

---

## 4. Honest sequencing

1. **Ingest + approve** county results (DATA-4).
2. **Read-only** admin / analyst views comparing results to **`CountyVoterMetrics`** and **`CountyCampaignStats`** (registration rail).
3. **Optional** precinct ingest after county stable.
4. **Later** packets: modeled universes or canvass dispositions — **separate** governance.

---

*Last updated: Packet DATA-3 (Part C).*
