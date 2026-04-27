import Link from "next/link";
import { EventReadinessStatus, type CampaignEvent, type User, type CalendarSource, TimeMatrixQuadrant } from "@prisma/client";
import type { CalendarHqEventDetail } from "@/lib/calendar/hq-data";
import { addCalendarDays, ROLE_STRIP_KEYS } from "@/lib/calendar/weekly-time";
import { DEFAULT_CAMPAIGN_TZ } from "@/lib/calendar/weekly-time";
import { createDraftEventInSlotAction } from "@/app/admin/calendar-hq-actions";
import { calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";
type CommandStripMetrics = Awaited<ReturnType<typeof import("@/lib/calendar/hq-command-data").getCommandStripMetrics>>;
import { removeWeeklyBigRockAction, addWeeklyBigRockAction, updateWeeklyPlanAction } from "@/app/admin/calendar-hq-actions";
import { EventExecutionPanel } from "./EventExecutionPanel";
import { ensureExecutionChecklist, computeEventHealthScore } from "@/lib/calendar/event-intelligence";
import { computeEventExecutionReadiness } from "@/lib/calendar/event-readiness";
import { EVENT_STAGE_LABEL } from "@/lib/calendar/event-lifecycle";
import { buildEventCommsChips } from "@/lib/calendar/event-comms-surface";

const h2 = "font-heading text-[9px] font-bold uppercase tracking-wider text-kelly-text/50";
const card = "rounded border border-kelly-text/10 bg-kelly-page px-1.5 py-1 text-left text-[10px] shadow-sm min-w-0";

const QStyle: Record<string, string> = {
  Q1: "bg-red-800/20 text-red-900 border-red-800/30",
  Q2: "bg-kelly-success/20 text-kelly-success/95 border-kelly-success/40",
  Q3: "bg-amber-200/50 text-amber-950 border-amber-800/30",
  Q4: "bg-kelly-text/10 text-kelly-text/70 border-kelly-text/20",
};

type WeekEvent = CampaignEvent & {
  county: { displayName: string; id: string } | null;
  ownerUser: Pick<User, "id" | "name" | "email"> | null;
  calendarSource: {
    id: string;
    label: string;
    color: string | null;
    displayName: string | null;
    sourceType: import("@prisma/client").CalendarSourceType;
    isPublicFacing: boolean;
  } | null;
} & {
  lastReminderSentAt: Date | null;
  nextReminderDueAt: Date | null;
  lastAttendeeNoticeAt: Date | null;
  lastCancellationNoticeAt: Date | null;
  thankYouQueuedAt: Date | null;
  reminderPlanStatus: EventReadinessStatus;
  attendeeCommsStatus: EventReadinessStatus;
  followupCommsStatus: EventReadinessStatus;
};

type PlanWithRocks = Awaited<ReturnType<typeof import("@/lib/calendar/hq-command-data").getOrCreateWeeklyPlan>>;

function calUrl(
  filters: CalendarHqFilters,
  weekKey: string,
  defaultMatrix: string | undefined,
  opts: { view?: string; event?: string | null; week?: string; matrixQ?: string | "ALL" }
) {
  let q: string | undefined;
  if (opts.matrixQ === "ALL") q = undefined;
  else if (opts.matrixQ !== undefined) q = opts.matrixQ || undefined;
  else q = defaultMatrix;
  return `/admin/workbench/calendar?${calendarFiltersToSearchParams(filters, {
    week: opts.week ?? weekKey,
    view: opts.view ?? "week",
    event: opts.event ?? undefined,
    q,
  })}`;
}

function ymdInChicago(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: DEFAULT_CAMPAIGN_TZ, year: "numeric", month: "2-digit", day: "2-digit" });
}

function timeShort(d: Date) {
  return d.toLocaleTimeString("en-US", { timeZone: DEFAULT_CAMPAIGN_TZ, hour: "numeric", minute: "2-digit" });
}

function buildDayBuckets(events: WeekEvent[]) {
  const m = new Map<string, WeekEvent[]>();
  for (const e of events) {
    const k = ymdInChicago(e.startAt);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(e);
  }
  for (const list of m.values()) {
    list.sort((a, b) => +a.startAt - +b.startAt);
  }
  return m;
}

export async function CalendarCommandView({
  weekKey,
  matrixQ,
  filters,
  plan,
  detail,
  strip,
  weekEvents,
  prevWeek,
  nextWeek,
  countyGapNames,
  aiText,
  commandWarnings,
  sources,
  viewMode,
  hideTabNav,
  showInnerMetricsStrip = true,
  templateChoices = [],
  workflowRunsForEvent = [],
  assignUsers = [],
  executionReadiness = null,
}: {
  weekKey: string;
  matrixQ: string | undefined;
  filters: CalendarHqFilters;
  plan: PlanWithRocks;
  detail: CalendarHqEventDetail | null;
  strip: CommandStripMetrics;
  weekEvents: WeekEvent[];
  prevWeek: string;
  nextWeek: string;
  countyGapNames: string[];
  aiText: string;
  commandWarnings: { q2low: boolean; tooReactive: boolean };
  sources: Pick<CalendarSource, "id" | "label" | "color" | "isActive">[];
  viewMode: string;
  /** When false, only render command (used when wrapping with outer tab nav) */
  hideTabNav?: boolean;
  showInnerMetricsStrip?: boolean;
  templateChoices?: Awaited<ReturnType<typeof import("@/lib/calendar/hq-data").listEventWorkflowTemplateChoices>>;
  workflowRunsForEvent?: Awaited<ReturnType<typeof import("@/lib/calendar/hq-data").listWorkflowRunsForEvent>>;
  assignUsers?: Array<{ id: string; name: string | null; email: string | null }>;
  executionReadiness?: ReturnType<typeof computeEventExecutionReadiness> | null;
}) {
  const quadrant: TimeMatrixQuadrant | "ALL" =
    matrixQ && ["Q1", "Q2", "Q3", "Q4"].includes(matrixQ) ? (matrixQ as TimeMatrixQuadrant) : "ALL";
  const byDay = buildDayBuckets(weekEvents);
  const dayYmds = Array.from({ length: 7 }, (_, i) => addCalendarDays(weekKey, i));
  const matrix = strip.matrix;
  const rc = (plan.roleCommitmentsJson as Record<string, string> | null) ?? {};
  const weekRangeLabel = dayYmds.length ? `${dayYmds[0]} – ${dayYmds[6]}` : weekKey;
  const draftReturnSearch = calendarFiltersToSearchParams(filters, { week: weekKey, view: "week", q: matrixQ });

  return (
    <div className="flex min-h-0 w-full min-w-0 max-w-[1920px] flex-1 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-kelly-text/15 bg-gradient-to-r from-kelly-page via-kelly-page to-kelly-wash/30 px-2 py-2 md:px-3">
        <div className="min-w-0">
          <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-kelly-navy/90">Week command</p>
          <h2 className="font-heading text-lg font-bold leading-tight text-kelly-text md:text-xl">
            {weekRangeLabel}
          </h2>
          <p className="mt-0.5 max-w-3xl text-[10px] text-kelly-text/60">
            Mission-led execution. Big rocks, matrix quadrants, and event intelligence — same data model as Google sync.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <Link href={calUrl(filters, weekKey, matrixQ, { week: prevWeek })} className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 font-bold">
            ← Week
          </Link>
          <Link href={calUrl(filters, weekKey, matrixQ, { week: nextWeek })} className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 font-bold">
            Week →
          </Link>
          <Link
            className="rounded border border-kelly-text/15 bg-white px-2 py-0.5"
            href="/admin/workbench"
          >
            Workbench
          </Link>
        </div>
      </div>

      {!hideTabNav ? (
        <div className="flex flex-wrap gap-0.5 border-b border-kelly-text/10 bg-kelly-text/[0.04] px-1 py-1">
            {(
              [
                ["week", "Week"],
                ["ribbon", "Board"],
                ["agenda", "Agenda"],
                ["queue", "Comms"],
                ["analytics", "Analytics"],
              ] as const
            ).map(([v, label]) => (
            <Link
              key={v}
              href={calUrl(filters, weekKey, matrixQ, { view: v })}
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                (viewMode === v || (v === "week" && (viewMode === "command" || viewMode === "week"))) ? "bg-kelly-text text-kelly-page" : "bg-white text-kelly-text/70"
              }`}
            >
              {label}
            </Link>
            ))}
        </div>
      ) : null}

      {commandWarnings.q2low || commandWarnings.tooReactive ? (
        <div className="border-b border-amber-800/30 bg-amber-50/90 px-2 py-1 text-[10px] text-amber-950 md:px-3">
          {commandWarnings.q2low ? "Time matrix: Q2 (important, not urgent) is below 25% of this week’s scheduled time. Protect big rocks. " : null}
          {commandWarnings.tooReactive ? "Schedule looks reactive: high Q1+Q3 time — reserve blocks for planning and follow-through." : null}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:divide-x xl:divide-kelly-text/10">
        <div className="flex min-w-0 flex-col overflow-hidden">
          <div className="shrink-0 space-y-2 border-b border-kelly-text/10 p-2 md:px-3">
            <form action={updateWeeklyPlanAction} className="space-y-1.5">
              <input type="hidden" name="weekKey" value={weekKey} />
              <p className={h2}>Weekly mission & outcomes</p>
              <input
                name="missionStatement"
                defaultValue={plan.missionStatement ?? ""}
                className="w-full border-b border-kelly-text/20 bg-transparent text-[12px] font-heading font-bold text-kelly-text placeholder:text-kelly-text/35"
                placeholder="This week we win by…"
              />
              <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
                <input
                  name="outcome1"
                  defaultValue={plan.outcome1 ?? ""}
                  className="border border-kelly-text/10 bg-white px-1.5 py-0.5 text-[10px]"
                  placeholder="Outcome 1 (measurable)"
                />
                <input
                  name="outcome2"
                  defaultValue={plan.outcome2 ?? ""}
                  className="border border-kelly-text/10 bg-white px-1.5 py-0.5 text-[10px]"
                  placeholder="Outcome 2"
                />
                <input
                  name="outcome3"
                  defaultValue={plan.outcome3 ?? ""}
                  className="border border-kelly-text/10 bg-white px-1.5 py-0.5 text-[10px]"
                  placeholder="Outcome 3"
                />
              </div>
              <p className={h2}>Role commitments (visible all week)</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
                {ROLE_STRIP_KEYS.map((r) => (
                  <label key={r.key} className="block min-w-0">
                    <span className="text-[8px] font-bold uppercase text-kelly-text/40">{r.label}</span>
                    <input
                      name={`role_${r.key}`}
                      defaultValue={rc[r.key] ?? ""}
                      className="mt-0.5 w-full border border-kelly-text/10 bg-white px-1 py-0.5 text-[9px]"
                      placeholder="Commitment"
                    />
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="rounded border border-kelly-text/25 bg-kelly-text px-2 py-0.5 text-[9px] font-bold text-kelly-page"
              >
                Save week plan
              </button>
            </form>
          </div>

          <div className="shrink-0 border-b border-kelly-text/10 p-2 md:px-3">
            <p className={h2}>Big rocks (3–5 protected priorities)</p>
            <p className="text-[9px] text-kelly-text/50">Pinned in the week before low-quadrant noise. Link an event to show as a protected block in the grid.</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {plan.bigRocks.map((r) => (
                <li
                  key={r.id}
                  className="flex min-w-0 max-w-full items-center gap-1.5 rounded border-2 border-amber-800/50 bg-amber-50/80 px-2 py-0.5 text-[9px] font-bold text-amber-950"
                >
                  <span className="truncate">
                    {r.event ? r.event.title : r.title}
                    {r.eventId ? " · linked" : ""}
                  </span>
                  <form action={removeWeeklyBigRockAction} className="shrink-0">
                    <input type="hidden" name="bigRockId" value={r.id} />
                    <button type="submit" className="text-[8px] font-bold uppercase text-red-900/80">
                      remove
                    </button>
                  </form>
                </li>
              ))}
              {plan.bigRocks.length === 0 ? <li className="text-[9px] text-kelly-text/40">No big rocks set yet.</li> : null}
            </ul>
            {plan.bigRocks.length < 5 ? (
              <form action={addWeeklyBigRockAction} className="mt-1 flex flex-wrap items-end gap-1">
                <input type="hidden" name="weekKey" value={weekKey} />
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] text-kelly-text/40">Title</span>
                  <input name="title" className="w-full border border-kelly-text/15 bg-white px-1.5 text-[9px]" placeholder="Voter reg push · Tulsa" />
                </div>
                <div>
                  <span className="text-[8px] text-kelly-text/40">Link event (optional)</span>
                  <select name="eventId" className="min-w-[120px] border border-kelly-text/15 bg-white text-[9px]">
                    <option value="">—</option>
                    {weekEvents.map((e) => (
                      <option key={e.id} value={e.id}>
                        {timeShort(e.startAt)} {e.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="shrink-0 rounded bg-kelly-text px-2 py-1 text-[9px] font-bold text-kelly-page">
                  Add
                </button>
              </form>
            ) : null}
          </div>

          <div className="shrink-0 border-b border-kelly-text/10 px-2 py-1.5 md:px-3">
            <p className={h2}>Time matrix (this week, by duration)</p>
            {matrix.totalH > 0 ? (
              <div className="mt-1">
                <div className="flex h-2 w-full max-w-2xl overflow-hidden rounded border border-kelly-text/10">
                  {(["Q1", "Q2", "Q3", "Q4"] as const).map((k) => {
                    const h = matrix[k] ?? 0;
                    const w = (h / matrix.totalH) * 100;
                    return w > 0 ? (
                      <div key={k} className={QStyle[k] ?? "bg-gray-200"} style={{ width: `${w}%` }} title={`${k}: ${h.toFixed(1)}h`} />
                    ) : null;
                  })}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-[9px] text-kelly-text/75">
                  {(["Q1", "Q2", "Q3", "Q4"] as const).map((k) => (
                    <span key={k}>
                      {k} {((matrix[k] / matrix.totalH) * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[9px] text-kelly-text/50">No events in week — set quadrant on events to see the mix.</p>
            )}
            <p className="mt-1 text-[9px] text-kelly-text/50">
              Filter grid:{" "}
              {(["ALL", "Q1", "Q2", "Q3", "Q4"] as const).map((qk) => (
                <Link
                  key={qk}
                  href={calUrl(filters, weekKey, matrixQ, { matrixQ: qk === "ALL" ? "ALL" : qk })}
                  className={`mr-1 font-bold ${
                    (quadrant === qk) || (qk === "ALL" && quadrant === "ALL")
                      ? "text-kelly-navy underline"
                      : "text-kelly-slate"
                  }`}
                >
                  {qk}
                </Link>
              ))}
            </p>
            {countyGapNames.length > 0 ? (
              <p className="mt-1 text-[9px] text-amber-900/80">
                County gaps (no event in 45d): {countyGapNames.join(", ")}
                {countyGapNames.length >= 6 ? "…" : ""}
              </p>
            ) : null}
          </div>

          {showInnerMetricsStrip ? (
          <div className="grid grid-cols-2 gap-0.5 border-b border-kelly-text/10 bg-kelly-text/[0.02] p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8">
            <div className={card}>
              <p className={h2}>Review queue</p>
              <p className="font-heading text-base font-bold text-kelly-navy">{strip.pendingApproval}</p>
            </div>
            <div className={card}>
              <p className={h2}>Conflicts</p>
              <p className="font-heading text-base font-bold text-kelly-text">{strip.conflicts}</p>
            </div>
            <div className={card}>
              <p className={h2}>Cancels (7d)</p>
              <p className="font-heading text-base font-bold text-kelly-text">{strip.cancellWeek}</p>
            </div>
            <div className={card}>
              <p className={h2}>Travel load</p>
              <p className="line-clamp-2 text-[9px] font-semibold leading-tight text-kelly-text/85">{strip.travelLoad}</p>
            </div>
            <div className={card}>
              <p className={h2}>Co. gaps</p>
              <p className="font-heading text-base font-bold text-kelly-text">{strip.countyGapCount}</p>
            </div>
            <div className={card}>
              <p className={h2}>Sources</p>
              <p className="text-[9px] font-bold text-kelly-text/80">
                {sources
                  .filter((s) => s.isActive)
                  .map((s) => s.label)
                  .join(", ") || "—"}
              </p>
            </div>
            <div className={card}>
              <p className={h2}>Heavy days</p>
              <p className="line-clamp-2 text-[9px] text-kelly-text/75">{strip.overpacked[0] ?? "—"}</p>
            </div>
            <div className={card}>
              <p className={h2}>Week hours</p>
              <p className="font-heading text-base font-bold text-kelly-text">~{matrix.totalH.toFixed(1)}h</p>
            </div>
          </div>
          ) : null}

          <div className="min-h-[280px] min-w-0 flex-1 overflow-x-auto p-1 md:p-2">
            <p className={h2 + " mb-1 px-0.5"}>Week grid</p>
            <div className="grid min-w-[900px] grid-cols-7 gap-0.5 border border-kelly-text/10">
              {dayYmds.map((ymd) => {
                const list = byDay.get(ymd) ?? [];
                const d = new Date(ymd + "T12:00:00.000Z");
                const dayName = d.toLocaleDateString("en-US", { timeZone: DEFAULT_CAMPAIGN_TZ, weekday: "short" });
                return (
                  <div key={ymd} className="flex min-w-0 flex-col border-l border-kelly-text/10 bg-white/90 first:border-l-0">
                    <div className="sticky top-0 border-b border-kelly-text/10 bg-kelly-text/90 px-1 py-0.5 text-center">
                      <p className="text-[9px] font-bold text-kelly-page">{dayName}</p>
                      <p className="text-[8px] text-kelly-page/80">{ymd}</p>
                    </div>
                    <ul className="space-y-0.5 p-0.5">
                      {list.map((e) => {
                        const br = e.isBigRock || plan.bigRocks.some((b) => b.eventId === e.id);
                        const atR = [e.commsReadiness, e.staffingReadiness, e.prepReadiness, e.followupReadiness].some(
                          (x) => x === EventReadinessStatus.AT_RISK
                        );
                        const commsCh = buildEventCommsChips({
                          eventWorkflowState: e.eventWorkflowState,
                          commsReadiness: e.commsReadiness,
                          startAt: e.startAt,
                          endAt: e.endAt,
                          lastReminderSentAt: e.lastReminderSentAt,
                          nextReminderDueAt: e.nextReminderDueAt,
                          lastAttendeeNoticeAt: e.lastAttendeeNoticeAt,
                          lastCancellationNoticeAt: e.lastCancellationNoticeAt,
                          thankYouQueuedAt: e.thankYouQueuedAt,
                          reminderPlanStatus: e.reminderPlanStatus,
                          followupCommsStatus: e.followupCommsStatus,
                        });
                        return (
                          <li key={e.id}>
                            <Link
                              href={calUrl(filters, weekKey, matrixQ, { event: e.id })}
                              className={`block rounded border px-0.5 py-0.5 text-[9px] leading-tight transition hover:border-kelly-navy/40 ${
                                br
                                  ? "border-l-4 border-l-amber-800 bg-amber-50/60 border-amber-800/20"
                                  : atR
                                    ? "border-rose-800/40 bg-rose-50/50 border-kelly-text/10"
                                    : "border-kelly-text/10 bg-kelly-page/30"
                              }`}
                            >
                              <span className="mr-0.5 rounded bg-kelly-text/10 px-0.5 text-[7px] font-bold text-kelly-text/80" title={e.eventWorkflowState}>
                                {EVENT_STAGE_LABEL[e.eventWorkflowState]}
                              </span>
                              {commsCh.map((c) => (
                                <span
                                  key={c.key}
                                  className={`mr-0.5 rounded px-0.5 text-[6px] font-bold ${c.className}`}
                                  title={c.short}
                                >
                                  {c.short}
                                </span>
                              ))}
                              {atR ? <span className="mr-0.5 text-[7px] font-bold text-rose-800">RISK</span> : null}
                              <span className="text-kelly-text/45">{timeShort(e.startAt)}</span>{" "}
                              <span className={`inline-block rounded border px-0.5 text-[8px] font-bold ${QStyle[e.timeMatrixQuadrant]}`}>
                                {e.timeMatrixQuadrant}
                              </span>
                              {e.calendarSource?.color ? (
                                <span
                                  className="ml-0.5 inline-block h-2 w-2 rounded-sm align-middle"
                                  style={{ backgroundColor: e.calendarSource.color }}
                                  title={e.calendarSource.displayName || e.calendarSource.label}
                                />
                              ) : null}
                              <span className="ml-0.5 font-semibold text-kelly-text">{e.title}</span>
                              {e.county ? <span className="ml-0.5 text-[8px] text-kelly-slate"> · {e.county.displayName}</span> : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    {list.length === 0 ? <p className="p-1 text-[8px] text-kelly-text/40">—</p> : null}
                    <form action={createDraftEventInSlotAction} className="border-t border-kelly-text/10 p-0.5">
                      <input type="hidden" name="returnSearch" value={draftReturnSearch} />
                      <input type="hidden" name="ymd" value={ymd} />
                      <input type="hidden" name="weekKey" value={weekKey} />
                      <button type="submit" className="w-full rounded border border-dashed border-kelly-text/25 py-0.5 text-[8px] font-bold text-kelly-text/70 hover:border-kelly-navy/30">
                        + Draft slot
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <aside className="flex min-h-0 min-w-0 flex-col border-t border-kelly-text/10 bg-kelly-wash/20 xl:max-w-[360px] xl:border-t-0">
          {detail ? (
            <EventExecutionPanel
              detail={detail}
              checklist={ensureExecutionChecklist(detail.executionChecklistJson)}
              health={computeEventHealthScore({
                event: { ...detail, ownerUser: detail.ownerUser ?? null },
                tasks: detail.tasks,
                checklist: ensureExecutionChecklist(detail.executionChecklistJson),
              })}
              firstSourceId={sources[0]?.id ?? null}
              readiness={
                executionReadiness ??
                computeEventExecutionReadiness({ event: detail, tasks: detail.tasks })
              }
              templateChoices={templateChoices}
              workflowRuns={workflowRunsForEvent}
              assignUsers={assignUsers}
            />
          ) : (
            <div className="p-2 text-[10px] text-kelly-text/55">
              <p className="font-heading text-xs font-bold text-kelly-text">No event selected</p>
              <p className="mt-1">Select an event in the week grid to load prep, comms, staffing, and follow-up.</p>
            </div>
          )}
          <div id="ai-briefing" className="shrink-0 border-t border-kelly-text/10 bg-kelly-text/[0.03] p-2">
            <p className={h2}>AI command briefing</p>
            <pre className="mt-0.5 max-h-56 overflow-y-auto whitespace-pre-wrap font-body text-[9px] leading-relaxed text-kelly-text/88">
              {aiText}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}

