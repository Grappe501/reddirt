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
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Trainings, listening sessions, town halls, and porch gatherings across Arkansas for the Secretary of State campaign.",
};

function pickParam(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const suggestOk = pickParam(sp, "ok");
  const [counties, communityFeed] = await Promise.all([
    prisma.county.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, displayName: true } }),
    listPublicFestivalFeed(6).catch(() => []),
  ]);
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

  const filterKey = JSON.stringify({ type, region, status, audience });

  return (
    <>
      <PageHero
        eyebrow="Gather"
        title="Movement events"
        subtitle="Not a generic calendar—a weave of trainings, listening sessions, and community conversations built for Arkansas’s scale and pace."
        className="!pb-[calc(var(--section-padding-y)*0.5)] lg:!pb-[calc(var(--section-padding-y-lg)*0.5)]"
        contentClassName="pt-10 pb-5 lg:pt-14 lg:pb-7"
      >
        <Button href="/host-a-gathering" variant="primary">
          Host a gathering
        </Button>
        <Button href="/listening-sessions" variant="outline">
          Election listening tour
        </Button>
        <Button href="/local-organizing" variant="outline">
          Local organizing hub
        </Button>
      </PageHero>

      <FullBleedSection
        padY
        aria-labelledby="event-tags-heading"
        className="!pt-[calc(var(--section-padding-y)*0.5)] lg:!pt-[calc(var(--section-padding-y-lg)*0.5)]"
      >
        <ContentContainer>
          <h2 id="event-tags-heading" className="font-heading text-xl font-bold text-deep-soil">
            Browse by type or region
          </h2>
          <p className="mt-2 max-w-3xl font-body text-deep-soil/75">
            Every county sits in one of nine geographic regions (aligned to how field teams and tourism maps talk about
            the state) plus a <strong>Statewide</strong> label for online or multi-area programs. Tap a tag to jump the
            filters—keyboard-friendly selects are below.{" "}
            <span className="text-deep-soil/55">
              {/* TODO(Script 5): Mobilize-powered RSVPs + live capacity */}
              RSVP plumbing syncs when Mobilize integration ships.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Quick filters by event type">
            {eventTypes.map((t) => (
              <Link
                key={t}
                href={`/events?type=${encodeURIComponent(t)}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt",
                  type === t
                    ? "border-red-dirt/40 bg-red-dirt/12 text-deep-soil"
                    : "border-deep-soil/15 bg-deep-soil/[0.04] text-deep-soil/80 hover:border-red-dirt/25",
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
                  "rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt",
                  region === r
                    ? "border-field-green/40 bg-field-green/12 text-deep-soil"
                    : "border-deep-soil/15 bg-deep-soil/[0.04] text-deep-soil/80 hover:border-field-green/30",
                )}
              >
                {r}
              </Link>
            ))}
          </div>

          <h3 className="mt-10 font-heading text-lg font-bold text-deep-soil">Regions at a glance</h3>
          <p className="mt-2 max-w-3xl font-body text-sm text-deep-soil/70">
            Same buckets used in the campaign research directory so county pages, calendars, and field planning stay
            consistent.
          </p>
          <ul className="mt-4 grid list-none grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {listMovementRegionInfo().map((info) => (
              <li
                key={info.key}
                className="rounded-lg border border-deep-soil/10 bg-white/80 px-4 py-3 shadow-sm"
              >
                <h4 className="font-heading text-base font-bold text-deep-soil">
                  <Link
                    href={`/events?region=${encodeURIComponent(info.label)}`}
                    className="text-civic-slate decoration-red-dirt/30 hover:underline"
                  >
                    {info.label}
                  </Link>
                </h4>
                <p className="mt-1.5 font-body text-xs leading-relaxed text-deep-soil/75">{info.blurb}</p>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <EventsHub
            key={filterKey}
            events={events}
            types={[...eventTypes]}
            regions={allMovementRegions}
            audienceTags={audienceTags}
            initialFilters={{ type, region, status, audience }}
            mapsApiKey={process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null}
          />
        </ContentContainer>
      </FullBleedSection>

      {communityFeed.length > 0 ? (
        <FullBleedSection padY aria-labelledby="community-feed-title">
          <ContentContainer>
            <h2
              id="community-feed-title"
              className="font-heading text-xl font-bold text-deep-soil md:text-2xl"
            >
              Community calendar highlights
            </h2>
            <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/75">
              Fairs, festivals, and public gatherings the team has approved for the site-wide feed. Full list and field map
              on the{" "}
              <Link href="/campaign-trail" className="font-semibold text-red-dirt underline">
                campaign trail
              </Link>
              .
            </p>
            <ul className="mt-5 grid list-none grid-cols-1 gap-3 md:grid-cols-2">
              {communityFeed.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-deep-soil/10 bg-cream-canvas/80 px-4 py-3 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-civic-slate/90">
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
                  <p className="mt-1 font-heading text-base font-bold text-deep-soil">{e.name}</p>
                  {e.linkUrl ? (
                    <a
                      href={e.linkUrl}
                      className="mt-1 inline-block text-sm font-semibold text-red-dirt underline"
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
          <h2 id="suggest-title" className="font-heading text-xl font-bold text-deep-soil md:text-2xl">
            Suggest a fair, festival, or public event
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-deep-soil/75">
            Know a neighborhood gathering that should be on the map? Send it in—staff review it on the event calendar
            before it shows up here and on the campaign trail.
          </p>
          {suggestOk === "suggest" ? (
            <p className="mt-3 rounded-md border border-field-green/30 bg-field-green/10 px-3 py-2 font-body text-sm text-deep-soil" role="status">
              Thanks — we received your suggestion. The team will review it before anything goes live.
            </p>
          ) : null}
          <SuggestCommunityEventForm counties={counties} idPrefix="suggest" />
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Make the next opening"
        title="The calendar belongs to hosts"
        description="If you don’t see your town yet, you might be the person who makes the first dot on the map."
        variant="soil"
      >
        <Button href="/host-a-gathering" variant="primary" className="bg-cream-canvas text-deep-soil hover:bg-cream-canvas/90">
          Host a gathering
        </Button>
        <Button href="/start-a-local-team" variant="outline" className="border-cream-canvas/40 text-cream-canvas hover:bg-cream-canvas/10">
          Start a local team
        </Button>
      </CTASection>
    </>
  );
}
