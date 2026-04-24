# Election ingest completion audit (INGEST-OPS-3 + INGEST-OPS-3B)

**Packet:** **INGEST-OPS-3** / **INGEST-OPS-3B** — Files on disk vs `ElectionResultSource` records; operator runbook and machine-readable output.  
**Scope:** `*.json` under the canonical **election results** folder (SOS-style Arkansas exports). **Not** SOS certification; in-app tabulation only.

**Operator runbook:** [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md) — commands, status meanings, and safe ingest order.

**Raw folder (host-specific):** `H:\SOSWebsite\campaign information for ingestion\electionResults` (override: `ELECTION_AUDIT_DIR` when running the audit script.)

**Non-JSON in folder:** A handbook-style PDF (e.g. `2025-Running-for-Public-Office-…-small.pdf`) is **out of scope** for this table—track under compliance / brain ingest, not `ElectionResult*`.

---

## How to complete this audit

1. **Preconditions:** Postgres reachable from this machine, `DATABASE_URL` set in `RedDirt/.env` (or environment), and the `electionResults` folder present (see runbook).  
2. **Run (machine-readable):** `cd RedDirt` → `npm run ingest:election-audit:json` — check `status`.  
3. **Run (update this doc):** `npm run ingest:election-audit:doc` — refreshes the **auto** sections between HTML comment markers. Optional env: `ELECTION_AUDIT_VERIFIED_AGAINST`, `ELECTION_AUDIT_OPERATOR`, `ELECTION_AUDIT_NOTES`.  
4. **If `status` is PARTIAL:** ingest **missing** files only: **`--dry-run` first**, then `ingest:election-results` per file (newest → oldest).  
5. **If `status` is COMPLETE:** record the completion marker (auto block below) and any human notes; then consider **INGEST-OPS-4** (manifest) for brain/source files.  
6. **If `status` is BLOCKED:** you **cannot** know ingested/missing counts — do **not** report PARTIAL or COMPLETE until DB is up.

**Do not** treat **BLOCKED** as **PARTIAL** or **COMPLETE** in build reports or backlogs.

---

## Operator checklist

- [ ] `npm run dev:db` (or your Postgres) and `npx prisma db ping` / app health as you prefer  
- [ ] `npm run ingest:election-audit:json` — capture `status` and `files[]`  
- [ ] `npm run ingest:election-audit:doc` (with optional env for operator/verified-against)  
- [ ] If PARTIAL: dry-run then apply only missing JSONs per runbook; no blind `--replace` on unknown rows  
- [ ] Commit updated `docs/ELECTION_INGEST_AUDIT.md` or paste handoff block for ChatGPT (see runbook)  
- [ ] **Brain / source** ingest (post-election RAG, etc.): do **not** **promote** missing campaign files to “done” in [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) until election ingest is at least **not BLOCKED** and ideally **COMPLETE** (per policy in that file)

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

### B.1 SQL (read-only) — run in Prisma/Postgres

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

## C. Comparison table (file vs DB) — **auto-updated**

*Do not hand-edit between the marker comments. Run `npm run ingest:election-audit:doc`.*

**Ingest status values (script output):**

- **unknown** — DB unreachable (`BLOCKED`).  
- **missing** — no matching `ElectionResultSource` row.  
- **ingested** — row present.  
- **suspected_partial** — reserved for future QA (low county mapping, etc.); not set by the script today.

<!-- ELECTION_AUDIT_TABLE_AUTO:START -->

| file_name | file_path | expected_year | exists_in_db | db_record_id | ingest_status | notes |
|-----------|-----------|---------------|--------------|--------------|---------------|-------|
| `2016_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_General.json` | 2016 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2016_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_Preferential_Primary.json` | 2016 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2018_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2018_General.json` | 2018 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2018_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2018_Preferential_Primary.json` | 2018 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2020_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_General.json` | 2020 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2020_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_Preferential_Primary.json` | 2020 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2020_Primary_Runoff.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_Primary_Runoff.json` | 2020 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2021_Special.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2021_Special.json` | 2021 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2022_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2022_General.json` | 2022 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2022_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2022_Primary.json` | 2022 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2024_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2024_General.json` | 2024 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2024_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2024_Primary.json` | 2024 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |
| `2026_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2026_Preferential_Primary.json` | 2026 | unknown | — | **unknown** | Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md |

<!-- ELECTION_AUDIT_TABLE_AUTO:END -->

---

## D. Election ingest status (summary) — **auto-updated**

*Do not hand-edit between the marker comments. Run `npm run ingest:election-audit:doc`.*

<!-- ELECTION_AUDIT_SUMMARY_AUTO:START -->

| Metric | Value |
|--------|--------|
| **Election Ingest Status** | **BLOCKED** |
| **DB reachable** | no |
| **Ingested (matched) count** | — (unknown until DB is reachable) |
| **Missing count** | — (unknown until DB is reachable) |
| **Total files scanned** | 13 |
| **Next** | Start Postgres (`npm run dev:db`), set `DATABASE_URL`, then re-run `npm run ingest:election-audit:doc` or `ingest:election-audit:json`. |

<!-- ELECTION_AUDIT_SUMMARY_AUTO:END -->

**Definitions (manual):**

- **COMPLETE** — DB reachable, **all** scanned JSONs have a matching `ElectionResultSource` by path, and no open **suspected_partial** / waiver issue you care about.  
- **PARTIAL** — DB reachable, **at least one** file **missing** from the DB.  
- **BLOCKED** — DB **not** readable; ingested/missing counts are **indeterminate** — do **not** conflate with PARTIAL.

---

## Completion marker (script + env)

*Auto block below: filled by `npm run ingest:election-audit:doc`. Set `ELECTION_AUDIT_VERIFIED_AGAINST`, `ELECTION_AUDIT_OPERATOR`, `ELECTION_AUDIT_NOTES` as needed for handoff.*

Format for human copy/paste (mirrors the auto block):

```text
Election Ingest Status:
- BLOCKED | PARTIAL | COMPLETE
Last verified:
- <ISO timestamp>
Verified against:
- <database / environment name>
Operator:
- <name or initials>
Notes:
- <free text>
```

<!-- ELECTION_AUDIT_MARKER_AUTO:START -->

**Completion marker (auto — edit env vars to fill operator line before handoff if needed)**

Election Ingest Status:
- **BLOCKED**

Last verified:
- `2026-04-24T04:12:55.703Z` (script-generated ISO time)

Verified against:
- (set `ELECTION_AUDIT_VERIFIED_AGAINST` when running `ingest:election-audit:doc` — e.g. `local Docker postgres reddirt` or production name)

Operator:
- _(set `ELECTION_AUDIT_OPERATOR` — initials or name)_

Notes:
- —

<!-- ELECTION_AUDIT_MARKER_AUTO:END -->

---

## E. Drift and partial ingest

- **Path drift:** If a file was ingested from a different absolute path, matching must use the stored `sourcePath` string (re-ingest with `--replace` and consistent paths if needed).  
- **Provenance only:** Rows are **not** certification; treat **official** flags and coverage warnings per [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md) and truth snapshot docs.

---

*Last updated: INGEST-OPS-3B — auto sections via `ingest:election-audit:doc`; see [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md).*
