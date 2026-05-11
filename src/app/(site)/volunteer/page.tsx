import type { Metadata } from "next";

import { CampaignCountdown } from "@/components/campaign/CampaignCountdown";
import { VolunteerOnboardingPage } from "@/components/volunteer/VolunteerOnboardingPage";

export const metadata: Metadata = {
  title: { absolute: "Volunteer Onboarding | Kelly Grappe" },
  description: "Start here to join the volunteer field team.",
};

type PageProps = { searchParams: Promise<{ role?: string }> };

export default async function VolunteerPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <VolunteerOnboardingPage campaignClock={<CampaignCountdown />} initialSignupRole={sp.role ?? null} />;
}
