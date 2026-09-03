"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatEventWhen } from "@/lib/format/eventDisplay";
import { isKellyNotAttending, KELLY_NOT_ATTENDING_COPY } from "@/lib/events/public-event-kind";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: EventItem;
  className?: string;
  highlighted?: boolean;
  onActivate?: () => void;
};

function locationIsTba(event: EventItem): boolean {
  if (event.mapPinQuality === "region") return true;
  if (event.opsFlags?.missingCounty || event.opsFlags?.missingCoordinates) return true;
  if (!event.mapCoordinates) return true;
  const label = event.locationLabel.trim().toLowerCase();
  return label === "unknown" || label === "location tba" || label.includes("venue tba");
}

export function EventCard({ event, className, highlighted, onActivate }: EventCardProps) {
  const when = formatEventWhen(event);
  const detailHref = event.detailHref ?? `/events/${event.slug}`;
  const tba = locationIsTba(event);
  const kellyNotAttending = isKellyNotAttending(event);
  return (
    <article
      id={`event-card-${event.slug}`}
      className={cn(
        "flex h-full flex-col justify-between rounded-card bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-7 scroll-mt-28",
        kellyNotAttending ? "border-2 border-red-600" : "border border-kelly-text/10",
        highlighted && "ring-2 ring-kelly-navy/50 ring-offset-2 ring-offset-kelly-page",
        onActivate && "cursor-pointer",
        className,
      )}
      onClick={(e) => {
        if (!onActivate) return;
        if ((e.target as HTMLElement).closest("a, button")) return;
        onActivate();
      }}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-kelly-navy/25 bg-kelly-navy/10 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text">
            {event.type}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider",
              event.status === "upcoming"
                ? "border border-kelly-success/35 bg-kelly-success/12 text-kelly-text"
                : "border border-kelly-text/15 bg-kelly-text/[0.05] text-kelly-text/70",
            )}
          >
            {event.status === "upcoming" ? "Upcoming" : "Past"}
          </span>
          {tba ? (
            <span className="rounded-full border border-kelly-text/20 bg-kelly-text/[0.06] px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text/80">
              Location TBA
            </span>
          ) : null}
          {kellyNotAttending ? (
            <span className="rounded-full border-2 border-red-600 bg-red-50 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-red-700">
              Kelly not attending
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold text-kelly-text lg:text-2xl">
          <Link
            href={detailHref}
            className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-kelly-text/70">{when.primary}</p>
        {when.secondary ? (
          <p className="mt-0.5 font-body text-sm text-kelly-text/70">{when.secondary}</p>
        ) : null}
        <p className="mt-1 font-body text-sm text-kelly-text/60">{event.locationLabel}</p>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">{event.summary}</p>
        {kellyNotAttending ? (
          <p className="mt-3 font-body text-sm text-kelly-text/70">{KELLY_NOT_ATTENDING_COPY}</p>
        ) : null}
      </div>
      <Link
        href={detailHref}
        className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-kelly-navy"
      >
        View details
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
