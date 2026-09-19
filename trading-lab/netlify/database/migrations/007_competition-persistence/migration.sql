-- V7-02 Competition Database Activation
-- Official Netlify Database migration. The file at
-- db/migrations/007_competition_persistence.sql is reference only.
-- Do not use reserved role keywords as unquoted column names.
create table if not exists trading_lab.competition_cohorts (
  id text primary key,
  status text not null,
  rules_fingerprint text not null,
  scoring_fingerprint text not null,
  ai_seal_fingerprint text not null,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists trading_lab.competition_members (
  cohort_id text not null references trading_lab.competition_cohorts(id),
  human_id text not null,
  verified boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (cohort_id, human_id)
);

create table if not exists trading_lab.competition_portfolios (
  id text primary key,
  cohort_id text not null references trading_lab.competition_cohorts(id),
  owner_id text not null,
  owner_type text not null check (owner_type in ('HUMAN', 'WEALTH_BUILDER_AI')),
  starting_cash numeric not null default 100000,
  cash numeric not null default 100000,
  created_at timestamptz not null default now(),
  unique (cohort_id, owner_id)
);

create table if not exists trading_lab.competition_fills (
  id text primary key,
  portfolio_id text not null references trading_lab.competition_portfolios(id),
  symbol text not null,
  side text not null check (side in ('BUY', 'SELL')),
  quantity numeric not null check (quantity > 0),
  canonical_price numeric not null check (canonical_price > 0),
  commission numeric not null default 0,
  spread_cost numeric not null default 0,
  slippage_cost numeric not null default 0,
  filled_at timestamptz not null,
  decision_source text not null check (decision_source in ('HUMAN', 'WEALTH_BUILDER_AI'))
);

create table if not exists trading_lab.research_credit_ledger (
  id text primary key,
  human_id text not null,
  delta integer not null,
  reason text not null,
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists competition_fills_portfolio_time_idx
  on trading_lab.competition_fills(portfolio_id, filled_at);

create index if not exists research_credits_human_time_idx
  on trading_lab.research_credit_ledger(human_id, created_at);
