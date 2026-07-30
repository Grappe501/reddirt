import type { Metadata } from "next";

import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { CampaignCountdown } from "@/components/campaign/CampaignCountdown";
import { Button } from "@/components/ui/Button";
import { VolunteerOnboardingPage } from "@/components/volunteer/VolunteerOnboardingPage";

export const metadata: Metadata = {
  title: { absolute: "Volunteer Onboarding | Kelly Grappe" },
  description: "Start here to join the volunteer field team.",
};

type PageProps = { searchParams: Promise<{ role?: string }> };

export default async function VolunteerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <>
      <MediaPageHero
        slotKey="get-involved.hero"
        layout="split"
        eyebrow="Field team"
        title="Join the Field Team"
        subtitle="We’re building a volunteer network where everyone owns one small lane, does a little each week, and helps grow something powerful."
      >
        <Button href="#how-this-works" variant="primary">
          Start onboarding
        </Button>
        <Button href="/field-playbook" variant="outlineOnDark">
          Read the field playbook
        </Button>
        <Button href="/volunteer/resources" variant="outlineOnDark">
          Volunteer resource library
        </Button>
      </MediaPageHero>
      <VolunteerOnboardingPage campaignClock={<CampaignCountdown />} initialSignupRole={sp.role ?? null} />
    </>
  );
}
