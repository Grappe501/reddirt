# Modeling database — implementation plan (sketch)

**Purpose:** Ordered sketch of **future** persistence for voter, volunteer, donor, area, and effectiveness modeling — aligned with **DATA-5** blueprints. **This doc does not require every model to exist**; it records **intent** and **build order**.

---

## 1. Likely future models (not all implemented)

| Sketch model | Role |
|--------------|------|
| `VoterSignal` | **Shipped (VOTER-MODEL-1)** — provenance row per influence signal. |
| `VoterModelClassification` | **Shipped (VOTER-MODEL-1)** — tier + confidence + `isCurrent` + override audit. |
| `VoterInteraction` | **Shipped (INTERACTION-1)** — staff touch log. |
| `VoterVotePlan` | **Shipped (INTERACTION-1)** — vote-plan seed. |
| `AreaProfile` | Read model: aggregates + “personality” fields at chosen geography grain (**AREA-MODEL-1**). |
| `AreaOpportunityEstimate` | Ranges + confidence for vote potential (**DATA-5** vote-potential blueprint). |
| `CommunityEffectivenessSnapshot` | Penetration / engagement / momentum snapshots over time. |
| `VolunteerImpactSnapshot` | Capacity + outcomes rollup (ties GAME-1 / TALENT-1 narratives). |
| `DonorModelProfile` | Tier + affinity sketch (**donor blueprint**); compliance remains separate. |
| `RelationalContact` | **Shipped (REL-2)** — owner `User`, optional county/field, optional `VoterRecord` match, power-of-5 fields, seams on `VoterInteraction` / `VoterSignal`. |

---

## 2. Source-of-truth relationship

- **`VoterRecord`** — registration identity from file ingest.
- **Election results tables** — historical **tabulation**, not per-voter history.
- **`FinancialTransaction`** — internal ledger facts when **CONFIRMED**.
- **Human-recorded interactions** — commitments and support levels **only** when explicitly set on `VoterInteraction` (or future REL rows).
- **Model outputs** — **`INFERRED` / `PROVISIONAL`** in deterministic-brain terms unless policy marks a row **human-confirmed** and even then **not** “votes in the bank.”

---

## 3. Build order (recommended)

1. **DATA-4 / ELECTION-INGEST-1** — operational ingest of reported results (**done**).
2. **PRECINCT-1** — normalization / crosswalk for `VoterRecord.precinct` ↔ ingest precinct keys.
3. **REL-2** — relational contact model + optional voter match + admin list + touch/signal seams (**done**).
4. **VOTER-MODEL-1** — signal + classification schema + rule helper + read helpers (**done**).
5. **INTERACTION-1** — interaction log + vote-plan seed (**done**).
6. **AREA-MODEL-1** — area profile read model + documented grains (city / township / non-city).
7. **GOTV-1** — vote-plan lifecycle product hooks (reminders, assignments) on top of `VoterVotePlan` + interactions.

---

*Last updated: VOTER-MODEL-1 + INTERACTION-1 + REL-2 (schema + helpers + docs).*
