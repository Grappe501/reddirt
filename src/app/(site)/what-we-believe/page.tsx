import type { Metadata } from "next";
import { EditorialCampaignPhoto } from "@/components/about/EditorialCampaignPhoto";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { SplitFeatureSection } from "@/components/blocks/SplitFeatureSection";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { ContentImage } from "@/components/media/ContentImage";
import { WHAT_WE_BELIEVE_CROWD_PHOTO_ID } from "@/content/media/campaign-trail-photo-use";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";
import { media } from "@/content/media/registry";
import { pageMeta } from "@/lib/seo/metadata";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";

export const metadata: Metadata = pageMeta({
  title: "What we stand for",
  description:
    "Fair elections, transparent administration, and public service that welcomes voters of every party—values for the Arkansas Secretary of State’s office.",
  path: "/what-we-believe",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const commitments = [
  {
    title: "We believe this office belongs to the public",
    body: "The Secretary of State should administer elections and services without favoritism—clear rules, steady hands, and respect for the law as written.",
  },
  {
    title: "We believe trust is built through clarity",
    body: "Plain language, predictable processes, and responsive help for voters, businesses, and county officials. Confusion isn’t neutral—it erodes confidence.",
  },
  {
    title: "We believe Arkansas is bigger than any party label",
    body: "Republicans, Democrats, and independents all use this office. Showing up in good faith—especially where we disagree—is how we model public service.",
  },
  {
    title: "We believe accountability is operational",
    body: "Transparency isn’t a slogan. It’s timely reporting, open records culture, and follow-through after Election Day—not only when the cameras are on.",
  },
] as const;

export default async function WhatWeBelievePage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("what-we-believe", "hero");
  const crowdPhoto = campaignTrailPhotos.find((p) => p.id === WHAT_WE_BELIEVE_CROWD_PHOTO_ID);

  return (
    <>
      <PageHero
        eyebrow={hero?.eyebrow ?? "Values"}
        title={hero?.title ?? "What we stand for"}
        subtitle={
          hero?.subtitle ??
            "This isn’t a grab bag of national issues. It’s a focused ethic for the Secretary of State’s office—because voters should know what they’re choosing when they fill that bubble."
        }
      />

      <SplitFeatureSection
        visualSide="left"
        visual={
          <div className="relative min-h-[340px] overflow-hidden rounded-card border border-kelly-text/10 shadow-[var(--shadow-card)] lg:min-h-[400px]">
            <ContentImage media={media.arkansasPorch} warmOverlay className="absolute inset-0 min-h-full" />
            <div className="relative z-[1] flex h-full min-h-[340px] flex-col justify-end bg-gradient-to-t from-kelly-text/80 to-transparent p-8 text-kelly-page lg:min-h-[400px]">
              <p className="font-heading text-2xl font-bold leading-snug">
                Belief without practice is advertising. Practice without belief burns people out.
              </p>
            </div>
          </div>
        }
      >
        <SectionHeading
          align="left"
          eyebrow="Ground rules"
          title="What holds this campaign together"
          subtitle="We’re not pretending everyone agrees on everything. We are insisting that election administration and public service should feel fair—and that starts with how we treat each other."
          className="max-w-xl"
        />
        <ul className="mt-8 space-y-4 font-body text-base leading-relaxed text-kelly-text/82">
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            Invite conversations in Republican clubs, Democratic committees, and civic leagues—without stunts.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            Speak plainly about what the office can and cannot do—no false promises on issues outside its role.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-kelly-navy" aria-hidden />
            Respect county election officials as partners carrying heavy responsibility.
          </li>
        </ul>
      </SplitFeatureSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="commitments-heading">
        <ContentContainer>
          <SectionHeading
            id="commitments-heading"
            title="Commitments you should see in how we campaign"
            subtitle="Not perfection—direction. If we drift into theater or pretend this office sets healthcare or school policy, call us on it."
          />
          <ResponsiveGrid cols="2" className="mt-12">
            {commitments.map((c) => (
              <article
                key={c.title}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)] md:p-8"
              >
                <h3 className="font-heading text-xl font-bold text-kelly-text lg:text-2xl">{c.title}</h3>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/78">{c.body}</p>
              </article>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      {crowdPhoto ? (
        <section
          className="border-t border-kelly-text/10 bg-[var(--color-surface-elevated)] py-10 md:py-14"
          aria-label="On the trail with Arkansans"
        >
          <ContentContainer wide>
            <EditorialCampaignPhoto
              photo={crowdPhoto}
              variant="fluid"
              kicker="With Arkansans"
              caption="Capitol lawn, neighbor-to-neighbor organizing, and the crowd that holds democracy accountable."
            />
          </ContentContainer>
        </section>
      ) : null}

      <QuoteBand
        quote="People over politics. Always."
        attribution="Campaign commitment"
        variant="elevated"
      />

      <FullBleedSection padY aria-labelledby="pathways-belief-heading">
        <ContentContainer>
          <SectionHeading
            id="pathways-belief-heading"
            align="left"
            eyebrow="Next"
            title="Values become real when you plug in"
            subtitle="Pick a lane. Change lanes later. If you want honest civic dialogue in your county, start here."
            className="max-w-2xl"
          />
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/get-involved" variant="primary">
              Get involved
            </Button>
            <Button href="/stories" variant="outline">
              Read stories
            </Button>
            <Button href="/explainers" variant="subtle">
              Start with explainers
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Hold us to it"
        title="If this page is prettier than our practice, we failed"
        description="Tell us where you see the gap—especially if we confuse the Secretary of State’s job with issues outside its scope."
        variant="primary-band"
      >
        <Button href="/stories#share" variant="primary">
          Share what you’re seeing
        </Button>
        <Button href="/priorities" variant="outlineOnDark" className="border-white/50 !text-kelly-mist hover:!text-white hover:bg-white/10">
          Office priorities
        </Button>
      </CTASection>
    </>
  );
}
