import type { EventItem } from "@/content/types";
import { EventStopCard } from "@/components/organizing/EventStopCard";
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
  const upcoming = events.filter((e) => isMovementListEvent(e, now)).sort((a, b) => compareEventsForHub(a, b, now));
  const routeLine = kellyNextStopsRoute(upcoming);

  return (
    <section aria-labelledby="events-movement-heading" className="space-y-8">
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Movement</p>
        <h2 id="events-movement-heading" className="mt-1 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
          Where Kelly will be next
        </h2>
        <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
          Confirmed public stops in Central Time, county first. Tentative dates appear on the map only until they are
          confirmed. When a stop ends, it leaves this list and — if it was an in-person appearance — the county joins the
          visited ledger on the next build.
        </p>
      </div>

      {routeLine ? (
        <aside className="rounded-card border border-kelly-text/10 bg-kelly-text/[0.03] p-5">
          <h3 className="font-heading text-base font-bold text-kelly-text">Kelly’s Next Stops</h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{routeLine}</p>
        </aside>
      ) : null}

      {upcoming.length ? (
        <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
          {upcoming.map((e) => (
            <li key={e.slug}>
              <EventStopCard event={e} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-kelly-text/20 px-4 py-6 font-body text-sm text-kelly-text/75">
          No confirmed upcoming stops on the public calendar yet. Invite Kelly or host a gathering.
        </p>
      )}
    </section>
  );
}
