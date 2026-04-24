# Election results schema and ingest (DATA-4 + ELECTION-INGEST-1)

**Purpose:** Operational reference for **Prisma tabulation storage**, **variant-aware JSON ingest**, and how this feeds **DATA / BRAIN-OPS / GOTV planning** later—**without** turnout math, voter-level vote history, or GOTV product UI.

**PROTO-1:** Read-model and ingest-first; bounded 2-packet bundle with **ELECTION-INGEST-1** (ingest path + provenance) and **DATA-4** (durable schema + read helpers).

---

## Schema summary

| Model | Role |
|-------|------|
| **`ElectionResultSource`** | One row per import: path, type (`JSON_FILE`, …), election name/date, optional external id, **`isOfficial`**, **`parserVariant`**, **`importedAt`**, optional **`metadataJson`**. |
| **`ElectionContestResult`** | Contest-level rollup for a source (name, optional type/jurisdiction, optional total votes). |
| **`ElectionCountyResult`** | County tabulation slice: optional **`contestId`**, optional **`countyId`** FK → **`County`**, raw name/FIPS, turnout-style fields where present, optional **`metadataJson`**. |
| **`ElectionCandidateResult`** | Candidate totals at contest scope (optional **`countyResultId`** for county-scoped candidates). |
| **`ElectionPrecinctResult`** | Precinct or **sub-location** row (2026 turnout “locations” map here); optional **`countyId`**, raw strings, optional **`metadataJson`**. |
| **`ElectionPrecinctCandidateResult`** | Per-precinct candidate breakdown when JSON provides it. |

**Relations:** `County` has `electionCountyResults` and `electionPrecinctResults`. Cascades from source/contest as defined in `schema.prisma`.

**Migration:** `prisma/migrations/20260513120000_data4_election_ingest_foundation/migration.sql` — apply with `npx prisma migrate deploy` (or dev equivalent) on each environment; **generating** client does not apply SQL.

---

## Parser variants

Detected in `src/lib/campaign-engine/election-results-ingest/variants.ts`:

| Variant id | Top-level keys | Notes |
|------------|----------------|--------|
| **`legacy_election_info`** | `ElectionInfo` + `Turnout` + `ContestData[]` | Legacy Arkansas export shape. |
| **`preferential_election_data`** | `ElectionData` + `TurnoutData` + `ContestData[]` | 2026-ish preferential / turnout-rich shape. |

Unrecognized files are skipped with a clear message (no partial write for that file).

---

## Commands

From repo root (`RedDirt/`), with **`DATABASE_URL`** set:

**One election JSON per CLI run.** Prefer **`--file`**. If you omit **`--file`**, the default folder (or **`--path`**) must contain **exactly one** `*.json`; if there are zero or multiple files, the CLI exits with instructions—run again with **`--file`** for each election you add.

```bash
# Recommended: one explicit file per outing (add another election = another command)
npm run ingest:election-results -- --file "H:\SOSWebsite\campaign information for ingestion\electionResults\example.json"

# Default folder — only works when that folder has exactly one .json
npm run ingest:election-results

# Explicit directory — same rule (exactly one .json)
npm run ingest:election-results -- --path "H:\SOSWebsite\campaign information for ingestion\electionResults"

# Parse-only summary (no DB writes)
npm run ingest:election-results -- --dry-run --file "H:\SOSWebsite\campaign information for ingestion\electionResults\example.json"

# Re-import same file path (deletes prior rows for that sourcePath, then loads)
npm run ingest:election-results -- --replace --file "..."
```

**Implementation:** `scripts/ingest-election-results-json.ts` → `importElectionResultsJsonFile` in `src/lib/campaign-engine/election-results-ingest/import-json.ts`.

---

## Raw folder path

Canonical intake folder (operator machine): **`H:\SOSWebsite\campaign information for ingestion\electionResults`** — folder name is **`electionResults`** (not `election-results`).

---

## Validation behavior

- **One file per invocation:** no batch import of every JSON in a folder; multiple files require separate runs with **`--file`**.
- **Per file:** variant detection → parse → transactional load (or dry-run counts).
- **County matching:** FIPS normalization + normalized county names; **unmatched** counties do **not** fail the whole import; names appear in CLI **summary** (`unmatchedCounties` / similar).
- **Idempotency:** same `sourcePath` skipped unless **`--replace`** (then delete-by-path and reload).
- **No automatic deletes** without **`--replace`**.

---

## What is ingested

- Source metadata and **`parserVariant`** string.
- Contests and candidate totals (statewide and county-scoped where JSON provides).
- County turnout / results rows (including turnout-only rows with null contest when shape allows).
- Precinct or location-level rows when present (legacy precincts; preferential turnout sub-locations).
- Raw fragments in **`metadataJson`** where useful for audit and future parsers.

---

## What is not ingested

- Per-voter vote history (no link to **`VoterRecord`**).
- Certified SOS “final truth” semantics (operator sets **`isOfficial`**; snapshot **truthClass** still distinguishes PROVISIONAL vs AUTHORITATIVE).
- Normalized precinct master or crosswalk to voter file **`precinct`** strings (**PRECINCT-1** is future).
- Any turnout **modeling**, scoring, or targeting math.

---

## Feeds DATA / BRAIN-OPS / GOTV later

- **DATA / targeting:** `targeting.ts` lists election tabulation models as **`historical_election_tabulation`** (planning context only).
- **BRAIN-OPS:** `truth-snapshot.ts` **`electionData`** metric reflects **`ElectionResultSource`** / coverage counts; warns on low **`countyId`** mapping ratio.
- **GOTV planning:** [`gotv-strategic-readiness-foundation.md`](./gotv-strategic-readiness-foundation.md) ties phases and precinct coverage **concepts** to these rows—**no** scheduler or assignment engine in this packet.

---

## Lanes advanced / not disturbed (bundle discipline)

**Advanced:** DATA / Targeting, ELECTION-INGEST, BRAIN-OPS truth inputs, GOTV **planning** foundation (doc only).

**Not disturbed:** REL-2 persistence, volunteer UI, GAME/XP, auto-routing, comms sends, compliance filing automation.

**Why safe as 2-packet bundle:** One migration family + one ingest CLI + narrow read helpers + snapshot tweak + docs—no new UI surfaces, no sends, no relational model.

**Unlocks next:** **PRECINCT-1** normalization; **GOTV-1** phase read model; **FIELD-2** staffing; **REL-2**; **GOALS-BREAKDOWN-1** (see GOTV doc §7).

---

*DATA-4 + ELECTION-INGEST-1 — Last updated: 2026-04-23.*
