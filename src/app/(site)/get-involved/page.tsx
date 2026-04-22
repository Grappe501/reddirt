import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { JoinMovementForm } from "@/components/forms/JoinMovementForm";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { TrailPhotosShowcase } from "@/components/campaign-trail/TrailPhotosShowcase";
import { campaignTrailPhotos } from "@/content/media/campaign-trail-photos";

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

      {campaignTrailPhotos.slice(3, 9).length > 0 ? (
        <FullBleedSection variant="subtle" className="!pt-0" aria-label="Campaign trail photography">
          <ContentContainer wide>
            <TrailPhotosShowcase
              variant="inline"
              className="!border-t-0 !py-10 md:!py-14"
              photos={campaignTrailPhotos.slice(3, 9)}
              eyebrow="Field energy"
              title="Democracy still happens in real rooms"
              intro="A few snapshots from the trail—hosting, listening, and showing up where Arkansas already gathers."
            />
          </ContentContainer>
        </FullBleedSection>
      ) : null}

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
