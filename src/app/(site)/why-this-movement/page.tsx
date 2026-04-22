import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ProcessSteps } from "@/components/blocks/ProcessSteps";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { pageMeta } from "@/lib/seo/metadata";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";

export const metadata: Metadata = pageMeta({
  title: "Why we're running",
  description:
    "A statewide campaign focused on the Secretary of State’s office—fair elections, transparent administration, and public trust across all 75 counties.",
  path: "/why-this-movement",
  imageSrc: "/media/placeholders/editorial-ink-field.svg",
});

export default async function WhyThisMovementPage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("why-this-movement", "hero");

  return (
    <>
      <PageHero
        eyebrow={hero?.eyebrow ?? "Origin"}
        title={hero?.title ?? "Why this campaign exists"}
        subtitle={
          hero?.subtitle ??
            "Because public trust in election administration and state services shouldn’t be optional. I’m running to do the steady work of the Secretary of State’s office—fairly, clearly, and without favoritism."
        }
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className="order-2 lg:order-1">
              <SectionHeading
                align="left"
                eyebrow="Contrast"
                title="What we’re not"
                subtitle="Naming the negative space helps people breathe."
                className="max-w-xl"
              />
              <ul className="mt-8 space-y-4 font-body text-lg leading-relaxed text-deep-soil/85">
                <li className="rounded-lg border border-deep-soil/10 bg-cream-canvas px-4 py-3">
                  Not a personality cult—leaders rotate, credit spreads, institutions outlive egos.
                </li>
                <li className="rounded-lg border border-deep-soil/10 bg-cream-canvas px-4 py-3">
                  Not astroturf—real counties, real hosts, real receipts.
                </li>
                <li className="rounded-lg border border-deep-soil/10 bg-cream-canvas px-4 py-3">
                  Not fake authority over healthcare, schools, or broad economic policy—this office has a specific job.
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative min-h-[280px] overflow-hidden rounded-card border border-deep-soil/10 shadow-[var(--shadow-soft)] lg:min-h-[360px]">
                <ContentImage media={media.splitDemocracy} warmOverlay className="absolute inset-0 min-h-full" />
              </div>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="how-heading">
        <ContentContainer>
          <SectionHeading
            id="how-heading"
            title="How we build differently"
            subtitle="Slow where it needs to be slow. Fast where people are getting hurt now."
          />
          <ProcessSteps
            className="mt-12"
            steps={[
              {
                step: 1,
                title: "Listen publicly",
                description: "Structured listening that turns themes into shared language—not private gossip.",
              },
              {
                step: 2,
                title: "Teach plainly",
                description: "Initiatives, deadlines, and election basics—explained like you would to family.",
              },
              {
                step: 3,
                title: "Organize locally",
                description: "Teams with roles, rhythms, and mentors—so power doesn’t collapse when one person moves.",
              },
              {
                step: 4,
                title: "Act visibly",
                description: "Hearings, solidarity, ballots—public courage invites public membership.",
              },
              {
                step: 5,
                title: "Review honestly",
                description: "After action: what worked, what hurt, what we owe the community next.",
              },
            ]}
          />
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="Movements don’t win because they’re loud. They win because they’re still there on the boring Wednesday."
        attribution="Organizer note"
        variant="gold-band"
      />

      <FullBleedSection variant="denim" padY aria-labelledby="coalition-heading">
        <ContentContainer>
          <SectionHeading
            id="coalition-heading"
            align="left"
            eyebrow="Who belongs"
            title="A wide Arkansas table"
            subtitle="County clerks, small-business filers, first-time voters, and party activists of every stripe. If you want fair rules and plain answers—you’ve got a seat."
            className="max-w-2xl text-cream-canvas [&_h2]:text-cream-canvas [&_p]:text-cream-canvas/85 [&_p.mb-3]:text-sunlight-gold"
          />
          <p className="mt-8 max-w-2xl font-body text-lg leading-relaxed text-cream-canvas/85">
            We don’t confuse unity with uniformity. I’m a Democrat who believes we earn trust by showing up for the
            whole state—including voters who will never agree with me on everything else on the ballot.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Step in"
        title="The best time is imperfect. The second best is today."
        description="You don’t need a manifesto—just a willingness to try the next decent step with neighbors."
        variant="soil"
      >
        <Button href="/get-involved" variant="primary" className="bg-cream-canvas text-deep-soil hover:bg-cream-canvas/90">
          Get involved
        </Button>
        <Button href="/priorities" variant="outline" className="border-cream-canvas/40 text-cream-canvas hover:bg-cream-canvas/10">
          Office priorities
        </Button>
      </CTASection>
    </>
  );
}
