# RedDirt Trading Lab

Standalone paper-trading education application built inside the RedDirt repository and deployed independently through Netlify.

The core rule is simple: market data may be real, but the account remains fictional until a future paper-broker phase is deliberately enabled. There is no live-money order path in the current application.

## Current status

### Phase 0 — COMPLETE

Offline simulator and accounting foundation.

- Fictional starting account: **$500**
- No broker credentials or real orders
- Editable execution-cost model
- Trade journal with a reason for every simulated order

### Phase 1 — COMPLETE

Historical replay kernel.

- Deterministic synthetic OHLCV dataset
- 390 true one-minute replay bars from 09:30 through 15:59
- Replay clock with play, pause, step and reset
- SPY, QQQ, NVDA and AAPL
- Dataset is explicitly labeled synthetic

### Phase 2A — COMPLETE

Initial live-data plumbing.

- Alpaca market-data adapter behind Netlify Functions
- Latest bid/ask quotes and minute bars
- Recent 1-minute history
- Live/replay switch
- Five-second polling
- No broker-order endpoint

### Phase 2B — CODE COMPLETE / LIVE DEPLOYMENT VALIDATION PENDING

- Shared server-side provider module
- Netlify-only market-data credentials
- Credential-safe health/probe endpoint
- Provider latency/reachability diagnostics
- Sanitized upstream errors
- Seven-day historical seed lookback
- Symbol/feed allowlists
- Automated Node tests and GitHub Actions CI
- Netlify runs `npm run check` before publishing

### Phase 3A — PARALLEL DECISION LAB — COMPLETE

Phase 3A introduces the experimental framework for human-vs-autopilot comparison.

- Two independent fictional **$500** portfolios
- **Human / gated** track: BUY / SELL / WAIT recommendation with evidence, counter-evidence and invalidation
- **Shadow autopilot** track: scans the full watchlist and executes automatically only in its own fictional account
- Same market observations and same cost assumptions for both tracks
- Fractional-share support in the fictional simulator for fair comparison across high-price ETFs/stocks
- Market feature engine: VWAP, moving averages, relative volume, ATR, realized volatility, momentum, relative strength and quoted spread
- Evidence score with explicit entry/exit thresholds
- Autopilot stop and target handling
- Separate trade and decision journals
- A/B metrics: equity, return, realized P/L, costs, closed trades and win rate
- Phase 3 unit tests and production build pass GitHub CI

The current autopilot is a deterministic quantitative core. A future AI synthesis layer will add richer context, explanations and critique without bypassing the risk/execution engine.

Detailed market-data and analytics roadmap: `docs/MARKET_ANALYTICS.md`.

## Phase 2B market-data configuration

Required Netlify runtime environment variables:

```text
ALPACA_KEY_ID=<market-data key id>
ALPACA_SECRET_KEY=<market-data secret>
ALPACA_DATA_FEED=iex
```

`ALPACA_DATA_FEED` is optional and defaults to `iex`.

Do **not** commit real credentials to GitHub and do not place them in `netlify.toml`.

## Execution-cost model

The simulator separates:

1. commission
2. spread cost
3. slippage
4. Section 31 pass-through modeling on covered sales
5. FINRA Trading Activity Fee modeling on covered equity sales

These remain modeled inputs because an actual broker can apply its own commission, routing, pass-through and execution economics.

## Netlify

Use `trading-lab` as the Netlify base directory.

```text
Build command: npm run check
Publish directory: dist
Functions directory: netlify/functions
Node: 22
```

## Market analytics principle

More data is not automatically an edge. Each new feature/data source must show incremental value through historical replay, walk-forward testing, cost-aware simulation and shadow-live testing. Features that do not improve out-of-sample expectancy, drawdown or timing are removed.

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
- **Phase 2B — Integration, health and deployment validation** — CODE COMPLETE; LIVE CREDENTIAL/NETLIFY VALIDATION PENDING
- **Phase 3A — Parallel human-gated vs shadow-autopilot quant core** — COMPLETE
- **Phase 3B — Persistent analytics / feature store + expanded market breadth** — NEXT
- **Phase 3C — Strategy library and walk-forward experiment runner** — PLANNED
- **Phase 4 — AI analyst and explanation engine** — WHY, evidence, counter-evidence, invalidation and post-trade critique
- **Phase 5 — Paper execution adapter** — paper-broker orders only, hard separation from live-money credentials
- **Phase 6 — CME/futures market context** — ES, NQ and selected futures context
- **Phase 7 — Multi-agent debate and deterministic risk vetoes**
- **Phase 8 — Desktop corner terminal and daily professor**

## Always-on architecture

The current browser/replay autopilot evaluates while the application is running. True 24/7 shadow monitoring requires a long-running market-ingestion/decision worker and persistent feature store. Netlify remains the dashboard and control plane; it should not be treated as the permanent high-frequency WebSocket collector.
