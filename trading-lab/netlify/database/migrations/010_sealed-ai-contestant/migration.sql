-- V7-06 Sealed AI Contestant.
-- One frozen Wealth Builder AI seal per cohort. No API keys, no live orders,
-- no mid-cohort mutation. Do not use reserved role keywords as unquoted names.
create table if not exists trading_lab.competition_ai_seals (
  cohort_id text primary key references trading_lab.competition_cohorts(id),
  fingerprint text not null unique,
  seal_record jsonb not null,
  mutation_allowed boolean not null default false check (mutation_allowed = false),
  real_money boolean not null default false check (real_money = false),
  sealed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists competition_ai_seals_fingerprint_idx
  on trading_lab.competition_ai_seals(fingerprint);
