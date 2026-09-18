# V2-10 — Premium Intelligence Engine

Status: IMPLEMENTED v1 foundation
Date: 2026-09-18

Premium Intelligence converts a versioned stack of evidence into a bounded 0–100 directional evidence score.

It is explicitly NOT a probability of profit, expected return, recommendation guarantee or permission for automated real-money execution.

## V1 model

The initial model combines Technical, Volume/Participation, Relative Strength, Breadth/Regime, Historical Evidence, Strategy Consensus, Walk-Forward Evidence, Calibration Adjustment, Event/News and explainable Pattern Signal. Cost/Liquidity, Risk and Data Quality are explicit penalties.

Every component accepts a normalized 0–100 evidence score. Missing evidence is not silently neutralized: it reduces evidence coverage. Below minimum coverage, Premium becomes UNAVAILABLE.

Stale evidence also forces unavailable state.

## Output

score, BUY/HOLD/SELL direction, conviction band, evidence quality/coverage, component decomposition, penalties, model version and disclaimer.

## Explainability

premiumExplanation() identifies strongest current drivers, missing evidence that could change the reading and active penalties. premiumVelocity() distinguishes rising/falling/stable score movement from the absolute score.

## Critical calibration rule

A score of 78 means the versioned evidence model currently produces 78/100 after penalties. It does not mean 78% chance of profit. A probability may only be displayed if a future separately validated calibration model supports that statement.

## Learning

Every production Premium snapshot should later be timestamped with its inputs and linked to forward outcomes, costs, risk, calibration and model lineage. V1 Market Memory, walk-forward and learning-ledger systems remain the evidence foundation.
