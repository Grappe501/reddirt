-- V7-09 Founding Cohort Launch Rehearsal.
-- Dress rehearsal on production infrastructure. Incident rollback cannot
-- rewrite immutable history. Rehearsal never activates the real cohort.
create table if not exists trading_lab.competition_rehearsals (
  id text primary key,
  cohort_id text not null references trading_lab.competition_cohorts(id),
  operator_id text not null,
  state text not null check (state in ('DRESS', 'INCIDENT_OPEN', 'ROLLED_BACK', 'COMPLETE')),
  real_cohort_activated boolean not null default false check (real_cohort_activated = false),
  founding_cohort_launch_authorized boolean not null default false check (founding_cohort_launch_authorized = false),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists competition_rehearsals_cohort_idx
  on trading_lab.competition_rehearsals(cohort_id, started_at desc);

create table if not exists trading_lab.competition_incidents (
  id text primary key,
  rehearsal_id text not null references trading_lab.competition_rehearsals(id),
  cohort_id text not null references trading_lab.competition_cohorts(id),
  kind text not null check (kind in ('LAUNCH_REHEARSAL', 'HISTORY_MUTATION', 'OPERATIONAL')),
  status text not null check (status in ('OPEN', 'ROLLED_BACK', 'CLOSED')),
  reason text not null,
  opened_at timestamptz not null default now(),
  rolled_back_at timestamptz,
  history_mutated boolean not null default false check (history_mutated = false)
);

create index if not exists competition_incidents_rehearsal_idx
  on trading_lab.competition_incidents(rehearsal_id, opened_at desc);

create table if not exists trading_lab.competition_history_locks (
  id text primary key,
  rehearsal_id text not null references trading_lab.competition_rehearsals(id),
  surface text not null check (surface in (
    'FILLS',
    'FROZEN_DECISIONS',
    'AI_SEAL',
    'RULES_FINGERPRINT',
    'SCORING_FINGERPRINT',
    'CREDIT_LEDGER'
  )),
  fingerprint text not null,
  locked boolean not null default true check (locked = true),
  mutable boolean not null default false check (mutable = false),
  unique (rehearsal_id, surface)
);
