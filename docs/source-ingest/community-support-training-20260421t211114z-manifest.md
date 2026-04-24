# Source ingest manifest — `Community Support Training-20260421T211114Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Community Support Training-20260421T211114Z-3-001` (nested `Community Support Training\`)  
**Scan time (UTC):** 2026-04-24

**Operator input note:** Request used abbreviated name `Community Support Training-20260421T...` — **resolved** to full folder **`Community Support Training-20260421T211114Z-3-001`**. If your disk uses a **different** trailing timestamp, re-scan that path and replace this manifest.

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **2** Microsoft Word **`.docx`** files — **community / volunteer training** and **relational** (“Power of 5”) material. One file is **~1.2 MB** (likely rich layout or images). **Filenames** may include **leading emoji/symbols**; console listing showed `??` placeholders — verify in **Explorer** before scripting moves.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## File inventory

| file_path | file_name (as listed by scan) | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-------------------------------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `…\Community Support Training\?? VOTER REGISTRATION SPACE.docx` | `?? VOTER REGISTRATION SPACE.docx` | `.docx` | 1223675 | 2026-04-21T21:47:10.060Z | Volunteer / field / training | `ingest-campaign-folder` **`--community-training`** | **needs_review** | Trainer, version, **public** vs **internal** | **Large** docx — check extract performance |
| `…\Community Support Training\?? MASTER FLOW_ POWER OF 5 (CULTURAL ENGINE).docx` | `?? MASTER FLOW_ POWER OF 5 (CULTURAL ENGINE).docx` | `.docx` | 11284 | 2026-04-21T21:47:10.014Z | Volunteer / relational training | same | **needs_review** | same | Aligns with **relational** / **Power of Five** docs in repo |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\Community Support Training-20260421T211114Z-3-001\`

---

## Parser / backlog

| Command (after review) | Notes |
|------------------------|--------|
| `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion\Community Support Training-20260421T211114Z-3-001" --community-training` | Matches **`ingest:campaign-info-folder`** style **community-training** preset. **Live** **DB**. |

---

## Safety

- **No** voter classification or support scoring derived from training docs.  
- **Voter registration** in the **title** implies **compliance-sensitive** framing — **human** review before **RAG** or **volunteer**-facing surfacing.  
- **Cultural** / **community** content — review for **inclusive** use and **internal** vs **external** boundaries.
