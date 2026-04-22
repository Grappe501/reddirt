import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/blocks/CTASection";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { pageMeta } from "@/lib/seo/metadata";
import { KellyFullStory } from "@/components/about/KellyFullStory";
import { TalkBusinessKellySection } from "@/components/about/TalkBusinessKellySection";
import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";

export const metadata: Metadata = pageMeta({
  title: "Meet Kelly — full story",
  description:
    "Kelly Grappe: nearly 25 years with Alltel and Verizon, small-business and farm experience, Stand Up Arkansas, Forevermost Farms, and a Secretary of State’s office that serves people and process fairly.",
  path: "/about",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Meet Kelly"
        title="A Secretary of State who serves the people"
        subtitle="Before we talk about systems and statutes, you deserve the whole picture—her business background, the land and civic work, and why she is asking for more than a vote. Read the story. Then we’ll get to work together."
      >
        <Button href="/get-involved" variant="primary">
          Get involved
        </Button>
        <Button href="/priorities" variant="outline">
          Office priorities
        </Button>
        <Button href="#talk-business-kelly" variant="outline">
          Talk Business &amp; Politics
        </Button>
        <Button href="#kelly-full-story" variant="outline">
          Read the full biography
        </Button>
        <Button href="#why-running" variant="outline">
          Why I&apos;m running (short)
        </Button>
      </PageHero>

      <FullBleedSection
        variant="subtle"
        padY
        className="!pt-0 md:!pt-1 lg:!pt-2"
      >
        <ContentContainer className="max-w-3xl space-y-12">
          <TalkBusinessKellySection />
        </ContentContainer>
        {campaignTrailPhotos.slice(12, 18).length > 0 ? (
          <ContentContainer wide className="mt-12 md:mt-16">
            <TrailPhotosShowcase
              variant="inline"
              className="!border-t-0 !py-0"
              photos={campaignTrailPhotos.slice(12, 18)}
              eyebrow="With Arkansans"
              title="The people you meet on the trail"
              intro="Neighbors, hosts, and volunteers—the statewide campaign is built from these rooms."
            />
          </ContentContainer>
        ) : null}
        <ContentContainer className="max-w-3xl space-y-12">
          <KellyFullStory />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="why-running">
        <ContentContainer className="max-w-3xl">
          <SectionHeading
            id="why-running"
            align="left"
            eyebrow="Why I’m running"
            title="People over politics. Always."
            subtitle="The Secretary of State’s office touches every voter, business, and community in Arkansas. It should feel steady, accessible, and accountable—no matter your party."
            className="max-w-2xl scroll-mt-24"
          />
          <div className="mt-10 space-y-6 font-body text-lg leading-relaxed text-deep-soil/85">
            <p>
              Leadership in this role isn’t about headlines or ideology. It’s about doing the detailed work of
              administration: supporting county officials, making business services clearer and more efficient, communicating
              in plain language, and upholding the law as written.
            </p>
            <p>
              I’m a Democrat who believes we earn statewide office by showing up for the whole state—including voters
              who will never agree with me on everything. If you lead a Republican club, a Democratic committee, or a
              civic league and want a substantive conversation about this office, I want to be there.
            </p>
            <p>
              For the long version of the case for this office, read{" "}
              <Link
                href="/about/why-secretary-of-state"
                className="font-semibold text-red-dirt underline-offset-2 hover:underline"
              >
                Why this office
              </Link>{" "}
              or jump to <Link href="#sos-why" className="font-semibold text-red-dirt underline-offset-2 hover:underline">that section</Link>{" "}
              above.
            </p>
            <p className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 text-base text-deep-soil/80 shadow-[var(--shadow-soft)]">
              Questions? Email{" "}
              <a
                href="mailto:kelly@kellygrappe.com"
                className="font-semibold text-red-dirt underline-offset-2 hover:underline"
              >
                kelly@kellygrappe.com
              </a>{" "}
              or reach out through{" "}
              <Link href="/get-involved" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
                Get involved
              </Link>
              . Press and compliance details will expand here as the committee filing is finalized.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="If you don't like the road you're walking on, start paving another one."
        attribution="Dolly Parton — a line posted at Forevermost Farms, because stubborn hope is a farm value too"
        variant="elevated"
      />

      <CTASection
        eyebrow="Next step"
        title="You know the person. Now bring someone into the work."
        description="When you are ready, we will meet you with concrete ways to help—this county, this week, this conversation. Paid-for-by and compliance details stay available for reporters and the secretary of state’s filing rules; ask if you need them."
        variant="soil"
      >
        <Button href="/get-involved" variant="primary" className="bg-cream-canvas text-deep-soil hover:bg-cream-canvas/90">
          Get involved
        </Button>
        <Button
          href="mailto:kelly@kellygrappe.com"
          variant="outline"
          className="border-cream-canvas/40 text-cream-canvas hover:bg-cream-canvas/10"
        >
          Email Kelly
        </Button>
      </CTASection>
    </>
  );
}
