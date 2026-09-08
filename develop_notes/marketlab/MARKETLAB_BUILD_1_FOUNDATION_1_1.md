# MarketLab Build 1 Foundation 1.1

## Scope

This pass establishes the first financial-truth domain for MarketLab.

## Added

- `Player`
- `Competition`
- `CompetitionMember`
- `Portfolio`
- `CashLedgerEntry`
- Competition and ledger enums
- Atomic `joinCompetition()` service
- Ledger-derived `getCashBalance()` service

## Canonical Accounting Rule

MarketLab does not store a mutable `portfolio.cash` field as the source of truth. Cash is derived from immutable ledger entries. A portfolio's opening balance is written exactly once when the player first joins a competition.

The default competition starting balance is `$1,000.00`, stored as `Competition.startingCash`, not hard-coded inside the join service. This allows future competition templates to choose different starting capital without changing engine code.

## Idempotency

The unique key `(competitionId, playerId)` on both membership and portfolio prevents duplicate enrollment and duplicate portfolios. `joinCompetition()` is transactional and returns an existing portfolio without creating another opening balance when called again.

## Enrollment Rules

Only competitions in `OPEN` or `ACTIVE` state accept player enrollment through the current service. `DRAFT`, `CLOSED`, and `ARCHIVED` states are rejected.

## Auth Boundary

`Player.authSubject` is the external authentication identity anchor. This pass intentionally does not couple MarketLab to RedDirt campaign users or roles. A later auth pass will supply the authenticated subject from the standalone MarketLab auth session.

## Guardrails

- No real brokerage execution.
- No root RedDirt Prisma models changed.
- No SOS/campaign routes changed.
- All MarketLab data remains inside PostgreSQL schema `marketlab`.
- Cash ledger entries are append-only by application doctrine; corrections should use `ADJUSTMENT` or `REVERSAL`, not mutate historical economic events.

## Next Slice

Build the first competition provisioning path and authenticated player session boundary, then create the first executable join flow that proves a player receives exactly one `$1,000.00` opening balance and can see the derived cash balance in the MarketLab UI.
