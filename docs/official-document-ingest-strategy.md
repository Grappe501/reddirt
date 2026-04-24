# Official document ingest strategy (OFFICIAL-INGEST-1) (RedDirt)

**Purpose:** How the **campaign OS** should handle **official** PDFs, hub links, and handbooks—**metadata-first**, **human review** for AI, **no** assumption that every PDF becomes relational rows.

**Cross-ref:** [`official-source-ingest-foundation.md`](./official-source-ingest-foundation.md) · [`compliance-document-ingest-foundation.md`](./compliance-document-ingest-foundation.md) · `src/lib/campaign-engine/compliance-documents.ts` · `prisma/schema.prisma` (`ComplianceDocument`)

**Disclaimer:** **Not** legal advice. **Not** filing automation.

---

## 1. Channels

| Channel | Handling |
|---------|----------|
| **Uploaded PDFs from dashboard** | **`ComplianceDocument`** row + blob in existing storage pattern; set `documentType`, `title`, `reportingPeriod`, `notes` (include **canonical URL** if known) |
| **Linked official web resources** | **Catalog** in docs + future `OfficialResource` table; store URL, agency, retrieved date; **do not** scrape as “truth” without policy |
| **Official handbooks** | **Upload mirror** (SBEC/SOS PDF) + **`approvedForAiReference`** only after staff review |
| **Fillable forms** | Same as PDFs; type `SOS_ETHICS_FORM` or `FILING_INSTRUCTIONS` as appropriate |
| **Static vs changing resources** | Changing: **portal** + news pages = **re-fetch policy** (manual); static PDFs = **version by upload date** in `notes` |

---

## 2. Metadata model (v1 — today’s DB)

Use **`ComplianceDocument`** fields:

- **`title`** — human label including **year/version** (e.g. “2026 Election Calendar (rev 6-2025)”)
- **`documentType`** — enum (see `ComplianceDocumentType`)
- **`reportingPeriod`** — free text period label
- **`periodDate`** — optional anchor date
- **`notes`** — **source URL**, agency, retrieval notes, **“reference only”** flags
- **`approvedForAiReference`** — **default false**; **must** be true only when counsel/ops approves RAG use

**Gap:** No `sourceUrl` column — put URL in **`notes`** until a migration adds a dedicated field.

---

## 3. Review / approval for AI use

1. Upload or record resource.
2. Compliance/ops **reviews** accuracy and sensitivity.
3. Set **`approvedForAiReference`** only when appropriate.
4. RAG/index pipelines **must filter** on this flag (when wired — see COMP-2 / BRAIN docs).

**Forbidden:** Auto-approving AI use on upload; treating AI paraphrase as filing instructions.

---

## 4. Searchable knowledge indexing

- **Candidate:** PDFs → text extraction → chunks → vector index (**future packet**).
- **Scope:** **Handbooks, training guides, calendars, instructions** — not raw election JSON (use **structured ingest** instead).
- **Provenance:** chunk metadata should carry **document id**, **URL**, **upload date**.

---

## 5. Structured extraction (later)

- **Justified only** when product needs **field-level** data (e.g. deadline rows, form checklists).
- **Each form** is its own scope — **no** universal “PDF → SQL” promise.
- **Election JSON** is the opposite: **already structured** → belongs in **results tables**, not RAG.

---

## 6. Explicit non-goals

- **No** automated submission to SOS/ethics portals.
- **No** “compliance bot” that marks filings complete.
- **No** OCR pipeline for SOS website screenshots as substitute for official PDFs.

---

*Last updated: Packet OFFICIAL-INGEST-1.*
