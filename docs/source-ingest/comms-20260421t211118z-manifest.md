# Source ingest manifest — `Comms-20260421T211118Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Comms-20260421T211118Z-3-001` (nested `Comms\`, `Kelly's working docs\`, `Logo\`, `Marketing\`, `Social\`)  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **11** files — **5** `.docx`, **4** `.pdf`, **2** PNG images. Mix of **internal comms** drafts, **marketing/print** PDFs (incl. **~22 MB** deck), and **logo** assets. **Likely PII** in filenames and document bodies (names, card layouts).

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`; execution is **live** **DB** / **media** pipeline.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `…\Comms\Initial email - Strategic Team.docx` | `Initial email - Strategic Team.docx` | `.docx` | 8645 | 2026-04-21T21:46:58.695Z | Comms / internal | `ingest-campaign-folder` **`--comms`** | **needs_review** | Author, intended audience, **no** auto-send | Strategic team email draft |
| `…\Comms\Writing team distributed.docx` | `Writing team distributed.docx` | `.docx` | 6786 | 2026-04-21T21:46:58.663Z | Comms / internal | same | **needs_review** | same | Writing team coordination |
| `…\Comms\Kelly's working docs\Transparency video.docx` | `Transparency video.docx` | `.docx` | 7550 | 2026-04-21T21:46:58.849Z | Comms / creative | same | **needs_review** | same | Script / notes — review before RAG |
| `…\Comms\Kelly's working docs\VCK email.docx` | `VCK email.docx` | `.docx` | 7738 | 2026-04-21T21:46:58.818Z | Comms / email | same | **needs_review** | same | **PII** risk in body |
| `…\Comms\Logo\IMG_7325.PNG` | `IMG_7325.PNG` | `.png` | 938242 | 2026-04-21T21:46:58.756Z | Owned media / brand | same | **needs_review** | License / photographer if not solely internal | Large raster logo asset |
| `…\Comms\Logo\sos social.png` | `sos social.png` | `.png` | 375307 | 2026-04-21T21:46:58.780Z | Owned media / social | same | **needs_review** | same | Social graphic |
| `…\Comms\Marketing\Screenshot 2025-10-30 at 6.07.02?PM.pdf` | `Screenshot 2025-10-30 at 6.07.02?PM.pdf` | `.pdf` | 51408 | 2026-04-21T21:46:58.938Z | Comms / reference | same | **needs_review** | Source of screenshot (web? internal tool?) | Small PDF |
| `…\Comms\Marketing\sos business cards for Kris.pdf` | `sos business cards for Kris.pdf` | `.pdf` | 3358087 | 2026-04-21T21:46:59.011Z | Print / collateral | same | **needs_review** | **PII** — print vendor, approve redaction | **~3.2 MB** |
| `…\Comms\Marketing\sos kick off call.pdf 2.pdf` | `sos kick off call.pdf 2.pdf` | `.pdf` | 22278149 | 2026-04-21T21:47:00.167Z | Comms / deck | same | **needs_review** | Meeting date, attendees sensitivity | **~21.3 MB** — watch **timeout** / **embedding** limits |
| `…\Comms\Marketing\sos push card 2.pdf` | `sos push card 2.pdf` | `.pdf` | 4154777 | 2026-04-21T21:46:59.297Z | Print / field | same | **needs_review** | Print proof chain | **~4.0 MB** |
| `…\Comms\Social\Kelly_Grappe_SOS_Social_Media_Standards.docx` | `Kelly_Grappe_SOS_Social_Media_Standards.docx` | `.docx` | 37269 | 2026-04-21T21:46:58.918Z | Comms / policy | same | **needs_review** | Author approval for **standards** doc | Naming includes person — **governance** before **RAG** |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\Comms-20260421T211118Z-3-001\`

---

## Parser / backlog

| Command (after review) | Notes |
|------------------------|--------|
| `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Comms-20260421T211118Z-3-001" --comms` | **`--comms`** matches **preset** for this bundle. Supports **`.docx`**, **`.pdf`**, **`.png`** per `ingest-campaign-files-core.ts`. **Live** only. |

**Optional:** Ingest **subfolders** in **batches** if the **~22 MB** PDF causes **timeouts** — split work or raise limits per ops.

---

## Safety

- **Queue-first / no auto-send** for anything that looks like **email** copy ([`email-workflow-intelligence-AI-HANDOFF.md`](../email-workflow-intelligence-AI-HANDOFF.md)).  
- **No** voter scoring or support tiers from these files.  
- **Business cards** and **named** standards docs → treat as **sensitive** until redaction/approval policy is explicit.
