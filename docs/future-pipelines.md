# Future pipeline pathways (Script 5.5 — hooks only)

Do not implement these here; keep extension points clean.

## Launcher / runtime

- **`npm run dev:full`** — add optional flags or env (`RUN_INGEST=1`) later without changing the default “safe dev” path.
- **`scripts/launch-dev.cjs`** — central place to prepend background workers if needed.

## Dashboard & “Agent Jones” (deferred)

- Prefer **separate app or `/app/(admin)` route group** with its own auth — avoid mixing public layout with admin chrome.
- API: namespace under `/api/admin/*` or edge middleware-gated routes.

## Background jobs / cron

- **Ingest:** today `npm run ingest`; future: Netlify Scheduled Functions, GitHub Actions, or queue worker reading the same Prisma models.
- **CRM / email sync:** add webhooks + idempotent handlers; do not block public form POST latency.

## Media pipeline

- Replace `public/media/placeholders/*.svg` via **registry** (`src/content/media/registry.ts`) without changing content slugs.
- Future: S3/CDN URLs + `next/image` remotePatterns.

## Event integrations (Mobilize, etc.)

- See `src/lib/integrations/mobilize.ts` — keep TODOs; sync should not break static generation.

## Config validation

- Expand `src/lib/env.ts` with stricter production checks (e.g. fail build if `DATABASE_URL` missing in CI).
