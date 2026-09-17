# RedDirt Trading Lab

Standalone paper-trading education application built inside the RedDirt repository and deployed independently through Netlify.

The core rule is simple: market data may be real, but the account remains fictional until a future paper-broker phase is deliberately enabled. There is no live-money order path in the current application.

## Current status

### Phase 0 — COMPLETE
Offline simulator and accounting foundation with fictional accounts, editable execution costs and trade journals.

### Phase 1 — COMPLETE
Historical replay kernel with deterministic one-minute replay data for SPY, QQQ, NVDA and AAPL.

### Phase 2A — COMPLETE
Alpaca market-data adapter behind Netlify Functions, live quotes/bars/history and live/replay switching.

### Phase 2B — CODE COMPLETE / LIVE DEPLOYMENT VALIDATION PENDING
Credential-safe health diagnostics, provider allowlists, tests and Netlify/GitHub validation rails.

### Phase 3A — PARALLEL DECISION LAB — COMPLETE
Independent human/gated and shadow-autopilot fictional portfolios using the same observations and execution-cost assumptions.

### Phase 3B — MARKET MEMORY + BREADTH — CODE COMPLETE / PRODUCTION PROOF PENDING

- Durable browser Market Memory plus Netlify Database persistence
- Provider/exchange and ingestion timestamps
- Automatic browser-to-database synchronization and database readback
- Decision, fictional trade, experiment-run, source-health and regime collections
- 25-symbol live breadth universe spanning indexes, sectors and liquid large caps
- Above-VWAP/SMA20 participation, momentum participation, advance/decline, evidence score, leaders and laggards
- Deterministic regime labels
- Database telemetry in the dashboard
- No broker-order endpoint

Architecture: `docs/PHASE_3B_MARKET_MEMORY.md`.

### Phase 3C — STRATEGY LIBRARY + WALK-FORWARD EXPERIMENT LAB — ACTIVE

The first Phase 3C slice is built:

- Deterministic strategy registry: Evidence Trend, Momentum Confirmed and VWAP Participation
- Shared strategy evaluation contract
- Chronological train/test walk-forward split primitive
- Closed-trade expectancy/profit-factor summary primitive
- Historical-state similarity engine for asking “when did the market look like this before?”
- Netlify Database analogue query endpoint
- Automated Phase 3C tests
- Explicit rule that analogue similarity is evidence, not a prediction

Next Phase 3C work labels observations with leakage-safe forward returns, builds cost-aware backtests, rolling walk-forward windows, regime-stratified results and a full Strategy Lab dashboard.

Architecture: `docs/PHASE_3C_STRATEGY_LAB.md`.

Detailed market-data and analytics roadmap: `docs/MARKET_ANALYTICS.md`.

## Market-data configuration

Required Netlify runtime environment variables:

```text
ALPACA_KEY_ID=<market-data key id>
ALPACA_SECRET_KEY=<market-data secret>
ALPACA_DATA_FEED=iex
```

`ALPACA_DATA_FEED` is optional and defaults to `iex`. Do not commit real credentials.

## Netlify

Use `trading-lab` as the Netlify base directory.

```text
Build command: npm run check
Publish directory: dist
Functions directory: netlify/functions
Node: 22
```

Trading Lab uses Netlify Database for its isolated durable research store. It does not fall back to the RedDirt campaign database.

## Market analytics principle

More data is not automatically an edge. Each new feature/data source must show incremental value through historical replay, chronological walk-forward testing, cost-aware simulation and shadow-live testing. Features that do not improve out-of-sample expectancy, drawdown or timing should be rejected rather than accumulated.

Priority order:

1. equity/ETF quotes, trades, bars and broader breadth
2. CME ES/NQ futures context
3. timestamped news/events
4. depth-of-book and auction imbalance
5. options/volatility intelligence

## Master phase buildout

- **Phase 0 — Offline simulator and accounting** — COMPLETE
- **Phase 1 — Historical replay kernel** — COMPLETE
- **Phase 2A — Real-time market-data adapter** — COMPLETE
- **Phase 2B — Integration, health and deployment validation** — CODE COMPLETE; LIVE VALIDATION PENDING
- **Phase 3A — Parallel human-gated vs shadow-autopilot quant core** — COMPLETE
- **Phase 3B — Persistent analytics / feature store + expanded market breadth** — CODE COMPLETE; PRODUCTION DB PROOF PENDING
- **Phase 3C — Strategy library and walk-forward experiment runner** — ACTIVE
- **Phase 4 — AI analyst and explanation engine** — WHY, evidence, counter-evidence, invalidation and post-trade critique
- **Phase 5 — Paper execution adapter** — paper-broker orders only, hard separation from live-money credentials
- **Phase 6 — CME/futures market context** — ES, NQ and selected futures context
- **Phase 7 — Multi-agent debate and deterministic risk vetoes**
- **Phase 8 — Desktop corner terminal and daily professor**

## Always-on architecture

The browser/replay autopilot evaluates while the application is running. True continuous shadow monitoring ultimately requires a long-running market-ingestion/decision worker. Netlify remains the dashboard, database and control plane; it should not be treated as the permanent high-frequency WebSocket collector.
