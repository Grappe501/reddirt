import { EventWorkflowState } from "@prisma/client";
import { DEFAULT_CAMPAIGN_TZ } from "@/lib/calendar/weekly-time";
import { EVENT_STAGE_LABEL } from "@/lib/calendar/event-lifecycle";

const card =
  "rounded border border-deep-soil/10 bg-cream-canvas px-1.5 py-1 text-left text-[9px] shadow-sm min-w-0";
const h2 = "text-[7px] font-bold uppercase leading-tight text-deep-soil/50";

const RIBBON_ORDER: EventWorkflowState[] = [
  EventWorkflowState.DRAFT,
  EventWorkflowState.PENDING_APPROVAL,
  EventWorkflowState.APPROVED,
  EventWorkflowState.PUBLISHED,
  EventWorkflowState.CANCELED,
  EventWorkflowState.COMPLETED,
];

type Strip = Awaited<ReturnType<typeof import("@/lib/calendar/hq-command-data").getCommandStripMetrics>>;
type Summary = Awaited<ReturnType<typeof import("@/lib/calendar/hq-data").getCalendarHqSummary>>;

export function CalendarHqCommandStrip({ summary, strip, nowLabel }: { summary: Summary; strip: Strip; nowLabel: string }) {
  const wk = strip.weekStageCounts ?? {};
  const all = summary.stageCounts ?? {};
  return (
    <div className="border-b border-deep-soil/15 bg-cream-canvas/80">
      <div className="grid grid-cols-2 gap-0.5 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8">
        <div className={card}>
          <p className={h2}>Today / now</p>
          <p className="line-clamp-2 font-heading text-[10px] font-bold leading-tight text-deep-soil">{nowLabel}</p>
        </div>
        <div className={card}>
          <p className={h2}>Events today</p>
          <p className="font-heading text-base font-bold text-deep-soil">{summary.todayCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Next 7 days</p>
          <p className="font-heading text-base font-bold text-deep-soil">{summary.weekCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Approvals</p>
          <p className="font-heading text-base font-bold text-red-dirt">{summary.pendingApproval}</p>
        </div>
        <div className={card}>
          <p className={h2}>Conflicts (7d)</p>
          <p className="font-heading text-base font-bold text-deep-soil">{summary.conflictCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Canc. month</p>
          <p className="font-heading text-base font-bold text-deep-soil">{summary.cancellationsMonth}</p>
        </div>
        <div className={card}>
          <p className={h2}>Travel (week)</p>
          <p className="line-clamp-2 text-[8px] font-semibold text-deep-soil/85">{strip.travelLoad}</p>
        </div>
        <div className={card}>
          <p className={h2}>County gaps (45d)</p>
          <p className="font-heading text-base font-bold text-amber-900/90">{strip.countyGapCount}</p>
        </div>
        <div className={card}>
          <p className={h2}>Cal comms Q</p>
          <p className="font-heading text-base font-bold text-red-dirt">{summary.calendarCommsQueue}</p>
        </div>
        <div className={card}>
          <p className={h2}>Google sync</p>
          <p
            className={`font-heading text-base font-bold ${
              summary.googleSyncErrorCount && summary.googleSyncErrorCount > 0 ? "text-rose-800" : "text-field-green"
            }`}
          >
            {summary.googleSyncErrorCount} err
          </p>
          <p className="line-clamp-1 text-[7px] text-deep-soil/50">Slice 5 · TZ {DEFAULT_CAMPAIGN_TZ.split("/")[1]}</p>
        </div>
      </div>
      <div className="flex max-w-full gap-0.5 overflow-x-auto border-t border-deep-soil/8 px-1 pb-1 pt-0.5">
        <p className="shrink-0 self-center pr-1 text-[7px] font-bold uppercase text-deep-soil/45">Week (filtered)</p>
        {RIBBON_ORDER.map((s) => (
          <div
            key={s}
            className="shrink-0 min-w-[4.5rem] rounded border border-deep-soil/8 bg-white/80 px-1.5 py-0.5 text-left shadow-sm"
          >
            <p className="line-clamp-1 text-[6px] font-bold uppercase leading-tight text-deep-soil/50">{EVENT_STAGE_LABEL[s]}</p>
            <p className="font-heading text-sm font-bold leading-tight text-deep-soil">{wk[s] ?? 0}</p>
          </div>
        ))}
        <p className="shrink-0 self-center pl-1 text-[7px] font-bold uppercase text-deep-soil/45">| All (filters)</p>
        {RIBBON_ORDER.map((s) => (
          <div
            key={`g-${s}`}
            className="shrink-0 min-w-[4rem] rounded border border-deep-soil/5 bg-cream-canvas/60 px-1.5 py-0.5 text-left"
          >
            <p className="line-clamp-1 text-[6px] font-bold uppercase text-deep-soil/45">{EVENT_STAGE_LABEL[s]}</p>
            <p className="text-[10px] font-bold text-deep-soil/70">{all[s] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
