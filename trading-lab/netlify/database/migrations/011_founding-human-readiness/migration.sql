-- V7-08 Founding Human Readiness.
-- Operator roster for ten actual verified humans. Fabricated proof
-- identities cannot close this gate. Roster lock is not a cohort launch.
create table if not exists trading_lab.competition_integrity_reviews (
  id text primary key,
  identity_id text not null references trading_lab.competition_identities(identity_id),
  reviewer_id text not null,
  decision text not null check (decision in ('CLEAR', 'HOLD', 'ESCALATE')),
  reason text not null,
  decided_at timestamptz not null,
  automatic boolean not null default false check (automatic = false)
);

create index if not exists competition_integrity_reviews_identity_idx
  on trading_lab.competition_integrity_reviews(identity_id, decided_at desc);

create table if not exists trading_lab.competition_founding_rosters (
  cohort_id text primary key references trading_lab.competition_cohorts(id),
  state text not null check (state in ('FILLING', 'FULL', 'ROSTER_LOCKED')),
  locked boolean not null default false,
  locked_at timestamptz,
  founding_cohort_launch_authorized boolean not null default false check (founding_cohort_launch_authorized = false)
);

create table if not exists trading_lab.competition_founding_assignments (
  cohort_id text not null references trading_lab.competition_founding_rosters(cohort_id),
  identity_id text not null references trading_lab.competition_identities(identity_id),
  assigned_at timestamptz not null default now(),
  integrity_clear boolean not null default false,
  fabricated boolean not null default false check (fabricated = false),
  primary key (cohort_id, identity_id),
  unique (identity_id)
);
