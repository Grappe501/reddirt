# V2-04 — Financial Knowledge Graph

Status: IMPLEMENTED v1
Date: 2026-09-18

The graph turns isolated financial definitions into a navigable learning system.

## Graph model

Nodes represent knowledge concepts. Edges encode prerequisite, related, contrast, component, measurement and application relationships. Learning paths provide an intentional sequence toward a target concept.

The graph may contain stub nodes before their full Universal Knowledge Object exists. A stub is navigation/planning metadata only and must never masquerade as reviewed educational content.

## First graph

The first graph contains 17 concepts, 13 explicit relationships and five target learning paths covering VWAP, P/E Ratio, ATR, Short Selling and Sharpe Ratio.

Examples:
Volume + Typical Price -> VWAP.
EPS -> P/E Ratio -> Earnings Yield.
True Range -> ATR -> Volatility.
Long Position <-> Short Selling -> Borrow Fee / Short Squeeze.
Return + Standard Deviation -> Sharpe Ratio -> Sortino Ratio.

## Runtime contract

graphContext(id) returns the concept, prerequisites, related concepts and target learning path. This will feed V2-03 Explain UI and later the AI Professor, skill tree, contextual lessons and Symbol Intelligence.

## Guardrail

Graph adjacency is not evidence that two concepts have a causal relationship. Edge semantics must be explicit. Generated teaching explanations may use graph context but cannot convert related_to into causation or a trading recommendation.
