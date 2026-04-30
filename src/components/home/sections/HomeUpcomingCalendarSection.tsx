import Link from "next/link";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { PublicCampaignEventCard } from "@/components/calendar/PublicCampaignEventCard";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

export type HomeUpcomingCalendarSectionProps = {
  events: PublicCampaignEvent[];
  layoutRail?: boolean;
};

export function HomeUpcomingCalendarSection({ events, layoutRail = false }: HomeUpcomingCalendarSectionProps) {
  if (events.length === 0) return null;
  return (
    <FullBleedSection padY className="bg-kelly-wash/50" aria-labelledby="public-cal-title">
      <ContentContainer>
        <p
          id="public-cal-title"
          className="text-center font-body text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-navy/90"
        >
          Show up
        </p>
        <h2 className="mt-2 text-center font-heading text-2xl font-bold text-kelly-text md:text-3xl">
          Upcoming on the public calendar
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-body text-sm text-kelly-text/75 md:text-base">
          Real stops from our campaign system—no shadow schedules. If it&rsquo;s here, the team has published it for the
          public site. Details, RSVP, and volunteer links on every card.
        </p>
        <ul
          className={cn(
            "mt-8 list-none",
            layoutRail
              ? "-mx-[var(--gutter-x)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter-x)] pb-2 [scrollbar-width:thin] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3"
              : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {events.map((e, i) => (
            <ScrollReveal
              key={e.id}
              as="li"
              delay={layoutRail ? 40 + i * 35 : 0}
              yOffset={layoutRail ? 12 : 10}
              className={cn(
                "min-w-0",
                layoutRail && "w-[min(90vw,22rem)] shrink-0 snap-center md:w-auto md:shrink-0",
              )}
            >
              <PublicCampaignEventCard event={e} emphasis="compact" />
            </ScrollReveal>
          ))}
        </ul>
        <p className="mt-6 text-center">
          <Link
            href="/campaign-calendar"
            className="font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/20 underline-offset-4 transition hover:decoration-kelly-navy"
            prefetch={false}
          >
            Open full campaign calendar →
          </Link>
        </p>
      </ContentContainer>
    </FullBleedSection>
  );
}
