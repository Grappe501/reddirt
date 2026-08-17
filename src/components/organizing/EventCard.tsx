"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { resolveEventStatus, stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { formatCountyFirstMeta, publicCountyEyebrow } from "@/lib/events/public-event-county";
import { eventCardActionHref, eventCardCtaLabel, eventCardTitleHref } from "@/lib/events/public-event-kind";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: EventItem;
  className?: string;
  highlighted?: boolean;
  onActivate?: () => void;
};

function locationIsTba(event: EventItem): boolean {
  if (event.statewideVirtual) return false;
  if (event.mapPinQuality === "region") return true;
  if (event.opsFlags?.missingCounty || event.opsFlags?.missingCoordinates) return true;
  if (!event.mapCoordinates) return true;
  const label = event.locationLabel.trim().toLowerCase();
  return label === "unknown" || label === "location tba" || label.includes("venue tba");
}

export function EventCard({ event, className, highlighted, onActivate }: EventCardProps) {
  const status = resolveEventStatus(event);
  const titleHref = eventCardTitleHref(event);
  const actionHref = eventCardActionHref(event);
  const actionExt = isExternalHref(actionHref);
  const titleExt = isExternalHref(titleHref);
  const tba = locationIsTba(event);
  return (
    <article
      id={`event-card-${event.slug}`}
      className={cn(
        "flex h-full flex-col justify-between rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-7 scroll-mt-28",
        highlighted && "ring-2 ring-kelly-navy/50 ring-offset-2 ring-offset-kelly-page",
        event.featured && "border-kelly-gold/55 ring-1 ring-kelly-gold/35",
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
            {publicCountyEyebrow(event)}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider",
              status === "upcoming"
                ? "border border-kelly-success/35 bg-kelly-success/12 text-kelly-text"
                : "border border-kelly-text/15 bg-kelly-text/[0.05] text-kelly-text/70",
            )}
          >
            {status === "upcoming" ? "Upcoming" : "Past"}
          </span>
          {tba ? (
            <span className="rounded-full border border-kelly-text/20 bg-kelly-text/[0.06] px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text/80">
              Location TBA
            </span>
          ) : null}
          {event.featured ? (
            <span className="rounded-full border border-kelly-gold/50 bg-kelly-gold/15 px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy">
              {event.featuredLabel ?? "Weekend highlight"}
            </span>
          ) : null}
        </div>
        <h3 className="mt-4 font-heading text-xl font-bold text-kelly-text lg:text-2xl">
          <Link
            href={titleHref}
            className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
            target={titleExt ? "_blank" : undefined}
            rel={titleExt ? "noopener noreferrer" : undefined}
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-2 font-body text-sm font-semibold text-kelly-text/70">{formatCountyFirstMeta(event)}</p>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">
          {stripPublicMarkdown(event.summary)}
        </p>
      </div>
      <Link
        href={actionHref}
        className="mt-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-kelly-navy"
        target={actionExt ? "_blank" : undefined}
        rel={actionExt ? "noopener noreferrer" : undefined}
      >
        {eventCardCtaLabel(event)}
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}
