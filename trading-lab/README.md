# RedDirt Trading Lab

Standalone paper-trading education application built inside the RedDirt repository and deployed independently through Netlify.

The core rule is simple: market data may be real, but the account remains fictional until a future paper-broker phase is deliberately enabled. There is no live-money order path in the current application.

## Current status

### Phase 0 — COMPLETE

Offline simulator and accounting foundation.

- Fictional starting account: **$500**
- No broker credentials or real orders
- One simulated position at a time
- Editable execution-cost model
- Trade journal with a reason for every simulated order
- Account equity, cash, open P/L, realized P/L and modeled costs

### Phase 1 — COMPLETE

Historical replay kernel.

- Deterministic synthetic OHLCV dataset
- 390 true one-minute replay bars from 09:30 through 15:59
- Replay clock with play, pause, step and reset
- SPY, QQQ, NVDA and AAPL
- Replay chart and price/volume context
- Existing simulated account and cost engine preserved
- Dataset is explicitly labeled synthetic; it is not represented as exchange history

### Phase 2A — COMPLETE

Initial live-data plumbing.

- Alpaca market-data adapter behind Netlify Functions
- Latest bid/ask quotes and minute bars
- Recent 1-minute bar history seeds the live chart and decision context
- Live/replay mode switch
- Five-second live snapshot polling
- IEX default with optional entitled SIP access
- No broker-order endpoint

### Phase 2B — CODE COMPLETE / DEPLOYMENT VALIDATION PENDING

Phase 2B hardens the live-data path and adds deployment gates.

- Shared server-side provider module
- Credentials remain in Netlify runtime environment variables
- Public-safe health endpoint: `/.netlify/functions/market-health`
- Optional upstream provider probe: `/.netlify/functions/market-health?probe=1`
- Provider latency, reachability, last-good snapshot and failure count shown in the dashboard
- Sanitized provider errors; raw upstream response text is not returned to the browser
- Seven-day lookback when seeding recent bars so weekends and early mornings still find prior sessions
- Symbol/feed allowlists
- Automated Node tests
- GitHub Actions CI
- Netlify runs `npm run check` before publishing
- `.env` files ignored; `.env.example` documents required variables
- No broker-order endpoint exists

## Phase 2B market-data configuration

Required Netlify runtime environment variables:

```text
ALPACA_KEY_ID=<market-data key id>
ALPACA_SECRET_KEY=<market-data secret>
ALPACA_DATA_FEED=iex
```

`ALPACA_DATA_FEED` is optional and defaults to `iex`.

Do **not** commit real credentials to GitHub and do not place them in `netlify.toml`. Netlify Functions read these values from the site's runtime environment. After changing a Netlify environment variable, trigger a new deploy so the new value is applied.

A safe local template exists at `.env.example`.

## Health validation

Phase 2B exposes a credential-safe health route.

```text
/.netlify/functions/market-health
```

This reports whether the service is configured without returning either credential.

To verify the upstream market-data provider as well:

```text
/.netlify/functions/market-health?probe=1
```

A successful probe reports provider reachability and request latency. Authentication, entitlement and rate-limit failures are converted to sanitized messages.

## Execution-cost model

The simulator separates:

1. commission
2. spread cost
3. slippage
4. Section 31 pass-through modeling on covered sales
5. FINRA Trading Activity Fee modeling on covered equity sales

The default Phase 2 schedule uses the FY2026 Section 31 rate of **$20.60 per $1 million** of covered sales and the 2026 FINRA equity TAF of **$0.000195 per share**, capped at **$9.79 per trade**. These remain modeled inputs because an actual broker can apply its own commission, routing, pass-through and execution economics.

## Netlify

Use `trading-lab` as the Netlify base directory.

```text
Build command: npm run check
Publish directory: dist
Functions directory: netlify/functions
Node: 22
```

`npm run check` runs the automated tests and then the Vite production build. A failure blocks the deployment.

## GitHub CI

`.github/workflows/trading-lab-ci.yml` runs whenever `trading-lab/**` changes. It installs dependencies under Node 22 and runs:

```text
npm run check
```

## Master phase buildout

- **Phase 0 — Offline simulator and accounting** — COMPLETE
- **Phase 1 — Historical replay kernel** — COMPLETE
- **Phase 2A — Real-time market-data adapter** — COMPLETE
- **Phase 2B — Integration, health and deployment validation** — CODE COMPLETE; LIVE CREDENTIAL/NETLIFY VALIDATION PENDING
- **Phase 3 — Deterministic strategy engine** — momentum, VWAP, trend, breakout, mean-reversion and regime rules with measurable expectancy
- **Phase 4 — AI analyst and explanation engine** — WHY, evidence, counter-evidence, invalidation and post-trade critique
- **Phase 5 — Paper execution adapter** — paper-broker orders only, hard separation from live-money credentials, fill reconciliation and broker-specific costs
- **Phase 6 — CME/futures market context** — ES, NQ and other selected futures used as market context; futures trading itself remains a separate permissioned simulator layer
- **Phase 7 — Multi-agent debate and risk engine** — bull, bear, regime, execution and risk agents with deterministic risk vetoes
- **Phase 8 — Desktop corner terminal and daily professor** — compact always-on-top view, timeline, end-of-day review, lessons, statistics and strategy learning report

## Phase 2B acceptance gate

Phase 2B closes when all of the following are true:

1. GitHub CI passes `npm run check`;
2. the Netlify deployment builds from GitHub using `trading-lab` as its base directory;
3. Netlify runtime variables provide the Alpaca key and secret without exposing either value to the browser;
4. `market-health?probe=1` reports the provider reachable;
5. live mode returns current SPY, QQQ, NVDA and AAPL quotes/bars for the configured feed;
6. replay mode still works without credentials;
7. live history seeds recent completed bars and refreshes current quotes/bars;
8. simulated BUY/SELL uses the selected mode's current observed price while never calling a broker order API;
9. modeled trading costs continue to flow through account equity and the journal;
10. provider/API failures degrade visibly without breaking replay or the simulator.
