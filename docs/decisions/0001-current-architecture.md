# ADR 0001 — Current application architecture

## Status

Accepted (as of Script 5.5)

## Context

The site is a **Next.js 15 App Router** application with:

- **Postgres + Prisma** for users, submissions, analytics events, search chunks.
- **Public pages** as server components with content modules under `src/content/`.
- **API routes** for forms, search, analytics, assistant.
- **Optional OpenAI** for embeddings, RAG answers, intake classification.

## Decision

- Keep **one repo** for marketing + APIs until traffic or compliance forces a split.
- Treat **content** as typed modules (stories, editorial, explainers, events, regions) rather than ad-hoc JSX only.
- Use **Netlify** with `@netlify/plugin-nextjs` and **migrate deploy** in the build command.

## Consequences

- Database is required for forms, search, and ingest — not for static browsing of pre-rendered pages that don’t hit API.
- Ingest remains a **separate command** from build to control cost and build time.
