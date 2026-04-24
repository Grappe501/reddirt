# Election results implementation plan (INGEST-OPS-1) (RedDirt)

**Purpose:** Bridge from **proven JSON shapes** to the **next coding packet** — schema + ingest + QA — without speculative modeling beyond observed files.

**Evidence:** Parsed samples from `2024_General.json`, `2024_Primary.json`, `2026_Preferential_Primary.json` under `H:\SOSWebsite\campaign information for ingestion\electionResults\`.

**Cross-ref:** [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md) · [`election-results-foundation.md`](./election-results-foundation.md) · [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md)

---

## 1. What the JSON files prove

| Capability | Evidence |
|------------|----------|
| **County turnout** | `Turnout.CountyTurnout[]` with votes cast, registered voters, precinct reporting (2024) |
| **Statewide contest results** | `ContestData[]` with `ContestName`, `TotalVotes`, statewide `Candidates` |
| **County-level nested results** | Each contest’s `Counties[]` with county totals and candidate arrays |
| **Precinct / location-level results** | `Counties[].Precincts[]` with `PrecinctName` and per-candidate votes (2024) |
| **Normalization challenges** | County name casing; contest name strings; 2026 **different** hierarchy (`Choices`, `Locations`, UUID `ElectionID`) |
| **Official vs provisional** | `IsOfficial` boolean present — **2026 sample `false`**; loaders must preserve flag |

---

## 2. Minimal first implementation

**Target v1 database population (after migration):**

1. **Election** metadata row — external id, name, date, `isOfficial`, source file hash, ingest batch id.
2. **Statewide turnout** — votes cast, registered voters, reporting precinct counts.
3. **County turnout** — one row per county per election (map `CountyName` → `County.id`).
4. **Contest** rows — stable internal id + `contestKey` string (hash or slug from name + election).
5. **Candidate / choice rows** — `displayName`, `partyLabel`, optional `sortOrder`.
6. **County contest result** — votes per candidate per county for each contest.
7. **Precinct results** — **optional flag** in v1: store raw `PrecinctName` + votes **only** when county FK resolves; otherwise skip with logged reason.

---

## 3. Normalization challenges

| Topic | Mitigation |
|-------|------------|
| **County name** | Normalize to title case; maintain **alias map** for known SOS variants; **reject** unknown with report |
| **FIPS alignment** | Join via `County` table (`displayName`, `slug`) — **no FIPS in JSON** |
| **Precinct key** | Store **raw string** + `countyId`; defer **precinct master** table |
| **Candidate naming** | Key = `(contestId, normalized name, party)`; document collisions for human review |
| **Contest naming** | Store full `ContestName`; primary contests include party suffixes |
| **Schema drift** | `detectArkansasElectionJsonVariant()` — branch parsers; **unit tests** per variant |

---

## 4. Next packet

**Name:** **`ELECTION-INGEST-1`** (or extend **`DATA-4`** naming in unified foundation).

**Deliverables:**

- Prisma models per [`election-results-foundation.md`](./election-results-foundation.md) (adjust field names to match JSON DTO after review).
- **`ingestElectionResultsJson`**: path → parsed → transactional upsert → **`IngestValidationReport`** (markdown or JSON): county coverage, vote sum checks, skipped precincts.
- **Admin or CLI trigger** only — **no** public endpoint in v1.
- **Tests** with **truncated** fixtures (do not commit 15MB JSON — slice small excerpts into `__fixtures__`).

**Not included:** targeting UI, automatic swing-district scoring, candidate crosswalk to `VoterRecord`.

---

*Last updated: Packet INGEST-OPS-1.*
