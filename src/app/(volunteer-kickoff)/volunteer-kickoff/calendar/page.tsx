"use client";

import { useMemo, useState } from "react";
import { KickoffCard, KickoffCtaLink, SlideFrame } from "@/components/volunteer-kickoff/SlideChrome";
import {
  CALENDAR_TABS,
  KICKOFF_EVENTS,
  type KickoffCalendarTab,
} from "@/content/volunteer-kickoff/calendar";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";

export default function KickoffCalendarPage() {
  const [tab, setTab] = useState<KickoffCalendarTab>("next14");
  const events = useMemo(() => KICKOFF_EVENTS.filter((e) => e.tab === tab), [tab]);

  return (
    <SlideFrame eyebrow="Campaign calendar" title="Where We Are Going Next" speaker="Steve">
      <p className="max-w-3xl text-lg text-[var(--color-text-primary)]">
        The most important upcoming stops—not the entire calendar. Volunteers help organize visits before
        Kelly arrives.
      </p>

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
          <KickoffCard key={event.id} title={event.title}>
            <p className="font-semibold text-[var(--kelly-official-navy)]">{event.dateLabel}</p>
            <p>
              {event.city} · {event.county} County
            </p>
            <p>Need: {event.volunteerNeed}</p>
            <a
              href={`${KICKOFF_BASE}/join/local?event=${encodeURIComponent(event.id)}`}
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
