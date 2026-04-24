# Source ingest manifest — `26PMONRO_PROOF4`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `26PMONRO_PROOF4`  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** Three **PDF** files — naming suggests **direct-mail print proofs** by party variant (**DEM** / **NON** / **REP**) for a **26P MONRO** project. Treat as **owned media / comms collateral** unless compliance reclassifies.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`; it creates **`MediaIngestBatch`** and ingests via DB. **Do not** run without explicit operator approval and [`official-document-ingest-strategy.md`](../official-document-ingest-strategy.md) / governance review if content may be **PII**-heavy or **pre-publication**.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `H:\SOSWebsite\campaign information for ingestion\26PMONRO_PROOF4\26PMONRO_DEM_PROOF.pdf` | `26PMONRO_DEM_PROOF.pdf` | `.pdf` | 960291 | 2026-04-21T21:44:51.279Z | Owned media / comms (mail proof) | `npx tsx scripts/ingest-campaign-folder.ts --dir "<this-folder>"` **or** dashboard **`ComplianceDocument`** if tracked as compliance artifact | **needs_review** | Print vendor, proof date, approver; confirm **no** restricted PII before **public** or **RAG** | Democratic party variant proof |
| `H:\SOSWebsite\campaign information for ingestion\26PMONRO_PROOF4\26PMONRO_NON_PROOF.pdf` | `26PMONRO_NON_PROOF.pdf` | `.pdf` | 911812 | 2026-04-21T21:44:51.476Z | Owned media / comms (mail proof) | same | **needs_review** | same | Nonpartisan / NP variant naming — confirm meaning with ops |
| `H:\SOSWebsite\campaign information for ingestion\26PMONRO_PROOF4\26PMONRO_REP_PROOF.pdf` | `26PMONRO_REP_PROOF.pdf` | `.pdf` | 1027148 | 2026-04-21T21:44:51.115Z | Owned media / comms (mail proof) | same | **needs_review** | same | Republican party variant proof |

---

## Parser / backlog

| Approach | When to use |
|----------|-------------|
| **`ingest-campaign-folder.ts`** | Bulk **SearchChunk** / media pipeline for **approved** campaign PDFs; requires **`DATABASE_URL`**; see `ingest-campaign-files-core.ts` for PDF handling. **Live** only — schedule deliberately. |
| **`ComplianceDocument` upload** | If proofs must sit in **compliance** trail with **`approvedForAiReference`** gating — [`compliance-document-ingest-foundation.md`](../compliance-document-ingest-foundation.md). |
| **Future: text extract + index** | [`official-document-ingest-strategy.md`](../official-document-ingest-strategy.md) §4 — only after **human** **review** if used for RAG. |

**No dedicated single-file dry-run** in repo for this path; **parser recommendation** is **documented** above, **not** executed in this packet.

---

## Safety

- **Do not** treat as **election tabulation** — not SOS JSON.  
- **Do not** auto-publish or expose externally without **human** review (proofs often pre-final).  
- **No** voter scoring / support classification from these files.
