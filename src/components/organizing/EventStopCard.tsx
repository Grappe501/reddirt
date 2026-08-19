"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatCountyFirstMeta, publicCountyEyebrow } from "@/lib/events/public-event-county";
import { resolveEventStatus, stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { attendanceIsOpenInvite, eventCardCtaLabel, eventCardTitleHref } from "@/lib/events/public-event-kind";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";

function EventHref({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ext = isExternalHref(href);
  return (
    <Link
      href={href}
      className={className}
      target={ext ? "_blank" : undefined}
      rel={ext ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  );
}

export function EventStopCard({ event }: { event: EventItem }) {
  const status = resolveEventStatus(event);
  const titleHref = eventCardTitleHref(event);
  const open = attendanceIsOpenInvite(event.attendanceType);
  const summary = stripPublicMarkdown(event.summary).split(/(?<=\.)\s/)[0] ?? stripPublicMarkdown(event.summary);
  const tentative = event.fieldAttendance === "tentative";

  return (
    <EventHref
      href={titleHref}
      className={cn(
        "group flex h-full min-h-[8.5rem] flex-col rounded-lg border bg-[var(--color-surface-elevated)] p-3 shadow-sm transition hover:border-kelly-navy/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40",
        event.featured
          ? "border-2 border-kelly-gold/55"
          : "border border-kelly-text/10",
      )}
    >
      <p className="truncate font-body text-[10px] font-bold uppercase tracking-wider text-kelly-navy">
        {publicCountyEyebrow(event)}
      </p>
      {event.featured ? (
        <p className="mt-0.5 truncate font-body text-[10px] font-bold uppercase tracking-wider text-kelly-navy/90">
          {event.featuredLabel ?? "Weekend highlight"}
        </p>
      ) : null}
      {tentative ? (
        <p className="mt-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/60">Tentative</p>
      ) : null}
      <h3 className="mt-1.5 line-clamp-2 font-heading text-sm font-bold leading-snug text-kelly-text group-hover:text-kelly-navy">
        {event.title}
      </h3>
      <p className="mt-1 truncate font-body text-xs font-semibold text-kelly-text/75">{formatCountyFirstMeta(event)}</p>
      {summary ? (
        <p className="mt-1.5 line-clamp-2 font-body text-xs leading-relaxed text-kelly-text/70">{summary}</p>
      ) : null}
      {!open && status === "upcoming" && !event.statewideVirtual ? (
        <p className="mt-1 line-clamp-1 font-body text-xs text-kelly-text/65">
          Kelly will be in {event.city?.trim() || event.locationLabel}.
        </p>
      ) : null}
      <span className="mt-auto inline-flex pt-2 font-body text-xs font-semibold text-kelly-navy group-hover:underline">
        {eventCardCtaLabel(event)} →
      </span>
    </EventHref>
  );
}
