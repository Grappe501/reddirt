# Phase 3C — Strategy Library + Walk-Forward Experiment Lab

## Purpose

Phase 3B taught Trading Lab to remember. Phase 3C teaches it to compare explicit hypotheses against that memory without granting the software live-money authority.

## Built

The strategy registry currently contains Evidence Trend, Momentum Confirmed, and VWAP Participation. Strategies are deterministic functions rather than AI-generated instructions, making them testable, rejectable and versionable.

The experiment engine now includes:

- chronological train/test splitting;
- leakage-safe 5, 15, 30 and 60 minute forward outcome labels;
- Netlify Database forward-outcome queries using future timestamp joins without placing future information into the source observation;
- modeled round-trip commission, spread, slippage, Section 31 and TAF costs;
- strategy backtesting with fictional capital, closed-trade P/L and maximum drawdown;
- expectancy, win rate and profit factor;
- rolling chronological walk-forward windows with distinct train and held-out test periods;
- historical-state similarity search.

## Scientific rule

A strategy does not become trusted because it worked on the data used to invent it. Experiments preserve chronological order and reserve later observations as out-of-sample data. Forward outcomes are labels used after an observation; they are never permitted to enter the feature state that generated the decision.

A positive backtest is not sufficient evidence of an edge. Before a strategy can become an operator-approved shadow candidate it must survive costs, multiple walk-forward windows, relevant market regimes, a simpler baseline comparison, sufficient sample size and shadow-live observation.

## Historical analogues

The analogue engine asks which stored observations most closely resemble the current feature state. Similarity considers evidence score, 5/20-bar momentum, relative strength and realized volatility. Durable Netlify Database history is the long-term source.

The new outcome layer allows later research to summarize what happened 5, 15, 30 and 60 minutes after historical analogues. Those summaries remain empirical historical measurements, not guarantees or forecasts.

## Safety

- Fictional accounts only.
- No broker-order endpoint.
- No live-money credentials.
- Strategy evaluation, backtests and analogues are research surfaces.
- AI may later explain evidence but cannot silently change execution or risk rules.
- Promotion to shadow autopilot requires an explicit operator-approved version.

## Remaining Phase 3C slices

1. Add regime-stratified strategy results and baseline comparison.
2. Persist experiment definitions, parameters and results in Netlify Database.
3. Build the Strategy Lab dashboard comparing train vs held-out performance.
4. Add feature ablation and minimum-sample gates.
5. Add operator-controlled candidate promotion into shadow autopilot.
