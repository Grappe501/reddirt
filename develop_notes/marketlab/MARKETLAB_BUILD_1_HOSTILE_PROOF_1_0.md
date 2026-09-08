# MarketLab Build 1 — Hostile Proof 1.0

## Purpose
Attack the Build 1 game loop before Build 2. This pass is a source-level hostile review, not a claim of live production proof.

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

## Remaining proof gates
These cannot be honestly marked complete from repository inspection alone:
1. `npm install`/lockfile resolution inside `apps/marketlab`.
2. `npm run prisma:generate`.
3. `npm run typecheck`.
4. `npm run build`.
5. Migration deploy against the approved hosted Postgres target.
6. Independent MarketLab Supabase sign-up/sign-in proof.
7. Licensed market-data credential proof.
8. Authenticated live simulated BUY fill.
9. Authenticated live simulated SELL fill.
10. Deliberate double-submit proof showing one execution only.
11. Deliberate simultaneous-order contention proof showing no negative cash/shares.
12. Mark-to-market change after quote movement.
13. Two-player leaderboard rank change proof.
14. Mobile/iPad hostile interaction review.
15. Failure-path review for provider outage/rate limit/market closed.

## Build 1 status
Source architecture/game loop: COMPLETE.
Hostile source hardening: PASS WITH LIVE PROOF PENDING.
Production/live proof: NOT YET CLAIMED.

Do not advance Build 1 to production-proven until the remaining proof gates are executed against the independent MarketLab environment.
