# Ingest status and backlog (INGEST-OPS-2 + INGEST-OPS-3 + INGEST-OPS-3B + INTEL-OPS-1 + INTEL-OPS-2 pointer)

**Packet:** **INGEST-OPS-2** — Election ingest status, brain/source backlog, standing queue protocol. **INGEST-OPS-3** — election file ↔ DB comparison: [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md). **INGEST-OPS-3B** — **operator runbook** [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md), `--json` / `--write-doc` audit output, and **completion rules** (BLOCKED ≠ PARTIAL).  
**File:** `docs/INGEST_STATUS_AND_BACKLOG.md`  
**Stack:** `RedDirt/` (Next.js + Prisma; ingest CLIs in `scripts/`).  
**Cross-ref:** [`election-results-schema-and-ingest.md`](./election-results-schema-and-ingest.md) · [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) · [`BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) — **INGEST-OPS-2 standing rule** · **Election Ingest Gate (INGEST-OPS-3)** · **Generated file inventory** → [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md) (run `npm run ingest:inventory` from `RedDirt/`) · **Normalized brain manifest (INGEST-OPS-4)** → [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (`npm run ingest:brain-manifest`) · **Competitor source manifest (INTEL-2)** → [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) · per-folder writeups in `docs/source-ingest/*-manifest.md` + **§2.7** root loose files.

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

**Done (local dev, INGEST-OPS-3C + INGEST-OPS-3D):** all **13** canonical files under the audited **`electionResults`** folder — **`2026_Preferential_Primary.json`** through **`2016_General.json`** — ingested after **`--dry-run`**; see [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) **§C** and **SLICE-13** note **15**. (**Legacy** generals / primaries: **unmatched county names** in CLI when JSON uses alternate casing; **`countyId`** may be null until mapping improves. **2021 Special** had **0** unmatched counties in CLI. **`2020_Preferential_Primary.json`**, **`2018_Preferential_Primary.json`**, and **`2016_Preferential_Primary.json`** use the **legacy** parser branch — audit notes **10**, **12**, and **14**.)

1. **Remaining JSONs** in [`raw-election-results-intake-map.md`](./raw-election-results-intake-map.md) (outside this **13-file** canonical set) — one file per CLI invocation; re-run **dry-run** if upstream files change.  
2. **Handbook PDF** — **exclude** from `ElectionResult*` path; track under **compliance** queue if needed.

**Command template:**

```text
cd RedDirt
npm run ingest:election-results -- --dry-run --file "H:\SOSWebsite\campaign information for ingestion\electionResults\<file>.json"
```

Then remove `--dry-run` only when the dry-run counts look sane and DB is the correct environment.

**Packet ID:** This operational sequence is the practical **“election ingest completion”** work; **INGEST-OPS-3** = formal **audit** — log + comparison table: [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md), helper `npm run ingest:election-audit`.

### 2.4 Active Election Ingest Queue (until DB verification completes)

**Rule:** When [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) shows a file as **ingested** with no **suspected_partial** follow-up, remove it from this queue in a doc pass (or move to a short **“Completed (verified)”** list there).

**Current queue:** **0** canonical JSONs **missing** on **this** **local** **dev** DB (**13** / **13** ingested — verify **other** environments with `ingest:election-audit:json`). **Election Ingest Gate** **satisfied** here per [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md).

| Priority (newest → oldest) | file_name |
|-----------------------------|-----------|
| ~~1~~ | ~~`2026_Preferential_Primary.json`~~ — **ingested** (local dev; see audit) |
| ~~2~~ | ~~`2024_General.json`~~ — **ingested** (local dev; see audit) |
| ~~3~~ | ~~`2024_Primary.json`~~ — **ingested** (local dev; see audit) |
| ~~4~~ | ~~`2022_General.json`~~ — **ingested** (local dev; see audit) |
| ~~5~~ | ~~`2022_Primary.json`~~ — **ingested** (local dev; see audit) |
| ~~6~~ | ~~`2021_Special.json`~~ — **ingested** (local dev; see audit) |
| ~~7~~ | ~~`2020_Primary_Runoff.json`~~ — **ingested** (local dev; see audit) |
| ~~8~~ | ~~`2020_Preferential_Primary.json`~~ — **ingested** (local dev; see audit) |
| ~~9~~ | ~~`2020_General.json`~~ — **ingested** (local dev; see audit) |
| ~~10~~ | ~~`2018_Preferential_Primary.json`~~ — **ingested** (local dev; see audit) |
| ~~11~~ | ~~`2018_General.json`~~ — **ingested** (local dev; see audit) |
| ~~12~~ | ~~`2016_Preferential_Primary.json`~~ — **ingested** (local dev; see audit) |
| ~~13~~ | ~~`2016_General.json`~~ — **ingested** (local dev; see audit **SLICE-13**) |

**Next actions (per file, after audit dry-run looks sane):**

```text
cd RedDirt
npm run dev:db
npm run ingest:election-audit
npm run ingest:election-results -- --dry-run --file "H:\SOSWebsite\campaign information for ingestion\electionResults\<file>.json"
```

Then, only for the **intended** database, drop `--dry-run` and run the same command once per file. Use `--replace` if re-importing the same path.

### 2.5 MIGRATE-OPS-1 — local dev migrations + audit (**COMPLETE** — canonical **13** JSONs)

**MIGRATE-OPS-1** + **INGEST-OPS-3C** + **INGEST-OPS-3D** (operator-approved **local** **only**): **`npm run db:ping`** OK · **`npx prisma migrate deploy`** applied **all** pending migrations (**schema** **up** **to** **date**; includes **`20260513120000_data4_election_ingest_foundation`**). **`npx prisma generate`** OK · **`ingest:election-audit:json`** / **`:doc`:** **`status: COMPLETE`**, `dbReachable: true`, **`ingestedCount: 13`**, **`missingCount: 0`**, **`totalFiles: 13`** — all canonical JSONs in **[`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md)** **§A** / **§C** present in **`ElectionResultSource`** on **this** DB.

- **Repo fixes during deploy:** removed **untracked** empty migration dir **`20260423120000_email_workflow_status_enriched`** ( **P3015** ); split **`20260431180000_comms_packet7_variant_review_fields`** enum **UPDATE** into **`20260431185000_comms_packet7_variant_status_backfill`** after **`migrate resolve --rolled-back`** ( **P3018** ). See [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) **§ MIGRATE-OPS-1**.  
- **Election Ingest Gate:** **satisfied** on **this** DB — **`INGEST-OPS-4`**, **`GOTV-2`**, **`INTEL-2`** ([`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)), and **`INTEL-3`**, **`INTEL-4A`** (**opposition** **Prisma** **tables** + **`opposition-intelligence.ts`** + **`/admin/intelligence`** + **`ingest:opposition-intel`**, `data/intelligence/*`) are **in** **the** **blueprint** **set**. **INGEST-OPS-4** **normalized manifest** is **implemented** (**§2.8**). **INTEL-4B+** **bulk** **/ parser** **pipelines** **await** **steering** (**§6.6**).  
- **Competitor Intelligence Ingest Queue** (below): **canonical** **election** **tabulation** **gate** **cleared** **here**; **§6.4** **batch** **rules** **still** require **provenance** **and** **human** **review** **per** **INTEL-OPS-1**.

### 2.6 SOURCE-INGEST-FOLDER-TEMPLATE (controlled per-folder manifests)

**Purpose:** Inventory **one** subtree under `H:\SOSWebsite\campaign information for ingestion\<folder>` into `docs/source-ingest/<safe-name>-manifest.md`, classify files, and record parser / readiness — **no** moves, **no** deletes, **no** production, **no** migrations.

**Hard gate:** **`npm run ingest:election-audit:json`** must return **`status: COMPLETE`** before scanning **non-election** brain folders for ingest expansion. If **not** **COMPLETE**, **stop** (same rule as election queue).

**Index:** [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md). **Latest folder run:** [`source-ingest/zine-content-20260421t210959z-manifest.md`](./source-ingest/zine-content-20260421t210959z-manifest.md) — **`Zine content-20260421T210959Z-3-001`** (**1** **DOCX**). **Prior:** [`source-ingest/website-photos-20260421t211003z-manifest.md`](./source-ingest/website-photos-20260421t211003z-manifest.md). **Next folder:** e.g. **`Kellymedia`**, **`26PMONRO_PROOF4`**, or any subtree not yet manifest-scanned — see pick list in [`source-ingest/pending-active-folder-manifest.md`](./source-ingest/pending-active-folder-manifest.md); **`ingest:inventory`** optional for drift.

**Script note:** **`npm run ingest:brain-manifest`** regenerates the **normalized** table in [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (read-only scan; **§2.8**). **`npm run ingest:inventory`** writes [`INGEST_INVENTORY_GENERATED.md`](./INGEST_INVENTORY_GENERATED.md) (lighter heuristic).

### 2.7 SOURCE-INGEST-LOOSE-FILES (root-level files only)

**Purpose:** Inventory **only** files sitting **directly** under `H:\SOSWebsite\campaign information for ingestion\` ( **no** subfolders such as `electionResults\`). Classify by **filename heuristics**; **no** DB writes; **no** finance ingest.

**Hard gate:** Same as **§2.6** — **`npm run ingest:election-audit:json`** must return **`status: COMPLETE`** before expanding this backlog line.

**Manifest:** [`source-ingest/root-loose-files-manifest.md`](./source-ingest/root-loose-files-manifest.md) — **2026-04-23** scan: **72** loose files (**17** finance-classified, **11** media, **36** DOCX, **2** quarantined **`.crdownload`**). **INGEST-OPS-4** / normalized brain list should **cross-link** this slice so root drops are not invisible next to per-folder manifests.

**BRAIN-EMBED-1 (root loose comms — DB repair):** `npm run ingest:campaign-root-loose` imported **47** **`OwnedMediaAsset`** rows linked to **`MediaIngestBatch`** id **`cmoct5jcv0000zc8by1za6udc`** (root-level files only; **`.xlsx` / `.xls`** intentionally **not** ingested). Initial run hit **OpenAI 401** on embeddings, so **`SearchChunk`** rows were missing. **Repair CLI:** `npm run repair:owned-media-embeddings -- --batch-id cmoct5jcv0000zc8by1za6udc` (optional **`--dry-run`**). **Embedding repair completion** depends on a **valid** key (see **OPENAI-KEY-OPS-1** below). (Cross-ref: root loose inventory in this doc under **SOURCE-INGEST-LOOSE-FILES** above.)

**OPENAI-KEY-OPS-1 (local secret wiring):** Interactive **`npm run setup:openai-key`** writes **`OPENAI_API_KEY`** to **`.env`** and **`.env.local`** (hidden input on TTY; prints only **`sk-...` + last 4**); adds **`OPENAI_EMBEDDING_MODEL=text-embedding-3-small`** when missing. **`npm run test:openai-key`** merges **`.env`** then **`.env.local`** (local wins), runs one embeddings smoke test, prints **model** + **vector dimension** — **no** key material. **`.gitignore`** lists **`.env`**, **`.env.local`**, and **`*.local`** patterns so secrets are not committed. **Embedding test status:** run **`test:openai-key`** after each key rotation; then **`repair:owned-media-embeddings`** for batch **`cmoct5jcv0000zc8by1za6udc`** if **`SearchChunk`** backfill is still outstanding. Older helpers: **`npm run set:openai`**, **`npm run check:openai`**.

**BRAIN-STORAGE-1 (governed brain material):** Multi-lane storage for the campaign ingest tree—**RAG** via **`OwnedMedia` + `SearchChunk`**, **election JSON** via **`ElectionResultSource`**, **finance** via **`FinancialTransaction` / `ComplianceDocument`** (not bulk spreadsheet embeddings). Runbook: [`CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md`](./CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md). **`ingest-campaign-folder`** supports **`--brain-governed`** (skips **`electionResults`**, filing-detail folders, and obvious finance filenames) and repeatable **`--skip-path-prefix`**. **`npm run brain:storage:plan`** prints the operator checklist; **`brain:ingest:tree:briefing` / `:comms` / `:training`** run governed full-tree ingests with **`--include-zips`** (host path in **`package.json`**; override with a local command if the tree moves).

### 2.8 INGEST-OPS-4 — Normalized brain / source manifest (**implemented**)

**Purpose:** One **file-grain** manifest of the brain/source tree (`manifestId`, path, domain, ingest hints, next packet) — **read-only** scan via **`npm run ingest:brain-manifest`** → [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md). **No** DB, **no** network, **no** moves.

**Hard gate:** **`npm run ingest:election-audit:json`** → **`COMPLETE`** before treating ingest expansion as unblocked for an environment (same as **§2.6**).

**Next safe paths (blueprint):** **INGEST-OPS-5** (first governed non-election parser) · **INTEL-2** **(done** — [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)) · **INTEL-3** **(done** — schema + helpers + read-only admin) · **INTEL-4** / **INTEL-5** (when **steered**) · **FINANCE-1** (finance source mapping) · **VOL-DATA-1** (volunteer list / field spreadsheet mapping).

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
| `npm run ingest:brain-manifest` | **INGEST-OPS-4** | **No** | Writes **`docs/BRAIN_SOURCE_MANIFEST.md`** (normalized file table + per-folder index). |
| `npm run ingest:election-audit` | Election audit | **Read** (if DB up) | Human-readable disk vs `ElectionResultSource`. |
| `npm run ingest:election-audit:json` | Election audit | **Read** (if DB up) | **JSON** for CI/handoff; exit **0** if **BLOCKED**. |
| `npm run ingest:election-audit:doc` | Election audit | **Read** (if DB up) | Updates auto sections in **[`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md)**. See **[`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md)**. |
| `npm run repair:owned-media-embeddings` | Campaign media / brain search | Yes | **`--batch-id`** + optional **`--dry-run`** — backfills **`SearchChunk`** + embeddings for an existing ingest batch (see **BRAIN-EMBED-1** under **SOURCE-INGEST-LOOSE-FILES** above). |
| `npm run setup:openai-key` | Local env | **Writes** **`.env` / `.env.local`** | **OPENAI-KEY-OPS-1** — prompt for key (masked output only). |
| `npm run test:openai-key` | OpenAI | Network | **OPENAI-KEY-OPS-1** — smoke-test embeddings from merged env files; **no** key print. |
| `npm run brain:storage:plan` | Brain / ops | No | **BRAIN-STORAGE-1** — prints governed storage checklist ([`CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md`](./CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md)). |
| `npm run brain:ingest:tree:briefing` / `:comms` / `:training` | Campaign media + RAG | Yes | **BRAIN-STORAGE-1** — full-tree ingest with **`--brain-governed`** + **`--include-zips`** (see runbook). |

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
| **Brain / loose files** | Many **scripts** for docs/media | **INGEST-OPS-4** **manifest** [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (**regenerate** with **`ingest:brain-manifest`**) |
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

### 6.5 Competitor Intelligence Ingest Queue (**INTEL-OPS-2** — public record)

Structured **lawful** **public-record** **competitor** **intelligence** (see **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)** — **no** illegal scraping, **no** private data, **no** unreviewed **publication**).

| # | Category | Notes |
|---|----------|--------|
| 1 | **Campaign finance filings** | FEC / state (e.g. AEC) / SOS-disclosed committees — filing id + URL + retrieval date. |
| 2 | **Bill sponsorship records** | Legislature **public** bill index — author, sponsor, co-sponsor, status. |
| 3 | **Vote records** | Official roll-call / vote exports — bill linkage, date, chamber. |
| 4 | **Official videos** | Senate / House / SOS / committee **public** streams or archives — URL, timestamp, transcript status. |
| 5 | **News archive** | **Public** journalism — URL, date, topic; **claim** **verification** **status** required before reuse. |
| 6 | **County election results** | SOS / county **public** results — align with election JSON ingest **provenance** patterns. |
| 7 | **Direct democracy legislation set** | Bills affecting initiatives, petitions, referenda — **source-backed** **only**. |
| 8 | **County finance legislation set** | County-impact fiscal / governance bills — fiscal notes and **public** **position** **disclosures** **only**. |

**Queue rules:** **Ingest** **automation** / **bulk** **load** **after** [`ELECTION_INGEST_AUDIT.md`](./ELECTION_INGEST_AUDIT.md) reports **COMPLETE** for the **intended** DB (or **explicit** **operator** **waiver**). **Public** **sources** **only**. **Every** **stored** **claim** needs **source** **URL** **or** **file**, **date** **accessed**, **confidence**, **fact** / **inference** / **recommendation** **separation**, and **review** **status** (per opposition doc).

### 6.6 Competitor Intelligence Sources (INTEL-2 backlog line)

**Manifest doc (implemented):** [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) — **structured** **tables** **+** **rules**; **local** **file** **appendix** **(paths** **only**, **no** **content** **claims**).

| Backlog category | Maps to manifest § | Status |
|------------------|-------------------|--------|
| **Legislative data** | §3.A (Legislative record) | **Manifest** **created**; **row** **ingest** **pending** |
| **Finance filings** | §3.C (Campaign finance) | **Manifest** **created**; **ingest** **pending** |
| **News archive** | §3.E (News mentions) | **Manifest** **created**; **ingest** **pending** |
| **Official videos** | §3.F (Official videos) | **Manifest** **created**; **ingest** **pending** |
| **County election data** | §3.G (Election / geographic patterns) + canonical **`electionResults`** JSON | **Manifest** **+** **election** **JSON** **path** **documented**; **aggregated** **intel** **ingest** **pending** |

**Gating:** **INTEL-3** **schema** + **INTEL-4A** **manual** **JSON** **path** **exist** — **helper** / **`ingest:opposition-intel`** **creates** **(operator-controlled)** **are** **allowed**; **scraping** and **unvetted** **bulk** **external** **ingest** **are** **out** **of** **scope** **for** **INTEL-4A** (**see** [`data/intelligence/README.md`](../data/intelligence/README.md)). **Governed** **DB** **bulk** / **automation** **for** **full** **manifest** **row** **backlog** **remains** **a** **separate** **INTEL-4B** **steering** **item** **per** [`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md) **§11** — **no** **bulk** **loads** **from** **this** **doc** **alone**; **no** **AI** **conclusions** **in** **product**.

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
| **INGEST-OPS-4** | **Normalized manifest** of brain/source files — **implemented** (`npm run ingest:brain-manifest` → [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md)). **Unlocked** once audit **`status: COMPLETE`** on canonical **13** JSONs; **re-run** after large folder drops. |
| **INGEST-OPS-5** | **First** safe **non-election** ingest parser (single file family; dry-run). |
| **INGEST-OPS-6** | **Provenance + ingest review** UI (read-heavy). |

---

## 9. Division note (ingest / intelligence)

- **Data layer / voter file / ingest** remains **L2** until **PRECINCT-1** or **sustained** ingest tooling lifts **operator** **confidence** — **per** [`DIVISION_MASTER_REGISTRY.md`](./DIVISION_MASTER_REGISTRY.md).  
- **Campaign intelligence** stays **L1–L2**; **INTEL-OPS-1** + **INTEL-2** ([`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md)) + **INTEL-3** + **INTEL-4A** + **[`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md)**; may move when **INGEST-OPS-4+** and **honest** rollups exist — **not** on docs alone. **Election** **Ingest** **Gate** **satisfied** on **canonical** **13** **JSONs** **here** — **INTEL-4B+** **pipelines** **not** **blocked** **by** **election** **gate** on **this** **DB** (**separate** **steering**); **§6.4** / **§6.6** **guardrails** **unchanged**.  
- **Finance** / **volunteer** product levels **unchanged** here (no new financial or volunteer **actions** in this packet).

---

*Last updated: **OPENAI-KEY-OPS-1** — **`setup:openai-key`** / **`test:openai-key`**; **INTEL-2** [`COMPETITOR_INTELLIGENCE_MANIFEST.md`](./COMPETITOR_INTELLIGENCE_MANIFEST.md) + **INTEL-3** + **INTEL-4A** **`ingest:opposition-intel`**, `data/intelligence/`, `scripts/verify-opposition-intel-tables.ts` + **§6.6**; **BRAIN-EMBED-1** root loose batch **`cmoct5jcv0000zc8by1za6udc`** may still need **`SearchChunk`** repair after a **passing** **`test:openai-key`**. **MIGRATE-OPS-1** (migrations applied; audit **`COMPLETE`** **13**/ **13** on **this** local dev DB; see **§2.5**; **INTEL-3** **migration** **applied** **here**) + **INTEL-OPS-1** / **INTEL-OPS-2** (**§6.5**–**§6.6**) / **INGEST-OPS-3B**; **Election Ingest Gate** **satisfied** here; **INGEST-OPS-4** (**§2.8**) + **GOTV-2** **implemented** — verify **other** **environments** with `ingest:election-audit:json`. **§2.6** **SOURCE-INGEST-FOLDER-TEMPLATE:** [`source-ingest/zine-content-20260421t210959z-manifest.md`](./source-ingest/zine-content-20260421t210959z-manifest.md); **§2.7** **SOURCE-INGEST-LOOSE-FILES:** [`source-ingest/root-loose-files-manifest.md`](./source-ingest/root-loose-files-manifest.md); **§2.8** [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (`ingest:brain-manifest`).*
