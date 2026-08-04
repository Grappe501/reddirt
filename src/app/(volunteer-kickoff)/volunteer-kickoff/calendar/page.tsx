"use client";

import { useMemo, useState } from "react";
import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import {
  CALENDAR_TABS,
  GRASSROOTS_GUITAR_STRINGS,
  KICKOFF_EVENTS,
  type KickoffCalendarTab,
} from "@/content/volunteer-kickoff/calendar";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffCalendarPage() {
  const [tab, setTab] = useState<KickoffCalendarTab>("tour");
  const events = useMemo(() => KICKOFF_EVENTS.filter((e) => e.tab === tab), [tab]);

  return (
    <SlideFrame eyebrow="Campaign calendar" title="Where We Are Going Next" speaker="Steve">
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        The most important upcoming stops—not the entire calendar. Volunteers help organize visits before
        Kelly arrives.
      </p>

      <div className="rounded-[var(--radius-premium-lg)] border border-[var(--kelly-official-gold)]/45 bg-white p-6 shadow-[var(--shadow-premium)]">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.14em] text-[var(--kelly-official-gold)]">
          Featured · {GRASSROOTS_GUITAR_STRINGS.shortDate}
        </p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-[var(--kelly-official-navy)]">
          {GRASSROOTS_GUITAR_STRINGS.title}
        </h2>
        <p className="mt-1 font-semibold text-[var(--color-text-primary)]">
          {GRASSROOTS_GUITAR_STRINGS.subtitle} · {GRASSROOTS_GUITAR_STRINGS.featuredArtist}
        </p>
        <p className="mt-3 text-[var(--color-secondary)]">
          {GRASSROOTS_GUITAR_STRINGS.city}, {GRASSROOTS_GUITAR_STRINGS.county} County · Attendance goal:{" "}
          {GRASSROOTS_GUITAR_STRINGS.attendanceGoal}. About one month to plan—we need a focused team now.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <KickoffCtaLink
            href={`${KICKOFF_BASE}/join/campaign?team=${GRASSROOTS_GUITAR_STRINGS.joinHrefTeam}`}
          >
            Join Rally Planning Team
          </KickoffCtaLink>
          <KickoffCtaLink
            href={`${KICKOFF_BASE}/join/local?event=${encodeURIComponent(GRASSROOTS_GUITAR_STRINGS.id)}`}
            variant="outline"
          >
            Help From My County
          </KickoffCtaLink>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Calendar windows">
        {CALENDAR_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "rounded-btn bg-[var(--kelly-official-navy)] px-4 py-2 text-sm font-bold text-white"
                : "rounded-btn border border-[var(--color-border-subtle)] bg-white px-4 py-2 text-sm font-semibold text-[var(--kelly-official-navy)]"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <KickoffCard key={event.id} title={event.title} accent={event.featured}>
            <p className="font-semibold text-[var(--kelly-official-navy)]">{event.dateLabel}</p>
            <p>
              {event.city} · {event.county} County
            </p>
            {event.detail ? <p>{event.detail}</p> : null}
            <p>Need: {event.volunteerNeed}</p>
            <a
              href={
                event.featured
                  ? `${KICKOFF_BASE}/join/campaign?team=${GRASSROOTS_GUITAR_STRINGS.joinHrefTeam}`
                  : `${KICKOFF_BASE}/join/local?event=${encodeURIComponent(event.id)}`
              }
              className="inline-flex pt-2 font-bold text-[var(--kelly-official-navy)] underline-offset-2 hover:underline"
            >
              Help With This Event
            </a>
          </KickoffCard>
        ))}
      </div>

      <KickoffCtaLink href={`${KICKOFF_BASE}/join/local`}>Help With an Upcoming Event</KickoffCtaLink>
    </SlideFrame>
  );
}
