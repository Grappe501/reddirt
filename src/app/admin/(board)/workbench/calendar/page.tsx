import Link from "next/link";
import { TimeMatrixQuadrant } from "@prisma/client";
import {
  getCalendarHqSummary,
  listAgendaEvents,
  listCalendarQueueItems,
  listPendingApprovals,
  getEventOrNull,
  listEventWorkflowTemplateChoices,
  listWorkflowRunsForEvent,
  rollupAnalyticsSnapshot,
  getCalendarSources,
  listCountiesForCalendarFilters,
  listUsersForOwnerFilter,
} from "@/lib/calendar/hq-data";
import { computeEventExecutionReadiness } from "@/lib/calendar/event-readiness";
import { runCalendarAiBriefing, runCommandCenterAi, detectOverpackedDays, detectScheduleOverlaps } from "@/lib/calendar/ai-insights";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";
import { addWeeks, weekKeyFromParam, DEFAULT_CAMPAIGN_TZ } from "@/lib/calendar/weekly-time";
import { parseCalendarFilters, calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";
import {
  getOrCreateWeeklyPlan,
  getCommandStripMetrics,
  listEventsForWeek,
  getCountyNeglectNarrative,
  q2IsTooLow,
  isTooReactive,
  listEventsForMonth,
  getConflictLinesForWeek,
} from "@/lib/calendar/hq-command-data";
import { CalendarCommandView } from "@/components/admin/calendar-hq/CalendarCommandView";
import { CalendarApprovalBoard } from "@/components/admin/calendar-hq/CalendarApprovalBoard";
import { CalendarHqCommandStrip } from "@/components/admin/calendar-hq/CalendarHqCommandStrip";
import { CalendarHqActionBar } from "@/components/admin/calendar-hq/CalendarHqActionBar";
import { CalendarHqFilterRail } from "@/components/admin/calendar-hq/CalendarHqFilterRail";
import { CalendarHqMainTabs, CalendarHqMonthNav } from "@/components/admin/calendar-hq/CalendarHqMainTabs";
import { EventExecutionPanel } from "@/components/admin/calendar-hq/EventExecutionPanel";
import { ensureExecutionChecklist, computeEventHealthScore } from "@/lib/calendar/event-intelligence";

const breakOut =
  "-mx-6 -mt-10 mb-0 w-[calc(100%+3rem)] max-w-[calc(100vw-280px-3rem)] min-w-0 px-0 pt-0 pb-6 lg:-mx-12 lg:mt-0 lg:w-[calc(100%+6rem)] lg:max-w-none";
const h2 = "font-heading text-[9px] font-bold uppercase tracking-wider text-kelly-text/50";

type Props = {
  searchParams: Promise<{
    event?: string;
    view?: string;
    week?: string;
    month?: string;
    q?: string;
    error?: string;
    connected?: string;
    src?: string;
    countyId?: string;
    type?: string;
    stage?: string;
    owner?: string;
  }>;
};

function parseQuadrant(raw: string | undefined): TimeMatrixQuadrant | "ALL" {
  if (!raw) return "ALL";
  const u = raw.toUpperCase();
  if (u === "Q1" || u === "Q2" || u === "Q3" || u === "Q4") return u as TimeMatrixQuadrant;
  return "ALL";
}

function normalizeView(raw: string | undefined) {
  const v = (raw ?? "").trim();
  if (!v || v === "command") return "week";
  if (v === "approvals") return "ribbon";
  return v;
}

function ymdChicago(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: DEFAULT_CAMPAIGN_TZ, year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function CalendarHqPage({ searchParams }: Props) {
  const sp = await searchParams;
  const eventId = sp.event?.trim() || null;
  const weekKey = weekKeyFromParam(sp.week);
  const view = normalizeView(sp.view) as
    | "week"
    | "ribbon"
    | "agenda"
    | "month"
    | "queue"
    | "analytics"
    | "conflicts"
    | string;
  const matrixQ = sp.q?.trim() || undefined;
  const filters: CalendarHqFilters = parseCalendarFilters({
    src: sp.src,
    countyId: sp.countyId,
    type: sp.type,
    stage: sp.stage,
    owner: sp.owner,
  });
  const quadrant = parseQuadrant(matrixQ);
  const monthYm = (() => {
    const m = sp.month?.trim();
    if (m && /^\d{4}-\d{2}$/.test(m)) return m;
    return weekKey.slice(0, 7);
  })();

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 1);
  const to = new Date(now);
  to.setDate(to.getDate() + 21);
  const nowLabel = now.toLocaleDateString("en-US", {
    timeZone: DEFAULT_CAMPAIGN_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const prevWeek = addWeeks(weekKey, -1);
  const nextWeek = addWeeks(weekKey, 1);

  const [
    summary,
    strip,
    plan,
    weekEvents,
    detail,
    sources,
    countyNeglect,
    agenda,
    queue,
    pending,
    rollup,
    aiLegacy,
    monthEvents,
    conflictLines,
    counties,
    owners,
  ] = await Promise.all([
    getCalendarHqSummary(filters),
    getCommandStripMetrics(weekKey, filters),
    getOrCreateWeeklyPlan(weekKey),
    listEventsForWeek(weekKey, filters, quadrant),
    eventId ? getEventOrNull(eventId) : Promise.resolve(null),
    getCalendarSources(),
    getCountyNeglectNarrative(45),
    listAgendaEvents(filters, from, to),
    listCalendarQueueItems(),
    listPendingApprovals(filters),
    rollupAnalyticsSnapshot(),
    runCalendarAiBriefing().catch(() => ({ text: "AI briefing unavailable." })),
    listEventsForMonth(monthYm, filters),
    getConflictLinesForWeek(weekKey, filters),
    listCountiesForCalendarFilters(),
    listUsersForOwnerFilter(),
  ]);

  const [templateChoices, workflowRuns, executionReadiness] =
    eventId && detail
      ? await Promise.all([
          listEventWorkflowTemplateChoices(detail.eventType),
          listWorkflowRunsForEvent(eventId),
          Promise.resolve(
            computeEventExecutionReadiness({
              event: detail,
              tasks: detail.tasks,
            })
          ),
        ])
      : [[], [], null];

  const countyGapNames = countyNeglect.slice(0, 12).map((c) => c.displayName);
  const matrix = strip.matrix;
  const linesForAi = weekEvents.map((e) => ({
    title: e.title,
    startAt: e.startAt,
    endAt: e.endAt,
    county: e.county?.displayName ?? null,
    timeMatrixQuadrant: e.timeMatrixQuadrant,
  }));
  const overlapLines = detectScheduleOverlaps(linesForAi);
  const overpacked = detectOverpackedDays(linesForAi);
  const commandAi = await runCommandCenterAi({
    weekKey,
    mission: plan.missionStatement,
    outcome1: plan.outcome1,
    outcome2: plan.outcome2,
    outcome3: plan.outcome3,
    lines: linesForAi,
    matrix,
    overpacked,
    overlapLines,
    countyGaps: countyGapNames,
    travelLoadLabel: strip.travelLoad,
  }).catch(() => ({ text: "AI command briefing unavailable." }));

  const commandWarnings = {
    q2low: q2IsTooLow(matrix),
    tooReactive: isTooReactive(matrix),
  };

  const firstSourceId = (sources[0] as { id: string } | undefined)?.id ?? null;

  const eventHref = (eid: string, v: string) =>
    `/admin/workbench/calendar?${calendarFiltersToSearchParams(filters, { week: weekKey, view: v, event: eid, q: matrixQ, month: v === "month" ? monthYm : undefined })}`;

  const byDayMonth = (() => {
    const m = new Map<string, typeof monthEvents>();
    for (const e of monthEvents) {
      const k = ymdChicago(e.startAt);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return m;
  })();

  const centerBody = (() => {
    switch (view) {
      case "ribbon":
        return (
          <div className="min-h-0 min-w-0 flex-1">
            <CalendarApprovalBoard weekKey={weekKey} filters={filters} matrixQ={matrixQ} eventId={eventId} />
          </div>
        );
      case "agenda":
        return (
          <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
            <p className={h2 + " mb-1"}>Agenda (3w)</p>
            <ul className="space-y-1 font-mono text-[10px]">
              {agenda.map((e) => (
                <li key={e.id}>
                  <Link
                    href={eventHref(e.id, "agenda")}
                    className="flex flex-wrap gap-1 rounded border border-kelly-text/10 bg-white/80 px-1 py-0.5 hover:border-kelly-navy/30"
                  >
                    <span className="text-[9px] font-bold text-kelly-navy/80">{e.timeMatrixQuadrant}</span>
                    <span className="text-kelly-text/50">{e.startAt.toLocaleString()}</span>
                    <span className="font-semibold text-kelly-text">{e.title}</span>
                    <span className="text-kelly-text/45">{e.eventWorkflowState}</span>
                    {e.county ? <span className="text-kelly-slate">{e.county.displayName}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
            {agenda.length === 0 ? <p className="text-[10px] text-kelly-text/50">No events in window.</p> : null}
          </div>
        );
      case "month":
        return (
          <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
            <p className={h2 + " mb-1"}>Month {monthYm}</p>
            <ul className="space-y-2 text-[10px]">
              {Array.from(byDayMonth.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([day, list]) => (
                  <li key={day}>
                    <p className="text-[8px] font-bold text-kelly-text/60">{day}</p>
                    <ul className="ml-0 space-y-0.5">
                      {list.map((e) => (
                        <li key={e.id}>
                          <Link className="text-kelly-slate hover:underline" href={eventHref(e.id, "month")}>
                            {e.startAt.toLocaleTimeString("en-US", { timeZone: DEFAULT_CAMPAIGN_TZ, hour: "numeric", minute: "2-digit" })} {e.title}
                            {e.county ? <span className="text-kelly-text/50"> · {e.county.displayName}</span> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
            </ul>
            {monthEvents.length === 0 ? <p className="text-[10px] text-kelly-text/50">No events this month (filters may hide results).</p> : null}
          </div>
        );
      case "queue":
        return (
          <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
            <p className={h2 + " mb-1"}>Calendar comms queue</p>
            <ul className="space-y-1 font-mono text-[9px]">
              {queue.map((q) => (
                <li key={q.id} className="rounded border border-amber-700/20 bg-amber-50/50 px-1 py-0.5">
                  {q.actionType}
                  {q.event ? (
                    <Link className="ml-1 text-kelly-slate" href={eventHref(q.event.id, "queue")}>
                      {q.event.title}
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
            {queue.length === 0 ? <p className="text-[10px] text-kelly-text/50">Queue empty.</p> : null}
          </div>
        );
      case "conflicts":
        return (
          <div className="min-h-0 flex-1 overflow-auto p-1 md:p-2">
            <p className={h2 + " mb-1"}>Overlap detection · {weekKey}</p>
            <ul className="list-inside list-disc text-[10px] text-amber-900/90">
              {conflictLines.length === 0 ? <li className="text-kelly-text/50">No same-day overlapping blocks in this week (filtered).</li> : null}
              {conflictLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <p className="mt-2 text-[8px] text-kelly-text/40">Heuristic: two items same calendar day with intersecting time blocks.</p>
          </div>
        );
      case "analytics":
        return (
          <div className="min-h-0 flex-1 space-y-2 overflow-auto p-1 md:p-2 text-[11px]">
            <p className="text-kelly-text/60">Month start: {rollup.monthStart.toLocaleDateString()}</p>
            <p className={h2}>By workflow (created this month)</p>
            <ul>
              {rollup.byState.map((r) => (
                <li key={r.eventWorkflowState}>
                  {r.eventWorkflowState}: {r._count._all}
                </li>
              ))}
            </ul>
            <p className={h2 + " pt-1"}>Pending approvals (filtered)</p>
            <p className="text-kelly-text/70">{pending.length} in queue (see Approvals board for columns).</p>
            <p className={h2 + " pt-1"}>AI planning (14d) — legacy</p>
            <pre className="mt-0.5 max-h-40 overflow-auto whitespace-pre-wrap font-body text-[9px] text-kelly-text/80">
              {aiLegacy.text}
            </pre>
          </div>
        );
      case "week":
        return null;
      default:
        return (
          <p className="p-2 text-xs text-amber-900">
            Unknown view <code>{String(view)}</code>.{" "}
            <Link
              className="underline"
              href={`/admin/workbench/calendar?${calendarFiltersToSearchParams(filters, { week: weekKey, view: "week", event: eventId, q: matrixQ })}`}
            >
              Reset to week
            </Link>
          </p>
        );
    }
  })();

  return (
    <div className={breakOut}>
      <div className="border-b border-kelly-text/10 bg-kelly-wash px-2 py-1.5 md:px-3">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold text-kelly-text md:text-xl">Calendar HQ</h1>
            <p className="font-body text-[11px] text-kelly-text/65">Campaign command calendar — the spine of timing, sequence, and readiness in the workbench.</p>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 font-semibold" href="/admin/workbench">
              ← Workbench
            </Link>
            <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5" href="/admin/events">
              All events
            </Link>
            <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5" href="/campaign-calendar" target="_blank" rel="noreferrer">
              Public calendar ↗
            </Link>
            <span className="rounded border border-kelly-text/10 px-1.5 py-0.5 text-kelly-text/45">
              Google: {isGoogleCalendarConfigured() ? "env OK" : "not configured"}
            </span>
          </div>
        </div>
      </div>

      {sp.error ? <p className="px-2 py-1 text-xs text-red-800 md:px-3">Google: {sp.error}</p> : null}
      {sp.connected ? <p className="px-2 py-1 text-xs text-kelly-success md:px-3">Google Calendar connected.</p> : null}

      <CalendarHqCommandStrip summary={summary} strip={strip} nowLabel={nowLabel} />
      {summary.recentSyncLogs.length > 0 ? (
        <div className="border-b border-kelly-text/10 bg-kelly-text/[0.02] px-2 py-1">
          <p className="font-heading text-[8px] font-bold uppercase tracking-wide text-kelly-text/45">Recent Google sync</p>
          <ul className="max-h-14 overflow-y-auto font-mono text-[7px] leading-tight text-kelly-text/70">
            {summary.recentSyncLogs.slice(0, 8).map((l) => (
              <li key={l.id}>
                {l.createdAt.toLocaleString()} {l.direction} {l.status}
                {l.event ? ` · ${l.event.title}` : ""} — {l.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <CalendarHqActionBar filters={filters} weekKey={weekKey} view={view} eventId={eventId} matrixQ={matrixQ} />

      <div className="flex min-h-[min(100vh,1200px)] min-w-0 flex-1 flex-col xl:flex-row xl:items-stretch">
        <div className="shrink-0 border-b border-kelly-text/10 bg-kelly-wash/20 xl:w-[220px] xl:border-b-0 xl:border-r">
          <div className="p-1.5 xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto">
            <CalendarHqMonthNav weekKey={weekKey} monthYm={monthYm} filters={filters} view={view} eventId={eventId} matrixQ={matrixQ} />
            <CalendarHqFilterRail
              filters={filters}
              weekKey={weekKey}
              view={view}
              eventId={eventId}
              matrixQ={matrixQ}
              monthYm={monthYm}
              counties={counties}
              sources={sources}
              owners={owners}
            />
          </div>
        </div>

        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <CalendarHqMainTabs filters={filters} weekKey={weekKey} view={view} eventId={eventId} matrixQ={matrixQ} monthYm={monthYm} />
          {view === "week" ? (
            <CalendarCommandView
              weekKey={weekKey}
              matrixQ={matrixQ}
              filters={filters}
              plan={plan}
              detail={detail}
              strip={strip}
              weekEvents={weekEvents}
              prevWeek={prevWeek}
              nextWeek={nextWeek}
              countyGapNames={countyGapNames}
              aiText={commandAi.text}
              commandWarnings={commandWarnings}
              sources={sources}
              viewMode="week"
              hideTabNav
              showInnerMetricsStrip={false}
              templateChoices={templateChoices}
              workflowRunsForEvent={workflowRuns}
              assignUsers={owners}
              executionReadiness={executionReadiness}
            />
          ) : (
            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:divide-x xl:divide-kelly-text/10">
              <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-kelly-text/10 bg-kelly-page/20 xl:border-b-0">
                {centerBody}
              </div>
              <aside className="flex min-h-0 flex-col border-t border-kelly-text/10 bg-kelly-page/30 xl:max-w-[420px] xl:border-t-0">
                <div className="shrink-0 border-b border-kelly-text/10 px-2 py-1">
                  <p className={h2}>Event / day context</p>
                </div>
                {detail ? (
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <EventExecutionPanel
                      detail={detail}
                      checklist={ensureExecutionChecklist(detail.executionChecklistJson)}
                      health={computeEventHealthScore({
                        event: { ...detail, ownerUser: detail.ownerUser ?? null },
                        tasks: detail.tasks,
                        checklist: ensureExecutionChecklist(detail.executionChecklistJson),
                      })}
                      firstSourceId={firstSourceId}
                      readiness={executionReadiness!}
                      templateChoices={templateChoices}
                      workflowRuns={workflowRuns}
                      assignUsers={owners}
                    />
                  </div>
                ) : (
                  <p className="p-2 text-[10px] text-kelly-text/55">
                    Select an event (e.g. from Agenda, Month, or the Approvals board) to load prep, comms, checklists, and tasks in this rail. From Week view, the full
                    command center opens with the same panel.
                    <br />
                    <Link
                      className="mt-1 inline-block text-kelly-slate underline"
                      href={`/admin/workbench/calendar?${calendarFiltersToSearchParams(filters, { week: weekKey, view: "week", event: null, q: matrixQ })}`}
                    >
                      Open dense week view →
                    </Link>
                  </p>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

