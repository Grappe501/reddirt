# Source ingest manifest — `electionResults`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `electionResults` (flat; **14** files)  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (`13` / `13` canonical JSONs on **this** DB).

**Scope split (important):**

- **`.json`** — **election tabulation** → **`ElectionResultSource`** + children; authoritative inventory + DB match in [`ELECTION_INGEST_AUDIT.md`](../ELECTION_INGEST_AUDIT.md). **Not** brain/RAG primary path.
- **`.pdf`** (handbook) — **out of scope** for `ElectionResult*` per audit doc → **compliance** / **`ComplianceDocument`** / training ingest (see [`official-document-ingest-strategy.md`](../official-document-ingest-strategy.md)).

**Dry-run (toolchain check):** `npm run ingest:election-results -- --file "…\2021_Special.json" --dry-run` → **SKIP (already imported)** — confirms CLI + DB sees existing source; **no** duplicate parse work in dry-run mode.

---

## File inventory

| file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `2016_General.json` | `.json` | 20768239 | 2026-04-23T20:18:27.154Z | Election tabulation (SOS export) | `npm run ingest:election-results -- --file "<path>"` | **ingested** (this DB) | SOS export date, file hash if re-import | See [`ELECTION_INGEST_AUDIT.md`](../ELECTION_INGEST_AUDIT.md) |
| `2016_Preferential_Primary.json` | `.json` | 18895275 | 2026-04-23T20:18:06.521Z | Election tabulation | same | **ingested** | same | Legacy-shaped preferential filename |
| `2018_General.json` | `.json` | 24543618 | 2026-04-23T20:17:43.671Z | Election tabulation | same | **ingested** | same | |
| `2018_Preferential_Primary.json` | `.json` | 12237545 | 2026-04-23T20:17:24.906Z | Election tabulation | same | **ingested** | same | |
| `2020_General.json` | `.json` | 16283642 | 2026-04-23T20:17:07.248Z | Election tabulation | same | **ingested** | same | |
| `2020_Preferential_Primary.json` | `.json` | 14723491 | 2026-04-23T20:16:36.044Z | Election tabulation | same | **ingested** | same | |
| `2020_Primary_Runoff.json` | `.json` | 34702 | 2026-04-23T20:16:49.305Z | Election tabulation | same | **ingested** | same | Small file |
| `2021_Special.json` | `.json` | 64866 | 2026-04-23T20:16:12.882Z | Election tabulation | same | **ingested** | same | Dry-run check file this run |
| `2022_General.json` | `.json` | 26560422 | 2026-04-23T20:15:43.931Z | Election tabulation | same | **ingested** | same | |
| `2022_Primary.json` | `.json` | 27088037 | 2026-04-23T20:15:24.849Z | Election tabulation | same | **ingested** | same | |
| `2024_General.json` | `.json` | 15776776 | 2026-04-23T20:11:23.686Z | Election tabulation | same | **ingested** | same | |
| `2024_Primary.json` | `.json` | 15082701 | 2026-04-23T20:10:56.254Z | Election tabulation | same | **ingested** | same | |
| `2026_Preferential_Primary.json` | `.json` | 1612502 | 2026-04-23T20:09:57.313Z | Election tabulation | same | **ingested** | same | Preferential variant |
| `2025-Running-for-Public-Office-8-13-25-FINAL-small.pdf` | `.pdf` | 2152695 | 2026-04-23T20:07:20.703Z | Compliance / SOS handbook | **`ComplianceDocument`** upload path **or** `ingest-campaign-folder` after policy review | **not_election_json** | Agency, edition, **`approvedForAiReference`** gating | **Not** `ElectionResult*` — per [`ELECTION_INGEST_AUDIT.md`](../ELECTION_INGEST_AUDIT.md) non-JSON note |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\electionResults\`

---

## Parser / backlog

| Asset type | Action |
|------------|--------|
| **JSON** | **`ingest:election-results`** (`--dry-run` then live); **`ingest:election-audit:json`** for disk↔DB; runbook [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](../ELECTION_INGEST_OPERATOR_RUNBOOK.md). |
| **Handbook PDF** | Do **not** route through election results CLI; track under **compliance** / **official docs** ([`compliance-document-ingest-foundation.md`](../compliance-document-ingest-foundation.md)). |

---

## Safety

- Election JSON **≠** SOS certification — in-app tabulation only.  
- **No** brain manifest row should **replace** [`ELECTION_INGEST_AUDIT.md`](../ELECTION_INGEST_AUDIT.md) for **ingest status** of JSONs.  
- Re-import JSON only with **`--replace`** and intentional DB target.
