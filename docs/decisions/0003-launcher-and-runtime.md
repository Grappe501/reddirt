# ADR 0003 — Launcher and runtime

## Status

Accepted (Script 5.5)

## Context

Developers need a **repeatable local stack** (Postgres + Prisma + Next) without memorizing five commands.

## Decision

- Provide **`npm run dev:full`** via `scripts/launch-dev.cjs` (cross-platform).
- Provide **`scripts/dev.ps1`** and **`scripts/dev.sh`** for native shell users.
- Use **`npm run check`** = lint + `tsc --noEmit` + `next build` as the pre-push quality gate.
- Centralize **env hints** in `src/lib/env.ts` (database availability helpers — no secrets to client).

## Consequences

- `migrate deploy` is non-interactive; fresh dev DB may need one-time `prisma migrate dev`.
- Docker is optional for contributors using a remote `DATABASE_URL` — launchers warn but continue when Compose fails.
