# Source ingest manifest — `Editorials-20260421T211104Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Editorials-20260421T211104Z-3-001` (nested `Editorials\`)  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **2** **`.docx`** files — **editorial / op-ed** drafting and a **civic engagement** writing brief. Internal **content** workflow material.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `…\Editorials-20260421T211104Z-3-001\Editorials\Civic Engagement Writing Brief.docx` | `Civic Engagement Writing Brief.docx` | `.docx` | 8217 | 2026-04-21T21:47:21.678Z | Content / editorial (brief) | `ingest-campaign-folder` (default **briefing** preset **or** **`--comms`** if treated as messaging) | **needs_review** | Author, publication target (if any), **review** before **RAG** | Workshop / standards-style brief |
| `…\Editorials-20260421T211104Z-3-001\Editorials\Dec 25 op Ed.docx` | `Dec 25 op Ed.docx` | `.docx` | 9440 | 2026-04-21T21:47:21.720Z | Content / op-ed draft | same | **needs_review** | same | **Publication** sensitivity — **no** **unreviewed** **external** use |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\Editorials-20260421T211104Z-3-001\`

---

## Parser / backlog

| Command (after review) | Notes |
|------------------------|--------|
| `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Editorials-20260421T211104Z-3-001"` | Default preset = **briefing** — fits **editorial** drafting. Use **`--comms`** only if ops labels this bundle under **comms** ingest policy. **Live** **DB**. |

---

## Safety

- **No** automated **publish**; op-ed drafts are **high** **reputational** **risk** if surfaced as canon.  
- Align with **content** / **comms** governance ([`email-workflow-intelligence-AI-HANDOFF.md`](../email-workflow-intelligence-AI-HANDOFF.md) queue-first norms where overlapping).  
- **No** voter classification from these docs.
