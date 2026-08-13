import Link from "next/link";
import type { EventItem } from "@/content/types";
import { AUGUST_2026_CAMPAIGN_ROUTE } from "@/content/events/august-2026-campaign-stops";
import {
  compareEventsForHub,
  eventCalendarDayKey,
  formatEventWhen,
  resolveEventStatus,
} from "@/lib/format/eventDisplay";

type DayGroup = {
  key: string;
  heading: string;
  events: EventItem[];
};

function groupByDay(events: EventItem[]): DayGroup[] {
  const now = new Date();
  const upcoming = events
    .filter((e) => e.campaignTrail && resolveEventStatus(e, now) === "upcoming")
    .sort((a, b) => compareEventsForHub(a, b, now));

  const groups: DayGroup[] = [];
  for (const event of upcoming) {
    const key = eventCalendarDayKey(event);
    const when = formatEventWhen(event);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.events.push(event);
    } else {
      groups.push({ key, heading: when.primary, events: [event] });
    }
  }
  return groups;
}

function timeLine(event: EventItem): string {
  const when = formatEventWhen(event);
  if (event.opsFlags?.timeTbd) return "Time TBA";
  return when.secondary?.replace(/^[^·]+·\s*/, "") ?? "Time TBA";
}

export function UpcomingCampaignStops({ events }: { events: EventItem[] }) {
  const days = groupByDay(events);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">August 2026</p>
          <h2 id="upcoming-stops-heading" className="mt-1 font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Upcoming campaign stops
          </h2>
          <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
            Confirmed trail stops in Central Time. Open a stop for the detail page — venues and program notes land
            there as hosts confirm them. Travel-only days are not listed as public events.
          </p>
        </div>
        <p className="font-body text-xs text-kelly-text/65">
          <span className="font-bold uppercase tracking-wider text-kelly-success">Confirmed</span>
          {" — "}
          on the public calendar
        </p>
      </div>

      {days.length === 0 ? (
        <p
          className="mt-6 rounded-card border border-dashed border-kelly-text/20 bg-kelly-wash/60 px-4 py-4 font-body text-sm text-kelly-text/80"
          role="status"
        >
          No confirmed upcoming campaign stops on this list yet. Invite Kelly or host a gathering to open the next date.
        </p>
      ) : (
        <ol className="mt-8 space-y-8">
          {days.map((day) => (
            <li key={day.key}>
              <h3 className="font-heading text-lg font-bold text-kelly-text">{day.heading}</h3>
              <ul className="mt-3 divide-y divide-kelly-text/10 overflow-hidden rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)]">
                {day.events.map((event) => {
                  const href = event.detailHref ?? `/events/${event.slug}`;
                  return (
                    <li key={event.slug}>
                      <Link
                        href={href}
                        className="flex flex-col gap-1 px-4 py-4 transition hover:bg-kelly-navy/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-kelly-navy sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                      >
                        <span className="min-w-0">
                          <span className="block font-heading text-base font-bold text-kelly-text">{event.title}</span>
                          <span className="mt-1 block font-body text-sm text-kelly-text/70">{event.locationLabel}</span>
                        </span>
                        <span className="shrink-0 font-body text-sm font-semibold text-kelly-navy">
                          {timeLine(event)}
                          <span className="ml-2 font-semibold text-kelly-navy/80">Details →</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}

      <aside className="mt-10 rounded-card border border-kelly-text/10 bg-kelly-text/[0.03] p-5 md:p-6">
        <h3 className="font-heading text-base font-bold text-kelly-text">August route</h3>
        <p className="mt-1 font-body text-sm text-kelly-text/70">
          How the week strings together, including travel days that are not public stops.
        </p>
        <ul className="mt-4 grid list-none grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2">
          {AUGUST_2026_CAMPAIGN_ROUTE.map((row) => (
            <li key={row.date} className="font-body text-sm text-kelly-text/80">
              <span className="font-semibold text-kelly-text">{row.date}:</span> {row.line}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
