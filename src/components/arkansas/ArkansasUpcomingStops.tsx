import Link from "next/link";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { arkansasPresenceCopy } from "@/content/county/arkansas-presence";
import { Button } from "@/components/ui/Button";

function formatPublicEventWhen(ev: PublicCampaignEvent): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: ev.timezone,
  });
  return fmt.format(ev.startAt);
}

type Props = {
  events: PublicCampaignEvent[];
};

export function ArkansasUpcomingStops({ events }: Props) {
  const copy = arkansasPresenceCopy.whereGoing;

  return (
    <section aria-labelledby="arkansas-upcoming">
      <h2 id="arkansas-upcoming" className="font-heading text-2xl font-bold text-kelly-text md:text-3xl">
        {copy.title}
      </h2>
      <p className="mt-2 max-w-2xl font-body text-base leading-relaxed text-kelly-text/80">{copy.lead}</p>

      {events.length === 0 ? (
        <p className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-text/[0.03] p-6 font-body text-sm text-kelly-text/80">
          {copy.empty}
        </p>
      ) : (
        <ul className="mt-8 space-y-4" role="list">
          {events.slice(0, 12).map((ev) => (
            <li
              key={ev.id}
              className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]"
            >
              <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-muted">
                {ev.county?.displayName ?? "Arkansas"} · {ev.eventTypeLabel}
              </p>
              <h3 className="mt-1 font-heading text-lg font-bold text-kelly-text">{ev.title}</h3>
              <p className="mt-2 font-body text-sm text-kelly-text/80">{formatPublicEventWhen(ev)}</p>
              {ev.locationName ? (
                <p className="mt-1 font-body text-sm text-kelly-muted">{ev.locationName}</p>
              ) : null}
              <Link
                href={ev.detailHref}
                className="mt-3 inline-block font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
              >
                Event details →
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Button href={copy.calendarHref} variant="outline">
          Full campaign calendar
        </Button>
      </div>
    </section>
  );
}
