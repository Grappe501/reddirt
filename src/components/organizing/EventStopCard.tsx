"use client";

import Link from "next/link";
import type { EventItem } from "@/content/types";
import { formatEventWhen, resolveEventStatus, stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { attendanceCtaLabel, attendanceIsOpenInvite } from "@/lib/events/public-event-kind";
import { cn } from "@/lib/utils";

export function EventStopCard({ event }: { event: EventItem }) {
  const when = formatEventWhen(event);
  const status = resolveEventStatus(event);
  const href = event.detailHref ?? `/events/${event.slug}`;
  const city = event.city?.trim() || event.locationLabel;
  const open = attendanceIsOpenInvite(event.attendanceType);
  const summary = stripPublicMarkdown(event.summary).split(/(?<=\.)\s/)[0] ?? stripPublicMarkdown(event.summary);

  return (
    <article className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]">
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{when.primary}</p>
      <h3 className="mt-2 font-heading text-xl font-bold text-kelly-text">
        <Link href={href} className="hover:text-kelly-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-navy/40">
          {event.title}
        </Link>
      </h3>
      <p className="mt-1 font-body text-sm font-semibold text-kelly-text/75">
        {city}
        {event.opsFlags?.timeTbd ? " · Time TBA" : when.secondary ? ` · ${when.secondary.replace(/^[^·]+·\s*/, "")}` : null}
      </p>
      <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{summary}</p>
      {!open && status === "upcoming" ? (
        <p className="mt-3 font-body text-sm text-kelly-text/70">Kelly will be in {city}.</p>
      ) : null}
      <Link href={href} className="mt-4 inline-flex font-body text-sm font-semibold text-kelly-navy">
        {attendanceCtaLabel(event.attendanceType)} →
      </Link>
    </article>
  );
}
