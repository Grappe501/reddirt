# RedDirt Trading Lab — V2 Premium Intelligence Terminal

Status: V2 shadow roadmap. Do not delay V1 production release for this feature.

## Signature feature

Every tracked instrument continuously displays a **Premium to Buy / Sell Now** reading. This is a composite evidence score, not a probability of profit and not investment advice.

Example:

- NVDA — BUY PREMIUM 78/100
- Direction: BUY / HOLD / SELL
- Conviction: LOW / MODERATE / HIGH / EXTREME
- Evidence quality: WEAK / FAIR / STRONG
- Regime: current classified market regime
- Timing: favorable / neutral / unfavorable
- Risk: low / moderate / elevated
- Premium velocity: rising / falling / stable, including point change and elapsed time
- Last recalculation timestamp

## Canonical rule

A 78/100 BUY PREMIUM means the system's defined, versioned evidence model currently favors buying at 78/100. It MUST NOT be presented as a 78% probability that price will rise unless a separately calibrated probability model has established that interpretation.

## Signal stack

The Premium Engine should be able to combine, subject to evidence availability and versioning:

1. Price trend and multi-horizon momentum.
2. Volume, relative volume, VWAP and participation.
3. Volatility, ATR, spread, liquidity and modeled execution friction.
4. Benchmark, sector and cross-asset relative strength.
5. Market breadth and regime classification.
6. Historical analogue similarity and subsequent outcomes.
7. Strategy-library agreement/disagreement.
8. Walk-forward and held-out strategy evidence.
9. Progressive-learning ledger and strategy lineage.
10. Calibration history: how prior readings at similar strength actually behaved.
11. Earnings, scheduled macro events and timestamped news evidence when feeds exist.
12. Options/volatility evidence when V2 options data exists.
13. CME/futures confirmation when that expansion exists.
14. Crowding/contrarian evidence when defensible data exists.
15. An **Intuition / Pattern Signal**: weak-signal aggregation that approximates expert pattern recognition. It must remain explainable enough to identify its contributing inputs and must never be described as mystical intuition or unsupported certainty.

## Premium decomposition

The displayed premium should expose its components rather than hide behind one number:

- Technical premium
- Breadth/regime premium
- Relative-strength premium
- Historical-evidence premium
- Strategy-consensus premium
- Event/news premium
- Derivatives/futures premium
- Calibration adjustment
- Cost/liquidity penalty
- Risk penalty
- Contrarian adjustment
- Pattern/intuition signal

The final premium is versioned and reproducible from the timestamped inputs used at calculation time.

## Signature teaching surfaces

### Why Now?
Show the strongest contributors to the current reading in plain English.

### What Changed?
Explain why the premium moved since the previous material reading.

### What Would Change My Mind?
Show the concrete developments most likely to invalidate or materially weaken the current thesis. Examples: loss of VWAP, breadth deterioration, volatility shock, benchmark reversal, event surprise, or strategy disagreement.

### Risk of Being Wrong
Show downside/risk evidence separately from directional conviction. Strong BUY pressure must never visually erase high risk.

### Bull / Bear Debate
Present the strongest evidence for and against the current direction. The composite score follows only after both cases are assembled.

### Historical Lookalikes
Show comparable timestamped historical states, their similarity, and what happened afterward without implying that history must repeat.

### Premium Velocity
Track whether conviction is accelerating, decelerating, or reversing. Alert states may include BUILDING, FADING, REVERSING and DISLOCATED.

### Model Disagreement
Show when strategies, regimes, features, or data sources disagree. High disagreement should reduce confidence even if the raw directional score is strong.

### Market Brain
A continuously updating explanation stream showing which evidence changed and how much it affected the reading.

## Learning loop

Every premium observation becomes a timestamped research event. At defined horizons (+5m, +15m, +30m, +60m, +1d where data supports it), attach subsequent outcomes. Preserve successes and failures.

Canonical loop:

PREMIUM READING → TIMESTAMPED INPUT SNAPSHOT → FORWARD OUTCOMES → COST/RISK ADJUSTMENT → CALIBRATION → FEATURE/STRATEGY ATTRIBUTION → LESSON → VERSIONED MODEL CANDIDATE → HELD-OUT/SHADOW TEST → HUMAN REVIEW.

The system learns from every simulation but does not tune to every simulation. No single successful or failed trade is enough to change production weights.

## Premium history

For each instrument retain:

- score and direction
- score components
- model/version IDs
- data-source health
- market regime
- evidence quality
- disagreement
- risk level
- timestamp
- later forward outcomes
- whether a simulated trade was taken
- simulated execution costs and net outcome

This enables questions such as:

- How did BUY PREMIUM 75–85 readings perform in TRENDING_RISK_ON regimes?
- Which components added real held-out predictive value?
- Which signals produced false confidence?
- Does a rapidly rising premium outperform an equally high but stale premium?
- Which strategy combinations remain robust after costs?

## UX concept

The Premium should be visible at all times on desktop and mobile. The compact instrument row gets direction, score, velocity and risk. Selecting the instrument opens the full decomposition, Why Now, What Changed, What Would Change My Mind, Bull/Bear Debate, Historical Lookalikes and calibration record.

Color alone must never communicate direction; labels, numbers and accessible states are required.

## Guardrails

- Educational/paper-trading system first.
- No guaranteed-return language.
- No claim that raw score equals probability.
- No automatic real-money execution.
- No automatic live promotion of a learned strategy.
- Human approval remains mandatory for any future real-money boundary.
- Preserve losing simulations and adverse outcomes.
- Reject manipulative, deceptive, MNPI-based or otherwise prohibited inputs/strategies.
- Show stale/degraded data states instead of manufacturing confidence.
- Premium must fall or become unavailable when evidence quality is inadequate.

## V2 follow-on features

Premium Intelligence Terminal should become the foundation for:

- premium heatmap across the watch universe
- top improving / deteriorating premiums
- watchlist alerts for material premium changes
- premium replay so a learner can watch conviction evolve through historical sessions
- human-vs-system conviction comparison
- player prediction journal before revealing the system premium
- premium postmortem after the outcome horizon
- strategy disagreement matrix
- regime-specific leaderboards
- future multi-agent analyst debate
- futures/options confirmation layer
- personalized education explaining why the reading changed

## V2 acceptance criteria

The feature is not complete merely because a number renders. A V2 release candidate must prove that the premium is reproducible, timestamped, decomposable, cost/risk-aware, historically evaluated, calibrated, capable of expressing uncertainty/disagreement, accessible on mobile, and connected to the progressive-learning ledger. It must remain useful when the correct answer is HOLD or INSUFFICIENT EVIDENCE.
