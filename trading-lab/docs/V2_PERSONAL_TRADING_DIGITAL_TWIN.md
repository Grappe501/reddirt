# V2-14 — Personal Trading Digital Twin

Status: IMPLEMENTED v1 foundation
Date: 2026-09-18

The Digital Twin is an evidence model of observed trading behavior and outcomes. It is not a psychological profile.

Trader observations record plan and execution timestamps/prices, quantity, P/L, MFE/MAE, plan adherence and contextual fields such as symbol, setup, regime, relative volume and Premium at entry. Provenance identifies whether the record came from simulator, journal, import or derivation.

The runtime derives entry delay, holding time, entry slippage and plan/execution comparisons, then aggregates closed-trade evidence into execution statistics, outcomes and setup-level summaries.

Confidence is sample-size aware: under 30 closed trades LOW, 30–99 MODERATE, 100+ HIGH. This is a coarse evidence-volume label, not statistical proof.

Language must remain observational. The system may say “recorded plan adherence was 63%” or “average observed entry delay was 7.2 minutes.” It must not infer FOMO, revenge trading, fear, greed, discipline, personality, intent or mental state unless the user explicitly supplies such a label as self-description—and even then it remains user-reported, not model diagnosis.

Later work can compare strategy specification, actual execution and controlled counterfactual outcomes while preserving this evidence boundary.
