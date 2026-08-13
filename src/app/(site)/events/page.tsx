import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { EventsHub } from "@/components/organizing/EventsHub";
import { SuggestCommunityEventForm } from "@/components/organizing/SuggestCommunityEventForm";
import { events, eventTypes, listMovementEventAudienceOptions } from "@/content/events";
import type { EventFiltersState } from "@/components/organizing/EventFilterBar";
import type { EventType } from "@/content/types";
import { listMovementEventRegionFilterLabels } from "@/content/arkansas-movement-regions";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { safePublishedCountyOptions } from "@/lib/county/safe-published-county-options";
import type { EventSchedulePreset } from "@/lib/format/event-schedule-in-zone";
import { representLocalEventVolunteerHref } from "@/config/navigation";

import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Events",
  description:
    "Where Kelly will be next — confirmed campaign and community stops in Arkansas Central Time. Invite Kelly or host a gathering if your town is not on the list yet.",
  path: "/events",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

function pickParam(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

/**
 * Campaign calendar hub: curated public movement events + published CampaignOS events.
 * Fair research (~80 festivals) is not merged here (Phase 1).
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const suggestOk = pickParam(sp, "ok");
  const [counties, calendarRows] = await Promise.all([
    safePublishedCountyOptions(),
    queryPublicCampaignEvents({ range: "all_upcoming" }, { take: 200 }),
  ]);
  const mergedEvents = mergeMovementAndCalendarEvents(events, calendarRows);
  const typeRaw = pickParam(sp, "type");
  const regionRaw = pickParam(sp, "region");
  const statusRaw = pickParam(sp, "status");
  const audienceRaw = pickParam(sp, "audience");

  const allMovementRegions = listMovementEventRegionFilterLabels();
  const audienceTags = listMovementEventAudienceOptions();

  const type: EventFiltersState["type"] =
    typeRaw && (eventTypes as readonly string[]).includes(typeRaw) ? (typeRaw as EventType) : "all";
  const regionDecoded = regionRaw ? decodeURIComponent(regionRaw) : "all";
  const region: EventFiltersState["region"] =
    regionDecoded !== "all" && allMovementRegions.includes(regionDecoded) ? regionDecoded : "all";
  const status: EventFiltersState["status"] =
    statusRaw === "all" || statusRaw === "past" || statusRaw === "upcoming" ? statusRaw : "upcoming";
  const audienceDecoded = audienceRaw ? decodeURIComponent(audienceRaw) : "all";
  const audience: EventFiltersState["audience"] =
    audienceDecoded !== "all" && audienceTags.includes(audienceDecoded) ? audienceDecoded : "all";

  const scheduleParam = pickParam(sp, "when");
  const schedule: EventSchedulePreset =
    scheduleParam === "today"
      ? "today"
      : scheduleParam === "week"
        ? "this_week"
        : scheduleParam === "ahead"
          ? "upcoming"
          : "all";
  const filterKey = JSON.stringify({ type, region, status, audience, schedule });
  const upcomingCount = mergedEvents.filter((e) => e.status === "upcoming").length;

  return (
    <>
      <MediaPageHero
        slotKey="events.hero"
        layout="split"
        eyebrow="Events"
        title="Where Kelly will be next"
        subtitle="Confirmed stops in Arkansas Central Time. If your town is not on the list yet, invite Kelly or host a gathering — nothing is public until it is verified."
      >
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Button href="/host-a-gathering" variant="outlineOnDark">
          Host a gathering
        </Button>
      </MediaPageHero>

      <FullBleedSection
        padY
        aria-labelledby="calendar-heading"
        className="!pt-[calc(var(--section-padding-y)*0.55)] lg:!pt-[calc(var(--section-padding-y-lg)*0.55)]"
      >
        <ContentContainer wide>
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="calendar-heading" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
                Calendar
              </h2>
              <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
                {upcomingCount === 1
                  ? "One confirmed stop ahead — times below are Central."
                  : upcomingCount > 1
                    ? `${upcomingCount} confirmed stops ahead — times below are Central.`
                    : "No confirmed upcoming stops on this list yet. Switch Timing to Past to browse what already happened, or invite Kelly to your town."}
              </p>
            </div>
            <nav
              aria-label="Other ways to show up"
              className="flex flex-wrap gap-x-4 gap-y-2 font-body text-sm font-semibold text-kelly-navy"
            >
              <Link href={representLocalEventVolunteerHref} className="underline-offset-4 hover:underline">
                Represent locally
              </Link>
              <Link href="/listening-sessions" className="underline-offset-4 hover:underline">
                Listening sessions
              </Link>
              <Link href="/events/community-election-integrity-tour" className="underline-offset-4 hover:underline">
                Integrity tour
              </Link>
              <Link href="#suggest" className="underline-offset-4 hover:underline">
                Suggest an event
              </Link>
              <Link href="/from-the-road" className="underline-offset-4 hover:underline">
                From the Road
              </Link>
            </nav>
          </div>
          <EventsHub
            key={filterKey}
            events={mergedEvents}
            types={[...eventTypes]}
            regions={allMovementRegions}
            audienceTags={audienceTags}
            initialFilters={{ type, region, status, audience, schedule }}
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="suggest" variant="subtle" padY aria-labelledby="suggest-title">
        <ContentContainer>
          <h2 id="suggest-title" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Suggest a fair, festival, or public event
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
            Know a neighborhood gathering that should be on the map? Send it in—the campaign reviews it before it appears
            here and on the trail.
          </p>
          {suggestOk === "suggest" ? (
            <p
              className="mt-3 rounded-md border border-kelly-success/30 bg-kelly-success/10 px-3 py-2 font-body text-sm text-kelly-text"
              role="status"
            >
              Thanks — we received your suggestion. The team will review it before anything goes live.
            </p>
          ) : null}
          {counties.length === 0 ? (
            <p
              className="mt-3 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 font-body text-sm text-amber-950/90"
              role="status"
            >
              County pick-list is temporarily unavailable. You can still describe the location in your message—we’ll match
              it to a county.
            </p>
          ) : null}
          <SuggestCommunityEventForm counties={counties} idPrefix="suggest" />
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Make the next opening"
        title="The calendar belongs to hosts"
        description="If you don’t see your town yet, you might be the person who makes the first dot on the map—or the neighbor who represents us where the community already gathers."
        variant="ink-band"
      >
        <Button href="/host-a-gathering" variant="primary" className="bg-kelly-page text-kelly-text hover:bg-kelly-page/90">
          Host a gathering
        </Button>
        <Button
          href={representLocalEventVolunteerHref}
          variant="outline"
          className="border-kelly-page/40 text-kelly-page hover:bg-kelly-page/10"
        >
          Represent locally
        </Button>
        <Button href="/start-a-local-team" variant="outline" className="border-kelly-page/40 text-kelly-page hover:bg-kelly-page/10">
          Start a local team
        </Button>
      </CTASection>
    </>
  );
}
