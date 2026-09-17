create table if not exists trading_lab.learning_cycles (
  id text primary key,
  created_at timestamptz not null,
  learning_version text not null,
  observation_count integer not null default 0,
  cost_model jsonb not null default '{}'::jsonb,
  promotion_gates jsonb not null default '{}'::jsonb,
  ethics jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists trading_lab.strategy_evaluations (
  id bigserial primary key,
  learning_cycle_id text not null references trading_lab.learning_cycles(id) on delete cascade,
  strategy_id text not null,
  strategy_name text not null,
  research_state text not null,
  overall jsonb not null default '{}'::jsonb,
  baseline jsonb not null default '{}'::jsonb,
  excess_return double precision,
  positive_test_windows integer not null default 0,
  walk_forward jsonb not null default '[]'::jsonb,
  regime_results jsonb not null default '{}'::jsonb,
  reasons jsonb not null default '[]'::jsonb,
  unique(learning_cycle_id,strategy_id)
);
create index if not exists strategy_evaluations_strategy_idx on trading_lab.strategy_evaluations(strategy_id,id desc);

create table if not exists trading_lab.learning_lessons (
  id bigserial primary key,
  learning_cycle_id text not null references trading_lab.learning_cycles(id) on delete cascade,
  strategy_id text,
  lesson_type text not null,
  lesson text not null,
  created_at timestamptz not null default now()
);
create index if not exists learning_lessons_cycle_idx on trading_lab.learning_lessons(learning_cycle_id,id);
