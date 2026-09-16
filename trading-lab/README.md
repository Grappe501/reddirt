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
- Replay clock with play, pause, step and reset
- SPY, QQQ, NVDA and AAPL
- Replay chart and price/volume context
- Existing simulated account and cost engine preserved
- Dataset is explicitly labeled synthetic; it is not represented as exchange history

### Phase 2 — LIVE-DATA ADAPTER

Phase 2 adds provider-neutral live-market plumbing while keeping every trade fictional.

- Alpaca market-data adapter behind Netlify Functions
- API credentials remain server-side
- Latest bid/ask quotes and minute bars
- Recent 1-minute bar history seeds the live chart and decision context
- Live/replay mode switch
- Five-second live snapshot polling
- IEX feed is the safe default; SIP can be selected when the Alpaca account is entitled to it
- No broker-order endpoint exists in Phase 2

Required Netlify environment variables:

```text
ALPACA_KEY_ID=<market-data key id>
ALPACA_SECRET_KEY=<market-data secret>
ALPACA_DATA_FEED=iex
```

`ALPACA_DATA_FEED` is optional and defaults to `iex`.

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
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
Node: 22
```

## Master phase buildout

- **Phase 0 — Offline simulator and accounting** — COMPLETE
- **Phase 1 — Historical replay kernel** — COMPLETE
- **Phase 2 — Real-time market-data adapter** — IN BUILD
- **Phase 3 — Deterministic strategy engine** — momentum, VWAP, trend, breakout, mean-reversion and regime rules with measurable expectancy
- **Phase 4 — AI analyst and explanation engine** — WHY, evidence, counter-evidence, invalidation and post-trade critique
- **Phase 5 — Paper execution adapter** — paper-broker orders only, hard separation from live-money credentials, fill reconciliation and broker-specific costs
- **Phase 6 — CME/futures market context** — ES, NQ and other selected futures used as market context; futures trading itself remains a separate permissioned simulator layer
- **Phase 7 — Multi-agent debate and risk engine** — bull, bear, regime, execution and risk agents with deterministic risk vetoes
- **Phase 8 — Desktop corner terminal and daily professor** — compact always-on-top view, timeline, end-of-day review, lessons, statistics and strategy learning report

## Phase 2 acceptance gate

Phase 2 is considered closed when:

1. the Netlify deployment builds from GitHub;
2. live mode works with server-side credentials and exposes no secret to the browser;
3. replay mode still works without credentials;
4. the live chart seeds recent completed bars and refreshes current quotes/bars;
5. simulated BUY/SELL uses the selected mode's current price while never calling a broker order API;
6. modeled trading costs continue to flow through account equity and the journal;
7. provider/API failures degrade visibly without breaking the simulator.
