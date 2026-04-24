# Competitor intelligence — source manifest (INTEL-2)

**Packet:** **INTEL-2** — Structured, **source-backed** **manifest** for **Campaign Intelligence / Reporting** (opponent and related public-record lanes). **Docs only** in this packet: **no** bulk DB ingest, **no** publishing, **no** migrations.

**INTEL-3 (implemented):** Prisma schema + migration `20260424180000_intel3_opposition_intelligence_schema` + safe create/list helpers in `src/lib/campaign-engine/opposition-intelligence.ts` + read-only admin **`/admin/intelligence`**. **Apply** the migration per environment (`npx prisma migrate deploy`); local dev should have it applied for a usable admin surface.

**INTEL-4A (implemented):** Manual **JSON** **template** `data/intelligence/manual-opposition-intel-template.json`, operator README `data/intelligence/README.md`, and CLI **`npm run ingest:opposition-intel -- --file <path> [--dry-run]`** — validates shape, creates entities then sources then records in a transaction, defaults **NEEDS_REVIEW** / **UNVERIFIED**, **no** auto-approval, **no** generated conclusions. **No** **scraping**, **no** **bulk** **unvetted** **external** **ingest** — **source-backed** **curated** **drops** only.

**Cross-ref:** [`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md) (**INTEL-OPS-1** / **INTEL-OPS-2**) · [`INGEST_STATUS_AND_BACKLOG.md`](./INGEST_STATUS_AND_BACKLOG.md) **§6.4–6.5** · [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) (filesystem inventory) · **Forward:** **INTEL-4B** (first governed **public-source** import packet / parsers) · **INTEL-5** (analysis and dashboard layer).

---

## 1. Overview

### 1.1 Purpose

This manifest is the **single place** to register **what** competitor-relevant information the campaign may hold or pursue, **where** it comes from, and **how complete** local capture is — so future **INTEL-3/4/5** work has an **auditable** spine.

### 1.2 Rules (non-negotiable)

| Rule | Meaning |
|------|---------|
| **Public data only** | Lawful public records, disclosed filings, and **public** URLs — **no** restricted/private systems, **no** purchased personal bundles for opposition use. |
| **Source required** | Every **factual** row in the tables below must have **`sourceUrl`** and/or **`sourcePath`** (local file) **before** it counts as **evidence**. **No** AI-invented bill numbers, votes, or dollar amounts. |
| **No unsupported claims** | Do **not** state conclusions in this doc without a cited cell in the same row. |
| **Sentiment** | If used, **label** as **manual** (human analyst) — never as machine **fact**. |
| **No voter-level inference** | Aggregate election or geographic patterns only; **no** individual voter predictions from this sheet. |
| **No private data** | No non-public PII, **no** internal-only third-party data without explicit provenance and legal review. |

**Ingest status values:** `not_started` · `partial` · `complete` (applies to **our** capture/reconciliation effort, not SOS certification).

---

## 2. Competitor profile

**Placeholder — fill only from public sources with citations in the row tables below.**

| Field | Value |
|-------|--------|
| **Name** | *TBD* |
| **Office / seat** | *TBD* |
| **Known affiliations** (public) | *TBD* |

---

## 3. Source category tables

Use **stable** `sourceId` values (e.g. `LEG-2026-001`) when you add rows. Leave tables empty until a **sourced** row exists.

### A. Legislative record

| sourceId | billNumber | title | summary | role (sponsor / co-sponsor / vote) | date | policyArea | impactArea | sourceUrl | ingestStatus | notes |
|----------|------------|--------|---------|-----------------------------------|------|------------|------------|-----------|--------------|-------|
| | | | | | | | | | not_started | |

**impactArea** examples: `direct_democracy` · `campaign_finance` · `county_governance` · `education` · `health` · `other` (choose a controlled label when INTEL-3 lands).

### B. Voting record

| sourceId | billNumber | vote (yes / no / abstain) | date | category | impactGroup | sourceUrl | notes |
|----------|------------|---------------------------|------|----------|-------------|-----------|-------|
| | | | | | | | |

### C. Campaign finance

| sourceId | donorName | donorType (individual / PAC / org) | amount | date | employer | industry | geography | sourceUrl | ingestStatus | notes |
|----------|-----------|-------------------------------------|--------|------|----------|----------|-----------|-----------|--------------|-------|
| | | | | | | | | | not_started | |

**donorType** and **amount** must come from a **public filing** or **disclosed** export — **not** from modeled guesses.

### D. Public statements / messaging

| sourceId | type (speech / interview / social) | topic | date | summary | tone | sourceUrl | notes |
|----------|--------------------------------------|-------|------|---------|------|-----------|-------|
| | | | | | | | |

**tone** = analyst judgment; keep **separate** from **fact** fields.

### E. News mentions

| sourceId | outlet | headline | date | topic | sentiment (manual) | sourceUrl | notes |
|----------|--------|----------|------|-------|--------------------|-----------|-------|
| | | | | | | | |

**sentiment (manual):** e.g. `negative` / `neutral` / `positive` / `mixed` — **human-labeled** only.

### F. Official videos

| sourceId | eventType (committee / floor / other) | topic | billNumber (if applicable) | date | timestamp | transcriptStatus | sourceUrl | notes |
|----------|----------------------------------------|-------|------------------------------|------|-----------|------------------|-----------|-------|
| | | | | | | not_started | | |

**transcriptStatus:** `not_started` · `partial` · `complete` (or `n_a` if no transcript planned).

### G. Election / geographic patterns

| sourceId | electionYear | county | voteShare | turnout | comparisonGroup | notes |
|----------|----------------|--------|-----------|---------|------------------|-------|
| | | | | | | |

**comparisonGroup** examples: `same_race_different_year` · `same_office_different_candidate` — **define** in notes; **no** individual voter linkage.

### H. Direct democracy actions

| sourceId | billNumber | actionType (restrict / expand / other) | description | impact | sourceUrl | notes |
|----------|------------|----------------------------------------|-------------|--------|-----------|-------|
| | | | | | | |

---

## 4. Appendices

### 4.1 Local host file scan (optional — not ingested)

**Scan date:** 2026-04-24. **Root:** `H:\SOSWebsite\campaign information for ingestion\`  
**Purpose:** List files that **may** support **evidence** workflows **or** are **candidates** for later classification. **Not** ingested by INTEL-2. **No** factual claims are made about file **contents** here — filenames and paths only.

| sourceId | Category mapping | sourcePath | ingestStatus | notes |
|----------|------------------|------------|--------------|-------|
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_General.json` | not_started | Public SOS-style JSON; cross-ref DB via `ElectionResultSource` when loaded per env. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2016_Preferential_Primary.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2018_General.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2018_Preferential_Primary.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_General.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_Preferential_Primary.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2020_Primary_Runoff.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2021_Special.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2022_General.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2022_Primary.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2024_General.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2024_Primary.json` | not_started | Same. |
| LOCAL-ELEC-2016-2026 | G — Election / geographic | `H:\SOSWebsite\campaign information for ingestion\electionResults\2026_Preferential_Primary.json` | not_started | Same. |
| LOCAL-LEG-001 | H — Direct democracy / legal context (review) | `H:\SOSWebsite\campaign information for ingestion\Saved from Chrome-20260421T211011Z-3-001\Saved from Chrome\Arkansas_Election_Laws_and_Constitution_2025_Edition.pdf` | not_started | **Public** law compilation PDF on disk; use for **issue** **context** only — **not** a substitute for primary bill text for opponent votes. |
| LOCAL-FIN-SCAN-001 | C — Finance (methodology / compliance) | `H:\SOSWebsite\campaign information for ingestion\_Committee to Elect Kelly Grappe_donors_.csv` | not_started | **Campaign** **committee** disclosed export (this candidate), **not** opponent — do **not** treat as opponent intel; useful only for **process** / **column** mapping. |
| LOCAL-FIN-SCAN-002 | C — Finance (methodology / compliance) | `H:\SOSWebsite\campaign information for ingestion\November 2025 Contributions - SOS Template.xlsx` | not_started | **Campaign** filing workflow template; **not** opponent data. |
| LOCAL-MEDIA-001 | D / F — Media / video (ops) | `H:\SOSWebsite\campaign information for ingestion\Trainings-20260421T211007Z-3-001\Trainings\PR Media List\PR-Tasks-Workbook.pdf` | not_started | **Training** asset; **not** opponent-sourced. |
| LOCAL-MEDIA-002 | D — Messaging / editorial (ops) | `H:\SOSWebsite\campaign information for ingestion\Editorials-20260421T211104Z-3-001\Editorials\Civic Engagement Writing Brief.docx` | not_started | **Our** **side** draft material — not competitor evidence. |
| LOCAL-BALLOT-001 | G — Election (ballot / proof artifacts) | `H:\SOSWebsite\campaign information for ingestion\26PMONRO_PROOF4\26PMONRO_DEM_PROOF.pdf` | not_started | Ballot **proof** PDF; **context** for races — **add** `sourceUrl` to SOS **official** **record** if cited in a row. |
| LOCAL-BALLOT-002 | G — Election (ballot / proof artifacts) | `H:\SOSWebsite\campaign information for ingestion\26PMONRO_PROOF4\26PMONRO_NON_PROOF.pdf` | not_started | Same. |
| LOCAL-BALLOT-003 | G — Election (ballot / proof artifacts) | `H:\SOSWebsite\campaign information for ingestion\26PMONRO_PROOF4\26PMONRO_REP_PROOF.pdf` | not_started | Same. |

**Opponent-specific files:** **None** **identified** **by** **path/filename** **alone** in this scan. Add rows in §3 when **public** **URLs** or **filing** **ids** are known.

### 4.2 Drift control

- When **`sourceUrl`** **rotates** or a **filing** **moves**, **retain** the old URL in **notes** and **set** a **retrieved** **date** when INTEL-3/4 add columns for that.  
- Reconcile with [`BRAIN_SOURCE_MANIFEST.md`](./BRAIN_SOURCE_MANIFEST.md) for **broad** **file** **inventory**; this doc is **competitor**-**shaped** **rows** only.

---

*INTEL-2 manifest — public-record discipline; human review before any external use per [`opposition-intelligence-engine.md`](./opposition-intelligence-engine.md).*
