# Source ingest manifest — `February Filing Details-20260421T211056Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `February Filing Details-20260421T211056Z-3-001` (nested `February Filing Details\`)  
**Scan time (UTC):** 2026-04-24

**Operator input:** Name was abbreviated (`…211056…`); **resolved** to **`February Filing Details-20260421T211056Z-3-001`**.

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **2** files — **committee transaction** export for **February 2026** in **`.csv`** and **`.xlsx`** (same logical dataset). **Finance / compliance** domain; **high sensitivity** (likely **donor PII**, amounts, addresses in cells).

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`. **Do not** bulk-ingest into **RAG** without **Finance/Compliance** approval ([`BUILD_PROTOCOL`](../BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) / finance docs).

---

## File inventory

| file_path | file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `…\February Filing Details\_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 28, 2026_.csv` | `_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 28, 2026_.csv` | `.csv` | 18254 | 2026-04-21T21:47:41.448Z | Finance / campaign disclosure | **None approved for auto-ingest** — see **Parser backlog** | **blocked_sensitive** | Source system (e.g. AEC/SOS export), committee, **reporting period**, who may access | **Donor PII** risk |
| `…\February Filing Details\_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 28, 2026_.xlsx` | `_Committee to Elect Kelly Grappe_transactions_Feb 1, 2026_Feb 28, 2026_.xlsx` | `.xlsx` | 40521 | 2026-04-21T21:47:41.487Z | Finance / campaign disclosure | same | **blocked_sensitive** | same | Duplicate grain as **CSV**; prefer **one** canonical import if a **FUND-** packet adds structured finance ingest |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\February Filing Details-20260421T211056Z-3-001\`

---

## Parser / backlog

| Option | Notes |
|--------|--------|
| **Future structured finance ingest** | [`PROJECT_MASTER_MAP.md`](../PROJECT_MASTER_MAP.md) references **FUND-2** / compliance review — **no** dedicated **`npm run`** finance importer in `package.json` today. |
| **`ingest-campaign-folder.ts`** | Technically ingests **`.csv`** / **`.xlsx`** into **media/search** pipeline — **usually wrong** for **raw** **transaction** **exports** (**PII** + **governance**). **Not recommended** until product defines **retention** and **access** **class**. |

---

## Safety

- **No** voter targeting or support tiers from these files.  
- **No** ingestion into **public** or **unrestricted** **RAG** without **explicit** **policy**.  
- Treat as **controlled** **finance** **data**; align with **Finance / Compliance** division when implementing ingest.
