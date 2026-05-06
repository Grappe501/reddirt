# EMAIL-AI-CAMPAIGN-MEMORY-READINESS-1.0

**Lane:** `RedDirt/` only · **Surfaces:** Message Studio + Email Command Center `/readiness`

## Goal

Prepare operators and engineers for **true campaign document memory** (shared, queryable corpus) **without** implying SearchChunk RAG or embeddings exist where they do not. This packet is **inventory + UI + docs only**: **no ingestion runs**, **no fake index counts** (live SQL only), **no sends**.

## What exists today (audit summary)

| Area | Reality |
|------|--------|
| **`SearchChunk` (Postgres)** | Prisma model stores `path`, `title`, `content`, `embedding` (JSON text). Populated by operator/dev scripts such as `npm run ingest` (`scripts/ingest-docs.ts`) and optional campaign folder pipelines — **not** automatic in production deploys. |
| **Embeddings** | `src/lib/openai/embeddings.ts` — OpenAI embedding API. Ingest can store **empty** `[]` vectors when `OPENAI_API_KEY` is missing (`INGEST_SKIP_EMBEDDINGS` path in ingest script). Semantic similarity in `src/lib/openai/search.ts` **skips** rows with empty vectors. |
| **Retrieval** | `semanticSearch`, `keywordSearchChunks`, `searchChunks` in `search.ts` — used by **`POST /api/search`** and **`POST /api/assistant`** when the database is reachable. |
| **Message Studio / ECC OpenAI** | `message-draft-ai.ts`, draft critic, queue intelligence, etc. — use **static** Campaign Voice excerpts, operator paste, and advisory JSON per `ai-brain-registry` / `message-draft-ai` prompts. **They do not query `SearchChunk`.** |
| **Campaign documents (repo)** | Curated registry in `campaign-voice.ts` → `SOURCE_MATERIAL_READINESS` (paths + readiness kind). Static markdown in `docs/` is **source-of-truth for copy posture**, not proof of DB indexing until `ingest` has run on that environment. |
| **Ingestion scripts** | See `package.json` — `ingest`, `ingest:folder`, `ingest:briefings`, `audit:campaign-ingestion`, and many **governed** variants. Run only with explicit operator approval and the right packet; this doc does **not** authorize bulk ingest. |

## Code added in this packet

| File | Role |
|------|------|
| `src/lib/email-command-center/ai-campaign-memory-readiness.ts` | `getCampaignMemoryReadiness`, `listAvailableKnowledgeSources`, `listMissingKnowledgeSources`, `listIndexedKnowledgeSources`, `buildKnowledgeGapReport`, `buildRecommendedIngestionPlan` |
| `src/components/admin/email-command-center/MessageStudioCampaignMemoryPanel.tsx` | Operator UI: stats, buckets, registry gaps, how AI uses sources, paste list, ingestion plan |
| `message-studio/page.tsx` | Loads readiness snapshot for Message Studio |
| `readiness/page.tsx` | Loads same snapshot for ECC readiness |

## Functions (API)

- **`getCampaignMemoryReadiness()`** — Async snapshot: DB/OpenAI flags, live `SearchChunk` totals + embedding coverage (SQL), `memoryTier`, Message Studio posture, consumers list, paste reminders.
- **`listAvailableKnowledgeSources()`** — Sync: `SOURCE_MATERIAL_READINESS` entries with `readiness === "static_repo"`.
- **`listMissingKnowledgeSources()`** — Async: DB-empty / sparse embedding warnings + registry gaps + `MISSING_DOC_OPERATOR_GUIDANCE`.
- **`listIndexedKnowledgeSources()`** — Async: wraps the same SQL stats as the snapshot (for reuse or future actions).
- **`buildKnowledgeGapReport()`** — Async plain-text report for logs or copy-out.
- **`buildRecommendedIngestionPlan()`** — Sync ordered steps referencing **documented** `npm run` commands only; future corpus bullets below.

## Future ingestion plan (explicit packets — not auto-run)

Each bullet should become its own **governance + ingest** packet when Steve approves:

1. **Mission docs** — canonical mission / values markdown + version tags.  
2. **Policy docs** — internal policy summaries (non-legal warranty).  
3. **Candidate bio** — approved public bio only; no speculative personal detail.  
4. **Speeches / writings** — excerpt-level ingest with counsel review flags.  
5. **Fundraising language** — finance + compliance reviewed phrases; no urgency inventions.  
6. **Volunteer scripts** — shift/recruitment templates with event-truth rules.  
7. **Press responses** — attributed quotes only; no synthetic Q&A.  
8. **Issue briefs** — sourced policy explainers (`needs source` discipline).  
9. **Opposition claim rules** — **internal** contrast guardrails only; no unsourced opponent claims in outbound copy.  
10. **Compliance notes** — checklist language aligned with Send Execution governance.

Until those packets land, operators **paste** approved snippets into Message Studio and use Campaign Voice toggles to record intent.

## Checks

From `RedDirt/`:

- `npm run typecheck`
- `npm run check`
- `npm run email:no-send-scan`

## Hard constraints (recap)

- **No fake indexing** — UI shows SQL-backed counts or explicit errors.  
- **No large ingestion** from this packet — only references existing scripts; run ingest only under separate approved workflow.  
- **No sends.**
