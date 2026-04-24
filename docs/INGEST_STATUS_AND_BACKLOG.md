# Ingest status and backlog (INGEST-OPS-2 + INGEST-OPS-3 + INGEST-OPS-3B + INTEL-OPS-1 pointer)

**Packet:** **INGEST-OPS-2** — Election ingest status, brain/source backlog, standing queue protocol. **INGEST-OPS-3** — election file ↔ DB comparison: [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md). **INGEST-OPS-3B** — **operator runbook** [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md), `--json` / `--write-doc` audit output, and **completion rules** (BLOCKED ≠ PARTIAL).  
**File:** `docs/INGEST_STATUS_AND_BACKLOG.md`  
**Stack:** `RedDirt/` (Next.js + Prisma; ingest CLIs in `scripts/`).  
**Cross-ref:** [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md) · [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) · [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) — **INGEST-OPS-2 standing rule** · **Election Ingest Gate (INGEST-OPS-3)** · **Generated file inventory** → [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md) (run `npm run ingest:inventory` from `RedDirt/`).

**Safety:** This document is **blueprint and inspection** only. **Do not** run production imports or mutate campaign data from this file. Use **`--dry-run`** on election ingest first; use dedicated scripts only as documented.

**INGEST-OPS-3B rule (builds + backlog):** **BLOCKED** (database unreachable) is **not** “almost done” and **must not** be reported or treated as **PARTIAL** or **COMPLETE** in the backlog, gate, or division status. Only **`npm run ingest:election-audit:json`** with `dbReachable: true` supports those labels. **Brain / non-election** ingest expansion (queuing more source files) should wait until election ingest is at least **not BLOCKED** for the **intended** environment, and per standing rules **ideally** **COMPLETE** before shifting priority away from the election missing-file queue (see **Election Ingest Gate** in [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md)).

---

## 1. Current ingest architecture

| Layer | Role |
|-------|------|
| **Prisma / PostgreSQL** | Durable store for voter warehouse (`VoterFileSnapshot`, `VoterRecord`, …), election tabulation (`ElectionResultSource` + child tables from DATA-4), finance/compliance, comms, owned media, etc. |
| **Campaign engine** | Read helpers (e.g. `election-results.ts`, `targeting.ts`, `truth-snapshot.ts`) and ingest modules under `src/lib/campaign-engine/`. |
| **CLI scripts** | `package.json` scripts: `voter-file:import`, `ingest:election-results`, `ingest:docs`, `ingest:county-wikipedia`, `ingest:campaign-brain`, `ingest:campaign-info-folder` (see §3), `ingest:folder`, `media:index-roots` / `*:dry`, `audit/reconcile:…`, etc. |
| **External / host folders** | Canonical **raw** election JSON path in docs: `H:\SOSWebsite\campaign information for ingestion\electionResults` (host-specific; not guaranteed in CI). Broader **campaign information** tree sits alongside `RedDirt/` in the monorepo layout **when present**. |
| **Provenance (election)** | `ElectionResultSource` stores `sourcePath`, `parserVariant`, `importedAt`, `metadataJson`; see [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md). |

**Design point:** **Election tabulation in the app is not SOS certification** — it is **structured storage** for planning and coverage signals (`getElectionResultCoverageSummary`, truth snapshot).

---

## 2. Election ingest status

### 2.1 What is implemented (complete in repo)

- **Schema + migration:** `20260513120000_data4_election_ingest_foundation` — `ElectionResultSource`, `ElectionContestResult`, `ElectionCountyResult`, `ElectionCandidateResult`, `ElectionPrecinctResult`, `ElectionPrecinctCandidateResult`.  
- **Parser / import:** `src/lib/campaign-engine/election-results-ingest/import-json.ts` + `variants.ts` — **legacy** and **2026 preferential** Arkansas JSON shapes.  
- **CLI:** `scripts/ingest-election-results-json.ts` — `npm run ingest:election-results -- --file <path>`; optional `--dry-run`, `--replace`; one JSON per run; default directory only if **exactly one** `*.json`.  
- **Read API:** `election-results.ts` — listing, coverage summary for workbench / `getTruthSnapshot`.  
- **Docs:** [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md), [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) (per-file list under `electionResults`).

### 2.2 What is operationally incomplete (typical)

- **Not all JSON files** listed in the intake map have necessarily been **loaded into a given environment’s database** — ingest is **per DB**, **manual/CLI** (no auto scheduler in product).  
- **County name → `countyId` mapping** may surface **unmatched** names; truth snapshot can warn on low mapping ratio.  
- **PRECINCT-1** (crosswalk / normalization) is **not** done — `VoterRecord.precinct` remains a **string**; election precinct rows are **raw ingest** grains.  
- **Handbook / PDF** in the results folder is **not** an election table ingest — it belongs to **compliance** / `ComplianceDocument` path per existing docs.

### 2.3 Exact next **election-ingest** packet (recommended order)

**Goal:** Close **coverage** and **parser confidence** for **all election JSONs** the campaign cares about, using **safe sequencing**.

1. **`2024_General.json`** (if not already in target DB) — exercises full legacy path + official flags as documented.  
2. **`2024_Primary.json`** — multi-contest + party-labeled names.  
3. **One historical spot-check** (e.g. `2020_General.json`) — regression for stable legacy shape.  
4. **`2026_Preferential_Primary.json`** — explicit **preferential** branch; validate row counts in **`--dry-run`** first.  
5. **Remaining JSONs** in [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) — one file per CLI invocation; re-run **dry-run** if upstream files change.  
6. **Handbook PDF** — **exclude** from `ElectionResult*` path; track under **compliance** queue if needed.

**Command template:**

```text
cd RedDirt
npm run ingest:election-results -- --dry-run --file "H:\SOSWebsite\campaign information for ingestion\electionResults\<file>.json"
```

Then remove `--dry-run` only when the dry-run counts look sane and DB is the correct environment.

**Packet ID:** This operational sequence is the practical **“election ingest completion”** work; **INGEST-OPS-3** = formal **audit** — log + comparison table: [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md), helper `npm run ingest:election-audit`.

### 2.4 Active Election Ingest Queue (until DB verification completes)

**Rule:** When [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) shows a file as **ingested** with no **suspected_partial** follow-up, remove it from this queue in a doc pass (or move to a short **“Completed (verified)”** list there).

**Current queue:** All **13** canonical JSONs under `…\electionResults\` are **pending** definitive DB confirmation in each environment. No files are moved to **completed** in this document until the audit table is updated from a live `ElectionResultSource` read.

| Priority (newest → oldest) | file_name |
|-----------------------------|-----------|
| 1 | `2026_Preferential_Primary.json` |
| 2 | `2024_General.json` |
| 3 | `2024_Primary.json` |
| 4 | `2022_General.json` |
| 5 | `2022_Primary.json` |
| 6 | `2021_Special.json` |
| 7 | `2020_Primary_Runoff.json` |
| 8 | `2020_Preferential_Primary.json` |
| 9 | `2020_General.json` |
| 10 | `2018_Preferential_Primary.json` |
| 11 | `2018_General.json` |
| 12 | `2016_Preferential_Primary.json` |
| 13 | `2016_General.json` |

**Next actions (per file, after audit dry-run looks sane):**

```text
cd RedDirt
npm run dev:db
npm run ingest:election-audit
npm run ingest:election-results -- --dry-run --file "H:\SOSWebsite\campaign information for ingestion\electionResults\<file>.json"
```

Then, only for the **intended** database, drop `--dry-run` and run the same command once per file. Use `--replace` if re-importing the same path.

### 2.5 DB-OPS-1 — local audit visibility (still **BLOCKED**)

A **DB-OPS-1** pass attempted to bring **Postgres** up and re-run the election audit. **Result:** `ingest:election-audit:json` remains **`status: BLOCKED`** because **Docker** did not start the **db** service (Docker Desktop engine not running). **No** **COMPLETE** or **PARTIAL** determination is possible until **`dbReachable: true`**.

- **Blocker (documented):** start **Docker Desktop**, then `npm run dev:db` from `RedDirt/`, then re-run **`ingest:election-audit:json`** / **`:doc`**. Details: [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) **§ DB-OPS-1**.  
- **INGEST-OPS-4** (manifest) and **post-election** **brain** **queue** **expansion** remain **gated** per existing rules until the audit can report **PARTIAL** or **COMPLETE** with a live **DB** (or an **explicit** **waiver**).

---

## 3. Existing scripts and tools (inventory)

| Script / command | Domain | DB? | Notes |
|------------------|--------|-----|--------|
| `npm run ingest:election-results` | Election | Yes | **Dry-run** safe (parse only). |
| `npm run voter-file:import` | Voter file | Yes | **High impact** — only with explicit env and procedures. |
| `npm run ingest:docs` | RAG / docs | Yes | Content indexing. |
| `npm run ingest:county-wikipedia` | County / research | Yes | |
| `npm run ingest:campaign-brain` | Campaign brain / media | Yes | |
| `npm run ingest:campaign-info-folder` | Multi (folder) | Yes | Baked default path; `--public` etc. in `package.json` example. |
| `npm run ingest:folder` | Multi | Yes | `ingest-campaign-folder.ts` |
| `npm run ingest:volunteer-onboarding` / `ingest:briefings` / `ingest:dnc-playbook` | Docs / training | Yes | |
| `npm run media:index-roots` / `media:index-roots:dry` | Media roots | No / read | **Dry** variant safe. |
| `npm run audit:campaign-ingestion` / `reconcile:campaign-folder` | Audit | Read-heavy | |
| `npm run ingest:inventory` | **Inventory** | **No** | Writes **`docs/INGEST_INVENTORY_GENERATED.md`** only. |
| `npm run ingest:election-audit` | Election audit | **Read** (if DB up) | Human-readable disk vs `ElectionResultSource`. |
| `npm run ingest:election-audit:json` | Election audit | **Read** (if DB up) | **JSON** for CI/handoff; exit **0** if **BLOCKED**. |
| `npm run ingest:election-audit:doc` | Election audit | **Read** (if DB up) | Updates auto sections in **[`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md)**. See **[`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md)**. |

**Import-json (election):** `src/lib/campaign-engine/election-results-ingest/import-json.ts` — not a standalone binary; used by the election CLI.

---

## 4. Models and tables (election + voter file — condensed)

| Model | Purpose |
|-------|---------|
| `ElectionResultSource` | Provenance for one import (path, parser variant, election metadata, `importedAt`). |
| `ElectionContestResult` | Contests for that source. |
| `ElectionCountyResult` | County-level tabulation rows (optional `countyId` FK). |
| `ElectionCandidateResult` | Candidates per contest / county result. |
| `ElectionPrecinctResult` / `ElectionPrecinctCandidateResult` | Precinct-level grains. |
| `VoterFileSnapshot` / `VoterRecord` | Voter warehouse (separate from election results). |
| `VoterSignal`, `VoterModelClassification`, `VoterInteraction`, `VoterVotePlan` | Signals / provisional tiers / GOTV planning inputs — not election **tabulation**. |

**Full diagram:** `prisma/schema.prisma` + [`database-table-inventory.md`](./database-table-inventory.md).

---

## 5. What appears **complete** vs **incomplete**

| Area | Complete enough | Still open |
|------|-----------------|------------|
| **Election JSON → DB** | Code path, migration, dry-run, replace | **Run** ingest for each desired file per environment; **QA** county matching + preferential file |
| **Truth / reporting consumption** | `getElectionResultCoverageSummary` in snapshot | **None** (by design) for “turnout math” — not built |
| **Voter file** | Snapshots, import CLI | Ongoing file deliveries; not this packet’s scope |
| **Brain / loose files** | Many **scripts** for docs/media | **No** single normalized **manifest** of all non-repo files; **INGEST-OPS-4** |
| **Provenance (non-election)** | Pattern exists in several domains | **INGEST-OPS-5/6** for unified **parser version + review UI** |
| **Opposition intelligence sources** (queue) | **Blueprint** [`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md) (**INTEL-OPS-1**) | **Queue** **after** **election** **ingest** **COMPLETE** (or **explicit** **waiver** of the **election** **gate** for a **defined** **scope**); **always** require **source** **provenance** — see **§6.4** |

---

## 6. Brain / source folder — inventory and placement

### 6.1 Primary folder (documented in repo)

The **`H:\SOSWebsite\campaign information for ingestion`** tree (sibling to `RedDirt/` in the full **SOSWebsite** working tree) is the **de facto** campaign **drop zone** referenced across docs (subfolders include at least **`electionResults`**; other material may include spreadsheets, media, zips, site exports — see **generated** [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md)).

- **If that path is missing** on a machine: treat as **“Brain source folder — pending user placement.”** Replicate the **expected** layout:
  - `…/electionResults/*.json` — raw SOS-style election JSON.  
  - Other subfolders as the team names them (financial exports, research, briefings) — **do not** require a fixed schema in this doc.

- **“Brain”** in the **codebase** also refers to **RAG** / **`ingest-campaign-brain`** and related **SearchChunk** flows — that is **DB-backed knowledge**, not the same as **every file on disk**.

### 6.2 Generated table

See **[`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md)** (refresh with `npm run ingest:inventory`). It lists **path**, **extension**, heuristics for **domain**, **priority**, **known ingest path** (script name or “none”), and **suggested next packet** family.

**Placeholder — Brain source folder pending user placement:** If the scan finds **no** external roots, the generated file will state **No files found** and operators should set **`INGEST_INVENTORY_ROOTS`** (see script header) or create the **canonical** folder structure locally.

### 6.3 Sample row logic (heuristic, not legal classification)

| Domain | Hints used by scanner |
|--------|------------------------|
| **Election** | Path contains `election` / `result`; or `.json` under `electionResults` |
| **Financial** | `financial`, `budget`, `fec`, `contribution` in path; or `.csv` / `.xlsx` in root intake |
| **Volunteer** | `volunteer`, `signup`, `field` in path |
| **County** | `county`, `wikipedia`, `geo` in path or script mapping |
| **Communications** | `comms`, `email`, `messaging` |
| **Research** | `research`, `briefing`, `strategy`, `playbook` |
| **Compliance** | `compliance`, `ethics`, `fec`, `handbook` |
| **Unknown** | Default when no match |

### 6.4 Opposition intelligence sources (ingest queue — INTEL-OPS-1)

**Category label:** **Opposition intelligence** — **public** **lawful** **material** for **analyst** **work** per **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)** (allowed / prohibited / AI **guardrails**).

**What belongs in this queue (examples):**

- **Public** **campaign** **finance** **exports** and **filing** **pulls** (FEC, AEC, SOS **as** **applicable**)  
- **Public** **campaign** **literature** (mailers, handbills) **scanned** / **dropped** by **operators**  
- **Public** **ads** and **ad**-**library** **saves**  
- **News** / **media** **archive** (URLs + **capture** **metadata**)  
- **Candidate** / **PAC** / **org** **public** **statements** and **press** **releases**  
- **User**-**lawfully**-**obtained** **documents** (label **provenance**)

**Queue rule:** **Promote** **this** **category** in the **ingest** **backlog** **after** **election** **ingest** is **COMPLETE** (see [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) / `ingest:election-audit:json`) **or** the **program** **explicitly** **waives** the **automation** **order** in **writing** — so **broad** **ingest** **automation** does **not** **race** **ahead** of **core** **election** **data** without **a** **decision**. **Exception:** **INTEL-1**-style **manual** **cited** **entry** in **app** or **spreadsheet** (when **implemented**) does **not** require **solving** the **full** **ingest** **queue** **first**; the **backlog** **rule** targets **scripted** / **batch** / **RAG**-**scale** **pipelines** **from** the **brain** **folder** **or** **equivalent**.

**Provenance (required for every** **queued** **item**): **source** **type** (filing, URL, file path), **retrieval** **timestamp**, **operator** or **script** **id** **as** **appropriate**; **confidence** and **review** **status** per the **opposition** **doc**.

---

## 7. Post-election brain ingest queue (standing rules)

**Order:**

1. **Election data** ingest **first** (§2.3) until the campaign’s **target JSON set** is **represented** in the **intended** database(s) or a **documented** exception exists.  
2. **After** that milestone, process **brain / source** files **incrementally** — one **safe file group** per build **or** a **mapping/schema** improvement for one group.  
3. **Every** future build should **check** this queue and [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md) (refresh periodically).  
4. **No destructive** imports; prefer **`--dry-run`** (election) or **read-only** audit scripts when available.  
5. **Provenance** target (when building parsers): **source file path**, **ingest timestamp**, **parser/version**, **confidence/status**, **free-text notes** — aligns with `ElectionResultSource` pattern and compliance docs posture.

**Queue categories (backlog tags):** Financials · Volunteer lists · County assets · Election data · **Opposition intelligence** · Research / strategy · Communications · Compliance · **Unknown / needs review**.

| Category | Next action (typical) |
|----------|------------------------|
| **Financials** | Map columns to `FinancialTransaction` / `BudgetLine` / compliance — **doc-first**; no auto money movement |
| **Volunteer lists** | Match to `VolunteerProfile` / intake — **human review**; no auto outreach |
| **County assets** | `ingest:county-wikipedia` / owned media / county pages as existing scripts allow |
| **Election data** | `ingest:election-results` per file |
| **Opposition intelligence** | See **§6.4** and [`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md); **batch** / **RAG**-**scale** **after** **election** **ingest** **gate**; **provenance** **required** |
| **Research / strategy** | `ingest:docs` / `ingest:campaign-folder` subsets with **operator** choice |
| **Communications** | RAG and content pipelines — **no** send automation |
| **Compliance** | `ComplianceDocument` upload path per existing product |
| **Unknown** | Triage in inventory; **INGEST-OPS-4** manifest |

---

## 8. Blueprint — forward packets (ingest line)

| Packet | Description |
|--------|-------------|
| **INGEST-OPS-2** | This doc + inventory script + protocol hooks (**current**). |
| **INGEST-OPS-3** | Election ingest **audit** — **[`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md)** + `npm run ingest:election-audit` (per-environment: disk vs `ElectionResultSource`). |
| **INGEST-OPS-3B** | **Operator runbook** [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md) · `ingest:election-audit:json` / `ingest:election-audit:doc` · BLOCKED / PARTIAL / **COMPLETE** workflow. |
| **INGEST-OPS-4** | **Normalized manifest** of brain/source files (versioned list + domains) — **next** after **COMPLETE** (or **explicit** waiver) on election queue; if **PARTIAL**, stay on targeted election ingests only. |
| **INGEST-OPS-5** | **First** safe **non-election** ingest parser (single file family; dry-run). |
| **INGEST-OPS-6** | **Provenance + ingest review** UI (read-heavy). |

---

## 9. Division note (ingest / intelligence)

- **Data layer / voter file / ingest** remains **L2** until **PRECINCT-1** or **sustained** ingest tooling lifts **operator** **confidence** — **per** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md).  
- **Campaign intelligence** stays **L1–L2**; **INTEL-OPS-1** adds **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)**; may move when **INGEST-OPS-4+** and **honest** rollups exist — **not** on docs alone. **Opp** **intel** **bulk** **ingest** **is** **ordered** **after** **election** **ingest** **COMPLETE** (or **waiver**) per **§6.4**.  
- **Finance** / **volunteer** product levels **unchanged** here (no new financial or volunteer **actions** in this packet).

---

*Last updated: **DB-OPS-1** (local audit still **BLOCKED** — Docker/Postgres; see **§2.5**) + **INTEL-OPS-1** / **INGEST-OPS-3B**; **INGEST-OPS-4** after **COMPLETE**; **election COMPLETE** only with `dbReachable: true` per [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) (or explicit waiver), not this paragraph alone.*
