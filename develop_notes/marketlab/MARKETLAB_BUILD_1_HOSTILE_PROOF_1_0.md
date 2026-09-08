# MarketLab Build 1 — Hostile Proof 1.0

## Purpose
Attack the Build 1 game loop before Build 2. This began as a source-level hostile review and now also includes a dedicated machine proof gate for the standalone MarketLab app.

## Game loop under review
`$1,000 opening ledger -> server quote -> simulated order -> execution -> cash ledger + position -> mark-to-market -> return -> leaderboard rank`

## P0/P1 findings closed in this pass

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
2. Prisma client generation.
3. MarketLab migration deploy.
4. Strict TypeScript check.
5. Production Next.js build.

### Proof result — PASS
GitHub Actions run `34197350532` completed successfully after the build-root repair.

Passed gates:
- dependency installation: PASS;
- Prisma generate: PASS;
- both MarketLab migrations on clean Postgres: PASS;
- strict TypeScript (`tsc --noEmit`): PASS;
- production Next build: PASS.

The earlier proof run correctly failed production build and surfaced the root-isolation defect. That defect was repaired before this document was advanced.

## Remaining proof gates
These still require the independent hosted MarketLab environment and/or browser-level interaction:
1. Migration deploy against the approved hosted Postgres target.
2. Independent MarketLab Supabase sign-up/sign-in proof.
3. Licensed market-data credential proof.
4. Authenticated live simulated BUY fill.
5. Authenticated live simulated SELL fill.
6. Deliberate double-submit proof showing one execution only.
7. Deliberate simultaneous-order contention proof showing no negative cash/shares.
8. Mark-to-market change after quote movement.
9. Two-player leaderboard rank change proof.
10. Mobile/iPad hostile interaction review.
11. Failure-path review for provider outage/rate limit/market closed.

## Build 1 status
Source architecture/game loop: COMPLETE.
Hostile source hardening: PASS.
Local/CI dependency + migration + typecheck + production-build proof: PASS.
Hosted/live product proof: PENDING.

Do not label Build 1 production-proven until the remaining hosted/live proof gates are executed against the independent MarketLab environment.
