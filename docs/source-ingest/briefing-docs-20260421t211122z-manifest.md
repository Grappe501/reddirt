# Source ingest manifest — `Briefing Docs-20260421T211122Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Briefing Docs-20260421T211122Z-3-001` (includes nested `Briefing Docs\`)  
**Scan time (UTC):** 2026-04-24

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **3** Microsoft Word **`.docx`** briefs — internal research / field briefing style. **No** `.zip` at root of this tree ( **`ingest-briefing-zip`** not indicated for the folder itself).

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` and **`ingest-briefing-zip.ts`** have **no** documented **`--dry-run`**; both touch **DB** / media pipeline when executed.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `…\Briefing Docs-20260421T211122Z-3-001\Briefing Docs\Jonesboro 12-15-2025.docx` | `Jonesboro 12-15-2025.docx` | `.docx` | 12448 | 2026-04-21T21:45:04.500Z | Research / briefing (geography-tagged) | `npx tsx scripts/ingest-campaign-folder.ts --dir "<abs-path-to-this-folder>"` (default **briefing** preset) | **needs_review** | Author, meeting/context, whether **OK** for **RAG** (`approvedForAiReference` pattern) | Date in filename **12-15-2025** |
| `…\Briefing Docs-20260421T211122Z-3-001\Briefing Docs\Make Elections Great Again Brief.docx` | `Make Elections Great Again Brief.docx` | `.docx` | 13250 | 2026-04-21T21:45:04.516Z | Research / briefing | same | **needs_review** | same | Political messaging memo — **internal** use / review before indexing |
| `…\Briefing Docs-20260421T211122Z-3-001\Briefing Docs\Muslim leadership.docx` | `Muslim leadership.docx` | `.docx` | 22049 | 2026-04-21T21:45:04.456Z | Research / briefing (community) | same | **needs_review** | same | **Sensitivity:** community / religion — **human** review **mandatory** before **any** **public** or **broad** **RAG** use |

*Full paths (copy/paste):*

- `H:\SOSWebsite\campaign information for ingestion\Briefing Docs-20260421T211122Z-3-001\Briefing Docs\Jonesboro 12-15-2025.docx`
- `H:\SOSWebsite\campaign information for ingestion\Briefing Docs-20260421T211122Z-3-001\Briefing Docs\Make Elections Great Again Brief.docx`
- `H:\SOSWebsite\campaign information for ingestion\Briefing Docs-20260421T211122Z-3-001\Briefing Docs\Muslim leadership.docx`

---

## Parser / backlog

| Script | Role |
|--------|------|
| **`ingest-campaign-folder.ts`** | **`--dir`** to this bundle root; supports **`.docx`** via `ingest-campaign-files-core.ts`. Default preset = **briefing** (unless `--comms` / `--community-training`). **Live** **DB** — schedule after review. |
| **`npm run ingest:briefings`** | **`ingest-briefing-zip.ts`** — for **`.zip`** archives; use if future drops are zipped. |

---

## Safety

- **No** voter / support classification from these docs.  
- **No** external publish without review.  
- Treat **community- and faith-related** briefs as **high** **governance** **risk** for automated indexing.
