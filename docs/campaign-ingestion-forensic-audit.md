# Campaign asset ingestion — forensic audit

**Audit date:** 2026-04-22  
**Folder:** `H:\SOSWebsite\campaign information for ingestion`  
**Database check:** Prisma could not reach `127.0.0.1:5433` from the audit environment (`P1001`). **Disk evidence below is definitive; DB reconciliation must be re-run locally when Postgres is up.**

---

## 1. Code discovery map (ingest path)

| File | Role |
|------|------|
| `scripts/ingest-campaign-folder.ts` | Walks tree, skips `node_modules`/`.git`/`__MACOSX`, `.crdownload`, `Thumbs.db`, `.DS_Store`. Creates `MediaIngestBatch` (`FOLDER`, `sourceLabel` = **basename of folder** = `campaign information for ingestion`, `ingestPath` = absolute path). Processes each file with `supportedIngestExt`; `.zip` only if **`--include-zips`**. Skips e-learning bundle paths via `isBundledElearningPath`. |
| `scripts/ingest-campaign-files-core.ts` | **SHA-256** `ingestContentSha256`; **duplicate → skip** (`findFirst` on hash). Saves file via `saveOwnedMediaFile`, sets `metadataJson` (`ingestFrom`, `ingestSourceBundle`, `originalEntry`, classification). **`resolveIngestVisibility`**: without `--public`, **`isPublic: false`** and **`reviewStatus: PENDING_REVIEW`** for non-sensitive paths; sensitive paths always private + pending. Documents → optional **`OwnedMediaTranscript`** (IMPORT) if extracted text &gt; 20 chars. **`SearchChunk`** + embeddings only if **`OPENAI_API_KEY`** set and text &gt; 80 chars. |
| `scripts/ingest-briefing-zip.ts` | Same core; `ingestFrom: "zip"`; no `MediaIngestBatch` row. |
| `src/lib/ingest/sensitive-classification.ts` | Finance/donor/PII-like path patterns force **`isPublic: false`** even with `--public`. |
| `src/lib/ingest/campaign-folder-skip.ts` | Skips `content/lib/`, `scorm/`, `__MACOSX` paths inside zips/folder. |
| **Prisma** | `OwnedMediaAsset` (`ingestContentSha256`, `localIngestRelativePath`, `metadataJson`, `reviewStatus`, `isPublic`, `mediaIngestBatchId`, …), `OwnedMediaTranscript`, `MediaIngestBatch`, `SearchChunk`. |
| **Public “record room”** | `src/lib/campaign-briefings/briefing-queries.ts` → `listPublicCampaignBriefings()` requires **`reviewStatus: APPROVED`**, **`isPublic: true`**, **`issueTags`** containing `campaign-briefing`, `campaign-comms`, or `community-support-training`. Rendered on **`/resources`** via `CampaignBriefingLibrary`. |

---

## 2. Disk audit (measured)

Commands / tooling: `npm run audit:campaign-ingestion -- --disk-only` (or `npx tsx scripts/audit-campaign-ingestion.ts --disk-only`).

| Metric | Count |
|--------|------:|
| Files scanned (after ingest-style skips for `.crdownload` etc.) | **211** |
| Extensions **supported** by ingest | **163** |
| Would be ingested as **loose files** (no `--include-zips`) | **162** |
| Supported but skipped **e-learning bundle path** | **1** |
| **Unsupported** extension (never passed to `ingestCampaignFileBuffer`) | **48** |
| **`.zip`** files at tree (skipped unless `--include-zips`) | **2** |

**Unsupported extension groups observed:** `.zip`, `.woff`, `.ttf`, `.css`, `.js` (plus other non-media/doc types in the tree). These **never** create `OwnedMediaAsset` rows in the current pipeline.

**Approximate extension histogram** (PowerShell `Group-Object Extension` on 2026-04-22): `.docx` 51, `.jpg` 33, `.js` 27, `.xlsx` 21, `.HEIC` 19, `.png` 14, `.woff` 13, `.pdf` 9, `.html` 6, `.css` 5, `.csv` 5, `.mov` 3, `.zip` 2, `.crdownload` 2 (skipped by ingest walker), `.jpeg` 1, `.ttf` 1, `.pptx` 1.

**Content hashing:** Audit uses **SHA-256** of file bytes, matching `ingest-campaign-files-core.ts` (`createHash("sha256").update(buffer)`).

---

## 3. Database audit (not completed here)

**Evidence:** `npx prisma db execute` and `scripts/audit-campaign-ingestion.ts` (full mode) failed with:

`Can't reach database server at 127.0.0.1:5433`

**When DB is available, run:**

```bash
cd RedDirt
npx tsx scripts/audit-campaign-ingestion.ts --verbose
# or
npm run audit:campaign-ingestion -- --verbose
npm run reconcile:campaign-folder
```

**What the tooling loads:**

- `MediaIngestBatch` rows whose `ingestPath` / `sourceLabel` match the folder basename / path.
- `OwnedMediaAsset` rows where `metadataJson` ILIKE `%campaign information for ingestion%` **or** `mediaIngestBatchId` in those batches (then filtered by `ingestSourceBundle`).

**Per-asset fields reported in JSON mode:** id, paths, hash, review/public flags, transcript counts, **`SearchChunk` counts** for `briefing-doc:|comms-doc:|community-training-doc:` paths.

---

## 4. Reconciliation buckets (how to interpret)

After a successful DB run, the audit computes:

| Bucket | Meaning |
|--------|---------|
| **On disk & in DB (by hash)** | Same SHA-256 as an existing `ingestContentSha256`. |
| **On disk, missing from DB** | Supported loose file, hash not in DB — ingest **never ran**, **partial run**, or **different DB**. |
| **In DB, not public-eligible** | `reviewStatus !== APPROVED` or `isPublic === false` — **will not** appear in `/resources` record room. |
| **In DB, document, zero `SearchChunk`** | Often **no `OPENAI_API_KEY`** at ingest time, extract &lt; 80 chars, or embedding failure (asset still stored). |
| **In DB, document, no IMPORT transcript** | Empty extract, or non-text asset handling. |
| **Duplicate hashes on disk** | Same bytes, multiple paths — second path **skipped** on ingest as duplicate. |

**Zip caveat:** Two `.zip` archives exist. Without **`--include-zips`**, the folder ingest **only logs** `skip (use --include-zips)` and **does not** read inner files. Any expectation that zip contents were ingested **requires** that flag (or manual unzip + re-run).

---

## 5. Did the original ingest run?

**Cannot be proven from this environment** (DB offline).

**Indicators to check locally:**

1. `MediaIngestBatch` with `sourceLabel = 'campaign information for ingestion'` and `ingestPath` pointing at `H:\SOSWebsite\campaign information for ingestion`.
2. `OwnedMediaAsset.metadataJson.ingestSourceBundle` equal to that basename (or `basename::something.zip` if zips were processed).
3. `createdAt` on those assets vs your remembered run time.

If **no batch** and **no metadata** matches, the ingest **did not run** against this DB, or ran against a **different** `DATABASE_URL`.

---

## 6. Why assets may be “missing” from the website

Even when rows exist:

1. **Record room gate:** `listPublicCampaignBriefings()` requires **`APPROVED` + `isPublic: true` + briefing/comms/community tag.** Default folder ingest **without `--public`** leaves **`isPublic: false`** and **`PENDING_REVIEW`** → **nothing public.**
2. **Sensitive classification:** Paths matching finance/donor/PII heuristics stay **private** even with `--public`.
3. **Wrong surface:** Ingested **owned media** is not automatically on arbitrary pages; the curated public list is **`/resources`** (briefing library), not every site route.
4. **Search:** RAG chunks use paths `briefing-doc:{id}` / `comms-doc:{id}` / `community-training-doc:{id}`. No chunks if OpenAI was missing or text too short.

---

## 7. Recommended fixes

| Issue | Action |
|-------|--------|
| DB unknown | Start Docker/Postgres; `npx prisma migrate deploy`; re-run **`npm run audit:campaign-ingestion -- --verbose`**. |
| Files never ingested | `npx tsx scripts/ingest-campaign-folder.ts --dir "H:\SOSWebsite\campaign information for ingestion"` (+ `--community-training` / `--comms` if that preset was intended). Add **`--include-zips`** if zip contents matter. Add **`--public`** only for non-sensitive material you want **approved+public** immediately. |
| Zip contents expected | Re-run with **`--include-zips`** (robots/safety N/A; local files). |
| Public record room empty | In admin, **approve** assets and set **public**, or re-ingest with **`--public`** for non-sensitive paths only. |
| No search chunks | Ensure **`OPENAI_API_KEY`** in `.env.local` and re-ingest **or** add a dedicated “re-embed” pass (future enhancement). |
| Targeted repair | **`npm run repair:campaign-ingestion`** (dry-run). **`--apply-ingest-missing`** runs folder ingest again (idempotent for existing hashes). |

---

## 8. Tooling added in this audit

| Script | Purpose |
|--------|---------|
| `scripts/audit-campaign-ingestion.ts` | Disk inventory + optional DB + reconciliation summary; `--disk-only`, `--json`, `--write-md`. |
| `scripts/reconcile-campaign-folder-vs-db.ts` | JSON dump of batches + DB rows + reconcile object. |
| `scripts/repair-campaign-ingestion.ts` | Dry-run recommendations; **`--apply-ingest-missing`** re-runs folder ingest. |
| `src/lib/audit/campaign-ingestion-inventory.ts` | Recursive scan + SHA-256 + ingest-aligned flags. |
| `src/lib/audit/campaign-ingestion-audit.ts` | DB fetch helpers + `reconcileFolderWithDb`. |

**npm scripts:** `audit:campaign-ingestion`, `reconcile:campaign-folder`, `repair:campaign-ingestion`.

---

## 9. Final answers (evidence-based)

| Question | Answer |
|----------|--------|
| Are files in the database? | **Unknown here.** DB unreachable. **162** loose files are ingest-eligible; run audit with DB up. |
| Why missing from website if ingested? | Most likely **`isPublic: false`** and **`PENDING_REVIEW`** (no `--public`), or **sensitive** path classification. Public list is **`/resources`** only. |
| Re-ingest whole folder vs repair? | **Reconciliation first:** `audit:campaign-ingestion` + `repair:campaign-ingestion` (dry-run). **Re-ingest** is safe for **missing hashes** (idempotent). **Full re-ingest** only needed if wrong preset/DB or zip contents were skipped. |
| Did ingest “succeed” a few days ago? | **Not verified** without `MediaIngestBatch` / asset timestamps in your live DB. |

---

*Re-run this document’s disk section anytime with `npm run audit:campaign-ingestion -- --disk-only`. Merge DB results when Postgres is available.*
