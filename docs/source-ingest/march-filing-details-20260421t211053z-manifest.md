# Source ingest manifest — `March Filing Details-20260421T211053Z-3-001`

**Packet:** SOURCE-INGEST-FOLDER-TEMPLATE  
**Root:** `H:\SOSWebsite\campaign information for ingestion`  
**Scanned subtree:** `March Filing Details-20260421T211053Z-3-001` (nested `March Filing Details\`)  
**Scan time (UTC):** 2026-04-24

**Operator input:** Name was abbreviated (`…211053Z-…`); **resolved** to **`March Filing Details-20260421T211053Z-3-001`**.

**Hard gate:** `npm run ingest:election-audit:json` → **`COMPLETE`** (verified before scan).

**Folder summary:** **11** files — **1** **`.xlsx`** (**March Filing Details.xlsx**) and **10** **`.HEIC`** iPhone photos (duplicate size pair `IMG_0182` / `IMG_0182(1)`). Likely **compliance / finance** packet: spreadsheet + **document or receipt photos**. **High sensitivity** (PII, financial detail, **EXIF** location/device).

**Dry-run ingest:** **Not run** — `ingest-campaign-folder.ts` has **no** `--dry-run`.

---

## File inventory

| file_name | ext | size_bytes | modified_iso_utc | likely_domain | recommended_parser | ingest_readiness | provenance_needed | notes |
|-----------|-----|------------|------------------|---------------|-------------------|------------------|-------------------|-------|
| `March Filing Details.xlsx` | `.xlsx` | 80751 | 2026-04-21T21:47:55.991Z | Finance / disclosure | **No approved structured finance ingest** — see [`february-filing-details-20260421t211056z-manifest.md`](./february-filing-details-20260421t211056z-manifest.md) pattern | **blocked_sensitive** | Committee, period, export source | Do **not** RAG as generic spreadsheet without policy |
| `IMG_0182.HEIC` | `.HEIC` | 1743221 | 2026-04-21T21:47:56.044Z | Compliance / evidence photo | `ingest-campaign-folder` **only** after **ops** approves imagery handling | **needs_review** | What doc was photographed; **retention** | **EXIF** may include GPS/device |
| `IMG_0182(1).HEIC` | `.HEIC` | 1743221 | 2026-04-21T21:47:55.601Z | same | same | **needs_review** | same | **Duplicate** byte size — likely duplicate shot; dedupe policy |
| `IMG_0183.HEIC` | `.HEIC` | 1809275 | 2026-04-21T21:47:55.705Z | same | same | **needs_review** | same | |
| `IMG_0184.HEIC` | `.HEIC` | 1764913 | 2026-04-21T21:47:55.674Z | same | same | **needs_review** | same | |
| `IMG_0185.HEIC` | `.HEIC` | 2530910 | 2026-04-21T21:47:55.820Z | same | same | **needs_review** | same | |
| `IMG_0187.HEIC` | `.HEIC` | 2450594 | 2026-04-21T21:47:55.754Z | same | same | **needs_review** | same | |
| `IMG_0340.HEIC` | `.HEIC` | 3135594 | 2026-04-21T21:47:55.918Z | same | same | **needs_review** | same | |
| `IMG_0341.HEIC` | `.HEIC` | 2711256 | 2026-04-21T21:47:55.976Z | same | same | **needs_review** | same | |
| `IMG_9685.HEIC` | `.HEIC` | 1139315 | 2026-04-21T21:47:55.865Z | same | same | **needs_review** | same | |
| `IMG_9686.HEIC` | `.HEIC` | 1177032 | 2026-04-21T21:47:55.842Z | same | same | **needs_review** | same | |

**Path prefix:** `H:\SOSWebsite\campaign information for ingestion\March Filing Details-20260421T211053Z-3-001\March Filing Details\`

---

## Parser / backlog

| Asset | Notes |
|-------|--------|
| **`.xlsx`** | Same **governance** as **February Filing** exports — **FUND-**/compliance packet before structured import. |
| **`.HEIC`** | `ingest-campaign-files-core.ts` treats **`.heic`** as supported **image** — **`ingest-campaign-folder`** can index **after** **stripping**/review policy for **PII** in frames and **metadata**. |

---

## Safety

- Assume **financial** or **identity** information in **photos** until reviewed.  
- **No** public publish; **no** unrestricted **RAG**.  
- **Pair** this manifest with **Finance / Compliance** procedures, not only brain ingest.
