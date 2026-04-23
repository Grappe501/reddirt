# Compliance document ingest — foundation (COMP-2) (RedDirt)

**COMP-2** makes **dashboard-uploaded** compliance-related files a **first-class** **knowledge and evidence input** for the campaign engine, **without** claiming they are **legally** **accurate** or **automatically** **indexed** for **RAG** **(that** **wiring** is **a** **later** **packet) **.

**Impl (minimal):** Admin route `…/compliance-documents` — upload form, list, `approvedForAiReference` opt-in, file served at `/api/compliance-documents/[id]/file` (**admin** **only**). **Prisma** **`ComplianceDocument`** + **`ComplianceDocumentType`**; files stored via the same **local disk** pattern as **owned** **media** (`saveOwnedMediaFile`).

**Cross-ref:** [`compliance-governance-foundation.md`](./compliance-governance-foundation.md) · [`compliance-paperwork-simplification-foundation.md`](./compliance-paperwork-simplification-foundation.md) · [`compliance-agent-ingest-map.md`](./compliance-agent-ingest-map.md) · `src/lib/campaign-engine/compliance-documents.ts` · `prisma/schema.prisma`

---

## 1. North star

Staff can **upload** **PDFs, images, spreadsheets, and similar** used for **SOS / ethics, calendars, past filings, memos, and receipts** so they are **retained**, **described** with **metadata**, and (when approved) can later feed **RAG** or **ops** **dashboards** **without** **every** **file** **living** **only** **in** **inboxes** **or** **laptops** **.

---

## 2. Document types

`ComplianceDocumentType` in Prisma (see also `complianceDocumentTypeLabel` in `compliance-documents.ts`):

- **SOS / ethics forms** — official forms, drafts, or scans.
- **Filing instructions** — PDFs or guides from a filing authority.
- **Prior submitted reports** — copies of what was **already** filed (if available).
- **Receipts** — expense support.
- **Reimbursement** — request packages.
- **Bank / export statements** (future import source) — stored as **files** only in COMP-2; no bank **API** **.
- **Policy memos / counsel guidance** — written policy or counsel notes (treat as high **human** **/ legal** **review** **before** **AI** **use) **.
- **Deadline calendars** — PDF or image of reporting calendar.
- **Approved disclaimers / templates** — comms and web templates.
- **Other** — catch-all.

---

## 3. Ingest pipeline (conceptual + current)

| Stage | Status in COMP-2 |
|--------|------------------|
| **Upload** | **Yes** — admin form + `ComplianceDocument` row + disk file. |
| **Classify** | **Partial** — `documentType` + free-text **title** / **reporting** **period** **. |
| **Tag by compliance / budget domain** | **Narrative** only — `documentType` + future tags; not separate DB tags yet. |
| **Associate to period / filing / office** | **Optional** `reportingPeriod` (text), `periodDate` (date) — **not** **validated** **. |
| **Extract structured facts** | **Not** in this packet (no OCR pipeline). |
| **Review / approve for AI** | **Yes** — **boolean** **`approvedForAiReference`**; default **false** **. |
| **Searchable in RAG** | **Not** **wired** — mark documents **ready** in principle; connect **ingest** **/ SearchChunk** **later** **. |

---

## 4. Human governance

- **Uploaded ≠ trusted** — especially for **counsel** and **filing** **docs** **.
- **Reviewed for AI** — `approvedForAiReference` is **opt-in** and **not** set by automation.
- **Draft vs authoritative** — the system does **not** **label** **legal** **“filed** **vs** **draft**” **;** staff should use **title** / **notes** **(future** **enum** **optional) **.
- **Provenance** — `uploadedByUserId` when `ADMIN_ACTOR_USER_EMAIL` matches a `User` **(optional) **; **keep** **upload** **logs** in **DB** for **audit** **(future** **richer** **log) **.

---

## 5. Prior financial submissions in the database

The repo’s **`Submission`** model (`type` + `content` + `structuredData` **JSON** **) **holds** **various** **form** **intakes** **;** it is **not** a dedicated **FEC** **/ state** **filing** **table** **. **Future** work can **(a)** **query** `Submission` for **types** / **metadata** that reference **money** or **compliance,** or **(b)** **import** **exports** as **`ComplianceDocument`** **files** **. **Not** **auto-imported** in COMP-2** **. **

---

## 6. Next packets (after COMP-2)

- **COMP-2b** — RAG / **SearchChunk** **index** **of** **approved** **documents** **(or** **chunks) **, **with** **source** **citations** **.
- **COMP-3** — **OCR** **/ extraction** (optional) **for** **structured** **line** **items** **;** still **human**-**reviewed** **.
- **BUDGET-2+** — **link** **receipt** **/ doc** **IDs** to **spend** **rows** when **budget** **ledger** **exists** **. **
- **POLICY-2** — **persisted** **versioned** **policy** **replacing** **or** **augmenting** **code** **defaults** **. **

---

*Last updated: Packet COMP-2 (with POLICY-1 + BUDGET-1 foundation run).*
