# RedDirt Market Analytics Plan

The goal is not to collect the most data. The goal is to create measurable, timestamped features that improve simulated decisions after execution costs.

## Experimental design

Every market state can feed two parallel tracks:

1. **Human / gated** — the application presents BUY / SELL / WAIT, evidence, counter-evidence, risk and invalidation. The human decides whether and when to act.
2. **Shadow autopilot** — the system evaluates the same observed state and acts automatically in its own fictional $500 portfolio.

Both tracks use the same observed prices and the same cost assumptions. Performance is compared on net return, expectancy, drawdown, win rate, profit factor, timing quality, turnover and costs.

## Analytics layers

### Layer 1 — Baseline price/volume and NBBO

Current source: Alpaca market data adapter.

Features:

- bid / ask / midpoint
- spread in basis points
- OHLCV bars
- 5 / 20 bar momentum
- 8 / 20 bar trend
- VWAP
- relative volume
- ATR
- realized volatility
- relative strength versus SPY

This layer must establish a measurable baseline before premium data is added.

### Layer 2 — Broader market and sector context

Add a watch universe rather than only four symbols. Compute:

- percentage of symbols above VWAP
- percentage above short and medium moving averages
- advance / decline ratio
- up-volume / down-volume
- sector ETF relative strength
- market breadth thrusts
- gap and opening-range statistics
- cross-sectional momentum ranks

The strategy should know whether a setup is moving with or against the broader tape.

### Layer 3 — CME futures context

Add real-time CME futures context through CME's cloud market-data APIs or a licensed vendor:

- ES — S&P 500
- NQ — Nasdaq-100
- RTY — Russell 2000
- ZN — 10-year Treasury
- CL — crude oil
- GC — gold

Derived features:

- equity index futures direction and momentum
- NQ vs ES relative strength
- overnight high / low and range
- cash-open gap relative to futures
- rates / risk-asset divergence
- volume and volatility regime

CME offers a cloud WebSocket API for real-time futures and options data and CME DataMine for historical research.

### Layer 4 — Full depth and auction imbalance

Potential source: Nasdaq TotalView or a vendor carrying equivalent licensed depth.

Useful features:

- depth imbalance near best bid / ask
- liquidity walls and replenishment
- order-book slope
- spread / depth deterioration
- opening and closing auction imbalance (NOII)

Depth data should be added only after we have tick-accurate storage and replay. It is easy to overfit and expensive to store.

### Layer 5 — Options and volatility intelligence

Potential sources: OPRA through a licensed vendor, Cboe One Options, Cboe analytics, or Databento.

Useful features:

- implied volatility level and change
- skew
- term structure
- put / call activity
- unusual volume relative to open interest
- near-dated gamma concentration
- underlying moves confirmed or contradicted by options pricing

Raw options flow alone is not treated as a directional truth signal. It is context that must prove incremental value.

### Layer 6 — News and scheduled events

Add timestamped event context:

- company news
- earnings and guidance
- analyst actions
- SEC filings
- economic calendar
- Fed / rates events
- halts and resumptions

The system should record whether a trade was entered near a known event and whether that event increased expected slippage or volatility.

## Feature-store schema

Persist normalized observations rather than vendor-specific payloads:

- `market_bars`
- `market_quotes`
- `market_features`
- `market_regimes`
- `decision_events`
- `paper_trades`
- `experiment_runs`
- `data_source_health`

Every row should include an exchange/provider timestamp plus ingestion timestamp so latency and look-ahead can be audited.

## Edge validation rules

No feature becomes part of the autopilot because it sounds useful.

A candidate feature must pass:

1. historical replay with no look-ahead;
2. walk-forward / out-of-sample testing;
3. realistic spread, slippage and fees;
4. comparison against the simpler baseline;
5. stability across multiple market regimes;
6. enough observations to avoid judging a strategy from a handful of trades;
7. ablation testing — remove the feature and verify performance actually degrades;
8. shadow-live testing before it can influence any future paper-broker order.

## Metrics

Track per strategy and per decision source:

- net P/L
- return on starting capital
- expectancy per trade
- win rate
- average win / average loss
- profit factor
- maximum drawdown
- maximum adverse excursion
- maximum favorable excursion
- entry delay versus first qualifying signal
- slippage versus observed midpoint / NBBO
- time in trade
- turnover
- modeled fees and spread cost
- false-positive rate by setup
- performance by time of day
- performance by volatility regime
- performance by market regime

## Deployment architecture

Netlify remains the dashboard and control plane.

For low-frequency polling, Netlify Functions are sufficient. For continuous WebSocket ingestion and 24/7 shadow monitoring, use a long-running ingestion worker and a persistent database:

```text
Exchange / vendor feeds
        |
Long-running ingest worker
        |
Normalizer + feature engine
        |
Persistent feature store
        |
Decision engine
   |            |
Human gate   Shadow autopilot
   |            |
separate fictional portfolios
        |
Netlify dashboard / analytics
```

A serverless dashboard should not be treated as the long-running market-data collector.

## Data-source priority

Recommended order:

1. Alpaca SIP/IEX baseline and historical bars
2. expanded equity/ETF universe and derived breadth
3. CME ES/NQ context
4. news and event timestamps
5. Nasdaq depth / auction imbalance
6. options / volatility data

This order keeps costs and complexity low while giving each new source a clean A/B test against the prior system.
