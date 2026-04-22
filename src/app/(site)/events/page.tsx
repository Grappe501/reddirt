import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { EventsHub } from "@/components/organizing/EventsHub";
import { events, eventTypes } from "@/content/events";
import type { EventFiltersState } from "@/components/organizing/EventFilterBar";
import type { EventStatus, EventType } from "@/content/types";
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

function uniqSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const typeRaw = pickParam(sp, "type");
  const regionRaw = pickParam(sp, "region");
  const statusRaw = pickParam(sp, "status");
  const audienceRaw = pickParam(sp, "audience");

  const regions = uniqSorted(events.map((e) => e.region));
  const audienceTags = uniqSorted(events.flatMap((e) => e.audienceTags ?? []));

  const type: EventFiltersState["type"] =
    typeRaw && (eventTypes as readonly string[]).includes(typeRaw) ? (typeRaw as EventType) : "all";
  const regionDecoded = regionRaw ? decodeURIComponent(regionRaw) : "all";
  const region: EventFiltersState["region"] =
    regionDecoded !== "all" && regions.includes(regionDecoded) ? regionDecoded : "all";
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
      >
        <Button href="/host-a-gathering" variant="primary">
          Host a gathering
        </Button>
        <Button href="/local-organizing" variant="outline">
          Local organizing hub
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="event-tags-heading">
        <ContentContainer>
          <h2 id="event-tags-heading" className="font-heading text-xl font-bold text-deep-soil">
            Browse by type or region
          </h2>
          <p className="mt-2 max-w-3xl font-body text-deep-soil/75">
            Tap a tag to jump the filters—keyboard-friendly selects are below.{" "}
            <span className="text-deep-soil/55">
              {/* TODO(Script 5): Mobilize-powered RSVPs + live capacity */}
              RSVP plumbing syncs when Mobilize integration ships.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label="Quick filters">
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
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Region tags">
            {regions.map((r) => (
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
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <EventsHub
            key={filterKey}
            events={events}
            types={[...eventTypes]}
            regions={regions}
            audienceTags={audienceTags}
            initialFilters={{ type, region, status, audience }}
          />
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
