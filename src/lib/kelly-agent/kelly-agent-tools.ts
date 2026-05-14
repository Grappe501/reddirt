import "server-only";

import { findKellyConfirmedCalendarSource, findKellyTentativeCalendarSource } from "@/lib/calendar/kelly-google-calendar-policy";
import { loadWeekendRoutePlansFile } from "@/lib/opportunities/load-community-opportunities-data";
import type { KellyAgentTask } from "@/lib/kelly-agent/agent-context-pack";
import type { AgentContextPack } from "@/lib/kelly-agent/agent-context-pack";
import { loadMediaIndexSlice } from "@/lib/kelly-agent/build-agent-context-pack";
import { loadWinTargetToolOutput } from "@/lib/kelly-agent/tools/win-target-tool";
import { loadVolunteerCapacityToolOutput } from "@/lib/kelly-agent/tools/volunteer-capacity-tool";
import { buildEventSuccessPlaybook } from "@/lib/kelly-agent/tools/event-success-playbook-tool";
import { loadGotvCommitmentAllocationFile } from "@/lib/field-ops/load-gotv-commitment-allocation";
import { buildScheduleReadinessReport } from "@/lib/kelly-agent/tools/schedule-readiness-tool";
import { runCandidateDashboardPreflight } from "@/lib/kelly-agent/tools/candidate-dashboard-preflight-tool";
import { buildCalendarDbHealthReport } from "@/lib/kelly-agent/tools/calendar-db-health-tool";
import { buildCalendarSyncReadinessReport } from "@/lib/kelly-agent/tools/calendar-sync-readiness-tool";
import { buildSchedulePersistenceReport } from "@/lib/kelly-agent/tools/schedule-persistence-tool";
import { buildCalendarSmokeTestReport } from "@/lib/kelly-agent/tools/calendar-smoke-test-tool";

export type KellyAgentToolTrace = { tool: string; ms: number };

export type KellyAgentToolBundle = {
  calendar_context: unknown;
  route_matrix: unknown;
  county_facts: unknown;
  opportunity_graph: unknown;
  media_retrieval: unknown;
  google_calendar_sync: unknown;
  approval_recommendation_stub: unknown;
  win_targets: unknown;
  volunteer_capacity: unknown;
  gotv_allocation: unknown;
  event_success_playbook: unknown;
  schedule_readiness: unknown;
  candidate_dashboard_preflight: unknown;
  calendar_db_health: unknown;
  calendar_sync_readiness: unknown;
  schedule_persistence: unknown;
  calendar_smoke_test: unknown;
};

export async function runKellyAgentTools(
  task: KellyAgentTask,
  pack: AgentContextPack,
  opts: { calendarItemId?: string; repoRoot?: string },
): Promise<{ tools: KellyAgentToolBundle; trace: KellyAgentToolTrace[] }> {
  const trace: KellyAgentToolTrace[] = [];
  const root = opts.repoRoot ?? process.cwd();
  const t0 = Date.now();

  const calendar_context = {
    window: pack.calendarWindow,
    itemCount: Array.isArray(pack.calendarWindow.items) ? pack.calendarWindow.items.length : 0,
    sampleIds: (pack.calendarWindow.items as { id?: string; title?: string }[])
      .slice(0, 24)
      .map((r) => ({ id: r.id, title: r.title })),
  };
  trace.push({ tool: "calendar_context", ms: Date.now() - t0 });

  const t1 = Date.now();
  const route_matrix = pack.routeMatrix ?? {};
  trace.push({ tool: "route_matrix", ms: Date.now() - t1 });

  const t2 = Date.now();
  const county_facts = { rows: pack.countyFacts, count: (pack.countyFacts as unknown[]).length };
  trace.push({ tool: "county_facts", ms: Date.now() - t2 });

  const t3 = Date.now();
  const weekend = loadWeekendRoutePlansFile();
  const opportunity_graph = {
    weekendPlanCount: weekend?.plans?.length ?? 0,
    topClusters: weekend?.topClusters ?? [],
    tentativeOpportunityCount: (pack.tentativeOpportunities as unknown[]).length,
  };
  trace.push({ tool: "opportunity_graph", ms: Date.now() - t3 });

  const t4 = Date.now();
  const media_retrieval = { items: await loadMediaIndexSlice(root, 24) };
  trace.push({ tool: "media_retrieval", ms: Date.now() - t4 });

  const t5 = Date.now();
  let google_calendar_sync: unknown = { tentative: null, confirmed: null };
  try {
    const [tentativeSrc, confirmedSrc] = await Promise.all([
      findKellyTentativeCalendarSource(),
      findKellyConfirmedCalendarSource(),
    ]);
    google_calendar_sync = {
      tentativeSourceId: tentativeSrc?.id ?? null,
      confirmedSourceId: confirmedSrc?.id ?? null,
      note: "Read-only lane discovery — use existing CLI scripts to sync; this tool does not mutate calendars.",
    };
  } catch {
    google_calendar_sync = { error: "database_unavailable" };
  }
  trace.push({ tool: "google_calendar_sync", ms: Date.now() - t5 });

  const t6 = Date.now();
  const approval_recommendation_stub: unknown = {
    note: "For per-item AI approval cards, POST /api/admin/calendar-command-center/ai-recommendations with { itemIds }.",
    taskRequested: task,
    calendarItemId: opts.calendarItemId ?? null,
  };
  trace.push({ tool: "approval_recommendation", ms: Date.now() - t6 });

  const t7 = Date.now();
  const win_targets = loadWinTargetToolOutput(root) ?? {
    note: "Run `npm run election:targets:build` in the RedDirt lane to generate data/election/kelly-win-target-scenario-v1.json.",
  };
  trace.push({ tool: "win_targets", ms: Date.now() - t7 });

  const t8 = Date.now();
  const volunteer_capacity = loadVolunteerCapacityToolOutput(root) ?? {
    note: "Run `npm run fieldops:volunteer-capacity:build` in the RedDirt lane to generate data/field-ops/volunteer-capacity-model-v1.json.",
  };
  trace.push({ tool: "volunteer_capacity", ms: Date.now() - t8 });

  const t9 = Date.now();
  const gotv_allocation = loadGotvCommitmentAllocationFile(root) ?? {
    note: "Run `npm run fieldops:gotv-allocation:build` in the RedDirt lane to generate data/field-ops/gotv-commitment-allocation-v1.json.",
  };
  trace.push({ tool: "gotv_allocation", ms: Date.now() - t9 });

  const t10 = Date.now();
  const event = opts.calendarItemId
    ? (pack.calendarWindow.items as { id?: string }[]).find((item) => item.id === opts.calendarItemId)
    : null;
  const event_success_playbook = buildEventSuccessPlaybook(event);
  trace.push({ tool: "event_success_playbook", ms: Date.now() - t10 });

  const t11 = Date.now();
  const schedule_readiness = await buildScheduleReadinessReport();
  trace.push({ tool: "schedule_readiness", ms: Date.now() - t11 });

  const t12 = Date.now();
  const candidate_dashboard_preflight = await runCandidateDashboardPreflight({ repoRoot: root });
  trace.push({ tool: "candidate_dashboard_preflight", ms: Date.now() - t12 });

  const t13 = Date.now();
  const calendar_db_health = await buildCalendarDbHealthReport(root);
  trace.push({ tool: "calendar_db_health", ms: Date.now() - t13 });

  const t14 = Date.now();
  const calendar_sync_readiness = await buildCalendarSyncReadinessReport();
  trace.push({ tool: "calendar_sync_readiness", ms: Date.now() - t14 });

  const t15 = Date.now();
  const schedule_persistence = await buildSchedulePersistenceReport();
  trace.push({ tool: "schedule_persistence", ms: Date.now() - t15 });

  const t16 = Date.now();
  const calendar_smoke_test = await buildCalendarSmokeTestReport();
  trace.push({ tool: "calendar_smoke_test", ms: Date.now() - t16 });

  return {
    tools: {
      calendar_context,
      route_matrix,
      county_facts,
      opportunity_graph,
      media_retrieval,
      google_calendar_sync,
      approval_recommendation_stub,
      win_targets,
      volunteer_capacity,
      gotv_allocation,
      event_success_playbook,
      schedule_readiness,
      candidate_dashboard_preflight,
      calendar_db_health,
      calendar_sync_readiness,
      schedule_persistence,
      calendar_smoke_test,
    },
    trace,
  };
}
