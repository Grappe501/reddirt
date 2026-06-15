import { June28LaunchPanel } from "@/components/election-plan/CampaignAcademyOnboardingPanels";

export const metadata = {
  title: "June 28 Launch | Campaign Academy",
  robots: { index: false, follow: false },
};

export default function June28LaunchPage() {
  return (
    <>
      <div className="ep-classification">Phase 18.7C · June 28 volunteer leadership launch</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <June28LaunchPanel />
        </div>
      </div>
    </>
  );
}
