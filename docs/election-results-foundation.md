# Election results — data model foundation (DATA-3) (RedDirt)

**Packet DATA-3 (Part A).** **Conceptual Prisma contract** for ingesting **election results** so vote targeting can be **grounded in real tabulated data**. **No migration in this packet**—design for **DATA-4** implementation review.

**Prerequisite:** [`targeting-data-inventory.md`](./targeting-data-inventory.md) (DATA-2) — confirms **no** election-result models exist today.

**Cross-ref:** [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md) · [`targeting-signals-foundation.md`](./targeting-signals-foundation.md) · [`targeting-integration-foundation.md`](./targeting-integration-foundation.md) · [`geographic-county-mapping.md`](./geographic-county-mapping.md) · **DATA-3 sibling (multi-signal):** [`voter-signal-inventory.md`](./voter-signal-inventory.md) · [`targeting-future-layers.md`](./targeting-future-layers.md)

---

## 1. North star

- **County-level results first** — smallest grain that reliably joins to existing **`County.id`** / FIPS.
- **Precinct-level second** — only when source files and **precinct key normalization** are operationally owned.
- **Provenance always** — source file, retrieval date, and **human review** flag where product requires it.
- **Turnout and vote share** use **explicit denominators** chosen in ingest SOP (not hard-coded in this doc).

---

## 2. County results model (recommended shape)

**Purpose:** one row per **county** × **contest** × **reporting version** (optional), with **candidate-level** votes carried in a **child** table or **JSON** (migration tradeoff in DATA-4).

### 2.1 Core entities (names illustrative)

| Entity | Role |
|--------|------|
| **`ElectionContest`** (or `JurisdictionElection`) | **What was on the ballot:** `electionDate` (or `electionYear` + `electionType`), `office` / `raceKey` (e.g. `SOS_2024_GENERAL`), `state` = AR, optional `notes`, `sourceLabel`, `ingestedAt`. |
| **`CountyElectionResult`** | **County roll-up:** `countyId` → **`County`**, FK to **`ElectionContest`**, `ballotsCast` (or `totalVotes` — **define** whether undervotes/overvotes included), optional `registeredVotersDenominator` (if source provides), optional `votingAgePopulationDenominator` (if copied from **`CountyPublicDemographics`** at ingest time for **snapshot** only). |
| **`CountyElectionCandidateResult`** | **Per candidate in that county:** `countyElectionResultId`, `candidateKey` (string slug or `ballotName` as printed), `party` (optional string), `voteCount`, `isIncumbent` (optional). |

### 2.2 Required semantics (contract, not formulas)

| Field concept | Meaning |
|---------------|---------|
| **Election year / date** | Identifies **which** election; use **date** when primary vs general differ in same calendar year. |
| **Race** | Stable **`raceKey`** in app vocabulary (Secretary of State, Governor, etc.) — **not** free-text only. |
| **Candidate vote totals** | **Integers** from official or campaign-trusted tabulation. |
| **Total votes / ballots cast** | **Definition must match source** (e.g. sum of candidate votes vs total ballots). Document in ingest SOP. |
| **Turnout %** | **Derived only** after ops pick a **denominator** in SOP (e.g. active registrants on a dated file, CVAP, or official-reported denominator). Store **`ballotsCast`** and optional **precomputed** `turnoutPercent` **with** `turnoutDenominatorSource` — **do not** assume one statewide rule in this foundation. |

### 2.3 Uniqueness (design intent)

- **`@@unique([contestId, countyId])`** on county result (one authoritative row per county per contest per ingest generation, or version with `reportingBatch` if needed).

---

## 3. Precinct results model (optional extension)

**Purpose:** sub-county tabulation for turf and density analysis.

| Entity | Role |
|--------|------|
| **`PrecinctElectionResult`** | `countyElectionResultId` **or** `contestId` + `countyId`, **`precinctKeyRaw`** (string from file), **`precinctKeyNormalized`** (optional, after mapping), `ballotsCast`, same denominator discipline as county. |
| **`PrecinctElectionCandidateResult`** | `precinctElectionResultId`, `candidateKey`, `voteCount`. |

**Relation to `VoterRecord.precinct`:**

- **No FK** today — join is **best-effort**: `VoterRecord.countyId` + **normalized** `precinct` string ↔ **`precinctKeyNormalized`**.
- **Feasibility:** realistic only after **precinct crosswalk** QA (see [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md)).

---

## 4. Relation to existing tables

| Existing table | Relationship |
|----------------|----------------|
| **`County`** | **FK** `countyId` on **`CountyElectionResult`** — canonical join for maps and dashboards. |
| **`CountyPublicDemographics`** | **Optional context** for turnout denominators; copy **at ingest** if historical comparison must be frozen. |
| **`CountyCampaignStats` / `CountyVoterMetrics`** | **Separate rails** — registration goals vs **election results**; integrate in **read models** only with **clear** labeling (see [`targeting-integration-foundation.md`](./targeting-integration-foundation.md)). |
| **`VoterRecord`** | **Not** a child of election results; **soft** link via county + precinct string when normalization allows. |

---

## 5. Out of scope (DATA-3)

- **Per-voter vote history** (secret ballot — typically **not** in public results).
- **Real-time** SOS API — unless a future packet defines it.
- **Scoring models** — DATA-3 is **tabular results** only.

---

## 6. Repo inspection (DATA-3)

1. **Hidden election result datasets in repo?** **No** committed bulk election result files or Prisma models located in **`RedDirt/`** beyond **narrative** content (e.g. `src/content/resources/*`) and generic **text** mentions — **not** structured county/precinct **vote tables**. (`grep` for election/turnout in code yields docs and copy, not datasets.)
2. **Cleanest county mapping?** **`County.fips`** and **`County.slug`** as join keys after normalizing source county names to FIPS or slug in ingest (see ingest strategy).
3. **Precinct mapping realistic with current schema?** **Partially**: **`VoterRecord.precinct`** is a **string**; results ingest needs **`precinctKeyNormalized`** and QA — **no** precinct master table today.
4. **Minimal model to begin?** **`ElectionContest`** + **`CountyElectionResult`** + **`CountyElectionCandidateResult`** (three-table pattern) **or** contest + county row with **validated** `resultsJson` — **DATA-4** chooses after performance/review needs.
5. **DATA-4 next?** Prisma migration + idempotent ingest CLI or admin upload + **`County`→results** validation report + extend **`targeting.ts`** read helpers; precinct optional phase 2.

---

*Last updated: Packet DATA-3 (Parts A + E).*
