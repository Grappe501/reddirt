# MarketLab Build 1 — Foundation 1.0

**Branch:** `feature/marketlab-foundation-1-0`  
**Status:** Architecture locked; standalone scaffold begins in this pass.

## Audit Findings

The current RedDirt repository root is a single large Next.js application with one root `netlify.toml`, a root `package.json`, a root Prisma schema, and existing campaign/public/admin/dashboard surfaces. The root Netlify configuration explicitly documents that the whole RedDirt website deploy is one Next.js application and warns against accidental monorepo/base-directory confusion. That means MarketLab must not be implemented as a route inside the root runtime.

RedDirt already provides useful infrastructure patterns: PostgreSQL via Prisma, `DATABASE_URL` + `DIRECT_URL`, Netlify build hardening, Supabase SSR auth helpers, and mature validation/deployment practices. MarketLab may reuse those architectural lessons and approved infrastructure, but not the campaign application's runtime boundary.

## Locked Physical Boundary

MarketLab is a standalone sub-application at:

`apps/marketlab/`

It gets its own:

- `package.json`
- Next.js runtime
- `netlify.toml`
- TypeScript configuration
- application routes/components/styles
- Prisma schema/client ownership
- environment variables
- Netlify site/base directory
- authentication surface
- market-data provider configuration
- OpenAI configuration
- test/validation scripts

The existing root RedDirt application remains untouched by MarketLab runtime imports.

## Database Boundary

MarketLab will use the same approved PostgreSQL provider initially, but its tables will live in a dedicated PostgreSQL schema named `marketlab` and be managed by a MarketLab-local Prisma schema at:

`apps/marketlab/prisma/schema.prisma`

This avoids contaminating the very large root campaign Prisma model while still allowing a shared database host where operationally useful.

MarketLab migrations must be run from the MarketLab app directory and must never modify campaign tables. Cross-schema relations to the campaign `public` schema are prohibited in the initial architecture.

## Authentication Boundary

MarketLab will own its own auth integration surface. It may use the same Supabase project/provider if explicitly configured later, but the application must not depend on RedDirt campaign session middleware or campaign RBAC. Initial roles will be designed around `player`, `trainer`, `organization_admin`, and `platform_admin` rather than campaign roles.

## Deployment Boundary

Netlify should be configured with base directory:

`apps/marketlab`

MarketLab's `netlify.toml` and build commands are local to that directory. It gets its own Netlify site and independent environment variables. A MarketLab deployment must not execute the root RedDirt campaign build script or campaign Prisma migrations.

## First Vertical Slice

Build 1 moves toward the following playable path:

`sign in -> join/create competition -> receive $1,000 -> search security -> quote -> simulated buy -> immutable ledger -> position -> portfolio -> simulated sell -> realized P/L -> leaderboard`

This pass does not claim that the full vertical slice is complete. It establishes the safe runtime, database, deployment, and UI shell from which that slice can be built without destabilizing RedDirt.

## Guardrails

1. No real brokerage execution.
2. No MarketLab imports into the root campaign app.
3. No root Prisma schema edits for MarketLab domain models unless a later explicit architecture change is approved.
4. No campaign RBAC reuse as MarketLab's product authorization model.
5. No market-data or OpenAI private keys in browser bundles.
6. No live market-data redistribution until provider licensing/terms are reviewed.
7. Every future MarketLab pass is committed to GitHub before being reported complete.

## Next Work Inside Build 1

1. Standalone Next.js shell.
2. MarketLab-local Prisma schema and first migration design.
3. MarketLab auth wiring.
4. Competition + portfolio + cash-ledger domain.
5. Market-data provider adapter.
6. Quote/search integration.
7. Simulated order engine.
8. Portfolio/leaderboard UI.
9. Build/typecheck/domain validators.
10. Independent Netlify deployment.
