# V2-13 — Trading Scientist / Strategy Laboratory

Status: IMPLEMENTED v1 foundation
Date: 2026-09-18

Trading Scientist converts a trading belief into a falsifiable, auditable research contract.

The hypothesis schema requires a statement, universe, explicit entry/exit rules, outcome and horizon, transaction-cost assumptions, chronological held-out validation, walk-forward choice, regime slices and parameter-sensitivity posture.

Every entry feature declares when it becomes knowable. leakageAudit() blocks next-bar information from being used as though it were known at the decision point.

The first proving hypothesis formalizes the educational example: gap >=3%, above VWAP and relative volume >2, tested against first-hour continuation. It is labeled a hypothesis, not an established edge.

The runtime validates hypotheses, audits leakage, compiles deterministic simple rules, selects matching rows and emits a research protocol. It deliberately hands eligible samples to the existing V1 backtest/walk-forward infrastructure instead of creating a competing backtester.

A research result is not “supported” merely because an in-sample backtest looks attractive. The intended evidence chain is hypothesis → formal rules → leakage audit → costs → chronological test → walk-forward → regime slices → sensitivity → uncertainty → versioned conclusion.

Trading Scientist is a scientific-method teaching surface as much as a professional research surface.
