-- V7-03 Competition API audit trail.
create table if not exists trading_lab.competition_audit (
  id text primary key,
  created_at timestamptz not null default now(),
  action text not null,
  actor_type text not null,
  cohort_id text,
  portfolio_id text,
  detail jsonb not null default '{}'::jsonb,
  orders_enabled boolean not null default false,
  real_money boolean not null default false
);

create index if not exists competition_audit_created_idx
  on trading_lab.competition_audit(created_at desc);
