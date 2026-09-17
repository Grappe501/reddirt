-- RedDirt Trading Lab durable market-memory schema
-- PREPARED ONLY: do not apply to the RedDirt campaign/SOS database.
-- Target: a dedicated Trading Lab PostgreSQL database/schema selected in a later operator-gated infrastructure slice.

create schema if not exists trading_lab;

create table if not exists trading_lab.experiment_runs (
  id text primary key,
  started_at timestamptz not null,
  ended_at timestamptz,
  mode text not null,
  strategy_version text,
  universe_version text,
  cost_model jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists trading_lab.market_observations (
  id text primary key,
  experiment_run_id text references trading_lab.experiment_runs(id) on delete set null,
  mode text not null,
  symbol text not null,
  provider_time timestamptz not null,
  ingested_at timestamptz not null,
  price double precision,
  bid double precision,
  ask double precision,
  volume double precision,
  evidence_score double precision,
  action text,
  regime text,
  features jsonb not null default '{}'::jsonb,
  unique(mode, symbol, provider_time)
);
create index if not exists market_observations_symbol_time_idx on trading_lab.market_observations(symbol, provider_time desc);
create index if not exists market_observations_ingested_idx on trading_lab.market_observations(ingested_at desc);

create table if not exists trading_lab.market_regimes (
  id bigserial primary key,
  experiment_run_id text references trading_lab.experiment_runs(id) on delete set null,
  provider_time timestamptz not null,
  ingested_at timestamptz not null,
  regime text not null,
  breadth jsonb not null default '{}'::jsonb
);
create index if not exists market_regimes_time_idx on trading_lab.market_regimes(provider_time desc);

create table if not exists trading_lab.decision_events (
  id text primary key,
  experiment_run_id text references trading_lab.experiment_runs(id) on delete set null,
  actor text not null,
  symbol text not null,
  provider_time timestamptz,
  ingested_at timestamptz not null,
  action text not null,
  score double precision,
  confidence double precision,
  executed boolean,
  evidence jsonb not null default '{}'::jsonb
);
create index if not exists decision_events_actor_time_idx on trading_lab.decision_events(actor, ingested_at desc);

create table if not exists trading_lab.paper_trades (
  id text primary key,
  experiment_run_id text references trading_lab.experiment_runs(id) on delete set null,
  actor text not null,
  side text not null,
  symbol text not null,
  provider_time timestamptz,
  ingested_at timestamptz not null,
  price double precision,
  shares double precision,
  costs jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists paper_trades_actor_time_idx on trading_lab.paper_trades(actor, ingested_at desc);

create table if not exists trading_lab.data_source_health (
  id bigserial primary key,
  ingested_at timestamptz not null,
  provider text,
  feed text,
  mode text,
  ok boolean,
  latency_ms integer,
  detail jsonb not null default '{}'::jsonb
);
create index if not exists data_source_health_time_idx on trading_lab.data_source_health(ingested_at desc);

-- Deliberately no broker-order, live-money, credential, user-PII, or campaign tables.
