# Durable Market Memory Architecture

## Decision

Trading Lab remains a standalone application inside the RedDirt repository. Its durable market research data must not be coupled to the campaign/SOS Prisma schema or the root `DATABASE_URL`.

The repository audit found that the root RedDirt application already owns a large Prisma schema and migration history. Trading Lab has its own Vite/Netlify build and no database dependency today. Therefore this slice prepares an isolated PostgreSQL contract and deliberately does **not** modify `prisma/schema.prisma`, `prisma/migrations/**`, or the root campaign database.

## Dedicated database boundary

The future writer uses only:

`TRADING_LAB_DATABASE_URL`

It must never silently fall back to root `DATABASE_URL` or `DIRECT_URL`. This is enforced in the ingest-boundary tests.

The prepared SQL lives at `db/market-memory-schema.sql`. It creates only a `trading_lab` schema with:

- `experiment_runs`
- `market_observations`
- `market_regimes`
- `decision_events`
- `paper_trades`
- `data_source_health`

There are no campaign, voter, donor, contact, authentication, broker-order or live-money tables.

## Runtime contract

Browser memory remains the immediate write-through cache. `src/durable-memory.js` builds bounded, idempotent batches from the normalized collections and tracks acknowledgements. The Netlify endpoint `market-memory-ingest` validates those batches and fails closed until a dedicated database target and writer adapter are deliberately enabled.

This means the application can continue operating in LOCAL_ONLY mode if durable storage is unavailable. Market simulation must never stop because persistence is offline.

## Why the writer is not enabled in this slice

A connection string alone is not enough. Before enabling writes we need an explicit dedicated PostgreSQL target, its migration/application procedure, connection pooling appropriate for Netlify Functions, retention expectations, and a long-running worker target. Until those are selected, the endpoint returns a controlled non-success response and cannot write anywhere.

## Next infrastructure slice

1. Provision/select the dedicated Trading Lab PostgreSQL target.
2. Apply `db/market-memory-schema.sql` to that target only.
3. Add a server-only Postgres driver/pool to the Trading Lab package.
4. Implement transactional upserts in `market-memory-ingest` using record IDs and `(mode,symbol,provider_time)` uniqueness.
5. Add health/readback endpoint and round-trip integration tests.
6. Wire periodic browser flushes as a transitional collector.
7. Move continuous market collection to a long-running worker; Netlify stays the dashboard/control plane.

## Safety invariant

No step in durable persistence enables real-money trading. `ordersEnabled` remains false and no broker-order endpoint exists.
