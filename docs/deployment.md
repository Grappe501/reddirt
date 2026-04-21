# Deployment (Netlify + Next.js)

## Netlify build

Configured in `netlify.toml`:

- **Build command:** `npx prisma migrate deploy && npm run build`
- **Plugin:** `@netlify/plugin-nextjs`
- **Node:** 20

## Required environment variables (production)

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Hosted Postgres connection string |
| `OPENAI_API_KEY` | Optional | Search RAG + form intake classification |
| `OPENAI_MODEL` | Optional | Defaults in `.env.example` |
| `OPENAI_EMBEDDING_MODEL` | Optional | For ingest + query embeddings |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for Open Graph (no trailing slash) |

Never expose server secrets via `NEXT_PUBLIC_*`.

## After first deploy

1. Run migrations (already in build command).
2. Run **`npm run ingest`** from a secure context with `DATABASE_URL` + `OPENAI_API_KEY` if you want search chunks populated (not part of default Netlify build — often a manual or scheduled job).
3. Verify forms and analytics hit the production DB.

## Manual today

- **Search index:** ingest is not in the Netlify build (by design — avoids build-time OpenAI cost and long builds).
- **Disclaimer / FEC copy:** replace footer placeholder in `SiteFooter`.
- **CI:** `npm run check` is ready for GitHub Actions; workflow not committed yet.

## Runtime caveats

- API routes need `DATABASE_URL` at runtime on Netlify (serverless functions).
- Prisma binary: `schema.prisma` includes `binaryTargets` for deployment platforms; adjust if you change hosts.

## Local vs production

- Local: `docker-compose.yml` Postgres.
- Production: managed Postgres; use connection pooling if your provider recommends it.
