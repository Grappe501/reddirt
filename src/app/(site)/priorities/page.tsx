import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PillarGrid } from "@/components/blocks/PillarGrid";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";
import { getHostOrVisitRequestHref } from "@/lib/county/official-links";
import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";

export const metadata: Metadata = pageMeta({
  title: "Priorities for the office",
  description:
    "Fair elections, transparent administration, and reliable service for all 75 counties—what the Arkansas Secretary of State actually does.",
  path: "/priorities",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const pillars = [
  {
    title: "Protect the vote",
    body: "Fair, secure elections administered consistently—free from political pressure or favoritism. Voters should see one standard, clearly explained.",
  },
  {
    title: "Serve all 75 counties",
    body: "Clear guidance, dependable systems, and responsive support for county clerks and local election officials—rural and urban alike.",
  },
  {
    title: "Lead with transparency",
    body: "Plain-language information, open processes, and accountability in every function of the office—not selective openness.",
  },
  {
    title: "Business & nonprofit confidence",
    body: "Filings, registrations, and UCC tools should be predictable. When the rules are clear, Arkansas employers and civic organizations spend less time navigating confusion.",
  },
] as const;

export default async function PrioritiesPage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("priorities", "hero");

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow={hero?.eyebrow ?? "The work of the office"}
        title={hero?.title ?? "What the Secretary of State actually touches"}
        subtitle={
          hero?.subtitle ??
            "This campaign stays focused on administration Arkansans rely on: elections, public records, and the business services that keep our economy legible. If it isn’t part of this job, you won’t find it used as a prop here."
        }
      >
        <Button href="/get-involved" variant="primary">
          Get involved
        </Button>
        <Button href="/direct-democracy" variant="outlineOnDark">
          Ballot access & initiatives
        </Button>
      </PageHero>

      {campaignTrailPhotos.slice(9, 12).length > 0 ? (
        <FullBleedSection variant="subtle" className="!pt-[calc(var(--section-padding-y)*0.65)] !pb-0 lg:!pt-[calc(var(--section-padding-y-lg)*0.65)] lg:!pb-0">
          <ContentContainer wide>
            <TrailPhotosShowcase
              variant="inline"
              className="!border-t-0 !py-6 md:!py-10"
              photos={campaignTrailPhotos.slice(9, 12)}
              eyebrow="Presence"
              title="Showing up is part of the job"
              intro="The Secretary of State’s office touches every county—these moments are what showing up looks like on the trail."
            />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <FullBleedSection variant="subtle" padY aria-labelledby="pillars-heading">
        <ContentContainer>
          <SectionHeading
            id="pillars-heading"
            eyebrow="Commitments"
            title="Priorities grounded in the office—not national noise"
            subtitle="The Secretary of State isn’t a legislature. The job is to administer the law faithfully, communicate clearly, and earn public trust every cycle."
          />
          <div className="mt-12">
            <PillarGrid items={[...pillars]} cols="2" />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="Leadership in this role isn’t about headlines or ideology—it’s about steady, transparent administration and respect for the law."
        attribution="Kelly Grappe"
        variant="gold-band"
      />

      <FullBleedSection padY aria-labelledby="not-heading">
        <ContentContainer>
          <SectionHeading
            id="not-heading"
            align="left"
            eyebrow="Clarity"
            title="What you won’t see on this site"
            subtitle="Voters deserve honesty about jurisdiction. Healthcare, K–12 policy, and broad economic platforms belong in races where those decisions are made—not here."
            className="max-w-2xl"
          />
          <ul className="mt-10 max-w-3xl space-y-4 font-body text-base leading-relaxed text-deep-soil/80">
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              No pretend authority over issues outside the Secretary of State’s statutory role.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              No confusing voters with national talking points that this office cannot fix.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-dirt" aria-hidden />
              Full respect for county officials and local election workers as partners—not punching bags.
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="All parties welcome"
        title="Invite us to your meeting"
        description="Republican, Democratic, or civic—we want to talk with Arkansans where they already gather about how this office can serve you fairly."
        variant="primary-band"
      >
        <Button href={getHostOrVisitRequestHref()} variant="secondary">
          Request a visit
        </Button>
        <Button href="/about" variant="outline" className="border-cream-canvas/50 text-cream-canvas hover:bg-cream-canvas/10">
          About Kelly
        </Button>
      </CTASection>
    </>
  );
}
