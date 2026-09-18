-- V3-01 Durable Multi-Agent Research Store
-- Append-only research records where practical; JSONB preserves versioned V2.5 contracts.
create table if not exists trading_lab.agent_research_runs (
 id text primary key,
 symbol text not null,
 mode text not null check (mode in ('LIVE_SHADOW','HISTORICAL_REPLAY','RESEARCH')),
 event_type text,
 state text not null,
 snapshot_id text not null,
 evidence_state text,
 cutoff_at timestamptz,
 captured_at timestamptz,
 completed_at timestamptz,
 code_version text,
 config_version text,
 cost_model_version text,
 universe_version text,
 created_at timestamptz not null default now()
);
create table if not exists trading_lab.agent_research_packets (
 packet_id text primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 agent_id text not null,
 agent_version text,
 evidence_state text not null,
 decision_class text,
 direction text,
 data_as_of timestamptz,
 packet jsonb not null,
 created_at timestamptz not null default now()
);
create table if not exists trading_lab.evidence_graph_nodes (
 node_id text primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 node_type text not null,
 payload jsonb not null,
 created_at timestamptz not null default now()
);
create table if not exists trading_lab.evidence_graph_edges (
 edge_id bigserial primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 from_node_id text not null references trading_lab.evidence_graph_nodes(node_id) on delete cascade,
 to_node_id text not null references trading_lab.evidence_graph_nodes(node_id) on delete cascade,
 edge_type text not null,
 created_at timestamptz not null default now(),
 unique(run_id,from_node_id,to_node_id,edge_type)
);
create table if not exists trading_lab.strategy_desk_views (
 id bigserial primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 desk_id text not null,
 state text not null,
 view text not null,
 evidence_score double precision,
 payload jsonb not null,
 created_at timestamptz not null default now(),
 unique(run_id,desk_id)
);
create table if not exists trading_lab.committee_director_views (
 id bigserial primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 director_id text not null,
 state text not null,
 view text not null,
 payload jsonb not null,
 created_at timestamptz not null default now(),
 unique(run_id,director_id)
);
create table if not exists trading_lab.chief_strategy_views (
 run_id text primary key references trading_lab.agent_research_runs(id) on delete cascade,
 state text not null,
 view text not null,
 evidence_score double precision,
 risk_blocked boolean not null default false,
 payload jsonb not null,
 created_at timestamptz not null default now()
);
create table if not exists trading_lab.research_outcomes (
 id text primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 window_start_at timestamptz not null,
 window_end_at timestamptz not null,
 realized_return double precision not null,
 benchmark_return double precision not null default 0,
 cost double precision not null default 0,
 regime text,
 payload jsonb not null default '{}'::jsonb,
 resolved_at timestamptz not null,
 check(window_end_at > window_start_at)
);
create table if not exists trading_lab.agent_alpha_observations (
 id bigserial primary key,
 run_id text not null references trading_lab.agent_research_runs(id) on delete cascade,
 outcome_id text not null references trading_lab.research_outcomes(id) on delete cascade,
 packet_id text not null references trading_lab.agent_research_packets(packet_id) on delete cascade,
 agent_id text not null,
 regime text,
 horizon text,
 observation jsonb not null,
 created_at timestamptz not null default now(),
 unique(outcome_id,packet_id)
);
create index if not exists agent_runs_symbol_created_idx on trading_lab.agent_research_runs(symbol,created_at desc);
create index if not exists agent_packets_run_agent_idx on trading_lab.agent_research_packets(run_id,agent_id);
create index if not exists evidence_nodes_run_type_idx on trading_lab.evidence_graph_nodes(run_id,node_type);
create index if not exists evidence_edges_run_idx on trading_lab.evidence_graph_edges(run_id);
create index if not exists research_outcomes_run_idx on trading_lab.research_outcomes(run_id,resolved_at desc);
create index if not exists agent_alpha_agent_idx on trading_lab.agent_alpha_observations(agent_id,created_at desc);
