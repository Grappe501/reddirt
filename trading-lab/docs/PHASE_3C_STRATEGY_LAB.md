# Phase 3C — Strategy Library + Walk-Forward Experiment Lab

## Purpose

Phase 3B taught Trading Lab to remember. Phase 3C teaches it to compare hypotheses against that memory without granting the software live-money authority.

The first slice adds three deterministic strategies: Evidence Trend, Momentum Confirmed, and VWAP Participation. Strategies are explicit functions, not AI-generated trading instructions. They can be tested, rejected, revised, and versioned.

## Scientific rule

A strategy does not become trusted because it worked on the data used to invent it. Experiments must preserve chronological order and reserve later observations as out-of-sample data. The initial walk-forward primitive uses a 70/30 chronological split. Later slices will add rolling windows, costs, benchmark comparisons, regime stratification, and ablation.

## Historical analogues

The analogue engine asks a descriptive research question: which stored observations most closely resemble the current feature state? Similarity currently considers evidence score, 5/20-bar momentum, relative strength, realized volatility, and spread when available. Netlify Database provides the durable analogue query; the browser implementation provides deterministic testing and fallback research behavior.

Analogue matches are evidence, not predictions. A similar historical state does not guarantee a similar future outcome. Future outcome labeling must be computed with strict timestamp boundaries before analogue performance can influence a strategy score.

## Safety

- Fictional accounts only.
- No broker-order endpoint.
- No live-money credentials.
- Strategy evaluation and historical analogues are research surfaces.
- Future AI layers may explain evidence but cannot silently change execution or risk rules.

## Next slices

1. Label stored observations with forward returns at fixed horizons without look-ahead leakage.
2. Add full cost-aware backtest execution for each strategy.
3. Add rolling walk-forward windows and regime-stratified results.
4. Persist experiment definitions/results in Netlify Database.
5. Build the Strategy Lab dashboard comparing train vs out-of-sample performance.
6. Promote only operator-approved strategy versions into shadow autopilot candidates.
