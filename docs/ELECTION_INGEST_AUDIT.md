# Election ingest completion audit (INGEST-OPS-3 + INGEST-OPS-3B)

**Packet:** **INGEST-OPS-3** / **INGEST-OPS-3B** — Files on disk vs `ElectionResultSource` records; operator runbook and machine-readable output.  
**Scope:** `*.json` under the canonical **election results** folder (SOS-style Arkansas exports). **Not** SOS certification; in-app tabulation only.

**Operator runbook:** [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md) — commands, status meanings, and safe ingest order.

**Raw folder (host-specific):** `H:\SOSWebsite\campaign information for ingestion\electionResults` (override: `ELECTION_AUDIT_DIR` when running the audit script.)

**Non-JSON in folder:** A handbook-style PDF (e.g. `2025-Running-for-Public-Office-…-small.pdf`) is **out of scope** for this table—track under compliance / brain ingest, not `ElectionResult*`.

---

## MIGRATE-OPS-1 — local dev migrations + audit (operator-approved)

**Election Ingest Status from audit JSON:** **COMPLETE** (`dbReachable: true`, **13** ingested, **0** missing — see auto summary below).

| Step | Result |
|------|--------|
| `npm run db:ping` | **OK** — Postgres accepting connections. |
| `npx prisma migrate status` (before) | **Pending** migrations through **`rel2_relational_contact_foundation`**; schema **not** up to date. |
| **`npx prisma migrate deploy`** | **Succeeded** after **two** **fixes** (see **Notes**). **`npx prisma migrate status` (after):** **Database schema is up to date!** (**59** migration folders on disk.) |
| `npx prisma generate` | **OK** |
| `npm run ingest:election-audit:json` / **`:doc`** | **`status: "COMPLETE"`**, `ingestedCount: 13`, `missingCount: 0`, `totalFiles: 13` |

**Notes (transparency):**

1. **Ghost folder:** An **untracked** empty directory **`prisma/migrations/20260423120000_email_workflow_status_enriched`** (no `migration.sql`, **not** in `git`) caused **P3015**; it was **removed** so `migrate deploy` could run.  
2. **PostgreSQL enum transaction:** **`20260431180000_comms_packet7_variant_review_fields`** failed with **P3018** (*new enum value must be committed before use*). **`prisma migrate resolve --rolled-back`** was used; the **UPDATE** backfill was **moved** to a **new** migration **`20260431185000_comms_packet7_variant_status_backfill`** so enum **ADD VALUE** and **UPDATE** run in **separate** transactions.  
3. **INGEST-OPS-3C (2026 preferential):** First full ingest hit Prisma **P2028** (interactive **`$transaction`** default timeout). **`import-json.ts`** now sets **`maxWait` / `timeout`** on that transaction so large files can commit.  
4. **INGEST-OPS-3C file 2 (`2024_General.json`):** Legacy JSON supplies **`ElectionID`** as a **number**; Prisma **`electionIdExternal`** is **`String?`**. **`externalElectionId()`** in **`import-json.ts`** coerces numeric (and string) IDs before **`electionResultSource.create`**.  
5. **INGEST-OPS-3D (stacked slice — `2024_Primary.json`):** Same **legacy** parser as **2024 General**; ingested **local dev** after **`--dry-run`**. CLI reported **unmatched county names** (duplicate casing variants) on the order of **~140** labels — same pattern as **2024 General**; **`countyId`** may be null on those rows until mapping improves.  
6. **INGEST-OPS-3D (stacked slice — `2022_General.json`):** **Legacy** general; larger than **2024** files (**~50k** county-tab rows estimated in dry-run). Full ingest **~8–9 minutes** on typical local Postgres within current **`$transaction`** timeout. Same **~140** unmatched county label pattern as other legacy generals.  
7. **INGEST-OPS-3D-SLICE-5 (`2022_Primary.json`):** **Legacy** primary; **~42.7k** county-tab rows in dry-run; full ingest **~8 minutes** local. Same **~140** unmatched county label pattern.  
8. **INGEST-OPS-3D-SLICE-6 (`2021_Special.json`):** **Legacy** shape; **small** file (**2** contests, **99** county-tab rows in dry-run). Live ingest **~10s**; **0** unmatched counties in CLI for this run.  
9. **INGEST-OPS-3D-SLICE-7 (`2020_Primary_Runoff.json`):** **Legacy**; **3** contests, **65** county-tab rows (dry-run). Live ingest **~9s**; **2** unmatched county labels (**CRAIGHEAD** / **Craighead**) in CLI.  
10. **INGEST-OPS-3D-SLICE-8 (`2020_Preferential_Primary.json`):** **Filename** says preferential, but **`detectArkansasElectionJsonVariant`** classifies this export as **`legacy_election_info`** (same **`ContestData` / `Turnout`** shape as other legacy files). **~16.4k** county-tab rows (dry-run); live ingest **~4.8 min**; **~140** unmatched county labels in CLI (legacy pattern).  
11. **INGEST-OPS-3D-SLICE-9 (`2020_General.json`):** **Legacy** general; **721** contests, **~24.8k** county-tab rows (dry-run); live ingest **~5 min**; **~140** unmatched county labels in CLI.  
12. **INGEST-OPS-3D-SLICE-10 (`2018_Preferential_Primary.json`):** Classified **`legacy_election_info`** (same pattern as **`2020_Preferential_Primary.json`** — note **10**). **261** contests, **~21.9k** county-tab rows (dry-run); live ingest **~3.6 min**; **~140** unmatched county labels in CLI.  
13. **INGEST-OPS-3D-SLICE-11 (`2018_General.json`):** **Legacy** general; **1312** contests, **~44.8k** county-tab rows (dry-run); live ingest **~7.5 min**; **~140** unmatched county labels in CLI.  
14. **INGEST-OPS-3D-SLICE-12 (`2016_Preferential_Primary.json`):** Classified **`legacy_election_info`** (same pattern as **`2018_Preferential_Primary.json`** / **`2020_Preferential_Primary.json`**). Dry-run reported **0** unmatched counties; live ingest **~5.8 min**; CLI **`unmatchedCountyTotal`:** **137** (duplicate casing variants — same pattern as other large legacy files). **333** contests, **~25.6k** county-tab rows.  
15. **INGEST-OPS-3D-SLICE-13 (`2016_General.json`):** **Legacy** general; **791** contests, **~31.8k** county-tab rows (dry-run); live ingest **~6.3 min**; CLI **`unmatchedCountyTotal`:** **140** (legacy casing-variant pattern). **`sourceId`:** `cmochspsf00015trtmia88pu4`.

**Election Ingest Gate:** **satisfied** on **this** **local** **dev** **database** — all **13** canonical JSONs under the audited folder have matching `ElectionResultSource` rows (`npm run ingest:election-audit:json` → **`status: "COMPLETE"`**). **Other environments** still require their own audit. **Documented unlocks (no implementation started in this slice):** **INGEST-OPS-4** (brain/source manifest), **GOTV-2** (contact-plan queues + assignment review), **INTEL-2** (competitor source manifest) — **eligible** for **scheduling** per [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) and [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md); **steering** and **runbooks** still apply.

**Prior:** **DB-OPS-2B** — migrations pending; **MIGRATE-OPS-1** — **local dev** **only**; **production** **not** **touched**.

**Production:** not used; this note describes **local** **visibility** only.

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
| `2016_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_General.json` | 2016 | yes | `cmochspsf00015trtmia88pu4` | **ingested** |  |
| `2016_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_Preferential_Primary.json` | 2016 | yes | `cmochjl770001t59wkho50u9h` | **ingested** |  |
| `2018_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2018_General.json` | 2018 | yes | `cmoch8adr0001wyrmz8uwy2dc` | **ingested** |  |
| `2018_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2018_Preferential_Primary.json` | 2018 | yes | `cmoch29r3000111f6mkx9mp71` | **ingested** |  |
| `2020_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_General.json` | 2020 | yes | `cmocgtril0001m7q5np1q93q2` | **ingested** |  |
| `2020_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_Preferential_Primary.json` | 2020 | yes | `cmocglwyx000110hmhwdm2d2u` | **ingested** |  |
| `2020_Primary_Runoff.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_Primary_Runoff.json` | 2020 | yes | `cmocgjmuu0001dvo3n1wzirew` | **ingested** |  |
| `2021_Special.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2021_Special.json` | 2021 | yes | `cmocghafx000178dzoci5vozt` | **ingested** |  |
| `2022_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2022_General.json` | 2022 | yes | `cmocfqpet0001uinymh1obt3e` | **ingested** |  |
| `2022_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2022_Primary.json` | 2022 | yes | `cmocg46n5000112eaeo9b6m2y` | **ingested** |  |
| `2024_General.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2024_General.json` | 2024 | yes | `cmocfc9t40001g2b87c7fqwbi` | **ingested** |  |
| `2024_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2024_Primary.json` | 2024 | yes | `cmocfjl7n0001ylkxfmkg9tmw` | **ingested** |  |
| `2026_Preferential_Primary.json` | `H:\SOSWebsite\campaign information for ingestion\electionResults\2026_Preferential_Primary.json` | 2026 | yes | `cmocf8k860001horuen3x6lsm` | **ingested** |  |

<!-- ELECTION_AUDIT_TABLE_AUTO:END -->

---

## D. Election ingest status (summary) — **auto-updated**

*Do not hand-edit between the marker comments. Run `npm run ingest:election-audit:doc`.*

<!-- ELECTION_AUDIT_SUMMARY_AUTO:START -->

| Metric | Value |
|--------|--------|
| **Election Ingest Status** | **COMPLETE** |
| **DB reachable** | yes |
| **Ingested (matched) count** | 13 |
| **Missing count** | 0 |
| **Total files scanned** | 13 |
| **Next** | All scanned JSONs have a matching `ElectionResultSource` row. Next: **INGEST-OPS-4** (brain/source manifest) when ready; do not expand GOTV/Comms/Intel past the gate without waiver. |

<!-- ELECTION_AUDIT_SUMMARY_AUTO:END -->

**Definitions (manual):**

- **COMPLETE** — DB reachable, **all** scanned JSONs have a matching `ElectionResultSource` by path, and no open **suspected_partial** / waiver issue you care about.  
- **PARTIAL** — DB reachable, **at least one** file **missing** from the DB.  
- **BLOCKED** — DB **not** readable **or** **required** tables **missing** so the audit query fails; ingested/missing counts are **indeterminate** — do **not** conflate with PARTIAL. (**DB-OPS-2B:** Postgres up but **`ElectionResultSource`** absent until migrations are applied.)

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
- **COMPLETE**

Last verified:
- `2026-04-24T05:57:38.375Z` (script-generated ISO time)

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

*Last updated: **MIGRATE-OPS-1** + **INGEST-OPS-3B** + **INGEST-OPS-3C** + **INGEST-OPS-3D** (local **`migrate deploy`** + enum **split**; **thirteen** canonical election JSONs ingested — **2026** through **2016** list in **§C**; audit **COMPLETE** — **13** / **13** on **this** DB); **Election Ingest Gate** **satisfied** here; **INGEST-OPS-4** / **GOTV-2** / **INTEL-2** **documented** **unlocks** only; see [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md).*
