import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { ScheduleCampaignEventForm } from "@/components/forms/ScheduleCampaignEventForm";

export const metadata: Metadata = {
  title: "Schedule with the campaign",
  description:
    "Request a tentative campaign visit, forum, fundraiser, or community event. Submissions are reviewed by staff — nothing is confirmed from this page alone.",
};

export default function ScheduleCampaignEventPage() {
  return (
    <>
      <PageHero
        eyebrow="Tentative scheduling"
        title="Schedule something with the campaign"
        subtitle="Tell us what you are hoping to host or convene. We route every request through staff review — tentative only, never a public confirmation of Kelly’s private calendar."
      >
        <Button href="#schedule-form" variant="primary">
          Jump to form
        </Button>
      </PageHero>

      <FullBleedSection padY aria-labelledby="schedule-form-heading">
        <ContentContainer wide>
          <h2 id="schedule-form-heading" className="sr-only">
            Public scheduling request form
          </h2>
          <ScheduleCampaignEventForm id="schedule-form" />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
