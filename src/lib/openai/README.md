# OpenAI + retrieval (Phase 3)

Server-only. Never import `client.ts`, `classify.ts`, `embeddings.ts`, or `search.ts` from client components.

## Environment

See `.env.example`:

- `OPENAI_API_KEY` — required for embeddings, classification, and RAG answers.
- `OPENAI_MODEL` — chat model (default `gpt-4o-mini`).
- `OPENAI_EMBEDDING_MODEL` — default `text-embedding-3-small`.

## Capabilities

| Module | Role |
|--------|------|
| `client.ts` | Singleton OpenAI client |
| `embeddings.ts` | Batch + query embeddings, cosine similarity helpers |
| `classify.ts` | Structured JSON classification of form intake |
| `search.ts` | Prisma-backed semantic search over `SearchChunk` rows |
| `prompts.ts` | System prompts for classifier + RAG |

## Indexing content

1. Ensure `DATABASE_URL` + `OPENAI_API_KEY` are set.
2. Run migrations (`npx prisma migrate deploy`).
3. Run `npm run ingest` to chunk `docs/**/*.md`, embed, and upsert `SearchChunk`.

## API routes

- `POST /api/search` — `{ query, includeAnswer? }` → `{ results, answer? }`
- `POST /api/assistant` — `{ message }` → grounded `{ reply, suggestions }`
- `POST /api/forms` — validated movement forms → Prisma + optional classification

## Phase 4 ideas

- Vector DB / pgvector for large corpora
- Redis / Upstash rate limits across instances
- Background jobs for ingestion + CRM webhooks
- Tool-calling assistant with strict allowlists
