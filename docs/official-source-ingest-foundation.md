# Official source ingest foundation (OFFICIAL-INGEST-1) (RedDirt)

**Packet OFFICIAL-INGEST-1.** **Foundation-only** definition of how the campaign should **capture, store, and cite** Arkansas **official** elections/ethics/compliance materials and **election results** sources—**without** filing automation, **without** legal conclusions, **without** pretending every PDF becomes SQL rows.

**Cross-ref:** [`sos-ethics-resource-inventory.md`](./sos-ethics-resource-inventory.md) · [`sos-for-candidates-ingest-map.md`](./sos-for-candidates-ingest-map.md) · [`official-candidate-resource-inventory.md`](./official-candidate-resource-inventory.md) · [`official-document-ingest-strategy.md`](./official-document-ingest-strategy.md) · [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md) · [`election-results-foundation.md`](./election-results-foundation.md) (conceptual DB contract) · `src/lib/campaign-engine/ingest-sources.ts`

**Disclaimer:** This document is **operational engineering** guidance. It is **not** legal advice. **Humans** remain responsible for filings, deadlines, and interpreting official materials.

---

## 1. North star

**Official-source ingest** is the campaign’s **governed pipeline** for capturing and referencing:

| Category | Examples |
|----------|----------|
| **Forms** | Fillable PDFs (financial interest, CC&E, candidate information) |
| **Handbooks / guides** | Running for office handbook, training PDFs |
| **Filing instructions** | SOS news items, portal help, “notice to candidates” pages |
| **Training guides** | Campaign finance / ethics / lobbyist training PDFs |
| **Calendars** | Election calendar PDFs (official uploads) |
| **Archived filing/search resources** | Legacy disclosure search portals, historical PAC lists |
| **Election results sources** | Official JSON exports (see [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md)) |

**In scope:** provenance, storage mode (DB vs file vs link), **human** review flags for AI use, and **honest** boundaries (what is **not** automated).

**Out of scope:** auto-filing, scraping SOS as a substitute for human compliance, **inferring** legal obligations from RAG snippets alone.

---

## 2. Source types

| Type | Description |
|------|-------------|
| **Fillable PDFs** | SOS-hosted forms (candidate info, SFI, CC&E, affidavits) |
| **Static PDF guides / handbooks** | Training guides, election calendar, SBEC handbook |
| **Web pages with official links** | For Candidates hub, Financial Disclosure hub, SOS news articles |
| **Web portals** | Online Financial Disclosure System (`ethics-disclosures.sos.arkansas.gov`) |
| **Archived search portals** | Legacy `sosweb.state.ar.us` filing search (as linked from SOS) |
| **Election JSON exports** | Large JSON files with `ElectionInfo` / `Turnout` / `ContestData` (or 2026 variant) |
| **Training materials** | PDF tutorials linked from Financial Disclosure page |
| **Spreadsheet lists** | Historical XLSX “paper filer” lists (2019/2020) |
| **External agency sites** | Arkansas Ethics Commission forms index, party sites (not SOS-hosted) |

---

## 3. What should be stored how

| Source type | DB metadata row | Uploaded/stored file | Extracted structured data | Reference link only | Searchable knowledge doc |
|-------------|-----------------|----------------------|---------------------------|---------------------|--------------------------|
| Fillable PDF (official) | **Yes** — title, type, period, provenance | **Yes** — mirror in campaign storage when policy requires offline copy | **Later** — only if product needs field-level filing prep (explicit packet) | **Also** — canonical URL on SOS/SBEC | **Optional** — after human **`approvedForAiReference`** |
| Static handbook / calendar PDF | **Yes** | **Yes** (uploaded mirror or campaign copy) | **Rarely** — deadlines might become `CampaignEvent` **manually** | **Yes** — canonical URL | **Yes** when approved |
| SOS hub web page | **Yes** — URL + snapshot note | Optional HTML/PDF export **not** required day one | **No** | **Primary** | Optional indexed snapshot **only** if policy allows |
| Online filing portal | **Yes** — portal URL, purpose | **No** (do not store credentials) | **No** | **Primary** | **No** — live system, not a document |
| Archived search portal | **Yes** | **No** | **No** unless importing specific filings (future) | **Primary** | Usually **no** |
| Election JSON | **Yes** — election id/name/date, file hash, ingest batch | **Yes** — raw file retained | **Yes** — county/contest/candidate/precinct **rows** (future migration) | Optional link to SOS results pages if used | **No** for full JSON in RAG (too large; use structured ingest) |
| Training PDF | **Yes** | **Yes** | **No** initially | **Yes** | **Yes** when approved |
| Party / external ethics links | **Yes** | **No** unless downloaded intentionally | **No** | **Primary** | Optional |

**Rule:** **Structured rows** for election results are justified because the JSON **already is** structured tabular data at county/precinct/candidate grain. **Structured extraction** from arbitrary compliance PDFs is **not** assumed—each form would need its own justified packet.

---

## 4. Provenance

Every captured resource (row + file + link) should carry or point to:

| Field | Required | Notes |
|-------|----------|-------|
| **Source agency** | Yes | e.g. Arkansas Secretary of State — Elections; SBEC; Arkansas Ethics Commission |
| **Source URL** | Yes when public | Exact HTTPS link as published on the hub page |
| **Source type** | Yes | Align with `OfficialSourceKind` in `ingest-sources.ts` |
| **Retrieved / uploaded date** | Yes | When the campaign mirrored the file or recorded the link |
| **Authoritative vs reference-only** | Yes | Portal + live SOS pages = **reference**; uploaded mirror = **campaign copy** with URL citation |
| **Approved for AI reference** | Yes for RAG | Maps to `ComplianceDocument.approvedForAiReference` (default **false**) |
| **Period / year** | When applicable | Election year, reporting period label—**not** validated as legal period |

---

## 5. Repo inspection (OFFICIAL-INGEST-1 §E)

1. **What current models can already store or reference official documents and forms?**  
   **`ComplianceDocument`** (`prisma/schema.prisma`) — `storageKey`, `fileName`, `mimeType`, `documentType` (`ComplianceDocumentType` includes `SOS_ETHICS_FORM`, `FILING_INSTRUCTIONS`, `DEADLINE_CALENDAR`, etc.), `reportingPeriod`, `periodDate`, `notes`, **`approvedForAiReference`**. **`SearchChunk`** (and RAG pipeline) can index **approved** text sources in later packets—**not** wired as automatic for every upload today.

2. **Is `ComplianceDocument` sufficient for the first ingest path, or what is missing?**  
   **Sufficient for v1 “vault + metadata”:** upload PDFs, classify type, set AI flag, store period notes. **Missing for full official-source catalog:** optional **`OfficialResource`** (or extend metadata) for **link-only** rows without a blob, **`sourceUrl`**, **`authorityLevel`**, **`ingestSourceFamily`**—not in Prisma today; use **docs + spreadsheet or future table** until a migration packet defines it.

3. **What parts of the SOS/Ethics site are best ingested as files vs links vs structured rows?**  
   **Links:** online disclosure **portal**, archived **search** UI, external **ethics.com** index, **party** sites. **Files:** PDF forms, calendar, training guides, handbook—**mirror** into `ComplianceDocument` when the campaign wants an immutable copy. **Structured rows:** **election JSON only** (results ingest)—not CC&E line items in this packet.

4. **What do the uploaded election JSON files prove is now possible?**  
   **County turnout**, **statewide contest results**, **per-county vote breakdowns**, and **precinct/location-level** nested results **without** OCR—see [`election-results-ingest-foundation.md`](./election-results-ingest-foundation.md).

5. **What is the best next packet to implement real election-results schema + ingest?**  
   **`DATA-4` / `ELECTION-INGEST-1`** (name TBD): Prisma models per [`election-results-foundation.md`](./election-results-foundation.md) + idempotent loader for **legacy JSON shape** + adapter for **2026 preferential** shape + validation report.

6. **What is the best next packet to implement richer official-resource ingestion?**  
   **`OFFICIAL-INGEST-2`:** optional `OfficialResource` table (URL + metadata + optional `ComplianceDocument` FK), admin UI list of SOS hubs, **no** auto-download crawler—**human** “add link / upload mirror” only.

---

*Last updated: Packet OFFICIAL-INGEST-1.*
