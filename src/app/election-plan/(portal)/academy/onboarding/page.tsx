import { VolunteerOnboardingPanel } from "@/components/election-plan/CampaignAcademyOnboardingPanels";

export const metadata = {
  title: "Volunteer Onboarding | Campaign Academy",
  robots: { index: false, follow: false },
};

export default function AcademyOnboardingPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7C · Volunteer onboarding</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <VolunteerOnboardingPanel />
        </div>
      </div>
    </>
  );
}
