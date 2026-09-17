create table if not exists trading_lab.strategy_versions (
 id text primary key,
 strategy_id text not null,
 version text not null,
 parent_version text,
 hypothesis text not null,
 parameters jsonb not null default '{}'::jsonb,
 lesson_ids jsonb not null default '[]'::jsonb,
 changes jsonb not null default '{}'::jsonb,
 research_status text not null default 'RESEARCH',
 operator_approved boolean not null default false,
 created_at timestamptz not null,
 unique(strategy_id,version)
);
create index if not exists strategy_versions_family_idx on trading_lab.strategy_versions(strategy_id,created_at);

create table if not exists trading_lab.strategy_version_comparisons (
 id bigserial primary key,
 strategy_id text not null,
 parent_version text not null,
 child_version text not null,
 learning_cycle_id text references trading_lab.learning_cycles(id) on delete set null,
 comparison jsonb not null default '{}'::jsonb,
 decision text not null,
 reason text not null,
 automatic_live_promotion boolean not null default false,
 created_at timestamptz not null default now(),
 unique(strategy_id,parent_version,child_version,learning_cycle_id)
);
