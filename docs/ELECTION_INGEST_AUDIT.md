# Election ingest completion audit (INGEST-OPS-3)

**Packet:** INGEST-OPS-3 — Files on disk vs `ElectionResultSource` records.  
**Scope:** `*.json` under the canonical **election results** folder (SOS-style Arkansas exports). **Not** SOS certification; in-app tabulation only.

**Raw folder (host-specific):** `H:\SOSWebsite\campaign information for ingestion\electionResults`  
(Override for tools: `ELECTION_AUDIT_DIR` when running `npm run ingest:election-audit`.)

**Non-JSON in folder:** A handbook-style PDF (e.g. `2025-Running-for-Public-Office-…-small.pdf`) is **out of scope** for this table—track under compliance / brain ingest, not `ElectionResult*`.

---

## A. File set (election JSON on disk)

| file_name | file_path | expected_year | type (from filename) |
|-----------|-----------|---------------|------------------------|
| `2016_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_General.json` | 2016 | General |
| `2016_Preferential_Primary.json` | `…\electionResults\2016_Preferential_Primary.json` | 2016 | Preferential Primary |
| `2018_General.json` | `…\electionResults\2018_General.json` | 2018 | General |
| `2018_Preferential_Primary.json` | `…\electionResults\2018_Preferential_Primary.json` | 2018 | Preferential Primary |
| `2020_General.json` | `…\electionResults\2020_General.json` | 2020 | General |
| `2020_Preferential_Primary.json` | `…\electionResults\2020_Preferential_Primary.json` | 2020 | Preferential Primary |
| `2020_Primary_Runoff.json` | `…\electionResults\2020_Primary_Runoff.json` | 2020 | Primary Runoff |
| `2021_Special.json` | `…\electionResults\2021_Special.json` | 2021 | Special |
| `2022_General.json` | `…\electionResults\2022_General.json` | 2022 | General |
| `2022_Primary.json` | `…\electionResults\2022_Primary.json` | 2022 | Primary |
| `2024_General.json` | `…\electionResults\2024_General.json` | 2024 | General |
| `2024_Primary.json` | `…\electionResults\2024_Primary.json` | 2024 | Primary |
| `2026_Preferential_Primary.json` | `…\electionResults\2026_Preferential_Primary.json` | 2026 | Preferential Primary |

**Total files:** 13

---

## B. Database state

**Model:** `ElectionResultSource` (`prisma/schema.prisma`) — key fields: `id`, `sourcePath`, `sourceName`, `electionName`, `electionDate`, `parserVariant`, `importedAt`, `metadataJson`, `isOfficial`, etc.

### B.1 Audit run (this pass)

| Condition | Value |
|-----------|--------|
| **DB reachable during audit** | **No** — local `DATABASE_URL` target was not accepting connections (e.g. Docker Postgres not running). **Per-environment truth** requires a successful read against the **intended** database. |
| **Authoritative row dump** | Re-run: `cd RedDirt && npm run ingest:election-audit` with Postgres up (`npm run dev:db` or your env). |

### B.2 SQL (read-only) — run in Prisma/Postgres

Use this to list provenance for manual comparison or CI:

```sql
SELECT
  id,
  "sourcePath",
  "sourceName",
  "electionName",
  "electionDate",
  "parserVariant",
  "importedAt",
  "metadataJson",
  "isOfficial"
FROM "ElectionResultSource"
ORDER BY "electionDate" ASC, "importedAt" ASC;
```

Match **disk → DB** on normalized absolute `sourcePath` (the ingest CLI stores `path.resolve` of the file passed to `--file`).

---

## C. Comparison table (file vs DB)

`exists_in_db` and `ingest_status` are **not verified** for this document revision because the database was unavailable. Re-run the audit script or SQL above, then update this table.

| file_name | file_path | expected_year | exists_in_db | db_record_id | ingest_status | notes |
|-----------|-----------|---------------|--------------|--------------|---------------|-------|
| `2016_General.json` | `H:\SOSWebsite\…\2016_General.json` | 2016 | **verify** | — | **unknown** | Populate after DB read |
| `2016_Preferential_Primary.json` | `…\2016_Preferential_Primary.json` | 2016 | **verify** | — | **unknown** | |
| `2018_General.json` | `…\2018_General.json` | 2018 | **verify** | — | **unknown** | |
| `2018_Preferential_Primary.json` | `…\2018_Preferential_Primary.json` | 2018 | **verify** | — | **unknown** | |
| `2020_General.json` | `…\2020_General.json` | 2020 | **verify** | — | **unknown** | |
| `2020_Preferential_Primary.json` | `…\2020_Preferential_Primary.json` | 2020 | **verify** | — | **unknown** | |
| `2020_Primary_Runoff.json` | `…\2020_Primary_Runoff.json` | 2020 | **verify** | — | **unknown** | |
| `2021_Special.json` | `…\2021_Special.json` | 2021 | **verify** | — | **unknown** | |
| `2022_General.json` | `…\2022_General.json` | 2022 | **verify** | — | **unknown** | |
| `2022_Primary.json` | `…\2022_Primary.json` | 2022 | **verify** | — | **unknown** | |
| `2024_General.json` | `…\2024_General.json` | 2024 | **verify** | — | **unknown** | |
| `2024_Primary.json` | `…\2024_Primary.json` | 2024 | **verify** | — | **unknown** | |
| `2026_Preferential_Primary.json` | `…\2026_Preferential_Primary.json` | 2026 | **verify** | — | **unknown** | Preferential parser branch |

**Ingest status values (for updates):**

- **missing** — no `ElectionResultSource` row whose `sourcePath` matches the file (normalized).  
- **ingested** — row present; child contest/county/precinct rows created per import.  
- **suspected_partial** — row present but **anomaly** (e.g. from app: low `countyId` mapping ratio in `getElectionResultCoverageSummary` / truth snapshot warnings, or dry-run count mismatch vs re-import). **Flag during QA**, not assumed here.

---

## D. Election ingest status (summary)

| Metric | Value |
|--------|--------|
| **Election Ingest Status** | **BLOCKED** — **cannot** assert COMPLETE or PARTIAL until a successful DB read confirms `ElectionResultSource` rows for the **target** environment. |
| **Total JSON files (expected set)** | 13 |
| **Ingested count** | **Unknown** (DB unreachable) |
| **Missing count** | **Unknown** (DB unreachable) |
| **Required next step** | Start DB → `npm run ingest:election-audit` or run §B.2 SQL → update this doc’s comparison table. |

**Definitions:**

- **COMPLETE** — all **required** JSONs for the campaign have a matching `ElectionResultSource` (and no blocking QA flags), or a **documented** waiver.  
- **PARTIAL** — at least one required file **missing** or **suspected_partial** with an open follow-up.  
- **BLOCKED** — **cannot** read DB (or no **authoritative** environment chosen).

---

## E. Drift and partial ingest

- **Path drift:** If a file was ingested from a different absolute path, matching must use the stored `sourcePath` string (re-ingest with `--replace` and consistent paths if needed).  
- **Provenance only:** Rows are **not** certification; treat **official** flags and coverage warnings per [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md) and truth snapshot docs.

---

*Last updated: INGEST-OPS-3 — audit doc created; **DB state BLOCKED** at initial write. Refresh table after `npm run ingest:election-audit` with a live database.*
