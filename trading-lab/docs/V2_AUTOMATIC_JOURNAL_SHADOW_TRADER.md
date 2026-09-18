# V2-16 — Automatic Journal + Shadow Trader

Status: IMPLEMENTED v1 foundation
Date: 2026-09-18

Automatic Journal reconstructs a closed simulated trade as an evidence record. It links actual execution to the strategy version, Premium snapshot, Market Brain snapshot, Risk snapshot, setup and optional trader thesis that existed around decision time.

The journal computes realized simulated P/L from side, entry, exit, quantity and fees while retaining MFE/MAE when available.

Shadow Trader is a controlled counterfactual engine, not hindsight optimization. An alternate exit rule must be explicitly identified and declared before outcome inspection. Initial deterministic rule types are fixed stop, fixed target and time exit; strategy exit is reserved by the contract for integration with versioned V1 strategies.

The engine walks only bars at/after the actual entry and reports modeled exit, modeled P/L, actual P/L and difference. Its output explicitly states that the result is not a claim about what the trader “should” have done.

This prevents a completed chart from being mined for a perfect imaginary exit and then presented as coaching wisdom.

The eventual journal can add chart snapshots, sourced events/news, automatic narrative and daily summaries, while the evidence record remains the canonical substrate.
