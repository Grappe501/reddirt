"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatCountyFirstMeta, publicCountyEyebrow } from "@/lib/events/public-event-county";
import { resolveEventStatus, stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { attendanceCtaLabel, attendanceIsOpenInvite } from "@/lib/events/public-event-kind";

export function EventStopCard({ event }: { event: EventItem }) {
  const status = resolveEventStatus(event);
  const href = event.detailHref ?? `/events/${event.slug}`;
  const open = attendanceIsOpenInvite(event.attendanceType);
  const summary = stripPublicMarkdown(event.summary).split(/(?<=\.)\s/)[0] ?? stripPublicMarkdown(event.summary);
  const tentative = event.fieldAttendance === "tentative";

  return (
    <article className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]">
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{publicCountyEyebrow(event)}</p>
      {tentative ? (
        <p className="mt-1 font-body text-[11px] font-bold uppercase tracking-wider text-kelly-text/60">Tentative</p>
      ) : null}
      <h3 className="mt-2 font-heading text-xl font-bold text-kelly-text">
        <Link href={href} className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40">
          {event.title}
        </Link>
      </h3>
      <p className="mt-1 font-body text-sm font-semibold text-kelly-text/75">{formatCountyFirstMeta(event)}</p>
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{summary}</p>
      {!open && status === "upcoming" && !event.statewideVirtual ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">Kelly will be in {event.city?.trim() || event.locationLabel}.</p>
      ) : null}
      <Link href={href} className="mt-4 inline-flex font-body text-sm font-semibold text-kelly-navy">
        {attendanceCtaLabel(event.attendanceType)} →
      </Link>
    </article>
  );
}
