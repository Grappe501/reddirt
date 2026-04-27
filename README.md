# Red Dirt Democrats — site

**Current classification:** This repository is the **Kelly Grappe for Arkansas Secretary of State** production site and campaign engine (Next.js, Prisma/Postgres, admin workbench, integrations). Future **template extraction** is a separate phase and must **not** include Kelly campaign data, PII, finance, or internal strategy artifacts.

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

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/deployment.md](./docs/deployment.md). **Netlify first-time / empty DB:** [docs/NETLIFY_FIRST_DEPLOY.md](./docs/NETLIFY_FIRST_DEPLOY.md).

## New AI thread / engineer / Cursor session

**Start a fresh chat with full campaign-OS context** — read **in this order** (or paste the short anchor from [`docs/NEW_THREAD_START_HERE.md`](./docs/NEW_THREAD_START_HERE.md)):

1. [`docs/THREAD_HANDOFF_MASTER_MAP.md`](./docs/THREAD_HANDOFF_MASTER_MAP.md) — **THREAD-HANDOFF-1** (orientation, build steering §0.9, division balance §0.8).
2. [`docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md`](./docs/BUILD_PROTOCOL_AND_BLUEPRINT_AUDIT.md) — **PROTO-2** + **DIV-OPS-1/2** (steering decision, preflight, drift).
3. [`docs/DIVISION_MASTER_REGISTRY.md`](./docs/DIVISION_MASTER_REGISTRY.md) — **L0–L5** + priority (check before the next packet).
4. [`docs/PROJECT_MASTER_MAP.md`](./docs/PROJECT_MASTER_MAP.md) — blueprint progress ledger + §8 capabilities.

**Index of all doc lanes:** [`docs/README.md`](./docs/README.md).

**Quality gate before substantive pushes:** `npm run check` from this folder (lint + `tsc` + build).

---

## Docs

- [docs/quick-start.md](./docs/quick-start.md) — launcher details
- [docs/deployment.md](./docs/deployment.md) — Netlify & production
- [docs/decisions/](./docs/decisions/) — architecture ADRs
- [docs/future-pipelines.md](./docs/future-pipelines.md) — planned integrations (stubs only)
- [docs/field-structure-foundation.md](./docs/field-structure-foundation.md) — FIELD-1 field units + assignments (positions / seats)
- [docs/youth-pipeline-foundation.md](./docs/youth-pipeline-foundation.md) — YOUTH-1 youth roles + governance (types in `src/lib/campaign-engine/youth.ts`)
- [docs/youth-agent-ingest-map.md](./docs/youth-agent-ingest-map.md) — YOUTH-1 agent / RAG guardrails
- [docs/data-targeting-foundation.md](./docs/data-targeting-foundation.md) — DATA-1 county/voter goals vs schema reality
- [docs/communications-unification-foundation.md](./docs/communications-unification-foundation.md) — COMMS-UNIFY-1 map of threads, broadcast, workbench, social
- [docs/message-workbench-analysis.md](./docs/message-workbench-analysis.md) — Comms workbench plan/draft/send structure
- [docs/identity-and-voter-link-foundation.md](./docs/identity-and-voter-link-foundation.md) — IDENTITY-1 `User` ↔ `VoterRecord`
- [docs/volunteer-data-gap-analysis.md](./docs/volunteer-data-gap-analysis.md) — VolunteerProfile capabilities and gaps
- [docs/database-table-inventory.md](./docs/database-table-inventory.md) — DBMAP-1: all 105 Prisma models, grouped by domain
- [docs/launch-reengagement-foundation.md](./docs/launch-reengagement-foundation.md) — LAUNCH-1: first-wave re-engagement on existing rails
- [docs/launch-segmentation-and-response-foundation.md](./docs/launch-segmentation-and-response-foundation.md) — LAUNCH-1: honest segments + response routing

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
