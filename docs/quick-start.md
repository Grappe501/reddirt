# Quick start (launcher)

## Prerequisites

- Node 20+ (match Netlify `NODE_VERSION`)
- Docker Desktop (or compatible engine) for local Postgres
- npm (or pnpm/yarn if you adapt commands)

## One-step dev

```bash
npm install
npm run dev:full
```

## What `dev:full` does

1. Warns if `.env.local` / `.env` is missing.
2. `docker compose up -d` (continues with a warning if Docker isn’t running).
3. `npx prisma generate`
4. `npx prisma migrate deploy` (warns on failure — fresh clones may need `npx prisma migrate dev` once).
5. `npx next dev`

## Platform-specific launchers

- **Windows:** `.\scripts\dev.ps1`
- **Unix:** `./scripts/dev.sh` (executable bit may be required: `chmod +x scripts/dev.sh`)

## Future jobs

The launcher philosophy is: **prepare infrastructure, then run the app**. Batch jobs (ingest, cron, media) stay separate npm scripts so CI and future orchestration can call them without rewriting `dev:full`.
