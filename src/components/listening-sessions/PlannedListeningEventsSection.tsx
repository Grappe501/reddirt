import Link from "next/link";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import type { EventItem } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Apply to the listening-sessions page wrapper: pads each direct `section` (FullBleedSection) on the left
 * so copy clears the fixed rail while backgrounds stay full-width—bands scroll under the floating tiles.
 */
export const LISTENING_SESSIONS_FLOAT_SECTION_PAD =
  "[&>section]:lg:pl-[calc(1rem+14rem+1.25rem)] xl:[&>section]:lg:pl-[calc(1rem+15rem+1.5rem)]";

type PlannedListeningEventsSectionProps = {
  events: EventItem[];
  id?: string;
};

function formatEventTileWhen(ev: EventItem): { dateLine: string; timeLine: string } {
  const start = new Date(ev.startsAt);
  const tz = ev.timezone;
  const dateLine = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  }).format(start);
  const timeLine = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  }).format(start);
  return { dateLine, timeLine };
}

function PlannedEventNavTile({ event, className }: { event: EventItem; className?: string }) {
  const { dateLine, timeLine } = formatEventTileWhen(event);
  const href = event.detailHref ?? `/events/${event.slug}`;
  const label = `Open full details: ${event.title}`;

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "group flex aspect-square w-full flex-col justify-between rounded-lg border-2 border-kelly-text/15 bg-[var(--color-surface-elevated)] p-3.5 shadow-[var(--shadow-soft)] transition",
        "hover:border-kelly-navy/45 hover:shadow-md",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy",
        className,
      )}
    >
      <div className="min-h-0">
        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/90">Where</p>
        <p className="mt-1.5 line-clamp-4 font-heading text-[0.95rem] font-bold leading-snug text-kelly-text sm:text-base group-hover:text-kelly-navy">
          {event.locationLabel}
        </p>
      </div>
      <div className="shrink-0 border-t border-kelly-text/10 pt-2.5">
        <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/90">When</p>
        <p className="mt-1 font-body text-sm font-semibold text-kelly-text">{dateLine}</p>
        <p className="mt-0.5 font-body text-xs tabular-nums text-kelly-text/80">{timeLine}</p>
      </div>
    </Link>
  );
}

/**
 * Fixed, stationary square tiles on large screens; page content scrolls beneath (higher z-index + opaque panel).
 * Pair with `LISTENING_SESSIONS_FLOAT_SECTION_PAD` on the page wrapper (direct `section` children).
 */
export function ListeningSessionsFloatingEventNav({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <nav
      className="pointer-events-none fixed left-4 top-[calc(var(--site-header-shim,5rem)+1rem)] z-[45] hidden max-h-[calc(100dvh-var(--site-header-shim,5rem)-1.5rem)] w-56 flex-col lg:flex"
      aria-label="Planned tour stops"
    >
      <div
        className={cn(
          "pointer-events-auto flex max-h-full flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-xl border-2 border-kelly-text/15",
          "bg-kelly-page/95 p-3 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-kelly-page/88",
        )}
      >
        <p className="shrink-0 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-slate/90">
          Events planned
        </p>
        <div className="flex min-h-0 flex-col gap-3">
          {events.map((e) => (
            <PlannedEventNavTile key={e.slug} event={e} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export function PlannedListeningEventsSection({ events, id = "events-planned" }: PlannedListeningEventsSectionProps) {
  return (
    <FullBleedSection padY aria-labelledby="planned-events-heading" id={id}>
      <ContentContainer wide>
        <SectionHeading
          id="planned-events-heading"
          align="left"
          eyebrow="On the calendar"
          title="Events planned"
          subtitle="Scheduled stops on this tour. New official listening sessions join this list automatically when they’re on the calendar."
        />

        {events.length === 0 ? (
          <p className="mt-8 max-w-2xl rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] px-4 py-3 font-body text-sm text-kelly-text/80">
            Nothing in this curated list is upcoming yet—check the{" "}
            <Link href="/events" className="font-semibold text-kelly-navy underline">
              full events hub
            </Link>{" "}
            or raise your hand to{" "}
            <Link href="#your-town" className="font-semibold text-kelly-navy underline">
              host a session
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-kelly-text/85 lg:mt-10">
              On desktop, use the <strong>floating squares</strong> at left (place, date, time) to open each full event
              page. On mobile, tiles are below.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 lg:hidden" aria-label="Planned tour stops">
              {events.map((e) => (
                <PlannedEventNavTile key={e.slug} event={e} className="w-[13.5rem]" />
              ))}
            </div>
          </>
        )}

        <p className="mt-10 max-w-2xl font-body text-sm text-kelly-text/70">
          Prefer the map and filters?{" "}
          <Link href="/events" className="font-semibold text-kelly-slate underline">
            Browse all movement events
          </Link>
          .
        </p>
      </ContentContainer>
    </FullBleedSection>
  );
}
