"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatEventWhen } from "@/lib/format/eventDisplay";
import { cn } from "@/lib/utils";
import { fairFieldCardClass, getFieldAttendance } from "@/lib/festivals/field-attendance-style";

type EventCardProps = {
  event: EventItem;
  className?: string;
  highlighted?: boolean;
  onActivate?: () => void;
};

export function EventCard({ event, className, highlighted, onActivate }: EventCardProps) {
  const when = formatEventWhen(event);
  const fairAtt = event.type === "Fairs and Festivals" ? getFieldAttendance(event) : null;
  const detailHref = event.detailHref ?? `/events/${event.slug}`;
  const ops = event.opsFlags;
  return (
    <article
      id={`event-card-${event.slug}`}
      className={cn(
        "flex h-full flex-col justify-between rounded-card p-6 shadow-[var(--shadow-soft)] md:p-7 scroll-mt-28",
        event.type === "Fairs and Festivals" && fairAtt
          ? fairFieldCardClass(fairAtt)
          : "border border-kelly-text/10 bg-[var(--color-surface-elevated)]",
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
          {fairAtt === "suggested" ? (
            <span className="rounded-full border border-amber-600/35 bg-amber-100/90 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text">
              Suggested route
            </span>
          ) : null}
          {fairAtt === "tentative" ? (
            <span className="rounded-full border border-blue-600/35 bg-blue-100/80 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text">
              Tentative
            </span>
          ) : null}
          {fairAtt === "confirmed" ? (
            <span className="rounded-full border border-kelly-success/45 bg-kelly-success/25 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text">
              Confirmed
            </span>
          ) : null}
          {event.eventSource === "calendar" ? (
            <span className="rounded-full border border-kelly-blue/35 bg-kelly-blue/10 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text">
              HQ calendar
            </span>
          ) : null}
          {event.mapPinQuality === "region" ? (
            <span className="rounded-full border border-kelly-text/20 bg-kelly-text/[0.06] px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text/80">
              Region pin
            </span>
          ) : null}
        </div>
        {ops && (ops.missingPublicSummary || ops.missingCounty) ? (
          <p className="mt-3 rounded-md border border-amber-200/80 bg-amber-50/90 px-2.5 py-1.5 font-body text-[11px] leading-snug text-amber-950/90">
            {ops.missingCounty ? "County TBA — pin uses region centroid. " : null}
            {ops.missingPublicSummary ? "Public summary not set — showing a short auto line." : null}
          </p>
        ) : null}
        <h3 className="mt-4 font-heading text-xl font-bold text-kelly-text lg:text-2xl">
          <Link href={detailHref} className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40">
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-kelly-text/70">{when.primary}</p>
        {when.secondary ? (
          <p className="mt-0.5 font-body text-sm text-kelly-text/70">{when.secondary}</p>
        ) : null}
        <p className="mt-1 font-body text-sm text-kelly-text/60">{event.locationLabel}</p>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">{event.summary}</p>
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
