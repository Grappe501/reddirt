import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/organizing/StatusBadge";
import { EventCard } from "@/components/organizing/EventCard";
import { RelatedLinksSection } from "@/components/organizing/RelatedLinksSection";
import { getRegionBySlug, listRegionSlugs } from "@/content/local/regions";
import { events as allEvents } from "@/content/events";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listRegionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return { title: "Region" };
  return {
    title: `${region.name} — Local organizing`,
    description: region.summary,
  };
}

export default async function LocalRegionPage({ params }: Props) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const upcomingForRegion = region.upcomingEventSlugs
    .map((s) => allEvents.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const statusNote =
    region.status === "active"
      ? "This hub is actively hosting trainings and gatherings."
      : region.status === "building"
        ? "We’re building capacity—expect a slightly slower first reply while we match you with a mentor host."
        : "Coming soon: dedicated coordinator and live calendar. You can still raise your hand today.";

  return (
    <>
      <PageHero
        eyebrow={region.region}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {region.name}
            <StatusBadge status={region.status} className="align-middle" />
          </span>
        }
        subtitle={region.summary}
      >
        <Button href={region.cta.primary.href} variant="primary">
          {region.cta.primary.label}
        </Button>
        {region.cta.secondary ? (
          <Button href={region.cta.secondary.href} variant="outline">
            {region.cta.secondary.label}
          </Button>
        ) : null}
        <p className="mt-2 max-w-xl text-sm text-deep-soil/75">
          <Link
            className="font-semibold text-red-dirt underline-offset-2 hover:underline"
            href={`/counties/${region.slug}`}
          >
            Open the county command page
          </Link>{" "}
          for registration goals, field metrics, and what you can do here.
        </p>
      </PageHero>

      <FullBleedSection padY aria-labelledby="hearing-heading">
        <ContentContainer>
          <SectionHeading
            id="hearing-heading"
            align="left"
            eyebrow="Field notes"
            title="What we’re hearing locally"
            subtitle={statusNote}
          />
          <ul className="mt-10 space-y-4">
            {region.hearing.map((line) => (
              <li
                key={line}
                className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 font-body text-lg leading-relaxed text-deep-soil/85 shadow-[var(--shadow-soft)]"
              >
                {line}
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="priorities-heading">
        <ContentContainer>
          <SectionHeading
            id="priorities-heading"
            align="left"
            eyebrow="Themes"
            title="Priority issues on this terrain"
            subtitle="Not a platform plank—signals from conversations so far. They’ll evolve as more neighbors join."
          />
          <ResponsiveGrid cols="3" className="mt-12">
            {region.priorityIssues.map((issue) => (
              <div
                key={issue}
                className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-xl font-bold text-deep-soil">{issue}</h3>
                <p className="mt-3 font-body text-sm text-deep-soil/70">
                  {/* Future: link issue tiles to policy explainers or story filters */}
                  Ground-truth theme from listening work—detail pages can deepen later.
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="opportunities-heading">
        <ContentContainer>
          <SectionHeading
            id="opportunities-heading"
            align="left"
            eyebrow="Connect"
            title="Upcoming opportunities"
            subtitle={
              upcomingForRegion.length
                ? "Trainings, listening sessions, and community conversations tied to this place."
                : "No scheduled openings here yet—that’s honest. Host something small and we’ll help you seed the calendar."
            }
          />
          {upcomingForRegion.length ? (
            <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {upcomingForRegion.map((e) => (
                <li key={e.slug}>
                  <EventCard event={e} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              role="status"
              className="mt-10 rounded-card border border-dashed border-deep-soil/25 bg-deep-soil/[0.03] p-10 text-center"
            >
              <p className="font-heading text-2xl font-bold text-deep-soil">The calendar is open</p>
              <p className="mx-auto mt-3 max-w-prose font-body text-deep-soil/75">
                That’s not failure—it’s an invitation. The first reliable gathering in a county often starts with one
                brave host.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href="/host-a-gathering" variant="primary">
                  Host a gathering
                </Button>
                <Button href="/events" variant="outline">
                  Browse all events
                </Button>
              </div>
            </div>
          )}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="stories-heading">
        <ContentContainer>
          <SectionHeading
            id="stories-heading"
            align="left"
            eyebrow="Voices"
            title="Stories from the ground"
            subtitle="Short quotes—permissioned in real life, paraphrased here for privacy when needed."
          />
          {region.stories.length ? (
            <ul className="mt-10 space-y-6">
              {region.stories.map((s) => (
                <li
                  key={s.quote}
                  className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-8 shadow-[var(--shadow-soft)]"
                >
                  <blockquote className="font-heading text-xl font-bold leading-snug text-deep-soil lg:text-2xl">
                    “{s.quote}”
                  </blockquote>
                  {s.attribution ? (
                    <p className="mt-4 font-body text-xs font-semibold uppercase tracking-[0.18em] text-deep-soil/55">
                      {s.attribution}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 font-body text-lg text-deep-soil/75">
              We’re still collecting voice memos and porch notes—{" "}
              <Link className="font-semibold text-red-dirt underline" href="/stories">
                share a story
              </Link>{" "}
              to help this hub feel like home.
            </p>
          )}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="involved-heading">
        <ContentContainer>
          <SectionHeading
            id="involved-heading"
            align="left"
            eyebrow="Hands-on"
            title="Ways to get involved locally"
            subtitle="Pick what fits your capacity—every pathway matters."
          />
          <ResponsiveGrid cols="2" className="mt-12">
            {[
              { t: "Show up", b: "RSVP to a training or listening session when it lands.", href: "/events" },
              { t: "Host", b: "Open your porch or table for a small circle.", href: "/host-a-gathering" },
              { t: "Organize", b: "Start or co-lead a county team with mentor support.", href: "/start-a-local-team" },
              { t: "Tell the truth", b: "Name what your block needs—stories change policy.", href: "/stories" },
            ].map((x) => (
              <Link
                key={x.t}
                href={x.href}
                className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-red-dirt/30"
              >
                <h3 className="font-heading text-xl font-bold text-deep-soil">{x.t}</h3>
                <p className="mt-3 font-body text-base text-deep-soil/75">{x.b}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-dirt">
                  Go
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </ResponsiveGrid>
          <div className="mt-10 rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-heading text-lg font-bold text-deep-soil">Regional organizing contact</h3>
            <p className="mt-2 font-body text-deep-soil/75">{region.organizingContactNote}</p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <ContentContainer className="py-section-y">
        <RelatedLinksSection
          id="region-resources"
          title="Resources that match this terrain"
          subtitle="Starter links—more downloads and facilitator decks will roll out as the field program grows."
          links={region.resourceLinks.map((l) => ({ label: l.label, href: l.href }))}
        />
      </ContentContainer>

      <CTASection
        eyebrow="Stay close"
        title={`Keep building ${region.name}`}
        description="The statewide weave needs your county thread. Choose a next step while it’s still a little scary—that’s usually the right size."
        variant="primary-band"
      >
        <Button href={region.cta.primary.href} variant="primary">
          {region.cta.primary.label}
        </Button>
        <Button href="/local-organizing" variant="outline">
          Back to organizing hub
        </Button>
      </CTASection>
    </>
  );
}
