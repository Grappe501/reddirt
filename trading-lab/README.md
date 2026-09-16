# RedDirt Trading Lab

Standalone paper-trading education application built from the RedDirt repository.

## Phase 0

Phase 0 is intentionally offline. It establishes the accounting and teaching contract before any external market or broker connection is introduced.

- Fictional starting account: **$500**
- No live market data
- No broker credentials
- No real orders
- One simulated position at a time
- Simulated market tape
- Editable execution-cost model
- Trade journal with a reason for every simulated order
- Agent pause/resume control
- Account equity, cash, open P/L, realized P/L and modeled costs

## Cost model

The simulator separates:

1. commission
2. spread cost
3. slippage
4. Section 31 transaction fee on covered sales
5. FINRA Trading Activity Fee on covered equity sales

These are modeled inputs, not a promise of what a specific broker will charge. Broker-specific schedules will be added as a later adapter layer.

## Netlify

Netlify should use `trading-lab` as the base directory, run `npm run build`, and publish `dist`. `trading-lab/netlify.toml` already contains the build settings for this standalone application.

## Planned phases

- Phase 0 — offline simulator and accounting
- Phase 1 — historical market-data ingestion
- Phase 2 — real-time market-data adapter
- Phase 3 — deterministic strategy engine
- Phase 4 — AI analyst and explanation engine
- Phase 5 — paper execution adapter
- Phase 6 — CME/futures market context
- Phase 7 — multi-agent debate and risk engine
- Phase 8 — desktop corner overlay and daily teaching report
