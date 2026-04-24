# Election results ingest foundation — Arkansas JSON (OFFICIAL-INGEST-1 / INGEST-OPS-1) (RedDirt)

**Purpose:** Define the **first real** election-results ingest path using **observed** Arkansas SOS-style JSON **on disk**. Complements the **conceptual DB contract** in [`election-results-foundation.md`](./election-results-foundation.md) and CSV expectations in [`election-data-ingest-strategy.md`](./election-data-ingest-strategy.md).

**Evidence:** Files under `H:\SOSWebsite\campaign information for ingestion\electionResults\` (inspected 2026-04-23 from this environment). Shapes verified with Node parse of `2024_General.json`, `2024_Primary.json`, `2026_Preferential_Primary.json`.

**Cross-ref:** [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) · [`election-results-implementation-plan.md`](./election-results-implementation-plan.md) · `src/lib/campaign-engine/ingest-sources.ts` (`ElectionResultsFileKind`)

---

## 1. What we have now (uploaded / folder)

| File (examples) | Election (as labeled in data) | Notes |
|-------------------|-------------------------------|--------|
| `2024_General.json` | 2024 General (`ElectionInfo.ElectionName`) | `IsOfficial: true` in sample |
| `2024_Primary.json` | 2024 Primary contests (e.g. presidential primary party slices) | Same top-level keys as 2024 General |
| `2026_Preferential_Primary.json` | Preferential primary (election metadata in `ElectionData`) | **Different** top-level schema — see §3 |
| `2025-Running-for-Public-Office-8-13-25-FINAL-small.pdf` | N/A | Handbook — not results; co-located in folder |

**Folder also contains** additional historical JSONs (2016–2022, special, runoff) — see [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md).

---

## 2. Grains of data

| Grain | Present in legacy JSON (2024 General sample) | Present in 2026 preferential sample |
|-------|-----------------------------------------------|-------------------------------------|
| **Statewide** | `ElectionInfo`; `Turnout` aggregates (`VotesCast`, `RegisteredVoters`, `VotePercent`, precinct reporting counts) | `ElectionData`; `TurnoutData` aggregates |
| **County** | `Turnout.CountyTurnout[]` — `CountyName`, votes, registration, precinct reporting | `TurnoutData.Locations` pattern (location-based — verify per file) |
| **Contest** | `ContestData[]` — `ContestName`, `TotalVotes`, reporting fields | `ContestData[]` — uses `Choices` / `Locations` (no `ContestName` on first element — **map by `ContestID`**) |
| **Candidate / choice** | `Candidates[]` — `Name`, `PartyName`, `TotalVotes` | `Choices` / `WriteinChoices` — **normalize** to shared internal shape |
| **Precinct / location** | `ContestData[].Counties[].Precincts[]` — `PrecinctName`, per-candidate votes | `Locations` nested under contests — **different keys** |
| **Turnout** | State + per-county in `Turnout` | `TurnoutData` with `BallotsCast`, `Locations`, flags like `HasLocationTurnout` |

---

## 3. Schema variants (critical)

### 3.1 Legacy variant (`ElectionResultsFileKind.ARKANSAS_SOS_JSON_LEGACY`)

Top-level keys: **`ElectionInfo`**, **`Turnout`**, **`ContestData`**.

- **`ElectionInfo`:** `ElectionID` (number), `ElectionName`, `ElectionDate`, `IsOfficial`, …
- **`Turnout.CountyTurnout`:** `CountyName` (mixed casing in nested contest data, e.g. `ARKANSAS` vs `Arkansas` in turnout block — **normalize**).
- **`ContestData[]`:** `ContestName`, `Candidates`, `Counties` with nested `Precincts`.

### 3.2 2026 preferential variant (`ElectionResultsFileKind.ARKANSAS_SOS_JSON_PREFERENTIAL_2026`)

Top-level keys: **`ElectionData`**, **`TurnoutData`**, **`ContestData`**.

- **`ElectionData`:** `ElectionID` is a **string UUID** in sample; `IsOfficial: false` in sample — treat as **provisional** until humans confirm official flag.
- **Contests** use **`Choices`** / **`WriteinChoices`** / **`Locations`** — ingest code must **branch** or **normalize** into a common internal DTO before DB insert.

**Ingest code must not assume** one parser fits all files without a **detector** (top-level keys + election year).

---

## 4. First ingest posture

**Phase 1 (minimal, high value):**

1. **Persist election metadata** — external election id, name, date, official flag, source file hash.
2. **County turnout** — from `Turnout.CountyTurnout` (legacy) or mapped `TurnoutData` (2026).
3. **Contest + candidate totals at state level** — from each contest’s top-level `Candidates` / `Choices`.
4. **County-level contest results** — from `ContestData[].Counties[]` candidate vote arrays (legacy).

**Phase 2:**

5. **Precinct / location results** — ingest when `County` + **`County.slug` / FIPS** alignment and precinct key strategy are defined (see [`election-results-foundation.md`](./election-results-foundation.md)).

---

## 5. Mapping challenges

| Challenge | Detail |
|-----------|--------|
| **County name normalization** | Same county may appear as `Arkansas` vs `ARKANSAS`; strip case, validate against `County` table FIPS/slug |
| **County code / FIPS** | JSON provides **name**, not FIPS — join via **`County.displayName`** or curated alias map (**human QA**) |
| **Precinct / location key** | `PrecinctName` strings; no master precinct table in Prisma today — store **raw** + optional `County` FK first |
| **Contest naming** | `ContestName` free text; primary contests include party suffixes (e.g. `U.S. President - REP`) |
| **Candidate identity** | Name + party strings only — **no** candidate id in JSON; dedupe across counties is **by name+party within contest** unless SOS id added later |
| **Cross-year schema drift** | 2026 preferential structure ≠ 2024 — **versioned parser** required |

---

## 6. Next implementation step

**Packet:** **`DATA-4` / `ELECTION-INGEST-1`** — Prisma migration (`ElectionContest`, `CountyElectionResult`, child candidate rows — per [`election-results-foundation.md`](./election-results-foundation.md)) + CLI or admin-triggered ingest:

- Load JSON → detect variant → validate county set = 75 counties (or explain gaps) → idempotent upsert by `(electionId, contestKey, countyId)` → **human-readable validation report** (sums, missing counties).

**Not in this packet:** public results UI, auto-targeting scores, precinct maps.

---

## 7. Repo inspection (INGEST-OPS overlap)

**What the JSON files prove:** County turnout, nested contests, county splits, and precinct-level vote arrays are **machine-readable** without OCR — **ingest is a engineering + data-model problem**, not a scraping problem.

See also [`election-results-implementation-plan.md`](./election-results-implementation-plan.md).

---

*Last updated: OFFICIAL-INGEST-1 + INGEST-OPS-1 (Arkansas JSON).*
