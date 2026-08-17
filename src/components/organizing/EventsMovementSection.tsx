import type { EventItem } from "@/content/types";
import { EventStopCard } from "@/components/organizing/EventStopCard";
import { collapseRecurringSeriesToNextOccurrence } from "@/lib/events/collapse-recurring-series";
import { kellyNextStopsRoute } from "@/lib/events/kelly-next-stops-route";
import { compareEventsForHub, resolveEventStatus } from "@/lib/format/eventDisplay";

function isMovementListEvent(event: EventItem, now: Date): boolean {
  if (resolveEventStatus(event, now) !== "upcoming") return false;
  if (event.fieldAttendance === "tentative" || event.fieldAttendance === "suggested" || event.fieldAttendance === "unscheduled") {
    return false;
  }
  return event.campaignTrail === true || event.eventSource === "calendar" || event.statewideVirtual === true;
}

export function EventsMovementSection({ events }: { events: EventItem[] }) {
  const now = new Date();
  const upcoming = collapseRecurringSeriesToNextOccurrence(
    events.filter((e) => isMovementListEvent(e, now)).sort((a, b) => compareEventsForHub(a, b, now)),
  );
  const featured = upcoming.filter((e) => e.featured);
  const rest = upcoming.filter((e) => !e.featured);
  const routeLine = kellyNextStopsRoute(upcoming);

  return (
    <section aria-labelledby="events-movement-heading" className="space-y-8">
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Movement</p>
        <h2 id="events-movement-heading" className="mt-1 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
          Where Kelly will be next
        </h2>
        <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
          Confirmed public stops. Invite Kelly to bring one to your community.
        </p>
      </div>

      {routeLine ? (
        <aside className="rounded-card border border-kelly-text/10 bg-kelly-text/[0.03] p-5">
          <h3 className="font-heading text-base font-bold text-kelly-text">Kelly’s Next Stops</h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{routeLine}</p>
        </aside>
      ) : null}

      {featured.length ? (
        <aside className="space-y-4 rounded-card border-2 border-kelly-gold/50 bg-kelly-navy/[0.04] p-5">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">
              {featured[0]?.featuredLabel ?? "Weekend highlight"}
            </p>
            <h3 className="mt-1 font-heading text-xl font-bold text-kelly-text">Chickin-n-Politikin at Mount Nebo</h3>
            <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/80">
              {featured.find((e) => e.featuredSummary)?.featuredSummary ??
                "A special campaign weekend — details are on each event page."}
            </p>
          </div>
          <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
            {featured.map((e) => (
              <li key={e.slug}>
                <EventStopCard event={e} />
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      {rest.length ? (
        <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
          {rest.map((e) => (
            <li key={e.slug}>
              <EventStopCard event={e} />
            </li>
          ))}
        </ul>
      ) : upcoming.length ? null : (
        <p className="rounded-card border border-dashed border-kelly-text/20 px-4 py-6 font-body text-sm text-kelly-text/75">
          No confirmed upcoming stops on the public calendar yet. Invite Kelly or host a gathering.
        </p>
      )}
    </section>
  );
}
