# Phase 3B — Market Memory + Breadth

Phase 3B turns the Trading Lab from an in-session calculator into an experiment system that can accumulate normalized observations and later migrate them to a durable database/worker architecture.

## Safety boundary

This phase does not add broker credentials, live-money trading, or an order endpoint. Human and autopilot portfolios remain fictional.

## Implemented foundation

`src/market-memory.js` provides a vendor-neutral memory contract for:

- market observations with provider/exchange time and ingestion time;
- decision events;
- fictional trade events;
- experiment runs;
- source-health observations;
- regime labels;
- bounded browser persistence;
- deduplication by mode/symbol/provider timestamp;
- breadth calculations;
- simple deterministic market-regime classification.

The browser store is an interim Phase 3B adapter, not the final institutional store. Its schema is intentionally shaped so the same records can move to Postgres without changing the decision engine.

## Breadth universe

The canonical expansion universe starts with broad indexes, sector ETFs and liquid large-cap names:

SPY, QQQ, IWM, DIA, XLK, XLF, XLE, XLV, XLI, XLY, XLP, XLU, XLB, XLRE, XLC, NVDA, AAPL, MSFT, AMZN, META, GOOGL, TSLA, AMD, AVGO and JPM.

Not every provider/feed must expose every symbol at all times. Breadth calculations use only ready observations and explicitly report sample count.

## Derived breadth

- percent above VWAP;
- percent above SMA20;
- percent with positive short momentum;
- advance/decline ratio;
- average evidence score;
- top three leaders;
- bottom three laggards.

## Regimes

Initial deterministic labels are deliberately simple and auditable:

- TRENDING_RISK_ON
- TRENDING_RISK_OFF
- HIGH_VOL_RISK_ON
- HIGH_VOL_RISK_OFF
- RANGE_MIXED
- INSUFFICIENT_DATA

These labels are experimental features, not market truths. They must earn predictive value through Phase 3C walk-forward and ablation tests.

## Next Phase 3B slice

1. Wire the memory adapter into `phase3-main.js` so each replay/live evaluation records observations and decisions.
2. Expand the live provider allowlist and historical seeding to the breadth universe without exceeding provider rate limits.
3. Add a Market Memory panel showing observation count, symbol coverage, current breadth, regime, provider timestamp and ingestion latency.
4. Add export/import of normalized experiment JSON for reproducible research.
5. Add a persistent Postgres adapter and migration only after the target database/runtime is explicitly selected.
6. Move continuous ingestion to a long-running worker; keep Netlify as dashboard/control plane.

## Validation

`npm run check` runs Phase 2, Phase 3A and Phase 3B Node tests before the Vite production build.
