import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { Button } from "@/components/ui/Button";
import { EventMeta } from "@/components/organizing/EventMeta";
import { EventCard } from "@/components/organizing/EventCard";
import { RelatedLinksSection } from "@/components/organizing/RelatedLinksSection";
import { getEventBySlug, listEventSlugs } from "@/content/events";
import type { EventItem } from "@/content/types";
import { getRegionBySlug } from "@/content/local/regions";
import { skipPublicStaticGenerationForNetlifyLaunch } from "@/lib/intelligence/intelligenceLaunchMode";
import {
  resolvePublicEventPageBySlug,
  resolvePublicEventTitleForMetadata,
} from "@/lib/calendar/public-events";
import { publicCampaignEventToEventItem } from "@/lib/events/calendar-to-movement-event";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { pageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (skipPublicStaticGenerationForNetlifyLaunch()) return [];
  return listEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const curated = getEventBySlug(slug);
  if (curated) {
    return pageMeta({
      title: curated.title,
      description: curated.summary,
      path: `/events/${slug}`,
    });
  }
  try {
    const t = await resolvePublicEventTitleForMetadata(slug);
    if (!t) return { title: "Event" };
    return pageMeta({
      title: t,
      description: `Campaign calendar event — ${t}.`,
      path: `/events/${slug}`,
    });
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) return { title: "Event" };
    throw e;
  }
}

function CuratedOrCalendarEventView({ event }: { event: EventItem }) {
  const county = event.countySlug ? getRegionBySlug(event.countySlug) : undefined;
  const related = event.relatedEventSlugs
    .map((s) => getEventBySlug(s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .filter((e) => e.slug !== event.slug);

  const rsvpHref =
    event.rsvpHref ??
    `/get-involved?intent=rsvp&event=${encodeURIComponent(event.slug)}`;

  return (
    <>
      <PageHero eyebrow={event.type} title={event.title} subtitle={event.summary}>
        <Button href={rsvpHref} variant="primary">
          RSVP or raise your hand
        </Button>
        <Button href="/events" variant="outline">
          All events
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Details"
                title="When, where, and what"
              />
              <div className="mt-8 rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8">
                <EventMeta event={event} />
              </div>

              {event.description ? (
                <>
                  <SectionHeading
                    className="mt-14"
                    align="left"
                    as="h3"
                    eyebrow="About this stop"
                    title="The full picture"
                  />
                  <p className="mt-6 whitespace-pre-line font-body text-base leading-relaxed text-kelly-text/85">
                    {event.description}
                  </p>
                </>
              ) : null}

              <SectionHeading
                className="mt-14"
                align="left"
                as="h3"
                eyebrow="Expectations"
                title="What to expect"
              />
              <ul className="mt-6 space-y-3">
                {event.whatToExpect.length ? (
                  event.whatToExpect.map((line) => (
                    <li
                      key={line}
                      className="rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] px-4 py-3 font-body text-kelly-text/85"
                    >
                      {line}
                    </li>
                  ))
                ) : (
                  <li className="font-body text-kelly-text/70">
                    More detail will appear here when the host publishes it.
                  </li>
                )}
              </ul>

              <SectionHeading className="mt-14" align="left" as="h3" eyebrow="Fit" title="Who it’s for" />
              <p className="mt-6 font-body text-lg leading-relaxed text-kelly-text/85">{event.whoItsFor}</p>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]">
                <h2 className="font-heading text-lg font-bold text-kelly-text">Join this stop</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/75">{event.locationLabel}</p>
                {event.addressLine ? (
                  <p className="mt-2 font-body text-sm text-kelly-text/65">{event.addressLine}</p>
                ) : null}
              </div>
              <Button href={rsvpHref} variant="primary" className="w-full justify-center">
                RSVP or raise your hand
              </Button>
              {county ? (
                <Link
                  href="/start-a-local-team"
                  className="block rounded-card border border-kelly-text/10 bg-kelly-text/[0.03] p-5 font-body text-sm font-semibold text-kelly-navy underline-offset-4 hover:underline"
                >
                  Start a local team in {county.name} →
                </Link>
              ) : null}
            </aside>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <ContentContainer className="py-section-y">
        <RelatedLinksSection
          id="event-related-resources"
          title="Related resources"
          subtitle="Short bridges into explainers and toolkits—deep libraries keep growing in /resources."
          links={event.relatedResourceHrefs.map((r) => ({ label: r.label, href: r.href }))}
        />
      </ContentContainer>

      <FullBleedSection variant="subtle" padY aria-labelledby="related-events-heading">
        <ContentContainer>
          <SectionHeading
            id="related-events-heading"
            align="left"
            eyebrow="Nearby weave"
            title="Related events"
            subtitle={
              related.length
                ? "Keep the momentum—pair trainings with listening, and listening with action."
                : "More dates are loading as hosts step forward."
            }
          />
          {related.length ? (
            <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {related.map((e) => (
                <li key={e.slug}>
                  <EventCard event={e} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              role="status"
              className="mt-10 rounded-card border border-dashed border-kelly-text/25 bg-kelly-text/[0.03] p-8 text-center"
            >
              <p className="font-body text-kelly-text/80">No sibling events linked yet—browse the full hub.</p>
              <Button href="/events" variant="outline" className="mt-4">
                Open events hub
              </Button>
            </div>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

function CanceledEventTombstone({ title }: { title: string }) {
  const join = getJoinCampaignHref();
  return (
    <>
      <FullBleedSection variant="band-blue" padY className="border-b border-kelly-gold/20">
        <ContentContainer>
          <Link href="/events" className="text-xs font-semibold text-kelly-mist/80 hover:text-kelly-gold">
            ← All events
          </Link>
          <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-mist">Event no longer on the schedule</h1>
          <p className="mt-2 text-sm text-kelly-mist/90">
            {title} was removed from the public schedule. Check the current calendar for what&rsquo;s on next.
          </p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer>
          <p className="text-sm text-kelly-text/75">
            Need something else?{" "}
            <Link href={join} className="font-semibold text-kelly-navy hover:underline">
              Get involved with the campaign
            </Link>{" "}
            or return to the{" "}
            <Link href="/events" className="font-semibold text-kelly-navy hover:underline">
              full public calendar
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;

  const curated = getEventBySlug(slug);
  if (curated) {
    return <CuratedOrCalendarEventView event={curated} />;
  }

  let resolved: Awaited<ReturnType<typeof resolvePublicEventPageBySlug>>;
  try {
    resolved = await resolvePublicEventPageBySlug(slug);
  } catch (e) {
    if (!isPrismaDatabaseUnavailable(e)) throw e;
    logPrismaDatabaseUnavailable("events/[slug]/resolvePublicEventPageBySlug", e);
    return (
      <FullBleedSection padY>
        <ContentContainer className="max-w-2xl">
          <h1 className="font-heading text-2xl font-bold text-kelly-text">Calendar temporarily unavailable</h1>
          <p className="mt-2 font-body text-kelly-text/80">
            This event can&apos;t load right now—please try again in a moment.
          </p>
          <Link href="/events" className="mt-6 inline-block font-semibold text-kelly-navy underline">
            ← Back to events
          </Link>
        </ContentContainer>
      </FullBleedSection>
    );
  }

  if (!resolved) notFound();

  if (resolved.kind === "canceled") {
    return <CanceledEventTombstone title={resolved.title} />;
  }

  const event = publicCampaignEventToEventItem(resolved.event);
  return <CuratedOrCalendarEventView event={event} />;
}
