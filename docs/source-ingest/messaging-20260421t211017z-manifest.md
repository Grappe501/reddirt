# Source ingest manifest — `Messaging -20260421T211017Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Messaging -20260421T211017Z-3-001` (**note:** space before hyphen in folder name) → nested `Messaging\`  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **1** **`.docx`** — messaging / brand explainer draft (**“What is sos”**). Internal **comms** content.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `H:\SOSWebsite\campaign information for ingestion\Messaging -20260421T211017Z-3-001\Messaging\What is sos.docx` | `What is sos.docx` | `.docx` | 9531 | 2026-04-21T21:48:09.897Z | Comms / messaging | `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Messaging -20260421T211017Z-3-001" --comms` | **needs_review** | Author; **public** vs **internal**; align **queue-first** norms ([`email-workflow-intelligence-AI-HANDOFF.md`](../email-workflow-intelligence-AI-HANDOFF.md)) | **Not** outbound send — draft for review before any **RAG** |

---

## Parser / backlog

| Command (after review) | Notes |
|--------------------------|--------|
| **`--comms`** preset | Matches **Messaging** bundle intent; **live** **DB** when executed. |

---

## Safety

- **No** auto-send; **no** voter classification.  
- Treat as **governed** copy if indexed for assistants — **human** review for **factual** claims about the campaign / SOS role.
