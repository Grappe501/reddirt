# MarketLab Portfolio Valuation + Leaderboard 1.0

## Purpose

Close the first complete game loop:

`$1,000 starting cash -> simulated trade -> market move -> mark-to-market portfolio value -> total return -> league rank`

## Portfolio valuation

`apps/marketlab/src/lib/portfolio/valuation.ts` is the canonical Build 1 valuation service.

It derives:

- ledger cash
- current position market value
- portfolio total value
- unrealized P/L
- realized P/L
- total return dollars
- total return percent
- per-position market value and P/L

Current market prices come from the configured MarketDataProvider. Client values never participate in valuation.

## Leaderboard

`apps/marketlab/src/lib/competition/leaderboard.ts` values each competition portfolio through the same portfolio valuation service and ranks competitors by current total portfolio value.

The leaderboard therefore does not maintain a second mutable source of truth for wealth.

## Player surfaces

- `/dashboard` now shows live marked portfolio value, cash, unrealized P/L, open-position marks, and league rank.
- `/leaderboard` shows current competition standings and highlights the signed-in player.

## Build 1 guardrails

- No real-money execution.
- Cash remains ledger-derived.
- Position quantities and cost basis remain engine-derived.
- Portfolio wealth is derived from cash plus server-fetched position marks.
- Ranking is derived from portfolio valuation, not manually stored score fields.
- Quote entitlement and redistribution rules must still be validated before public launch.

## Remaining proof gate

A production-equivalent environment must still prove:

1. MarketLab database migrations apply successfully.
2. Standalone Supabase authentication works.
3. Market-data credentials return permitted current quotes.
4. A signed-in player joins with exactly $1,000.
5. A simulated buy fills.
6. Cash and position records settle atomically.
7. Portfolio valuation changes when the market mark differs from cost basis.
8. Leaderboard rank reflects the new portfolio value.
9. Typecheck and production build pass.
