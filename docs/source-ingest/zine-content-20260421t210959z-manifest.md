# Source ingest manifest — `Zine content-20260421T210959Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Zine content-20260421T210959Z-3-001` → nested `Zine content\`  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **1** **`.docx`** — zine copy (**“What is sos”** series part 1). **Content** / **creative** / **field** collateral; overlaps thematically with [`messaging-20260421t211017z-manifest.md`](./messaging-20260421t211017z-manifest.md) (`What is sos.docx`) — keep **provenance** distinct if both are indexed.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `H:\SOSWebsite\campaign information for ingestion\Zine content-20260421T210959Z-3-001\Zine content\Zine 1. What is sos_.docx` | `Zine 1. What is sos_.docx` | `.docx` | 9247 | 2026-04-21T21:49:28.085Z | Content / zine (print or digital) | `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Zine content-20260421T210959Z-3-001"` (default **briefing** **or** **`--comms`**) | **needs_review** | Author, print vs web use, **version** | Trailing **`_`** in filename |

---

## Parser / backlog

| Command (after review) | Notes |
|------------------------|--------|
| `ingest-campaign-folder` **without** preset **or** **`--comms`** | **Live** **DB** when run; choose preset to match how **Messaging** / **Editorials** bundles are classified. |

---

## Safety

- **No** auto-publish; zines are **public-facing** when printed — **fact-check** before **RAG** treats as canon.  
- **No** voter classification.
