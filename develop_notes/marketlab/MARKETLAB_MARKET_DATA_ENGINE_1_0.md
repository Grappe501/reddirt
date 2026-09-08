# MarketLab Market Data Engine 1.0

## Status

Build 1 market-data spine is implemented on `feature/marketlab-foundation-1-0`.

## Provider Strategy

MarketLab uses a provider interface instead of binding UI or order logic directly to a vendor. The first implementation is Alpaca because its official API exposes current U.S. equity data, a market clock, and stock feeds that can support the simulator. The provider selector is environment-driven so Massive or another licensed source can be added later without rewriting the game engine.

Canonical interface:

- `searchSecurities(query)`
- `getQuote(symbol)`
- `getQuotes(symbols)`
- `getMarketStatus()`

## Initial Alpaca Integration

Server-only environment variables:

- `MARKETLAB_MARKET_DATA_PROVIDER=alpaca`
- `MARKETLAB_ALPACA_API_KEY_ID`
- `MARKETLAB_ALPACA_API_SECRET_KEY`
- `MARKETLAB_ALPACA_FEED=iex|sip|delayed_sip`

No Alpaca credential is exposed to the browser.

Official Alpaca documentation distinguishes IEX, SIP, and delayed SIP stock feeds. The free offering may be limited to IEX while SIP requires the appropriate entitlement. MarketLab therefore labels the quote source in the normalized quote contract and stores whether the selected feed is delayed.

## Massive Compatibility

Massive's official stock WebSocket documentation exposes real-time trades, quotes, minute aggregates, and related U.S. equity events. It remains a viable future provider implementation, especially for richer streaming dashboards. MarketLab should not assume that an API subscription automatically grants unrestricted public redistribution; commercial data rights must be reviewed before broad launch.

## Normalized Quote Contract

A quote contains:

- symbol
- current price
- optional bid
- optional ask
- optional previous close
- provider timestamp
- source identifier
- delayed-data flag

The simulator must record the exact normalized quote used for any future simulated fill so executions are reproducible.

## Build 1 UI

`/markets` now provides:

1. current market state from the provider
2. security search by ticker/company
3. provider-backed quote retrieval
4. bid/ask when available
5. explicit simulation-only disclosure
6. dashboard navigation into the market screen

If credentials are absent or data access fails, the UI degrades visibly rather than inventing a price.

## Hard Rules

- The browser never decides an authoritative execution price.
- The player never submits a client-supplied price as market truth.
- No real brokerage order API is part of this provider.
- Live execution will remain simulation-only.
- Credentials remain server-only.
- Market-data licensing and redistribution is a launch gate.
- Order-engine fills must consume a server-fetched quote snapshot and persist the fill evidence.

## Next Slice

`MARKETLAB-ORDER-ENGINE-1.0`

Build market buy/sell requests, server-side validation, quote snapshot capture, configurable transaction friction, immutable execution records, cash-ledger settlement, and first position accounting. Initial order type is market order only; no margin and no shorting.
