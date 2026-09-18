# Wealth Builder V2.5 — Multi-Agent Intelligence Architecture

Status: CANONICAL DESIGN LOCK
Purpose: replace the conceptual single stock-picking AI with an auditable multi-agent investment-research organization before V3.

## Prime doctrine

Wealth Builder does not ask one AI to pick stocks. It assembles evidence from narrow specialists, preserves disagreement, challenges hypotheses adversarially, synthesizes only after evidence review, and measures every agent against subsequent outcomes.

No agent score is a probability of profit unless a separately documented calibration model proves that interpretation. No agent may guarantee returns. No automatic real-money execution is introduced by this architecture.

## Intelligence hierarchy

DATA AND TRUTH -> SPECIALISTS -> OPPORTUNITY HUNTERS -> SKEPTICS -> STRATEGY DESKS -> COMMITTEE DIRECTORS -> CHIEF STRATEGY -> SIMULATION -> OUTCOME -> AGENT CALIBRATION -> INSTITUTIONAL MEMORY

The Chief Strategy layer may synthesize disagreement but may never erase it.

## Initial specialist roster

### Data and truth
1. Market Data Agent — price, volume, spread, VWAP, ATR, liquidity and timestamps.
2. Historical Market Agent — historical price/volume states and corporate-action-adjusted series.
3. Corporate Historian — documented acquisitions, restructurings, product changes, crises and pivots.
4. Executive Intelligence Agent — officers/directors, tenure, disclosed history and transactions.
5. SEC Filing Agent — filing ingestion, extraction and provenance.
6. Financial Statement Agent — income statement, balance sheet and cash-flow normalization.
7. Earnings Agent — reported results, surprises and guidance history.
8. Capital Structure Agent — shares, dilution, debt, convertibles and buybacks.
9. Ownership Agent — reported institutional and insider ownership changes.
10. Industry Agent — peer set, industry structure and comparative economics.
11. Macro Agent — rates, inflation, labor, commodities and relevant macro series.
12. Event Agent — earnings, dividends, splits and documented catalysts.

### Quantitative scientists
13. Statistics Agent — distributions, z-scores, correlations and anomaly measures.
14. Momentum Agent — multi-horizon momentum.
15. Mean-Reversion Agent — deviations and historical reversion behavior.
16. Volatility Agent — realized volatility, ATR and volatility regime.
17. Volume Agent — abnormal volume and participation.
18. Liquidity Agent — spread, slippage and executable-size evidence.
19. Relative-Strength Agent — stock versus sector, index and peers.
20. Regime Agent — market-state classification.
21. Pattern Research Agent — falsifiable tests of recurring price/volume structures.
22. Correlation Agent — changing cross-security relationships.
23. Factor Agent — defined factor exposures.
24. Anomaly Hunter — statistically unusual universe conditions.
25. Historical Analogue Agent — comparable historical states and forward outcomes.
26. Backtest Auditor — leakage, overfitting, sample-size and robustness challenges.

### Opportunity hunters
27. Lower-Price Liquid Mover Hunter — lower-priced liquid securities with evidence of potentially meaningful movement; low nominal price alone is never positive evidence.
28. Breakout Hunter.
29. Reversal Hunter.
30. Momentum Hunter.
31. Oversold/Reversion Hunter.
32. Relative-Strength Hunter.
33. Earnings Setup Hunter.
34. Volume-Anomaly Hunter.
35. Sector-Rotation Hunter.
36. Large-Cap Quality Hunter.
37. ETF Opportunity Hunter.
38. Intraday Opportunity Hunter.

### Skeptics and controls
39. Bull Agent — strongest evidence-supported bullish case.
40. Bear Agent — strongest evidence-supported bearish case.
41. Red-Team Agent — attempts to falsify the thesis.
42. Data-Quality Agent — stale, missing, conflicting or suspect evidence.
43. Overfitting Agent — challenges statistical discoveries and parameter sensitivity.
44. Cost Agent — spread, commissions, slippage and market-impact assumptions.
45. Risk Agent — downside, concentration, exposure and stop/risk structure.
46. Contrarian Agent — tests whether consensus/crowding creates contrary risk.

## Strategy desks

The first eight desks are independent consumers of the shared Evidence Graph:
1. Momentum Desk
2. Value/Fundamental Desk
3. Mean-Reversion Desk
4. Event-Driven Desk
5. Statistical Research Desk
6. Swing Trading Desk
7. Intraday Desk
8. Long-Term Compounder Desk

Desks may disagree. Disagreement is evidence, not a defect.

## Committee layer

Research Director — evidence sufficiency and provenance.
Quant Director — statistical and model evidence.
Opportunity Director — candidate comparison without hiding mandate differences.
Risk Director — portfolio/exposure/cost constraints.
Learning Director — prior predictions, calibration, agent history and regime-specific lessons.

Chief Strategy Agent — synthesizes the committee into an explainable research state. It cannot invent evidence, convert evidence scores into unsupported probabilities, hide dissent, or enable real-money execution.

## Canonical Agent Research Packet

Every agent invocation must persist:
- packet_id
- agent_id and agent_version
- mission/mandate
- security/universe scope
- invocation timestamp
- data-as-of timestamps
- input evidence references
- observations
- calculations and deterministic outputs
- hypothesis, if applicable
- supporting evidence
- contradicting evidence
- missing evidence
- uncertainty
- confidence/evidence methodology
- source/provenance references
- model/code/config version
- recommendation class or NO_OP
- invalidation conditions
- downstream packet references

Natural-language prose alone is never the canonical agent output.

## Evidence Graph

The graph links:
SOURCE -> OBSERVATION -> CALCULATION -> AGENT PACKET -> HYPOTHESIS -> CHALLENGE -> DESK VIEW -> COMMITTEE SYNTHESIS -> SIMULATED DECISION -> OUTCOME -> CALIBRATION.

A user must be able to drill from a Premium/strategy conclusion back to the exact contributing packets and source state.

## Agent Alpha and calibration

Every agent is measured independently and conditionally. Candidate metrics include coverage, freshness, abstention quality, calibration where applicable, false-positive/false-negative behavior, incremental information contribution, cost-adjusted simulated outcome association, regime stability and degradation over time.

Agent Alpha must never be defined merely as raw return after the agent spoke. The evaluation layer must distinguish correlation from incremental contribution and must preserve sample size, uncertainty, costs and regime.

Weak agents are down-weighted only through versioned, tested calibration rules. Learned changes remain shadow candidates until validation and human-approved promotion.

## Runtime architecture

Not all agents are LLMs. Prefer deterministic code for calculations, indicators, statistics, filtering, scoring and validation. Use language/reasoning models for document interpretation, evidence synthesis, explanation, hypothesis formation and adversarial review where appropriate.

Agents are event-driven and selectively activated. A cheap universe scanner may run broadly; expensive filing/history/reasoning specialists activate only for shortlisted securities or scheduled research refreshes.

## Audit trail example

A final research state should be reconstructable as a timeline: Volume Agent detects abnormal relative volume -> Momentum Agent detects acceleration -> Historical Analogue Agent finds comparable states -> Bear Agent identifies event risk -> Cost/Risk agents adjust the opportunity -> desks publish independent views -> committee synthesizes -> simulation records the decision -> outcome engine measures what happened -> calibration attributes useful and harmful evidence.

## V2.5 build sequence

2.5-01 Agent registry and narrow mandate contracts.
2.5-02 Agent Research Packet JSON schema.
2.5-03 Evidence Graph schema and immutable provenance IDs.
2.5-04 Data/truth agent adapters.
2.5-05 Quant specialist framework.
2.5-06 Opportunity-hunter framework.
2.5-07 Bull/Bear/Red-Team adversarial protocol.
2.5-08 Cost/Risk/Data-Quality/Overfitting control agents.
2.5-09 Strategy desk contracts and independent synthesis.
2.5-10 Committee director contracts.
2.5-11 Chief Strategy synthesis contract with dissent preservation.
2.5-12 Agent timeline/drill-down UI.
2.5-13 Agent Alpha/calibration ledger.
2.5-14 Event-driven orchestration and compute budgets.
2.5-15 Historical replay of full multi-agent decisions.
2.5-16 Shadow multi-agent operation against live market evidence.
2.5-17 Hostile audit: provenance, leakage, hallucination, disagreement, stale data and safety.
2.5-18 V3 handoff and architecture lock.

## V3 entry gates

V3 cannot treat multi-agent intelligence as production-ready until packets are schema-valid, evidence is traceable, disagreement survives synthesis, stale/degraded states are visible, quantitative agents are reproducible, agent evaluation is leakage-resistant, expensive agents are selectively orchestrated, and the complete decision can be replayed from source evidence through outcome.

This document is the canonical pre-V3 multi-agent design. V3 should extend this organization rather than restoring a monolithic stock-picking AI.
