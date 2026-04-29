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
import { getFeaturedYoutubeForHub } from "@/lib/content/content-hub-queries";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { KellyFullStory } from "@/components/about/KellyFullStory";
import { TalkBusinessKellySection } from "@/components/about/TalkBusinessKellySection";
import { AboutBiographyDrilldown } from "@/components/about/AboutBiographyDrilldown";
import { trailPhotosForSlot } from "@/content/media/campaign-trail-assignments";

export const metadata: Metadata = pageMeta({
  title: "Meet Kelly — full story",
  description:
    "Kelly’s Meet Kelly hub — biography arcs with manuscript chapters, business and Verizon leadership, Forevermost Farms, Stand Up Arkansas, ballot petitions, and why Secretary of State. Links into /biography for the literary narrative.",
  path: "/about",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function AboutPage() {
  const homepage = await getMergedHomepageConfig();
  const featuredYoutube = await getFeaturedYoutubeForHub(homepage.featuredHomepageVideoInboundId);
  const storyTrailPhotos = trailPhotosForSlot("aboutStory");

  return (
    <>
      <PageHero
        eyebrow="Meet Kelly"
        title="A Secretary of State who serves the people"
        subtitle="Before we talk about systems and statutes, you deserve the whole picture—her business background, the land and civic work, and why she is asking for more than a vote. The Secretary of State is where Arkansas’s public records meet real life: business filings, election lists, and the paper trail of our democracy. Kelly is asking to hold that work with a careful, citizen-first hand."
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
        <Button href="/biography" variant="outline">
          Kelly&apos;s story — chapters
        </Button>
        <Button href="#kelly-biography-arcs" variant="outline">
          Biography arcs (summaries + chapters)
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
        <ContentContainer wide>
          <div className="mx-auto max-w-3xl">
            <TalkBusinessKellySection fallbackYoutubeVideoId={featuredYoutube?.videoId ?? null} />
          </div>

          <div className="mx-auto mt-10 max-w-3xl md:mt-14">
            <AboutBiographyDrilldown />
          </div>

          <div className="mx-auto mt-12 max-w-3xl md:mt-16">
            <KellyFullStory trailPeoplePhotos={storyTrailPhotos} />
          </div>
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
          <div className="mt-10 space-y-6 font-body text-lg leading-relaxed text-kelly-text/85">
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
                className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
              >
                Why this office
              </Link>{" "}
              or jump to <Link href="#sos-why" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">that section</Link>{" "}
              above.
            </p>
            <p className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 text-base text-kelly-text/80 shadow-[var(--shadow-soft)]">
              Questions? Email{" "}
              <a
                href="mailto:kelly@kellygrappe.com"
                className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
              >
                kelly@kellygrappe.com
              </a>{" "}
              or reach out through{" "}
              <Link href="/get-involved" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
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
        description="When you’re ready, we’ll connect you with concrete ways to help—starting in your county, on your timeline."
        variant="ink-band"
      >
        <Button href="/get-involved" variant="primary" className="bg-kelly-page text-kelly-text hover:bg-kelly-page/90">
          Get involved
        </Button>
        <Button
          href="mailto:kelly@kellygrappe.com"
          variant="outline"
          className="border-kelly-page/40 text-kelly-page hover:bg-kelly-page/10"
        >
          Email Kelly
        </Button>
      </CTASection>
    </>
  );
}
