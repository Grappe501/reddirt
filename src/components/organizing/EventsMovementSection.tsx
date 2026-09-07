import type { EventItem } from "@/content/types";
import { EventStopCard } from "@/components/organizing/EventStopCard";
import { collapseRecurringSeriesToNextOccurrence } from "@/lib/events/collapse-recurring-series";
import { isPublicCalendarEvent } from "@/lib/events/campaign-approach";
import { publicEventConflictSlugs } from "@/lib/events/public-event-conflicts";
import { compareEventsForHub, resolveEventStatus } from "@/lib/format/eventDisplay";

function isMovementListEvent(event: EventItem, now: Date): boolean {
  try {
    if (resolveEventStatus(event, now) !== "upcoming") return false;
  } catch {
    return false;
  }
  return isPublicCalendarEvent(event);
}

export function EventsMovementSection({ events }: { events: EventItem[] }) {
  const now = new Date();
  const upcoming = collapseRecurringSeriesToNextOccurrence(
    events.filter((e) => isMovementListEvent(e, now)).sort((a, b) => compareEventsForHub(a, b, now)),
  );
  const featured = upcoming.filter((e) => e.featured);
  const rest = upcoming.filter((e) => !e.featured);
  const conflictSlugs = publicEventConflictSlugs(upcoming, now);

  return (
    <section aria-labelledby="events-movement-heading" className="space-y-8">
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Movement</p>
        <h2 id="events-movement-heading" className="mt-1 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
          Where Kelly will be next
        </h2>
        <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
          Public stops still ahead on the campaign calendar, including dated asks that are not locked yet. Invite Kelly to bring one to your community.
        </p>
        <p className="mt-3 font-body text-xs text-kelly-text/65">
          Color: navy confirmed · orange tentative · amber caution · red Kelly not attending · yellow same-day conflict.
          Corner letters: <span className="font-bold">M</span> Mobilize · <span className="font-bold">V</span> volunteers ·{" "}
          <span className="font-bold">D</span> driver · <span className="font-bold">T</span> table.
        </p>
      </div>

      {featured.length ? (
        <aside className="space-y-4 rounded-card border-2 border-kelly-gold/50 bg-kelly-navy/[0.04] p-5">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">
              {featured[0]?.featuredLabel ?? "Weekend highlight"}
            </p>
            <h3 className="mt-1 font-heading text-xl font-bold text-kelly-text">
              {featured[0]?.title ?? "Featured stop"}
            </h3>
            <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/80">
              {featured.find((e) => e.featuredSummary)?.featuredSummary ??
                "A special campaign weekend — details are on each event page."}
            </p>
          </div>
          <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
            {featured.map((e) => (
              <li key={e.slug}>
                <EventStopCard event={e} scheduleConflict={conflictSlugs.has(e.slug)} />
              </li>
            ))}
          </ul>
        </aside>
      ) : null}

      {rest.length ? (
        <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
          {rest.map((e) => (
            <li key={e.slug}>
              <EventStopCard event={e} scheduleConflict={conflictSlugs.has(e.slug)} />
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
