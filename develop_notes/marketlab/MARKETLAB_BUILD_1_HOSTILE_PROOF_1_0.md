# MarketLab Build 1 — Hostile Proof 1.0

## Purpose
Attack the Build 1 game loop before Build 2. This began as a source-level hostile review and now also includes a dedicated machine proof gate plus hosted-deployment readiness checks for the standalone MarketLab app.

## Game loop under review
`$1,000 opening ledger -> server quote -> simulated order -> execution -> cash ledger + position -> mark-to-market -> return -> leaderboard rank`

## P0/P1 findings closed

### 1. Concurrent overspend / oversell window — CLOSED
The prior order transaction was atomic but used the database default isolation level. Two near-simultaneous orders could both read the same pre-settlement cash or share balance before either committed.

Repair:
- order settlement now uses `Prisma.TransactionIsolationLevel.Serializable`;
- Prisma `P2034` serialization/write-conflict failures retry up to three times;
- cash and position checks remain inside the serializable transaction.

Invariant: committed simulated orders must never drive cash below zero or shares below zero merely because two requests raced.

### 2. Double-submit idempotency gap — CLOSED
The prior server action generated `randomUUID()` after each form submission. Browser double-submit therefore produced two different idempotency keys and could create two fills.

Repair:
- the rendered order ticket now receives one hidden UUID;
- the server action forwards that same token unchanged;
- the database unique constraint remains `(portfolioId, idempotencyKey)`;
- the engine checks the token before and inside settlement.

Invariant: repeat submission of the same rendered ticket resolves to one simulated order.

### 3. Invalid quote timestamp — CLOSED
A malformed provider timestamp could have reached the execution record.

Repair: execution rejects a quote whose `asOf` cannot be parsed into a valid `Date`.

### 4. Invalid competition friction settings — CLOSED
Negative fees or pathological slippage could produce nonsensical settlement.

Repair:
- fee must be non-negative;
- slippage must be >= 0 and < 100%;
- calculated execution price must remain positive.

### 5. Standalone build-root leakage into RedDirt — CLOSED
The first dedicated MarketLab production build exposed a genuine isolation defect. Next/Turbopack inferred the RedDirt repository root because both the root app and `apps/marketlab` had lockfiles. That caused the standalone build to inherit root PostCSS/middleware concerns, including a missing Tailwind dependency and campaign middleware imports that do not belong in MarketLab.

Repair:
- `apps/marketlab/next.config.ts` now sets the Turbopack root to the MarketLab working directory;
- the standalone build no longer traverses RedDirt root middleware/PostCSS as part of MarketLab compilation.

Invariant: MarketLab must compile as an independent Next application even though it lives inside the RedDirt repository.

### 6. Hosted deployment could start with incomplete environment — CLOSED AT CONFIGURATION LAYER
A Netlify build previously had no explicit preflight gate proving that MarketLab database, auth, and market-data configuration were all present before migrations/build began.

Repair:
- `apps/marketlab/scripts/hosted-readiness.mjs` validates the required MarketLab environment contract without printing secret values;
- `npm run hosted:readiness` exposes the gate locally and in CI;
- `apps/marketlab/netlify.toml` now runs the readiness gate before Prisma generation, migration deploy, and production build;
- `/api/health` verifies database reachability and reports auth/market-data configuration state without exposing credentials.

Invariant: a hosted MarketLab deployment should fail closed if its core external dependencies are structurally unconfigured.

## Existing invariants re-verified by source inspection
- Browser price is never accepted for settlement.
- Market status and quote are fetched server-side before settlement.
- Market orders require `OPEN` market status.
- Competition must be `OPEN` or `ACTIVE`.
- Buy cash sufficiency check includes simulated fee.
- Sell quantity cannot exceed current position quantity.
- Order, execution, cash settlement, fee entry, and position mutation are in one transaction.
- Cash is derived from immutable ledger entries.
- Portfolio value is cash + marked current positions.
- Leaderboard uses the same portfolio valuation service, not a separate mutable score.
- No real brokerage execution integration exists.

## Dedicated machine proof gate
Workflow: `.github/workflows/marketlab-build1-proof.yml`

The workflow runs MarketLab independently on Node 22 with a clean PostgreSQL 15 service and executes:
1. MarketLab dependency install.
2. Hosted-readiness environment contract.
3. Prisma client generation.
4. MarketLab migration deploy.
5. Strict TypeScript check.
6. Production Next.js build.

### Baseline proof result — PASS
GitHub Actions run `34197350532` completed successfully after the build-root repair.

Passed gates:
- dependency installation: PASS;
- Prisma generate: PASS;
- both MarketLab migrations on clean Postgres: PASS;
- strict TypeScript (`tsc --noEmit`): PASS;
- production Next build: PASS.

The earlier proof run correctly failed production build and surfaced the root-isolation defect. That defect was repaired before this document was advanced.

## Hosted deployment readiness layer
MarketLab now exposes two independent checks:
- build-time readiness: `npm run hosted:readiness`;
- runtime readiness: `GET /api/health`.

The runtime health route intentionally reports only coarse state:
- database up/down;
- auth configured true/false;
- market-data configured true/false;
- selected provider name;
- request duration.

It does not return database URLs, Supabase keys, market-data keys, secrets, tokens, or provider response bodies.

## Remaining proof gates
These still require the independent hosted MarketLab environment and/or browser-level interaction:
1. Create/connect the independent MarketLab Netlify site with base directory `apps/marketlab`.
2. Supply approved hosted MarketLab database environment values.
3. Migration deploy against the approved hosted Postgres target.
4. Independent MarketLab Supabase sign-up/sign-in proof.
5. Licensed market-data credential proof.
6. `GET /api/health` returns `200 ready` in the hosted environment.
7. Authenticated live simulated BUY fill.
8. Authenticated live simulated SELL fill.
9. Deliberate double-submit proof showing one execution only.
10. Deliberate simultaneous-order contention proof showing no negative cash/shares.
11. Mark-to-market change after quote movement.
12. Two-player leaderboard rank change proof.
13. Mobile/iPad hostile interaction review.
14. Failure-path review for provider outage/rate limit/market closed.

## Current external blocker
The Netlify plugin was identified and suggested through ChatGPT, but it is not yet installed/connected in this conversation. Therefore no claim is made that an independent Netlify MarketLab site has been created or deployed.

## Build 1 status
Source architecture/game loop: COMPLETE.
Hostile source hardening: PASS.
Local/CI dependency + migration + typecheck + production-build proof: PASS.
Hosted deployment readiness layer: COMPLETE IN CODE.
Hosted/live product proof: PENDING EXTERNAL CONNECTION + CREDENTIALS.

Do not label Build 1 production-proven until the remaining hosted/live proof gates are executed against the independent MarketLab environment.
