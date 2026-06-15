import { CampaignAcademyHubPanel } from "@/components/election-plan/CampaignAcademyPanels";

export const metadata = {
  title: "Campaign Academy | Election Plan",
  robots: { index: false, follow: false },
};

export default function CampaignAcademyPage() {
  return (
    <>
      <div className="ep-classification">Volunteer Academy · June 28 launch · Internal</div>
      <div className="ep-chapter-body px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <CampaignAcademyHubPanel />
        </div>
      </div>
    </>
  );
}
