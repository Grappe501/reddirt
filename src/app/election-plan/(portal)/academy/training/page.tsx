import { TrainingHubPanel } from "@/components/election-plan/CampaignAcademyOnboardingPanels";

export const metadata = {
  title: "Training | Campaign Academy",
  robots: { index: false, follow: false },
};

export default function AcademyTrainingPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7C · Role training packets</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <TrainingHubPanel />
        </div>
      </div>
    </>
  );
}
