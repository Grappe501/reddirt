"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatCountyFirstMeta, publicCountyEyebrow } from "@/lib/events/public-event-county";
import { resolveEventStatus, stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { EventMarksChips } from "@/components/organizing/EventMarksChips";
import { eventMarksCta } from "@/lib/events/event-marks";
import {
  attendanceIsOpenInvite,
  eventBoardChromeClass,
  eventCardActionHref,
  eventCardCtaLabel,
  eventCardTitleHref,
  isCautionHold,
  isKellyNotAttending,
  CAUTION_HOLD_COPY,
  KELLY_NOT_ATTENDING_COPY,
  SCHEDULE_CONFLICT_COPY,
} from "@/lib/events/public-event-kind";
import { isExternalHref } from "@/lib/href";

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

export function EventStopCard({
  event,
  scheduleConflict = false,
}: {
  event: EventItem;
  scheduleConflict?: boolean;
}) {
  const status = resolveEventStatus(event);
  const titleHref = eventCardTitleHref(event);
  const marksCta = eventMarksCta(event);
  const actionHref = marksCta?.href ?? eventCardActionHref(event);
  const ctaLabel = marksCta?.label ?? eventCardCtaLabel(event);
  const open = attendanceIsOpenInvite(event.attendanceType);
  const summary = stripPublicMarkdown(event.summary).split(/(?<=\.)\s/)[0] ?? stripPublicMarkdown(event.summary);
  const tentative = event.fieldAttendance === "tentative";
  const kellyNotAttending = isKellyNotAttending(event);
  const caution = isCautionHold(event);

  return (
    <article className={`rounded-card p-5 shadow-[var(--shadow-soft)] ${eventBoardChromeClass(event, scheduleConflict)}`}>
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{publicCountyEyebrow(event)}</p>
      {event.featured ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy">
          {event.featuredLabel ?? "Weekend highlight"}
        </p>
      ) : null}
      {kellyNotAttending ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-red-700">Kelly not attending</p>
      ) : scheduleConflict ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-yellow-950">Conflict</p>
      ) : caution ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-amber-800">Caution</p>
      ) : tentative ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-orange-800">Tentative</p>
      ) : null}
      <h3 className="mt-2 font-heading text-xl font-bold text-kelly-text">
        <EventHref
          href={titleHref}
          className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
        >
          {event.title}
        </EventHref>
      </h3>
      <p className="mt-1 font-body text-sm font-semibold text-kelly-text/75">{formatCountyFirstMeta(event)}</p>
      <EventMarksChips event={event} className="mt-3" />
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{summary}</p>
      {kellyNotAttending ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">{KELLY_NOT_ATTENDING_COPY}</p>
      ) : scheduleConflict ? (
        <p className="mt-3 font-body text-sm text-yellow-950">{SCHEDULE_CONFLICT_COPY}</p>
      ) : caution ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">{CAUTION_HOLD_COPY}</p>
      ) : !open && status === "upcoming" && !event.statewideVirtual ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">Kelly will be in {event.city?.trim() || event.locationLabel}.</p>
      ) : null}
      <EventHref href={actionHref} className="mt-4 inline-flex font-body text-sm font-semibold text-kelly-navy">
        {ctaLabel} →
      </EventHref>
    </article>
  );
}
