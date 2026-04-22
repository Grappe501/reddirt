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
import { getRegionBySlug } from "@/content/local/regions";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event" };
  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

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
                subtitle="Plain facts first—then the human stuff underneath."
              />
              <div className="mt-8 rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8">
                <EventMeta event={event} />
              </div>

              <SectionHeading
                className="mt-14"
                align="left"
                as="h3"
                eyebrow="Narrative"
                title="Why this gathering exists"
              />
              <p className="mt-6 font-body text-lg leading-relaxed text-deep-soil/85">{event.description}</p>

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
                      className="rounded-lg border border-deep-soil/10 bg-deep-soil/[0.03] px-4 py-3 font-body text-deep-soil/85"
                    >
                      {line}
                    </li>
                  ))
                ) : (
                  <li className="font-body text-deep-soil/70">Details were captured outside the public template for this archive.</li>
                )}
              </ul>

              <SectionHeading className="mt-14" align="left" as="h3" eyebrow="Fit" title="Who it’s for" />
              <p className="mt-6 font-body text-lg leading-relaxed text-deep-soil/85">{event.whoItsFor}</p>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28">
              <div className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]">
                <h2 className="font-heading text-lg font-bold text-deep-soil">Organizer note</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-deep-soil/75">{event.organizerNote}</p>
                <p className="mt-4 font-body text-xs text-deep-soil/55">
                  {/* TODO: replace with named host + verified contact when CRM/Mobilize sync exists */}
                  Public organizer bios and verified contacts land in the next integration pass.
                </p>
              </div>
              <Button href={rsvpHref} variant="primary" className="w-full justify-center">
                RSVP or raise your hand
              </Button>
              {county ? (
                <Link
                  href={`/local-organizing/${county.slug}`}
                  className="block rounded-card border border-deep-soil/10 bg-deep-soil/[0.03] p-5 font-body text-sm font-semibold text-red-dirt underline-offset-4 hover:underline"
                >
                  View {county.name} organizing hub →
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
            subtitle={related.length ? "Keep the momentum—pair trainings with listening, and listening with action." : "More dates are loading as hosts step forward."}
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
              className="mt-10 rounded-card border border-dashed border-deep-soil/25 bg-deep-soil/[0.03] p-8 text-center"
            >
              <p className="font-body text-deep-soil/80">No sibling events linked yet—browse the full hub.</p>
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
