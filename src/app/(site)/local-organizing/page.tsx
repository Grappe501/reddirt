import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { PathwayCard } from "@/components/blocks/PathwayCard";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { SplitFeatureSection } from "@/components/blocks/SplitFeatureSection";
import { LocalRegionCard } from "@/components/organizing/LocalRegionCard";
import { OrganizingStepBand } from "@/components/organizing/OrganizingStepBand";
import { ResourceGrid } from "@/components/organizing/ResourceGrid";
import { regions } from "@/content/local/regions";
import { organizingToolkit } from "@/content/resources/toolkit";
import { representLocalEventVolunteerHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Local organizing hub",
  description:
    "County-by-county volunteer pathways for the Secretary of State campaign—trainings and gatherings that respect Arkansas.",
};

function MapPlaceholderGrid() {
  return (
    <div className="relative h-full min-h-[280px] overflow-hidden rounded-card border border-deep-soil/10 bg-gradient-to-br from-washed-denim/15 via-cream-canvas to-field-green/10 shadow-[var(--shadow-soft)] lg:min-h-[360px]">
      <p className="absolute left-4 top-4 z-10 max-w-[14rem] rounded-full bg-cream-canvas/90 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-wider text-deep-soil/55 shadow-sm">
        Organizing by region
      </p>
      <div className="max-h-[min(520px,70vh)] space-y-4 overflow-y-auto p-6 pt-14">
        {regions.map((r) => (
          <LocalRegionCard key={r.slug} region={r} />
        ))}
        <div className="rounded-card border border-dashed border-deep-soil/20 bg-deep-soil/[0.03] p-5">
          <span className="font-body text-sm font-semibold text-deep-soil/70">More counties & towns</span>
          <p className="mt-2 font-body text-sm text-deep-soil/55">
            Request a hub route through{" "}
            <Link className="font-semibold text-red-dirt underline" href="/get-involved">
              Get Involved
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LocalOrganizingPage() {
  const toolkitPreview = organizingToolkit.slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="Place by place"
        title="Local organizing hub"
        subtitle="This campaign wins when neighbors can find each other—start where you are, with what you have, and we’ll help you grow without the usual political theater."
      >
        <Button href="/start-a-local-team" variant="primary">
          Start where you live
        </Button>
        <Button href="/events" variant="outline">
          See upcoming events
        </Button>
        <Button href={representLocalEventVolunteerHref} variant="outline">
          Represent at a local event
        </Button>
      </PageHero>

      <QuoteBand
        id="why-local"
        variant="elevated"
        quote="Power that lasts is built in living rooms, breakrooms, and church halls—not only on cable news."
        attribution="Field practice"
      />

      <FullBleedSection aria-labelledby="why-local-matters-heading" padY>
        <ContentContainer wide>
          <SectionHeading
            id="why-local-matters-heading"
            align="left"
            eyebrow="Why it matters"
            title="Local organizing is how Arkansas reclaims its voice"
            subtitle="Statewide change needs statewide solidarity—but solidarity without local roots is just a mailing list. Teams that listen first earn the right to lead."
          />
          <ResponsiveGrid cols="3" className="mt-12">
            {[
              {
                t: "Accountability you can see",
                b: "Elected leaders notice who shows up consistently—not who yells loudest once.",
              },
              {
                t: "Protection for brave neighbors",
                b: "Organized communities make retaliation harder and courage contagious.",
              },
              {
                t: "Training that travels",
                b: "Skills learned in one county seed the next—especially when hosts trade notes.",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-xl font-bold text-deep-soil">{x.t}</h3>
                <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">{x.b}</p>
              </div>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" aria-labelledby="pathways-heading" padY>
        <ContentContainer>
          <SectionHeading
            id="pathways-heading"
            eyebrow="Pick a pathway"
            title="There’s more than one door in"
            subtitle="Choose the lane that matches your life right now. You can switch later—this work rewards returners."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <PathwayCard
              title="Join a local team"
              description="Plug into neighbors who are already listening, training, and showing up—without needing a title."
              href="/get-involved"
              ctaLabel="Raise your hand"
            />
            <PathwayCard
              title="Start a local team"
              description="Step up as a host-organizer. We’ll help you plan a dignified kickoff that fits your town."
              href="/start-a-local-team"
              ctaLabel="Begin the form"
            />
            <PathwayCard
              title="Host a gathering"
              description="Porch, living room, coffee shop—small circles that rebuild civic trust one conversation at a time."
              href="/host-a-gathering"
              ctaLabel="Learn how"
            />
            <PathwayCard
              title="Attend an event"
              description="Trainings, town halls, and listening sessions across regions—show up and meet the statewide weave."
              href="/events"
              ctaLabel="Browse events"
            />
            <PathwayCard
              title="Represent us at a local gathering"
              description="Fairs, festivals, party meetings, civic nights—raise your hand to table or greet with approved materials and coach support."
              href={representLocalEventVolunteerHref}
              ctaLabel="Volunteer for field presence"
            />
            <PathwayCard
              title="Handwritten postcard batches"
              description="We supply the cards and a vetted list; you write, pay postage, and mail. Good for people who like paper and a personal touch."
              href="/resources/postcard-outreach"
              ctaLabel="Read the postcard guide"
            />
            <PathwayCard
              title="Phone banking"
              description="A full phone bank system is in the works. Use the resource to sign up and know what to expect when shifts go live."
              href="/resources/phone-banking"
              ctaLabel="Phone bank roadmap & signup"
            />
            <PathwayCard
              title="Text banking (peer-to-peer)"
              description="We provide numbers and scripts; you text from a Google Voice or second line so your personal number stays private."
              href="/resources/text-banking"
              ctaLabel="Read the P2P text guide"
            />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <SplitFeatureSection
        id="regions-preview"
        visual={<MapPlaceholderGrid />}
        visualSide="left"
        padY
      >
        <SectionHeading
          id="regions-preview-heading"
          align="left"
          eyebrow="Territory"
          title="Counties and regions we’re building with"
          subtitle="Tap a place to see what we’re hearing, what’s coming up, and how to plug in. More maps and live RSVPs arrive with the next integration pass."
        />
        <p className="mt-6 font-body text-base leading-relaxed text-deep-soil/75">
          {/* Future: optional county-level summary tiles for organizers */}
          Each hub page tracks a simple story: what neighbors name as urgent, what we’re scheduling next, and where
          to begin.
        </p>
        <Button href="/get-involved" variant="secondary" className="mt-8">
          Nominate a new county hub
        </Button>
      </SplitFeatureSection>

      <FullBleedSection padY aria-labelledby="how-teams-grow-heading">
        <ContentContainer wide>
          <OrganizingStepBand id="how-teams-grow" />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="toolkit-preview-heading">
        <ContentContainer>
          <SectionHeading
            id="toolkit-preview-heading"
            eyebrow="Toolkit"
            title="Starter resources you can use this week"
            subtitle="Guides stay plainspoken on purpose—built for copy-paste agendas, not abstract theory."
          />
          <ResourceGrid items={toolkitPreview} className="mt-12" />
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/resources#toolkit" variant="primary">
              Open full resources library
            </Button>
            <Button href="/host-a-gathering" variant="outline">
              Plan a gathering
            </Button>
            <Button href={representLocalEventVolunteerHref} variant="outline">
              Represent at an event
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        id="local-final-cta"
        eyebrow="Belonging"
        title="You don’t need permission to care for your place"
        description="If you’re willing to listen more than you talk—for a season—we already count you as part of this."
        variant="soil"
      >
        <Button href="/start-a-local-team" variant="primary" className="bg-cream-canvas text-deep-soil hover:bg-cream-canvas/90">
          Start a local team
        </Button>
        <Button href="/events" variant="outline" className="border-cream-canvas/40 text-cream-canvas hover:bg-cream-canvas/10">
          Join an event
        </Button>
        <Button
          href={representLocalEventVolunteerHref}
          variant="outline"
          className="border-cream-canvas/40 text-cream-canvas hover:bg-cream-canvas/10"
        >
          Represent locally
        </Button>
      </CTASection>
    </>
  );
}
