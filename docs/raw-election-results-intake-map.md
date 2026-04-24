# Raw election results intake map (INGEST-OPS-1) (RedDirt)

**Purpose:** Inventory of the **local** election results intake folder and **ingest readiness** per file family.

---

## 1. What files were found

**Path inspected:** `H:\SOSWebsite\campaign information for ingestion\electionResults`  
**Environment:** Cursor agent shell on Windows (2026-04-23). **If this path is unavailable** on another machine, treat the list below as **example** and re-list locally.

| File | Size category |
|------|----------------|
| `2016_General.json` | Large JSON |
| `2016_Preferential_Primary.json` | Large JSON |
| `2018_General.json` | Large JSON |
| `2018_Preferential_Primary.json` | Large JSON |
| `2020_General.json` | Large JSON |
| `2020_Preferential_Primary.json` | Large JSON |
| `2020_Primary_Runoff.json` | Large JSON |
| `2021_Special.json` | Large JSON |
| `2022_General.json` | Large JSON |
| `2022_Primary.json` | Large JSON |
| `2024_General.json` | Large JSON |
| `2024_Primary.json` | Large JSON |
| `2026_Preferential_Primary.json` | Large JSON |
| `2025-Running-for-Public-Office-8-13-25-FINAL-small.pdf` | Handbook (not tabulated results) |

---

## 2. File types / shapes

| Type | Files | Shape notes |
|------|-------|-------------|
| **JSON** | All `*.json` above | **Two families:** (1) `ElectionInfo`/`Turnout`/`ContestData` (legacy); (2) `ElectionData`/`TurnoutData`/`ContestData` (2026 preferential sample) |
| **PDF** | Handbook | SBEC / candidate handbook — **compliance knowledge**, not results |

**Not observed** in this folder: CSV, XLSX, PDF tabulations.

---

## 3. Ingest readiness

| File family | Readiness | Notes |
|-------------|-----------|--------|
| 2024 General / Primary JSON | **Ready now** (engineering) | Legacy schema; county + contest + precinct nesting verified |
| 2016–2022 JSON | **Ready after** parser + **spot-check** | Assume legacy shape — **validate** first lines / keys per file |
| 2026 Preferential Primary | **Needs normalization** | Different top-level keys; `Choices`/`Locations` vs `Candidates`/`Counties` |
| Handbook PDF | **Compliance doc** path | `ComplianceDocument`, not `Election*` tables |

---

## 4. Recommended ingest order

1. **`2024_General.json`** — full reporting + official flag in sample; exercises county + precinct paths.
2. **`2024_Primary.json`** — multi-contest + party-labeled contest names.
3. **One older file (e.g. `2020_General.json`)** — regression test for stable schema.
4. **`2026_Preferential_Primary.json`** — forces **second parser branch** before assuming one code path.
5. **Remaining JSONs** — batch after validation report template exists.
6. **Handbook PDF** — separate **COMP-2** upload track.

---

## 5. Access limitations

- Listing was performed from **this** Windows host where `H:\SOSWebsite\…` is mounted. **CI, Linux devcontainers, or other clones** may not have the same path — use **repo-relative copies** or documented **S3** paths if the team standardizes artifact storage.
- **RedDirt git repo** does **not** necessarily include these JSONs (they may live **outside** `RedDirt/`). Ingest jobs should accept **configurable** input paths.

---

**Cross-ref:** [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md) · [`election-results-implementation-plan.md`](./election-results-implementation-plan.md)

---

*Last updated: Packet INGEST-OPS-1.*
