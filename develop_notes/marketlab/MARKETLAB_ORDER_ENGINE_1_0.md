# MarketLab Order Engine 1.0

## Purpose

This pass establishes the first authoritative simulated trading engine for MarketLab. It does not connect to a brokerage and cannot place real-money orders.

## Execution doctrine

1. The browser submits symbol, side and quantity only.
2. The server loads the authenticated player's portfolio and competition rules.
3. MarketLab fetches market status and a fresh quote through the server-side market-data provider.
4. MarketLab applies configured simulated slippage and flat fees.
5. One database transaction validates cash/holdings and writes the order, execution, position mutation and cash-ledger entries.
6. Portfolio cash remains derived from immutable cash-ledger entries.

The browser never supplies an authoritative price.

## Models added

- SimulatedOrder
- SimulatedExecution
- Position
- OrderSide
- OrderType
- OrderStatus

Competition rules now include `flatTradeFee` and `slippageBps`.

## Safety and integrity gates

- BUY orders reject if resulting cash would be negative.
- SELL orders reject if the portfolio does not own enough shares.
- Market orders execute only while the provider reports the market OPEN.
- Quantity must be positive.
- Each submission carries a portfolio-scoped idempotency key.
- Duplicate idempotency keys cannot create duplicate executions.
- Order, execution, cash settlement, fee and position changes share one database transaction.
- Quote timestamp and provider/source are persisted with the execution.
- There is no brokerage API or real-money execution path.

## Position accounting

BUY updates weighted-average cost. SELL leaves the remaining average cost unchanged and accumulates realized P/L from execution price minus average cost multiplied by quantity. Fractional shares are represented using decimal database types, not floating-point accounting fields.

## UI

`/trade` provides the first simulated order ticket, current quote, buying power, configured fee/slippage disclosure, current positions and recent execution ledger. The quote shown in the ticket is informational; execution fetches a new quote on the server.

## Deferred

Limit/stop orders, partial fills, liquidity models, shorting, margin, complex regulatory fees, wash-sale/tax logic and brokerage connectivity remain outside Order Engine 1.0.

## Live proof still required

A true end-to-end fill requires the independent MarketLab database migration, auth environment, and market-data credentials to be live. Until that proof runs, this pass is code-complete but not production-proven.
