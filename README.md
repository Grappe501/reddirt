# Red Dirt Democrats — site

Arkansas-rooted movement site: Next.js App Router, Prisma/Postgres, semantic search + optional OpenAI RAG, forms, analytics, local organizing, editorial content.

**Current package version:** see `package.json` (stabilization track post–Script 5.5).

## Quick start (one command)

**Cross-platform (recommended):**

```bash
npm install
npm run dev:full
```

This runs Docker Compose (Postgres), `prisma generate`, `prisma migrate deploy`, then `next dev`. If Compose fails, start Docker and retry or run services manually.

**Windows (PowerShell):**

```powershell
npm install
.\scripts\dev.ps1
```

**macOS / Linux:**

```bash
npm install
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### First-time environment

1. Copy `.env.example` → `.env.local`.
2. Default `DATABASE_URL` matches `docker-compose.yml` (`reddirt` / `reddirt` / `reddirt`).
3. Optional: set `OPENAI_API_KEY` for search answers + intake classification; set `NEXT_PUBLIC_SITE_URL` for production OG URLs.

### Useful npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next dev only |
| `npm run dev:full` | DB + Prisma + Next (see above) |
| `npm run dev:db` | `docker compose up -d` |
| `npm run dev:prepare` | `prisma generate` + `migrate deploy` |
| `npm run dev:web` | `next dev` |
| `npm run check` | lint + typecheck + build |
| `npm run harden` | same as `check` |
| `npm run ingest` | Re-embed search chunks (needs DB + `OPENAI_API_KEY`) |

## Quality gate before push

```bash
npm run check
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/deployment.md](./docs/deployment.md).

## Docs

- [docs/quick-start.md](./docs/quick-start.md) — launcher details
- [docs/deployment.md](./docs/deployment.md) — Netlify & production
- [docs/decisions/](./docs/decisions/) — architecture ADRs
- [docs/future-pipelines.md](./docs/future-pipelines.md) — planned integrations (stubs only)

## Connect Git / first push

```bash
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/ORG/REPO.git
git push -u origin main
```

Replace `ORG/REPO` with your GitHub repository.
