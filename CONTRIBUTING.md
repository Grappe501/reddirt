# Contributing

## Prerequisites

- Node 20+
- Docker (for local Postgres) or a valid `DATABASE_URL`

## Setup

See [README.md](./README.md) Quick start and [docs/quick-start.md](./docs/quick-start.md).

## Before you push

```bash
npm run check
```

This runs ESLint, TypeScript (`tsc --noEmit`), and a production build.

## Code style

- Match existing patterns: full-bleed sections, `ContentContainer`, Tailwind tokens (`deep-soil`, `red-dirt`, etc.).
- Do not commit `.env` or `.env.local`.
- Prefer extending typed content in `src/content/` over hard-coding long copy in pages.

## Architecture notes

See [docs/decisions/](./docs/decisions/).

## Pull requests

- Describe **what** changed and **why** (user-visible impact).
- Note if **DB migrations** or **ingest** is required after merge.
