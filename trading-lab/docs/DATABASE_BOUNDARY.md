# Trading Lab Database Boundary

## Canonical V1 decision

RedDirt Trading Lab durable research storage uses **Netlify Database via `@netlify/database`**. This is the only database path for Market Memory, learning cycles, strategy lineage, calibration, feature evidence and related V1 research persistence.

The Trading Lab must not read `DATABASE_URL`, `DIRECT_URL`, `TRADING_LAB_DATABASE_URL`, Supabase database URLs, or campaign/SOS database credentials. Environment variables that exist on the Netlify project for older infrastructure are not an authorization for Trading Lab code to use them.

## Runtime boundary

Durable functions obtain a connection only with `getDatabase()` from `@netlify/database`. Schema changes live only under `netlify/database/migrations/`. Production deploys use the Netlify Database production branch; deploy previews use their isolated database branches according to Netlify Database behavior.

The market-data adapter remains separate. Alpaca credentials are data-provider credentials, not database credentials.

## Durable V1 surfaces

- Market Memory ingest and status
- historical analogue queries
- forward outcome queries
- learning-cycle persistence and history
- strategy lineage
- calibration cycles, feature evidence and lessons

All durable tables live under the `trading_lab` PostgreSQL schema. No campaign, voter, donor, SOS, user-PII, broker-order, or live-money tables belong in this database boundary.

## Migration source of truth

The canonical migrations are:

1. `001_market-memory`
2. `002-learning-ledger`
3. `003-strategy-lineage`
4. `004-calibration`

`db/market-memory-schema.sql` is retained only as an early architecture/reference artifact. It is not a production migration source and must not be manually applied to another RedDirt database.

## Enforcement

`test/database-boundary.test.mjs` fails CI if durable functions stop importing `@netlify/database`, fail to use `getDatabase()`, or if Trading Lab Functions introduce known manual/Supabase database connection patterns.

## Production proof still required

Architecture convergence is not production proof. The database release gate remains closed until a production deployment demonstrates:

1. migrations provisioned successfully;
2. `market-memory-status` reads the `trading_lab` schema;
3. a bounded Market Memory write succeeds and is visible on readback;
4. a learning cycle persists and appears in `learning-history`;
5. a calibration cycle persists and is independently read back;
6. no real-money order capability is introduced.

This distinction is intentional: **configured, tested, deployed, and proven are separate states.**
