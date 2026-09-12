"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import {
  formatEventDateHeadline,
  formatEventTimeHeadline,
  publicCountyEyebrow,
  publicEventCityLine,
} from "@/lib/events/public-event-county";
import { stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { EventMarksChips } from "@/components/organizing/EventMarksChips";
import { EventOpsLetters } from "@/components/organizing/EventOpsLetters";
import { EventSocialGraphic } from "@/components/organizing/EventSocialGraphic";
import { eventMarksCta } from "@/lib/events/event-marks";
import {
  eventBoardChromeClass,
  eventCardActionHref,
  eventCardCtaLabel,
  eventCardRelatedLinks,
  eventCardTitleHref,
  isCautionHold,
  isKellyNotAttending,
  CAUTION_HOLD_COPY,
  kellyNotAttendingCopy,
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
  const titleHref = eventCardTitleHref(event);
  const marksCta = eventMarksCta(event);
  const actionHref = marksCta?.href ?? eventCardActionHref(event);
  const ctaLabel = marksCta?.label ?? eventCardCtaLabel(event);
  const extraLinks = eventCardRelatedLinks(event, actionHref);
  const summary = stripPublicMarkdown(event.summary);
  const tentative = event.fieldAttendance === "tentative";
  const kellyNotAttending = isKellyNotAttending(event);
  const caution = isCautionHold(event);

  return (
    <article className={`relative rounded-card p-5 pr-16 shadow-[var(--shadow-soft)] ${eventBoardChromeClass(event, scheduleConflict)}`}>
      <EventOpsLetters event={event} />
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
      ) : event.fieldAttendance === "confirmed" ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-navy">Confirmed</p>
      ) : null}
      <p className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight text-kelly-ink md:text-3xl">
        {publicEventCityLine(event)}
      </p>
      <p className="mt-2 font-heading text-xl font-bold leading-snug text-kelly-navy md:text-2xl">
        {formatEventDateHeadline(event)}
      </p>
      <p className="mt-1 font-heading text-lg font-semibold text-kelly-text">{formatEventTimeHeadline(event)}</p>
      <h3 className="mt-4 font-heading text-lg font-bold text-kelly-text md:text-xl">
        <EventHref
          href={titleHref}
          className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40"
        >
          {event.title}
        </EventHref>
      </h3>
      {event.flyerSrc ? (
        <EventSocialGraphic
          src={event.flyerSrc}
          title={event.title}
          alt={event.flyerAlt}
          className="mt-3 overflow-hidden rounded-lg border border-kelly-navy/15 bg-white"
        />
      ) : null}
      {event.addressLine ? (
        <p className="mt-2 font-body text-sm leading-snug text-kelly-text/75">{event.addressLine}</p>
      ) : null}
      {event.publicContact ? <p className="mt-2 font-body text-sm font-semibold text-kelly-text/80">{event.publicContact}</p> : null}
      <EventMarksChips event={event} className="mt-3" />
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{summary}</p>
      {kellyNotAttending ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">{kellyNotAttendingCopy(event)}</p>
      ) : scheduleConflict ? (
        <p className="mt-3 font-body text-sm text-yellow-950">{SCHEDULE_CONFLICT_COPY}</p>
      ) : caution ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">{CAUTION_HOLD_COPY}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-2">
        <EventHref href={actionHref} className="inline-flex font-body text-sm font-semibold text-kelly-navy">
          {ctaLabel} →
        </EventHref>
        {extraLinks.map((link) => (
          <EventHref
            key={`${link.label}-${link.href}`}
            href={link.href}
            className="inline-flex font-body text-sm font-semibold text-kelly-navy/85"
          >
            {link.label} →
          </EventHref>
        ))}
      </div>
    </article>
  );
}
