import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { powerOf5OnboardingHref } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Bring 5 Friends",
  description:
    "Trust-first organizing: invite five people into the campaign through conversation, events, or volunteer shifts.",
};

export default function Bring5FriendsPage() {
  return (
    <>
      <PageHero
        eyebrow="Get Involved"
        title="Bring 5 Friends"
        subtitle="Most Arkansans will not join because a flyer told them to—they join because someone they trust asks. Start with five people you actually know."
      >
        <Button href={powerOf5OnboardingHref} variant="primary">
          Start Power of 5
        </Button>
        <Button href="/get-involved#volunteer" variant="outline">
          Volunteer signup
        </Button>
        <Button href="/get-involved" variant="outline">
          Get Involved hub
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="why-5-heading">
        <ContentContainer>
          <SectionHeading
            id="why-5-heading"
            align="left"
            eyebrow="Why it works"
            title="Small circles, real responsibility"
            subtitle="You are not asked to debate the whole internet—just to open the door for a handful of neighbors."
          />
          <div className="mt-8 max-w-3xl space-y-4 font-body text-base leading-relaxed text-kelly-text/85">
            <p>
              Pick five people—family, coworkers, faith community, softball parents, whoever trusts you back. Ask them to
              one conversation, one training, or one day on the calendar. Follow up like a neighbor, not a telemarketer.
            </p>
            <p>
              The campaign can offer materials, training, and backup. You bring the relationships that make civic work
              feel human instead of performative.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="next-heading">
        <ContentContainer>
          <SectionHeading
            id="next-heading"
            align="left"
            eyebrow="Next step"
            title="When you are ready"
            subtitle="Use the Power of 5 path to name your five, get oriented, and plug into volunteer options that fit your life."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button href={powerOf5OnboardingHref} variant="primary" className="min-h-[48px]">
              Open onboarding
            </Button>
            <Button href="/start-a-local-team" variant="outline" className="min-h-[48px]">
              Start a local team
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
