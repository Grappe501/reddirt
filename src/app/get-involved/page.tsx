import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { JoinMovementForm } from "@/components/forms/JoinMovementForm";
import { VolunteerForm } from "@/components/forms/VolunteerForm";

export const metadata: Metadata = {
  title: "Get involved",
  description:
    "Volunteer, invite Kelly to your county or party meeting, and stay connected with the Arkansas Secretary of State campaign.",
};

export default function GetInvolvedPage() {
  return (
    <>
      <PageHero
        eyebrow="Act"
        title="Get involved"
        subtitle="No perfect resume required—whether you want to volunteer, host a conversation, or invite us to a Republican, Democratic, or civic meeting in your county."
      >
        <Button href="#join" variant="primary">
          Stay connected
        </Button>
        <Button href="#volunteer" variant="outline">
          Volunteer
        </Button>
      </PageHero>

      <FullBleedSection id="join" aria-labelledby="join-heading">
        <ContentContainer>
          <SectionHeading
            id="join-heading"
            eyebrow="Start here"
            title="Stay connected"
            subtitle="Share your contact info and optional context—especially if you’re inviting us to a local party or civic gathering. We route messages to real humans, not spam."
          />
          <div className="mt-10 max-w-3xl">
            <JoinMovementForm />
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" id="volunteer" aria-labelledby="volunteer-heading">
        <ContentContainer>
          <SectionHeading
            id="volunteer-heading"
            eyebrow="Volunteer"
            title="Help locally or digitally"
            subtitle="Tell us your availability and skills. If you can host county meetings or help with voter education, say so—we’ll follow up with concrete next steps."
          />
          <div className="mt-10 max-w-3xl">
            <VolunteerForm />
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
