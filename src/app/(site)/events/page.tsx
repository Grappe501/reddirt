import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { EventsHub } from "@/components/organizing/EventsHub";
import { SuggestCommunityEventForm } from "@/components/organizing/SuggestCommunityEventForm";
import { events, eventTypes, listMovementEventAudienceOptions } from "@/content/events";
import type { EventFiltersState } from "@/components/organizing/EventFilterBar";
import type { EventStatus, EventType } from "@/content/types";
import { listPublicFestivalFeed } from "@/lib/festivals/queries";
import { listMovementEventRegionFilterLabels, listMovementRegionInfo } from "@/content/arkansas-movement-regions";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { safePublishedCountyOptions } from "@/lib/county/safe-published-county-options";
import type { EventSchedulePreset } from "@/lib/format/event-schedule-in-zone";
import { cn } from "@/lib/utils";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";
import { RepresentLocalEventPanel } from "@/components/organizing/RepresentLocalEventPanel";
import { representLocalEventVolunteerHref } from "@/config/navigation";

import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

export const metadata: Metadata = pageMeta({
  title: "Campaign Calendar",
  description:
    "See where Kelly will be next, where the campaign is showing up, and how Arkansans can join the work — trainings, gatherings, and public calendar items as they are approved.",
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
 * Campaign calendar hub: static movement events + Prisma-backed public events when the DB is available.
 * TODO: Approved Google Calendar public feed (read-only) after integration design.
 * TODO: Pending-approval calendar / admin queue remains internal — never show unconfirmed stops as public fact.
 * TODO: Optional map + county completion visualization (later; no placeholder map pins).
 */
export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const suggestOk = pickParam(sp, "ok");
  const [counties, communityFeed, calendarRows] = await Promise.all([
    safePublishedCountyOptions(),
    listPublicFestivalFeed(6),
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
    statusRaw === "upcoming" || statusRaw === "past" ? (statusRaw as EventStatus) : "all";
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
  const includeCalendar = pickParam(sp, "cal") !== "0";

  const filterKey = JSON.stringify({ type, region, status, audience, schedule, includeCalendar });
  const calendarMoment = trailPhotosForSlot("events")[0];

  return (
    <>
      <PageHero
        eyebrow="Campaign calendar"
        title="Campaign Calendar"
        subtitle="See where Kelly will be next, where the campaign is showing up, and how Arkansans can join the work."
        className="!pb-[calc(var(--section-padding-y)*0.5)] lg:!pb-[calc(var(--section-padding-y-lg)*0.5)]"
        contentClassName="pt-10 pb-5 lg:pt-14 lg:pb-7"
      >
        <Button href="/events/request" variant="primary">
          Request Kelly
        </Button>
        <Button href="/host-a-gathering" variant="outline">
          Host a gathering
        </Button>
        <Button href={representLocalEventVolunteerHref} variant="outline">
          Represent us locally
        </Button>
        <Button href="/listening-sessions" variant="outline">
          Listening sessions
        </Button>
        <Button href="/local-organizing" variant="outline">
          Local organizing hub
        </Button>
      </PageHero>

      {calendarMoment ? (
        <FullBleedSection
          variant="subtle"
          className="!pt-[calc(var(--section-padding-y)*0.45)] !pb-0 lg:!pt-[calc(var(--section-padding-y-lg)*0.45)] lg:!pb-0"
        >
          <ContentContainer wide className="py-6 md:py-8">
            <EditorialCampaignPhoto variant="breakout" photo={calendarMoment} kicker="Field" />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection
        id="represent-locally"
        padY
        aria-labelledby="represent-locally-heading"
        className="!pt-[calc(var(--section-padding-y)*0.65)] lg:!pt-[calc(var(--section-padding-y-lg)*0.65)]"
      >
        <ContentContainer>
          <h2
            id="represent-locally-heading"
            className="font-heading text-xl font-bold text-kelly-text md:text-2xl"
          >
            Can you represent the campaign at something on your local calendar?
          </h2>
          <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75 md:text-base">
            Volunteers ask for real tasks—here is one. Fairs, festivals, party meetings, and civic nights need neighbors
            who can listen, hand out vetted information, and invite people into the movement without turning a public
            event into a debate stage.
          </p>
          <RepresentLocalEventPanel className="mt-8 max-w-3xl" />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="civic-roadshow-heading">
        <ContentContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="font-body text-xs font-bold uppercase text-kelly-navy">
                Civic education
              </p>
              <h2 id="civic-roadshow-heading" className="mt-3 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
                Take the process to the places Arkansans already gather
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/75">
                Kelly’s voter engagement model is not a school-only program or a one-week slogan. It is a traveling,
                plain-language approach: understand the system, trust what deserves trust, and know how to change what
                needs changing.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7">
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Community spaces</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Churches, fish fries, libraries, county fairs, coffee shops, colleges, and workforce centers are all
                  civic classrooms when neighbors are invited with respect.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">Process open houses</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Public demonstrations of ballots, equipment, audits, chain of custody, and results reporting can make
                  trust visible instead of asking people to take it on faith.
                </p>
              </article>
              <article className="rounded-card border border-kelly-text/10 bg-white p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-kelly-text">People-powered weeks</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/70">
                  Future civic engagement weeks should be Arkansas-rooted: local hosts, practical voter education, and a
                  clear path from curiosity to participation.
                </p>
              </article>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection
        padY
        aria-labelledby="event-tags-heading"
        className="!pt-[calc(var(--section-padding-y)*0.5)] lg:!pt-[calc(var(--section-padding-y-lg)*0.5)]"
      >
        <ContentContainer>
          <h2 id="event-tags-heading" className="font-heading text-xl font-bold text-kelly-text">
            Browse by type or region
          </h2>
          <p className="mt-2 max-w-3xl font-body text-kelly-text/75">
            Every county sits in one of nine geographic regions (aligned to how field teams and tourism maps talk about
            the state) plus a <strong>Statewide</strong> label for online or multi-area programs. Tap a tag to jump the
            filters—keyboard-friendly selects are below.
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Quick filters by event type">
            {eventTypes.map((t) => (
              <Link
                key={t}
                href={`/events?type=${encodeURIComponent(t)}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy",
                  type === t
                    ? "border-kelly-navy/40 bg-kelly-navy/12 text-kelly-text"
                    : "border-kelly-text/15 bg-kelly-text/[0.04] text-kelly-text/80 hover:border-kelly-navy/25",
                )}
              >
                {t}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Arkansas regions">
            {allMovementRegions.map((r) => (
              <Link
                key={r}
                href={`/events?region=${encodeURIComponent(r)}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy",
                  region === r
                    ? "border-kelly-success/40 bg-kelly-success/12 text-kelly-text"
                    : "border-kelly-text/15 bg-kelly-text/[0.04] text-kelly-text/80 hover:border-kelly-success/30",
                )}
              >
                {r}
              </Link>
            ))}
          </div>

          <h3 className="mt-10 font-heading text-lg font-bold text-kelly-text">Regions at a glance</h3>
          <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/70">
            Same buckets used in the campaign research directory so county pages, calendars, and field planning stay
            consistent.
          </p>
          <ul className="mt-4 grid list-none grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {listMovementRegionInfo().map((info) => (
              <li
                key={info.key}
                className="rounded-lg border border-kelly-text/10 bg-white/80 px-4 py-3 shadow-sm"
              >
                <h4 className="font-heading text-base font-bold text-kelly-text">
                  <Link
                    href={`/events?region=${encodeURIComponent(info.label)}`}
                    className="text-kelly-slate decoration-kelly-navy/30 hover:underline"
                  >
                    {info.label}
                  </Link>
                </h4>
                <p className="mt-1.5 font-body text-xs leading-relaxed text-kelly-text/75">{info.blurb}</p>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="upcoming" padY aria-labelledby="campaign-upcoming-heading">
        <ContentContainer wide>
          <h2 id="campaign-upcoming-heading" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Upcoming events
          </h2>
          <p className="mt-3 max-w-3xl font-body text-kelly-text/75">
            The filterable grid below merges curated movement events with{" "}
            <strong className="text-kelly-text">approved</strong> public calendar items from the campaign database. New
            stops are added only after review and confirmation.
          </p>
          {calendarRows.length === 0 ? (
            <p
              className="mt-4 max-w-3xl rounded-card border border-dashed border-kelly-text/20 bg-kelly-wash/60 px-4 py-4 font-body text-sm leading-relaxed text-kelly-text/80"
              role="status"
            >
              No live database calendar rows loaded here yet (or the campaign database is unavailable in this
              environment). You can still browse curated movement events in the grid — and trail moments always live on{" "}
              <Link href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                From the Road
              </Link>
              .
            </p>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="past-stops-heading">
        <ContentContainer>
          <h2 id="past-stops-heading" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Past stops / On the Road
          </h2>
          <p className="mt-3 max-w-2xl font-body text-kelly-text/75">
            Miles, engagements, and trail proof live on the dedicated road hub — including verified milestones while we keep
            building the public calendar.
          </p>
          <Button href="/from-the-road" variant="outline" className="mt-6 min-h-[48px]">
            Open From the Road
          </Button>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="request-kelly-cal-heading">
        <ContentContainer>
          <h2 id="request-kelly-cal-heading" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Request Kelly
          </h2>
          <p className="mt-3 max-w-2xl font-body text-kelly-text/75">
            Want Kelly in your town, fair, county meeting, or civic room? Start a request — staff will review, follow
            up, and confirm logistics before anything is treated as public schedule.
          </p>
          <Button href="/events/request" variant="primary" className="mt-6 min-h-[48px]">
            Start a request
          </Button>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <EventsHub
            key={filterKey}
            events={mergedEvents}
            types={[...eventTypes]}
            regions={allMovementRegions}
            audienceTags={audienceTags}
            initialFilters={{ type, region, status, audience, schedule, includeCalendar }}
          />
        </ContentContainer>
      </FullBleedSection>

      {communityFeed.length > 0 ? (
        <FullBleedSection padY aria-labelledby="community-feed-title">
          <ContentContainer>
            <h2
              id="community-feed-title"
              className="font-heading text-xl font-bold text-kelly-text md:text-2xl"
            >
              Community calendar highlights
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
              Fairs, festivals, and public gatherings the team has approved for the site-wide feed. Full list and field map
              on the{" "}
              <Link href="/from-the-road" className="font-semibold text-kelly-navy underline">
                From the Road
              </Link>
              .
            </p>
            <ul className="mt-5 grid list-none grid-cols-1 gap-3 md:grid-cols-2">
              {communityFeed.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-kelly-text/10 bg-kelly-page/80 px-4 py-3 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate/90">
                    {new Date(e.startAt).toLocaleString("en-US", {
                      timeZone: "America/Chicago",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {new Date(e.endAt).toLocaleString("en-US", {
                      timeZone: "America/Chicago",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {e.countyDisplayName ? ` · ${e.countyDisplayName}` : e.city ? ` · ${e.city}` : null}
                  </p>
                  <p className="mt-1 font-heading text-base font-bold text-kelly-text">{e.name}</p>
                  {e.linkUrl ? (
                    <a
                      href={e.linkUrl}
                      className="mt-1 inline-block text-sm font-semibold text-kelly-navy underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Details →
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection id="suggest" variant="subtle" padY aria-labelledby="suggest-title">
        <ContentContainer>
          <h2 id="suggest-title" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Suggest a fair, festival, or public event
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
            Know a neighborhood gathering that should be on the map? Send it in—staff review it on the event calendar
            before it shows up here and on the campaign trail.
          </p>
          {suggestOk === "suggest" ? (
            <p className="mt-3 rounded-md border border-kelly-success/30 bg-kelly-success/10 px-3 py-2 font-body text-sm text-kelly-text" role="status">
              Thanks — we received your suggestion. The team will review it before anything goes live.
            </p>
          ) : null}
          {counties.length === 0 ? (
            <p className="mt-3 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 font-body text-sm text-amber-950/90" role="status">
              County pick-list is temporarily unavailable. You can still describe the location in your message—staff will match
              it manually.
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
