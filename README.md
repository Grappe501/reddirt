# Red Dirt Democrats — site

## Start Here for Red Dirt Build Threads

**You are in the SOS / statewide campaign repo (`RedDirt/`), not `ajax/` or `countyWorkbench/`.**

1. **Protocol:** [`docs/RED_DIRT_BUILD_PROTOCOL.md`](docs/RED_DIRT_BUILD_PROTOCOL.md) — ChatGPT pilots, Steve copies messages, Cursor builds; no scope drift; every pass updates the map/queue and ends with a completion report.
2. **Operating system map:** [`docs/RED_DIRT_OPERATING_SYSTEM_MAP.md`](docs/RED_DIRT_OPERATING_SYSTEM_MAP.md) — routes, admin, APIs, data, scripts, sister-app boundaries.
3. **Beta readiness:** [`docs/BETA_LAUNCH_READINESS.md`](docs/BETA_LAUNCH_READINESS.md) — score, must-fix, risks.
4. **Next work:** [`docs/RED_DIRT_PACKET_QUEUE.md`](docs/RED_DIRT_PACKET_QUEUE.md) — **RD-1, RD-2, …** packets (execute top pending P0 first).
5. **History & ledger:** [`docs/PROJECT_MASTER_MAP.md`](docs/PROJECT_MASTER_MAP.md) + [`docs/THREAD_HANDOFF_MASTER_MAP.md`](docs/THREAD_HANDOFF_MASTER_MAP.md).
6. **Public site + engine funnel:** [`docs/REDDIRT_SITE_AND_ENGINE_FUNNEL_PLAN.md`](docs/REDDIRT_SITE_AND_ENGINE_FUNNEL_PLAN.md) — Pass 02 wires entry pathways on `/`, `navigation.ts`, header/footer (**no sibling-repo imports**). Control ledger: [`docs/AI_MIGRATION_CONTROL_CENTER.md`](docs/AI_MIGRATION_CONTROL_CENTER.md).

**Quality gate:** `npm run check` before significant pushes (lint + `tsc` + build). Minimum: `npm run build`.

---

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
