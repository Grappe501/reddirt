create table if not exists trading_lab.calibration_cycles (
 id text primary key,
 created_at timestamptz not null,
 version text not null,
 horizon text not null,
 samples integer not null default 0,
 brier_score double precision,
 buckets jsonb not null default '[]'::jsonb,
 regime_calibration jsonb not null default '{}'::jsonb,
 safety jsonb not null default '{}'::jsonb
);
create table if not exists trading_lab.feature_evidence (
 id bigserial primary key,
 calibration_cycle_id text not null references trading_lab.calibration_cycles(id) on delete cascade,
 feature text not null,
 samples integer not null default 0,
 correlation double precision,
 absolute_contribution double precision,
 direction text not null,
 unique(calibration_cycle_id,feature)
);
create table if not exists trading_lab.calibration_lessons (
 id bigserial primary key,
 calibration_cycle_id text not null references trading_lab.calibration_cycles(id) on delete cascade,
 lesson_type text not null,
 lesson text not null,
 created_at timestamptz not null default now()
);
create index if not exists calibration_cycles_created_idx on trading_lab.calibration_cycles(created_at desc);
create index if not exists feature_evidence_feature_idx on trading_lab.feature_evidence(feature,id desc);
