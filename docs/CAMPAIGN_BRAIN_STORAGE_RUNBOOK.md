# Campaign brain storage runbook (BRAIN-STORAGE-1)

**Purpose:** Deliberately store material under `H:\SOSWebsite\campaign information for ingestion` so the **campaign AI assistant** and **semantic search** (`SearchChunk`) can retrieve it—**without** treating **election tabulation JSON**, **finance disclosure exports**, or **filing-detail trees** as bulk RAG.

**Stack:** `RedDirt/` · Prisma · `OwnedMedia` · `SearchChunk` · OpenAI embeddings.

**Safety:** Local/dev oriented. Do **not** point at production `DATABASE_URL` unless intended. **Never** commit API keys. Finance and PII belong in **governed** tables and review flows, not anonymous chunk search.

---

## 1. What “stored properly” means (four lanes)

| Lane | Storage | Assistant / search |
|------|---------|--------------------|
| **Narrative brain** (docx, pdf, pptx, html, txt, media metadata) | `OwnedMedia` + `OwnedMediaTranscript` + **`SearchChunk`** embeddings | RAG via `searchChunks` / assistant |
| **Election results JSON** | **`ElectionResultSource`** + tabulation tables | Read models / workbench—not the same as file embeddings |
| **Finance / compliance** | **`FinancialTransaction`**, **`ComplianceDocument`**, approvals | Workbench uploads + human confirm—not bulk `SearchChunk` from CSV/XLSX |
| **Site + internal markdown** | `npm run ingest` → **`SearchChunk`** | Public/guide context |

---

## 2. Preconditions

1. **`DATABASE_URL`** set in `.env` / `.env.local`.
2. **`OPENAI_API_KEY`** valid: `npm run test:openai-key` → success.
3. **Election ingest gate:** `npm run ingest:election-audit:json` → **`status: COMPLETE`** (canonical **13** JSONs for your DB).

Optional: set **`CAMPAIGN_INGEST_ROOT`** if the tree is not the default Windows path below.

---

## 3. Governed full-tree ingests (three presets)

Use **`--brain-governed`** so the CLI **skips**:

- `electionResults/` (tabulation is already ingested via `ingest:election-results`)
- `February Filing Details-20260421T211056Z-3-001/`
- `March Filing Details-20260421T211053Z-3-001/`
- Filenames under heuristics: `_Committee…`, names containing **`donor`**, **`transaction`**

Add more with repeated **`--skip-path-prefix relative/path`**.

**Default ingest root (adjust if needed):**

`H:\SOSWebsite\campaign information for ingestion`

**Briefing / strategy bias (default preset = briefing):**

```text
cd RedDirt
npm run brain:ingest:tree:briefing
```

**Comms bias:**

```text
npm run brain:ingest:tree:comms
```

**Community-support training bias:**

```text
npm run brain:ingest:tree:training
```

Each run creates a **`MediaIngestBatch`** and prints **`mediaIngestBatchId`** in the final JSON. **Duplicates** (same content hash) return the existing asset id and do not double-store bytes.

**Important:** Because of **content-hash deduplication**, running **briefing**, then **comms**, then **training** on the **same** full tree only ingests net-new files on the second and third passes—already-seen files are skipped as duplicates and **keep their original preset tags**. To bias different subtrees, either **pick one preset** for one full-tree run, or run separate commands with **`--dir`** pointed at **different folders** (see `docs/source-ingest/*-manifest.md`).

---

## 4. Root-level loose comms (already a dedicated batch)

Root-only ingest avoids subfolders and skips root **.csv / .xlsx / .xls**:

```text
npm run ingest:campaign-root-loose
```

If **`SearchChunk`** rows failed earlier (e.g. OpenAI 401), repair by batch id:

```text
npm run repair:owned-media-embeddings -- --batch-id <mediaIngestBatchId> --dry-run
npm run repair:owned-media-embeddings -- --batch-id <mediaIngestBatchId>
```

---

## 5. Zips inside the tree

The **`brain:ingest:tree:*`** scripts pass **`--include-zips`**. Archives are expanded in memory; e-learning player junk paths stay skipped unless you opt in with **`--include-elearning-bundles`** (not recommended).

---

## 6. Repo markdown / guide corpus

Keep **`docs/**/*.md`** and seeded routes in RAG as today:

```text
npm run ingest
```

---

## 7. Finance and “pull finance records”

- **Not done** by folder brain ingest when **`--brain-governed`** is on for sensitive paths/names.
- **Operational path:** upload / enter records under **Financial** and **Compliance** admin surfaces (`FinancialTransaction`, `ComplianceDocument`) with review and confirmation.
- **Future packet (FINANCE-1 / VOL-DATA-1):** governed importers from defined exports—**not** “embed the spreadsheet into SearchChunk.”

---

## 8. Agent parameters (configuration)

- **Model / embedding:** `.env.local` — `OPENAI_MODEL`, `OPENAI_EMBEDDING_MODEL` (see `src/lib/openai/client.ts`).
- **Retrieval behavior:** `src/lib/openai/search.ts` (keyword + semantic blend), `prioritizeHitsForAssistant`.
- **Rate limits / API routes:** `src/app/api/assistant/route.ts`, `src/app/api/search/route.ts`.
- For **tool-calling** or **department-specific allowlists**, extend via a future packet—do not store secrets in `SearchChunk` content.

---

## 9. Verification checklist

| Check | Command or action |
|--------|-------------------|
| Election JSON | `npm run ingest:election-audit:json` |
| OpenAI | `npm run test:openai-key` |
| Chunk count | `GET /api/search` (reports `chunkCount`) or Prisma `SearchChunk.count()` |
| Owned media | Prisma / Media Center — `OwnedMediaAsset` by `mediaIngestBatchId` |
| Embedding gaps | `npm run repair:owned-media-embeddings -- --batch-id … --dry-run` |

---

## 10. Quick reference — npm scripts (BRAIN-STORAGE-1)

| Script | Role |
|--------|------|
| `npm run brain:storage:plan` | Print this plan summary |
| `npm run brain:ingest:tree:briefing` | Governed tree ingest (briefing preset) |
| `npm run brain:ingest:tree:comms` | Governed tree ingest (comms preset) |
| `npm run brain:ingest:tree:training` | Governed tree ingest (community-training preset) |
| `npm run repair:owned-media-embeddings` | Backfill **`SearchChunk`** for a batch |
| `npm run ingest:election-audit:json` | Election disk vs DB gate |

---

*Last updated: BRAIN-STORAGE-1 — governed `--brain-governed` folder ingest + operator runbook.*
