import Link from "next/link";
import {
  createBlankDraftEventAction,
  refreshCalendarHqAction,
  slice1PublishQueueInfoAction,
} from "@/app/admin/calendar-hq-actions";
import { calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";

const btn =
  "whitespace-nowrap rounded border border-deep-soil/20 bg-white px-2 py-1 text-[10px] font-bold text-deep-soil shadow-sm hover:border-red-dirt/30 hover:bg-cream-canvas";

export function CalendarHqActionBar({
  filters,
  weekKey,
  view,
  eventId,
  matrixQ,
}: {
  filters: CalendarHqFilters;
  weekKey: string;
  view: string;
  eventId: string | null;
  /** Time-matrix quadrant filter (Q1–Q4), not a filter key collision */
  matrixQ: string | undefined;
}) {
  const back = (opts: { view: string; hash?: string }) => {
    const s = calendarFiltersToSearchParams(filters, { week: weekKey, view: opts.view, event: eventId, q: matrixQ });
    return opts.hash ? `/admin/workbench/calendar?${s}${opts.hash}` : `/admin/workbench/calendar?${s}`;
  };
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-deep-soil/10 bg-deep-soil/[0.06] px-2 py-1.5 md:px-3">
      <span className="text-[8px] font-bold uppercase tracking-wider text-deep-soil/45">Actions</span>
      <Link href="/admin/events" className={btn}>
        New event
      </Link>
      <form action={createBlankDraftEventAction} className="inline">
        <button type="submit" className={btn}>
          New draft event
        </button>
      </form>
      <Link href={back({ view: "week" })} className={btn}>
        Weekly planning
      </Link>
      <Link href={back({ view: "ribbon" })} className={btn}>
        Approvals board
      </Link>
      <form action={slice1PublishQueueInfoAction} className="inline">
        <button type="submit" className={btn} title="Counts approved, not public; full publish flow is per-event.">
          Publish public (queue)
        </button>
      </form>
      <form action={refreshCalendarHqAction} className="inline">
        <button type="submit" className={btn}>
          Refresh sync
        </button>
      </form>
      <Link href={back({ view: "week", hash: "#ai-briefing" })} className={btn}>
        AI briefing
      </Link>
    </div>
  );
}
