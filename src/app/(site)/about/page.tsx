import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/blocks/CTASection";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { pageMeta } from "@/lib/seo/metadata";
import { getFeaturedYoutubeForHub } from "@/lib/content/content-hub-queries";
import { getMergedHomepageConfig } from "@/lib/content/homepage-merge";
import { TalkBusinessKellySection } from "@/components/about/TalkBusinessKellySection";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { MeetKellySixQuestions } from "@/components/about/MeetKellySixQuestions";
import { MeetKellyTrustIndicators } from "@/components/about/MeetKellyTrustIndicators";
import { MeetKellyChapterIndex } from "@/components/about/MeetKellyChapterIndex";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";
import { meetKellyExecutiveSummary } from "@/content/about/meet-kelly-hub";
import { AboutBiographyDrilldown } from "@/components/about/AboutBiographyDrilldown";
import { showPublicBiographyManuscript } from "@/config/public-biography-depth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Meet Kelly",
  description:
    "Kelly Grappe for Arkansas Secretary of State — who she is, what she has done, why she is running, and trust indicators you can verify. Six questions, not a chronological résumé.",
  path: "/about",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function AboutPage() {
  const homepage = await getMergedHomepageConfig();
  const featuredYoutube = await getFeaturedYoutubeForHub(homepage.featuredHomepageVideoInboundId);
  const summary = meetKellyExecutiveSummary;

  return (
    <>
      <PageHero eyebrow={summary.eyebrow} title={summary.title} subtitle={summary.subtitle}>
        <Button href="/about/why-im-running" variant="primary">
          Why I&apos;m running
        </Button>
        <Button href="/get-involved" variant="outline">
          Get involved
        </Button>
        <Button href="/understand" variant="outline">
          Understand the office
        </Button>
        <Button href="#talk-business-kelly" variant="outline">
          Talk Business &amp; Politics
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about" />
          <p className="mt-6 font-body text-base leading-relaxed text-kelly-text/85">{summary.lead}</p>
          {!showPublicBiographyManuscript() ? (
            <div className="mt-4">
              <ContentPendingBadge variant="draft" />
              <p className="mt-2 font-body text-sm text-kelly-muted">
                Long-form biography manuscript chapters are draft — not public-ready.
              </p>
            </div>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide>
          <div className="mx-auto max-w-4xl">
            <MeetKellySixQuestions />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <div className="mx-auto max-w-3xl">
            <TalkBusinessKellySection fallbackYoutubeVideoId={featuredYoutube?.videoId ?? null} />
          </div>
          {showPublicBiographyManuscript() ? (
            <div className="mx-auto mt-10 max-w-3xl md:mt-14">
              <AboutBiographyDrilldown />
            </div>
          ) : null}
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide>
          <div className="mx-auto max-w-4xl">
            <MeetKellyTrustIndicators />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <div className="mx-auto max-w-4xl">
            <MeetKellyChapterIndex />
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
        description="When you're ready, we'll connect you with concrete ways to help—starting in your county, on your timeline."
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
