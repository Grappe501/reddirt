import Link from "next/link";
import { CampaignEventType } from "@prisma/client";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import type { PublicEventListFilters } from "@/lib/calendar/public-event-types";
import { buildCalendarHref, type PublicCalendarSearchState, defaultCalMonthYmd } from "@/lib/calendar/public-calendar-url";
import { PublicCampaignEventCard } from "./PublicCampaignEventCard";
import { PublicCalendarMonthGrid } from "./PublicCalendarMonthGrid";

type CountyOpt = { slug: string; displayName: string };

function toQueryFilters(
  s: PublicCalendarSearchState
): { q: PublicEventListFilters; viewMonth: { year: number; month: number } | null } {
  const q: PublicEventListFilters = {
    range: s.range,
    eventType: s.type === "ALL" ? null : s.type,
    countySlug: s.county || null,
    venueMode: s.venue,
  };
  const [ys, mStr] = s.calMonth.split("-").map((p) => p.trim());
  const year = parseInt(ys ?? "", 10);
  const month = parseInt(mStr ?? "", 10);
  const viewMonth =
    s.view === "month" && !Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12
      ? { year, month }
      : null;
  if (viewMonth) {
    q.monthYear = viewMonth;
  }
  return { q, viewMonth };
}

export async function CampaignCalendarView({
  state,
  counties,
}: {
  state: PublicCalendarSearchState;
  counties: CountyOpt[];
}) {
  const { q, viewMonth } = toQueryFilters(state);
  const events = await queryPublicCampaignEvents(q, { take: 120 });

  const current = {
    view: state.view,
    range: state.range,
    county: state.county,
    type: state.type,
    venue: state.venue,
    calMonth: state.calMonth || defaultCalMonthYmd(),
  };

  return (
    <div className="min-w-0 space-y-6">
      <form method="get" className="flex flex-col gap-3 rounded-md border border-kelly-text/10 bg-kelly-page/50 p-3 md:flex-row md:flex-wrap md:items-end">
        {state.view === "month" ? <input type="hidden" name="view" value="month" /> : null}
        {state.view === "month" ? <input type="hidden" name="m" value={state.calMonth || defaultCalMonthYmd()} /> : null}
        <label className="flex min-w-[10rem] flex-1 flex-col text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">
          County
          <select
            name="county"
            defaultValue={state.county}
            className="mt-0.5 rounded border border-kelly-text/15 bg-white px-2 py-1.5 text-xs text-kelly-text"
          >
            <option value="">All counties</option>
            {counties.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[9rem] flex-1 flex-col text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">
          Event type
          <select
            name="type"
            defaultValue={state.type}
            className="mt-0.5 rounded border border-kelly-text/15 bg-white px-2 py-1.5 text-xs text-kelly-text"
          >
            <option value="ALL">All types</option>
            {Object.values(CampaignEventType).map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[9rem] flex-1 flex-col text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">
          When
          <select
            name="range"
            defaultValue={state.range}
            className="mt-0.5 rounded border border-kelly-text/15 bg-white px-2 py-1.5 text-xs text-kelly-text"
          >
            <option value="all_upcoming">All upcoming</option>
            <option value="this_week">This week</option>
            <option value="this_month">This calendar month</option>
          </select>
        </label>
        <label className="flex min-w-[8rem] flex-1 flex-col text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">
          Format
          <select
            name="venue"
            defaultValue={state.venue}
            className="mt-0.5 rounded border border-kelly-text/15 bg-white px-2 py-1.5 text-xs text-kelly-text"
          >
            <option value="all">All</option>
            <option value="in_person">In person</option>
            <option value="virtual">Virtual</option>
            <option value="unspecified">TBA</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-kelly-gold px-3 py-1.5 font-body text-sm font-semibold text-kelly-navy hover:brightness-105"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-kelly-text/10 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">
          {events.length} event{events.length === 1 ? "" : "s"} · CampaignOS, published &amp; public only
        </p>
        <div className="flex gap-1">
          <Link
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              state.view === "list" ? "bg-kelly-navy/15 text-kelly-text" : "text-kelly-text/70 hover:bg-kelly-text/5"
            }`}
            href={buildCalendarHref({ ...current, view: "list" })}
            prefetch={false}
          >
            List
          </Link>
          <Link
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              state.view === "month" ? "bg-kelly-navy/15 text-kelly-text" : "text-kelly-text/70 hover:bg-kelly-text/5"
            }`}
            href={buildCalendarHref({ ...current, view: "month", calMonth: state.calMonth || defaultCalMonthYmd() })}
            prefetch={false}
          >
            Month
          </Link>
        </div>
      </div>

      {state.view === "month" && viewMonth ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <PublicCalendarMonthGrid
            ymd={`${viewMonth.year}-${String(viewMonth.month).padStart(2, "0")}-01`}
            events={events}
            hrefForMonth={(nextY) => {
              const ym = nextY.slice(0, 7);
              return buildCalendarHref({ ...current, view: "month", calMonth: ym });
            }}
          />
          <div className="min-w-0 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">This month (list)</p>
            <ul className="space-y-3">
              {events.length === 0 ? (
                <li className="rounded-md border border-dashed border-kelly-text/15 p-4 text-sm text-kelly-text/65">
                  No public events in this view. Loosen filters or pick another month.
                </li>
              ) : (
                events.map((e) => (
                  <li key={e.id}>
                    <PublicCampaignEventCard event={e} emphasis="compact" />
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {events.length === 0 ? (
            <li className="rounded-md border border-dashed border-kelly-text/15 p-6 text-center">
              <p className="font-heading text-base font-semibold text-kelly-text">Nothing on the public schedule yet</p>
              <p className="mt-1 font-body text-sm text-kelly-text/65">
                When the campaign publishes events to the site, they&rsquo;ll show up here first—no extra calendar
                services required.
              </p>
            </li>
          ) : (
            events.map((e) => (
              <li key={e.id}>
                <PublicCampaignEventCard event={e} />
              </li>
            ))
          )}
        </ul>
      )}

      <p className="text-[10px] text-kelly-text/45">
        Internal briefings, drafts, and staff-only details never appear here. Canceled or completed items roll off
        automatically when staff update CampaignOS.
      </p>
    </div>
  );
}
