# Targeting future layers (DATA-3) (RedDirt)

**Packet DATA-3 (multi-signal).** How **additional data** plugs into the **multi-signal** and **geographic** models **after** DATA-4+ — **no** implementation in this packet.

**Cross-ref:** [`election-results-foundation.md`](./election-results-foundation.md) · [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md) · [`targeting-signals-foundation.md`](./targeting-signals-foundation.md) · [`geographic-targeting-model.md`](./geographic-targeting-model.md)

---

## 1. Election results (county → precinct)

- **County results** refine **historical partisan baseline** and **ceiling** narratives — **complement** behavioral signals (donor/volunteer), **do not** replace them.
- **Precinct results** enable **precinct-level** **dense base** / **expansion** maps **after** [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md) normalization.
- **Integration rule:** election **history** is **ecological** (geography); **donor/volunteer** is **individual** where matched — combine only with **clear** labeling.

---

## 2. Precinct normalization

- **`precinctKeyNormalized`** on results + **`VoterRecord.precinct`** cleanup → **join** for turf.
- **Unmatched** precincts **block** precinct claims in UI.

---

## 3. Modeled scores (vendor / internal ML)

- **Optional** `modeledSupportBand` on person or precinct — **provenance** required (`modelId`, `version`, `date`).
- **Precedence:** **explicit** suppression > **human** override > **model** suggestion (policy).

---

## 4. Census enrichment

- **`CountyPublicDemographics`** already county-level; **future** tract data would require **new** tables or **warehouse** — **not** in Prisma today.
- Use for **context** in **county** prioritization, **not** individual classification unless **modeled** with consent/governance.

---

## 5. REL-2 relational graph

- **Dispositions** and **conversation** outcomes become **first-class** signals — may **override** weak geographic inference.
- **Network rollups** (how many **Unknowns** touched by **Strong Base** volunteers) — **future** metric.

---

## 6. Voter history file ingest

- **Turnout frequency** feeds **Low Propensity Supporter** vs **Persuadable** splits per [`voter-signal-combination.md`](./voter-signal-combination.md).
- **Still not** “who they voted for” in secret-ballot systems unless source is **aggregate** or **primary** with public rules.

---

*Last updated: Packet DATA-3 (multi-signal, Part E).*
