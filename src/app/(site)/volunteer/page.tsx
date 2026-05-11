import type { Metadata } from "next";

import { VolunteerOnboardingPage } from "@/components/volunteer/VolunteerOnboardingPage";

export const metadata: Metadata = {
  title: { absolute: "Volunteer Onboarding | Kelly Grappe" },
  description: "Start here to join the volunteer field team.",
};

export default function VolunteerPage() {
  return <VolunteerOnboardingPage />;
}
