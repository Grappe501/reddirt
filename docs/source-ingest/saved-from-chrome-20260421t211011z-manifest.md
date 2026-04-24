# Source ingest manifest — `Saved from Chrome-20260421T211011Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `Saved from Chrome-20260421T211011Z-3-001` → nested `Saved from Chrome\`  
**Scan time (UTC):** 2026-04-24

**Name resolution:** Operator text used **`…211017Z-…`**; on disk the only matching folder is **`Saved from Chrome-20260421T211011Z-3-001`**. This manifest applies to that path.

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **1** **`.pdf`** — **Arkansas Election Laws and Constitution (2025 edition)**. **Official / legal reference** material (browser save). **Not** election **tabulation** JSON.

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `…\Saved from Chrome\Arkansas_Election_Laws_and_Constitution_2025_Edition.pdf` | `Arkansas_Election_Laws_and_Constitution_2025_Edition.pdf` | `.pdf` | 3266612 | 2026-04-21T21:48:21.503Z | Compliance / official reference | **`ComplianceDocument`** upload + metadata **or** `ingest-campaign-folder` (e.g. default **briefing**) **after** policy | **needs_review** | **Canonical URL** / publisher, **retrieval date**, edition year in **`notes`** ([`official-document-ingest-strategy.md`](../official-document-ingest-strategy.md)) | **~3.1 MB**; set **`approvedForAiReference`** only after staff review |

**Full path:** `H:\SOSWebsite\campaign information for ingestion\Saved from Chrome-20260421T211011Z-3-001\Saved from Chrome\Arkansas_Election_Laws_and_Constitution_2025_Edition.pdf`

---

## Parser / backlog

| Approach | Notes |
|----------|--------|
| **`ComplianceDocument`** | Preferred when tracking **provenance** and **AI** gating explicitly. |
| **`ingest-campaign-folder.ts`** | Can chunk PDF into **search** pipeline — **only** if **compliance** approves **RAG** use; **live** **DB**. |

---

## Safety

- **Not** a substitute for **counsel** or **SOS** **primary** sources — treat as **reference** **mirror**.  
- **No** voter targeting.  
- **Citations** required if used in **INTEL** / **comms** factual claims ([`opposition-intelligence-engine.md`](../opposition-intelligence-engine.md) norms where applicable).
